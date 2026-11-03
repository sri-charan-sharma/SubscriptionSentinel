import React from 'react';
import { Flame, Calendar, Layers, AlertTriangle, ArrowRightLeft, Skull } from 'lucide-react';
import { DashboardMetrics, CurrencyCode } from '../types';
import { currencyService, CURRENCY_SYMBOLS } from '../services/currencyService';

interface MetricCardsProps {
  metrics: DashboardMetrics;
  baseCurrency?: CurrencyCode;
  isUnifiedMode?: boolean;
  spendCap?: number | null;
  zombieCount?: number;
  onOpenCurrencyModal?: () => void;
  onOpenBudgetZombieModal?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  baseCurrency = 'INR',
  isUnifiedMode = true,
  spendCap,
  zombieCount = 0,
  onOpenCurrencyModal,
  onOpenBudgetZombieModal
}) => {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR'];
  const activeCurrencies = currencies.filter(c => (metrics.monthlyBurn[c] || 0) > 0);
  const primaryCurrency = activeCurrencies.length > 0 ? activeCurrencies[0] : 'USD';

  // Calculate unified totals across all currencies if unified mode is active
  let unifiedMonthly = 0;
  let unifiedYearly = 0;
  if (isUnifiedMode) {
    currencies.forEach(c => {
      unifiedMonthly += currencyService.convert(metrics.monthlyBurn[c] || 0, c, baseCurrency);
      unifiedYearly += currencyService.convert(metrics.yearlyBurn[c] || 0, c, baseCurrency);
    });
  }

  const symbol = isUnifiedMode ? CURRENCY_SYMBOLS[baseCurrency] : CURRENCY_SYMBOLS[primaryCurrency];
  const displayMonthly = isUnifiedMode ? unifiedMonthly : (metrics.monthlyBurn[primaryCurrency] || 0);
  const displayYearly = isUnifiedMode ? unifiedYearly : (metrics.yearlyBurn[primaryCurrency] || 0);

  const isCapActive = spendCap !== null && spendCap !== undefined && spendCap > 0;
  const capPct = isCapActive ? (displayMonthly / spendCap) * 100 : 0;
  const isOverBudget = isCapActive && displayMonthly > spendCap;

  return (
    <div className="flex flex-col gap-3 w-full h-full justify-between min-h-0">
      
      {/* 1. Monthly Spend Card */}
      <div
        onClick={onOpenBudgetZombieModal || onOpenCurrencyModal}
        className="group flex-1 min-h-0 rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-4 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer"
        title="Click to view monthly spend cap & budget diagnostics"
      >
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Monthly Spend</span>
              {isUnifiedMode && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
                  {baseCurrency}
                </span>
              )}
            </div>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {symbol}{displayMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-mono text-neutral-500">/ mo</span>
          </div>

          {/* Spend Cap Utilization Bar */}
          {isCapActive && (
            <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-neutral-800">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-neutral-500">Cap: {symbol}{spendCap.toFixed(0)}</span>
                <span className={`font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : capPct >= 80 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isOverBudget ? `OVER (${capPct.toFixed(0)}%)` : `${capPct.toFixed(0)}%`}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : capPct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(capPct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isUnifiedMode ? (
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 mt-2">
              <ArrowRightLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Total across {metrics.activeCount} subscriptions</span>
            </div>
          ) : activeCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeCurrencies.slice(1).map(c => (
                <span key={c} className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700 font-medium">
                  {CURRENCY_SYMBOLS[c]}{(metrics.monthlyBurn[c] || 0).toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Yearly Spend Card */}
      <div
        onClick={onOpenCurrencyModal}
        className="group flex-1 min-h-0 rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-4 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer"
        title="Click to change base currency or inspect exchange rates"
      >
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Annual Spend</span>
              {isUnifiedMode && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
                  {baseCurrency}
                </span>
              )}
            </div>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {symbol}{displayYearly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm font-mono text-neutral-500">/ yr</span>
          </div>
          {isUnifiedMode ? (
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 mt-2">
              <ArrowRightLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Projected 12-month total in {baseCurrency}</span>
            </div>
          ) : activeCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeCurrencies.slice(1).map(c => (
                <span key={c} className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700 font-medium">
                  {CURRENCY_SYMBOLS[c]}{(metrics.yearlyBurn[c] || 0).toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Subscriptions Count */}
      <div
        onClick={onOpenBudgetZombieModal}
        className="group flex-1 min-h-0 rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-4 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer"
        title="Click to view subscription health & zombie detector audit"
      >
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Active Subscriptions</span>
              {zombieCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1">
                  <Skull className="w-2.5 h-2.5" />
                  {zombieCount} ZOMBIE
                </span>
              )}
            </div>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {metrics.activeCount}
            </span>
            <span className="text-sm font-mono text-neutral-500">active</span>
          </div>
          {zombieCount > 0 && (
            <div className="text-[10px] font-mono text-red-600 dark:text-red-400 font-bold mt-2 flex items-center gap-1">
              <span>⚠️ {zombieCount} unreviewed vampire subscriptions</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Renewals In Next 7 Days */}
      <div className="group flex-1 min-h-0 rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-4 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer">
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Renewals (Next 7 Days)</span>
              {metrics.renewalsNext7Days > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider bg-amber-400 dark:bg-amber-300 text-neutral-950">
                  SOON
                </span>
              )}
            </div>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold tracking-tight ${
              metrics.renewalsNext7Days > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-white'
            }`}>
              {metrics.renewalsNext7Days}
            </span>
            <span className="text-sm font-mono text-neutral-500">due soon</span>
          </div>
        </div>
      </div>

    </div>
  );
};
