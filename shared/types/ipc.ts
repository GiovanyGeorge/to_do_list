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
  AnalyticsSummary,
  CategoryRecord,
  CategoryWithStats,
  CreateCategoryInput,
  UpdateCategoryInput,
  SubtaskRecord,
  BibleBookRecord,
  DailyVerseWithDetails,
  BibleFavoriteRecord,
  BibleFavoriteWithVerse,
  FocusSessionRecord,
} from "./database";
import type { BackupMetadata } from "../../electron/services/backupService";
import type { ArchivedItem } from "../../database/repositories/archiveRepository";

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  isPackaged: boolean;
}

export type WidgetType = "today_tasks" | "quick_add" | "pomodoro" | "focus" | "habits" | "schedule";

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
  reorderTasks: (taskIds: string[]) => Promise<{ success: boolean }>;
  reorderSubtasks: (
    taskId: string,
    subtaskIds: string[]
  ) => Promise<{ success: boolean }>;
  addSubtask: (taskId: string, title: string) => Promise<SubtaskRecord>;
  toggleSubtask: (subtaskId: string, completed?: boolean) => Promise<SubtaskRecord | null>;
  updateSubtask: (subtaskId: string, title: string) => Promise<SubtaskRecord | null>;
  deleteSubtask: (subtaskId: string) => Promise<boolean>;

  // Category API
  listCategories: (includeArchived?: boolean) => Promise<CategoryWithStats[]>;
  getCategory: (id: string) => Promise<CategoryRecord | null>;
  createCategory: (input: CreateCategoryInput) => Promise<CategoryRecord>;
  updateCategory: (
    id: string,
    input: UpdateCategoryInput
  ) => Promise<CategoryRecord | null>;
  archiveCategory: (id: string) => Promise<boolean>;
  unarchiveCategory: (id: string) => Promise<boolean>;
  deleteCategory: (
    id: string,
    reassignToCategoryId?: string | null
  ) => Promise<boolean>;

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
  addGoalMilestone: (
    goalId: string,
    input: string | { title: string; targetDate?: string; taskId?: string; projectId?: string }
  ) => Promise<GoalMilestoneRecord>;
  updateGoalMilestone: (
    milestoneId: string,
    input: { title?: string; targetDate?: string | null; taskId?: string | null; projectId?: string | null }
  ) => Promise<GoalMilestoneRecord | null>;
  deleteGoalMilestone: (milestoneId: string) => Promise<boolean>;
  reorderGoalMilestones: (goalId: string, milestoneIds: string[]) => Promise<boolean>;
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

  // Analytics API
  getAnalyticsSummary: (startDate: string, endDate: string) => Promise<AnalyticsSummary>;

  // Widget API
  openWidget: (type: WidgetType) => Promise<boolean>;
  closeWidget: (type: WidgetType) => Promise<boolean>;
  getWidgetStatus: () => Promise<Record<WidgetType, boolean>>;
  setWidgetAlwaysOnTop: (type: WidgetType, flag: boolean) => Promise<boolean>;

  // Backup & Restore & Export API
  createBackup: (type?: "manual" | "automatic") => Promise<BackupMetadata>;
  listBackups: () => Promise<BackupMetadata[]>;
  restoreBackup: (filepath: string) => Promise<{ success: boolean; message: string }>;
  checkDatabaseIntegrity: () => Promise<{ status: "ok" | "error"; details: string }>;
  exportTasksCSV: () => Promise<string>;
  exportProjectsCSV: () => Promise<string>;
  exportNotesCSV: () => Promise<string>;

  // Archive API
  listArchived: () => Promise<ArchivedItem[]>;
  restoreArchived: (
    type: "task" | "project" | "habit" | "note",
    id: string
  ) => Promise<boolean>;
  deleteArchivedPermanently: (
    type: "task" | "project" | "habit" | "note",
    id: string
  ) => Promise<boolean>;

  // Bible API (Daily Verse, Favorites, Search, Library)
  getDailyVerse: (dateStr?: string) => Promise<DailyVerseWithDetails>;
  toggleBibleFavorite: (
    verseId: number,
    notes?: string
  ) => Promise<{ isFavorite: boolean; favorite?: BibleFavoriteRecord }>;
  isBibleFavorite: (verseId: number) => Promise<boolean>;
  listBibleFavorites: (
    searchQuery?: string
  ) => Promise<BibleFavoriteWithVerse[]>;
  removeBibleFavorite: (verseId: number) => Promise<boolean>;
  listBibleBooks: (testament?: "old" | "new") => Promise<BibleBookRecord[]>;
  searchBibleVerses: (
    query: string,
    options?: { bookId?: number; testament?: "old" | "new"; limit?: number; offset?: number }
  ) => Promise<DailyVerseWithDetails[]>;
  getBibleChapter: (
    bookId: number,
    chapter: number
  ) => Promise<DailyVerseWithDetails[]>;

  // Focus Stopwatch API
  getCurrentFocusSession: () => Promise<{ session: FocusSessionRecord | null; elapsedSeconds: number }>;
  startFocusSession: (taskId?: string, title?: string) => Promise<{ session: FocusSessionRecord; elapsedSeconds: number }>;
  pauseFocusSession: () => Promise<{ session: FocusSessionRecord | null; elapsedSeconds: number }>;
  resumeFocusSession: () => Promise<{ session: FocusSessionRecord | null; elapsedSeconds: number }>;
  resetFocusSession: () => Promise<{ session: null; elapsedSeconds: number }>;
  endFocusSession: () => Promise<{ session: FocusSessionRecord | null; durationSeconds: number }>;
  getTodayFocusSeconds: (todayStr: string) => Promise<number>;
  onFocusStateChanged?: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
