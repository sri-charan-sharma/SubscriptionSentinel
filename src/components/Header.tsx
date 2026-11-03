import React from 'react';
import {
  Menu,
  Play,
  Plus,
  RotateCcw,
  Sun,
  Moon,
  Shield,
  PieChart as PieIcon,
  Calendar,
  Skull,
  Search
} from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isBatchRunning: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onTriggerBatch: () => void;
  onOpenAddModal: () => void;
  onOpenCategoryChart?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenBudgetZombieModal?: () => void;
  zombieCount?: number;
  onResetDemoData: () => void;
  onNavigateToLanding?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  isBatchRunning,
  isMenuOpen = false,
  onToggleMenu,
  onTriggerBatch,
  onOpenAddModal,
  onOpenCategoryChart,
  onOpenCalendarModal,
  onOpenBudgetZombieModal,
  zombieCount = 0,
  onResetDemoData,
  onNavigateToLanding,
  onOpenCommandPalette
}) => {
  return (
    <header className="border-b border-black dark:border-neutral-800 bg-white dark:bg-[#16181d] sticky top-0 z-40 flex-shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between gap-4">
        
        {/* Left: 3-Liner Menu Button & Brand Link */}
        <div className="flex items-center gap-3">
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

          {onNavigateToLanding && (
            <button
              type="button"
              onClick={onNavigateToLanding}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-box bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              title="Return to Landing Page"
            >
              <Shield className="w-4 h-4" />
              <span>SUBSENT</span>
            </button>
          )}

          {/* Quick Command Palette Launcher */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-box bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono text-neutral-500 dark:text-neutral-400 transition-colors shadow-tiny cursor-pointer"
              title="Open Command Palette (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Search or command...</span>
              <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-300 dark:border-neutral-600 font-bold">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Center/Right: Action & Observability Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Spending Breakdown Chart Modal */}
          {onOpenCategoryChart && (
            <button
              onClick={onOpenCategoryChart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors cursor-pointer"
              title="View spending by category breakdown chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Spend Chart</span>
            </button>
          )}

          {/* Calendar Sync & Renewal Alerts (.ics) */}
          {onOpenCalendarModal && (
            <button
              onClick={onOpenCalendarModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors cursor-pointer"
              title="Export and sync renewal alarms with Apple/Google Calendar (.ics)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          )}

          {/* Zombie Alert Button */}
          {onOpenBudgetZombieModal && zombieCount > 0 && (
            <button
              onClick={onOpenBudgetZombieModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-box bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900 border border-red-500 text-red-700 dark:text-red-300 text-xs font-mono font-bold transition-colors cursor-pointer shadow-tiny"
              title={`${zombieCount} unreviewed zombie subscriptions detected! Click to audit.`}
            >
              <Skull className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
              <span>{zombieCount} Zombie</span>
            </button>
          )}

          {/* Trigger Scheduled Batch Scrape */}
          <button
            onClick={onTriggerBatch}
            disabled={isBatchRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Check all subscription prices right now"
          >
            <Play className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
            <span>{isBatchRunning ? 'Checking...' : 'Check All'}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors cursor-pointer"
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border border-black dark:border-white text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Add a new subscription to monitor"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemoData}
            className="p-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Reset to default prototype data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
