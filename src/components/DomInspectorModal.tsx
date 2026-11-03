import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Cpu,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Play,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Subscription } from '../types';
import {
  testCssSelector,
  getSubscriptionDomHtml,
  getSubscriptionSnapshotSvg,
  SelectorTestResult
} from '../services/snapshotService';

interface DomInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onUpdateSelector?: (subId: number, newSelector: string) => Promise<void>;
  onCheckNow?: (subId: number) => void;
}

export const DomInspectorModal: React.FC<DomInspectorModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSelector,
  onCheckNow
}) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'HTML'>('VISUAL');
  const [selectorInput, setSelectorInput] = useState('');
  const [testResult, setTestResult] = useState<SelectorTestResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (subscription) {
      setSelectorInput(subscription.price_selector || '');
      setTestResult(null);
      setSaveSuccess(false);
      setActiveTab('VISUAL');
    }
  }, [subscription, isOpen]);

  if (!isOpen || !subscription) return null;

  const domHtml = getSubscriptionDomHtml(subscription);
  const snapshotSrc = getSubscriptionSnapshotSvg(subscription);

  const handleTestSelector = () => {
    const result = testCssSelector(domHtml, selectorInput);
    setTestResult(result);
    setSaveSuccess(false);
  };

  const handleApplyPreset = (presetSelector: string) => {
    setSelectorInput(presetSelector);
    const result = testCssSelector(domHtml, presetSelector);
    setTestResult(result);
  };

  const handleSaveSelector = async () => {
    if (!onUpdateSelector) return;
    try {
      setIsSaving(true);
      await onUpdateSelector(subscription.id, selectorInput.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const engineName = subscription.last_engine_used === 'PLAYWRIGHT'
    ? 'Playwright Chromium'
    : subscription.last_engine_used === 'JSOUP'
    ? 'Jsoup Fast HTTP'
    : 'Auto Hybrid Engine';

  const isOk = subscription.last_scrape_status === 'OK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#16181d] border border-black dark:border-neutral-700 w-full max-w-5xl rounded-box shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  DOM Snapshot & Selector Tester
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-black/20 ${
                  isOk
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {subscription.last_scrape_status || 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 flex items-center gap-2">
                <span>{subscription.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {engineName}
                </span>
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

        {/* Content Body: Two-Column Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black dark:divide-neutral-800 overflow-y-auto font-mono text-xs">
          
          {/* Left Column (7 cols): Browser Viewport & Captured Snapshot */}
          <div className="lg:col-span-7 p-4 flex flex-col space-y-3 bg-gray-100/50 dark:bg-neutral-950/40 min-h-0 overflow-y-auto">
            {/* Viewport Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('VISUAL')}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    activeTab === 'VISUAL'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-black/20 dark:border-neutral-700'
                  }`}
                >
                  Visual Render (1280x800)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('HTML')}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    activeTab === 'HTML'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-black/20 dark:border-neutral-700'
                  }`}
                >
                  Raw HTML Tree
                </button>
              </div>

              <a
                href={subscription.pricing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 underline truncate max-w-[200px]"
                title={subscription.pricing_url}
              >
                <span className="truncate">{subscription.pricing_url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            {/* Browser Window Frame */}
            <div className="border border-black dark:border-neutral-700 rounded-box overflow-hidden bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
              {/* Browser Address Bar */}
              <div className="px-3 py-2 bg-gray-200 dark:bg-neutral-800 border-b border-black/10 dark:border-neutral-700 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-neutral-900 border border-black/10 dark:border-neutral-700 text-[10px] text-neutral-600 dark:text-neutral-300 truncate">
                  {subscription.pricing_url}
                </div>
              </div>

              {/* Viewport Content */}
              <div className="p-2 min-h-[320px] max-h-[460px] overflow-auto flex items-center justify-center bg-neutral-950">
                {activeTab === 'VISUAL' ? (
                  <img
                    src={snapshotSrc}
                    alt={`${subscription.name} DOM snapshot`}
                    className="w-full h-auto object-contain rounded"
                  />
                ) : (
                  <pre className="w-full h-full p-3 font-mono text-[11px] text-neutral-200 overflow-auto whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                    {domHtml}
                  </pre>
                )}
              </div>
            </div>

            {/* Diagnostic Footer Notice */}
            <div className="p-2.5 rounded-box bg-white dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
              <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-white text-[10px] uppercase">
                <span>Active Target Match:</span>
                <span>{subscription.currency} {subscription.current_price.toFixed(2)}</span>
              </div>
              <div className="truncate text-neutral-500 text-[10px]">
                {subscription.last_raw_match ? `"${subscription.last_raw_match}"` : 'No raw match stored'}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live CSS Selector Sandbox */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between space-y-4 bg-white dark:bg-[#16181d]">
            <div className="space-y-4">
              
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  CSS Selector Tester
                </span>
                <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                  Test custom selectors in real time against the hydrated DOM without reloading the page.
                </p>

                {/* Input with Run Button */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={selectorInput}
                      onChange={e => setSelectorInput(e.target.value)}
                      placeholder="e.g. .plan-price-tier-premium, #price"
                      className="flex-1 px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestSelector}
                      className="px-3.5 py-2 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-tiny"
                      title="Run selector test"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>
                  </div>

                  {/* Common Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold mr-1">Presets:</span>
                    {[
                      '.price',
                      '.pricing',
                      '[data-price]',
                      '.plan-price-tier-premium',
                      '#plan-premium-individual',
                      '#ec2-m6i-xlarge-price'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-black/15 dark:border-neutral-700 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Results Output Box */}
              {testResult && (
                <div className={`p-3.5 rounded-box border ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-500/50 text-red-900 dark:text-red-200'
                } space-y-2`}>
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Matched {testResult.matchedCount} Element{testResult.matchedCount > 1 ? 's' : ''}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          <span>No Match Found</span>
                        </>
                      )}
                    </span>
                    {testResult.detectedPrice !== null && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-xs">
                        {testResult.detectedCurrency || '$'} {testResult.detectedPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {testResult.matches.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Extracted Text:</span>
                      <div className="p-2 rounded bg-white/70 dark:bg-neutral-900/70 border border-black/10 dark:border-neutral-800 text-[11px] font-mono">
                        "{testResult.matches[0]}"
                      </div>
                    </div>
                  )}

                  {testResult.error && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 leading-tight">
                      {testResult.error}
                    </p>
                  )}
                </div>
              )}

              {/* Live Guidance */}
              <div className="p-3 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                <span className="font-bold text-neutral-900 dark:text-white text-[10px] uppercase block">
                  Pro-Tip: Targeting Resilient Selectors
                </span>
                <p>
                  Prefer semantic class names (<code className="text-black dark:text-white font-bold">.price</code>, <code className="text-black dark:text-white font-bold">#pricing-tier</code>) over auto-generated hash classes (<code className="text-neutral-500">.css-1f9x8</code>).
                </p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-black/10 dark:border-neutral-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveSelector}
                disabled={isSaving || !selectorInput.trim()}
                className="w-full py-2.5 px-4 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-tiny disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Selector Saved & Updated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isSaving ? 'Updating...' : 'Apply Selector to Subscription'}</span>
                  </>
                )}
              </button>

              {onCheckNow && (
                <button
                  type="button"
                  onClick={() => onCheckNow(subscription.id)}
                  className="w-full py-2 px-3 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-black dark:border-neutral-700 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Scrape Target Page Now</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
