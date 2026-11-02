import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (mode === 'REGISTER' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      let user: User;
      if (mode === 'LOGIN') {
        user = await authService.login(email.trim(), password);
      } else {
        user = await authService.register(email.trim(), password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await authService.quickDemoLogin();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 w-full max-w-md rounded-box shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black dark:border-neutral-700 flex items-center justify-between bg-gray-100 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white dark:bg-neutral-900 border border-black dark:border-neutral-700 text-neutral-900 dark:text-white">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono uppercase">
                Sentinel Authentication
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                JWT Stateless Multi-User Access
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

        {/* Tab Toggle */}
        <div className="p-5 pb-0 bg-white dark:bg-neutral-900 font-mono text-xs">
          <div className="grid grid-cols-2 gap-1 p-1 rounded bg-gray-100 dark:bg-neutral-800 border border-black dark:border-neutral-700">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setErrorMessage(null); }}
              className={`py-1.5 text-center font-bold rounded transition-colors ${
                mode === 'LOGIN'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMessage(null); }}
              className={`py-1.5 text-center font-bold rounded transition-colors ${
                mode === 'REGISTER'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white dark:bg-neutral-900 font-mono text-xs">
          
          {errorMessage && (
            <div className="p-3 rounded border border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 dark:text-neutral-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded bg-gray-50 dark:bg-neutral-800 border border-black dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <ShieldCheck className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-xs border border-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'LOGIN' ? 'Sign In' : 'Register Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-black/10 dark:border-neutral-800">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black dark:border-neutral-700 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Demo Login (Sentinel Operator)</span>
            </button>
            <p className="text-[10px] text-neutral-500 text-center mt-1.5">
              Logs in immediately as pre-configured administrator
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};

