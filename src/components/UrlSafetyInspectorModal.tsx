import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertOctagon, Terminal } from 'lucide-react';
import { validatePricingUrl } from '../utils/ssrfValidator';

interface UrlSafetyInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_TEST_CASES = [
  { name: 'AWS Metadata (169.254.169.254)', url: 'http://169.254.169.254/latest/meta-data/' },
  { name: 'Google Cloud Metadata', url: 'http://metadata.google.internal/computeMetadata/v1/' },
  { name: 'Localhost (127.0.0.1)', url: 'http://127.0.0.1:8080/actuator/env' },
  { name: 'Private RFC1918 (192.168.1.100)', url: 'http://192.168.1.100/admin' },
  { name: 'Private RFC1918 (10.0.0.15)', url: 'http://10.0.0.15:9000/keys' },
  { name: 'File Scheme (file:///etc/passwd)', url: 'file:///etc/passwd' },
  { name: 'Legitimate Public URL', url: 'https://www.digitalocean.com/pricing' }
];

export const UrlSafetyInspectorModal: React.FC<UrlSafetyInspectorModalProps> = ({ isOpen, onClose }) => {
  const [testUrl, setTestUrl] = useState('http://169.254.169.254/latest/meta-data/');

  if (!isOpen) return null;

  const result = validatePricingUrl(testUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-2xl rounded-box shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                SSRF Guard & URL Safety Sandbox
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Pre-flight validation rules before dispatching Jsoup scraper
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

        {/* Content */}
        <div className="p-5 space-y-4 bg-white dark:bg-neutral-900">
          
          {/* Preset chips */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1.5 font-semibold">
              Test Attack Vector / Safe Preset:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TEST_CASES.map(tc => (
                <button
                  key={tc.name}
                  onClick={() => setTestUrl(tc.url)}
                  className={`text-[11px] font-mono px-2 py-1 rounded-box border transition-colors ${
                    testUrl === tc.url
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black'
                      : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border-black dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive URL Input */}
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-700 dark:text-neutral-300 mb-1 font-semibold">
              Target URL Under Test:
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>

          {/* Live Scanner Evaluation Card */}
          <div className={`p-3.5 rounded-box border border-black ${
            result.valid
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-center gap-1.5 mb-1 font-bold font-mono text-xs uppercase tracking-wider">
              {result.valid ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>VERDICT: PERMITTED FOR SCRAPER DISPATCH</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>VERDICT: SSRF ATTACK BLOCKED</span>
                </>
              )}
            </div>

            <p className="text-xs font-mono">
              {result.valid
                ? `URL normalized to: ${result.normalizedUrl}. Scheme is safe, DNS host verified non-internal.`
                : result.error}
            </p>
          </div>

          {/* Technical Implementation Rules */}
          <div className="p-3.5 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 space-y-1.5">
            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>Backend Enforcement Rules:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-neutral-600 dark:text-neutral-400">
              <li>Schemes allowed: only http and https.</li>
              <li>Rejects loopback (127.0.0.1, localhost), link-local (169.254.0.0/16), and RFC1918 private subnets.</li>
              <li>Follows max 3 redirects with target re-validation on every hop.</li>
              <li>Enforces 5000ms connect and read socket timeouts.</li>
              <li>Response body capped at 2MB.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black border border-black text-xs font-mono font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
