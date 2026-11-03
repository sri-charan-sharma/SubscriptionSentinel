import React, { useState } from 'react';
import {
  X,
  Calendar,
  Download,
  Bell,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Subscription } from '../types';
import { downloadIcsFile, generateGoogleCalendarUrl } from '../services/calendarService';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  subscriptions
}) => {
  const [include3DayAlarm, setInclude3DayAlarm] = useState(true);
  const [include1DayAlarm, setInclude1DayAlarm] = useState(true);
  const [asRecurring, setAsRecurring] = useState(true);

  if (!isOpen) return null;

  const activeSubs = subscriptions.filter(s => s.is_active);

  // Sort by nearest renewal date
  const sortedSubs = [...activeSubs].sort((a, b) =>
    new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
  );

  const handleDownloadAll = () => {
    const leadDays: number[] = [];
    if (include3DayAlarm) leadDays.push(3);
    if (include1DayAlarm) leadDays.push(1);

    downloadIcsFile(activeSubs, 'subscription-sentinel-renewals.ics', {
      includeAlarms: leadDays.length > 0,
      leadDays,
      asRecurring
    });
  };

  const handleDownloadSingle = (sub: Subscription) => {
    const leadDays: number[] = [];
    if (include3DayAlarm) leadDays.push(3);
    if (include1DayAlarm) leadDays.push(1);

    downloadIcsFile([sub], `${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-renewal.ics`, {
      includeAlarms: leadDays.length > 0,
      leadDays,
      asRecurring
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#16181d] border border-black dark:border-neutral-700 w-full max-w-2xl rounded-box shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-black dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Calendar Sync & Renewal Alarms (.ics)
              </h2>
              <p className="text-[11px] font-mono text-neutral-500">
                Sync billing cycles with Apple Calendar, Google Calendar, or Outlook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-box hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto font-mono text-xs">
          
          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 flex items-start gap-3">
            <Bell className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                RFC 5545 Standard iCalendar Export
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Downloaded <code className="px-1 py-0.5 rounded bg-white dark:bg-neutral-800 border border-black/20 dark:border-neutral-700">.ics</code> files include built-in push alarms and direct 1-click cancellation links inside event descriptions so you can act before billing cycles close.
              </p>
            </div>
          </div>

          {/* Alarm Configuration Controls */}
          <div className="p-4 rounded-box bg-white dark:bg-neutral-950 border border-black dark:border-neutral-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Alarm & Recurrence Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 transition-colors">
                <input
                  type="checkbox"
                  checked={include3DayAlarm}
                  onChange={e => setInclude3DayAlarm(e.target.checked)}
                  className="rounded text-black focus:ring-0"
                />
                <span className="text-neutral-800 dark:text-neutral-200 text-xs">3 Days Notice</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 transition-colors">
                <input
                  type="checkbox"
                  checked={include1DayAlarm}
                  onChange={e => setInclude1DayAlarm(e.target.checked)}
                  className="rounded text-black focus:ring-0"
                />
                <span className="text-neutral-800 dark:text-neutral-200 text-xs">24h Alert</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 transition-colors">
                <input
                  type="checkbox"
                  checked={asRecurring}
                  onChange={e => setAsRecurring(e.target.checked)}
                  className="rounded text-black focus:ring-0"
                />
                <span className="text-neutral-800 dark:text-neutral-200 text-xs">Repeat (RRULE)</span>
              </label>
            </div>
          </div>

          {/* Bulk Download Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-box bg-black dark:bg-white text-white dark:text-black">
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">
                Full Vault Export ({activeSubs.length} Subscriptions)
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Download a unified calendar with all active renewal dates
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="w-full sm:w-auto px-4 py-2 rounded-box bg-white dark:bg-black text-black dark:text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ics</span>
            </button>
          </div>

          {/* Individual Subscriptions Quick-Sync List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Individual Service Sync
              </span>
              <span className="text-[10px] text-neutral-400">
                Sorted by nearest renewal
              </span>
            </div>

            <div className="border border-black dark:border-neutral-800 rounded-box overflow-hidden divide-y divide-black/10 dark:divide-neutral-800">
              {sortedSubs.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  No active subscriptions found.
                </div>
              ) : (
                sortedSubs.map(sub => {
                  const gcalUrl = generateGoogleCalendarUrl(sub);
                  const isUpcoming = (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const renewal = new Date(sub.renewal_date);
                    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                  })();

                  return (
                    <div
                      key={sub.id}
                      className="p-3 bg-white dark:bg-neutral-900/40 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white text-xs truncate">
                            {sub.name}
                          </span>
                          {isUpcoming && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 dark:bg-amber-300 text-black uppercase">
                              Soon
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {sub.currency} {sub.current_price.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {sub.renewal_date} ({sub.billing_cycle})
                          </span>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Direct Google Calendar 1-Click Link */}
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-black/20 dark:border-neutral-700 text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                          title="Add directly to Google Calendar web interface"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>

                        {/* Download Single .ics */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(sub)}
                          className="px-2.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-black/20 dark:border-neutral-700 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Download individual .ics file"
                        >
                          <Download className="w-3 h-3" />
                          <span>.ics</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 flex items-center justify-between font-mono text-xs">
          <div className="text-neutral-500 text-[11px]">
            Compatible with Google, Apple, Microsoft 365, Nextcloud
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-box bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
