import React from 'react';
import { LayoutDashboard, Settings, LogOut, LogIn } from 'lucide-react';
import { User } from '../types/auth';
import { ScrapeRun } from '../types';

interface ExpandedMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  lastScrapeRun?: ScrapeRun;
  onOpenProfileSettings?: () => void;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
}

export const ExpandedMenuDrawer: React.FC<ExpandedMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  lastScrapeRun,
  onOpenProfileSettings,
  onLogout,
  onOpenAuthModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 shadow-tiny overflow-hidden font-mono text-xs animate-slide-fade-left flex flex-col justify-between">
      
      {/* 1. Operator Identity Header (Top) */}
      <div className="px-4 py-3 bg-white dark:bg-neutral-950 border-b border-black dark:border-neutral-700 flex-shrink-0">
        <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            {user ? 'OPERATOR SESSION' : 'GUEST SESSION'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            DAEMON ACTIVE
          </span>
        </div>
        <div className="font-bold text-neutral-900 dark:text-white truncate text-xs mt-1.5">
          {user ? user.email : 'sentinel-operator@example.com'}
        </div>
        {lastScrapeRun && (
          <div className="text-[10px] font-mono text-neutral-500 mt-1 flex items-center justify-between">
            <span>LAST RUN: {new Date(lastScrapeRun.finished_at).toLocaleTimeString()}</span>
            <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 font-bold">PROD</span>
          </div>
        )}
      </div>

      {/* 2. Menu Navigation Options (Middle, Flex-1) */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-start overflow-y-auto">
        <div className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-1">
          NAVIGATION
        </div>

        {/* 1. Dashboard Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-box bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 shadow-tiny transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Dashboard
              </div>
              <div className="text-[10px] font-mono text-neutral-500">
                Active metrics & subscriptions
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-400">→</span>
        </button>

        {/* 2. Profile Settings Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenProfileSettings?.();
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-box bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 shadow-tiny transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Profile Settings
              </div>
              <div className="text-[10px] font-mono text-neutral-500">
                Notifications & credentials
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-400">→</span>
        </button>
      </div>

      {/* 3. Sign Out at the Bottom */}
      <div className="px-4 py-3 bg-white dark:bg-neutral-950 border-t border-black dark:border-neutral-700 flex-shrink-0">
        {user ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-box bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white transition-colors shadow-tiny cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuthModal?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-box bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white transition-colors shadow-tiny cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>Sign In</span>
          </button>
        )}
      </div>

    </div>
  );
};

