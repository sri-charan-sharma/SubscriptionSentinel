import { SubscriptionCategory, CurrencyCode, BillingCycle, ScrapeEngine } from '../types';

export interface PopularPreset {
  id: string;
  name: string;
  category: SubscriptionCategory;
  defaultPrice: number;
  defaultCurrency: CurrencyCode;
  billingCycle: BillingCycle;
  pricingUrl: string;
  priceSelector: string;
  cancellationUrl: string;
  scrapeEngine: ScrapeEngine;
  tag: string;
}

export const POPULAR_PRESETS: PopularPreset[] = [
  {
    id: 'netflix',
    name: 'Netflix Premium 4K',
    category: 'STREAMING',
    defaultPrice: 22.99,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.netflix.com/signup/planform',
    priceSelector: '.plan-price-tier-premium',
    cancellationUrl: 'https://www.netflix.com/cancelplan',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Netflix'
  },
  {
    id: 'spotify',
    name: 'Spotify Individual Premium',
    category: 'STREAMING',
    defaultPrice: 11.99,
    defaultCurrency: 'EUR',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.spotify.com/premium/',
    priceSelector: '#plan-premium-individual',
    cancellationUrl: 'https://www.spotify.com/account/subscription/change/cancel/',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Spotify'
  },
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT Plus',
    category: 'SOFTWARE',
    defaultPrice: 20.00,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://openai.com/chatgpt/pricing/',
    priceSelector: '.pricing-tier-plus',
    cancellationUrl: 'https://chatgpt.com/#settings/Subscription',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'ChatGPT'
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'STREAMING',
    defaultPrice: 13.99,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.youtube.com/premium',
    priceSelector: '.ytd-subscription-offer',
    cancellationUrl: 'https://www.youtube.com/paid_memberships',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'YouTube'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot Pro',
    category: 'SOFTWARE',
    defaultPrice: 10.00,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://github.com/features/copilot#pricing',
    priceSelector: '.pricing-card-individual .price',
    cancellationUrl: 'https://github.com/settings/billing',
    scrapeEngine: 'JSOUP',
    tag: 'GitHub'
  },
  {
    id: 'aws',
    name: 'AWS EC2 Reserved m6i.xlarge',
    category: 'CLOUD',
    defaultPrice: 139.50,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    priceSelector: '#ec2-m6i-xlarge-price',
    cancellationUrl: 'https://console.aws.amazon.com/ec2/home#Instances:',
    scrapeEngine: 'AUTO',
    tag: 'AWS'
  },
  {
    id: 'cursor',
    name: 'Cursor Pro',
    category: 'SOFTWARE',
    defaultPrice: 20.00,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.cursor.com/pricing',
    priceSelector: '.cursor-pricing-pro',
    cancellationUrl: 'https://www.cursor.com/settings',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Cursor'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude Pro',
    category: 'SOFTWARE',
    defaultPrice: 20.00,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://claude.ai/pricing',
    priceSelector: '.claude-pro-tier',
    cancellationUrl: 'https://claude.ai/settings/billing',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Claude'
  },
  {
    id: 'figma',
    name: 'Figma Professional',
    category: 'SOFTWARE',
    defaultPrice: 15.00,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.figma.com/pricing/',
    priceSelector: '.pricing-tier-pro',
    cancellationUrl: 'https://www.figma.com/settings',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Figma'
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    category: 'UTILITY',
    defaultPrice: 14.99,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.amazon.com/amazonprime',
    priceSelector: '.prime-membership-price',
    cancellationUrl: 'https://www.amazon.com/mc/manage',
    scrapeEngine: 'AUTO',
    tag: 'Prime'
  },
  {
    id: 'disney',
    name: 'Disney+ Premium',
    category: 'STREAMING',
    defaultPrice: 13.99,
    defaultCurrency: 'USD',
    billingCycle: 'MONTHLY',
    pricingUrl: 'https://www.disneyplus.com/',
    priceSelector: '.disney-tier-price',
    cancellationUrl: 'https://www.disneyplus.com/account/subscription',
    scrapeEngine: 'PLAYWRIGHT',
    tag: 'Disney+'
  },
  {
    id: 'equinox',
    name: 'Equinox Fitness Club All-Access',
    category: 'FITNESS',
    defaultPrice: 3600.00,
    defaultCurrency: 'USD',
    billingCycle: 'YEARLY',
    pricingUrl: 'https://www.equinox.com/memberships',
    priceSelector: '.tier-all-access .cost',
    cancellationUrl: 'https://www.equinox.com/account/membership',
    scrapeEngine: 'JSOUP',
    tag: 'Equinox'
  }
];

/**
 * Resolves the 1-click direct cancellation deep-link for a given subscription.
 * Checks subscription cancellation_url, matches known popular domains, or falls back to host account page.
 */
export function resolveCancellationUrl(sub: { name: string; pricing_url?: string; cancellation_url?: string }): string | null {
  if (sub.cancellation_url && sub.cancellation_url.trim()) {
    return sub.cancellation_url.trim();
  }

  const nameLower = sub.name.toLowerCase();
  const matched = POPULAR_PRESETS.find(p => nameLower.includes(p.tag.toLowerCase()) || nameLower.includes(p.id));
  if (matched) {
    return matched.cancellationUrl;
  }

  if (sub.pricing_url) {
    try {
      const url = new URL(sub.pricing_url);
      const host = url.hostname.toLowerCase();
      if (host.includes('netflix')) return 'https://www.netflix.com/cancelplan';
      if (host.includes('spotify')) return 'https://www.spotify.com/account/subscription/change/cancel/';
      if (host.includes('openai') || host.includes('chatgpt')) return 'https://chatgpt.com/#settings/Subscription';
      if (host.includes('youtube')) return 'https://www.youtube.com/paid_memberships';
      if (host.includes('github')) return 'https://github.com/settings/billing';
      if (host.includes('amazon')) return 'https://www.amazon.com/mc/manage';
      if (host.includes('apple')) return 'https://manage.apple.com/';
      if (host.includes('disney')) return 'https://www.disneyplus.com/account/subscription';
      if (host.includes('google')) return 'https://play.google.com/store/account/subscriptions';
      return `${url.protocol}//${url.hostname}/account`;
    } catch {
      return null;
    }
  }

  return null;
}
