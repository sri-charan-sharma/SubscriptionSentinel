import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface TelegramAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramAlertModal: React.FC<TelegramAlertModalProps> = ({ isOpen, onClose }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = api.getTelegramConfig();
      setBotToken(cfg.botToken || '');
      setChatId(cfg.chatId || '');
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both your Bot Token and Chat ID.' });
      return;
    }

    try {
      setIsSending(true);
      setStatusMessage(null);

      // Save credentials locally
      api.saveTelegramConfig({
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        enabled: true
      });

      // Attempt test dispatch
      const result = await api.sendTelegramTestMessage(botToken.trim(), chatId.trim());
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Alert successfully delivered to your phone! Check your Telegram app.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to send alert. Make sure you tapped "Start" on your bot.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error communicating with Telegram API.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-lg rounded-box shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Telegram Bot Alerts
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Real-time price-hike push notifications
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
        <div className="p-5 space-y-4 bg-white dark:bg-neutral-900 font-mono text-xs">
          
          <div className="p-3 rounded bg-sky-50 dark:bg-neutral-800/80 border border-black dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              Direct Push Channel
            </div>
            <p className="text-[11px] leading-relaxed">
              Whenever a background scrape detects a silent price increase, Sentinel immediately pushes a formatted alert to your Telegram chat.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] uppercase font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 7123456789:AAHk..."
                className="w-full px-3 py-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Obtained from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="underline hover:text-black dark:hover:text-white inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-2.5 h-2.5" /></a>
              </span>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Your Telegram Chat ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 5865975596"
                className="w-full px-3 py-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Obtained from <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="underline hover:text-black dark:hover:text-white inline-flex items-center gap-0.5">@userinfobot <ExternalLink className="w-2.5 h-2.5" /></a>
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded border text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-600 text-red-800 dark:text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-xs font-mono font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleSaveAndTest}
              className="px-4 py-1.5 rounded border border-black bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Test Alert</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

