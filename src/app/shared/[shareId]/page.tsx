'use client';

import React, { useEffect, useState, use } from 'react';
import axios from 'axios';
import { 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  Calendar, 
  FileText, 
  ListTodo, 
  CornerDownRight, 
  ArrowUpRight, 
  Eye, 
  Tag as TagIcon,
  CheckCircle,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  actionItems: any | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  category: { name: string } | null;
  tags: { id: string; name: string }[];
  user: { name: string; email: string };
}

export default function SharedNotePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const { theme, toggleTheme } = useTheme();

  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchShared() {
      try {
        const res = await axios.get(`/api/shared/${shareId}`);
        setNote(res.data.note);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Shared note not found or no longer public.');
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      fetchShared();
    }
  }, [shareId]);

  // Simplified Markdown parser for gorgeous public rendering
  const renderMarkdown = (mdText: string) => {
    if (!mdText) return <p className="text-slate-400 italic">Empty workspace.</p>;
    
    const lines = mdText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 pb-1 border-b border-slate-200 dark:border-slate-800">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith('> ')) {
        return <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1.5 italic text-slate-600 dark:text-slate-400 bg-indigo-50/20 dark:bg-indigo-950/10 my-3 rounded-r-md">{trimmed.substring(2)}</blockquote>;
      }
      if (trimmed.startsWith('- [ ] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 py-0.5">
            <input type="checkbox" disabled className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{trimmed.substring(6)}</span>
          </div>
        );
      }
      if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 py-0.5">
            <input type="checkbox" checked disabled className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
            <span className="text-slate-400 dark:text-slate-500 text-sm font-medium line-through">{trimmed.substring(6)}</span>
          </div>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc pl-5 my-0.5">
            <li className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{trimmed.substring(2)}</li>
          </ul>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2.5" />;
      }
      return <p key={idx} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-1.5">{trimmed}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b13]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Connecting to shared note channel...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b13] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Note Channel Unavailable</h3>
        <p className="text-slate-400 dark:text-slate-600 max-w-sm text-xs leading-relaxed mb-6">
          {error || 'This link has expired, been revoked, or the note has been toggled to private by the workspace owner.'}
        </p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all">
          Explore NeuraNote Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070b13] dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none dark:bg-indigo-500/5" />

      {/* Public Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-slate-50/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-[#070b13]/70 transition-colors">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">NeuraNote Shared Channel</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <Link 
              href="/signup" 
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/15 hover:bg-indigo-700 transition-all"
            >
              Create Workspace <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Core Markdown Note View (Left column, major width) */}
        <section className="flex-1 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 p-8 rounded-2xl shadow-md min-w-0">
          
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-semibold mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Created by: {note.user.name}
            </span>
            <span>•</span>
            <span>Last Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            {note.category && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  {note.category.name}
                </span>
              </>
            )}
          </div>

          <article className="prose dark:prose-invert max-w-none text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0 mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
              {note.title}
            </h1>
            <div className="space-y-2">
              {renderMarkdown(note.content)}
            </div>
          </article>
        </section>

        {/* AI Analytics Sidebar (Right column, static public panel) */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-6.5">
          
          {/* Executive Summary display */}
          {note.summary && (
            <div className="p-5 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> AI Executive Summary
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                {note.summary}
              </p>
            </div>
          )}

          {/* Action Items display */}
          {note.actionItems && (
            <div className="p-5 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4 h-4" /> AI Action Items
              </span>
              <div className="flex flex-col gap-2">
                {Array.isArray(note.actionItems) ? (
                  note.actionItems.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                      <CornerDownRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">{note.actionItems}</p>
                )}
              </div>
            </div>
          )}

          {/* Tags list */}
          {note.tags.length > 0 && (
            <div className="p-5 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 rounded-2xl shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-4 h-4" /> Document Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  >
                    <TagIcon className="w-2.5 h-2.5" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SaaS Workspace promo card */}
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-400 text-white rounded-2xl shadow-md flex flex-col gap-4">
            <Sparkles className="w-7 h-7 text-indigo-200" />
            <h4 className="font-extrabold text-sm leading-snug">
              Think faster with NeuraNote workspaces
            </h4>
            <p className="text-[11px] text-indigo-100 leading-relaxed font-semibold">
              Write, collaborate, and harness standard developer fallbacks and API-driven generative intelligence today.
            </p>
            <Link 
              href="/signup" 
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-indigo-600 hover:bg-slate-100 text-xs font-bold shadow-xs active:scale-98 transition-all"
            >
              Get Started Free <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </aside>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-white/70 dark:border-slate-800/50 dark:bg-[#070b13]/70 py-8 transition-colors mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">NeuraNote Shared Channel</span>
          </div>
          <span>&copy; {new Date().getFullYear()} NeuraNote. Peblo developer assignment submission.</span>
        </div>
      </footer>

    </div>
  );
}
