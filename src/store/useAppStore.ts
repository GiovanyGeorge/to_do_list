import { create } from "zustand";

export type Language = "en" | "ar";

interface AppState {
  language: Language;
  sidebarCollapsed: boolean;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: (localStorage.getItem("lifeflow_lang") as Language) || "en",
  sidebarCollapsed: false,
  setLanguage: (language) => {
    set({ language });
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
}));
