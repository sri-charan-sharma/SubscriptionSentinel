import {
  Subscription,
  PriceHistory,
  NotificationLog,
  ScrapeRun,
  DashboardMetrics,
  CurrencyCode,
  ScrapeStatus
} from '../types';
import {
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PRICE_HISTORIES,
  INITIAL_NOTIFICATION_LOGS,
  INITIAL_SCRAPE_RUNS
} from './mockData';
import { validatePricingUrl } from '../utils/ssrfValidator';

const STORAGE_KEY_SUBS = 'sentinel_subscriptions';
const STORAGE_KEY_HISTORY = 'sentinel_price_history';
const STORAGE_KEY_LOGS = 'sentinel_notification_logs';
const STORAGE_KEY_RUNS = 'sentinel_scrape_runs';
const STORAGE_KEY_TELEGRAM = 'sentinel_telegram_config';

// Local storage helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

// In-memory / localStorage data stores
let subscriptions: Subscription[] = loadFromStorage(STORAGE_KEY_SUBS, INITIAL_SUBSCRIPTIONS);
let priceHistories: PriceHistory[] = loadFromStorage(STORAGE_KEY_HISTORY, INITIAL_PRICE_HISTORIES);
let notificationLogs: NotificationLog[] = loadFromStorage(STORAGE_KEY_LOGS, INITIAL_NOTIFICATION_LOGS);
let scrapeRuns: ScrapeRun[] = loadFromStorage(STORAGE_KEY_RUNS, INITIAL_SCRAPE_RUNS);

let isBackendAvailable: boolean | null = null;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('sentinel_jwt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function checkBackendHealth(): Promise<boolean> {
  if (isBackendAvailable !== null) return isBackendAvailable;
  try {
    const res = await fetch('/api/subscriptions', { method: 'GET', signal: AbortSignal.timeout(1000) });
    isBackendAvailable = res.ok;
  } catch {
    isBackendAvailable = false;
  }
  return isBackendAvailable;
}

