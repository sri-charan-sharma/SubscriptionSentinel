import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, Play } from 'lucide-react';
import { Subscription, ScrapeStatus } from '../types';

interface SimulateHikeModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onSimulate: (subId: number, newPrice?: number, status?: ScrapeStatus) => Promise<void>;
}

export const SimulateHikeModal: React.FC<SimulateHikeModalProps> = ({
  subscription,
  onClose,
  onSimulate
}) => {
  const [mode, setMode] = useState<'HIKE' | 'FAILURE'>('HIKE');
  const [hikeAmount, setHikeAmount] = useState<string>('3.00');
  const [failureStatus, setFailureStatus] = useState<ScrapeStatus>('SELECTOR_NOT_FOUND');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!subscription) return null;

  const targetPrice = Math.round((subscription.current_price + (parseFloat(hikeAmount) || 0)) * 100) / 100;

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      if (mode === 'HIKE') {
        await onSimulate(subscription.id, targetPrice, 'OK');
      } else {
        await onSimulate(subscription.id, undefined, failureStatus);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-lg rounded-box shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Simulate Scraper Event
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Target: <span className="font-bold text-neutral-900 dark:text-white">{subscription.name}</span>
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

        {/* Mode Selector */}
        <div className="p-5 space-y-4 bg-white dark:bg-neutral-900">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-neutral-800 rounded-box border border-black dark:border-neutral-700">
            <button
              onClick={() => setMode('HIKE')}
              className={`py-1.5 text-xs font-mono rounded font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'HIKE'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Simulate Hike</span>
            </button>
            <button
              onClick={() => setMode('FAILURE')}
              className={`py-1.5 text-xs font-mono rounded font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'FAILURE'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-black'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Failure</span>
            </button>
          </div>

          {mode === 'HIKE' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                  Hike Amount ({subscription.currency})
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0.01"
                  value={hikeAmount}
                  onChange={e => setHikeAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Price Shift:</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {subscription.currency} {subscription.current_price.toFixed(2)}
                  </span>
                  <span className="text-neutral-900 dark:text-white font-bold ml-2">
                    → {subscription.currency} {targetPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block uppercase">Trigger:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Price Hike Alert</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-neutral-500">
                Will invoke the idempotent alert dispatcher with key: <code className="text-neutral-800 dark:text-neutral-200">({subscription.id}, 'PRICE_HIKE', {targetPrice})</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                  Failure Status Code:
                </label>
                <select
                  value={failureStatus}
                  onChange={e => setFailureStatus(e.target.value as ScrapeStatus)}
                  className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
                >
                  <option value="SELECTOR_NOT_FOUND">SELECTOR_NOT_FOUND (DOM changed)</option>
                  <option value="TIMEOUT">TIMEOUT (Socket timed out)</option>
                  <option value="BLOCKED">BLOCKED (HTTP 403 Forbidden)</option>
                  <option value="PARSE_ERROR">PARSE_ERROR (Malformed currency token)</option>
                </select>
              </div>

              <div className="p-3 rounded-box bg-amber-50 dark:bg-amber-950/30 border border-black text-amber-800 dark:text-amber-300 text-xs font-mono">
                <p className="font-bold mb-1">Failure Rule:</p>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300">
                  Increments consecutive_failures (currently: {subscription.consecutive_failures}). At 5 fails, the "NEEDS ATTENTION" badge triggers. No row is written to price_history.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black border border-black text-xs font-bold font-mono tracking-wide transition-colors flex items-center gap-1.5"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Dispatching...' : 'Dispatch'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
