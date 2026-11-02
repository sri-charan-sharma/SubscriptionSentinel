import React, { useState } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Subscription, ScrapeStatus } from '../types';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  checkingSubId: number | null;
  onCheckNow: (id: number) => void;
  onSimulateHike: (sub: Subscription) => void;
  onOpenHistory: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
}

const statusBadgeConfig: Record<ScrapeStatus, { label: string; text: string; icon: any }> = {
  OK: {
    label: 'OK',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2
  },
  BLOCKED: {
    label: 'BLOCKED (403)',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle
  },
  TIMEOUT: {
    label: 'TIMEOUT',
    text: 'text-amber-600 dark:text-amber-400',
    icon: Clock
  },
  SELECTOR_NOT_FOUND: {
    label: 'SELECTOR MISSING',
    text: 'text-orange-600 dark:text-orange-400',
    icon: XCircle
  },
  PARSE_ERROR: {
    label: 'PARSE ERROR',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle
  }
};

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  checkingSubId,
  onCheckNow,
  onSimulateHike,
  onOpenHistory,
  onEdit,
  onDelete
}) => {
  // Set of currently expanded subscription IDs for smooth slide-out details
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isUpcoming = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(dateStr);
    renewal.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 overflow-hidden shadow-tiny">
      
      {/* Table Header / Toolbar */}
      <div className="px-5 py-4 border-b border-black dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-neutral-950">
        <div>
          <h2 className="text-base font-bold font-mono text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Subscriptions</span>
            <span className="text-xs font-normal text-neutral-500">
              ({subscriptions.length} active)
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
            Automated price-hike checks with DOM scraping & SSRF protection
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
          <span className="font-semibold">LIVE AUDIT</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <th className="py-3 px-3 w-12 text-center">
                <span className="sr-only">Expand</span>
              </th>
              <th className="py-3 px-4">Service & Category</th>
              <th className="py-3 px-4">Price & Cycle</th>
              <th className="py-3 px-4">Next Renewal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-neutral-800 text-xs font-mono bg-white dark:bg-neutral-950">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono text-sm">
                  No active subscriptions found. Click "NEW SUB" to add one.
                </td>
              </tr>
            ) : (
              subscriptions.map(sub => {
                const statusCfg = sub.last_scrape_status ? statusBadgeConfig[sub.last_scrape_status] : null;
                const needsAttention = sub.consecutive_failures >= 5;
                const upcoming = isUpcoming(sub.renewal_date);
                const isChecking = checkingSubId === sub.id;
                const isExpanded = expandedIds.has(sub.id);

                return (
                  <React.Fragment key={sub.id}>
                    {/* Primary Row */}
                    <tr
                      className={`hover:bg-gray-50 dark:hover:bg-neutral-900/60 transition-colors ${
                        needsAttention ? 'bg-red-50/60 dark:bg-red-950/20' : ''
                      } ${isExpanded ? 'bg-gray-50/80 dark:bg-neutral-900/40' : ''}`}
                    >
                      {/* Down Arrow Expand Button */}
                      <td className="py-4 px-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpand(sub.id)}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus:outline-none"
                          title={isExpanded ? "Collapse details" : "Expand details"}
                          aria-expanded={isExpanded}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                              isExpanded ? 'transform rotate-180 text-black dark:text-white' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* 1. Name & Category */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(sub.id)}
                              className="font-bold text-neutral-900 dark:text-white text-base font-sans hover:underline text-left focus:outline-none"
                            >
                              {sub.name}
                            </button>
                            {needsAttention && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wide bg-red-600 text-white shadow-sm">
                                <AlertOctagon className="w-3.5 h-3.5" />
                                NEEDS ATTENTION ({sub.consecutive_failures} fails)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-black dark:border-neutral-700 font-semibold">
                              {sub.category}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              • ID #{sub.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Price & Cycle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-neutral-900 dark:text-white font-bold text-base">
                            {sub.currency} {sub.current_price.toFixed(2)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {sub.billing_cycle === 'MONTHLY' ? 'per month' : 'per year'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Renewal Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${upcoming ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                            {sub.renewal_date}
                          </span>
                          {upcoming && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider bg-amber-400 dark:bg-amber-300 text-neutral-950 shadow-sm">
                              <Clock className="w-2.5 h-2.5" />
                              SOON
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Scrape Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {statusCfg ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 w-fit ${statusCfg.text}`}>
                              <statusCfg.icon className="w-3.5 h-3.5" />
                              {statusCfg.label}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleTimeString() : 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-xs">Pending</span>
                        )}
                      </td>

                      {/* 5. Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Check Now */}
                          <button
                            onClick={() => onCheckNow(sub.id)}
                            disabled={isChecking}
                            className="px-3 py-1.5 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-black dark:border-neutral-700 text-xs font-mono font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            title="Trigger immediate check"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                            <span>{isChecking ? 'Checking...' : 'Check'}</span>
                          </button>

                          {/* Test Simulate Price Hike or Error */}
                          <button
                            onClick={() => onSimulateHike(sub)}
                            className="p-2 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-black dark:border-neutral-700 text-xs transition-colors"
                            title="Simulate price hike or scrape error"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* Price History */}
                          <button
                            onClick={() => onOpenHistory(sub)}
                            className="p-2 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-black dark:border-neutral-700 text-xs transition-colors"
                            title="View price history chart"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(sub)}
                            className="p-2 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-black dark:border-neutral-700 text-xs transition-colors"
                            title="Edit subscription"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDelete(sub.id)}
                            className="p-2 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-950 text-neutral-700 dark:text-neutral-300 hover:text-red-600 border border-black dark:border-neutral-700 text-xs transition-colors"
                            title="Soft delete subscription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>

                    {/* Smooth Slide Expandable Details Row */}
                    <tr>
                      <td colSpan={6} className="p-0 border-0">
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-6 py-5 bg-gray-100 dark:bg-neutral-900 border-t border-b border-black dark:border-neutral-700">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                
                                {/* Box 1: Scraped Match or Error Diagnostics */}
                                <div className="p-4 bg-white dark:bg-neutral-950 rounded-box border border-black dark:border-neutral-700 shadow-micro flex flex-col justify-between">
                                  <div>
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-2">
                                      DOM Scraping Diagnostics
                                    </span>
                                    {sub.last_scrape_status === 'OK' && sub.last_raw_match ? (
                                      <div className="p-2.5 rounded bg-gray-50 dark:bg-neutral-900 border border-black/20 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-white">
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mb-1">MATCHED TEXT:</span>
                                        "{sub.last_raw_match}"
                                      </div>
                                    ) : sub.last_scrape_error ? (
                                      <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 text-xs font-mono text-red-600 dark:text-red-400">
                                        <span className="text-[10px] font-bold block mb-1">FAILURE REASON:</span>
                                        {sub.last_scrape_error}
                                      </div>
                                    ) : (
                                      <div className="text-xs font-mono text-neutral-400 py-1">
                                        Pending initial scrape run.
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-mono text-neutral-500 mt-2.5">
                                    Last checked: {sub.last_checked_at ? new Date(sub.last_checked_at).toLocaleString() : 'Never'}
                                  </div>
                                </div>

                                {/* Box 2: Target URL & CSS Selector */}
                                <div className="p-4 bg-white dark:bg-neutral-950 rounded-box border border-black dark:border-neutral-700 shadow-micro space-y-2.5">
                                  <div>
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                                      Pricing Target URL
                                    </span>
                                    <a
                                      href={sub.pricing_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-mono text-neutral-900 dark:text-white underline hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 truncate"
                                      title={sub.pricing_url}
                                    >
                                      <span className="truncate">{sub.pricing_url}</span>
                                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                    </a>
                                  </div>

                                  <div>
                                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                                      Configured CSS Selector (Jsoup)
                                    </span>
                                    <code className="text-xs font-mono px-2.5 py-1 rounded bg-gray-50 dark:bg-neutral-900 border border-black/20 dark:border-neutral-800 block truncate text-neutral-800 dark:text-neutral-200">
                                      {sub.price_selector || 'Auto-detect (.price, [data-price])'}
                                    </code>
                                  </div>
                                </div>

                                {/* Box 3: Resilience & Alert Metadata */}
                                <div className="p-4 bg-white dark:bg-neutral-950 rounded-box border border-black dark:border-neutral-700 shadow-micro space-y-2.5">
                                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                                    Sentinel Resilience Status
                                  </span>

                                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                                    <span className="text-neutral-500">Consecutive Failures:</span>
                                    <span className={`font-bold ${sub.consecutive_failures >= 5 ? 'text-red-600' : 'text-neutral-900 dark:text-white'}`}>
                                      {sub.consecutive_failures} / 5 max
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-neutral-500">Last Alerted Price:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">
                                      {sub.last_alerted_price ? `${sub.currency} ${sub.last_alerted_price.toFixed(2)}` : 'No alert sent'}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-neutral-500">Tracking Since:</span>
                                    <span className="text-neutral-700 dark:text-neutral-300">
                                      {new Date(sub.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
