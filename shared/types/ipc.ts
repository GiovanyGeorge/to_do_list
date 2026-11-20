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
  HabitWithStats,
  HabitFrequency,
  GoalWithDetails,
  GoalMilestoneRecord,
  NoteWithTags,
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

  // Habits API
  listHabits: (includeArchived?: boolean) => Promise<HabitWithStats[]>;
  getHabit: (id: string) => Promise<HabitWithStats | null>;
  createHabit: (input: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_value?: number;
    unit?: string;
    color?: string;
  }) => Promise<HabitWithStats>;
  toggleHabitLog: (habitId: string, logDate: string) => Promise<boolean>;
  deleteHabit: (id: string) => Promise<boolean>;

  // Goals API
  listGoals: (includeArchived?: boolean) => Promise<GoalWithDetails[]>;
  getGoal: (id: string) => Promise<GoalWithDetails | null>;
  createGoal: (input: {
    title: string;
    description?: string;
    categoryId?: string;
    projectId?: string;
    startAt?: string;
    targetDate?: string;
    milestones?: string[];
  }) => Promise<GoalWithDetails>;
  toggleGoalMilestone: (milestoneId: string) => Promise<boolean>;
  addGoalMilestone: (goalId: string, title: string) => Promise<GoalMilestoneRecord>;
  deleteGoal: (id: string) => Promise<boolean>;

  // Notes API
  listNotes: (search?: string) => Promise<NoteWithTags[]>;
  getNote: (id: string) => Promise<NoteWithTags | null>;
  createNote: (input: {
    title: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    tagIds?: string[];
  }) => Promise<NoteWithTags>;
  toggleNotePin: (id: string) => Promise<boolean>;
  updateNote: (
    id: string,
    input: { title?: string; content?: string; color?: string }
  ) => Promise<NoteWithTags | null>;
  deleteNote: (id: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
