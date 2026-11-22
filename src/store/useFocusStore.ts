import { create } from "zustand";
import type { FocusSessionRecord } from "@shared/types/database";
import { getTodayLocalDateString } from "@/lib/dateUtils";

interface FocusStoreState {
  currentSession: FocusSessionRecord | null;
  elapsedSeconds: number;
  status: "ready" | "focusing" | "paused";
  todayFocusSeconds: number;
  isLoading: boolean;

  fetchCurrentSession: () => Promise<void>;
  startFocus: (taskId?: string, title?: string) => Promise<void>;
  pauseFocus: () => Promise<void>;
  resumeFocus: () => Promise<void>;
  resetFocus: () => Promise<void>;
  endFocus: () => Promise<void>;
  fetchTodayFocusSeconds: () => Promise<void>;
  tick: () => void;
}

export const useFocusStore = create<FocusStoreState>((set, get) => ({
  currentSession: null,
  elapsedSeconds: 0,
  status: "ready",
  todayFocusSeconds: 0,
  isLoading: false,

  fetchCurrentSession: async () => {
    if (!window.electronAPI?.getCurrentFocusSession) return;
    try {
      const res = await window.electronAPI.getCurrentFocusSession();
      if (res && res.session) {
        set({
          currentSession: res.session,
          elapsedSeconds: res.elapsedSeconds,
          status: res.session.status === "active" ? "focusing" : "paused",
        });
      } else {
        set({
          currentSession: null,
          elapsedSeconds: 0,
          status: "ready",
        });
      }
    } catch (err) {
      console.error("fetchCurrentSession error:", err);
    }
  },

  startFocus: async (taskId?: string, title?: string) => {
    if (!window.electronAPI?.startFocusSession) return;
    try {
      const res = await window.electronAPI.startFocusSession(taskId, title);
      set({
        currentSession: res.session,
        elapsedSeconds: res.elapsedSeconds,
        status: "focusing",
      });
    } catch (err) {
      console.error("startFocus error:", err);
    }
  },

  pauseFocus: async () => {
    if (!window.electronAPI?.pauseFocusSession) return;
    try {
      const res = await window.electronAPI.pauseFocusSession();
      set({
        currentSession: res.session,
        elapsedSeconds: res.elapsedSeconds,
        status: "paused",
      });
    } catch (err) {
      console.error("pauseFocus error:", err);
    }
  },

  resumeFocus: async () => {
    if (!window.electronAPI?.resumeFocusSession) return;
    try {
      const res = await window.electronAPI.resumeFocusSession();
      set({
        currentSession: res.session,
        elapsedSeconds: res.elapsedSeconds,
        status: "focusing",
      });
    } catch (err) {
      console.error("resumeFocus error:", err);
    }
  },

  resetFocus: async () => {
    if (!window.electronAPI?.resetFocusSession) return;
    try {
      await window.electronAPI.resetFocusSession();
      set({
        currentSession: null,
        elapsedSeconds: 0,
        status: "ready",
      });
    } catch (err) {
      console.error("resetFocus error:", err);
    }
  },

  endFocus: async () => {
    if (!window.electronAPI?.endFocusSession) return;
    try {
      const res = await window.electronAPI.endFocusSession();
      const currentToday = get().todayFocusSeconds;
      set({
        currentSession: null,
        elapsedSeconds: 0,
        status: "ready",
        todayFocusSeconds: currentToday + (res?.durationSeconds || 0),
      });
    } catch (err) {
      console.error("endFocus error:", err);
    }
  },

  fetchTodayFocusSeconds: async () => {
    if (!window.electronAPI?.getTodayFocusSeconds) return;
    try {
      const todayStr = getTodayLocalDateString();
      const seconds = await window.electronAPI.getTodayFocusSeconds(todayStr);
      set({ todayFocusSeconds: seconds || 0 });
    } catch (err) {
      console.error("fetchTodayFocusSeconds error:", err);
    }
  },

  tick: () => {
    const { status, currentSession } = get();
    if (status !== "focusing" || !currentSession) return;

    const startMs = new Date(currentSession.started_at).getTime();
    const nowMs = Date.now();
    const pausedAcc = currentSession.accumulated_paused_seconds || 0;
    const computed = Math.max(0, Math.floor((nowMs - startMs) / 1000) - pausedAcc);

    set({ elapsedSeconds: computed });
  },
}));
