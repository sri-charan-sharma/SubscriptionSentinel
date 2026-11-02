export type SubscriptionCategory = 'STREAMING' | 'CLOUD' | 'SOFTWARE' | 'UTILITY' | 'FITNESS';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type ScrapeStatus = 'OK' | 'BLOCKED' | 'TIMEOUT' | 'SELECTOR_NOT_FOUND' | 'PARSE_ERROR';

export interface Subscription {
  id: number;
  userId?: number;
  name: string;
  category: SubscriptionCategory;
  current_price: number;
  currency: CurrencyCode;
  billing_cycle: BillingCycle;
  pricing_url: string;
  price_selector?: string;
  renewal_date: string; // YYYY-MM-DD
  is_active: boolean;
  last_checked_at?: string;
  last_scrape_status?: ScrapeStatus;
  last_scrape_error?: string;
  last_raw_match?: string;
  consecutive_failures: number;
  last_alerted_price?: number;
  created_at: string;
}

export interface PriceHistory {
  id: number;
  subscription_id: number;
  price: number;
  currency: CurrencyCode;
  source: 'MANUAL' | 'SCHEDULED';
  recorded_at: string;
}

export interface NotificationLog {
  id: number;
  subscription_id: number;
  subscription_name?: string;
  alert_type: 'PRICE_HIKE';
  old_price: number;
  price: number;
  currency: CurrencyCode;
  channel: 'EMAIL';
  status: 'PENDING' | 'SENT' | 'FAILED';
  created_at: string;
}

export interface ScrapeRun {
  id: number;
  started_at: string;
  finished_at: string;
  checked: number;
  succeeded: number;
  failed: number;
  alerts_sent: number;
  failure_breakdown: Record<string, number>;
}

export interface DashboardMetrics {
  monthlyBurn: Record<CurrencyCode, number>;
  yearlyBurn: Record<CurrencyCode, number>;
  activeCount: number;
  renewalsNext7Days: number;
  scrapeSuccessRate30d: number;
}

