import { create } from "zustand";
import type { GoalWithDetails } from "@shared/types/database";

interface GoalStoreState {
  goals: GoalWithDetails[];
  isLoading: boolean;
  fetchGoals: () => Promise<void>;
  createGoal: (input: {
    title: string;
    description?: string;
    categoryId?: string;
    projectId?: string;
    startAt?: string;
    targetDate?: string;
    milestones?: string[];
  }) => Promise<GoalWithDetails | null>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addMilestone: (
    goalId: string,
    input: string | { title: string; targetDate?: string; taskId?: string; projectId?: string }
  ) => Promise<void>;
  updateMilestone: (
    goalId: string,
    milestoneId: string,
    input: { title?: string; targetDate?: string | null; taskId?: string | null; projectId?: string | null }
  ) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  reorderMilestones: (goalId: string, milestoneIds: string[]) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

let fallbackGoals: GoalWithDetails[] = [];

export const useGoalStore = create<GoalStoreState>((set) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      if (window.electronAPI?.listGoals) {
        const goals = await window.electronAPI.listGoals();
        set({ goals, isLoading: false });
      } else {
        set({ goals: [...fallbackGoals], isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createGoal: async (input) => {
    try {
      if (window.electronAPI?.createGoal) {
        const goal = await window.electronAPI.createGoal(input);
        set((state) => ({ goals: [goal, ...state.goals] }));
        return goal;
      } else {
        const mock: GoalWithDetails = {
          id: `g-${Date.now()}`,
          title: input.title,
          description: input.description || null,
          category_id: input.categoryId || null,
          project_id: input.projectId || null,
          status: "active",
          start_at: input.startAt || null,
          target_date: input.targetDate || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          milestones: (input.milestones || []).map((m, idx) => ({
            id: `m-${idx}`,
            goal_id: `g-${Date.now()}`,
            title: m,
            completed: 0,
            position: idx,
            due_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          progress_percent: 0,
          completed_milestones_count: 0,
          total_milestones_count: input.milestones ? input.milestones.length : 0,
        };
        fallbackGoals.unshift(mock);
        set((state) => ({ goals: [mock, ...state.goals] }));
        return mock;
      }
    } catch {
      return null;
    }
  },

  toggleMilestone: async (goalId: string, milestoneId: string) => {
    try {
      if (window.electronAPI?.toggleGoalMilestone) {
        await window.electronAPI.toggleGoalMilestone(milestoneId);
        const updated = await window.electronAPI.getGoal(goalId);
        if (updated) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  addMilestone: async (goalId, input) => {
    try {
      if (window.electronAPI?.addGoalMilestone) {
        await window.electronAPI.addGoalMilestone(goalId, input);
        const updated = await window.electronAPI.getGoal(goalId);
        if (updated) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  updateMilestone: async (goalId, milestoneId, input) => {
    try {
      if (window.electronAPI?.updateGoalMilestone) {
        await window.electronAPI.updateGoalMilestone(milestoneId, input);
        const updated = await window.electronAPI.getGoal(goalId);
        if (updated) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  deleteMilestone: async (goalId, milestoneId) => {
    try {
      if (window.electronAPI?.deleteGoalMilestone) {
        await window.electronAPI.deleteGoalMilestone(milestoneId);
        const updated = await window.electronAPI.getGoal(goalId);
        if (updated) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  reorderMilestones: async (goalId, milestoneIds) => {
    try {
      if (window.electronAPI?.reorderGoalMilestones) {
        await window.electronAPI.reorderGoalMilestones(goalId, milestoneIds);
        const updated = await window.electronAPI.getGoal(goalId);
        if (updated) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? updated : g)),
          }));
        }
      }
    } catch {
      // error handling
    }
  },

  deleteGoal: async (id: string) => {
    try {
      if (window.electronAPI?.deleteGoal) {
        await window.electronAPI.deleteGoal(id);
      }
      fallbackGoals = fallbackGoals.filter((g) => g.id !== id);
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    } catch {
      // error handling
    }
  },
}));
