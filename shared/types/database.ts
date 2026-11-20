export type TaskStatus = "inbox" | "todo" | "in_progress" | "done" | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "active" | "completed" | "on_hold" | "archived";

export interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  status: ProjectStatus;
  start_at: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  position?: number;
}

export interface ProjectWithStats extends ProjectRecord {
  task_count: number;
  completed_task_count: number;
  progress_percent: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  start_at?: string;
  due_at?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  color?: string | null;
  status?: ProjectStatus;
  start_at?: string | null;
  due_at?: string | null;
  archived_at?: string | null;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  project_id: string | null;
  category_id: string | null;
  start_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  recurrence_rule: string | null;
  recurrence_series_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
  position?: number;
}

export interface SubtaskRecord {
  id: string;
  task_id: string;
  title: string;
  completed: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  description?: string | null;
  created_at: string;
  archived_at?: string | null;
}

export interface CategoryWithStats extends CategoryRecord {
  task_count: number;
  completed_task_count: number;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  archived_at?: string | null;
}

export interface TagRecord {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface TaskDayPlanRecord {
  id: string;
  task_id: string;
  plan_date: string;
  position: number;
  created_at: string;
}

export interface TaskWithDetails extends TaskRecord {
  subtasks: SubtaskRecord[];
  tags: TagRecord[];
  category?: CategoryRecord | null;
  is_in_my_day?: boolean;
  blocking_tasks?: string[];
  blocked_by_incomplete_count?: number;
  reminder_at?: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  project_id?: string;
  category_id?: string;
  start_at?: string;
  due_at?: string;
  recurrence_rule?: string;
  tag_ids?: string[];
  subtasks?: string[];
  plan_date?: string;
  reminder_at?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  project_id?: string | null;
  category_id?: string | null;
  start_at?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  recurrence_rule?: string | null;
  archived_at?: string | null;
  reminder_at?: string | null;
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: Priority;
  project_id?: string;
  category_id?: string;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  plan_date?: string;
  search?: string;
  include_archived?: boolean;
}

// Reminders & Notifications Types
export type ReminderType = "task_reminder" | "deadline" | "overdue" | "daily_plan" | "custom";
export type ReminderStatus = "pending" | "delivered" | "dismissed" | "failed";

export interface ReminderRecord {
  id: string;
  task_id: string | null;
  remind_at: string;
  type: ReminderType;
  title: string;
  message: string | null;
  status: ReminderStatus;
  created_at: string;
}

export interface NotificationLogRecord {
  id: string;
  reminder_id: string | null;
  channel: "in_app" | "native_windows";
  title: string;
  message: string | null;
  status: "delivered" | "failed" | "skipped";
  delivered_at: string;
}

export interface AppSettingRecord {
  key: string;
  value: string;
  updated_at: string;
}

// Habits Types
export type HabitFrequency = "daily" | "weekdays" | "weekly" | "custom";

export interface HabitRecord {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  target_value: number;
  unit: string | null;
  color: string | null;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface HabitLogRecord {
  id: string;
  habit_id: string;
  log_date: string;
  value: number;
  notes: string | null;
  created_at: string;
}

export interface HabitWithStats extends HabitRecord {
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  is_completed_today: boolean;
  recent_logs: string[];
}

// Goals Types
export interface GoalMilestoneRecord {
  id: string;
  goal_id: string;
  title: string;
  completed: number;
  position: number;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalRecord {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  project_id: string | null;
  status: "active" | "completed" | "on_hold" | "archived";
  start_at: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface GoalWithDetails extends GoalRecord {
  milestones: GoalMilestoneRecord[];
  progress_percent: number;
  completed_milestones_count: number;
  total_milestones_count: number;
}

// Notes Types
export interface NoteRecord {
  id: string;
  title: string;
  content: string | null;
  is_pinned: number;
  color: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface NoteWithTags extends NoteRecord {
  tags: TagRecord[];
}

// Analytics Types
export interface DailyTrendPoint {
  date: string;
  completed_count: number;
  created_count: number;
}

export interface PriorityDistributionItem {
  priority: Priority;
  count: number;
}

export interface ProjectAnalyticsItem {
  id: string;
  name: string;
  color: string;
  progress_percent: number;
  completed_tasks: number;
  total_tasks: number;
}

export interface AnalyticsSummary {
  tasks_completed_count: number;
  tasks_created_count: number;
  completion_rate: number;
  active_projects_count: number;
  habits_count: number;
  average_habit_consistency: number;
  daily_trends: DailyTrendPoint[];
  priority_distribution: PriorityDistributionItem[];
  project_progress: ProjectAnalyticsItem[];
}

// ==========================================
// Bible Types (Smith & Van Dyke Translation)
// ==========================================

export interface BibleBookRecord {
  id: number;
  name_ar: string;
  name_en: string;
  testament: "old" | "new";
  abbr_ar: string;
  abbr_en: string;
  chapters_count: number;
}

export interface BibleVerseRecord {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  heading?: string | null;
  text: string;
  translation: string;
}

export interface DailyVerseWithDetails extends BibleVerseRecord {
  book_name_ar: string;
  book_name_en: string;
  book_abbr_ar: string;
  book_abbr_en: string;
  testament: "old" | "new";
  date?: string;
  is_favorite?: boolean;
}

export interface BibleFavoriteRecord {
  id: string;
  verse_id: number;
  notes?: string | null;
  created_at: string;
}

export interface BibleFavoriteWithVerse extends DailyVerseWithDetails {
  favorite_id: string;
  notes?: string | null;
  favorited_at: string;
}


