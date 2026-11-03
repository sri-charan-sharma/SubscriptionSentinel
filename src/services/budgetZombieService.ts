import { Subscription, PriceHistory, CurrencyCode } from '../types';
import { currencyService } from './currencyService';

const STORAGE_KEY_SPEND_CAP = 'sentinel_monthly_spend_cap';
const STORAGE_KEY_WHITELIST = 'sentinel_zombie_whitelist';

export interface ZombieAuditItem {
  subscription: Subscription;
  daysActive: number;
  monthsActive: number;
  estimatedCumulativeSpend: number;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const budgetZombieService = {
  getMonthlySpendCap(): number | null {
    try {
      const val = localStorage.getItem(STORAGE_KEY_SPEND_CAP);
      if (val === null) return 500; // Default sensible cap $500 / ₹40,000
      const parsed = parseFloat(val);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    } catch {
      return 500;
    }
  },

  setMonthlySpendCap(cap: number | null): void {
    if (cap === null || cap <= 0) {
      localStorage.removeItem(STORAGE_KEY_SPEND_CAP);
    } else {
      localStorage.setItem(STORAGE_KEY_SPEND_CAP, cap.toString());
    }
  },

  getWhitelistedZombieIds(): number[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WHITELIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  whitelistZombie(subId: number): void {
    const ids = this.getWhitelistedZombieIds();
    if (!ids.includes(subId)) {
      ids.push(subId);
      localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(ids));
    }
  },

  unwhitelistZombie(subId: number): void {
    const ids = this.getWhitelistedZombieIds().filter(id => id !== subId);
    localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(ids));
  },

  /**
   * Detects "Zombie" subscriptions:
   * Subscriptions that run continuously without price changes, review, or that have persistent failure.
   */
  detectZombieSubscriptions(
    subscriptions: Subscription[],
    priceHistories: PriceHistory[],
    baseCurrency: CurrencyCode = 'USD'
  ): ZombieAuditItem[] {
    const whitelisted = new Set(this.getWhitelistedZombieIds());
    const now = new Date().getTime();
    const zombies: ZombieAuditItem[] = [];

    for (const sub of subscriptions) {
      if (!sub.is_active || whitelisted.has(sub.id)) continue;

      const createdTime = new Date(sub.created_at).getTime();
      const diffMs = now - createdTime;
      const daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const monthsActive = Math.max(1, Math.round(daysActive / 30.4));

      // Check price history entries
      const histories = priceHistories.filter(h => h.subscription_id === sub.id);
      const isStatic = histories.length <= 2; // zero price volatility
      const hasBrokenCheck = sub.consecutive_failures >= 3;
      const isLongRunning = daysActive >= 90; // 3+ months old

      // Estimated cumulative money paid
      let monthlyCost = sub.current_price;
      if (sub.billing_cycle === 'YEARLY') {
        monthlyCost = sub.current_price / 12;
      }
      const monthlyConverted = currencyService.convert(monthlyCost, sub.currency, baseCurrency);
      const estimatedCumulative = monthlyConverted * monthsActive;

      // Zombie Criteria 1: Long running (>90 days), high cumulative burn, zero changes
      if (isLongRunning && isStatic && estimatedCumulative >= 50) {
        let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
        if (estimatedCumulative > 500 || sub.billing_cycle === 'YEARLY') severity = 'HIGH';

        zombies.push({
          subscription: sub,
          daysActive,
          monthsActive,
          estimatedCumulativeSpend: estimatedCumulative,
          reason: `Running for ${monthsActive} months (${daysActive} days) with zero price changes. Total money paid: ~${estimatedCumulative.toFixed(0)} ${baseCurrency}.`,
          severity
        });
      }
      // Zombie Criteria 2: Broken selector / forgotten service
      else if (hasBrokenCheck && daysActive >= 60) {
        zombies.push({
          subscription: sub,
          daysActive,
          monthsActive,
          estimatedCumulativeSpend: estimatedCumulative,
          reason: `Scraper failing for ${sub.consecutive_failures} runs. Account settings or billing plan may have changed.`,
          severity: 'HIGH'
        });
      }
    }

    // Sort by highest cumulative spend
    return zombies.sort((a, b) => b.estimatedCumulativeSpend - a.estimatedCumulativeSpend);
  }
};

