import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  TaskRecord,
  SubtaskRecord,
  CategoryRecord,
  TagRecord,
  TaskWithDetails,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
} from "../../shared/types/database";

export class TaskRepository {
  constructor(private db: Database) {}

  create(input: CreateTaskInput): TaskWithDetails {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const status = input.status || "todo";
    const priority = input.priority || "medium";

    const insertTask = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, project_id, category_id,
        start_at, due_at, recurrence_rule, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    const insertSubtask = this.db.prepare(`
      INSERT INTO subtasks (id, task_id, title, completed, position, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `);

    const insertTag = this.db.prepare(`
      INSERT OR IGNORE INTO task_tags (task_id, tag_id)
      VALUES (?, ?)
    `);

    const insertDayPlan = this.db.prepare(`
      INSERT OR IGNORE INTO task_day_plans (id, task_id, plan_date, position, created_at)
      VALUES (?, ?, ?, 0, ?)
    `);

    const insertReminder = this.db.prepare(`
      INSERT INTO reminders (id, task_id, remind_at, type, title, message, status, created_at)
      VALUES (?, ?, ?, 'task_reminder', ?, ?, 'pending', ?)
    `);

    const transaction = this.db.transaction(() => {
      insertTask.run(
        id,
        input.title,
        input.description || null,
        status,
        priority,
        input.project_id || null,
        input.category_id || null,
        input.start_at || null,
        input.due_at || null,
        input.recurrence_rule || null,
        now,
        now
      );

      if (input.subtasks && input.subtasks.length > 0) {
        input.subtasks.forEach((stTitle, idx) => {
          insertSubtask.run(crypto.randomUUID(), id, stTitle, idx, now, now);
        });
      }

      if (input.tag_ids && input.tag_ids.length > 0) {
        input.tag_ids.forEach((tagId) => {
          insertTag.run(id, tagId);
        });
      }

      if (input.plan_date) {
        insertDayPlan.run(crypto.randomUUID(), id, input.plan_date, now);
      }

      if (input.reminder_at) {
        insertReminder.run(
          crypto.randomUUID(),
          id,
          input.reminder_at,
          input.title,
          input.description || null,
          now
        );
      }
    });

    transaction();
    return this.getById(id)!;
  }

  getById(id: string): TaskWithDetails | null {
    const task = this.db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(id) as TaskRecord | undefined;

    if (!task) return null;

    const subtasks = this.db
      .prepare(
        "SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC, created_at ASC"
      )
      .all(id) as SubtaskRecord[];

    const tags = this.db
      .prepare(
        `SELECT t.* FROM tags t 
         INNER JOIN task_tags tt ON tt.tag_id = t.id 
         WHERE tt.task_id = ?`
      )
      .all(id) as TagRecord[];

    let category: CategoryRecord | null = null;
    if (task.category_id) {
      category =
        this.db
          .prepare("SELECT * FROM categories WHERE id = ?")
          .get(task.category_id) as CategoryRecord | undefined || null;
    }

    // Dependencies (blocking task IDs)
    const blocking = this.db
      .prepare(
        "SELECT depends_on_task_id FROM task_dependencies WHERE task_id = ?"
      )
      .all(id) as { depends_on_task_id: string }[];

    const blockingIds = blocking.map((b) => b.depends_on_task_id);

    // Incomplete blocking tasks count
    let blockedCount = 0;
    if (blockingIds.length > 0) {
      const placeholders = blockingIds.map(() => "?").join(",");
      const res = this.db
        .prepare(
          `SELECT COUNT(*) as count FROM tasks WHERE id IN (${placeholders}) AND status != 'done'`
        )
        .get(...blockingIds) as { count: number };
      blockedCount = res.count;
    }

    // Pending reminder if any
    const reminderRow = this.db
      .prepare(
        "SELECT remind_at FROM reminders WHERE task_id = ? AND status = 'pending' ORDER BY remind_at ASC LIMIT 1"
      )
      .get(id) as { remind_at: string } | undefined;

    return {
      ...task,
      subtasks,
      tags,
      category,
      blocking_tasks: blockingIds,
      blocked_by_incomplete_count: blockedCount,
      reminder_at: reminderRow?.remind_at || null,
    };
  }

