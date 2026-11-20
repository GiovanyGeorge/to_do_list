import Database from "better-sqlite3";
import type { TaskRecord, ProjectRecord, NoteRecord } from "../../shared/types/database";

export class ExportService {
  constructor(private db: Database.Database) {}

  exportTasksCSV(): string {
    const rows = this.db
      .prepare(`
        SELECT t.id, t.title, t.description, t.status, t.priority,
               t.due_at, t.completed_at, t.created_at,
               p.name as project_name, c.name as category_name
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC
      `)
      .all() as (TaskRecord & { project_name: string | null; category_name: string | null })[];

    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Project",
      "Category",
      "Due Date",
      "Completed At",
      "Created At",
    ];

    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          this.escapeCSV(r.id),
          this.escapeCSV(r.title),
          this.escapeCSV(r.description || ""),
          this.escapeCSV(r.status),
          this.escapeCSV(r.priority),
          this.escapeCSV(r.project_name || ""),
          this.escapeCSV(r.category_name || ""),
          this.escapeCSV(r.due_at || ""),
          this.escapeCSV(r.completed_at || ""),
          this.escapeCSV(r.created_at),
        ].join(",")
      );
    }

    return lines.join("\n");
  }

  exportProjectsCSV(): string {
    const rows = this.db
      .prepare(`
        SELECT p.id, p.name, p.description, p.color, p.status, p.start_at, p.due_at, p.created_at,
               COUNT(t.id) as task_count,
               SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `)
      .all() as (ProjectRecord & { task_count: number; completed_tasks: number | null })[];

    const headers = [
      "ID",
      "Project Name",
      "Description",
      "Color",
      "Status",
      "Total Tasks",
      "Completed Tasks",
      "Deadline",
      "Created At",
    ];

    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          this.escapeCSV(r.id),
          this.escapeCSV(r.name),
          this.escapeCSV(r.description || ""),
          this.escapeCSV(r.color || ""),
          this.escapeCSV(r.status),
          r.task_count,
          r.completed_tasks || 0,
          this.escapeCSV(r.due_at || ""),
          this.escapeCSV(r.created_at),
        ].join(",")
      );
    }

    return lines.join("\n");
  }

  exportNotesCSV(): string {
    const rows = this.db
      .prepare(`
        SELECT id, title, content, is_pinned, created_at, updated_at
        FROM notes
        WHERE archived_at IS NULL
        ORDER BY is_pinned DESC, updated_at DESC
      `)
      .all() as NoteRecord[];

    const headers = ["ID", "Title", "Content", "Pinned", "Created At", "Updated At"];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          this.escapeCSV(r.id),
          this.escapeCSV(r.title),
          this.escapeCSV(r.content || ""),
          r.is_pinned === 1 ? "Yes" : "No",
          this.escapeCSV(r.created_at),
          this.escapeCSV(r.updated_at),
        ].join(",")
      );
    }

    return lines.join("\n");
  }

  private escapeCSV(str: string): string {
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
