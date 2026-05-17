'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { BrainCircuit, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'framer-motion';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoadingUser, authError, checkAuth } = useStore();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = searchParams.get('from') || '/dashboard';

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const success = await login({ email, password });
    setIsSubmitting(false);

    if (success) {
      router.push(redirectPath);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#070b13] dark:text-slate-100 px-4 relative transition-colors duration-300">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none dark:bg-indigo-500/5" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none dark:bg-teal-500/5" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              NeuraNote
            </span>
          </Link>
        </div>

        <div className="bg-white/70 backdrop-blur-md dark:bg-slate-900/60 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
            Enter credentials to access your collaborative AI workspace.
          </p>

          {/* Error Message banner */}
          {(errorMsg || authError) && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400">
              {errorMsg || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingUser}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-50 disabled:active:scale-100 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create one here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
