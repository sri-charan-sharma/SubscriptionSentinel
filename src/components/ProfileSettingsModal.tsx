import React from 'react';
import { X, User as UserIcon, Send, ArrowRightLeft, CheckCircle2, Webhook } from 'lucide-react';
import { User } from '../types/auth';
import { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../services/currencyService';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  baseCurrency: CurrencyCode;
  onOpenCurrencyModal?: () => void;
  onOpenTelegramModal?: () => void;
  onOpenWebhookModal?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  baseCurrency,
  onOpenCurrencyModal,
  onOpenTelegramModal,
  onOpenWebhookModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-md rounded-box shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase">
                Profile & Settings
              </h3>
              <p className="text-[11px] text-neutral-500">
                Account configuration and connected services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-white dark:bg-neutral-900">
          
          {/* Account Overview Card */}
          <div className="p-4 rounded bg-gray-50 dark:bg-neutral-800/60 border border-black dark:border-neutral-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 uppercase font-bold">User Identity</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
                {user?.role || 'ROLE_USER'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm uppercase">
                {user ? user.email.slice(0, 2) : 'OP'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-neutral-900 dark:text-white block truncate text-sm">
                  {user ? user.email : 'sentinel-operator@example.com'}
                </span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Authenticated via JWT</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings Integrations */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-neutral-500 block">
              Preferences & Integrations
            </span>

            {/* Currency Preference */}
            <div className="p-3 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Base Currency
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Active: {baseCurrency} ({CURRENCY_SYMBOLS[baseCurrency]})
                  </span>
                </div>
              </div>
              {onOpenCurrencyModal && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenCurrencyModal(); }}
                  className="px-2.5 py-1 rounded border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 hover:bg-gray-100 font-bold text-[11px] transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            {/* Telegram Alerts */}
            <div className="p-3 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Telegram Alerts
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Push notification channel
                  </span>
                </div>
              </div>
              {onOpenTelegramModal && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenTelegramModal(); }}
                  className="px-2.5 py-1 rounded border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 hover:bg-gray-100 font-bold text-[11px] transition-colors"
                >
                  Configure
                </button>
              )}
            </div>

            {/* Discord & Slack Webhooks */}
            <div className="p-3 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Discord & Slack Webhooks
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Team notifications & alerts
                  </span>
                </div>
              </div>
              {onOpenWebhookModal && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenWebhookModal(); }}
                  className="px-2.5 py-1 rounded border border-black dark:border-neutral-600 bg-white dark:bg-neutral-900 hover:bg-gray-100 font-bold text-[11px] transition-colors"
                >
                  Configure
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/10 dark:border-neutral-800 flex justify-end bg-gray-50 dark:bg-neutral-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-black bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
