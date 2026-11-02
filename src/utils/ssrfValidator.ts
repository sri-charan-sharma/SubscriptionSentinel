export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Validates a target pricing URL to prevent Server-Side Request Forgery (SSRF).
 * Blocks loopback, link-local, private IP ranges, and cloud metadata endpoints.
 */
export function validatePricingUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || rawUrl.trim() === '') {
    return { valid: false, error: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, error: 'Malformed URL: must include scheme (e.g. https://)' };
  }

  // 1. Protocol check: Allow only http and https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: `Invalid scheme: "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject localhost & loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('127.') ||
    hostname.endsWith('.localhost')
  ) {
    return { valid: false, error: 'SSRF blocked: Loopback addresses are forbidden' };
  }

  // 3. Reject Cloud Metadata addresses
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname === 'metadata.goog' ||
    hostname === '100.100.100.200' // Alibaba metadata
  ) {
    return { valid: false, error: 'SSRF blocked: Cloud metadata service address detected' };
  }

  // 4. Reject Link-Local IP range (169.254.0.0/16)
  if (hostname.startsWith('169.254.')) {
    return { valid: false, error: 'SSRF blocked: Link-local addresses (169.254.0.0/16) are forbidden' };
  }

  // 5. Reject RFC1918 Private IPv4 ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) {
      return { valid: false, error: 'SSRF blocked: RFC1918 Private IP range 10.0.0.0/8 is forbidden' };
    }
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
      return { valid: false, error: 'SSRF blocked: RFC1918 Private IP range 172.16.0.0/12 is forbidden' };
    }
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) {
      return { valid: false, error: 'SSRF blocked: RFC1918 Private IP range 192.168.0.0/16 is forbidden' };
    }
    // 0.0.0.0
    if (octet1 === 0) {
      return { valid: false, error: 'SSRF blocked: Unspecified address 0.0.0.0 is forbidden' };
    }
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString()
  };
}

