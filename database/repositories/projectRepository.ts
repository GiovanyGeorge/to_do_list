import Database from "better-sqlite3";
import crypto from "node:crypto";
import type {
  ProjectRecord,
  ProjectWithStats,
  CreateProjectInput,
  UpdateProjectInput,
} from "../../shared/types/database";

export class ProjectRepository {
  constructor(private db: Database.Database) {}

  create(input: CreateProjectInput): ProjectWithStats {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const status = input.status || "active";
    const color = input.color || "#E99A43";

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, name, description, color, status, start_at, due_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.name,
      input.description || null,
      color,
      status,
      input.start_at || null,
      input.due_at || null,
      now,
      now
    );

    return this.getById(id)!;
  }

  getById(id: string): ProjectWithStats | null {
    const project = this.db
      .prepare<[string], ProjectRecord>("SELECT * FROM projects WHERE id = ?")
      .get(id);

    if (!project) return null;

    const stats = this.db
      .prepare<[string], { total: number; completed: number }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
        FROM tasks 
        WHERE project_id = ? AND deleted_at IS NULL
      `)
      .get(id);

    const task_count = stats?.total || 0;
    const completed_task_count = stats?.completed || 0;
    const progress_percent =
      task_count > 0 ? Math.round((completed_task_count / task_count) * 100) : 0;

    return {
      ...project,
      task_count,
      completed_task_count,
      progress_percent,
    };
  }

  list(includeArchived = false): ProjectWithStats[] {
    let sql = `
      SELECT p.*,
        COUNT(t.id) as task_count,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_task_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
    `;

    if (!includeArchived) {
      sql += " AND p.archived_at IS NULL";
    }

    sql += " GROUP BY p.id ORDER BY p.created_at DESC";

    const rows = this.db.prepare(sql).all() as (ProjectRecord & {
      task_count: number;
      completed_task_count: number | null;
    })[];

    return rows.map((r) => {
      const task_count = r.task_count || 0;
      const completed_task_count = r.completed_task_count || 0;
      const progress_percent =
        task_count > 0 ? Math.round((completed_task_count / task_count) * 100) : 0;

      return {
        ...r,
        task_count,
        completed_task_count,
        progress_percent,
      };
    });
  }

  update(id: string, input: UpdateProjectInput): ProjectWithStats | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const sets: string[] = ["updated_at = ?"];
    const params: unknown[] = [new Date().toISOString()];

    if (input.name !== undefined) {
      sets.push("name = ?");
      params.push(input.name);
    }
    if (input.description !== undefined) {
      sets.push("description = ?");
      params.push(input.description);
    }
    if (input.color !== undefined) {
      sets.push("color = ?");
      params.push(input.color);
    }
    if (input.status !== undefined) {
      sets.push("status = ?");
      params.push(input.status);
    }
    if (input.start_at !== undefined) {
      sets.push("start_at = ?");
      params.push(input.start_at);
    }
    if (input.due_at !== undefined) {
      sets.push("due_at = ?");
      params.push(input.due_at);
    }
    if (input.archived_at !== undefined) {
      sets.push("archived_at = ?");
      params.push(input.archived_at);
    }

    params.push(id);
    this.db.prepare(`UPDATE projects SET ${sets.join(", ")} WHERE id = ?`).run(...params);
    return this.getById(id);
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
