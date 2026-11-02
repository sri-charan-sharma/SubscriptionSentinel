import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Calendar,
  Layers,
  Link2
} from 'lucide-react';
import { Subscription, SubscriptionCategory, CurrencyCode, BillingCycle } from '../types';
import { validatePricingUrl } from '../utils/ssrfValidator';

interface SubscriptionModalProps {
  isOpen: boolean;
  subscriptionToEdit?: Subscription | null;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id' | 'created_at' | 'consecutive_failures' | 'is_active'>) => Promise<void>;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  subscriptionToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('STREAMING');
  const [price, setPrice] = useState<string>('19.99');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [pricingUrl, setPricingUrl] = useState('');
  const [priceSelector, setPriceSelector] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL safety live feedback
  const urlValidation = validatePricingUrl(pricingUrl);

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setCategory(subscriptionToEdit.category);
      setPrice(subscriptionToEdit.current_price.toString());
      setCurrency(subscriptionToEdit.currency);
      setBillingCycle(subscriptionToEdit.billing_cycle);
      setPricingUrl(subscriptionToEdit.pricing_url);
      setPriceSelector(subscriptionToEdit.price_selector || '');
      setRenewalDate(subscriptionToEdit.renewal_date);
      setShowAdvanced(Boolean(subscriptionToEdit.price_selector));
    } else {
      setName('');
      setCategory('STREAMING');
      setPrice('15.99');
      setCurrency('USD');
      setBillingCycle('MONTHLY');
      setPricingUrl('https://');
      setPriceSelector('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setRenewalDate(defaultDate.toISOString().split('T')[0]);
      setShowAdvanced(false);
    }
    setError(null);
  }, [subscriptionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a subscription name');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be a valid positive number');
      return;
    }

    if (!urlValidation.valid) {
      setError(urlValidation.error || 'Invalid pricing URL');
      return;
    }

    if (!renewalDate) {
      setError('Renewal date is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        category,
        current_price: numPrice,
        currency,
        billing_cycle: billingCycle,
        pricing_url: pricingUrl.trim(),
        price_selector: priceSelector.trim() ? priceSelector.trim() : undefined,
        renewal_date: renewalDate,
        last_scrape_status: subscriptionToEdit ? subscriptionToEdit.last_scrape_status : undefined,
        last_raw_match: subscriptionToEdit ? subscriptionToEdit.last_raw_match : undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-xl rounded-box shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                {subscriptionToEdit ? 'Edit Subscription' : 'Add New Subscription'}
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Pre-flight SSRF check will run on pricing URL
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white dark:bg-neutral-900">
          
          {error && (
            <div className="p-3 rounded-box bg-red-50 dark:bg-red-950/40 border border-black text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Netflix Premium"
                className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
              >
                <option value="STREAMING">STREAMING</option>
                <option value="CLOUD">CLOUD INFRASTRUCTURE</option>
                <option value="SOFTWARE">SOFTWARE / SAAS</option>
                <option value="UTILITY">UTILITY / TELECOM</option>
                <option value="FITNESS">FITNESS / GYM</option>
              </select>
            </div>
          </div>

          {/* Price, Currency, Billing Cycle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="19.99"
                className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-gray-100 dark:bg-neutral-800 rounded-box border border-black dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`py-1 text-[11px] font-mono rounded font-medium transition-colors ${
                    billingCycle === 'MONTHLY' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('YEARLY')}
                  className={`py-1 text-[11px] font-mono rounded font-medium transition-colors ${
                    billingCycle === 'YEARLY' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          {/* Pricing URL Field with LIVE SSRF Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Pricing Page URL *
              </label>
              {pricingUrl && (
                <span className={`text-[10px] font-mono flex items-center gap-1 font-bold ${
                  urlValidation.valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {urlValidation.valid ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      SSRF SAFE
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      BLOCKED
                    </>
                  )}
                </span>
              )}
            </div>

            <input
              type="url"
              required
              value={pricingUrl}
              onChange={e => setPricingUrl(e.target.value)}
              placeholder="https://example.com/pricing"
              className={`w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white text-xs font-mono focus:outline-none ${
                pricingUrl && !urlValidation.valid
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/20'
                  : 'border-black dark:border-neutral-700 focus:bg-white'
              }`}
            />
            {pricingUrl && !urlValidation.valid && (
              <p className="text-[11px] font-mono text-red-600 dark:text-red-400 mt-1">
                {urlValidation.error}
              </p>
            )}
            <p className="text-[10px] font-mono text-neutral-500 mt-1">
              Security policy: loopback addresses, 169.254.169.254, and RFC1918 private IPs are blocked.
            </p>
          </div>

          {/* Next Renewal Date */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Next Renewal Date *
            </label>
            <input
              type="date"
              required
              value={renewalDate}
              onChange={e => setRenewalDate(e.target.value)}
              className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>

          {/* Advanced Accordion: CSS Selector */}
          <div className="pt-2 border-t border-black/10 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:underline flex items-center gap-1 font-medium"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide CSS Selector' : 'Configure Specific CSS Selector (Optional)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 space-y-1.5">
                <label className="block text-[11px] font-mono uppercase text-neutral-700 dark:text-neutral-300 font-semibold">
                  CSS Selector (Jsoup)
                </label>
                <input
                  type="text"
                  value={priceSelector}
                  onChange={e => setPriceSelector(e.target.value)}
                  placeholder="e.g. .pricing-tier-pro .amount, #monthly-cost"
                  className="w-full px-3 py-1.5 rounded-box bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none"
                />
                <p className="text-[10px] font-mono text-neutral-500">
                  Leave blank to auto-detect price tokens matching currency patterns in body.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/10 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (Boolean(pricingUrl) && !urlValidation.valid)}
              className="px-5 py-2 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border border-black text-xs font-mono font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : subscriptionToEdit ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
