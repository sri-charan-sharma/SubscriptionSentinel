import { Subscription } from '../types';

export interface SelectorTestResult {
  success: boolean;
  matchedCount: number;
  matches: string[];
  detectedPrice: number | null;
  detectedCurrency: string | null;
  error?: string;
}

/**
 * Sandboxed client-side CSS selector test against DOM HTML snippet.
 */
export function testCssSelector(htmlSnippet: string, selector: string): SelectorTestResult {
  if (!selector || !selector.trim()) {
    return {
      success: false,
      matchedCount: 0,
      matches: [],
      detectedPrice: null,
      detectedCurrency: null,
      error: 'CSS selector cannot be empty'
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSnippet, 'text/html');
    const elements = doc.querySelectorAll(selector.trim());

    if (elements.length === 0) {
      return {
        success: false,
        matchedCount: 0,
        matches: [],
        detectedPrice: null,
        detectedCurrency: null,
        error: `Selector '${selector}' matched 0 elements in captured DOM.`
      };
    }

    const matches: string[] = [];
    elements.forEach((el, idx) => {
      if (idx < 5) {
        matches.push(el.textContent?.trim() || '');
      }
    });

    const firstText = matches[0] || '';
    // Regex matching currency tokens
    const priceMatch = firstText.match(/([$€£₹])\s*(\d+([.,]\d{2})?)|(\d+([.,]\d{2})?)\s*([$€£₹]|USD|EUR|GBP|INR)/i);
    let detectedPrice: number | null = null;
    let detectedCurrency: string | null = null;

    if (priceMatch) {
      const numStr = (priceMatch[2] || priceMatch[4] || '').replace(/,/g, '.');
      detectedPrice = parseFloat(numStr) || null;
      const symbol = priceMatch[1] || priceMatch[6] || '';
      if (symbol.includes('$')) detectedCurrency = 'USD';
      else if (symbol.includes('€')) detectedCurrency = 'EUR';
      else if (symbol.includes('£')) detectedCurrency = 'GBP';
      else if (symbol.includes('₹') || symbol.toUpperCase().includes('INR')) detectedCurrency = 'INR';
      else detectedCurrency = symbol.toUpperCase();
    }

    return {
      success: true,
      matchedCount: elements.length,
      matches,
      detectedPrice,
      detectedCurrency
    };
  } catch (err: any) {
    return {
      success: false,
      matchedCount: 0,
      matches: [],
      detectedPrice: null,
      detectedCurrency: null,
      error: err.message || 'Invalid CSS selector expression'
    };
  }
}

/**
 * Returns mock/captured DOM HTML for a subscription.
 */
export function getSubscriptionDomHtml(sub: Subscription): string {
  if (sub.last_dom_html && sub.last_dom_html.trim()) {
    return sub.last_dom_html;
  }

  const name = sub.name.toLowerCase();

  if (name.includes('netflix')) {
    return `
<div class="plan-selection-container">
  <div class="plan-card standard">
    <h3 class="plan-name">Standard 1080p</h3>
    <div class="plan-price">$15.49 / month</div>
    <p>Full HD, 2 devices simultaneously</p>
  </div>
  <div class="plan-card premium active">
    <h3 class="plan-name">Premium 4K Ultra HD</h3>
    <div class="plan-price-tier-premium">$22.99 / month for Ultra HD + 4 screens</div>
    <span class="badge">Most Popular</span>
  </div>
</div>`;
  }

  if (name.includes('spotify')) {
    return `
<div id="pricing-plans" class="spotify-plans-wrapper">
  <div class="plan-card" id="plan-individual">
    <h2>Individual Premium</h2>
    <div id="plan-premium-individual" class="price-amount">11,99 € / mois</div>
    <p class="plan-terms">1 account • Cancel anytime online</p>
  </div>
  <div class="plan-card" id="plan-duo">
    <h2>Duo Premium</h2>
    <div class="price-amount">14,99 € / mois</div>
  </div>
</div>`;
  }

  if (name.includes('aws') || name.includes('ec2')) {
    return `
<table class="aws-pricing-matrix">
  <thead>
    <tr><th>Instance Type</th><th>vCPU</th><th>Memory</th><th>Effective Price</th></tr>
  </thead>
  <tbody>
    <tr class="selected-tier">
      <td class="instance-name">m6i.xlarge</td>
      <td>4</td>
      <td>16 GiB</td>
      <td id="ec2-m6i-xlarge-price">$139.50 per month upfront standard 1-yr</td>
    </tr>
  </tbody>
</table>`;
  }

  if (name.includes('github') || name.includes('copilot')) {
    return `
<div class="pricing-card-individual">
  <h3>GitHub Copilot Individual</h3>
  <div class="price">$10 USD / month per individual</div>
  <ul class="features">
    <li>Code completion</li>
    <li>Chat in IDE & CLI</li>
  </ul>
</div>`;
  }

  if (name.includes('datadog')) {
    return `
<div class="datadog-pricing-tiers">
  <!-- Note: class was updated from .datadog-plan-pro-v2 to .datadog-plan-pro-v3 by vendor -->
  <div class="datadog-plan-card datadog-plan-pro-v3">
    <div class="tier-title">Infrastructure Pro</div>
    <div class="cost">$18.00 per host, per month (billed annually)</div>
  </div>
</div>`;
  }

  return `
<div class="pricing-page">
  <div class="header">
    <h1>${sub.name}</h1>
  </div>
  <div class="pricing-box">
    <div class="price-title">Current Active Subscription Plan</div>
    <div class="${sub.price_selector ? sub.price_selector.replace(/^[.#]/, '') : 'price'}">
      ${sub.currency} ${sub.current_price.toFixed(2)} / ${sub.billing_cycle.toLowerCase()}
    </div>
  </div>
</div>`;
}

