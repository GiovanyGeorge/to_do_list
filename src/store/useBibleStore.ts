import { create } from "zustand";
import type {
  DailyVerseWithDetails,
  BibleFavoriteWithVerse,
} from "../../shared/types/database";

interface BibleStoreState {
  dailyVerse: DailyVerseWithDetails | null;
  isDailyVerseFavorite: boolean;
  favorites: BibleFavoriteWithVerse[];
  isPopoverOpen: boolean;
  isFavoritesModalOpen: boolean;
  isDailyVerseEnabled: boolean;
  isLoading: boolean;
  favoritesSearch: string;

  // Actions
  fetchDailyVerse: () => Promise<void>;
  toggleDailyVerseFavorite: () => Promise<void>;
  toggleVerseFavorite: (verseId: number) => Promise<void>;
  fetchFavorites: (search?: string) => Promise<void>;
  removeFavorite: (verseId: number) => Promise<void>;
  togglePopover: () => void;
  openPopover: () => void;
  closePopover: () => void;
  openFavoritesModal: () => void;
  closeFavoritesModal: () => void;
  setDailyVerseEnabled: (enabled: boolean) => Promise<void>;
  checkDailyVerseEnabled: () => Promise<void>;
  setFavoritesSearch: (query: string) => void;
}

const mockDailyVerse: DailyVerseWithDetails = {
  id: 26137,
  book_id: 43,
  chapter: 3,
  verse: 16,
  text: "لِأَنَّهُ هَكَذَا أَحَبَّ ٱللهُ ٱلْعَالَمَ حَتَّى بَذَلَ ٱبْنَهُ ٱلْوَحِيدَ، لِكَيْ لَا يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ ٱلْحَيَاةُ ٱلْأَبَدِيَّةُ.",
  translation: "svd",
  book_name_ar: "يوحنا",
  book_name_en: "John",
  book_abbr_ar: "يو",
  book_abbr_en: "John",
  testament: "new",
  date: new Date().toISOString().substring(0, 10),
  is_favorite: false,
};

export const useBibleStore = create<BibleStoreState>((set, get) => ({
  dailyVerse: null,
  isDailyVerseFavorite: false,
  favorites: [],
  isPopoverOpen: false,
  isFavoritesModalOpen: false,
  isDailyVerseEnabled: true,
  isLoading: false,
  favoritesSearch: "",

  fetchDailyVerse: async () => {
    set({ isLoading: true });
    try {
      if (window.electronAPI?.getDailyVerse) {
        const verse = await window.electronAPI.getDailyVerse();
        set({
          dailyVerse: verse,
          isDailyVerseFavorite: !!verse.is_favorite,
          isLoading: false,
        });
      } else {
        set({
          dailyVerse: mockDailyVerse,
          isDailyVerseFavorite: !!mockDailyVerse.is_favorite,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch daily Bible verse:", err);
      set({ dailyVerse: mockDailyVerse, isLoading: false });
    }
  },

  toggleDailyVerseFavorite: async () => {
    const { dailyVerse, isDailyVerseFavorite } = get();
    if (!dailyVerse) return;

    try {
      if (window.electronAPI?.toggleBibleFavorite) {
        const res = await window.electronAPI.toggleBibleFavorite(dailyVerse.id);
        set({
          isDailyVerseFavorite: res.isFavorite,
          dailyVerse: { ...dailyVerse, is_favorite: res.isFavorite },
        });
        get().fetchFavorites(get().favoritesSearch);
      } else {
        const nextState = !isDailyVerseFavorite;
        set({
          isDailyVerseFavorite: nextState,
          dailyVerse: { ...dailyVerse, is_favorite: nextState },
        });
      }
    } catch (err) {
      console.error("Failed to toggle daily Bible favorite:", err);
    }
  },

  toggleVerseFavorite: async (verseId: number) => {
    try {
      if (window.electronAPI?.toggleBibleFavorite) {
        const res = await window.electronAPI.toggleBibleFavorite(verseId);
        const { dailyVerse } = get();
        if (dailyVerse && dailyVerse.id === verseId) {
          set({
            isDailyVerseFavorite: res.isFavorite,
            dailyVerse: { ...dailyVerse, is_favorite: res.isFavorite },
          });
        }
        await get().fetchFavorites(get().favoritesSearch);
      }
    } catch (err) {
      console.error("Failed to toggle verse favorite:", err);
    }
  },

  fetchFavorites: async (search?: string) => {
    try {
      if (window.electronAPI?.listBibleFavorites) {
        const list = await window.electronAPI.listBibleFavorites(search);
        set({ favorites: list });
      }
    } catch (err) {
      console.error("Failed to fetch Bible favorites:", err);
    }
  },

  removeFavorite: async (verseId: number) => {
    try {
      if (window.electronAPI?.removeBibleFavorite) {
        await window.electronAPI.removeBibleFavorite(verseId);
        const { dailyVerse } = get();
        if (dailyVerse && dailyVerse.id === verseId) {
          set({
            isDailyVerseFavorite: false,
            dailyVerse: { ...dailyVerse, is_favorite: false },
          });
        }
        await get().fetchFavorites(get().favoritesSearch);
      }
    } catch (err) {
      console.error("Failed to remove Bible favorite:", err);
    }
  },

  togglePopover: () => {
    const current = get().isPopoverOpen;
    if (!current && !get().dailyVerse) {
      get().fetchDailyVerse();
    }
    set({ isPopoverOpen: !current });
  },

  openPopover: () => {
    if (!get().dailyVerse) {
      get().fetchDailyVerse();
    }
    set({ isPopoverOpen: true });
  },

  closePopover: () => set({ isPopoverOpen: false }),

  openFavoritesModal: () => {
    get().fetchFavorites();
    set({ isFavoritesModalOpen: true, isPopoverOpen: false });
  },

  closeFavoritesModal: () => set({ isFavoritesModalOpen: false }),

  checkDailyVerseEnabled: async () => {
    try {
      if (window.electronAPI?.getSetting) {
        const val = await window.electronAPI.getSetting("daily_verse_enabled", "true");
        set({ isDailyVerseEnabled: val !== "false" });
      }
    } catch (err) {
      console.error("Failed to check daily verse enabled setting:", err);
    }
  },

  setDailyVerseEnabled: async (enabled: boolean) => {
    set({ isDailyVerseEnabled: enabled });
    if (!enabled) {
      set({ isPopoverOpen: false });
    }
    try {
      if (window.electronAPI?.setSetting) {
        await window.electronAPI.setSetting("daily_verse_enabled", enabled ? "true" : "false");
      }
    } catch (err) {
      console.error("Failed to save daily verse enabled setting:", err);
    }
  },

  setFavoritesSearch: (query: string) => {
    set({ favoritesSearch: query });
    get().fetchFavorites(query);
  },
}));
