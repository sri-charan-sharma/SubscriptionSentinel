import React from 'react';
import { Flame, Calendar, Layers, AlertTriangle } from 'lucide-react';
import { DashboardMetrics, CurrencyCode } from '../types';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR'];
  const activeCurrencies = currencies.filter(c => (metrics.monthlyBurn[c] || 0) > 0);
  const primaryCurrency = activeCurrencies.length > 0 ? activeCurrencies[0] : 'USD';

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      
      {/* 1. Monthly Burn Card */}
      <div className="group flex-1 min-h-[110px] rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-5 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer">
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Monthly Burn</span>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {currencySymbols[primaryCurrency]}{(metrics.monthlyBurn[primaryCurrency] || 0).toFixed(2)}
            </span>
            <span className="text-sm font-mono text-neutral-500">/ mo</span>
          </div>
          {activeCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeCurrencies.slice(1).map(c => (
                <span key={c} className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700 font-medium">
                  {currencySymbols[c]}{(metrics.monthlyBurn[c] || 0).toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Yearly Burn Card */}
      <div className="group flex-1 min-h-[110px] rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-5 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer">
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Annualized Burn</span>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {currencySymbols[primaryCurrency]}{(metrics.yearlyBurn[primaryCurrency] || 0).toFixed(2)}
            </span>
            <span className="text-sm font-mono text-neutral-500">/ yr</span>
          </div>
          {activeCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeCurrencies.slice(1).map(c => (
                <span key={c} className="text-xs font-mono px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700 font-medium">
                  {currencySymbols[c]}{(metrics.yearlyBurn[c] || 0).toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Subscriptions Count */}
      <div className="group flex-1 min-h-[110px] rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-5 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer">
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Active Targets</span>
            <div className="p-1.5 rounded bg-white dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-tight">
              {metrics.activeCount}
            </span>
            <span className="text-sm font-mono text-neutral-500">services</span>
          </div>
        </div>
      </div>

      {/* 4. Renewals In Next 7 Days */}
      <div className="group flex-1 min-h-[110px] rounded-box bg-gray-100 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 border border-black dark:border-neutral-700 p-5 shadow-tiny hover:shadow-md flex flex-col justify-center transition-all duration-200 ease-out transform-gpu hover:scale-[1.035] hover:-translate-y-0.5 relative z-0 hover:z-20 cursor-pointer">
        <div>
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Renewals In 7 Days</span>
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
            <span className="text-sm font-mono text-neutral-500">upcoming</span>
          </div>
        </div>
      </div>

    </div>
  );
};
