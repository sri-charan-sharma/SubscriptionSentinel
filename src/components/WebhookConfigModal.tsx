import React, { useState, useEffect } from 'react';
import {
  X,
  Webhook,
  Send,
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { webhookService, WebhookConfig } from '../services/webhookService';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<WebhookConfig>(webhookService.getConfig());
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [discordTestStatus, setDiscordTestStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const [testingSlack, setTestingSlack] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(webhookService.getConfig());
      setDiscordTestStatus(null);
      setSlackTestStatus(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestDiscord = async () => {
    if (!config.discordWebhookUrl.trim()) {
      setDiscordTestStatus({ success: false, msg: 'Enter a Discord Webhook URL first' });
      return;
    }
    setTestingDiscord(true);
    setDiscordTestStatus(null);
    try {
      const res = await webhookService.sendTestPing('DISCORD', config.discordWebhookUrl);
      if (res.success) {
        setDiscordTestStatus({ success: true, msg: 'Test card delivered to Discord channel!' });
      } else {
        setDiscordTestStatus({ success: false, msg: res.error || 'Failed sending ping' });
      }
    } finally {
      setTestingDiscord(false);
    }
  };

  const handleTestSlack = async () => {
    if (!config.slackWebhookUrl.trim()) {
      setSlackTestStatus({ success: false, msg: 'Enter a Slack Webhook URL first' });
      return;
    }
    setTestingSlack(true);
    setSlackTestStatus(null);
    try {
      const res = await webhookService.sendTestPing('SLACK', config.slackWebhookUrl);
      if (res.success) {
        setSlackTestStatus({ success: true, msg: 'Test message delivered to Slack channel!' });
      } else {
        setSlackTestStatus({ success: false, msg: res.error || 'Failed sending ping' });
      }
    } finally {
      setTestingSlack(false);
    }
  };

  const handleSave = () => {
    webhookService.saveConfig(config);
    setSaveSuccess(true);
    onSaved?.();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#16181d] border-2 border-black dark:border-neutral-700 w-full max-w-2xl rounded-box shadow-2xl overflow-hidden flex flex-col font-mono text-xs max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-black dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
              <Webhook className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Discord & Slack Webhooks
              </h2>
              <p className="text-[11px] text-neutral-500">
                Broadcast price hike cards and renewal warnings to team channels
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Master Enable Toggle */}
          <div className="p-3.5 rounded-box bg-gray-100 dark:bg-neutral-900 border border-black dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="font-bold text-neutral-900 dark:text-white uppercase text-[11px]">
                  Webhook Alert Engine
                </div>
                <div className="text-[10px] text-neutral-500">
                  Allow Sentinel to transmit HTTP payloads when prices change
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={e => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Discord Webhook Section */}
          <div className="p-4 rounded-box bg-white dark:bg-neutral-950 border border-black dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase text-neutral-900 dark:text-white">
                  Discord Webhook Integration
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#5865F2] text-white">
                  Rich Embeds
                </span>
              </div>
              <a
                href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white underline flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[11px] text-neutral-500">
              Paste your Discord channel webhook URL. Sentinel sends rich embeds with old price, new price, and 1-click cancellation links.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                value={config.discordWebhookUrl}
                onChange={e => setConfig(prev => ({ ...prev, discordWebhookUrl: e.target.value }))}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={testingDiscord || !config.discordWebhookUrl.trim()}
                className="px-3.5 py-2 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className={`w-3 h-3 ${testingDiscord ? 'animate-spin' : ''}`} />
                <span>{testingDiscord ? 'Testing...' : 'Test Ping'}</span>
              </button>
            </div>

            {discordTestStatus && (
              <div className={`p-2 rounded text-[11px] font-bold flex items-center gap-1.5 ${
                discordTestStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/30'
              }`}>
                {discordTestStatus.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{discordTestStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Slack Webhook Section */}
          <div className="p-4 rounded-box bg-white dark:bg-neutral-950 border border-black dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase text-neutral-900 dark:text-white">
                  Slack Webhook Integration
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4A154B] text-white">
                  Incoming Webhooks
                </span>
              </div>
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white underline flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[11px] text-neutral-500">
              Paste your Slack Incoming Webhook URL to receive channel alerts formatted with Slack Markdown.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                value={config.slackWebhookUrl}
                onChange={e => setConfig(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                placeholder="https://hooks.slack.com/services/..."
                className="flex-1 px-3 py-2 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestSlack}
                disabled={testingSlack || !config.slackWebhookUrl.trim()}
                className="px-3.5 py-2 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className={`w-3 h-3 ${testingSlack ? 'animate-spin' : ''}`} />
                <span>{testingSlack ? 'Testing...' : 'Test Ping'}</span>
              </button>
            </div>

            {slackTestStatus && (
              <div className={`p-2 rounded text-[11px] font-bold flex items-center gap-1.5 ${
                slackTestStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/30'
              }`}>
                {slackTestStatus.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{slackTestStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Trigger Toggles */}
          <div className="p-4 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Event Subscriptions
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifyPriceHikes}
                onChange={e => setConfig(prev => ({ ...prev, notifyPriceHikes: e.target.checked }))}
                className="rounded text-black focus:ring-0"
              />
              <span className="text-neutral-800 dark:text-neutral-200 text-xs">
                Price Hike Detections (immediate dispatch on price changes)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifyRenewals}
                onChange={e => setConfig(prev => ({ ...prev, notifyRenewals: e.target.checked }))}
                className="rounded text-black focus:ring-0"
              />
              <span className="text-neutral-800 dark:text-neutral-200 text-xs">
                7-Day Renewal Countdowns
              </span>
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-black dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted local session storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-box bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-tiny"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Webhooks</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
