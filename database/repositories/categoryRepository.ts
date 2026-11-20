import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  CategoryRecord,
  CategoryWithStats,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../shared/types/database";

export class CategoryRepository {
  constructor(private db: Database) {}

  list(includeArchived = false): CategoryWithStats[] {
    let sql = `
      SELECT c.*,
        COUNT(t.id) as task_count,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_task_count
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id AND t.deleted_at IS NULL
    `;

    if (!includeArchived) {
      sql += " WHERE c.archived_at IS NULL";
    }

    sql += " GROUP BY c.id ORDER BY c.name ASC";

    const rows = this.db.prepare(sql).all() as (CategoryRecord & {
      task_count: number;
      completed_task_count: number | null;
    })[];

    return rows.map((r) => ({
      ...r,
      task_count: r.task_count || 0,
      completed_task_count: r.completed_task_count || 0,
    }));
  }

  getById(id: string): CategoryRecord | null {
    const row = this.db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(id) as CategoryRecord | undefined;
    return row || null;
  }

  create(input: CreateCategoryInput): CategoryRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const color = input.color || "#C2410C";
    const icon = input.icon || "Folder";

    this.db
      .prepare(`
        INSERT INTO categories (id, name, color, icon, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        input.name.trim(),
        color,
        icon,
        input.description ? input.description.trim() : null,
        now
      );

    return this.getById(id)!;
  }

  update(id: string, input: UpdateCategoryInput): CategoryRecord | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const sets: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      sets.push("name = ?");
      params.push(input.name.trim());
    }
    if (input.color !== undefined) {
      sets.push("color = ?");
      params.push(input.color);
    }
    if (input.icon !== undefined) {
      sets.push("icon = ?");
      params.push(input.icon);
    }
    if (input.description !== undefined) {
      sets.push("description = ?");
      params.push(input.description ? input.description.trim() : null);
    }
    if (input.archived_at !== undefined) {
      sets.push("archived_at = ?");
      params.push(input.archived_at);
    }

    if (sets.length === 0) return existing;

    params.push(id);
    this.db.prepare(`UPDATE categories SET ${sets.join(", ")} WHERE id = ?`).run(...params);
    return this.getById(id);
  }

  archive(id: string): boolean {
    const res = this.db
      .prepare("UPDATE categories SET archived_at = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
    return res.changes > 0;
  }

  unarchive(id: string): boolean {
    const res = this.db
      .prepare("UPDATE categories SET archived_at = NULL WHERE id = ?")
      .run(id);
    return res.changes > 0;
  }

  delete(id: string, reassignToCategoryId: string | null = null): boolean {
    // Reassign affected tasks rather than deleting them
    this.db
      .prepare("UPDATE tasks SET category_id = ? WHERE category_id = ?")
      .run(reassignToCategoryId, id);

    // Reassign affected goals/habits if applicable
    this.db
      .prepare("UPDATE goals SET category_id = ? WHERE category_id = ?")
      .run(reassignToCategoryId, id);

    const res = this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
