import { create } from "zustand";
import type {
  CategoryRecord,
  CategoryWithStats,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../shared/types/database";

interface CategoryStoreState {
  categories: CategoryWithStats[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: (includeArchived?: boolean) => Promise<void>;
  createCategory: (input: CreateCategoryInput) => Promise<CategoryRecord | null>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<CategoryRecord | null>;
  archiveCategory: (id: string) => Promise<boolean>;
  unarchiveCategory: (id: string) => Promise<boolean>;
  deleteCategory: (id: string, reassignToCategoryId?: string | null) => Promise<boolean>;
}

// Starter fallback for mock/browser test environments
const fallbackCategories: CategoryWithStats[] = [
  { id: "cat-study", name: "Study", color: "#C2410C", icon: "GraduationCap", description: "Lectures, revisions, exams", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
  { id: "cat-personal", name: "Personal", color: "#15803D", icon: "User", description: "Personal errands, habits", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
  { id: "cat-work", name: "Work", color: "#EA580C", icon: "Briefcase", description: "Work tasks and deliverables", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
  { id: "cat-learning", name: "Learning", color: "#7C3AED", icon: "BookOpen", description: "Skill building & courses", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
  { id: "cat-health", name: "Health", color: "#16A34A", icon: "HeartPulse", description: "Doctor visits and wellness", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
  { id: "cat-fitness", name: "Fitness", color: "#65A30D", icon: "Dumbbell", description: "Workouts and physical activity", created_at: new Date().toISOString(), task_count: 0, completed_task_count: 0 },
];

export const useCategoryStore = create<CategoryStoreState>((set, get) => ({
  categories: fallbackCategories,
  isLoading: false,
  error: null,

  fetchCategories: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      if (window.electronAPI?.listCategories) {
        const categories = await window.electronAPI.listCategories(includeArchived);
        set({ categories, isLoading: false });
      } else {
        set({ categories: fallbackCategories, isLoading: false });
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to fetch categories", isLoading: false });
    }
  },

  createCategory: async (input: CreateCategoryInput) => {
    try {
      if (window.electronAPI?.createCategory) {
        const created = await window.electronAPI.createCategory(input);
        await get().fetchCategories();
        return created;
      } else {
        const mock: CategoryWithStats = {
          id: `mock-cat-${Date.now()}`,
          name: input.name,
          color: input.color || "#C2410C",
          icon: input.icon || "Folder",
          description: input.description || null,
          created_at: new Date().toISOString(),
          task_count: 0,
          completed_task_count: 0,
        };
        set((state) => ({ categories: [...state.categories, mock] }));
        return mock;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  updateCategory: async (id: string, input: UpdateCategoryInput) => {
    try {
      if (window.electronAPI?.updateCategory) {
        const updated = await window.electronAPI.updateCategory(id, input);
        await get().fetchCategories();
        return updated;
      } else {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...input } : c
          ),
        }));
        return get().categories.find((c) => c.id === id) || null;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  archiveCategory: async (id: string) => {
    try {
      if (window.electronAPI?.archiveCategory) {
        await window.electronAPI.archiveCategory(id);
        await get().fetchCategories();
        return true;
      } else {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  unarchiveCategory: async (id: string) => {
    try {
      if (window.electronAPI?.unarchiveCategory) {
        await window.electronAPI.unarchiveCategory(id);
        await get().fetchCategories();
        return true;
      }
      return false;
    } catch (err: unknown) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  deleteCategory: async (id: string, reassignToCategoryId = null) => {
    try {
      if (window.electronAPI?.deleteCategory) {
        await window.electronAPI.deleteCategory(id, reassignToCategoryId);
        await get().fetchCategories();
        return true;
      } else {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message });
      return false;
    }
  },
}));