  list(filters?: TaskFilterParams): TaskWithDetails[] {
    let sql = `
      SELECT t.*, 
        CASE WHEN tdp.task_id IS NOT NULL THEN 1 ELSE 0 END as is_in_my_day
      FROM tasks t
      LEFT JOIN task_day_plans tdp ON tdp.task_id = t.id ${
        filters?.plan_date ? "AND tdp.plan_date = ?" : ""
      }
      WHERE t.deleted_at IS NULL
    `;

    const params: unknown[] = [];
    if (filters?.plan_date) {
      params.push(filters.plan_date);
    }

    if (!filters?.include_archived) {
      sql += " AND t.archived_at IS NULL";
    }

    if (filters?.status) {
      sql += " AND t.status = ?";
      params.push(filters.status);
    }

    if (filters?.priority) {
      sql += " AND t.priority = ?";
      params.push(filters.priority);
    }

    if (filters?.project_id) {
      sql += " AND t.project_id = ?";
      params.push(filters.project_id);
    }

    if (filters?.category_id) {
      sql += " AND t.category_id = ?";
      params.push(filters.category_id);
    }

    if (filters?.due_date) {
      sql += " AND date(t.due_at, 'localtime') = date(?)";
      params.push(filters.due_date);
    }

    if (filters?.plan_date) {
      sql += " AND tdp.task_id IS NOT NULL";
    }

    if (filters?.search) {
      sql += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += " ORDER BY t.position ASC, t.created_at DESC";

    const rows = this.db.prepare(sql).all(...params) as TaskRecord[];
    return rows.map((r) => this.getById(r.id)!);
  }

  update(id: string, input: UpdateTaskInput): TaskWithDetails | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const sets: string[] = ["updated_at = ?"];
    const params: unknown[] = [new Date().toISOString()];

    if (input.title !== undefined) {
      sets.push("title = ?");
      params.push(input.title);
    }
    if (input.description !== undefined) {
      sets.push("description = ?");
      params.push(input.description);
    }
    if (input.status !== undefined) {
      sets.push("status = ?");
      params.push(input.status);
    }
    if (input.priority !== undefined) {
      sets.push("priority = ?");
      params.push(input.priority);
    }
    if (input.project_id !== undefined) {
      sets.push("project_id = ?");
      params.push(input.project_id);
    }
    if (input.category_id !== undefined) {
      sets.push("category_id = ?");
      params.push(input.category_id);
    }
    if (input.start_at !== undefined) {
      sets.push("start_at = ?");
      params.push(input.start_at);
    }
    if (input.due_at !== undefined) {
      sets.push("due_at = ?");
      params.push(input.due_at);
    }
    if (input.completed_at !== undefined) {
      sets.push("completed_at = ?");
      params.push(input.completed_at);
    }
    if (input.recurrence_rule !== undefined) {
      sets.push("recurrence_rule = ?");
      params.push(input.recurrence_rule);
    }
    if (input.archived_at !== undefined) {
      sets.push("archived_at = ?");
      params.push(input.archived_at);
    }

    params.push(id);
    this.db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`).run(...params);

    if (input.reminder_at !== undefined) {
      this.db
        .prepare("DELETE FROM reminders WHERE task_id = ? AND status = 'pending'")
        .run(id);

      if (input.reminder_at) {
        this.db
          .prepare(`
            INSERT INTO reminders (id, task_id, remind_at, type, title, message, status, created_at)
            VALUES (?, ?, ?, 'task_reminder', ?, ?, 'pending', ?)
          `)
          .run(
            crypto.randomUUID(),
            id,
            input.reminder_at,
            input.title ?? existing.title,
            input.description !== undefined ? input.description : existing.description,
            new Date().toISOString()
          );
      }
    }

    return this.getById(id);
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return res.changes > 0;
  }

  // Subtask operations
  addSubtask(taskId: string, title: string): SubtaskRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const countRes = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM subtasks WHERE task_id = ?"
      )
      .get(taskId) as { count: number } | undefined;
    const position = countRes?.count || 0;

    this.db
      .prepare(
        "INSERT INTO subtasks (id, task_id, title, completed, position, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, ?)"
      )
      .run(id, taskId, title, position, now, now);

    return this.db
      .prepare("SELECT * FROM subtasks WHERE id = ?")
      .get(id) as SubtaskRecord;
  }

  toggleSubtask(subtaskId: string, completed?: boolean): SubtaskRecord | null {
    const subtask = this.db
      .prepare("SELECT * FROM subtasks WHERE id = ?")
      .get(subtaskId) as SubtaskRecord | undefined;

    if (!subtask) return null;

    const newCompleted =
      completed !== undefined ? (completed ? 1 : 0) : subtask.completed === 1 ? 0 : 1;

    this.db
      .prepare("UPDATE subtasks SET completed = ?, updated_at = ? WHERE id = ?")
      .run(newCompleted, new Date().toISOString(), subtaskId);

    return this.db
      .prepare("SELECT * FROM subtasks WHERE id = ?")
      .get(subtaskId) as SubtaskRecord;
  }

  deleteSubtask(subtaskId: string): boolean {
    const res = this.db.prepare("DELETE FROM subtasks WHERE id = ?").run(subtaskId);
    return res.changes > 0;
  }

  // Day plan (My Day) operations
  toggleDayPlan(taskId: string, planDate: string): boolean {
    const existing = this.db
      .prepare("SELECT id FROM task_day_plans WHERE task_id = ? AND plan_date = ?")
      .get(taskId, planDate) as { id: string } | undefined;

    if (existing) {
      this.db
        .prepare("DELETE FROM task_day_plans WHERE task_id = ? AND plan_date = ?")
        .run(taskId, planDate);
      return false; // Removed
    } else {
      this.db
        .prepare(
          "INSERT INTO task_day_plans (id, task_id, plan_date, position, created_at) VALUES (?, ?, ?, 0, ?)"
        )
        .run(crypto.randomUUID(), taskId, planDate, new Date().toISOString());
      return true; // Added
    }
  }

  // Dependencies
  addDependency(taskId: string, dependsOnTaskId: string): void {
    this.db
      .prepare(
        "INSERT OR IGNORE INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)"
      )
      .run(taskId, dependsOnTaskId);
  }

  removeDependency(taskId: string, dependsOnTaskId: string): void {
    this.db
      .prepare(
        "DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?"
      )
      .run(taskId, dependsOnTaskId);
  }

  getDependencies(taskId: string): string[] {
    const rows = this.db
      .prepare(
        "SELECT depends_on_task_id FROM task_dependencies WHERE task_id = ?"
      )
      .all(taskId) as { depends_on_task_id: string }[];
    return rows.map((r) => r.depends_on_task_id);
  }

  reorder(taskIds: string[]): void {
    const stmt = this.db.prepare("UPDATE tasks SET position = ? WHERE id = ?");
    const tx = this.db.transaction(() => {
      taskIds.forEach((id, index) => {
        stmt.run(index, id);
      });
    });
    tx();
  }

  reorderSubtasks(taskId: string, subtaskIds: string[]): void {
    const stmt = this.db.prepare(
      "UPDATE subtasks SET position = ? WHERE id = ? AND task_id = ?"
    );
    const tx = this.db.transaction(() => {
      subtaskIds.forEach((id, index) => {
        stmt.run(index, id, taskId);
      });
    });
    tx();
  }
}
