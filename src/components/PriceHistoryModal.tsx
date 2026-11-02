import React, { useEffect, useState } from 'react';
import {
  X,
  TrendingUp,
  Activity,
  History
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Subscription, PriceHistory } from '../types';
import { api } from '../services/api';

interface PriceHistoryModalProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ subscription, onClose }) => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subscription) return;
    setLoading(true);
    api.getPriceHistory(subscription.id)
      .then(data => {
        setHistory(data);
      })
      .finally(() => setLoading(false));
  }, [subscription]);

  if (!subscription) return null;

  // Format data for Recharts
  const chartData = history.map(h => ({
    timestamp: h.recorded_at,
    displayDate: new Date(h.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: h.price,
    source: h.source
  }));

  const minPrice = history.length > 0 ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : 100;
  const yPadding = (maxPrice - minPrice) * 0.2 || 5;

  const initialPrice = history.length > 0 ? history[0].price : subscription.current_price;
  const hikeDelta = subscription.current_price - initialPrice;
  const hikePercentage = initialPrice > 0 ? ((hikeDelta / initialPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-4xl rounded-box shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-mono uppercase">
                  {subscription.name}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                  PRICE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                Audit trail from append-only price_history ledger
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

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 bg-white dark:bg-neutral-900">
          
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 p-3">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 block uppercase">Current Price</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-0.5 block">
                {subscription.currency} {subscription.current_price.toFixed(2)}
              </span>
            </div>

            <div className="rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 p-3">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 block uppercase">Baseline (Initial)</span>
              <span className="text-xl font-bold font-mono text-neutral-700 dark:text-neutral-300 mt-0.5 block">
                {subscription.currency} {initialPrice.toFixed(2)}
              </span>
            </div>

            <div className="rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 p-3">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 block uppercase">Observed Hike</span>
              <span className={`text-xl font-bold font-mono mt-0.5 block ${
                hikeDelta > 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-300'
              }`}>
                {hikeDelta > 0 ? `+${hikeDelta.toFixed(2)} (${hikePercentage}%)` : '$0.00 (0%)'}
              </span>
            </div>

            <div className="rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 p-3">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 block uppercase">Total Audits</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-0.5 block">
                {history.length} checks
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="rounded-box bg-gray-50 dark:bg-neutral-950 border border-black dark:border-neutral-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-neutral-900 dark:text-white" />
                Price Progression Curve
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Failed checks appear as gaps, not zero points
              </span>
            </div>

            {loading ? (
              <div className="h-60 flex items-center justify-center font-mono text-xs text-neutral-500">
                Loading price telemetry...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-60 flex items-center justify-center font-mono text-xs text-neutral-500">
                No historical records yet.
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" className="dark:stroke-neutral-800" />
                    <XAxis
                      dataKey="displayDate"
                      stroke="#6b7280"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={11}
                      domain={[Math.max(0, minPrice - yPadding), maxPrice + yPadding]}
                      tickFormatter={(v) => `${subscription.currency} ${v}`}
                      tickLine={false}
                      fontFamily="JetBrains Mono"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 p-2 rounded shadow text-xs font-mono">
                              <p className="text-neutral-500">{new Date(data.timestamp).toLocaleString()}</p>
                              <p className="text-neutral-900 dark:text-white font-bold mt-1">
                                {subscription.currency} {Number(data.price).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 uppercase">
                                Source: {data.source}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={initialPrice}
                      stroke="#9ca3af"
                      strokeDasharray="4 4"
                      label={{ value: 'Baseline', fill: '#6b7280', fontSize: 10, position: 'right' }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="price"
                      stroke="#111827"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#111827', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 1.5 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabular History List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase text-neutral-900 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4" />
                Immutable Ledger (Database Rows)
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Rule: Only successful checks write to price_history
              </span>
            </div>

            <div className="rounded-box border border-black dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-gray-100 dark:bg-neutral-800 text-[10px] uppercase text-neutral-600 dark:text-neutral-400 border-b border-black dark:border-neutral-700">
                    <th className="py-2 px-3">Record ID</th>
                    <th className="py-2 px-3">Price Recorded</th>
                    <th className="py-2 px-3">Source</th>
                    <th className="py-2 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {history.slice().reverse().map(h => (
                    <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors">
                      <td className="py-2 px-3 text-neutral-500">#{h.id}</td>
                      <td className="py-2 px-3 text-neutral-900 dark:text-white font-bold">
                        {h.currency} {h.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                          {h.source}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                        {new Date(h.recorded_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black border border-black text-xs font-mono transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
