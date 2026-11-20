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
  blocking_tasks?: string[];
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
  subtasks?: string[];
  plan_date?: string;
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
  due_date?: string;
  start_date?: string;
  end_date?: string;
  plan_date?: string;
  search?: string;
  include_archived?: boolean;
}
