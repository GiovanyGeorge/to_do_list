import { create } from "zustand";
import type { NoteWithTags } from "@shared/types/database";

interface NoteStoreState {
  notes: NoteWithTags[];
  isLoading: boolean;
  search: string;
  fetchNotes: (search?: string) => Promise<void>;
  createNote: (input: {
    title: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    tagIds?: string[];
  }) => Promise<NoteWithTags | null>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setSearch: (query: string) => void;
}

let fallbackNotes: NoteWithTags[] = [];

export const useNoteStore = create<NoteStoreState>((set) => ({
  notes: [],
  isLoading: false,
  search: "",

  fetchNotes: async (search?: string) => {
    set({ isLoading: true });
    try {
      if (window.electronAPI?.listNotes) {
        const notes = await window.electronAPI.listNotes(search);
        set({ notes, isLoading: false });
      } else {
        set({ notes: [...fallbackNotes], isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createNote: async (input) => {
    try {
      if (window.electronAPI?.createNote) {
        const note = await window.electronAPI.createNote(input);
        set((state) => ({ notes: [note, ...state.notes] }));
        return note;
      } else {
        const mock: NoteWithTags = {
          id: `n-${Date.now()}`,
          title: input.title,
          content: input.content || null,
          color: input.color || "#191D24",
          is_pinned: input.isPinned ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          tags: [],
        };
        fallbackNotes.unshift(mock);
        set((state) => ({ notes: [mock, ...state.notes] }));
        return mock;
      }
    } catch {
      return null;
    }
  },

  togglePin: async (id: string) => {
    try {
      if (window.electronAPI?.toggleNotePin) {
        await window.electronAPI.toggleNotePin(id);
        const updated = await window.electronAPI.getNote(id);
        if (updated) {
          set((state) => ({
            notes: state.notes
              .map((n) => (n.id === id ? updated : n))
              .sort((a, b) => b.is_pinned - a.is_pinned),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  deleteNote: async (id: string) => {
    try {
      if (window.electronAPI?.deleteNote) {
        await window.electronAPI.deleteNote(id);
      }
      fallbackNotes = fallbackNotes.filter((n) => n.id !== id);
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    } catch {
      // error handling
    }
  },

  setSearch: (search: string) => set({ search }),
}));
