'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  Search, 
  Share2, 
  TrendingUp, 
  Moon, 
  Sun, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const { user, checkAuth, isLoadingUser } = useStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070b13] dark:text-slate-100 transition-colors duration-300">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none dark:bg-indigo-500/5" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none dark:bg-teal-500/5" />

      {/* Floating Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-slate-50/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-[#070b13]/70 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              NeuraNote
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {!isLoadingUser && (
              <>
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-98 transition-all"
                  >
                    Go to Workspace <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/login" 
                      className="px-4.5 py-2 text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-4.5 py-2 rounded-xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-98 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/50 text-indigo-700 text-sm font-semibold mb-6 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-400"
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> Introducing AI-Powered Notes v2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-slate-950 to-slate-800 bg-clip-text text-transparent dark:from-white dark:to-slate-300 max-w-4xl leading-[1.1] mb-6"
        >
          The Collaborative AI Workspace <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
            For Thinking Minds
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-10"
        >
          Organize thoughts, automate task extractions, auto-generate executive summaries, and analyze team productivity inside a beautiful, secure notes console.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4.5 mb-20"
        >
          <Link 
            href="/signup" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-lg shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-semibold text-lg text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Sign In to Account
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5 w-full mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-7 rounded-2xl border border-slate-200 bg-white/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-start text-left dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              Advanced AI Actions
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-generate smart titles, create beautiful summaries, and extract task checkboxes instantly with local fallbacks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-7 rounded-2xl border border-slate-200 bg-white/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-start text-left dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5.5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Analytics Console
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Understand your productivity patterns with weekly volume charts, tag distribution, and deep audit tables.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-7 rounded-2xl border border-slate-200 bg-white/70 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-start text-left dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5.5">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Public Note Channels
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate static public paths for single notes instantly, allowing friction-free external viewing with sleek layouts.
            </p>
          </motion.div>
        </div>

        {/* Feature Checklists */}
        <div className="mt-28 py-10 border-t border-slate-200 dark:border-slate-800 w-full flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-12 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Built for Professional Grade Standard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl">
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">JWT Auth</h4>
                <p className="text-sm text-slate-500">Persistent Cookie Session</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Optimistic UI</h4>
                <p className="text-sm text-slate-500">Sub-second Local Sync</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Command Palette</h4>
                <p className="text-sm text-slate-500">CMD+K Global Search</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">PostgreSQL</h4>
                <p className="text-sm text-slate-500">Scalable Prisma Schema</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-slate-50/70 dark:border-slate-800/50 dark:bg-[#070b13]/70 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">NeuraNote Workspace</span>
          </div>
          <span>&copy; {new Date().getFullYear()} NeuraNote. Engineered for Peblo Developer Challenge.</span>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white">Register</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Login</Link>
            <a href="https://github.com/saanidhyasharma-blip" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
