'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  BookOpen, 
  Sparkles, 
  Archive, 
  Calendar, 
  TrendingUp, 
  Tag as TagIcon,
  Loader2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { dashboardData, isLoadingDashboard, fetchDashboardData } = useStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoadingDashboard || !dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#070b13]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Compiling productivity logs...</p>
        </div>
      </div>
    );
  }

  const { stats, recentlyEdited, mostUsedTags, weeklyActivity } = dashboardData;

  // Max count for chart normalization
  const maxWeeklyCount = Math.max(...weeklyActivity.map(d => d.count), 1);
  const maxTagCount = Math.max(...mostUsedTags.map(t => t.count), 1);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 dark:bg-[#070b13] dark:text-slate-100 p-8 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-slate-950 to-slate-800 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Productivity Analytics
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-1">
            Live insights, categorization distribution, and AI usage audit.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/50 text-indigo-700 text-xs font-bold dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-400">
          <Activity className="w-3.5 h-3.5" /> Workspace Sync: Active
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Total Notes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2 relative group hover:border-indigo-500/40 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.totalNotes}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Active Insights
          </span>
        </motion.div>

        {/* AI Generations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2 relative group hover:border-pink-500/40 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.aiGenerationsCount}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            AI Prompts Run
          </span>
        </motion.div>

        {/* Notes Created This Week */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2 relative group hover:border-emerald-500/40 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.notesCreatedThisWeek}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Created This Week
          </span>
        </motion.div>

        {/* Archived Notes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-2 relative group hover:border-slate-500/40 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.archivedNotes}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Archived Files
          </span>
        </motion.div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Chart A: 7-Day Note Volume activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Workspace Growth Activity</h3>
          </div>

          {/* SVG Graph bars */}
          <div className="flex-1 flex items-end justify-between gap-3 h-48 px-2 mt-4 relative">
            {weeklyActivity.map((day, index) => {
              const heightPercent = (day.count / maxWeeklyCount) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all shadow-xs relative"
                  />
                  <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap truncate w-full text-center">
                    {day.date.split(',')[0] || day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Chart B: Category Tags Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-4.5 h-4.5 text-pink-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Most Active Workspace Tags</h3>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center mt-3">
            {mostUsedTags.length === 0 ? (
              <p className="text-xs text-slate-400 text-center italic py-10">No tags added yet. Open notes editor to insert tags.</p>
            ) : (
              mostUsedTags.map((tag) => {
                const widthPercent = (tag.count / maxTagCount) * 100;
                return (
                  <div key={tag.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <TagIcon className="w-3 h-3 text-pink-500" /> #{tag.name}
                      </span>
                      <span className="text-slate-400">{tag.count} Notes</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-indigo-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>

      {/* Recently Edited Workspace Audit Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Workspace Activity Log</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Audit View
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Insights File</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Last Modified</th>
                <th className="pb-3">Collaborative Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {recentlyEdited.map((note) => (
                <tr key={note.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                  <td className="py-3.5 pl-2">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-bold">{note.title || 'Untitled Note'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{note.content}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    {note.category ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {note.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-[10px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      <ShieldCheck className="w-3 h-3" /> Synced to cloud
                    </span>
                  </td>
                </tr>
              ))}
              {recentlyEdited.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 italic">No notes created yet. Go to Workspace to create notes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
