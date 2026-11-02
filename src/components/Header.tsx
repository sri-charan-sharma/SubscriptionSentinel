import React from 'react';
import {
  Menu,
  Play,
  Plus,
  Bell,
  RotateCcw,
  Sun,
  Moon,
  PieChart as PieIcon,
  Send,
  ArrowRightLeft
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../services/currencyService';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isBatchRunning: boolean;
  baseCurrency?: CurrencyCode;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onOpenCurrencyModal?: () => void;
  onTriggerBatch: () => void;
  onOpenAddModal: () => void;
  onOpenLogsModal: () => void;
  onOpenCategoryChart?: () => void;
  onOpenTelegramModal?: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  isBatchRunning,
  baseCurrency = 'INR',
  isMenuOpen = false,
  onToggleMenu,
  onOpenCurrencyModal,
  onTriggerBatch,
  onOpenAddModal,
  onOpenLogsModal,
  onOpenCategoryChart,
  onOpenTelegramModal,
  onResetDemoData
}) => {
  return (
    <header className="border-b border-black dark:border-neutral-800 bg-white dark:bg-[#16181d] sticky top-0 z-40 flex-shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between gap-4">
        
        {/* Left: 3-Liner Menu Button */}
        <div>
          <button
            type="button"
            onClick={onToggleMenu}
            className="w-9 h-9 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 flex items-center justify-center transition-colors shadow-tiny cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
          </button>
        </div>

        {/* Center/Right: Action & Observability Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Deduplicated Notification Logs */}
          <button
            onClick={onOpenLogsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
            title="View idempotent notification delivery log"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert Logs</span>
          </button>

          {/* Spending Breakdown Chart Modal */}
          {onOpenCategoryChart && (
            <button
              onClick={onOpenCategoryChart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
              title="View spending by category breakdown chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Category Chart</span>
            </button>
          )}

          {/* Telegram Bot Alerts */}
          {onOpenTelegramModal && (
            <button
              onClick={onOpenTelegramModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
              title="Configure and test Telegram push alerts"
            >
              <Send className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Telegram</span>
            </button>
          )}

          {/* Currency Conversion Engine */}
          {onOpenCurrencyModal && (
            <button
              onClick={onOpenCurrencyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
              title="Currency Conversion Engine & Rates"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{baseCurrency} ({CURRENCY_SYMBOLS[baseCurrency]})</span>
            </button>
          )}

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
