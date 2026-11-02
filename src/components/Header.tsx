import React from 'react';
import {
  ShieldAlert,
  Activity,
  Play,
  Plus,
  Bell,
  Cpu,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { ScrapeRun } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  scrapeSuccessRate: number;
  lastScrapeRun?: ScrapeRun;
  isBatchRunning: boolean;
  onTriggerBatch: () => void;
  onOpenAddModal: () => void;
  onOpenLogsModal: () => void;
  onOpenSsrfInspector: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  scrapeSuccessRate,
  lastScrapeRun,
  isBatchRunning,
  onTriggerBatch,
  onOpenAddModal,
  onOpenLogsModal,
  onOpenSsrfInspector,
  onResetDemoData
}) => {
  return (
    <header className="border-b border-black dark:border-neutral-800 bg-white dark:bg-[#16181d] sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white font-mono uppercase">
                Subscription Sentinel
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>DAEMON ACTIVE</span>
              <span>•</span>
              <span>{lastScrapeRun ? `LAST RUN: ${new Date(lastScrapeRun.finished_at).toLocaleTimeString()}` : 'SHEDLOCK READY'}</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Observability & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* 30-Day Scrape Success Rate Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            <span className="text-neutral-600 dark:text-neutral-400">30D SUCCESS:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {scrapeSuccessRate.toFixed(1)}%
            </span>
          </div>

          {/* SSRF Security Inspector */}
          <button
            onClick={onOpenSsrfInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
            title="Inspect SSRF and URL validation protections"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SSRF Guard</span>
          </button>

          {/* Deduplicated Notification Logs */}
          <button
            onClick={onOpenLogsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
            title="View idempotent notification delivery log"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert Logs</span>
          </button>

          {/* Trigger Scheduled Batch Scrape */}
          <button
            onClick={onTriggerBatch}
            disabled={isBatchRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors disabled:opacity-50"
            title="Trigger scheduled batch run now"
          >
            <Play className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
            <span>{isBatchRunning ? 'RUNNING...' : 'RUN BATCH'}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-neutral-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Add Subscription Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border border-black dark:border-white text-xs font-mono font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW SUB</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemoData}
            className="p-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Reset to default prototype data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
