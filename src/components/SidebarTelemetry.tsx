import React, { useState } from 'react';
import {
  Activity,
  Bell,
  CheckCircle2,
  XCircle,
  Mail,
  Play,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { ScrapeRun, NotificationLog } from '../types';

interface SidebarTelemetryProps {
  scrapeRuns: ScrapeRun[];
  notificationLogs: NotificationLog[];
  isBatchRunning: boolean;
  onTriggerBatch: () => void;
  onOpenLogsModal: () => void;
}

export const SidebarTelemetry: React.FC<SidebarTelemetryProps> = ({
  scrapeRuns,
  notificationLogs,
  isBatchRunning,
  onTriggerBatch,
  onOpenLogsModal
}) => {
  const [isScraperExpanded, setIsScraperExpanded] = useState(false);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);

  const lastRun = scrapeRuns[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-stretch min-h-0">
      
      {/* 1. Scheduled Scraper Runs Expandable Card */}
      <div className="rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 overflow-hidden shadow-tiny flex flex-col">
        {/* Clickable Header Button */}
        <button
          type="button"
          onClick={() => setIsScraperExpanded(!isScraperExpanded)}
          className="w-full px-4 h-[68px] flex items-center justify-between text-left hover:bg-gray-200/60 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none flex-shrink-0"
          aria-expanded={isScraperExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white truncate">
                  Price Check History
                </span>
                {lastRun && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 border border-black dark:border-neutral-700 font-bold flex-shrink-0">
                    {lastRun.succeeded} OK
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                {lastRun ? `Last checked: ${new Date(lastRun.started_at).toLocaleTimeString()}` : 'Scheduled Daily'}
              </p>
            </div>
          </div>

          <div className="p-1 rounded hover:bg-gray-300/60 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex-shrink-0 ml-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                isScraperExpanded ? 'transform rotate-180 text-black dark:text-white' : ''
              }`}
            />
          </div>
        </button>

        {/* Smooth Slide Expandable Body */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isScraperExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-3 bg-white dark:bg-neutral-950 border-t border-black dark:border-neutral-700 space-y-2.5 max-h-[180px] overflow-y-auto">
              
              {/* Trigger Batch Run action */}
              <div className="flex items-center justify-between pb-2.5 border-b border-black/10 dark:border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-500">
                  {scrapeRuns.length} recent executions logged
                </span>
                <button
                  type="button"
                  onClick={onTriggerBatch}
                  disabled={isBatchRunning}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-black dark:bg-white text-white dark:text-black border border-black text-xs font-mono font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3 h-3 ${isBatchRunning ? 'animate-spin' : ''}`} />
                  <span>{isBatchRunning ? 'Checking...' : 'Check All'}</span>
                </button>
              </div>

              {/* Scrape Runs Mini-List */}
              <div className="space-y-2">
                {scrapeRuns.slice(0, 4).map(run => (
                  <div
                    key={run.id}
                    className="p-2.5 rounded bg-gray-50 dark:bg-neutral-900 border border-black/20 dark:border-neutral-800 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-neutral-900 dark:text-white">Price Check</span>
                      <span className="text-neutral-500 font-normal text-[11px]">
                        {new Date(run.started_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {run.succeeded} OK
                        </span>
                        {run.failed > 0 && (
                          <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" />
                            {run.failed} fail
                          </span>
                        )}
                        <span className="text-neutral-400">({run.checked} total)</span>
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {run.alerts_sent > 0 ? `${run.alerts_sent} alerts` : '0 hikes'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Alert Feed Expandable Card */}
      <div className="rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 overflow-hidden shadow-tiny flex flex-col">
        {/* Clickable Header Button */}
        <button
          type="button"
          onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
          className="w-full px-4 h-[68px] flex items-center justify-between text-left hover:bg-gray-200/60 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none flex-shrink-0"
          aria-expanded={isAlertsExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white truncate">
                  Price Hike Alerts
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-black dark:border-neutral-700 font-bold flex-shrink-0">
                  {notificationLogs.length} alerts
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                Recent price change notifications
              </p>
            </div>
          </div>

          <div className="p-1 rounded hover:bg-gray-300/60 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex-shrink-0 ml-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                isAlertsExpanded ? 'transform rotate-180 text-black dark:text-white' : ''
              }`}
            />
          </div>
        </button>

        {/* Smooth Slide Expandable Body */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isAlertsExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-3 bg-white dark:bg-neutral-950 border-t border-black dark:border-neutral-700 space-y-2.5 max-h-[180px] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2.5 border-b border-black/10 dark:border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-500">
                  Recent price hike dispatches
                </span>
                <button
                  type="button"
                  onClick={onOpenLogsModal}
                  className="text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white underline flex items-center gap-1 font-medium"
                >
                  <span>Full Ledger</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Alert Feed Mini-List */}
              <div className="space-y-2">
                {notificationLogs.length === 0 ? (
                  <div className="py-4 text-center text-neutral-500 font-mono text-xs">
                    No price-hike alerts recorded yet.
                  </div>
                ) : (
                  notificationLogs.slice(0, 4).map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded bg-gray-50 dark:bg-neutral-900 border border-black/20 dark:border-neutral-800 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-neutral-900 dark:text-white truncate max-w-[160px]">
                          {log.subscription_name || `Sub #${log.subscription_id}`}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {log.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <div>
                          <span className="line-through">{log.currency} {log.old_price.toFixed(2)}</span>
                          <span className="font-bold text-red-600 dark:text-red-400 ml-1">
                            → {log.currency} {log.price.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] flex items-center gap-1 text-neutral-400">
                          <Mail className="w-2.5 h-2.5" />
                          EMAIL
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

