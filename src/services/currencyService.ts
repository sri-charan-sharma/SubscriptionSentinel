import { CurrencyCode, Subscription } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP'];

// Baseline fallback exchange rates (relative to 1.0 USD)
const FALLBACK_RATES_USD_BASE: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 86.85,
  EUR: 0.925,
  GBP: 0.792
};

const STORAGE_KEY_RATES = 'sentinel_exchange_rates';
const STORAGE_KEY_BASE_CURRENCY = 'sentinel_base_currency';
const STORAGE_KEY_UNIFIED_MODE = 'sentinel_unified_currency_mode';

interface CachedRates {
  rates: Record<CurrencyCode, number>;
  timestamp: number;
}

class CurrencyService {
  private rates: Record<CurrencyCode, number> = { ...FALLBACK_RATES_USD_BASE };
  private lastFetchedAt: Date | null = null;

  constructor() {
    this.initRates();
  }

  private initRates() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_RATES);
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        // If cache is less than 12 hours old, use it
        if (Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000) {
          this.rates = { ...FALLBACK_RATES_USD_BASE, ...parsed.rates };
          this.lastFetchedAt = new Date(parsed.timestamp);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Attempt fresh rates fetch in background
    this.fetchLiveRates();
  }

  public async fetchLiveRates(): Promise<boolean> {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          const freshRates: Record<CurrencyCode, number> = {
            USD: 1.0,
            INR: Number(data.rates.INR) || FALLBACK_RATES_USD_BASE.INR,
            EUR: Number(data.rates.EUR) || FALLBACK_RATES_USD_BASE.EUR,
            GBP: Number(data.rates.GBP) || FALLBACK_RATES_USD_BASE.GBP
          };
          this.rates = freshRates;
          this.lastFetchedAt = new Date();

          localStorage.setItem(
            STORAGE_KEY_RATES,
            JSON.stringify({
              rates: freshRates,
              timestamp: Date.now()
            })
          );
          return true;
        }
      }
    } catch (e) {
      console.warn('Live exchange rates unavailable, utilizing reference exchange rates', e);
    }
    return false;
  }

  public getRates(): Record<CurrencyCode, number> {
    return { ...this.rates };
  }

  public getLastUpdated(): Date | null {
    return this.lastFetchedAt;
  }

  /**
   * Convert an amount from one currency to another using the USD-pegged matrix
   */
  public convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const fromRate = this.rates[from] || FALLBACK_RATES_USD_BASE[from];
    const toRate = this.rates[to] || FALLBACK_RATES_USD_BASE[to];

    // Convert 'from' currency to base USD, then from USD to 'to' currency
    const amountInUSD = amount / fromRate;
    const result = amountInUSD * toRate;
    return Math.round(result * 100) / 100;
  }

  /**
   * Normalize any subscription's monthly commitment into a specified target currency
   */
  public convertSubscriptionMonthly(sub: Subscription, toCurrency: CurrencyCode): number {
    const monthlyNative = sub.billing_cycle === 'MONTHLY' ? sub.current_price : sub.current_price / 12;
    return this.convert(monthlyNative, sub.currency, toCurrency);
  }

  public format(amount: number, currency: CurrencyCode): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public getBaseCurrency(): CurrencyCode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BASE_CURRENCY);
      if (stored && SUPPORTED_CURRENCIES.includes(stored as CurrencyCode)) {
        return stored as CurrencyCode;
      }
    } catch {
      // ignore
    }
    return 'INR'; // Default preferred base currency as requested
  }

  public setBaseCurrency(currency: CurrencyCode): void {
    try {
      localStorage.setItem(STORAGE_KEY_BASE_CURRENCY, currency);
    } catch {
      // ignore
    }
  }

  public isUnifiedMode(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UNIFIED_MODE);
      return stored !== 'false'; // Default to enabled (true)
    } catch {
      return true;
    }
  }

  public setUnifiedMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_UNIFIED_MODE, enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
  }
}

export const currencyService = new CurrencyService();

