import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../shared/types/ipc";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
  CreateProjectInput,
  UpdateProjectInput,
  ReminderType,
  NotificationLogRecord,
  HabitFrequency,
} from "../shared/types/database";

const api: ElectronAPI = {
  getAppInfo: () => ipcRenderer.invoke("app:info"),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => {
      callback(isMaximized);
    };
    ipcRenderer.on("window-state-change", handler);
    return () => {
      ipcRenderer.removeListener("window-state-change", handler);
    };
  },

  // Task methods
  listTasks: (filters?: TaskFilterParams) => ipcRenderer.invoke("tasks:list", filters),
  getTask: (id: string) => ipcRenderer.invoke("tasks:get", id),
  createTask: (input: CreateTaskInput) => ipcRenderer.invoke("tasks:create", input),
  updateTask: (id: string, input: UpdateTaskInput) =>
    ipcRenderer.invoke("tasks:update", id, input),
  toggleTask: (id: string) => ipcRenderer.invoke("tasks:toggle", id),
  deleteTask: (id: string) => ipcRenderer.invoke("tasks:delete", id),
  toggleDayPlan: (taskId: string, planDate: string) =>
    ipcRenderer.invoke("tasks:toggle-day-plan", taskId, planDate),
  addDependency: (taskId: string, dependsOnTaskId: string) =>
    ipcRenderer.invoke("tasks:add-dependency", taskId, dependsOnTaskId),
  removeDependency: (taskId: string, dependsOnTaskId: string) =>
    ipcRenderer.invoke("tasks:remove-dependency", taskId, dependsOnTaskId),

  // Project methods
  listProjects: (includeArchived?: boolean) =>
    ipcRenderer.invoke("projects:list", includeArchived),
  getProject: (id: string) => ipcRenderer.invoke("projects:get", id),
  createProject: (input: CreateProjectInput) =>
    ipcRenderer.invoke("projects:create", input),
  updateProject: (id: string, input: UpdateProjectInput) =>
    ipcRenderer.invoke("projects:update", id, input),
  deleteProject: (id: string) => ipcRenderer.invoke("projects:delete", id),
  archiveProject: (id: string) => ipcRenderer.invoke("projects:archive", id),

  // Notification & Reminder methods
  listNotifications: (limit?: number) =>
    ipcRenderer.invoke("notifications:list", limit),
  clearNotifications: () => ipcRenderer.invoke("notifications:clear-all"),
  createReminder: (input: {
    taskId?: string;
    remindAt: string;
    title: string;
    message?: string;
    type?: ReminderType;
  }) => ipcRenderer.invoke("reminders:create", input),
  getSetting: (key: string, defaultValue?: string) =>
    ipcRenderer.invoke("settings:get", key, defaultValue),
  setSetting: (key: string, value: string) =>
    ipcRenderer.invoke("settings:set", key, value),
  onNotificationReceived: (callback: (notif: NotificationLogRecord) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, notif: NotificationLogRecord) => {
      callback(notif);
    };
    ipcRenderer.on("notifications:new", handler);
    return () => {
      ipcRenderer.removeListener("notifications:new", handler);
    };
  },

  // Habits methods
  listHabits: (includeArchived?: boolean) =>
    ipcRenderer.invoke("habits:list", includeArchived),
  getHabit: (id: string) => ipcRenderer.invoke("habits:get", id),
  createHabit: (input: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_value?: number;
    unit?: string;
    color?: string;
  }) => ipcRenderer.invoke("habits:create", input),
  toggleHabitLog: (habitId: string, logDate: string) =>
    ipcRenderer.invoke("habits:toggle-log", habitId, logDate),
  deleteHabit: (id: string) => ipcRenderer.invoke("habits:delete", id),

  // Goals methods
  listGoals: (includeArchived?: boolean) =>
    ipcRenderer.invoke("goals:list", includeArchived),
  getGoal: (id: string) => ipcRenderer.invoke("goals:get", id),
  createGoal: (input: {
    title: string;
    description?: string;
    categoryId?: string;
    projectId?: string;
    startAt?: string;
    targetDate?: string;
    milestones?: string[];
  }) => ipcRenderer.invoke("goals:create", input),
  toggleGoalMilestone: (milestoneId: string) =>
    ipcRenderer.invoke("goals:toggle-milestone", milestoneId),
  addGoalMilestone: (goalId: string, title: string) =>
    ipcRenderer.invoke("goals:add-milestone", goalId, title),
  deleteGoal: (id: string) => ipcRenderer.invoke("goals:delete", id),

  // Notes methods
  listNotes: (search?: string) => ipcRenderer.invoke("notes:list", search),
  getNote: (id: string) => ipcRenderer.invoke("notes:get", id),
  createNote: (input: {
    title: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    tagIds?: string[];
  }) => ipcRenderer.invoke("notes:create", input),
  toggleNotePin: (id: string) => ipcRenderer.invoke("notes:toggle-pin", id),
  updateNote: (
    id: string,
    input: { title?: string; content?: string; color?: string }
  ) => ipcRenderer.invoke("notes:update", id, input),
  deleteNote: (id: string) => ipcRenderer.invoke("notes:delete", id),
};

contextBridge.exposeInMainWorld("electronAPI", api);
