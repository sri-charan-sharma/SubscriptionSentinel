import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BellRing,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Subscription, DashboardMetrics, ScrapeRun, ScrapeStatus, NotificationLog } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { SubscriptionTable } from './components/SubscriptionTable';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { NotificationLogsModal } from './components/NotificationLogsModal';
import { UrlSafetyInspectorModal } from './components/UrlSafetyInspectorModal';
import { SimulateHikeModal } from './components/SimulateHikeModal';
import { SidebarTelemetry } from './components/SidebarTelemetry';
import { CategoryChartModal } from './components/CategoryChartModal';
import { TelegramAlertModal } from './components/TelegramAlertModal';
import { CurrencyConverterModal } from './components/CurrencyConverterModal';
import { AuthModal } from './components/AuthModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ExpandedMenuDrawer } from './components/ExpandedMenuDrawer';
import { currencyService } from './services/currencyService';
import { authService } from './services/authService';
import { User } from './types/auth';

export const App: React.FC = () => {
  // Theme state: default to 'light' as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sentinel_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    monthlyBurn: { USD: 0, EUR: 0, GBP: 0, INR: 0 },
    yearlyBurn: { USD: 0, EUR: 0, GBP: 0, INR: 0 },
    activeCount: 0,
    renewalsNext7Days: 0,
    scrapeSuccessRate30d: 98.4
  });
  const [recentRuns, setRecentRuns] = useState<ScrapeRun[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [checkingSubId, setCheckingSubId] = useState<number | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [historySub, setHistorySub] = useState<Subscription | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSsrfInspectorOpen, setIsSsrfInspectorOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [simulateSub, setSimulateSub] = useState<Subscription | null>(null);

  // Expanded Left Menu Drawer State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuDrawerRef = useRef<HTMLElement>(null);

  // Close drawer on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDrawerRef.current && !menuDrawerRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="Toggle Menu"]')) {
          setIsMenuOpen(false);
        }
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getUser());

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    showToast('Signed Out', 'You have been logged out of Sentinel', 'info');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast('Authenticated', `Welcome back, ${user.email}`, 'success');
    refreshData();
  };

  // Currency Conversion state
  const [baseCurrency, setBaseCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>(() => currencyService.getBaseCurrency());
  const [isUnifiedMode, setIsUnifiedMode] = useState<boolean>(() => currencyService.isUnifiedMode());

  const handleSelectBaseCurrency = (curr: 'USD' | 'EUR' | 'GBP' | 'INR') => {
    setBaseCurrency(curr);
    currencyService.setBaseCurrency(curr);
    showToast('Base Currency Set', `Display currency changed to ${curr}`, 'info');
  };

  const handleToggleUnifiedMode = (enabled: boolean) => {
    setIsUnifiedMode(enabled);
    currencyService.setUnifiedMode(enabled);
    showToast('Currency Mode', enabled ? `Unified conversion to ${baseCurrency} enabled` : 'Native subscription currency mode active', 'info');
  };

  // Sync theme with <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sentinel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (title: string, desc: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const refreshData = useCallback(async () => {
    try {
      const [subs, dashMetrics, runs, logs] = await Promise.all([
        api.getSubscriptions(),
        api.getDashboardMetrics(),
        api.getScrapeRuns(),
        api.getNotificationLogs()
      ]);
      setSubscriptions(subs);
      setMetrics(dashMetrics);
      setRecentRuns(runs);
      setNotificationLogs(logs);
    } catch (e) {
      console.error('Failed to load sentinel data', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Action: Single subscription manual check
  const handleCheckNow = async (id: number) => {
    setCheckingSubId(id);
    try {
      const result = await api.checkSubscription(id);
      await refreshData();
      if (result.alertTriggered) {
        showToast(
          'PRICE HIKE DETECTED!',
          `${result.subscription.name} price increased to ${result.subscription.currency} ${result.subscription.current_price.toFixed(2)}. Alert sent!`,
          'alert'
        );
      } else if (result.scrapeResult.status === 'OK') {
        showToast(
          'Check Complete',
          `${result.subscription.name} checked. Status OK: ${result.scrapeResult.rawMatch || 'Price verified'}`,
          'success'
        );
      } else {
        showToast(
          `Scrape Flagged: ${result.scrapeResult.status}`,
          result.scrapeResult.error || 'Scraper failed to extract price',
          'alert'
        );
      }
    } catch (err: any) {
      showToast('Check Failed', err.message || 'Scrape execution failed', 'alert');
    } finally {
      setCheckingSubId(null);
    }
  };

  // Action: Batch Scheduled Run
  const handleTriggerBatch = async () => {
    setIsBatchRunning(true);
    try {
      const run = await api.triggerScheduledBatchRun();
      await refreshData();
      showToast(
        'Batch Run Complete',
        `Audited ${run.checked} subscriptions. Succeeded: ${run.succeeded}, Failed: ${run.failed}, Alerts Dispatched: ${run.alerts_sent}`,
        run.alerts_sent > 0 ? 'alert' : 'success'
      );
    } catch (err: any) {
      showToast('Batch Run Error', err.message, 'alert');
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Action: Save (Create or Update)
  const handleSaveSubscription = async (
    data: Omit<Subscription, 'id' | 'created_at' | 'consecutive_failures' | 'is_active'>
  ) => {
    if (editingSub) {
      await api.updateSubscription(editingSub.id, data);
      showToast('Updated', `Updated settings for ${data.name}`, 'success');
      setEditingSub(null);
    } else {
      await api.createSubscription(data);
      showToast('Added', `Tracking enabled for ${data.name}`, 'success');
    }
    await refreshData();
  };

  // Action: Delete (Soft delete)
  const handleDelete = async (id: number) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    if (window.confirm(`Deactivate "${sub.name}" from active sentinel tracking?`)) {
      await api.deleteSubscription(id);
      showToast('Deactivated', `Subscription #${id} marked inactive`, 'info');
      await refreshData();
    }
  };

  // Action: Diagnostics / Simulation
  const handleSimulateEvent = async (subId: number, newPrice?: number, status?: ScrapeStatus) => {
    const result = await api.checkSubscription(subId, newPrice, status);
    await refreshData();
    if (result.alertTriggered) {
      showToast(
        'PRICE HIKE SIMULATED!',
        `Recorded hike for ${result.subscription.name} to ${result.subscription.currency} ${result.subscription.current_price.toFixed(2)}. Deduplicated email sent.`,
        'alert'
      );
    } else {
      showToast(
        `Simulation Executed: ${result.scrapeResult.status}`,
        result.scrapeResult.error || `Recorded new state for ${result.subscription.name}`,
        result.scrapeResult.status === 'OK' ? 'success' : 'alert'
      );
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all subscriptions, price history, and logs to initial seed data?')) {
      api.resetToDefaultDemoData();
      refreshData();
      showToast('Demo Reset', 'Default datasets and audit logs restored', 'info');
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-white dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-150 overflow-hidden">

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 max-w-md w-full">
          <div className="p-3.5 rounded-box border border-black bg-white dark:bg-neutral-900 shadow-md flex items-start gap-3">
            {toastMessage.type === 'alert' && <BellRing className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {toastMessage.type === 'info' && <Activity className="w-4 h-4 text-neutral-700 dark:text-neutral-300 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-xs font-bold font-mono uppercase">
                {toastMessage.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 font-sans">
                {toastMessage.desc}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-neutral-400 hover:text-black dark:hover:text-white text-xs font-mono"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Top Header with Theme Toggle */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isBatchRunning={isBatchRunning}
        baseCurrency={baseCurrency}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(prev => !prev)}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onTriggerBatch={handleTriggerBatch}
        onOpenAddModal={() => { setEditingSub(null); setIsAddModalOpen(true); }}
        onOpenLogsModal={() => setIsLogsModalOpen(true)}
        onOpenCategoryChart={() => setIsCategoryModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Container - Full Fluid Width */}
      <main className="flex-1 min-h-0 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-col overflow-y-auto lg:overflow-hidden">

        {/* Two-Column Layout: Left Metrics Column + Right Subscriptions & Telemetry Block */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 items-stretch">

          {/* Left Column: 4 Metric Cards */}
          <aside ref={menuDrawerRef} className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0 relative">
            <div className="flex-1 min-h-0 flex flex-col">
              <MetricCards
                metrics={metrics}
                baseCurrency={baseCurrency}
                isUnifiedMode={isUnifiedMode}
                onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
              />
            </div>

            {/* Smooth Expanded Drawer Overlay aligned to Column Top and Bottom (Renewals block) */}
            <ExpandedMenuDrawer
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              user={currentUser}
              lastScrapeRun={recentRuns[0]}
              onOpenProfileSettings={() => setIsProfileModalOpen(true)}
              onLogout={handleLogout}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          </aside>

          {/* Right Column: Subscriptions Table + Expandable Telemetry & Alert Feed */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-3 min-h-0">
            <div className="flex-1 min-h-0 flex flex-col">
              <SubscriptionTable
                subscriptions={subscriptions}
                checkingSubId={checkingSubId}
                baseCurrency={baseCurrency}
                isUnifiedMode={isUnifiedMode}
                onCheckNow={handleCheckNow}
                onSimulateHike={(sub) => setSimulateSub(sub)}
                onOpenHistory={(sub) => setHistorySub(sub)}
                onEdit={(sub) => { setEditingSub(sub); setIsAddModalOpen(true); }}
                onDelete={handleDelete}
              />
            </div>
            <div className="flex-shrink-0">
              <SidebarTelemetry
                scrapeRuns={recentRuns}
                notificationLogs={notificationLogs}
                isBatchRunning={isBatchRunning}
                onTriggerBatch={handleTriggerBatch}
                onOpenLogsModal={() => setIsLogsModalOpen(true)}
              />
            </div>
          </div>

        </div>

      </main>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isAddModalOpen}
        subscriptionToEdit={editingSub}
        onClose={() => { setIsAddModalOpen(false); setEditingSub(null); }}
        onSave={handleSaveSubscription}
      />

      <PriceHistoryModal
        subscription={historySub}
        onClose={() => setHistorySub(null)}
      />

      <NotificationLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />

      <UrlSafetyInspectorModal
        isOpen={isSsrfInspectorOpen}
        onClose={() => setIsSsrfInspectorOpen(false)}
      />

      <SimulateHikeModal
        subscription={simulateSub}
        onClose={() => setSimulateSub(null)}
        onSimulate={handleSimulateEvent}
      />

      <CategoryChartModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        subscriptions={subscriptions}
        baseCurrency={baseCurrency}
        isUnifiedMode={isUnifiedMode}
      />

      <TelegramAlertModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentBaseCurrency={baseCurrency}
        onSelectBaseCurrency={handleSelectBaseCurrency}
        isUnifiedMode={isUnifiedMode}
        onToggleUnifiedMode={handleToggleUnifiedMode}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        baseCurrency={baseCurrency}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
      />

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-black dark:border-neutral-800 bg-white dark:bg-[#16181d] py-2.5 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400">
          <div>Subscription Sentinel</div>
        </div>
      </footer>

    </div>
  );
};

export default App;