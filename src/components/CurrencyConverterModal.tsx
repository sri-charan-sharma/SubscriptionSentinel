import React, { useState } from 'react';
import { X, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { CurrencyCode } from '../types';
import { currencyService, SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS } from '../services/currencyService';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBaseCurrency: CurrencyCode;
  onSelectBaseCurrency: (currency: CurrencyCode) => void;
  isUnifiedMode: boolean;
  onToggleUnifiedMode: (enabled: boolean) => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  currentBaseCurrency,
  onSelectBaseCurrency,
  isUnifiedMode,
  onToggleUnifiedMode
}) => {
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [calcFrom, setCalcFrom] = useState<CurrencyCode>('USD');
  const [calcTo, setCalcTo] = useState<CurrencyCode>('INR');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rates, setRates] = useState(currencyService.getRates());

  if (!isOpen) return null;

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    await currencyService.fetchLiveRates();
    setRates(currencyService.getRates());
    setIsRefreshing(false);
  };

  const parsedAmount = parseFloat(calcAmount) || 0;
  const convertedResult = currencyService.convert(parsedAmount, calcFrom, calcTo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-lg rounded-box shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Currency Conversion Engine
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Multi-currency normalization & exchange rates
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 bg-white dark:bg-neutral-900 font-mono text-xs">
          
          {/* Section 1: Base Display Currency Selector */}
          <div className="p-4 rounded bg-gray-50 dark:bg-neutral-800/60 border border-black dark:border-neutral-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
                Primary Base Currency
              </span>
              <button
                type="button"
                onClick={() => onToggleUnifiedMode(!isUnifiedMode)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                  isUnifiedMode
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-gray-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-black/20'
                }`}
              >
                {isUnifiedMode ? '✓ Unified Mode ON' : 'Native Mode'}
              </button>
            </div>

            <p className="text-[11px] text-neutral-500">
              Your dashboard burn totals and chart metrics will be unified into this currency.
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {SUPPORTED_CURRENCIES.map(curr => {
                const isSelected = currentBaseCurrency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => onSelectBaseCurrency(curr)}
                    className={`py-2 px-3 rounded text-center border transition-all ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black font-bold shadow-sm'
                        : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-black/20 dark:border-neutral-700 hover:border-black'
                    }`}
                  >
                    <div className="text-base font-bold">{CURRENCY_SYMBOLS[curr]}</div>
                    <div className="text-[10px] mt-0.5">{curr}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quick Currency Calculator */}
          <div className="p-4 rounded bg-gray-50 dark:bg-neutral-800/60 border border-black dark:border-neutral-700 space-y-3">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs block">
              Quick Rate Calculator
            </span>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-xs font-mono focus:outline-none"
                  placeholder="Amount"
                />
              </div>

              <select
                value={calcFrom}
                onChange={(e) => setCalcFrom(e.target.value as CurrencyCode)}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                ))}
              </select>

              <span className="text-neutral-400 font-bold">→</span>

              <select
                value={calcTo}
                onChange={(e) => setCalcTo(e.target.value as CurrencyCode)}
                className="px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-xs font-mono font-bold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 flex items-center justify-between">
              <span className="text-neutral-500 text-[11px]">Converted:</span>
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                {currencyService.format(convertedResult, calcTo)}
              </span>
            </div>
          </div>

          {/* Section 3: Live Exchange Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-neutral-500 text-[11px]">
              <span className="uppercase font-bold">Exchange Rates Matrix (USD Base)</span>
              <button
                type="button"
                onClick={handleRefreshRates}
                disabled={isRefreshing}
                className="hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Rates</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex justify-between">
                <span className="text-neutral-500">1 USD =</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{rates.INR.toFixed(2)} INR</span>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex justify-between">
                <span className="text-neutral-500">1 EUR =</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  ₹{((1 / rates.EUR) * rates.INR).toFixed(2)} INR
                </span>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex justify-between">
                <span className="text-neutral-500">1 USD =</span>
                <span className="font-bold text-neutral-900 dark:text-white">€{rates.EUR.toFixed(3)} EUR</span>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 flex justify-between">
                <span className="text-neutral-500">1 EUR =</span>
                <span className="font-bold text-neutral-900 dark:text-white">${(1 / rates.EUR).toFixed(3)} USD</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/10 dark:border-neutral-800 flex items-center justify-end bg-gray-50 dark:bg-neutral-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-black bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
