import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  FocusSessionRecord,
} from "../../shared/types/database";

export class FocusRepository {
  constructor(private db: Database) {}

  getCurrentSession(): {
    session: FocusSessionRecord | null;
    elapsedSeconds: number;
  } {
    const row = this.db
      .prepare(
        "SELECT * FROM focus_sessions WHERE status IN ('active', 'paused') ORDER BY started_at DESC LIMIT 1"
      )
      .get() as FocusSessionRecord | undefined;

    if (!row) {
      return { session: null, elapsedSeconds: 0 };
    }

    const startMs = new Date(row.started_at).getTime();
    const nowMs = Date.now();
    const pausedAcc = row.accumulated_paused_seconds || 0;

    let elapsed = 0;
    if (row.status === "active") {
      elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000) - pausedAcc);
    } else {
      const pausedAtMs = row.last_paused_at
        ? new Date(row.last_paused_at).getTime()
        : nowMs;
      elapsed = Math.max(0, Math.floor((pausedAtMs - startMs) / 1000) - pausedAcc);
    }

    return { session: row, elapsedSeconds: elapsed };
  }

  startSession(taskId?: string, title?: string): {
    session: FocusSessionRecord;
    elapsedSeconds: number;
  } {
    // If there's an ongoing session, mark it completed or cancelled first to prevent duplicates
    const current = this.getCurrentSession();
    if (current.session) {
      this.endSession();
    }

    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO focus_sessions (
          id, task_id, title, started_at, ended_at, duration_seconds,
          status, accumulated_paused_seconds, last_paused_at, created_at
        ) VALUES (?, ?, ?, ?, NULL, 0, 'active', 0, NULL, ?)
      `)
      .run(id, taskId || null, title || null, nowIso, nowIso);

    const created = this.db
      .prepare("SELECT * FROM focus_sessions WHERE id = ?")
      .get(id) as FocusSessionRecord;

    return { session: created, elapsedSeconds: 0 };
  }

  pauseSession(): {
    session: FocusSessionRecord | null;
    elapsedSeconds: number;
  } {
    const current = this.getCurrentSession();
    if (!current.session || current.session.status !== "active") {
      return current;
    }

    const nowIso = new Date().toISOString();
    this.db
      .prepare("UPDATE focus_sessions SET status = 'paused', last_paused_at = ? WHERE id = ?")
      .run(nowIso, current.session.id);

    return this.getCurrentSession();
  }

  resumeSession(): {
    session: FocusSessionRecord | null;
    elapsedSeconds: number;
  } {
    const current = this.getCurrentSession();
    if (!current.session || current.session.status !== "paused") {
      return current;
    }

    const nowMs = Date.now();
    const pausedAtMs = current.session.last_paused_at
      ? new Date(current.session.last_paused_at).getTime()
      : nowMs;
    const additionalPausedSeconds = Math.max(0, Math.floor((nowMs - pausedAtMs) / 1000));
    const newAccumulated =
      (current.session.accumulated_paused_seconds || 0) + additionalPausedSeconds;

    this.db
      .prepare(`
        UPDATE focus_sessions 
        SET status = 'active', last_paused_at = NULL, accumulated_paused_seconds = ?
        WHERE id = ?
      `)
      .run(newAccumulated, current.session.id);

    return this.getCurrentSession();
  }

  resetSession(): { session: null; elapsedSeconds: number } {
    const current = this.getCurrentSession();
    if (current.session) {
      this.db
        .prepare("UPDATE focus_sessions SET status = 'cancelled', ended_at = ? WHERE id = ?")
        .run(new Date().toISOString(), current.session.id);
    }
    return { session: null, elapsedSeconds: 0 };
  }

  endSession(): {
    session: FocusSessionRecord | null;
    durationSeconds: number;
  } {
    const current = this.getCurrentSession();
    if (!current.session) {
      return { session: null, durationSeconds: 0 };
    }

    const duration = current.elapsedSeconds;
    const nowIso = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE focus_sessions 
        SET status = 'completed', ended_at = ?, duration_seconds = ?
        WHERE id = ?
      `)
      .run(nowIso, duration, current.session.id);

    const completed = this.db
      .prepare("SELECT * FROM focus_sessions WHERE id = ?")
      .get(current.session.id) as FocusSessionRecord;

    return { session: completed, durationSeconds: duration };
  }

  getTodayFocusSeconds(todayStr: string): number {
    const res = this.db
      .prepare(`
        SELECT SUM(duration_seconds) as total
        FROM focus_sessions
        WHERE status = 'completed' AND date(started_at, 'localtime') = date(?)
      `)
      .get(todayStr) as { total: number | null } | undefined;

    return res?.total || 0;
  }
}