/**
 * Returns mock visual snapshot or Base64 screenshot for the subscription.
 */
export function getSubscriptionSnapshotSvg(sub: Subscription): string {
  if (sub.last_screenshot_base64 && sub.last_screenshot_base64.trim()) {
    return sub.last_screenshot_base64;
  }

  const name = sub.name;
  const price = `${sub.currency} ${sub.current_price.toFixed(2)}`;
  const status = sub.last_scrape_status || 'OK';
  const isError = status !== 'OK';

  // SVG Mock Browser View
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#121316"/>
        <stop offset="100%" stop-color="#1e2029"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#262936"/>
        <stop offset="100%" stop-color="#1a1c24"/>
      </linearGradient>
    </defs>
    
    <!-- Background Canvas -->
    <rect width="800" height="500" fill="url(#bgGrad)"/>
    
    <!-- Top Nav Mock -->
    <rect x="0" y="0" width="800" height="50" fill="#0d0e12"/>
    <circle cx="25" cy="25" r="5" fill="#ef4444"/>
    <circle cx="42" cy="25" r="5" fill="#f59e0b"/>
    <circle cx="59" cy="25" r="5" fill="#10b981"/>
    
    <!-- URL Bar -->
    <rect x="90" y="12" width="620" height="26" rx="4" fill="#1b1d24" stroke="#333" stroke-width="1"/>
    <text x="105" y="29" fill="#9ca3af" font-family="monospace" font-size="11">${sub.pricing_url}</text>

    <!-- Page Content Container -->
    <text x="50" y="90" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="22" font-weight="bold">${name} - Official Pricing</text>
    <text x="50" y="112" fill="#9ca3af" font-family="-apple-system, sans-serif" font-size="12">Rendered in Playwright Headless Chromium (1280x800 Viewport)</text>

    <!-- Plan Card 1 -->
    <rect x="50" y="140" width="320" height="300" rx="6" fill="url(#cardGrad)" stroke="#374151" stroke-width="1"/>
    <text x="75" y="180" fill="#9ca3af" font-family="monospace" font-size="12" font-weight="bold">BASIC TIER</text>
    <text x="75" y="215" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="bold">Standard Starter</text>
    <text x="75" y="250" fill="#9ca3af" font-family="monospace" font-size="14">${sub.currency} 9.99 / mo</text>
    <rect x="75" y="280" width="270" height="1" fill="#374151"/>
    <text x="75" y="315" fill="#6b7280" font-family="sans-serif" font-size="12">• Single user access</text>
    <text x="75" y="340" fill="#6b7280" font-family="sans-serif" font-size="12">• Standard resolution</text>

    <!-- Plan Card 2 (Target Match) -->
    <rect x="410" y="140" width="340" height="300" rx="6" fill="url(#cardGrad)" stroke="${isError ? '#ef4444' : '#10b981'}" stroke-width="${isError ? '2' : '3'}"/>
    <rect x="410" y="140" width="340" height="28" rx="6" fill="${isError ? '#ef4444' : '#10b981'}"/>
    <text x="430" y="159" fill="#000000" font-family="monospace" font-size="11" font-weight="bold">${isError ? 'TARGET LOCATOR MISMATCH' : 'TARGET DETECTED BY PLAYWRIGHT'}</text>
    
    <text x="435" y="215" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="18" font-weight="bold">${name}</text>
    
    <!-- Highlighting Box around price -->
    <rect x="430" y="235" width="295" height="50" rx="4" fill="${isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}" stroke="${isError ? '#ef4444' : '#10b981'}" stroke-width="1.5" stroke-dasharray="${isError ? '4' : 'none'}"/>
    <text x="445" y="267" fill="${isError ? '#fca5a5' : '#34d399'}" font-family="monospace" font-size="20" font-weight="bold">${isError ? 'SELECTOR MISSING' : price}</text>

    <text x="435" y="325" fill="#9ca3af" font-family="monospace" font-size="11">SELECTOR: ${sub.price_selector || '.price (auto-detected)'}</text>
    <text x="435" y="350" fill="#9ca3af" font-family="monospace" font-size="11">STATUS: ${status}</text>
    ${sub.last_raw_match ? `<text x="435" y="380" fill="#a7f3d0" font-family="monospace" font-size="10">MATCH: "${sub.last_raw_match.slice(0, 35)}..."</text>` : ''}
    ${sub.last_scrape_error ? `<text x="435" y="380" fill="#fca5a5" font-family="monospace" font-size="10">ERR: ${sub.last_scrape_error.slice(0, 38)}</text>` : ''}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

