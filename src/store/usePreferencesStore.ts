import { create } from "zustand";

export interface PreferencesState {
  animationsEnabled: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0

  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
}

const getStoredBool = (key: string, defaultValue: boolean): boolean => {
  const val = localStorage.getItem(key);
  if (val === null) return defaultValue;
  return val === "true";
};

const getStoredNumber = (key: string, defaultValue: number): number => {
  const val = localStorage.getItem(key);
  if (val === null) return defaultValue;
  const num = parseFloat(val);
  return isNaN(num) ? defaultValue : Math.max(0, Math.min(1, num));
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  animationsEnabled: getStoredBool("lifeflow_animations_enabled", true),
  reducedMotion: getStoredBool(
    "lifeflow_reduced_motion",
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ),
  soundEnabled: getStoredBool("lifeflow_sound_enabled", true),
  soundVolume: getStoredNumber("lifeflow_sound_volume", 0.5),

  setAnimationsEnabled: (animationsEnabled) => {
    localStorage.setItem("lifeflow_animations_enabled", String(animationsEnabled));
    set({ animationsEnabled });
  },

  setReducedMotion: (reducedMotion) => {
    localStorage.setItem("lifeflow_reduced_motion", String(reducedMotion));
    set({ reducedMotion });
  },

  setSoundEnabled: (soundEnabled) => {
    localStorage.setItem("lifeflow_sound_enabled", String(soundEnabled));
    set({ soundEnabled });
  },

  setSoundVolume: (soundVolume) => {
    const clamped = Math.max(0, Math.min(1, soundVolume));
    localStorage.setItem("lifeflow_sound_volume", String(clamped));
    set({ soundVolume: clamped });
  },
}));
