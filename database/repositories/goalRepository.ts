import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  GoalRecord,
  GoalWithDetails,
  GoalMilestoneRecord,
} from "../../shared/types/database";

// GoalRecord used for type casts below

export class GoalRepository {
  constructor(private db: Database) {}

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
      .prepare("SELECT * FROM goals WHERE id = ?")
      .get(id) as GoalRecord | undefined;

    if (!goal) return null;

    const milestones = this.db
      .prepare(
        "SELECT * FROM goal_milestones WHERE goal_id = ? ORDER BY position ASC, created_at ASC"
      )
      .all(id) as GoalMilestoneRecord[];

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
    let sql = "SELECT * FROM goals";
    if (!includeArchived) {
      sql += " WHERE archived_at IS NULL AND status != 'archived'";
    }
    sql += " ORDER BY created_at DESC";

    const goals = this.db.prepare(sql).all() as GoalRecord[];
    if (goals.length === 0) return [];

    const goalIds = goals.map((g) => g.id);
    const placeholders = goalIds.map(() => "?").join(",");
    const allMilestones = this.db
      .prepare(
        `SELECT * FROM goal_milestones WHERE goal_id IN (${placeholders}) ORDER BY position ASC, created_at ASC`
      )
      .all(...goalIds) as GoalMilestoneRecord[];

    const milestonesByGoal = new Map<string, GoalMilestoneRecord[]>();
    for (const m of allMilestones) {
      if (!milestonesByGoal.has(m.goal_id)) milestonesByGoal.set(m.goal_id, []);
      milestonesByGoal.get(m.goal_id)!.push(m);
    }

    return goals.map((goal) => {
      const milestones = milestonesByGoal.get(goal.id) || [];
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
    });
  }

  toggleMilestone(milestoneId: string): boolean {
    const ms = this.db
      .prepare(
        "SELECT * FROM goal_milestones WHERE id = ?"
      )
      .get(milestoneId) as GoalMilestoneRecord | undefined;

    if (!ms) return false;

    const nextCompleted = ms.completed === 1 ? 0 : 1;
    this.db
      .prepare("UPDATE goal_milestones SET completed = ?, updated_at = ? WHERE id = ?")
      .run(nextCompleted, new Date().toISOString(), milestoneId);

    return nextCompleted === 1;
  }

  addMilestone(
    goalId: string,
    titleOrInput: string | { title: string; targetDate?: string; taskId?: string; projectId?: string }
  ): GoalMilestoneRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const countRes = this.db
      .prepare("SELECT COUNT(*) as count FROM goal_milestones WHERE goal_id = ?")
      .get(goalId) as { count: number } | undefined;
    const position = countRes?.count || 0;

    const title = typeof titleOrInput === "string" ? titleOrInput : titleOrInput.title;
    const targetDate = typeof titleOrInput === "object" ? titleOrInput.targetDate || null : null;
    const taskId = typeof titleOrInput === "object" ? titleOrInput.taskId || null : null;
    const projectId = typeof titleOrInput === "object" ? titleOrInput.projectId || null : null;

    this.db
      .prepare(`
        INSERT INTO goal_milestones (
          id, goal_id, title, completed, position, target_date, task_id, project_id, created_at, updated_at
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, goalId, title, position, targetDate, taskId, projectId, now, now);

    return this.db
      .prepare("SELECT * FROM goal_milestones WHERE id = ?")
      .get(id) as GoalMilestoneRecord;
  }

  updateMilestone(
    milestoneId: string,
    input: { title?: string; targetDate?: string | null; taskId?: string | null; projectId?: string | null }
  ): GoalMilestoneRecord | null {
    const sets: string[] = ["updated_at = ?"];
    const params: unknown[] = [new Date().toISOString()];

    if (input.title !== undefined) {
      sets.push("title = ?");
      params.push(input.title);
    }
    if (input.targetDate !== undefined) {
      sets.push("target_date = ?");
      params.push(input.targetDate);
    }
    if (input.taskId !== undefined) {
      sets.push("task_id = ?");
      params.push(input.taskId);
    }
    if (input.projectId !== undefined) {
      sets.push("project_id = ?");
      params.push(input.projectId);
    }

    params.push(milestoneId);
    this.db
      .prepare(`UPDATE goal_milestones SET ${sets.join(", ")} WHERE id = ?`)
      .run(...params);

    return this.db
      .prepare("SELECT * FROM goal_milestones WHERE id = ?")
      .get(milestoneId) as GoalMilestoneRecord | undefined || null;
  }

  deleteMilestone(milestoneId: string): boolean {
    const res = this.db.prepare("DELETE FROM goal_milestones WHERE id = ?").run(milestoneId);
    return res.changes > 0;
  }

  reorderMilestones(goalId: string, milestoneIds: string[]): boolean {
    const updateStmt = this.db.prepare(
      "UPDATE goal_milestones SET position = ? WHERE id = ? AND goal_id = ?"
    );
    const tx = this.db.transaction(() => {
      milestoneIds.forEach((id, index) => {
        updateStmt.run(index, id, goalId);
      });
    });
    tx();
    return true;
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM goals WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
