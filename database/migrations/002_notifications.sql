-- Migration 002: Reminders, Notifications and App Settings

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  remind_at TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'task_reminder',
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY,
  reminder_id TEXT REFERENCES reminders(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL,
  delivered_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_status_remind_at ON reminders(status, remind_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_reminder_id ON notification_logs(reminder_id);
