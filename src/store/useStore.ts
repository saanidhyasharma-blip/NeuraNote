import { create } from 'zustand';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
axios.defaults.withCredentials = true;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  actionItems: any | null; // string[] stored as Json
  isArchived: boolean;
  isPublic: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  category: Category | null;
  tags: Tag[];
}

interface DashboardStats {
  totalNotes: number;
  archivedNotes: number;
  aiGenerationsCount: number;
  notesCreatedThisWeek: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentlyEdited: Note[];
  mostUsedTags: { name: string; count: number }[];
  weeklyActivity: { date: string; count: number }[];
}

interface AppStore {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  authError: string | null;
  
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  login: (credentials: any) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;

  // Notes State
  notes: Note[];
  activeNote: Note | null;
  isLoadingNotes: boolean;
  notesError: string | null;
  
  // Filtering & Sorting State
  searchQuery: string;
  activeTag: string;
  activeCategory: string;
  sortBy: 'recent' | 'oldest' | 'alphabetical';
  isArchivedView: boolean;
  isFavoritesOnly: boolean;
  
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string) => void;
  setActiveCategory: (cat: string) => void;
  setSortBy: (sort: 'recent' | 'oldest' | 'alphabetical') => void;
  setIsArchivedView: (archived: boolean) => void;
  setIsFavoritesOnly: (favOnly: boolean) => void;
  
  // Note Operations
  fetchNotes: () => Promise<void>;
  setActiveNote: (note: Note | null) => void;
  createNote: (data?: { title?: string; content?: string; category?: string; tags?: string[] }) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // AI Operations
  isGeneratingAI: boolean;
  aiError: string | null;
  generateAISummary: (id: string) => Promise<string | null>;
  extractAIActionItems: (id: string) => Promise<any | null>;
  generateAITitle: (id: string) => Promise<string | null>;
  improveWriting: (id: string) => Promise<string | null>;

  // Dashboard State
  dashboardData: DashboardData | null;
  isLoadingDashboard: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useStore = create<AppStore>((set, get) => ({
  // Auth State
  user: null,
  isAuthenticated: false,
  isLoadingUser: true,
  authError: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  checkAuth: async () => {
    set({ isLoadingUser: true, authError: null });
    try {
      const res = await axios.get('/api/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoadingUser: false });
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoadingUser: false });
    }
  },

  login: async (credentials) => {
    set({ isLoadingUser: true, authError: null });
    try {
      const res = await axios.post('/api/auth/login', credentials);
      set({ user: res.data.user, isAuthenticated: true, isLoadingUser: false });
      get().fetchNotes();
      return true;
    } catch (error: any) {
      set({
        authError: error.response?.data?.error || 'Login failed. Please check credentials.',
        isLoadingUser: false,
      });
      return false;
    }
  },

  signup: async (userData) => {
    set({ isLoadingUser: true, authError: null });
    try {
      const res = await axios.post('/api/auth/signup', userData);
      set({ user: res.data.user, isAuthenticated: true, isLoadingUser: false });
      get().fetchNotes();
      return true;
    } catch (error: any) {
      set({
        authError: error.response?.data?.error || 'Signup failed.',
        isLoadingUser: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout API failed, forcing local session clear');
    } finally {
      set({ user: null, isAuthenticated: false, notes: [], activeNote: null });
    }
  },

  // Notes State
  notes: [],
  activeNote: null,
  isLoadingNotes: false,
  notesError: null,

  // Filtering & Sorting
  searchQuery: '',
  activeTag: '',
  activeCategory: '',
  sortBy: 'recent',
  isArchivedView: false,
  isFavoritesOnly: false,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchNotes();
  },
  setActiveTag: (tag) => {
    set({ activeTag: tag });
    get().fetchNotes();
  },
  setActiveCategory: (cat) => {
    set({ activeCategory: cat });
    get().fetchNotes();
  },
  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().fetchNotes();
  },
  setIsArchivedView: (archived) => {
    set({ isArchivedView: archived });
    get().fetchNotes();
  },
  setIsFavoritesOnly: (favOnly) => {
    set({ isFavoritesOnly: favOnly });
    get().fetchNotes();
  },

  fetchNotes: async () => {
    set({ isLoadingNotes: true, notesError: null });
    try {
      const { searchQuery, activeTag, activeCategory, sortBy, isArchivedView, isFavoritesOnly } = get();
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeTag) params.append('tag', activeTag);
      if (activeCategory) params.append('category', activeCategory);
      if (sortBy) params.append('sort', sortBy);
      if (isArchivedView) params.append('archived', 'true');
      if (isFavoritesOnly) params.append('favorites', 'true');

      const res = await axios.get(`/api/notes?${params.toString()}`);
      const notesList = res.data.notes || [];
      
      set({ 
        notes: notesList, 
        isLoadingNotes: false 
      });

      // Keep activeNote synced if it's currently loaded
      const currentActive = get().activeNote;
      if (currentActive) {
        const syncedActive = notesList.find((n: Note) => n.id === currentActive.id);
        if (syncedActive) set({ activeNote: syncedActive });
      }
    } catch (error: any) {
      set({
        notesError: error.response?.data?.error || 'Failed to fetch notes',
        isLoadingNotes: false,
      });
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  createNote: async (data) => {
    try {
      const res = await axios.post('/api/notes', data || { title: 'Untitled Note', content: '' });
      const newNote = res.data.note;
      
      // Update notes list and set as active
      set((state) => ({
        notes: [newNote, ...state.notes],
        activeNote: newNote,
      }));
      
      return newNote;
    } catch (error: any) {
      console.error('Create note failed:', error);
      return null;
    }
  },

  // Optimistic UI updates implementation for extreme modern high-performance feel
  updateNote: async (id, updates) => {
    const originalNotes = [...get().notes];
    const originalActive = get().activeNote ? { ...get().activeNote! } : null;

    // 1. Apply changes optimistically to state
    set((state) => {
      const updatedNotes = state.notes.map((n) => {
        if (n.id === id) {
          return { ...n, ...updates } as Note;
        }
        return n;
      });

      let updatedActive = state.activeNote;
      if (state.activeNote && state.activeNote.id === id) {
        updatedActive = { ...state.activeNote, ...updates } as Note;
      }

      return { notes: updatedNotes, activeNote: updatedActive };
    });

    // 2. Trigger background PATCH API
    try {
      const res = await axios.patch(`/api/notes/${id}`, updates);
      
      // Update local state with exact data returned from API
      const freshNote = res.data.note;
      set((state) => {
        const finalNotes = state.notes.map((n) => (n.id === id ? freshNote : n));
        let finalActive = state.activeNote;
        if (state.activeNote && state.activeNote.id === id) {
          finalActive = freshNote;
        }
        return { notes: finalNotes, activeNote: finalActive };
      });
    } catch (error) {
      console.error('Note update failed (reverting state):', error);
      // Revert state if API call fails
      set({ notes: originalNotes, activeNote: originalActive });
    }
  },

  deleteNote: async (id) => {
    const originalNotes = [...get().notes];
    const originalActive = get().activeNote;

    // Optimistically remove from state
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNote: state.activeNote?.id === id ? null : state.activeNote,
    }));

    try {
      await axios.delete(`/api/notes/${id}`);
    } catch (error) {
      console.error('Note deletion failed (reverting state):', error);
      // Revert state
      set({ notes: originalNotes, activeNote: originalActive });
    }
  },

  // AI Operations State
  isGeneratingAI: false,
  aiError: null,

  generateAISummary: async (id) => {
    set({ isGeneratingAI: true, aiError: null });
    try {
      const res = await axios.post(`/api/notes/${id}/summary`);
      const summary = res.data.summary;
      
      // Update locally
      get().updateNote(id, { summary });
      set({ isGeneratingAI: false });
      return summary;
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'AI Summary generation failed';
      set({ aiError: errMsg, isGeneratingAI: false });
      return null;
    }
  },

  extractAIActionItems: async (id) => {
    set({ isGeneratingAI: true, aiError: null });
    try {
      const res = await axios.post(`/api/notes/${id}/action-items`);
      const actionItems = res.data.actionItems;

      // Update locally
      get().updateNote(id, { actionItems });
      set({ isGeneratingAI: false });
      return actionItems;
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'AI Action item extraction failed';
      set({ aiError: errMsg, isGeneratingAI: false });
      return null;
    }
  },

  generateAITitle: async (id) => {
    set({ isGeneratingAI: true, aiError: null });
    try {
      const res = await axios.post(`/api/notes/${id}/title`);
      const title = res.data.title;

      // Update locally
      get().updateNote(id, { title });
      set({ isGeneratingAI: false });
      return title;
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'AI Title suggestion failed';
      set({ aiError: errMsg, isGeneratingAI: false });
      return null;
    }
  },

  improveWriting: async (id) => {
    set({ isGeneratingAI: true, aiError: null });
    try {
      const note = get().notes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');

      // AI Improve API triggers a text optimization
      const res = await axios.post(`/api/notes/${id}/ai-improve`, { content: note.content });
      const improvedContent = res.data.improved;

      // Update note locally
      get().updateNote(id, { content: improvedContent });
      set({ isGeneratingAI: false });
      return improvedContent;
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'AI Writing improvement failed';
      set({ aiError: errMsg, isGeneratingAI: false });
      return null;
    }
  },

  // Dashboard Stats State
  dashboardData: null,
  isLoadingDashboard: false,

  fetchDashboardData: async () => {
    set({ isLoadingDashboard: true });
    try {
      const res = await axios.get('/api/dashboard');
      set({ dashboardData: res.data, isLoadingDashboard: false });
    } catch (error) {
      console.error('Fetch dashboard stats failed:', error);
      set({ isLoadingDashboard: false });
    }
  },
}));
