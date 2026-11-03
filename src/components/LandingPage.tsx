import React, { useState } from 'react';
import {
  Shield,
  Sun,
  Moon,
  ArrowRight,
  TrendingUp,
  Clock,
  Coins,
  Send,
  Eye,
  Check,
  Layers,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types/auth';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user?: User | null;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onEnterDashboard: () => void;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
  user,
  onOpenLogin,
  onOpenSignUp,
  onEnterDashboard,
  onLogout
}) => {
  // State to track which feature block is currently hovered for spotlight & dimming
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0e1015] text-neutral-900 dark:text-neutral-100 font-mono flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black relative">
      
      {/* Very Light Background Dimming Overlay */}
      <div 
        className={`fixed inset-0 bg-black/10 dark:bg-black/25 pointer-events-none transition-opacity duration-300 ease-in-out z-20 ${
          hoveredFeature !== null ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* 1. Header Bar */}
      <header className="sticky top-0 w-full border-b border-black dark:border-neutral-800 bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-sm px-6 sm:px-10 lg:px-16 py-3.5 flex items-center justify-between z-40 flex-shrink-0">
        
        {/* Left: Brand / Logo */}
        <div 
          onClick={onEnterDashboard}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-neutral-900 dark:text-white">
            SUBSENT
          </span>
        </div>

        {/* Right Header Controls: Theme Toggle, LOGIN, SIGN UP */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {user ? (
            <>
              {/* Dashboard Button */}
              <button
                onClick={onEnterDashboard}
                className="px-4 py-1.5 rounded-box bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                title="Enter your dashboard"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Sign Out Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3.5 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="Sign out of Sentinel"
                >
                  <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </>
          ) : (
            <>
              {/* LOGIN Button */}
              <button
                onClick={onOpenLogin}
                className="px-4 py-1.5 rounded-box bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-black dark:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white transition-colors cursor-pointer"
              >
                LOGIN
              </button>

              {/* SIGN UP Button */}
              <button
                onClick={onOpenSignUp}
                className="px-4 py-1.5 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border border-black dark:border-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                SIGN UP
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Headline Area (Top) */}
      <section className="w-full px-6 sm:px-10 lg:px-16 pt-10 pb-8 border-b border-black/10 dark:border-neutral-800 bg-white dark:bg-[#121418] z-10">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] uppercase text-neutral-900 dark:text-white">
            MANAGE ALL YOUR SUBSCRIPTIONS IN ONE PLACE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Automated price checking, renewal countdown warnings, and unified multi-currency tracking for all your recurring software, cloud, and media services.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onEnterDashboard}
              className="px-6 py-2.5 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border-2 border-black dark:border-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {user ? (
              <div className="px-4 py-2 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 font-mono text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate max-w-[200px]">{user.email}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-box bg-white dark:bg-[#16181d] hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-black dark:border-neutral-700 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-neutral-500" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Alternating 5 Points Section with Interactive Focus & Scale Hover Animation */}
      <section className="w-full px-6 sm:px-10 lg:px-16 py-10 space-y-8 sm:space-y-12">

        {/* ----------------- POINT 1: Text -> Infographic ----------------- */}
        <div
          onMouseEnter={() => setHoveredFeature(1)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`p-6 sm:p-8 rounded-box transition-all duration-300 ease-out cursor-default relative ${
            hoveredFeature === 1
              ? 'z-30 scale-[1.03] bg-white dark:bg-[#16181d]'
              : hoveredFeature !== null
                ? 'opacity-40 scale-[0.99]'
                : 'bg-transparent'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Text Left */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Feature 01</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Live Price Tracking
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Automatically detects silent price hikes before unexpected charges hit your card. Sentinel continuously checks subscription pricing pages in the background using automated scrapers, flagging increases the moment they are published.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Background DOM & CSS selector scraping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Historical price change & hike percentage tracking</span>
                </div>
              </div>
            </div>

            {/* Infographic Right: Price Hike Detection Card */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-box border-2 border-black dark:border-neutral-700 bg-white dark:bg-[#16181d] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-5 space-y-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">PRICE MONITOR // DETECTOR</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 font-bold uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                        S
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase text-neutral-900 dark:text-white">Spotify Premium</div>
                        <div className="text-[10px] text-neutral-500">Streaming • Monthly</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs line-through text-neutral-400 font-mono">$9.99</div>
                      <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">$12.99 / mo</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 dark:border-neutral-800 flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded-box border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold">
                      +30.0% HIKE DETECTED
                    </span>
                    <span className="text-neutral-500">Checked 1m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- POINT 2: Infographic -> Text ----------------- */}
        <div
          onMouseEnter={() => setHoveredFeature(2)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`p-6 sm:p-8 rounded-box transition-all duration-300 ease-out cursor-default relative ${
            hoveredFeature === 2
              ? 'z-30 scale-[1.03] bg-white dark:bg-[#16181d]'
              : hoveredFeature !== null
                ? 'opacity-40 scale-[0.99]'
                : 'bg-transparent'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Infographic Left: Renewal Countdown Card */}
            <div className="w-full flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="w-full max-w-md rounded-box border-2 border-black dark:border-neutral-700 bg-white dark:bg-[#16181d] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-5 space-y-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">RENEWAL SENTINEL // TIMELINE</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 font-bold uppercase">
                    URGENT
                  </span>
                </div>

                <div className="p-3.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-box bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-900 dark:text-white">
                        A
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase text-neutral-900 dark:text-white">AWS EC2 Reserved</div>
                        <div className="text-[10px] text-neutral-500">Cloud Infrastructure</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-box border border-black dark:border-white font-bold text-[9px] uppercase">
                        IN 3 DAYS
                      </span>
                    </div>
                  </div>

                  {/* Countdown Progress Visualizer */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>Billing cycle progress</span>
                      <span className="font-bold text-neutral-900 dark:text-white">90% elapsed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full w-[90%] bg-black dark:bg-white rounded-full" />
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-400 pt-0.5">
                      <span>Start: Oct 06</span>
                      <span>Renewal: Nov 05</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Right */}
            <div className="space-y-3 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Feature 02</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Renewal Deadlines
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Clear countdown alerts so you can cancel or re-evaluate services before auto-renewing. Never be blindsided by an unexpected annual subscription charge again with prioritized 7-day renewal warnings.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>7-day upcoming renewal deadline alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Prevents unwanted monthly & annual card auto-charges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- POINT 3: Text -> Infographic ----------------- */}
        <div
          onMouseEnter={() => setHoveredFeature(3)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`p-6 sm:p-8 rounded-box transition-all duration-300 ease-out cursor-default relative ${
            hoveredFeature === 3
              ? 'z-30 scale-[1.03] bg-white dark:bg-[#16181d]'
              : hoveredFeature !== null
                ? 'opacity-40 scale-[0.99]'
                : 'bg-transparent'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Text Left */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5" />
                <span>Feature 03</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Multi-Currency Conversion
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Unified spending view in USD, EUR, GBP, or INR with live exchange rates. View your true monthly burn rate in your native currency regardless of whether your subscriptions charge in Dollars, Euros, or Pounds.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Automatic live exchange rate synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Unified total monthly & annualized burn calculation</span>
                </div>
              </div>
            </div>

            {/* Infographic Right: Multi-Currency Converter Card */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-box border-2 border-black dark:border-neutral-700 bg-white dark:bg-[#16181d] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-5 space-y-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">CURRENCY ENGINE // UNIFIED</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded-box bg-black dark:bg-white text-white dark:text-black font-bold text-[8px]">USD</span>
                    <span className="px-1.5 py-0.5 rounded-box border border-black/20 dark:border-neutral-700 text-neutral-500 text-[8px]">EUR</span>
                    <span className="px-1.5 py-0.5 rounded-box border border-black/20 dark:border-neutral-700 text-neutral-500 text-[8px]">INR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Netflix (USD 22.99)</span>
                    <span className="font-bold font-mono">≈ ₹2,105.95 / mo</span>
                  </div>
                  <div className="p-2.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Spotify (EUR 11.99)</span>
                    <span className="font-bold font-mono">≈ ₹1,272.26 / mo</span>
                  </div>
                  <div className="p-3 rounded-box bg-black dark:bg-white text-white dark:text-black flex items-center justify-between font-bold text-xs">
                    <span>UNIFIED MONTHLY BURN</span>
                    <span className="text-sm font-mono">₹47,909.27</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- POINT 4: Infographic -> Text ----------------- */}
        <div
          onMouseEnter={() => setHoveredFeature(4)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`p-6 sm:p-8 rounded-box transition-all duration-300 ease-out cursor-default relative ${
            hoveredFeature === 4
              ? 'z-30 scale-[1.03] bg-white dark:bg-[#16181d]'
              : hoveredFeature !== null
                ? 'opacity-40 scale-[0.99]'
                : 'bg-transparent'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Infographic Left: Telegram Alert Bubble Card */}
            <div className="w-full flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="w-full max-w-md rounded-box border-2 border-black dark:border-neutral-700 bg-white dark:bg-[#16181d] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-5 space-y-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">TELEGRAM BOT // @SentinelAlertsBot</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 font-bold uppercase">
                    LIVE
                  </span>
                </div>

                {/* Telegram Message Mockup */}
                <div className="p-3.5 rounded-box bg-gray-50 dark:bg-neutral-900 border border-black/10 dark:border-neutral-800 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Send className="w-3 h-3" />
                      Subscription Sentinel Alert
                    </span>
                    <span>1:38 PM</span>
                  </div>

                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="font-bold text-neutral-900 dark:text-white">
                      ⚠️ Price Hike Detected: Spotify Individual
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Old price: €9.99/mo → New price: €11.99/mo (+20.0%)
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Auto-verified via Jsoup web selector scraper
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/10 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Delivered to Chat #941042</span>
                    <span className="font-bold text-neutral-900 dark:text-white">✓✓ Read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Right */}
            <div className="space-y-3 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <Send className="w-3.5 h-3.5" />
                <span>Feature 04</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Instant Telegram Alerts
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Real-time alerts dispatched directly to your phone for all price and renewal changes. Connect your Telegram Chat ID in seconds to receive instant notifications the moment a price shift or renewal deadline approaches.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Instant push notification without opening any app</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>One-click Telegram Bot configuration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- POINT 5: Text -> Infographic ----------------- */}
        <div
          onMouseEnter={() => setHoveredFeature(5)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`p-6 sm:p-8 rounded-box transition-all duration-300 ease-out cursor-default relative ${
            hoveredFeature === 5
              ? 'z-30 scale-[1.03] bg-white dark:bg-[#16181d]'
              : hoveredFeature !== null
                ? 'opacity-40 scale-[0.99]'
                : 'bg-transparent'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* Text Left */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-box bg-gray-100 dark:bg-neutral-800 border border-black/20 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Feature 05</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                Centralized Ledger
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Consolidated view of SaaS, streaming, and cloud services without spreadsheets. Organize categories, filter active subscriptions, inspect price check health, and track your total cost of ownership in one dashboard.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Zero manual spreadsheet maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
                  <span>Automated audit logs & URL resilience diagnostics</span>
                </div>
              </div>
            </div>

            {/* Infographic Right: Centralized Ledger Mini Table Card */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-box border-2 border-black dark:border-neutral-700 bg-white dark:bg-[#16181d] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-5 space-y-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer">
                <div className="flex items-center justify-between border-b border-black/10 dark:border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">CENTRALIZED LEDGER // 6 ACTIVE</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 font-bold uppercase">
                    AUDITED
                  </span>
                </div>

                <div className="divide-y divide-black/10 dark:divide-neutral-800 rounded-box border border-black/10 dark:border-neutral-800 overflow-hidden text-xs">
                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">Equinox Fitness Club</div>
                      <div className="text-[10px] text-neutral-500">USD 3600.00 / yr</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[8px] font-bold">
                      OK
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#16181d] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">AWS EC2 Reserved</div>
                      <div className="text-[10px] text-neutral-500">USD 139.50 / mo</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-box border border-black dark:border-white text-[8px] font-bold">
                      SOON
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">GitHub Copilot Pro</div>
                      <div className="text-[10px] text-neutral-500">USD 10.00 / mo</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-box border border-black dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[8px] font-bold">
                      OK
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                  <span>Total Active Services: 6</span>
                  <span className="font-bold text-neutral-900 dark:text-white">All Monitors Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 4. Bottom Action Call to Action */}
      <section className="w-full px-6 sm:px-10 lg:px-16 py-12 border-t border-black dark:border-neutral-800 bg-gray-50 dark:bg-[#121418] text-center space-y-5 z-10">
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Ready to Take Control of Your Subscriptions?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
          Start monitoring recurring services for price adjustments, renewal countdowns, and currency conversions today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterDashboard}
            className="px-6 py-2.5 rounded-box bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black border-2 border-black dark:border-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {!user && (
            <button
              onClick={onOpenSignUp}
              className="px-5 py-2.5 rounded-box bg-white dark:bg-[#16181d] hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border-2 border-black dark:border-neutral-700 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Create Free Account</span>
            </button>
          )}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full border-t border-black dark:border-neutral-800 bg-white dark:bg-[#16181d] py-3 px-6 sm:px-10 lg:px-16 flex items-center justify-between text-xs text-neutral-400 flex-shrink-0 z-10">
        <div>Subscription Sentinel • Automated Price & Renewal Monitor</div>
        <div className="text-[11px] text-neutral-500 font-mono">v1.0.4</div>
      </footer>

    </div>
  );
};
