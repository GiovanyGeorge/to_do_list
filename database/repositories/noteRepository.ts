import Database from "better-sqlite3";
import crypto from "node:crypto";
import type { NoteRecord, NoteWithTags, TagRecord } from "../../shared/types/database";

export class NoteRepository {
  constructor(private db: Database.Database) {}

  create(input: {
    title: string;
    content?: string;
    color?: string;
    isPinned?: boolean;
    tagIds?: string[];
  }): NoteWithTags {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const color = input.color || "#191D24";
    const isPinned = input.isPinned ? 1 : 0;

    const insertNote = this.db.prepare(`
      INSERT INTO notes (id, title, content, is_pinned, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTag = this.db.prepare(`
      INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertNote.run(
        id,
        input.title,
        input.content || null,
        isPinned,
        color,
        now,
        now
      );

      if (input.tagIds && input.tagIds.length > 0) {
        input.tagIds.forEach((tagId) => insertTag.run(id, tagId));
      }
    });

    transaction();
    return this.getById(id)!;
  }

  getById(id: string): NoteWithTags | null {
    const note = this.db
      .prepare<[string], NoteRecord>("SELECT * FROM notes WHERE id = ?")
      .get(id);

    if (!note) return null;

    const tags = this.db
      .prepare<[string], TagRecord>(`
        SELECT t.* FROM tags t
        INNER JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = ?
      `)
      .all(id);

    return { ...note, tags };
  }

  list(search?: string): NoteWithTags[] {
    let sql = "SELECT id FROM notes WHERE archived_at IS NULL";
    const params: unknown[] = [];

    if (search && search.trim()) {
      sql += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += " ORDER BY is_pinned DESC, updated_at DESC";

    const rows = this.db.prepare(sql).all(...params) as { id: string }[];
    return rows.map((r) => this.getById(r.id)!);
  }

  togglePin(id: string): boolean {
    const note = this.getById(id);
    if (!note) return false;

    const nextPinned = note.is_pinned === 1 ? 0 : 1;
    this.db
      .prepare("UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ?")
      .run(nextPinned, new Date().toISOString(), id);

    return nextPinned === 1;
  }

  update(id: string, input: { title?: string; content?: string; color?: string }): NoteWithTags | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const sets: string[] = ["updated_at = ?"];
    const params: unknown[] = [new Date().toISOString()];

    if (input.title !== undefined) {
      sets.push("title = ?");
      params.push(input.title);
    }
    if (input.content !== undefined) {
      sets.push("content = ?");
      params.push(input.content);
    }
    if (input.color !== undefined) {
      sets.push("color = ?");
      params.push(input.color);
    }

    params.push(id);
    this.db.prepare(`UPDATE notes SET ${sets.join(", ")} WHERE id = ?`).run(...params);
    return this.getById(id);
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM notes WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
