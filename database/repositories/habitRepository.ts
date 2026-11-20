import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  HabitRecord,
  HabitWithStats,
  HabitFrequency,
} from "../../shared/types/database";

export class HabitRepository {
  constructor(private db: Database) {}

  create(input: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_value?: number;
    unit?: string;
    color?: string;
  }): HabitWithStats {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const frequency = input.frequency || "daily";
    const targetValue = input.target_value || 1;
    const color = input.color || "#E99A43";

    this.db
      .prepare(`
        INSERT INTO habits (id, name, description, frequency, target_value, unit, color, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `)
      .run(
        id,
        input.name,
        input.description || null,
        frequency,
        targetValue,
        input.unit || null,
        color,
        now,
        now
      );

    return this.getById(id)!;
  }

  getById(id: string): HabitWithStats | null {
    const habit = this.db
      .prepare("SELECT * FROM habits WHERE id = ?")
      .get(id) as HabitRecord | undefined;

    if (!habit) return null;

    const logs = this.db
      .prepare(
        "SELECT log_date FROM habit_logs WHERE habit_id = ? ORDER BY log_date DESC"
      )
      .all(id) as { log_date: string }[];

    const logDates = logs.map((l) => l.log_date);
    const todayStr = new Date().toISOString().substring(0, 10);
    const isCompletedToday = logDates.includes(todayStr);

    const { currentStreak, longestStreak } = this.calculateStreaks(logDates);

    // Recent 7 days logs
    const recentLogs = logDates.slice(0, 7);

    return {
      ...habit,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_completions: logDates.length,
      is_completed_today: isCompletedToday,
      recent_logs: recentLogs,
    };
  }

  list(includeArchived = false): HabitWithStats[] {
    let sql = "SELECT id FROM habits";
    if (!includeArchived) {
      sql += " WHERE archived_at IS NULL AND status != 'archived'";
    }
    sql += " ORDER BY created_at ASC";

    const rows = this.db.prepare(sql).all() as { id: string }[];
    return rows.map((r) => this.getById(r.id)!);
  }

  toggleLog(habitId: string, logDate: string): boolean {
    const existing = this.db
      .prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND log_date = ?")
      .get(habitId, logDate);

    if (existing) {
      this.db
        .prepare("DELETE FROM habit_logs WHERE habit_id = ? AND log_date = ?")
        .run(habitId, logDate);
      return false; // Removed
    } else {
      this.db
        .prepare(
          "INSERT INTO habit_logs (id, habit_id, log_date, value, created_at) VALUES (?, ?, ?, 1, ?)"
        )
        .run(crypto.randomUUID(), habitId, logDate, new Date().toISOString());
      return true; // Added
    }
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM habits WHERE id = ?").run(id);
    return res.changes > 0;
  }

  private calculateStreaks(sortedDescDates: string[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (sortedDescDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Unique sorted descending dates
    const uniqueDates = Array.from(new Set(sortedDescDates)).sort().reverse();
    const dayToNumber = (dStr: string) =>
      Math.floor(Date.parse(`${dStr}T00:00:00Z`) / 86400000);

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayNum = dayToNumber(todayStr);

    const latestLoggedNum = dayToNumber(uniqueDates[0]);

    let currentStreak = 0;
    // Current streak is valid if logged today or yesterday
    if (latestLoggedNum === todayNum || latestLoggedNum === todayNum - 1) {
      let expected = latestLoggedNum;
      for (const dStr of uniqueDates) {
        const num = dayToNumber(dStr);
        if (num === expected) {
          currentStreak++;
          expected--;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak across all history
    let longestStreak = 0;
    let tempStreak = 0;
    let prevNum: number | null = null;

    // Ascending order for longest streak
    const ascDates = [...uniqueDates].sort();
    for (const dStr of ascDates) {
      const num = dayToNumber(dStr);
      if (prevNum === null) {
        tempStreak = 1;
      } else if (num === prevNum + 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      prevNum = num;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak };
  }
}
