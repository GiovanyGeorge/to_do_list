import { create } from "zustand";
import type {
  ProjectWithStats,
  CreateProjectInput,
  UpdateProjectInput,
} from "@shared/types/database";

interface ProjectStoreState {
  projects: ProjectWithStats[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: (includeArchived?: boolean) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<ProjectWithStats | null>;
  updateProject: (
    id: string,
    input: UpdateProjectInput
  ) => Promise<ProjectWithStats | null>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  setSelectedProjectId: (id: string | null) => void;
}

let fallbackProjects: ProjectWithStats[] = [];

export const useProjectStore = create<ProjectStoreState>((set) => ({
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,

  fetchProjects: async (includeArchived?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      if (window.electronAPI?.listProjects) {
        const projects = await window.electronAPI.listProjects(includeArchived);
        set({ projects, isLoading: false });
      } else {
        set({ projects: [...fallbackProjects], isLoading: false });
      }
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to fetch projects",
        isLoading: false,
      });
    }
  },

  createProject: async (input: CreateProjectInput) => {
    try {
      if (window.electronAPI?.createProject) {
        const newProj = await window.electronAPI.createProject(input);
        set((state) => ({ projects: [newProj, ...state.projects] }));
        return newProj;
      } else {
        const mockProj: ProjectWithStats = {
          id: `proj-${Date.now()}`,
          name: input.name,
          description: input.description || null,
          color: input.color || "#E99A43",
          status: input.status || "active",
          start_at: input.start_at || null,
          due_at: input.due_at || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
          deleted_at: null,
          task_count: 0,
          completed_task_count: 0,
          progress_percent: 0,
        };
        fallbackProjects.unshift(mockProj);
        set((state) => ({ projects: [mockProj, ...state.projects] }));
        return mockProj;
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to create project" });
      return null;
    }
  },

  updateProject: async (id: string, input: UpdateProjectInput) => {
    try {
      if (window.electronAPI?.updateProject) {
        const updated = await window.electronAPI.updateProject(id, input);
        if (updated) {
          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? updated : p)),
          }));
        }
        return updated;
      }
      return null;
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to update project" });
      return null;
    }
  },

  deleteProject: async (id: string) => {
    try {
      if (window.electronAPI?.deleteProject) {
        await window.electronAPI.deleteProject(id);
      }
      fallbackProjects = fallbackProjects.filter((p) => p.id !== id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProjectId:
          state.selectedProjectId === id ? null : state.selectedProjectId,
      }));
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to delete project" });
    }
  },

  archiveProject: async (id: string) => {
    try {
      if (window.electronAPI?.archiveProject) {
        const archived = await window.electronAPI.archiveProject(id);
        if (archived) {
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
          }));
        }
      }
    } catch (err: unknown) {
      set({ error: (err as Error).message || "Failed to archive project" });
    }
  },

  setSelectedProjectId: (id: string | null) => {
    set({ selectedProjectId: id });
  },
}));
