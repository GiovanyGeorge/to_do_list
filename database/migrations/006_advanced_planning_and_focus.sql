-- Migration 006: Advanced Planning, Focus Sessions, and Goal Milestones Linking

-- 1. Focus Sessions table for timestamp-based stopwatch persistence
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed', -- 'active', 'paused', 'completed', 'cancelled'
  accumulated_paused_seconds INTEGER NOT NULL DEFAULT 0,
  last_paused_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_status ON focus_sessions(status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);

-- 2. Add repeat_reminder_daily and reminder_time to reminders if not already present
-- SQLite allows ADD COLUMN if table exists
-- 3. Enhance goal_milestones with task_id, project_id, target_date
