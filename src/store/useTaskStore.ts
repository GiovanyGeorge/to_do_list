import { create } from "zustand";
import type {
  TaskWithDetails,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
} from "../../shared/types/database";

interface TaskStoreState {
  tasks: TaskWithDetails[];
  isLoading: boolean;
  error: string | null;
  selectedTaskId: string | null;

  // Actions
  fetchTasks: (filters?: TaskFilterParams) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<TaskWithDetails | null>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<TaskWithDetails | null>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleDayPlan: (taskId: string, planDate: string) => Promise<void>;
  setSelectedTaskId: (id: string | null) => void;
}

// In-memory fallback if Electron API is not available (e.g. during browser tests)
let fallbackTasks: TaskWithDetails[] = [];

export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  selectedTaskId: null,

  fetchTasks: async (filters?: TaskFilterParams) => {
    set({ isLoading: true, error: null });
    try {
      if (window.electronAPI?.listTasks) {
        const tasks = await window.electronAPI.listTasks(filters);
        set({ tasks, isLoading: false });
      } else {
        // Fallback for mock/test environments
        let filtered = [...fallbackTasks];
        if (filters?.status) filtered = filtered.filter((t) => t.status === filters.status);
        if (filters?.plan_date) filtered = filtered.filter((t) => t.is_in_my_day);
        set({ tasks: filtered, isLoading: false });
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to fetch tasks", isLoading: false });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    try {
      if (window.electronAPI?.createTask) {
        const newTask = await window.electronAPI.createTask(input);
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      } else {
        const mockTask: TaskWithDetails = {
          id: `mock-${Date.now()}`,
          title: input.title,
          description: input.description || null,
          status: input.status || "todo",
          priority: input.priority || "medium",
          project_id: input.project_id || null,
          category_id: input.category_id || null,
          start_at: input.start_at || null,
          due_at: input.due_at || null,
          completed_at: null,
          recurrence_rule: input.recurrence_rule || null,
          recurrence_series_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          deleted_at: null,
          subtasks: (input.subtasks || []).map((s, idx) => ({
            id: `st-${idx}`,
            task_id: `mock-${Date.now()}`,
            title: s,
            completed: 0,
            position: idx,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          tags: [],
          is_in_my_day: !!input.plan_date,
        };
        fallbackTasks.unshift(mockTask);
        set((state) => ({ tasks: [mockTask, ...state.tasks] }));
        return mockTask;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to create task" });
      return null;
    }
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    try {
      if (window.electronAPI?.updateTask) {
        const updated = await window.electronAPI.updateTask(id, input);
        if (updated) {
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          }));
        }
        return updated;
      } else {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...input } : t)),
        }));
        return null;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to update task" });
      return null;
    }
  },

  toggleTask: async (id: string) => {
    try {
      if (window.electronAPI?.toggleTask) {
        const updated = await window.electronAPI.toggleTask(id);
        if (updated) {
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          }));
        }
      } else {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "done" ? "todo" : "done",
                  completed_at: t.status === "done" ? null : new Date().toISOString(),
                }
              : t
          ),
        }));
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to toggle task" });
    }
  },

  deleteTask: async (id: string) => {
    try {
      if (window.electronAPI?.deleteTask) {
        await window.electronAPI.deleteTask(id);
      }
      fallbackTasks = fallbackTasks.filter((t) => t.id !== id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
      }));
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to delete task" });
    }
  },

  toggleDayPlan: async (taskId: string, planDate: string) => {
    try {
      if (window.electronAPI?.toggleDayPlan) {
        const isInDay = await window.electronAPI.toggleDayPlan(taskId, planDate);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, is_in_my_day: isInDay } : t
          ),
        }));
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to update day plan" });
    }
  },

  setSelectedTaskId: (id: string | null) => {
    set({ selectedTaskId: id });
  },
}));
