import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  RefreshCw,
  Plus,
  Skull,
  PieChart,
  Calendar,
  Send,
  Moon,
  Ban,
  Camera,
  TrendingUp,
  Edit2,
  DollarSign,
  Webhook
} from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';
import { resolveCancellationUrl } from '../services/popularPresets';

export interface CommandPaletteAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'ACTIONS' | 'SUBSCRIPTIONS' | 'NAVIGATION';
  icon: any;
  shortcut?: string;
  perform: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  baseCurrency?: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenCategoryChart: () => void;
  onOpenCalendarModal: () => void;
  onOpenBudgetZombieModal: () => void;
  onOpenTelegramModal: () => void;
  onOpenWebhookModal: () => void;
  onOpenCurrencyModal: () => void;
  onTriggerBatch: () => void;
  onToggleTheme: () => void;
  onCheckSub: (id: number) => void;
  onOpenHistory: (sub: Subscription) => void;
  onOpenDomInspector: (sub: Subscription) => void;
  onEditSub: (sub: Subscription) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  baseCurrency = 'USD',
  onOpenAddModal,
  onOpenCategoryChart,
  onOpenCalendarModal,
  onOpenBudgetZombieModal,
  onOpenTelegramModal,
  onOpenWebhookModal,
  onOpenCurrencyModal,
  onTriggerBatch,
  onToggleTheme,
  onCheckSub,
  onOpenHistory,
  onOpenDomInspector,
  onEditSub
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global static system actions
  const systemActions: CommandPaletteAction[] = useMemo(() => [
    {
      id: 'act-check-all',
      title: 'Check All Prices Now',
      subtitle: 'Trigger batch scraping daemon across all active services',
      category: 'ACTIONS',
      icon: RefreshCw,
      shortcut: '↵',
      perform: () => { onClose(); onTriggerBatch(); }
    },
    {
      id: 'act-add-sub',
      title: 'Add New Subscription',
      subtitle: 'Monitor a new vendor or pick from 12 popular presets',
      category: 'ACTIONS',
      icon: Plus,
      perform: () => { onClose(); onOpenAddModal(); }
    },
    {
      id: 'act-zombies',
      title: 'Zombie Subscription Hunter',
      subtitle: 'Audit long-running unreviewed vampire subscriptions',
      category: 'ACTIONS',
      icon: Skull,
      perform: () => { onClose(); onOpenBudgetZombieModal(); }
    },
    {
      id: 'act-webhooks',
      title: 'Discord & Slack Webhooks',
      subtitle: 'Dispatch live rich embedded alert cards to team channels',
      category: 'ACTIONS',
      icon: Webhook,
      perform: () => { onClose(); onOpenWebhookModal(); }
    },
    {
      id: 'act-calendar',
      title: 'Export Calendar & Alarms (.ics)',
      subtitle: 'Sync renewal dates with Apple, Google, or Outlook',
      category: 'ACTIONS',
      icon: Calendar,
      perform: () => { onClose(); onOpenCalendarModal(); }
    },
    {
      id: 'act-spend-chart',
      title: 'View Category Spending Chart',
      subtitle: 'Inspect visual distribution across Streaming, Cloud, Software',
      category: 'ACTIONS',
      icon: PieChart,
      perform: () => { onClose(); onOpenCategoryChart(); }
    },
    {
      id: 'act-currency',
      title: 'Currency Converter & FX Rates',
      subtitle: `Switch base conversion currency (current: ${baseCurrency})`,
      category: 'ACTIONS',
      icon: DollarSign,
      perform: () => { onClose(); onOpenCurrencyModal(); }
    },
    {
      id: 'act-telegram',
      title: 'Telegram Alert Bot Settings',
      subtitle: 'Configure real-time mobile push dispatch via Telegram',
      category: 'ACTIONS',
      icon: Send,
      perform: () => { onClose(); onOpenTelegramModal(); }
    },
    {
      id: 'act-theme',
      title: 'Toggle Light / Dark Mode',
      subtitle: 'Switch application color theme',
      category: 'ACTIONS',
      icon: Moon,
      perform: () => { onClose(); onToggleTheme(); }
    }
  ], [baseCurrency, onClose, onTriggerBatch, onOpenAddModal, onOpenBudgetZombieModal, onOpenWebhookModal, onOpenCalendarModal, onOpenCategoryChart, onOpenCurrencyModal, onOpenTelegramModal, onToggleTheme]);

  // Subscription-based actions
  const subscriptionActions: CommandPaletteAction[] = useMemo(() => {
    return subscriptions
      .filter(s => s.is_active)
      .map(sub => {
        const cancelUrl = resolveCancellationUrl(sub);
        return {
          id: `sub-${sub.id}`,
          title: `${sub.name} (${sub.currency} ${sub.current_price.toFixed(2)} / ${sub.billing_cycle.toLowerCase()})`,
          subtitle: `Selector: ${sub.price_selector || 'Auto'}${cancelUrl ? ' • Direct Cancel Link Ready' : ''} • Category: ${sub.category}`,
          category: 'SUBSCRIPTIONS' as const,
          icon: sub.last_scrape_status === 'OK' ? ArrowRight : AlertTriangleIcon,
          perform: () => {
            onClose();
            onOpenDomInspector(sub);
          }
        };
      });
  }, [subscriptions, onClose, onOpenDomInspector]);

  // Filtered list based on search query
  const filteredActions = useMemo(() => {
    if (!query.trim()) {
      return [...systemActions, ...subscriptionActions];
    }
    const q = query.toLowerCase();
    const matchesSys = systemActions.filter(a =>
      a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );
    const matchesSubs = subscriptions
      .filter(s => s.is_active && (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.pricing_url.toLowerCase().includes(q)
      ))
      .flatMap(sub => {
        const cancelUrl = resolveCancellationUrl(sub);
        const actions: CommandPaletteAction[] = [
          {
            id: `sub-check-${sub.id}`,
            title: `Check Price: ${sub.name}`,
            subtitle: `Scrape ${sub.pricing_url} immediately`,
            category: 'SUBSCRIPTIONS',
            icon: RefreshCw,
            perform: () => { onClose(); onCheckSub(sub.id); }
          },
          {
            id: `sub-dom-${sub.id}`,
            title: `Inspect DOM Snapshot: ${sub.name}`,
            subtitle: 'View rendered browser frame & test CSS selectors',
            category: 'SUBSCRIPTIONS',
            icon: Camera,
            perform: () => { onClose(); onOpenDomInspector(sub); }
          },
          {
            id: `sub-hist-${sub.id}`,
            title: `Price History: ${sub.name}`,
            subtitle: 'Open price trajectory chart',
            category: 'SUBSCRIPTIONS',
            icon: TrendingUp,
            perform: () => { onClose(); onOpenHistory(sub); }
          },
          {
            id: `sub-edit-${sub.id}`,
            title: `Edit: ${sub.name}`,
            subtitle: 'Modify subscription metadata or renewal date',
            category: 'SUBSCRIPTIONS',
            icon: Edit2,
            perform: () => { onClose(); onEditSub(sub); }
          }
        ];

        if (cancelUrl) {
          actions.push({
            id: `sub-cancel-${sub.id}`,
            title: `Bust Dark Pattern: Cancel ${sub.name}`,
            subtitle: `Open official 1-click cancellation page (${cancelUrl})`,
            category: 'SUBSCRIPTIONS',
            icon: Ban,
            perform: () => {
              onClose();
              window.open(cancelUrl, '_blank', 'noopener,noreferrer');
            }
          });
        }

        return actions;
      });

    return [...matchesSys, ...matchesSubs];
  }, [query, systemActions, subscriptionActions, subscriptions, onClose, onCheckSub, onOpenDomInspector, onOpenHistory, onEditSub]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredActions]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/65 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#16181d] border-2 border-black dark:border-neutral-700 w-full max-w-2xl rounded-box shadow-2xl overflow-hidden flex flex-col font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-black dark:border-neutral-800 flex items-center gap-3 bg-gray-50 dark:bg-neutral-900/60">
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search subscriptions... (e.g. 'check', 'netflix', 'cancel')"
            className="flex-1 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 text-xs font-mono focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[10px] text-neutral-400 hover:text-black dark:hover:text-white px-1.5 py-0.5 rounded border border-black/10 dark:border-neutral-700"
            >
              Clear
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-black/5 dark:divide-neutral-800/60 p-2">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              No matching commands or subscriptions found for "{query}".
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = action.icon;

              return (
                <div
                  key={action.id}
                  onClick={() => action.perform()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-box flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded ${
                      isSelected
                        ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                        : 'bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">
                        {action.title}
                      </div>
                      {action.subtitle && (
                        <div className={`text-[10px] truncate ${
                          isSelected ? 'opacity-80' : 'text-neutral-500'
                        }`}>
                          {action.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                        : 'bg-gray-200 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      {action.category}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold">↵</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 border-t border-black/10 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/40 flex items-center justify-between text-[10px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span><strong className="text-black dark:text-white font-bold">↑↓</strong> Navigate</span>
            <span><strong className="text-black dark:text-white font-bold">↵</strong> Execute</span>
            <span><strong className="text-black dark:text-white font-bold">ESC</strong> Close</span>
          </div>
          <div>Subscription Sentinel Command Bar</div>
        </div>

      </div>
    </div>
  );
};

// Simple helper icon for subscriptions in warning state
const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
