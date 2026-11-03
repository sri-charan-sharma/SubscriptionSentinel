import { Subscription } from '../types';
import { resolveCancellationUrl } from './popularPresets';

const STORAGE_KEY_WEBHOOK = 'sentinel_webhook_config';

export interface WebhookConfig {
  discordWebhookUrl: string;
  slackWebhookUrl: string;
  notifyPriceHikes: boolean;
  notifyRenewals: boolean;
  enabled: boolean;
}

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  discordWebhookUrl: '',
  slackWebhookUrl: '',
  notifyPriceHikes: true,
  notifyRenewals: true,
  enabled: true
};

export const webhookService = {
  getConfig(): WebhookConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WEBHOOK);
      return data ? { ...DEFAULT_WEBHOOK_CONFIG, ...JSON.parse(data) } : DEFAULT_WEBHOOK_CONFIG;
    } catch {
      return DEFAULT_WEBHOOK_CONFIG;
    }
  },

  saveConfig(cfg: WebhookConfig): void {
    localStorage.setItem(STORAGE_KEY_WEBHOOK, JSON.stringify(cfg));
  },

  /**
   * Dispatches a test ping to either Discord or Slack webhook.
   */
  async sendTestPing(target: 'DISCORD' | 'SLACK', url: string): Promise<{ success: boolean; error?: string }> {
    if (!url || !url.trim().startsWith('http')) {
      return { success: false, error: 'Please enter a valid HTTP/HTTPS webhook URL' };
    }

    try {
      if (target === 'DISCORD') {
        const payload = {
          username: 'Subscription Sentinel',
          embeds: [
            {
              title: '🛡️ Subscription Sentinel Connected!',
              description: 'Discord Webhook pipeline verified. You will receive real-time alerts whenever a price hike or renewal occurs.',
              color: 0x10b981, // Emerald
              fields: [
                { name: 'Daemon Status', value: '🟢 Active & Monitoring', inline: true },
                { name: 'Audited Channels', value: 'Discord + Email + Telegram', inline: true }
              ],
              footer: { text: 'Subscription Sentinel Webhook Daemon' },
              timestamp: new Date().toISOString()
            }
          ]
        };

        const res = await fetch(url.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok || res.status === 204) {
          return { success: true };
        } else {
          const errText = await res.text();
          return { success: false, error: `Discord rejected request (HTTP ${res.status}): ${errText}` };
        }
      } else {
        // Slack webhook payload
        const payload = {
          text: '🛡️ Subscription Sentinel Connected! Slack alert pipeline is active.'
        };

        const res = await fetch(url.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          return { success: true };
        } else {
          const errText = await res.text();
          return { success: false, error: `Slack rejected request (HTTP ${res.status}): ${errText}` };
        }
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error reaching webhook server' };
    }
  },

  /**
   * Dispatches a price hike alert to all configured webhooks.
   */
  async dispatchPriceHikeAlert(
    sub: Subscription,
    oldPrice: number,
    newPrice: number
  ): Promise<{ discord: boolean; slack: boolean }> {
    const cfg = this.getConfig();
    if (!cfg.enabled || !cfg.notifyPriceHikes) {
      return { discord: false, slack: false };
    }

    const cancelUrl = resolveCancellationUrl(sub);
    const pct = oldPrice > 0 ? (((newPrice - oldPrice) / oldPrice) * 100).toFixed(1) : '100.0';

    let discordSent = false;
    let slackSent = false;

    // 1. Discord Dispatch
    if (cfg.discordWebhookUrl && cfg.discordWebhookUrl.trim()) {
      try {
        const payload = {
          username: 'Subscription Sentinel',
          embeds: [
            {
              title: `🚨 PRICE HIKE FLAGGED: ${sub.name}`,
              description: `A price increase of **+${pct}%** was detected on official pricing pages for **${sub.name}**.`,
              color: 0xef4444, // Red
              fields: [
                { name: 'Previous Price', value: `${sub.currency} ${oldPrice.toFixed(2)}`, inline: true },
                { name: 'Detected New Price', value: `**${sub.currency} ${newPrice.toFixed(2)}**`, inline: true },
                { name: 'Billing Cycle', value: sub.billing_cycle, inline: true },
                { name: 'Pricing Source', value: `[Official Page](${sub.pricing_url})`, inline: true },
                cancelUrl ? { name: 'Dark Pattern Buster', value: `[1-Click Direct Cancellation](${cancelUrl})`, inline: false } : null
              ].filter(Boolean),
              footer: { text: 'Audited by Subscription Sentinel Daemon' },
              timestamp: new Date().toISOString()
            }
          ]
        };

        const res = await fetch(cfg.discordWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        discordSent = res.ok || res.status === 204;
      } catch (e) {
        console.warn('Discord webhook dispatch failed', e);
      }
    }

    // 2. Slack Dispatch
    if (cfg.slackWebhookUrl && cfg.slackWebhookUrl.trim()) {
      try {
        const payload = {
          text: `🚨 *Price Hike Detected: ${sub.name}* increased from ${sub.currency} ${oldPrice.toFixed(2)} to *${sub.currency} ${newPrice.toFixed(2)}* (+${pct}%)`
        };

        const res = await fetch(cfg.slackWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        slackSent = res.ok;
      } catch (e) {
        console.warn('Slack webhook dispatch failed', e);
      }
    }

    return { discord: discordSent, slack: slackSent };
  }
};

