import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ArrowRightLeft } from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';
import { currencyService, CURRENCY_SYMBOLS } from '../services/currencyService';

interface CategorySpendChartProps {
  subscriptions: Subscription[];
  baseCurrency?: CurrencyCode;
  isUnifiedMode?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  STREAMING: '#27272a', // Dark Carbon (matches primary UI elements)
  CLOUD: '#0284c7',     // Technical Sky (matches system links and cloud data)
  SOFTWARE: '#10b981',  // Sentinel Emerald (matches OK status badge)
  FITNESS: '#f59e0b',   // Sentinel Amber (matches SOON status badge)
  UTILITY: '#64748b',   // Slate Steel (matches secondary borders & tags)
  OTHER: '#71717a'      // Cool Zinc
};

const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

export const CategorySpendChart: React.FC<CategorySpendChartProps> = ({
  subscriptions,
  baseCurrency = 'INR',
  isUnifiedMode = true
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [viewMode, setViewMode] = useState<'unified' | 'native'>(isUnifiedMode ? 'unified' : 'native');
  
  // Available currencies with active spend
  const activeCurrencies = useMemo(() => {
    const set = new Set<CurrencyCode>();
    subscriptions.forEach(s => {
      if (s.is_active) set.add(s.currency);
    });
    return Array.from(set);
  }, [subscriptions]);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    return activeCurrencies[0] || 'USD';
  });

  // Calculate monthly spend per category
  const categoryData = useMemo(() => {
    const targetList = subscriptions.filter(s =>
      s.is_active && (viewMode === 'unified' || s.currency === selectedCurrency)
    );
    const map = new Map<string, { totalMonthly: number; count: number; items: string[] }>();

    let grandTotal = 0;

    targetList.forEach(s => {
      const monthlyNative = s.billing_cycle === 'MONTHLY' ? s.current_price : s.current_price / 12;
      const monthly = viewMode === 'unified'
        ? currencyService.convert(monthlyNative, s.currency, baseCurrency)
        : monthlyNative;

      grandTotal += monthly;

      const cat = s.category.toUpperCase();
      const existing = map.get(cat) || { totalMonthly: 0, count: 0, items: [] };
      existing.totalMonthly += monthly;
      existing.count += 1;
      existing.items.push(s.name);
      map.set(cat, existing);
    });

    const list = Array.from(map.entries()).map(([name, data]) => ({
      name,
      value: Number(data.totalMonthly.toFixed(2)),
      count: data.count,
      items: data.items,
      percentage: grandTotal > 0 ? ((data.totalMonthly / grandTotal) * 100).toFixed(1) : '0',
      color: CATEGORY_COLORS[name] || '#3f3f46'
    }));

    // Sort by largest spend first
    list.sort((a, b) => b.value - a.value);

    return { list, grandTotal: Number(grandTotal.toFixed(2)) };
  }, [subscriptions, viewMode, selectedCurrency, baseCurrency]);

  const symbol = viewMode === 'unified' ? CURRENCY_SYMBOLS[baseCurrency] : (currencySymbols[selectedCurrency] || '$');

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-950 p-4 sm:p-5 overflow-y-auto">
      
      {/* Top Controls: Donut / Bar toggle + Currency selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-neutral-800">
        
        {/* Chart Style Toggle: Donut vs Bar */}
        <div className="flex items-center gap-1 p-0.5 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
              chartType === 'donut'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
        </div>

        {/* Currency Mode Selector */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 p-0.5 rounded bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'unified'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3 text-emerald-500" />
              <span>Unified ({baseCurrency})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('native')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'native'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
              }`}
            >
              <span>Native</span>
            </button>
          </div>

          {viewMode === 'native' && activeCurrencies.length > 1 && (
            <div className="flex items-center gap-1">
              {activeCurrencies.map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors ${
                    selectedCurrency === curr
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black font-bold'
                      : 'bg-gray-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-black/20 hover:border-black'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {categoryData.list.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 font-mono text-xs">
          No active subscriptions found for {viewMode === 'unified' ? baseCurrency : selectedCurrency}.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 min-h-0 pt-4">
          
          {/* Chart Display Area */}
          <div className="relative lg:col-span-7 h-[260px] sm:h-[280px] w-full flex items-center justify-center">
            {chartType === 'donut' && (
              <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center select-none z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Total / mo
                </span>
                <span className="text-base font-mono font-extrabold text-neutral-900 dark:text-white">
                  {symbol}{categoryData.grandTotal.toFixed(2)}
                </span>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'donut' ? (
                <PieChart>
                  <Tooltip
                    isAnimationActive={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 shadow-tiny text-xs font-mono">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block border border-black/30 dark:border-white/30"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-neutral-700 dark:text-neutral-300">
                              Monthly: <span className="font-bold">{symbol}{item.value.toFixed(2)}</span>
                            </div>
                            <div className="text-neutral-500 text-[11px]">
                              Share: <span className="font-bold">{item.percentage}%</span> ({item.count} {item.count === 1 ? 'service' : 'services'})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={categoryData.list}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    isAnimationActive={false}
                    stroke="#000000"
                    strokeWidth={1}
                  >
                    {categoryData.list.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={categoryData.list} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#737373', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#737373', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#525252' }}
                    tickLine={false}
                    tickFormatter={val => `${symbol}${val}`}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 shadow-tiny text-xs font-mono">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block border border-black/30 dark:border-white/30"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-neutral-700 dark:text-neutral-300">
                              Monthly: <span className="font-bold">{symbol}{item.value.toFixed(2)}</span>
                            </div>
                            <div className="text-neutral-500 text-[11px]">
                              Share: <span className="font-bold">{item.percentage}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                    stroke="#000000"
                    strokeWidth={1}
                  >
                    {categoryData.list.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Metric Cards */}
          <div className="lg:col-span-5 flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
            <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider font-bold mb-1">
              Category Breakdown ({symbol}{categoryData.grandTotal.toFixed(2)} total / mo)
            </div>

            {categoryData.list.map(cat => (
              <div
                key={cat.name}
                className="p-2.5 rounded bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 flex items-center justify-between text-xs font-mono hover:border-black/30 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-black/30 dark:border-white/20"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 truncate max-w-[140px] block">
                      {cat.items.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    {symbol}{cat.value.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {cat.percentage}% of total
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
