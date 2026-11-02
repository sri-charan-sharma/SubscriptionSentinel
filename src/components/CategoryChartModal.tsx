import React from 'react';
import { X, PieChart as PieIcon } from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';
import { CategorySpendChart } from './CategorySpendChart';

interface CategoryChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  baseCurrency?: CurrencyCode;
  isUnifiedMode?: boolean;
}

export const CategoryChartModal: React.FC<CategoryChartModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  baseCurrency,
  isUnifiedMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-3xl rounded-box shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Spending by Category
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Monthly commitment distribution
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

        {/* Chart Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CategorySpendChart
            subscriptions={subscriptions}
            baseCurrency={baseCurrency}
            isUnifiedMode={isUnifiedMode}
          />
        </div>

      </div>
    </div>
  );
};