export const api = {
  async getSubscriptions(): Promise<Subscription[]> {
    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch('/api/subscriptions', { headers: getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend fetch failed, using local store', err);
      }
    }
    return subscriptions.filter(s => s.is_active);
  },

  async getAllSubscriptionsIncludeInactive(): Promise<Subscription[]> {
    return [...subscriptions];
  },

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    return subscriptions.find(s => s.id === id);
  },

  async createSubscription(data: Omit<Subscription, 'id' | 'created_at' | 'consecutive_failures' | 'is_active'>): Promise<Subscription> {
    const validation = validatePricingUrl(data.pricing_url);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend create failed, using local store', err);
      }
    }

    const newSub: Subscription = {
      ...data,
      id: Date.now(),
      consecutive_failures: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };

    subscriptions.unshift(newSub);
    saveToStorage(STORAGE_KEY_SUBS, subscriptions);

    // Initial price history entry
    const newHistory: PriceHistory = {
      id: Date.now(),
      subscription_id: newSub.id,
      price: newSub.current_price,
      currency: newSub.currency,
      source: 'MANUAL',
      recorded_at: newSub.created_at
    };
    priceHistories.push(newHistory);
    saveToStorage(STORAGE_KEY_HISTORY, priceHistories);

    return newSub;
  },

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    if (data.pricing_url) {
      const validation = validatePricingUrl(data.pricing_url);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch(`/api/subscriptions/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend update failed, using local store', err);
      }
    }

    const index = subscriptions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    subscriptions[index] = { ...subscriptions[index], ...data };
    saveToStorage(STORAGE_KEY_SUBS, subscriptions);
    return subscriptions[index];
  },

  async deleteSubscription(id: number): Promise<void> {
    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
        if (res.ok) return;
      } catch (err) {
        console.warn('Backend delete failed, using local store', err);
      }
    }

    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      sub.is_active = false;
      saveToStorage(STORAGE_KEY_SUBS, subscriptions);
    }
  },

  /**
   * Performs an immediate manual scrape check adhering to the design.md flow:
   * 1. SSRF URL validation
   * 2. Scrape simulation / fetch
   * 3. Row lock & transactional update:
   *    - OK -> price_history append, update current_price, reset consecutive_failures
   *    - Fail -> update error, increment consecutive_failures (no price history row)
   * 4. Deduplicated alert dispatch if price increased
   */
  async checkSubscription(id: number, simulatedPriceHike?: number, simulateStatus?: ScrapeStatus): Promise<{ subscription: Subscription; alertTriggered: boolean; scrapeResult: { status: ScrapeStatus; rawMatch?: string; error?: string } }> {
    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch(`/api/subscriptions/${id}/check`, { method: 'POST' });
        if (res.ok) {
          const updated = await res.json();
          return { subscription: updated, alertTriggered: false, scrapeResult: { status: updated.last_scrape_status || 'OK' } };
        }
      } catch (err) {
        console.warn('Backend check failed, using local mock runner', err);
      }
    }

    const sub = subscriptions.find(s => s.id === id);
    if (!sub) throw new Error('Subscription not found');

    // Step 1: Validate URL
    const urlValidation = validatePricingUrl(sub.pricing_url);
    if (!urlValidation.valid) {
      sub.last_checked_at = new Date().toISOString();
      sub.last_scrape_status = 'BLOCKED';
      sub.last_scrape_error = urlValidation.error;
      sub.consecutive_failures += 1;
      saveToStorage(STORAGE_KEY_SUBS, subscriptions);
      return {
        subscription: { ...sub },
        alertTriggered: false,
        scrapeResult: { status: 'BLOCKED', error: urlValidation.error }
      };
    }

    // Step 2: Determine scrape outcome
    let status: ScrapeStatus = simulateStatus || 'OK';
    let rawText = '';
    let parsedPrice = sub.current_price;
    let scrapeError: string | undefined;

    if (simulateStatus && simulateStatus !== 'OK') {
      status = simulateStatus;
      if (status === 'TIMEOUT') scrapeError = 'Connection timed out after 5000ms';
      else if (status === 'BLOCKED') scrapeError = 'HTTP 403 Forbidden - anti-bot challenge encountered';
      else if (status === 'SELECTOR_NOT_FOUND') scrapeError = `CSS selector "${sub.price_selector || '.price'}" returned no DOM elements`;
      else if (status === 'PARSE_ERROR') scrapeError = 'Malformed content - unable to detect numeric price value';
    } else if (simulatedPriceHike !== undefined) {
      status = 'OK';
      parsedPrice = simulatedPriceHike;
      rawText = `${sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹'}${parsedPrice.toFixed(2)} / month billed renewed`;
    } else {
      // Natural check: 85% OK, 15% random failure if consecutive failures test
      if (sub.consecutive_failures >= 5 && Math.random() < 0.5) {
        status = 'SELECTOR_NOT_FOUND';
        scrapeError = `CSS selector "${sub.price_selector || '.price'}" not found`;
      } else {
        status = 'OK';
        // Random slight variation or maintain price
        const shouldChange = Math.random() < 0.25;
        if (shouldChange) {
          const delta = (Math.random() * 2 + 1); // +$1 to $3
          parsedPrice = Math.round((sub.current_price + delta) * 100) / 100;
        }
        const sym = sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '₹';
        rawText = `Official Tier: ${sym}${parsedPrice.toFixed(2)} ${sub.billing_cycle === 'YEARLY' ? '/ year' : '/ month'}`;
      }
    }

    const now = new Date().toISOString();
    let alertTriggered = false;

    // Step 3: Transactional update
    if (status === 'OK') {
      const oldPrice = sub.current_price;
      sub.current_price = parsedPrice;
      sub.last_checked_at = now;
      sub.last_scrape_status = 'OK';
      sub.last_raw_match = rawText;
      sub.last_scrape_error = undefined;
      sub.consecutive_failures = 0; // Reset failures on OK

      // Append to price_history (APPEND-ONLY)
      const historyEntry: PriceHistory = {
        id: Date.now(),
        subscription_id: sub.id,
        price: parsedPrice,
        currency: sub.currency,
        source: 'MANUAL',
        recorded_at: now
      };
      priceHistories.push(historyEntry);
      saveToStorage(STORAGE_KEY_HISTORY, priceHistories);

      // Step 4: Idempotent Alert Dispatcher
      // Condition: new_price > previous_price AND (last_alerted_price is null OR new_price > last_alerted_price)
      const hasHiked = parsedPrice > oldPrice;
      const needsAlert = !sub.last_alerted_price || parsedPrice > sub.last_alerted_price;

      if (hasHiked && needsAlert) {
        // Check uniqueness: (subscription_id, alert_type, price)
        const alreadyAlerted = notificationLogs.some(
          log => log.subscription_id === sub.id && log.alert_type === 'PRICE_HIKE' && log.price === parsedPrice
        );

        if (!alreadyAlerted) {
          const tg = api.getTelegramConfig();
          const channel = (tg.enabled && tg.botToken && tg.chatId) ? 'EMAIL+TELEGRAM' : 'EMAIL';

          const logEntry: NotificationLog = {
            id: Date.now(),
            subscription_id: sub.id,
            subscription_name: sub.name,
            alert_type: 'PRICE_HIKE',
            old_price: oldPrice,
            price: parsedPrice,
            currency: sub.currency,
            channel: channel,
            status: 'SENT',
            created_at: now
          };
          notificationLogs.unshift(logEntry);
          saveToStorage(STORAGE_KEY_LOGS, notificationLogs);

          // Dispatch real-time Telegram alert if configured
          if (tg.enabled && tg.botToken && tg.chatId) {
            api.sendTelegramHikeNotification(sub, parsedPrice, oldPrice).catch(err => {
              console.warn('Telegram background alert dispatch failed:', err);
            });
          }

          sub.last_alerted_price = parsedPrice;
          alertTriggered = true;
        }
      }
    } else {
      // Scrape failed: update error, increment consecutive_failures, write NO price history row!
      sub.last_checked_at = now;
      sub.last_scrape_status = status;
      sub.last_scrape_error = scrapeError;
      sub.consecutive_failures += 1;
    }

    saveToStorage(STORAGE_KEY_SUBS, subscriptions);

    return {
      subscription: { ...sub },
      alertTriggered,
      scrapeResult: { status, rawMatch: rawText, error: scrapeError }
    };
  },

  async triggerScheduledBatchRun(): Promise<ScrapeRun> {
    const started = new Date().toISOString();
    let succeeded = 0;
    let failed = 0;
    let alertsSent = 0;
    const failureBreakdown: Record<string, number> = {};

    const active = subscriptions.filter(s => s.is_active);

    for (const sub of active) {
      try {
        const result = await this.checkSubscription(sub.id);
        if (result.scrapeResult.status === 'OK') {
          succeeded++;
          if (result.alertTriggered) alertsSent++;
        } else {
          failed++;
          failureBreakdown[result.scrapeResult.status] = (failureBreakdown[result.scrapeResult.status] || 0) + 1;
        }
      } catch {
        failed++;
        failureBreakdown['TIMEOUT'] = (failureBreakdown['TIMEOUT'] || 0) + 1;
      }
    }

    const finished = new Date().toISOString();
    const run: ScrapeRun = {
      id: Date.now(),
      started_at: started,
      finished_at: finished,
      checked: active.length,
      succeeded,
      failed,
      alerts_sent: alertsSent,
      failure_breakdown: failureBreakdown
    };

    scrapeRuns.unshift(run);
    saveToStorage(STORAGE_KEY_RUNS, scrapeRuns);
    return run;
  },

  async getPriceHistory(subscriptionId: number): Promise<PriceHistory[]> {
    const backendOnline = await checkBackendHealth();
    if (backendOnline) {
      try {
        const res = await fetch(`/api/subscriptions/${subscriptionId}/history`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend history fetch failed, using local store', err);
      }
    }
    return priceHistories
      .filter(h => h.subscription_id === subscriptionId)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  },

  async getNotificationLogs(): Promise<NotificationLog[]> {
    return [...notificationLogs];
  },

  async getScrapeRuns(): Promise<ScrapeRun[]> {
    return [...scrapeRuns];
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const active = subscriptions.filter(s => s.is_active);

    const monthlyBurn: Record<CurrencyCode, number> = { USD: 0, EUR: 0, GBP: 0, INR: 0 };
    const yearlyBurn: Record<CurrencyCode, number> = { USD: 0, EUR: 0, GBP: 0, INR: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    let renewalsNext7Days = 0;

    for (const sub of active) {
      const cur = sub.currency;
      // Money rules from specification:
      // Monthly burn for yearly plans is price / 12
      // Yearly burn for monthly plans is price * 12
      if (sub.billing_cycle === 'MONTHLY') {
        monthlyBurn[cur] = (monthlyBurn[cur] || 0) + sub.current_price;
        yearlyBurn[cur] = (yearlyBurn[cur] || 0) + (sub.current_price * 12);
      } else {
        monthlyBurn[cur] = (monthlyBurn[cur] || 0) + (sub.current_price / 12);
        yearlyBurn[cur] = (yearlyBurn[cur] || 0) + sub.current_price;
      }

      // Check renewal within next 7 days
      if (sub.renewal_date) {
        const renewal = new Date(sub.renewal_date);
        renewal.setHours(0, 0, 0, 0);
        if (renewal >= today && renewal <= in7Days) {
          renewalsNext7Days++;
        }
      }
    }

    // Round values to 2 decimals
    (Object.keys(monthlyBurn) as CurrencyCode[]).forEach(k => {
      monthlyBurn[k] = Math.round(monthlyBurn[k] * 100) / 100;
      yearlyBurn[k] = Math.round(yearlyBurn[k] * 100) / 100;
    });

    // 30d scrape success rate calculation
    let totalChecks = 0;
    let totalSuccess = 0;
    for (const run of scrapeRuns) {
      totalChecks += run.checked;
      totalSuccess += run.succeeded;
    }
    const rate = totalChecks > 0 ? Math.round((totalSuccess / totalChecks) * 1000) / 10 : 98.4;

    return {
      monthlyBurn,
      yearlyBurn,
      activeCount: active.length,
      renewalsNext7Days,
      scrapeSuccessRate30d: rate
    };
  },

  resetToDefaultDemoData(): void {
    subscriptions = [...INITIAL_SUBSCRIPTIONS];
    priceHistories = [...INITIAL_PRICE_HISTORIES];
    notificationLogs = [...INITIAL_NOTIFICATION_LOGS];
    scrapeRuns = [...INITIAL_SCRAPE_RUNS];
    saveToStorage(STORAGE_KEY_SUBS, subscriptions);
    saveToStorage(STORAGE_KEY_HISTORY, priceHistories);
    saveToStorage(STORAGE_KEY_LOGS, notificationLogs);
    saveToStorage(STORAGE_KEY_RUNS, scrapeRuns);
  },

  getTelegramConfig(): { botToken: string; chatId: string; enabled: boolean } {
    return loadFromStorage(STORAGE_KEY_TELEGRAM, {
      botToken: (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '',
      chatId: (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || '',
      enabled: true
    });
  },

  saveTelegramConfig(cfg: { botToken: string; chatId: string; enabled: boolean }): void {
    saveToStorage(STORAGE_KEY_TELEGRAM, cfg);
  },

  async sendTelegramTestMessage(botToken: string, chatId: string): Promise<{ success: boolean; error?: string }> {
    const text = '🛡️ *Subscription Sentinel Test Alert*\n\n' +
      '✅ *Telegram Bot is connected successfully!*\n' +
      'Real-time price-hike alerts will be delivered here.';

    try {
      const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: 'Markdown'
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.description || 'Telegram rejected the message. Verify bot token and ensure you started your bot.'
        };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error reaching Telegram API.' };
    }
  },

  async sendTelegramHikeNotification(sub: Subscription, newPrice: number, oldPrice: number): Promise<boolean> {
    const cfg = this.getTelegramConfig();
    if (!cfg.enabled || !cfg.botToken || !cfg.chatId) return false;

    const diff = newPrice - oldPrice;
    const pct = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : '0';

    const text = `🚨 *PRICE HIKE DETECTED*\n\n` +
      `Subscription Sentinel observed a silent price increase for *${sub.name}*!\n\n` +
      `📂 *Category:* \`${sub.category}\`\n` +
      `💰 *Old Price:* ${sub.currency} ${oldPrice.toFixed(2)}\n` +
      `📈 *New Price:* *${sub.currency} ${newPrice.toFixed(2)}* (+${pct}%)\n` +
      `🔄 *Billing Cycle:* ${sub.billing_cycle}\n` +
      `🌐 *Pricing Page:* [View Official Site](${sub.pricing_url})\n\n` +
      `🛡️ _Audited by Subscription Sentinel Daemon_`;

    try {
      const url = `https://api.telegram.org/bot${cfg.botToken.trim()}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cfg.chatId.trim(),
          text,
          parse_mode: 'Markdown'
        })
      });
      const data = await res.json();
      return !!(res.ok && data.ok);
    } catch {
      return false;
    }
  }
};
