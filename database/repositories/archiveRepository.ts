import Database from "../sqlite";

export interface ArchivedItem {
  id: string;
  type: "task" | "project" | "habit" | "note";
  title: string;
  archivedAt: string;
}

export class ArchiveRepository {
  constructor(private db: Database) {}

  listArchived(): ArchivedItem[] {
    const items: ArchivedItem[] = [];

    // Archived Tasks
    const tasks = this.db
      .prepare(`
        SELECT id, title, archived_at FROM tasks WHERE archived_at IS NOT NULL AND deleted_at IS NULL
      `)
      .all() as { id: string; title: string; archived_at: string }[];
    tasks.forEach((t) =>
      items.push({ id: t.id, type: "task", title: t.title, archivedAt: t.archived_at })
    );

    // Archived Projects
    const projects = this.db
      .prepare(`
        SELECT id, name, archived_at FROM projects WHERE archived_at IS NOT NULL AND deleted_at IS NULL
      `)
      .all() as { id: string; name: string; archived_at: string }[];
    projects.forEach((p) =>
      items.push({ id: p.id, type: "project", title: p.name, archivedAt: p.archived_at })
    );

    // Archived Habits
    const habits = this.db
      .prepare(`
        SELECT id, name, archived_at FROM habits WHERE archived_at IS NOT NULL
      `)
      .all() as { id: string; name: string; archived_at: string }[];
    habits.forEach((h) =>
      items.push({ id: h.id, type: "habit", title: h.name, archivedAt: h.archived_at })
    );

    // Archived Notes
    const notes = this.db
      .prepare(`
        SELECT id, title, archived_at FROM notes WHERE archived_at IS NOT NULL
      `)
      .all() as { id: string; title: string; archived_at: string }[];
    notes.forEach((n) =>
      items.push({ id: n.id, type: "note", title: n.title, archivedAt: n.archived_at })
    );

    return items.sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
  }

  restoreItem(type: "task" | "project" | "habit" | "note", id: string): boolean {
    const table =
      type === "task"
        ? "tasks"
        : type === "project"
        ? "projects"
        : type === "habit"
        ? "habits"
        : "notes";

    const extraSet = type === "project" ? ", status = 'active'" : "";
    const res = this.db
      .prepare(`UPDATE ${table} SET archived_at = NULL ${extraSet} WHERE id = ?`)
      .run(id);

    return res.changes > 0;
  }

  deletePermanently(type: "task" | "project" | "habit" | "note", id: string): boolean {
    const table =
      type === "task"
        ? "tasks"
        : type === "project"
        ? "projects"
        : type === "habit"
        ? "habits"
        : "notes";

    const res = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return res.changes > 0;
  }
}
