import React, { useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Home,
  Settings,
  Bell,
  Send,
  ArrowRightLeft,
  LogOut,
  LogIn,
  Shield,
  User as UserIcon,
  Calendar,
  Gauge,
  Skull,
  Webhook
} from 'lucide-react';
import { User } from '../types/auth';
import { ScrapeRun } from '../types';

interface ExpandedMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  lastScrapeRun?: ScrapeRun;
  zombieCount?: number;
  onNavigateToLanding?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenTelegramModal?: () => void;
  onOpenWebhookModal?: () => void;
  onOpenCurrencyModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenBudgetZombieModal?: () => void;
  onOpenLogsModal?: () => void;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
}

export const ExpandedMenuDrawer: React.FC<ExpandedMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  lastScrapeRun,
  zombieCount = 0,
  onNavigateToLanding,
  onOpenProfileSettings,
  onOpenTelegramModal,
  onOpenWebhookModal,
  onOpenCurrencyModal,
  onOpenCalendarModal,
  onOpenBudgetZombieModal,
  onOpenLogsModal,
  onLogout,
  onOpenAuthModal
}) => {
  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 1. Backdrop Overlay (GitHub-style dimming) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* 2. Slide-out Navigation Drawer (GitHub-style full-height left drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#16181d] border-r border-black dark:border-neutral-800 shadow-2xl flex flex-col justify-between font-mono text-xs transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation Drawer"
      >
        {/* Top Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Header: Logo & Close Button (matches GitHub top-left bar) */}
          <div className="px-4 py-3.5 border-b border-black dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/50 flex-shrink-0">
            <div className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold tracking-wider">
              <div className="w-7 h-7 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider">Subscription Sentinel</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-box hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all duration-200 ease-in-out cursor-pointer"
              title="Close menu"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Session Profile Card */}
          <div className="p-3 border-b border-black/10 dark:border-neutral-800 bg-white dark:bg-[#16181d] flex-shrink-0">
            <div className="flex items-center gap-2.5 p-2.5 rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700">
              <div className="w-8 h-8 rounded-box bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold border border-black/10 dark:border-neutral-700 flex-shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider truncate">
                    {user ? 'Account' : 'Guest'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Monitor Active
                  </span>
                </div>
                <div className="font-bold text-neutral-900 dark:text-white truncate text-xs mt-0.5">
                  {user ? user.email : 'sentinel-operator@example.com'}
                </div>
              </div>
            </div>
            {lastScrapeRun && (
              <div className="text-[10px] font-mono text-neutral-500 mt-2 px-1 flex items-center justify-between">
                <span>Last checked: {new Date(lastScrapeRun.finished_at).toLocaleTimeString()}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">All services OK</span>
              </div>
            )}
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1 flex-1">
            <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-2 py-1">
              Navigation
            </div>

            {/* 0. Landing Page */}
            {onNavigateToLanding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToLanding();
                }}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
              >
                <Home className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
                <span>Landing Page</span>
              </button>
            )}

            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => {
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <LayoutDashboard className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* 2. Profile Settings */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfileSettings?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Profile Settings</span>
            </button>

            {/* 3. Telegram Alerts */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTelegramModal?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <Send className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Telegram Alerts</span>
            </button>

            {/* 4. Discord & Slack Webhooks */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWebhookModal?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <Webhook className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Webhooks (Discord & Slack)</span>
            </button>

            {/* 5. Currency Converter */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCurrencyModal?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <ArrowRightLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Currency Converter</span>
            </button>

            {/* 6. Budget & Zombie Hunter */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBudgetZombieModal?.();
              }}
              className="group w-full flex items-center justify-between px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
                <span>Spend Cap & Zombies</span>
              </div>
              {zombieCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white flex items-center gap-0.5">
                  <Skull className="w-2.5 h-2.5" />
                  {zombieCount}
                </span>
              )}
            </button>

            {/* 7. Calendar Sync (.ics) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCalendarModal?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Calendar Sync (.ics)</span>
            </button>

            {/* 7. Alert Logs */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogsModal?.();
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-bold uppercase tracking-wider text-left transition-all duration-200 ease-in-out cursor-pointer text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            >
              <Bell className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200 flex-shrink-0" />
              <span>Alert Logs</span>
            </button>
          </nav>
        </div>

        {/* Bottom Pinned Footer: Sign Out / Sign In */}
        <div className="p-3 border-t border-black/10 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 flex-shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="group w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white font-bold uppercase tracking-wider transition-all duration-200 ease-in-out cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal?.();
              }}
              className="group w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-box bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white font-bold uppercase tracking-wider transition-all duration-200 ease-in-out cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-200" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
