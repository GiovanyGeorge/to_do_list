export type TaskStatus = "inbox" | "todo" | "in_progress" | "done" | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";

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
}

export interface SubtaskRecord {
  id: string;
  task_id: string;
  title: string;
  completed: number; // 0 or 1
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  created_at: string;
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
  plan_date: string; // YYYY-MM-DD
  position: number;
  created_at: string;
}

export interface TaskWithDetails extends TaskRecord {
  subtasks: SubtaskRecord[];
  tags: TagRecord[];
  category?: CategoryRecord | null;
  is_in_my_day?: boolean;
  blocking_tasks?: string[]; // IDs of tasks this task depends on
  blocked_by_incomplete_count?: number;
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
  subtasks?: string[]; // Subtask titles
  plan_date?: string; // Add directly to My Day on a specific date
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
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: Priority;
  project_id?: string;
  category_id?: string;
  due_date?: string; // YYYY-MM-DD
  plan_date?: string; // YYYY-MM-DD for My Day
  search?: string;
  include_archived?: boolean;
}
