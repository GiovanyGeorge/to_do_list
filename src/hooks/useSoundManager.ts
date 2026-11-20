import { useCallback, useRef } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

/**
 * Sound events used throughout LifeFlow.
 * Each maps to a small audio file in /public/sounds/.
 */
export type SoundEvent =
  | "navigation"
  | "task_complete"
  | "task_create"
  | "delete"
  | "success"
  | "error"
  | "modal_open";

// Map event names to file paths (relative to public root)
const SOUND_FILES: Record<SoundEvent, string> = {
  navigation: "/sounds/navigation.mp3",
  task_complete: "/sounds/task-complete.mp3",
  task_create: "/sounds/task-create.mp3",
  delete: "/sounds/delete.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  modal_open: "/sounds/modal-open.mp3",
};

// Minimum ms between repeated plays of the same event (debounce rapid clicks)
const DEBOUNCE_MS = 120;

// Pre-loaded audio cache (lazy, per session)
const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") return null;
  if (audioCache.has(src)) return audioCache.get(src)!;
  try {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioCache.set(src, audio);
    return audio;
  } catch {
    // Missing file or restricted environment
    return null;
  }
}

/**
 * Returns a stable `playSound` callback that respects the global sound
 * preference, volume, and debounce.
 */
export function useSoundManager() {
  const { soundEnabled, soundVolume } = usePreferencesStore();
  const lastPlayed = useRef<Record<string, number>>({});

  const playSound = useCallback(
    (event: SoundEvent) => {
      if (!soundEnabled) return;

      const now = Date.now();
      const prev = lastPlayed.current[event] ?? 0;
      if (now - prev < DEBOUNCE_MS) return;
      lastPlayed.current[event] = now;

      try {
        const src = SOUND_FILES[event];
        const audio = getAudio(src);
        if (!audio) return;

        audio.volume = soundVolume;
        audio.currentTime = 0;
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(() => {
            // Silently swallow – user gesture restriction or missing file
          });
        }
      } catch {
        // Gracefully handle environments where Audio is unsupported (jsdom, tests)
      }
    },
    [soundEnabled, soundVolume]
  );

  return { playSound };
}
