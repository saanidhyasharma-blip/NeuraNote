'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/components/theme-provider';
import { 
  BrainCircuit, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon, 
  Loader2,
  User as UserIcon,
  Archive,
  Star,
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth, isLoadingUser, logout } = useStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Workspace', href: '/dashboard', icon: BookOpen },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b13] transition-colors duration-300">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c121e] flex flex-col justify-between transition-colors hidden md:flex shrink-0">
        <div className="flex flex-col gap-6 p-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-5.2 h-5.2" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              NeuraNote
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserIcon className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.name}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-none mt-1">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Theme & Sign Out Buttons */}
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 dark:text-slate-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c121e] flex items-center justify-between px-5 md:hidden transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-lg text-slate-950 dark:text-white">NeuraNote</span>
          </div>

          <div className="flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-500'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
