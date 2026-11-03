import { Subscription } from '../types';
import { resolveCancellationUrl } from './popularPresets';

export interface CalendarExportOptions {
  includeAlarms?: boolean;
  leadDays?: number[]; // e.g. [3, 1] for 3 days and 1 day before
  asRecurring?: boolean; // include RRULE:FREQ=MONTHLY / YEARLY
}

/**
 * Formats a Date object or YYYY-MM-DD string into iCalendar DATE format (YYYYMMDD)
 */
function formatDateToIcs(dateStr: string): string {
  // e.g. "2026-11-18" -> "20261118"
  return dateStr.replace(/-/g, '');
}

/**
 * Formats current UTC timestamp into iCalendar UTC format (YYYYMMDDTHHMMSSZ)
 */
function getIcsTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escapes characters for iCalendar text fields (comma, semicolon, backslash, newline)
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an RFC 5545 compliant .ics (iCalendar) string for a list of subscriptions.
 */
export function generateIcsCalendar(
  subscriptions: Subscription[],
  options: CalendarExportOptions = { includeAlarms: true, leadDays: [3, 1], asRecurring: true }
): string {
  const timestamp = getIcsTimestamp();
  const leadDays = options.leadDays && options.leadDays.length > 0 ? options.leadDays : [3, 1];

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Subscription Sentinel//Renewal Sentinel Alarms//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Subscription Sentinel Renewals',
    'X-WR-CALDESC:Automated renewal alerts and price monitor tracking from Subscription Sentinel',
    'X-WR-TIMEZONE:UTC'
  ];

  for (const sub of subscriptions) {
    if (!sub.is_active || !sub.renewal_date) continue;

    const dtStart = formatDateToIcs(sub.renewal_date);
    const cancelUrl = resolveCancellationUrl(sub);

    const descriptionParts = [
      `SUBSCRIPTION RENEWAL NOTICE`,
      `Service: ${sub.name}`,
      `Category: ${sub.category}`,
      `Recurring Cost: ${sub.currency} ${sub.current_price.toFixed(2)} (${sub.billing_cycle})`,
      `Next Renewal Date: ${sub.renewal_date}`,
      ``,
      `Official Pricing Page: ${sub.pricing_url}`,
      cancelUrl ? `1-Click Direct Cancellation Flow: ${cancelUrl}` : '',
      ``,
      `Tracked and audited by Subscription Sentinel.`
    ].filter(Boolean);

    const escapedDesc = escapeIcsText(descriptionParts.join('\n'));
    const escapedSummary = escapeIcsText(`💳 ${sub.name} Renews (${sub.currency} ${sub.current_price.toFixed(2)})`);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:sub-${sub.id}-${dtStart}@subscriptionsentinel.local`);
    lines.push(`DTSTAMP:${timestamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`SUMMARY:${escapedSummary}`);
    lines.push(`DESCRIPTION:${escapedDesc}`);
    if (cancelUrl) {
      lines.push(`URL:${cancelUrl}`);
    } else {
      lines.push(`URL:${sub.pricing_url}`);
    }

    // Add recurring frequency
    if (options.asRecurring) {
      if (sub.billing_cycle === 'YEARLY') {
        lines.push('RRULE:FREQ=YEARLY');
      } else {
        lines.push('RRULE:FREQ=MONTHLY');
      }
    }

    // Add audio/display alarms before renewal date
    if (options.includeAlarms) {
      for (const days of leadDays) {
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push(`DESCRIPTION:${escapeIcsText(`⚠️ Reminder: ${sub.name} renews in ${days} day${days > 1 ? 's' : ''} (${sub.currency} ${sub.current_price.toFixed(2)})`)}`);
        lines.push(`TRIGGER:-P${days}D`);
        lines.push('END:VALARM');
      }
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Triggers a client-side download of a .ics file.
 */
export function downloadIcsFile(
  subscriptions: Subscription[],
  filename = 'subscription-sentinel-renewals.ics',
  options?: CalendarExportOptions
): void {
  const icsData = generateIcsCalendar(subscriptions, options);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a direct Google Calendar Web Link for a single subscription renewal.
 */
export function generateGoogleCalendarUrl(sub: Subscription): string {
  const dt = formatDateToIcs(sub.renewal_date);
  // All day event: dates=YYYYMMDD/YYYYMMDD
  const dates = `${dt}/${dt}`;

  const cancelUrl = resolveCancellationUrl(sub);
  const title = `💳 ${sub.name} Renews (${sub.currency} ${sub.current_price.toFixed(2)})`;
  const details = [
    `Subscription Sentinel Renewal Alert`,
    `Service: ${sub.name}`,
    `Cost: ${sub.currency} ${sub.current_price.toFixed(2)} / ${sub.billing_cycle}`,
    `Pricing URL: ${sub.pricing_url}`,
    cancelUrl ? `Direct Cancellation Flow: ${cancelUrl}` : '',
    `Audited by Subscription Sentinel`
  ].filter(Boolean).join('\n');

  const recurRule = sub.billing_cycle === 'YEARLY' ? 'RRULE:FREQ=YEARLY' : 'RRULE:FREQ=MONTHLY';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: details,
    recur: recurRule
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

