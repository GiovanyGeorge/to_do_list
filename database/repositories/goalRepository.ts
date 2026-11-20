import Database from "better-sqlite3";
import crypto from "node:crypto";
import type {
  GoalRecord,
  GoalWithDetails,
  GoalMilestoneRecord,
} from "../../shared/types/database";

export class GoalRepository {
  constructor(private db: Database.Database) {}

  create(input: {
    title: string;
    description?: string;
    categoryId?: string;
    projectId?: string;
    startAt?: string;
    targetDate?: string;
    milestones?: string[];
  }): GoalWithDetails {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertGoal = this.db.prepare(`
      INSERT INTO goals (id, title, description, category_id, project_id, status, start_at, target_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `);

    const insertMilestone = this.db.prepare(`
      INSERT INTO goal_milestones (id, goal_id, title, completed, position, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertGoal.run(
        id,
        input.title,
        input.description || null,
        input.categoryId || null,
        input.projectId || null,
        input.startAt || null,
        input.targetDate || null,
        now,
        now
      );

      if (input.milestones && input.milestones.length > 0) {
        input.milestones.forEach((mTitle, idx) => {
          insertMilestone.run(crypto.randomUUID(), id, mTitle, idx, now, now);
        });
      }
    });

    transaction();
    return this.getById(id)!;
  }

  getById(id: string): GoalWithDetails | null {
    const goal = this.db
      .prepare<[string], GoalRecord>("SELECT * FROM goals WHERE id = ?")
      .get(id);

    if (!goal) return null;

    const milestones = this.db
      .prepare<[string], GoalMilestoneRecord>(
        "SELECT * FROM goal_milestones WHERE goal_id = ? ORDER BY position ASC, created_at ASC"
      )
      .all(id);

    const total = milestones.length;
    const completed = milestones.filter((m) => m.completed === 1).length;
    const progress_percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...goal,
      milestones,
      progress_percent,
      completed_milestones_count: completed,
      total_milestones_count: total,
    };
  }

  list(includeArchived = false): GoalWithDetails[] {
    let sql = "SELECT id FROM goals";
    if (!includeArchived) {
      sql += " WHERE archived_at IS NULL AND status != 'archived'";
    }
    sql += " ORDER BY created_at DESC";

    const rows = this.db.prepare(sql).all() as { id: string }[];
    return rows.map((r) => this.getById(r.id)!);
  }

  toggleMilestone(milestoneId: string): boolean {
    const ms = this.db
      .prepare<[string], GoalMilestoneRecord>(
        "SELECT * FROM goal_milestones WHERE id = ?"
      )
      .get(milestoneId);

    if (!ms) return false;

    const nextCompleted = ms.completed === 1 ? 0 : 1;
    this.db
      .prepare("UPDATE goal_milestones SET completed = ?, updated_at = ? WHERE id = ?")
      .run(nextCompleted, new Date().toISOString(), milestoneId);

    return nextCompleted === 1;
  }

  addMilestone(goalId: string, title: string): GoalMilestoneRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const countRes = this.db
      .prepare<[string], { count: number }>(
        "SELECT COUNT(*) as count FROM goal_milestones WHERE goal_id = ?"
      )
      .get(goalId);
    const position = countRes?.count || 0;

    this.db
      .prepare(
        "INSERT INTO goal_milestones (id, goal_id, title, completed, position, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, ?)"
      )
      .run(id, goalId, title, position, now, now);

    return this.db
      .prepare<[string], GoalMilestoneRecord>(
        "SELECT * FROM goal_milestones WHERE id = ?"
      )
      .get(id)!;
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM goals WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
