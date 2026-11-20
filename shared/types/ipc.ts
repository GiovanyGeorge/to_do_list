import type {
  TaskWithDetails,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
  ProjectWithStats,
  CreateProjectInput,
  UpdateProjectInput,
  NotificationLogRecord,
  ReminderRecord,
  ReminderType,
} from "./database";

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  isPackaged: boolean;
}

export interface ElectronAPI {
  getAppInfo: () => Promise<AppInfo>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => () => void;

  // Task API
  listTasks: (filters?: TaskFilterParams) => Promise<TaskWithDetails[]>;
  getTask: (id: string) => Promise<TaskWithDetails | null>;
  createTask: (input: CreateTaskInput) => Promise<TaskWithDetails>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<TaskWithDetails | null>;
  toggleTask: (id: string) => Promise<TaskWithDetails | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleDayPlan: (taskId: string, planDate: string) => Promise<boolean>;
  addDependency: (
    taskId: string,
    dependsOnTaskId: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeDependency: (
    taskId: string,
    dependsOnTaskId: string
  ) => Promise<{ success: boolean }>;

  // Project API
  listProjects: (includeArchived?: boolean) => Promise<ProjectWithStats[]>;
  getProject: (id: string) => Promise<ProjectWithStats | null>;
  createProject: (input: CreateProjectInput) => Promise<ProjectWithStats>;
  updateProject: (
    id: string,
    input: UpdateProjectInput
  ) => Promise<ProjectWithStats | null>;
  deleteProject: (id: string) => Promise<boolean>;
  archiveProject: (id: string) => Promise<ProjectWithStats | null>;

  // Notification & Reminder API
  listNotifications: (limit?: number) => Promise<NotificationLogRecord[]>;
  clearNotifications: () => Promise<boolean>;
  createReminder: (input: {
    taskId?: string;
    remindAt: string;
    title: string;
    message?: string;
    type?: ReminderType;
  }) => Promise<ReminderRecord>;
  getSetting: (key: string, defaultValue?: string) => Promise<string>;
  setSetting: (key: string, value: string) => Promise<boolean>;
  onNotificationReceived?: (callback: (notif: NotificationLogRecord) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
