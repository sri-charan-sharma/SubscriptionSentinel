import React, { useEffect, useState } from 'react';
import { X, Bell, Mail, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { NotificationLog } from '../types';
import { api } from '../services/api';

interface NotificationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationLogsModal: React.FC<NotificationLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getNotificationLogs().then(setLogs);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-3xl rounded-box shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Price-Hike Alert Logs
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Audit trail from notification_log table
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

        {/* Deduplication Guarantee Banner */}
        <div className="p-3.5 bg-gray-50 dark:bg-neutral-950 border-b border-black dark:border-neutral-700 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            Deduplication Key: UNIQUE (subscription_id, alert_type, price)
          </div>
          <p className="text-neutral-500 text-[11px]">
            Guarantees idempotent alerts. If a price fluctuates (15.99 → 17.99 → 15.99 → 17.99), only one alert is transmitted for the 17.99 tier.
          </p>
        </div>

        {/* Log table */}
        <div className="p-5 overflow-y-auto bg-white dark:bg-neutral-900">
          {logs.length === 0 ? (
            <div className="py-10 text-center text-neutral-500 font-mono text-xs">
              No alert notifications have been dispatched yet.
            </div>
          ) : (
            <div className="rounded-box border border-black dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-gray-100 dark:bg-neutral-800 text-[10px] uppercase text-neutral-600 dark:text-neutral-400 border-b border-black dark:border-neutral-700">
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Price Shift</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Dispatched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">
                        {log.subscription_name || `Sub #${log.subscription_id}`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700">
                          {log.alert_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-neutral-500 line-through mr-1">
                          {log.currency} {log.old_price.toFixed(2)}
                        </span>
                        <span className="text-neutral-900 dark:text-white font-bold">
                          → {log.currency} {log.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{log.channel}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-black dark:border-neutral-700 bg-white dark:bg-neutral-800 ${
                          log.status === 'SENT'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : log.status === 'PENDING'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {log.status === 'SENT' && <CheckCircle2 className="w-3 h-3" />}
                          {log.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {log.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
