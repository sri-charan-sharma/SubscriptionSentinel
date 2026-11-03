import { Subscription, PriceHistory, NotificationLog, ScrapeRun } from '../types';

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    name: "Netflix Premium 4K",
    category: "STREAMING",
    current_price: 22.99,
    currency: "USD",
    billing_cycle: "MONTHLY",
    pricing_url: "https://www.netflix.com/signup/planform",
    price_selector: ".plan-price-tier-premium",
    cancellation_url: "https://www.netflix.com/cancelplan",
    scrape_engine: "PLAYWRIGHT",
    last_engine_used: "PLAYWRIGHT",
    renewal_date: "2026-11-18",
    is_active: true,
    last_checked_at: "2026-11-01T08:00:15Z",
    last_scrape_status: "OK",
    last_raw_match: "$22.99 / month for Ultra HD + 4 screens",
    consecutive_failures: 0,
    last_alerted_price: 22.99,
    created_at: "2026-05-10T12:00:00Z"
  },
  {
    id: 2,
    name: "AWS EC2 Reserved m6i.xlarge",
    category: "CLOUD",
    current_price: 139.50,
    currency: "USD",
    billing_cycle: "MONTHLY",
    pricing_url: "https://aws.amazon.com/ec2/pricing/on-demand/",
    price_selector: "#ec2-m6i-xlarge-price",
    cancellation_url: "https://console.aws.amazon.com/billing/home#/subscriptions",
    scrape_engine: "AUTO",
    last_engine_used: "JSOUP",
    renewal_date: "2026-11-05", // Within 7 days!
    is_active: true,
    last_checked_at: "2026-11-01T08:00:45Z",
    last_scrape_status: "OK",
    last_raw_match: "$139.50 per month upfront standard 1-yr",
    consecutive_failures: 0,
    last_alerted_price: 139.50,
    created_at: "2026-03-01T09:30:00Z"
  },
  {
    id: 3,
    name: "GitHub Copilot Pro",
    category: "SOFTWARE",
    current_price: 10.00,
    currency: "USD",
    billing_cycle: "MONTHLY",
    pricing_url: "https://github.com/features/copilot#pricing",
    price_selector: ".pricing-card-individual .price",
    cancellation_url: "https://github.com/settings/billing",
    scrape_engine: "JSOUP",
    last_engine_used: "JSOUP",
    renewal_date: "2026-11-28",
    is_active: true,
    last_checked_at: "2026-11-01T08:01:10Z",
    last_scrape_status: "OK",
    last_raw_match: "$10 USD / month per individual",
    consecutive_failures: 0,
    last_alerted_price: 10.00,
    created_at: "2026-06-15T14:15:00Z"
  },
  {
    id: 4,
    name: "Datadog Pro Infrastructure",
    category: "CLOUD",
    current_price: 18.00,
    currency: "USD",
    billing_cycle: "MONTHLY",
    pricing_url: "https://www.datadoghq.com/pricing/",
    price_selector: ".datadog-plan-pro-v2",
    cancellation_url: "https://app.datadoghq.com/account/settings",
    scrape_engine: "AUTO",
    last_engine_used: "PLAYWRIGHT",
    renewal_date: "2026-12-01",
    is_active: true,
    last_checked_at: "2026-11-01T08:01:30Z",
    last_scrape_status: "SELECTOR_NOT_FOUND",
    last_scrape_error: "CSS selector '.datadog-plan-pro-v2' not matched in DOM",
    last_raw_match: undefined,
    consecutive_failures: 5, // Triggers "Needs Attention" flag!
    last_alerted_price: 18.00,
    created_at: "2026-02-12T08:00:00Z"
  },
  {
    id: 5,
    name: "Equinox Fitness Club All-Access",
    category: "FITNESS",
    current_price: 3600.00,
    currency: "USD",
    billing_cycle: "YEARLY", // Yearly plan! ($300/mo)
    pricing_url: "https://www.equinox.com/memberships",
    price_selector: ".tier-all-access .cost",
    cancellation_url: "https://www.equinox.com/account/membership",
    scrape_engine: "JSOUP",
    last_engine_used: "JSOUP",
    renewal_date: "2026-11-04", // Within 7 days!
    is_active: true,
    last_checked_at: "2026-11-01T08:02:00Z",
    last_scrape_status: "OK",
    last_raw_match: "$3,600.00 billed annually ($300/month)",
    consecutive_failures: 0,
    last_alerted_price: 3600.00,
    created_at: "2025-11-04T10:00:00Z"
  },
  {
    id: 6,
    name: "Spotify Individual Premium",
    category: "STREAMING",
    current_price: 11.99,
    currency: "EUR",
    billing_cycle: "MONTHLY",
    pricing_url: "https://www.spotify.com/premium/",
    price_selector: "#plan-premium-individual",
    cancellation_url: "https://www.spotify.com/account/subscription/change/cancel/",
    scrape_engine: "PLAYWRIGHT",
    last_engine_used: "PLAYWRIGHT",
    renewal_date: "2026-11-12",
    is_active: true,
    last_checked_at: "2026-11-01T08:02:20Z",
    last_scrape_status: "OK",
    last_raw_match: "11,99 € / mois",
    consecutive_failures: 0,
    last_alerted_price: 11.99,
    created_at: "2026-01-10T11:00:00Z"
  }
];

