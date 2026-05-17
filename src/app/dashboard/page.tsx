'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore, Note } from '@/store/useStore';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Star, 
  Archive, 
  Trash2, 
  Share2, 
  Copy, 
  Check, 
  FolderPlus, 
  Tag as TagIcon, 
  CloudRain, 
  CheckCircle, 
  Loader2, 
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  FileText,
  ListTodo,
  TrendingUp,
  BrainCircuit,
  CornerDownRight,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Eye,
  Edit,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const {
    notes,
    activeNote,
    isLoadingNotes,
    searchQuery,
    activeTag,
    activeCategory,
    sortBy,
    isArchivedView,
    isFavoritesOnly,
    
    setSearchQuery,
    setActiveTag,
    setActiveCategory,
    setSortBy,
    setIsArchivedView,
    setIsFavoritesOnly,
    
    fetchNotes,
    setActiveNote,
    createNote,
    updateNote,
    deleteNote,
    
    // AI Operations
    isGeneratingAI,
    aiError,
    generateAISummary,
    extractAIActionItems,
    generateAITitle,
    improveWriting
  } = useStore();

  // Internal states
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Custom Tag & Category input states
  const [newTagInput, setNewTagInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAutosaving, setIsAutosaving] = useState(false);
  
  // Keep track of search value locally before triggering debounce if desired
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // 2. Keyboard shortcuts hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K -> Command Palette Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      
      // CMD/CTRL + N -> Create new note
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
      }

      // CMD/CTRL + S -> Save note manual trigger
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeNote) {
          triggerImmediateSync();
        }
      }

      // CMD/CTRL + Shift + A -> AI Sidebar Toggle
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAiSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote]);

  // 3. Debounced Autosave Logic
  const handleContentChange = (field: 'title' | 'content', value: string) => {
    if (!activeNote) return;

    // Apply immediate local update to Zustand store (optimistic)
    updateNote(activeNote.id, { [field]: value });

    // Mark autosaving state
    setIsAutosaving(true);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      // Autosave actually happens because updateNote pushes to API.
      // We wait for updateNote to complete in the background.
      setIsAutosaving(false);
    }, 1200);
  };

  const triggerImmediateSync = async () => {
    if (!activeNote) return;
    setIsAutosaving(true);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    
    // Explicit save
    await updateNote(activeNote.id, {
      title: activeNote.title,
      content: activeNote.content
    });
    setIsAutosaving(false);
  };

  // Note actions
  const handleCreateNote = async () => {
    const defaultData = {
      title: 'Untitled Insights',
      content: '',
      category: activeCategory || 'Workspace',
      tags: activeTag ? [activeTag] : []
    };
    const note = await createNote(defaultData);
    if (note) {
      setActiveNote(note);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this note?')) {
      await deleteNote(id);
    }
  };

  // AI Triggers
  const handleAISummary = async () => {
    if (!activeNote) return;
    await generateAISummary(activeNote.id);
  };

  const handleAIActionItems = async () => {
    if (!activeNote) return;
    await extractAIActionItems(activeNote.id);
  };

  const handleAITitle = async () => {
    if (!activeNote) return;
    await generateAITitle(activeNote.id);
  };

  const handleAIImprove = async () => {
    if (!activeNote) return;
    await improveWriting(activeNote.id);
  };

  // Public Sharing toggler
  const handleToggleShare = async () => {
    if (!activeNote) return;
    const isNowPublic = !activeNote.isPublic;
    await updateNote(activeNote.id, { isPublic: isNowPublic });
  };

  const copyShareLink = () => {
    if (!activeNote || !activeNote.shareId) return;
    const shareUrl = `${window.location.origin}/shared/${activeNote.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  // Categories and Tags creation helpers
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newTagInput.trim()) return;

    const normalized = newTagInput.trim();
    const currentTags = activeNote.tags.map(t => t.name);

    if (!currentTags.includes(normalized)) {
      const updatedTags = [...currentTags, normalized];
      await updateNote(activeNote.id, { tags: updatedTags } as any);
    }

    setNewTagInput('');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newCategoryInput.trim()) return;

    const normalized = newCategoryInput.trim();
    await updateNote(activeNote.id, { category: normalized } as any);
    setNewCategoryInput('');
  };

  // Word count and Reading Time calculator
  const getEditorStats = () => {
    const text = activeNote?.content || '';
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200); // Average 200 wpm
    return { words, chars, readingTime };
  };

  const editorStats = getEditorStats();

  // Custom simplified Markdown parser to guarantee instant reactivity & gorgeous view styling
  const renderMarkdown = (mdText: string) => {
    if (!mdText) return <p className="text-slate-400 italic">Empty workspace. Start typing above...</p>;
    
    const lines = mdText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // H1 Header
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 pb-1 border-b border-slate-200 dark:border-slate-800">{trimmed.substring(2)}</h1>;
      }
      // H2 Header
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{trimmed.substring(3)}</h2>;
      }
      // H3 Header
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">{trimmed.substring(4)}</h3>;
      }
      // Blockquote
      if (trimmed.startsWith('> ')) {
        return <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1.5 italic text-slate-600 dark:text-slate-400 bg-indigo-50/20 dark:bg-indigo-950/10 my-3 rounded-r-md">{trimmed.substring(2)}</blockquote>;
      }
      // Todo checked/unchecked list
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
      // Bullet list item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc pl-5 my-0.5">
            <li className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{trimmed.substring(2)}</li>
          </ul>
        );
      }
      // Empty line
      if (trimmed === '') {
        return <div key={idx} className="h-2.5" />;
      }
      // Paragraph
      return <p key={idx} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-1.5">{trimmed}</p>;
    });
  };

  // Build filter sets dynamically from currently loaded notes
  const availableCategories = Array.from(
    new Set(notes.map(n => n.category?.name).filter(Boolean))
  ) as string[];

  const availableTags = Array.from(
    new Set(notes.flatMap(n => n.tags.map(t => t.name)).filter(Boolean))
  ) as string[];

  return (
    <div className="flex-1 flex overflow-hidden relative">
      
      {/* 1. Left Sidebar: Notes Navigator & Dynamic Filters */}
      <aside className="w-80 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#090d16] flex flex-col shrink-0">
        
        {/* Search & Actions Header */}
        <div className="p-4.5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workspaces (Ctrl+K)..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs shadow-md shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-4 h-4" /> New Insights Note
          </button>
        </div>

        {/* Dynamic Filters panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Main Filter categories (Favorites, Archives) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">Filters</span>
            <button
              onClick={() => setIsFavoritesOnly(!isFavoritesOnly)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isFavoritesOnly 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isFavoritesOnly ? 'fill-amber-400 text-amber-500' : ''}`} /> Favorites
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {notes.filter(n => n.isFavorite).length}
              </span>
            </button>
            <button
              onClick={() => setIsArchivedView(!isArchivedView)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isArchivedView 
                  ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <Archive className="w-4 h-4" /> Archived
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {notes.filter(n => n.isArchived).length}
              </span>
            </button>
          </div>

          {/* Categories Filter */}
          {availableCategories.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">Categories</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  onClick={() => setActiveCategory('')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    !activeCategory 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  All
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      cat === activeCategory 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      tag === activeTag 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <TagIcon className="w-2.5 h-2.5" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sorting Controller */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">Sorting</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 mt-1 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold focus:outline-none"
            >
              <option value="recent">Recently Updated</option>
              <option value="oldest">Date Created (Oldest)</option>
              <option value="alphabetical">Alphabetical Title</option>
            </select>
          </div>
        </div>

        {/* Clear Filters CTA */}
        {(activeTag || activeCategory || isFavoritesOnly || isArchivedView || searchQuery) && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
            <button
              onClick={() => {
                setActiveTag('');
                setActiveCategory('');
                setIsFavoritesOnly(false);
                setIsArchivedView(false);
                setSearchQuery('');
                setLocalSearch('');
              }}
              className="w-full py-1.5 rounded-lg border border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-400 dark:bg-indigo-950/20 text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Clear Workspace Filters
            </button>
          </div>
        )}
      </aside>

      {/* 2. Middle Panel: Filtered Notes Grid List */}
      <section className="w-80 border-r border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-[#070b13] flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Notes ({notes.length})
          </span>
          <span className="text-[10px] text-slate-400">
            {isArchivedView ? 'Archived View' : 'Workspace Notes'}
          </span>
        </div>

        {isLoadingNotes ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-slate-400 dark:text-slate-600 text-xs font-medium">No matches in workspace.</p>
          </div>
        ) : (
          <div className="flex flex-col p-3 gap-2">
            {notes.map((note) => {
              const isActive = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col gap-2 relative group ${
                    isActive 
                      ? 'bg-white border-indigo-600 shadow-md dark:bg-slate-900 dark:border-indigo-500' 
                      : 'bg-white/40 border-slate-200/60 hover:bg-white hover:border-slate-300 dark:bg-slate-900/20 dark:border-slate-800/60 dark:hover:bg-slate-900/60'
                  }`}
                >
                  {/* Pin Indicator */}
                  {note.isPinned && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}

                  {/* Title & Favorite Star */}
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[80%]">
                      {note.title || 'Untitled Note'}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNote(note.id, { isFavorite: !note.isFavorite });
                      }}
                      className={`p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        note.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Body Snippet */}
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content || <span className="italic">Empty workspace insights...</span>}
                  </p>

                  {/* Date & Labels */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    
                    {/* Category Label */}
                    {note.category && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold truncate max-w-[50%]">
                        {note.category.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Right Panel: Active Note Editor & Workspace Panel */}
      <section className="flex-1 flex bg-white dark:bg-[#0c121e] overflow-hidden">
        {activeNote ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Editor Top Bar Controls */}
            <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
              
              {/* Left widgets: Save, Pinned status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateNote(activeNote.id, { isPinned: !activeNote.isPinned })}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                    activeNote.isPinned 
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  {activeNote.isPinned ? 'Pinned Workspace' : 'Pin Note'}
                </button>

                <button
                  onClick={() => updateNote(activeNote.id, { isArchived: !activeNote.isArchived })}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                    activeNote.isArchived 
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  {activeNote.isArchived ? 'Unarchive' : 'Archive'}
                </button>

                <button
                  onClick={() => handleDeleteNote(activeNote.id)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-950/40 dark:bg-slate-900 dark:hover:bg-rose-950/20 dark:text-rose-400 text-[10px] font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              {/* Right widgets: Mode Switch, AI Panel toggle, Share toggle */}
              <div className="flex items-center gap-2.5">
                {/* Save status check */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mr-2">
                  {isAutosaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Workspace Synced</span>
                    </>
                  )}
                </div>

                {/* Editor Edit / Preview Switch */}
                <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      editorMode === 'edit'
                        ? 'bg-white shadow-xs text-indigo-600 dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      editorMode === 'preview'
                        ? 'bg-white shadow-xs text-indigo-600 dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>

                {/* Toggle AI Sidebar Panel */}
                <button
                  onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isAiSidebarOpen
                      ? 'border-indigo-500/30 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                  }`}
                  title="Toggle AI Copilot"
                >
                  <Sparkles className="w-4 h-4 animate-float" />
                </button>
              </div>

            </div>

            {/* Tags & Categories Metadata Pill Panel */}
            <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-900 flex flex-wrap items-center justify-between gap-3 bg-slate-50/10 shrink-0">
              
              {/* Left: Category and Tags inline list */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Category metadata */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
                  {activeNote.category ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-indigo-200/50 bg-indigo-50/50 text-indigo-600 text-[10px] font-bold dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-400">
                      {activeNote.category.name}
                      <button 
                        onClick={() => updateNote(activeNote.id, { category: null })}
                        className="hover:text-rose-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ) : (
                    <form onSubmit={handleAddCategory} className="flex items-center">
                      <input
                        type="text"
                        placeholder="Add to category..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="px-2 py-0.5 rounded border border-slate-200 bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none focus:border-indigo-500 dark:border-slate-800"
                      />
                    </form>
                  )}
                </div>

                {/* Tags metadata list */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                  {activeNote.tags.map(tag => (
                    <span 
                      key={tag.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    >
                      <TagIcon className="w-2.5 h-2.5" />
                      {tag.name}
                      <button
                        onClick={async () => {
                          const updatedTags = activeNote.tags.filter(t => t.id !== tag.id).map(t => t.name);
                          await updateNote(activeNote.id, { tags: updatedTags } as any);
                        }}
                        className="hover:text-rose-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {/* Inline new tag trigger */}
                  <form onSubmit={handleAddTag} className="flex items-center">
                    <input
                      type="text"
                      placeholder="+ Tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="px-2 py-0.5 rounded border border-slate-200 bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none focus:border-indigo-500 dark:border-slate-800"
                    />
                  </form>
                </div>
              </div>

              {/* Right: Keyboard Shortcuts trigger */}
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Keyboard Shortcuts
              </button>
            </div>

            {/* Custom Interactive Keyboard shortcuts banner overlay */}
            <AnimatePresence>
              {showShortcuts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 px-6 py-3 flex flex-wrap gap-4 items-center justify-between text-xs text-indigo-800 dark:text-indigo-300 font-medium shrink-0"
                >
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-indigo-200 dark:bg-slate-900 dark:border-indigo-900 font-mono shadow-xs">Ctrl+N</kbd> New Note</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-indigo-200 dark:bg-slate-900 dark:border-indigo-900 font-mono shadow-xs">Ctrl+K</kbd> Search Palettes</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-indigo-200 dark:bg-slate-900 dark:border-indigo-900 font-mono shadow-xs">Ctrl+S</kbd> Manual Cloud Sync</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-indigo-200 dark:bg-slate-900 dark:border-indigo-900 font-mono shadow-xs">Ctrl+Shift+A</kbd> AI Sidebar</span>
                  </div>
                  <button 
                    onClick={() => setShowShortcuts(false)}
                    className="hover:text-indigo-900 font-bold dark:hover:text-white"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Note Editor text box / Split rendering panel */}
            <div className="flex-1 overflow-y-auto px-8 py-6 relative">
              {editorMode === 'edit' ? (
                <div className="flex flex-col gap-4 min-h-full">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleContentChange('title', e.target.value)}
                    placeholder="Title your thoughts..."
                    className="w-full text-3xl font-extrabold bg-transparent text-slate-900 dark:text-white border-0 outline-hidden focus:ring-0 placeholder-slate-300 dark:placeholder-slate-700"
                  />
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    placeholder="Type details in markdown or normal text... Let your mind connect ideas."
                    className="w-full flex-1 bg-transparent text-slate-800 dark:text-slate-200 outline-hidden border-0 resize-none text-sm leading-relaxed placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none min-h-[400px]"
                  />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none text-left">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0 mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                    {activeNote.title || 'Untitled Note'}
                  </h1>
                  <div className="space-y-2">
                    {renderMarkdown(activeNote.content)}
                  </div>
                </div>
              )}
            </div>

            {/* Editor Footer Stats Bar */}
            <footer className="px-6 py-2.5 border-t border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 flex items-center justify-between text-[10px] text-slate-400 font-semibold shrink-0">
              <div className="flex items-center gap-4">
                <span>{editorStats.words} Words</span>
                <span>{editorStats.chars} Characters</span>
                <span>{editorStats.readingTime} Min Read</span>
              </div>
              <div>
                <span>Last saved: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 dark:bg-[#070b13]/20">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 animate-float">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Note Selected</h3>
            <p className="text-slate-400 dark:text-slate-600 max-w-sm text-xs leading-relaxed mb-6">
              Create a new insights file or choose an existing document from the workspace list to start collaborating and running AI analytics.
            </p>
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/15 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Insights File
            </button>
          </div>
        )}

        {/* 4. AI Assistant Sidebar Panel (Anchored on the right) */}
        <AnimatePresence>
          {isAiSidebarOpen && activeNote && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-slate-200 bg-slate-50/70 backdrop-blur-md dark:border-slate-800 dark:bg-[#0c121e] flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Neura AI Copilot
                </span>
                <button
                  onClick={() => setIsAiSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xs"
                >
                  Close ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4.5 flex flex-col gap-6">
                
                {/* AI Error Display */}
                {aiError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-medium dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 shrink-0">
                    {aiError}
                  </div>
                )}

                {/* AI Actions Section */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Copilot Commands</span>
                  
                  <button
                    onClick={handleAISummary}
                    disabled={isGeneratingAI || !activeNote.content}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Executive Summary
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={handleAIActionItems}
                    disabled={isGeneratingAI || !activeNote.content}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-teal-500" />
                      Extract Action Items
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={handleAITitle}
                    disabled={isGeneratingAI || !activeNote.content}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-pink-500" />
                      Suggest Smart Title
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={handleAIImprove}
                    disabled={isGeneratingAI || !activeNote.content}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Optimize Writing
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* AI Executive Summary Result Display */}
                {activeNote.summary && (
                  <div className="flex flex-col gap-2 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 dark:border-indigo-950 dark:bg-indigo-950/10">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Executive Summary
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {activeNote.summary}
                    </p>
                  </div>
                )}

                {/* AI Action Items Result Display */}
                {activeNote.actionItems && (
                  <div className="flex flex-col gap-2 p-4 rounded-2xl border border-teal-100 bg-teal-50/20 dark:border-teal-950/30 dark:bg-teal-950/10">
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5" /> Action Items
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {Array.isArray(activeNote.actionItems) ? (
                        activeNote.actionItems.map((item: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                            <CornerDownRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500">{activeNote.actionItems}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Public Sharing settings card */}
                <div className="p-4.5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Public Collaborations
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Enable Public Web Link
                    </span>
                    <button
                      onClick={handleToggleShare}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${
                        activeNote.isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                        activeNote.isPublic ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {activeNote.isPublic && activeNote.shareId && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[9px] text-slate-400 leading-relaxed">
                        Anyone with the link below can view this note as a beautifully formatted static webpage.
                      </span>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-1.5 relative">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate flex-1 pr-6 pl-1.5">
                          {window.location.origin}/shared/{activeNote.shareId.substring(0, 8)}...
                        </span>
                        <button
                          onClick={copyShareLink}
                          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          title="Copy Link"
                        >
                          {copiedShareLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Generative Spinner Display Overlay */}
              {isGeneratingAI && (
                <div className="absolute inset-0 bg-white/60 dark:bg-[#0c121e]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-indigo-500 absolute top-3.5 left-3.5 animate-float" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider animate-pulse">
                    Synthesizing Insights...
                  </span>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

      </section>

      {/* 5. Custom Command Palette Overlay (CMD+K) */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-28 px-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type to search all workspaces..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500"
                >
                  ESC
                </button>
              </div>

              <div className="p-3.5 max-h-80 overflow-y-auto flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Matches in Workspace</span>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNote(note);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-3 text-left transition-all"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {note.title || 'Untitled Note'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs">
                        {note.content}
                      </span>
                    </div>
                    {note.category && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">
                        {note.category.name}
                      </span>
                    )}
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-xs text-slate-400 p-4 text-center">No workspace notes match your search.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
