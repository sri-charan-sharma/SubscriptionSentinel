import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Gauge,
  Skull,
  Ban,
  Check,
  AlertTriangle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Subscription, PriceHistory, CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS, currencyService } from '../services/currencyService';
import {
  budgetZombieService,
  ZombieAuditItem
} from '../services/budgetZombieService';
import { resolveCancellationUrl } from '../services/popularPresets';

interface BudgetZombieModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  priceHistories: PriceHistory[];
  baseCurrency?: CurrencyCode;
  onSpendCapUpdated?: (newCap: number | null) => void;
}

export const BudgetZombieModal: React.FC<BudgetZombieModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  priceHistories,
  baseCurrency = 'USD',
  onSpendCapUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'BUDGET' | 'ZOMBIE'>('BUDGET');
  const [spendCapInput, setSpendCapInput] = useState<string>('500');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [whitelistedCount, setWhitelistedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const currentCap = budgetZombieService.getMonthlySpendCap();
      setSpendCapInput(currentCap !== null ? currentCap.toString() : '');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  // Compute total monthly spend in base currency
  const totalMonthlySpend = useMemo(() => {
    return subscriptions
      .filter(s => s.is_active)
      .reduce((acc, sub) => {
        let monthly = sub.current_price;
        if (sub.billing_cycle === 'YEARLY') {
          monthly = sub.current_price / 12;
        }
        return acc + currencyService.convert(monthly, sub.currency, baseCurrency);
      }, 0);
  }, [subscriptions, baseCurrency]);

  // Detect Zombie subscriptions
  const zombies: ZombieAuditItem[] = useMemo(() => {
    return budgetZombieService.detectZombieSubscriptions(subscriptions, priceHistories, baseCurrency);
  }, [subscriptions, priceHistories, baseCurrency, whitelistedCount]);

  if (!isOpen) return null;

  const symbol = CURRENCY_SYMBOLS[baseCurrency];
  const currentCap = parseFloat(spendCapInput);
  const isCapActive = !isNaN(currentCap) && currentCap > 0;
  const capPercentage = isCapActive ? (totalMonthlySpend / currentCap) * 100 : 0;
  const isOverBudget = isCapActive && totalMonthlySpend > currentCap;

  const handleSaveCap = () => {
    const val = isCapActive ? currentCap : null;
    budgetZombieService.setMonthlySpendCap(val);
    onSpendCapUpdated?.(val);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePresetCap = (amount: number) => {
    setSpendCapInput(amount.toString());
    budgetZombieService.setMonthlySpendCap(amount);
    onSpendCapUpdated?.(amount);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearCap = () => {
    setSpendCapInput('');
    budgetZombieService.setMonthlySpendCap(null);
    onSpendCapUpdated?.(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleWhitelist = (subId: number) => {
    budgetZombieService.whitelistZombie(subId);
    setWhitelistedCount(prev => prev + 1);
  };

  const totalZombieDrain = zombies.reduce((acc, z) => acc + z.estimatedCumulativeSpend, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#16181d] border border-black dark:border-neutral-700 w-full max-w-3xl rounded-box shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Monthly Spend Cap & Zombie Hunter
              </h2>
              <p className="text-[11px] font-mono text-neutral-500">
                Enforce recurring budget thresholds and eliminate forgotten vampire subscriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-box hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-black/10 dark:border-neutral-800 flex items-center gap-2 bg-gray-100/50 dark:bg-neutral-900/30 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('BUDGET')}
            className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'BUDGET'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Monthly Spend Cap</span>
            {isOverBudget && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ZOMBIE')}
            className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ZOMBIE'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Zombie Hunter</span>
            {zombies.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 dark:bg-amber-300 text-black">
                {zombies.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto font-mono text-xs space-y-5">
          
          {/* TAB 1: Monthly Spend Cap */}
          {activeTab === 'BUDGET' && (
            <div className="space-y-5">
              
              {/* Over-Budget Alert Banner */}
              {isOverBudget ? (
                <div className="p-4 rounded-box bg-red-50 dark:bg-red-950/40 border border-red-400 dark:border-red-900 text-red-900 dark:text-red-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block">
                      ⚠️ Monthly Spend Cap Exceeded!
                    </span>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      Your current monthly burn is <strong className="font-bold">{symbol}{totalMonthlySpend.toFixed(2)}</strong>, exceeding your cap of <strong className="font-bold">{symbol}{currentCap.toFixed(2)}</strong> by <strong className="font-bold text-red-700 dark:text-red-300">+{symbol}{(totalMonthlySpend - currentCap).toFixed(2)} ({capPercentage.toFixed(0)}%)</strong>.
                    </p>
                  </div>
                </div>
              ) : isCapActive && capPercentage >= 80 ? (
                <div className="p-4 rounded-box bg-amber-50 dark:bg-amber-950/40 border border-amber-400 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block">
                      Approaching Spend Limit
                    </span>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      You are using <strong className="font-bold">{capPercentage.toFixed(0)}%</strong> of your monthly limit ({symbol}{totalMonthlySpend.toFixed(2)} of {symbol}{currentCap.toFixed(2)}).
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Spend Gauge Box */}
              <div className="p-5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black dark:border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Current Monthly Run-Rate
                    </span>
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                      {symbol}{totalMonthlySpend.toFixed(2)}
                      <span className="text-xs text-neutral-500 font-normal ml-2">/ month</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Configured Spend Cap
                    </span>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      {isCapActive ? `${symbol}${currentCap.toFixed(2)}` : 'No Cap Set'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isCapActive && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Utilization</span>
                      <span className={`font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {capPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden p-0.5 border border-black/10 dark:border-neutral-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget ? 'bg-red-500' : capPercentage >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(capPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Set or Update Cap */}
              <div className="p-4 rounded-box bg-white dark:bg-neutral-950 border border-black dark:border-neutral-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Set Monthly Spend Cap ({baseCurrency})
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">{symbol}</span>
                    <input
                      type="number"
                      step="10"
                      min="1"
                      value={spendCapInput}
                      onChange={e => setSpendCapInput(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full pl-8 pr-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCap}
                    className="px-4 py-2 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-tiny"
                  >
                    Save Cap
                  </button>
                  {isCapActive && (
                    <button
                      type="button"
                      onClick={handleClearCap}
                      className="px-3 py-2 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs transition-colors cursor-pointer"
                      title="Clear spend cap"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold mr-1">Quick Presets:</span>
                  {[200, 350, 500, 750, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetCap(val)}
                      className="px-2.5 py-1 rounded text-[11px] font-mono bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/15 dark:border-neutral-700 transition-colors cursor-pointer"
                    >
                      {symbol}{val}
                    </button>
                  ))}
                </div>

                {savedSuccess && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Monthly spend cap saved and applied across dashboard.</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Zombie Hunter */}
          {activeTab === 'ZOMBIE' && (
            <div className="space-y-4">
              
              {/* Summary Banner */}
              <div className="p-4 rounded-box bg-black dark:bg-white text-white dark:text-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold opacity-75">
                    Zombie Audit Diagnostic
                  </span>
                  <div className="text-xl font-bold">
                    {zombies.length === 0 ? 'Zero Zombie Services Detected' : `${zombies.length} Zombie Subscriptions Flagged`}
                  </div>
                  <div className="text-[11px] opacity-80">
                    Services running continuously without user review or price changes
                  </div>
                </div>

                {zombies.length > 0 && (
                  <div className="text-left sm:text-right p-2.5 rounded bg-white/10 dark:bg-black/10">
                    <span className="text-[10px] uppercase font-bold opacity-80 block">Cumulative Drain</span>
                    <span className="text-lg font-bold">~{symbol}{totalZombieDrain.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Zombie Subscription Cards */}
              {zombies.length === 0 ? (
                <div className="p-8 text-center border border-black/15 dark:border-neutral-800 rounded-box bg-gray-50 dark:bg-neutral-900 text-neutral-500 space-y-2">
                  <Sparkles className="w-6 h-6 mx-auto text-emerald-500" />
                  <div className="font-bold text-neutral-900 dark:text-white text-xs uppercase">
                    Your Subscription Vault Is Clean!
                  </div>
                  <p className="text-[11px] max-w-sm mx-auto">
                    No neglected or unreviewed subscriptions detected. All tracked services are actively monitored.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {zombies.map(z => {
                    const cancelUrl = resolveCancellationUrl(z.subscription);

                    return (
                      <div
                        key={z.subscription.id}
                        className="p-4 rounded-box bg-white dark:bg-neutral-950 border border-black dark:border-neutral-800 space-y-3 shadow-micro"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 dark:text-white text-xs">
                                {z.subscription.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                z.severity === 'HIGH'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {z.severity} DRAIN
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {z.subscription.currency} {z.subscription.current_price.toFixed(2)} / {z.subscription.billing_cycle.toLowerCase()} • Category: {z.subscription.category}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Estimated Drain</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              ~{symbol}{z.estimatedCumulativeSpend.toFixed(2)} ({z.monthsActive} mos)
                            </span>
                          </div>
                        </div>

                        {/* Audit Reason */}
                        <div className="p-2.5 rounded bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          <span className="font-bold text-neutral-900 dark:text-white mr-1">Audit Finding:</span>
                          {z.reason}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10 dark:border-neutral-800">
                          {cancelUrl ? (
                            <a
                              href={cancelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-box bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-tiny"
                              title="1-Click direct cancellation"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Bust Zombie (1-Click Cancel)</span>
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">No cancellation URL configured</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleWhitelist(z.subscription.id)}
                            className="px-3 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs transition-colors cursor-pointer"
                            title="Keep subscription and whitelist from zombie alerts"
                          >
                            Keep / Whitelist
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 flex items-center justify-between font-mono text-xs flex-shrink-0">
          <div className="text-neutral-500 text-[11px]">
            Budget thresholds and whitelists persist in your session
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
