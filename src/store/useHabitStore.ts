import { create } from "zustand";
import type { HabitWithStats, HabitFrequency } from "@shared/types/database";

interface HabitStoreState {
  habits: HabitWithStats[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  createHabit: (input: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_value?: number;
    unit?: string;
    color?: string;
  }) => Promise<HabitWithStats | null>;
  toggleHabitLog: (habitId: string, logDate: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

let fallbackHabits: HabitWithStats[] = [];

export const useHabitStore = create<HabitStoreState>((set) => ({
  habits: [],
  isLoading: false,

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      if (window.electronAPI?.listHabits) {
        const habits = await window.electronAPI.listHabits();
        set({ habits, isLoading: false });
      } else {
        set({ habits: [...fallbackHabits], isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createHabit: async (input) => {
    try {
      if (window.electronAPI?.createHabit) {
        const habit = await window.electronAPI.createHabit(input);
        set((state) => ({ habits: [...state.habits, habit] }));
        return habit;
      } else {
        const mock: HabitWithStats = {
          id: `h-${Date.now()}`,
          name: input.name,
          description: input.description || null,
          frequency: input.frequency || "daily",
          target_value: input.target_value || 1,
          unit: input.unit || null,
          color: input.color || "#E99A43",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          current_streak: 0,
          longest_streak: 0,
          total_completions: 0,
          is_completed_today: false,
          recent_logs: [],
        };
        fallbackHabits.push(mock);
        set((state) => ({ habits: [...state.habits, mock] }));
        return mock;
      }
    } catch {
      return null;
    }
  },

  toggleHabitLog: async (habitId: string, logDate: string) => {
    try {
      if (window.electronAPI?.toggleHabitLog) {
        await window.electronAPI.toggleHabitLog(habitId, logDate);
        const updated = await window.electronAPI.getHabit(habitId);
        if (updated) {
          set((state) => ({
            habits: state.habits.map((h) => (h.id === habitId ? updated : h)),
          }));
        }
      } else {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const completed = !h.is_completed_today;
            return {
              ...h,
              is_completed_today: completed,
              current_streak: completed ? h.current_streak + 1 : Math.max(0, h.current_streak - 1),
            };
          }),
        }));
      }
    } catch {
      // error handling
    }
  },

  deleteHabit: async (id: string) => {
    try {
      if (window.electronAPI?.deleteHabit) {
        await window.electronAPI.deleteHabit(id);
      }
      fallbackHabits = fallbackHabits.filter((h) => h.id !== id);
      set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
    } catch {
      // error handling
    }
  },
}));
