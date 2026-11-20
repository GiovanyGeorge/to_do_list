import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  ReminderRecord,
  NotificationLogRecord,
  ReminderType,
  ReminderStatus,
} from "../../shared/types/database";

export class ReminderRepository {
  constructor(private db: Database) {}

  create(input: {
    taskId?: string;
    remindAt: string;
    title: string;
    message?: string;
    type?: ReminderType;
  }): ReminderRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const type = input.type || "task_reminder";

    const stmt = this.db.prepare(`
      INSERT INTO reminders (id, task_id, remind_at, type, title, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `);

    stmt.run(
      id,
      input.taskId || null,
      input.remindAt,
      type,
      input.title,
      input.message || null,
      now
    );

    return this.getById(id)!;
  }

  getById(id: string): ReminderRecord | null {
    return (
      this.db
        .prepare("SELECT * FROM reminders WHERE id = ?")
        .get(id) as ReminderRecord | undefined || null
    );
  }

  getPendingDueReminders(asOfTime: string): ReminderRecord[] {
    return this.db
      .prepare(
        "SELECT * FROM reminders WHERE status = 'pending' AND remind_at <= ? ORDER BY remind_at ASC"
      )
      .all(asOfTime) as ReminderRecord[];
  }

  getUpcomingPendingReminders(): ReminderRecord[] {
    const now = new Date().toISOString();
    return this.db
      .prepare(
        "SELECT * FROM reminders WHERE status = 'pending' AND remind_at > ? ORDER BY remind_at ASC"
      )
      .all(now) as ReminderRecord[];
  }

  updateStatus(id: string, status: ReminderStatus): void {
    this.db
      .prepare("UPDATE reminders SET status = ? WHERE id = ?")
      .run(status, id);
  }

  logNotification(input: {
    reminderId?: string;
    channel: "in_app" | "native_windows";
    title: string;
    message?: string;
    status: "delivered" | "failed" | "skipped";
  }): NotificationLogRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO notification_logs (id, reminder_id, channel, title, message, status, delivered_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        input.reminderId || null,
        input.channel,
        input.title,
        input.message || null,
        input.status,
        now
      );

    return this.db
      .prepare(
        "SELECT * FROM notification_logs WHERE id = ?"
      )
      .get(id) as NotificationLogRecord;
  }

  listNotifications(limit = 50): NotificationLogRecord[] {
    return this.db
      .prepare(
        "SELECT * FROM notification_logs WHERE channel = 'in_app' ORDER BY delivered_at DESC LIMIT ?"
      )
      .all(limit) as NotificationLogRecord[];
  }

  clearNotifications(): void {
    this.db.prepare("DELETE FROM notification_logs WHERE channel = 'in_app'").run();
  }

  // Settings
  getSetting(key: string, defaultValue = ""): string {
    const row = this.db
      .prepare(
        "SELECT value FROM app_settings WHERE key = ?"
      )
      .get(key);
    return row ? (row as { value: string }).value : defaultValue;
  }

  setSetting(key: string, value: string): void {
    const now = new Date().toISOString();
    this.db
      .prepare(`
        INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `)
      .run(key, value, now);
  }
}
