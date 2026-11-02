export interface ParsedPriceResult {
  success: boolean;
  price?: number;
  currency?: string;
  rawMatched?: string;
  error?: string;
}

/**
 * Robust price parser capable of extracting numeric values and currency from
 * diverse pricing headlines (e.g., "From $19.99/mo", "€ 15,99 per seat", "₹1,499").
 */
export function parseScrapedPrice(rawText: string): ParsedPriceResult {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'Empty text content' };
  }

  const clean = rawText.trim();

  // Currency detection
  let detectedCurrency: string | undefined;
  if (/[$]|USD/i.test(clean)) detectedCurrency = 'USD';
  else if (/[€]|EUR/i.test(clean)) detectedCurrency = 'EUR';
  else if (/[£]|GBP/i.test(clean)) detectedCurrency = 'GBP';
  else if (/[₹]|INR/i.test(clean)) detectedCurrency = 'INR';

  // Match price candidates: e.g. 19.99, 1,499.00, 19,99, 1.299,00
  // Pattern matches numbers with optional commas or dots as decimal or thousand separators
  const priceRegex = /([0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})|[0-9]+(?:[.,][0-9]{2})?)/g;
  const matches = clean.match(priceRegex);

  if (!matches || matches.length === 0) {
    return {
      success: false,
      error: `Could not parse valid price from: "${clean.slice(0, 50)}"`
    };
  }

  // Pick the most likely price token (usually the first substantial number)
  const candidate = matches[0].trim();

  // Normalize candidate:
  // e.g. "1,499.00" -> "1499.00"
  // e.g. "1.499,00" -> "1499.00" (European)
  // e.g. "19,99" -> "19.99"
  let normalizedStr = candidate;

  if (candidate.includes('.') && candidate.includes(',')) {
    // If dot comes before comma: 1.499,50 -> comma is decimal
    if (candidate.lastIndexOf(',') > candidate.lastIndexOf('.')) {
      normalizedStr = candidate.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,499.50 -> dot is decimal
      normalizedStr = candidate.replace(/,/g, '');
    }
  } else if (candidate.includes(',')) {
    // Single comma: check if 2 digits follow, e.g. "19,99"
    if (/,\d{2}$/.test(candidate)) {
      normalizedStr = candidate.replace(',', '.');
    } else {
      // e.g. 1,000 -> 1000
      normalizedStr = candidate.replace(/,/g, '');
    }
  }

  const numericValue = parseFloat(normalizedStr);
  if (isNaN(numericValue) || numericValue <= 0) {
    return {
      success: false,
      error: `Parsed value is invalid or non-positive: ${candidate}`
    };
  }

  return {
    success: true,
    price: Math.round(numericValue * 100) / 100,
    currency: detectedCurrency,
    rawMatched: clean.length > 60 ? clean.substring(0, 57) + '...' : clean
  };
}