export const INITIAL_PRICE_HISTORIES: PriceHistory[] = [
  // Netflix price hike history
  { id: 101, subscription_id: 1, price: 17.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-05-10T08:00:00Z" },
  { id: 102, subscription_id: 1, price: 17.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-06-10T08:00:00Z" },
  { id: 103, subscription_id: 1, price: 19.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-07-15T08:00:00Z" },
  { id: 104, subscription_id: 1, price: 19.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-08-15T08:00:00Z" },
  { id: 105, subscription_id: 1, price: 19.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-09-15T08:00:00Z" },
  { id: 106, subscription_id: 1, price: 22.99, currency: "USD", source: "SCHEDULED", recorded_at: "2026-10-18T08:00:00Z" },
  { id: 107, subscription_id: 1, price: 22.99, currency: "USD", source: "MANUAL", recorded_at: "2026-11-01T08:00:15Z" },

  // AWS EC2
  { id: 201, subscription_id: 2, price: 139.50, currency: "USD", source: "SCHEDULED", recorded_at: "2026-08-01T08:00:00Z" },
  { id: 202, subscription_id: 2, price: 139.50, currency: "USD", source: "SCHEDULED", recorded_at: "2026-09-01T08:00:00Z" },
  { id: 203, subscription_id: 2, price: 139.50, currency: "USD", source: "SCHEDULED", recorded_at: "2026-10-01T08:00:00Z" },
  { id: 204, subscription_id: 2, price: 139.50, currency: "USD", source: "SCHEDULED", recorded_at: "2026-11-01T08:00:45Z" },

  // GitHub Copilot
  { id: 301, subscription_id: 3, price: 10.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-08-01T08:00:00Z" },
  { id: 302, subscription_id: 3, price: 10.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-09-01T08:00:00Z" },
  { id: 303, subscription_id: 3, price: 10.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-10-01T08:00:00Z" },
  { id: 304, subscription_id: 3, price: 10.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-11-01T08:01:10Z" },

  // Datadog Pro
  { id: 401, subscription_id: 4, price: 15.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-03-01T08:00:00Z" },
  { id: 402, subscription_id: 4, price: 18.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-06-01T08:00:00Z" },

  // Equinox
  { id: 501, subscription_id: 5, price: 3400.00, currency: "USD", source: "SCHEDULED", recorded_at: "2025-11-04T10:00:00Z" },
  { id: 502, subscription_id: 5, price: 3600.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-05-04T10:00:00Z" },
  { id: 503, subscription_id: 5, price: 3600.00, currency: "USD", source: "SCHEDULED", recorded_at: "2026-11-01T08:02:00Z" },

  // Spotify
  { id: 601, subscription_id: 6, price: 10.99, currency: "EUR", source: "SCHEDULED", recorded_at: "2026-04-01T08:00:00Z" },
  { id: 602, subscription_id: 6, price: 11.99, currency: "EUR", source: "SCHEDULED", recorded_at: "2026-08-01T08:00:00Z" },
  { id: 603, subscription_id: 6, price: 11.99, currency: "EUR", source: "SCHEDULED", recorded_at: "2026-11-01T08:02:20Z" }
];

export const INITIAL_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: 1,
    subscription_id: 1,
    subscription_name: "Netflix Premium 4K",
    alert_type: "PRICE_HIKE",
    old_price: 19.99,
    price: 22.99,
    currency: "USD",
    channel: "EMAIL",
    status: "SENT",
    created_at: "2026-10-18T08:01:05Z"
  },
  {
    id: 2,
    subscription_id: 4,
    subscription_name: "Datadog Pro Infrastructure",
    alert_type: "PRICE_HIKE",
    old_price: 15.00,
    price: 18.00,
    currency: "USD",
    channel: "EMAIL",
    status: "SENT",
    created_at: "2026-06-01T08:02:11Z"
  },
  {
    id: 3,
    subscription_id: 5,
    subscription_name: "Equinox Fitness Club All-Access",
    alert_type: "PRICE_HIKE",
    old_price: 3400.00,
    price: 3600.00,
    currency: "USD",
    channel: "EMAIL",
    status: "SENT",
    created_at: "2026-05-04T10:01:50Z"
  }
];

export const INITIAL_SCRAPE_RUNS: ScrapeRun[] = [
  {
    id: 1042,
    started_at: "2026-11-01T08:00:00Z",
    finished_at: "2026-11-01T08:02:30Z",
    checked: 6,
    succeeded: 5,
    failed: 1,
    alerts_sent: 0,
    failure_breakdown: { "SELECTOR_NOT_FOUND": 1 }
  },
  {
    id: 1041,
    started_at: "2026-10-31T08:00:00Z",
    finished_at: "2026-10-31T08:02:25Z",
    checked: 6,
    succeeded: 5,
    failed: 1,
    alerts_sent: 0,
    failure_breakdown: { "SELECTOR_NOT_FOUND": 1 }
  },
  {
    id: 1040,
    started_at: "2026-10-30T08:00:00Z",
    finished_at: "2026-10-30T08:02:15Z",
    checked: 6,
    succeeded: 6,
    failed: 0,
    alerts_sent: 0,
    failure_breakdown: {}
  }
];
