import Database from "../sqlite";
import type {
  AnalyticsSummary,
  DailyTrendPoint,
  PriorityDistributionItem,
  ProjectAnalyticsItem,
  Priority,
} from "../../shared/types/database";

export class AnalyticsRepository {
  constructor(private db: Database) {}

  getSummary(startDate: string, endDate: string): AnalyticsSummary {
    // 1. Task metrics in date range
    const completedRes = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM tasks
        WHERE status = 'done' 
          AND completed_at IS NOT NULL
          AND date(completed_at) >= date(?)
          AND date(completed_at) <= date(?)
          AND deleted_at IS NULL
      `)
      .get(startDate, endDate) as { count: number } | undefined;

    const createdRes = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM tasks
        WHERE date(created_at) >= date(?)
          AND date(created_at) <= date(?)
          AND deleted_at IS NULL
      `)
      .get(startDate, endDate) as { count: number } | undefined;

    const tasks_completed_count = completedRes?.count || 0;
    const tasks_created_count = createdRes?.count || 0;
    const completion_rate =
      tasks_created_count > 0
        ? Math.min(100, Math.round((tasks_completed_count / tasks_created_count) * 100))
        : tasks_completed_count > 0
        ? 100
        : 0;

    // 2. Active Projects
    const projectsRes = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM projects
        WHERE status = 'active' AND deleted_at IS NULL AND archived_at IS NULL
      `)
      .get() as { count: number } | undefined;
    const active_projects_count = projectsRes?.count || 0;

    // Project progress breakdown
    const projectRows = this.db
      .prepare(`
        SELECT p.id, p.name, p.color,
          COUNT(t.id) as total_tasks,
          SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
        WHERE p.deleted_at IS NULL AND p.archived_at IS NULL
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 6
      `)
      .all() as {
      id: string;
      name: string;
      color: string | null;
      total_tasks: number;
      completed_tasks: number | null;
    }[];

    const project_progress: ProjectAnalyticsItem[] = projectRows.map((p) => {
      const total = p.total_tasks || 0;
      const completed = p.completed_tasks || 0;
      return {
        id: p.id,
        name: p.name,
        color: p.color || "#E99A43",
        total_tasks: total,
        completed_tasks: completed,
        progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // 3. Habits consistency
    const habitsRes = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM habits WHERE status = 'active'
      `)
      .get() as { count: number } | undefined;
    const habits_count = habitsRes?.count || 0;

    const habitLogsRes = this.db
      .prepare(`
        SELECT COUNT(*) as count FROM habit_logs
        WHERE log_date >= date(?) AND log_date <= date(?)
      `)
      .get(startDate, endDate) as { count: number } | undefined;

    // Days in range
    const startNum = Math.floor(Date.parse(`${startDate}T00:00:00Z`) / 86400000);
    const endNum = Math.floor(Date.parse(`${endDate}T00:00:00Z`) / 86400000);
    const daysCount = Math.max(1, endNum - startNum + 1);

    const totalPossibleLogs = habits_count * daysCount;
    const average_habit_consistency =
      totalPossibleLogs > 0
        ? Math.min(
            100,
            Math.round(((habitLogsRes?.count || 0) / totalPossibleLogs) * 100)
          )
        : 0;

    // 4. Daily trends
    const dailyCompletedRows = this.db
      .prepare(`
        SELECT date(completed_at) as d, COUNT(*) as count FROM tasks
        WHERE status = 'done' 
          AND completed_at IS NOT NULL
          AND date(completed_at) >= date(?)
          AND date(completed_at) <= date(?)
          AND deleted_at IS NULL
        GROUP BY date(completed_at)
      `)
      .all(startDate, endDate) as { d: string; count: number }[];

    const dailyCreatedRows = this.db
      .prepare(`
        SELECT date(created_at) as d, COUNT(*) as count FROM tasks
        WHERE date(created_at) >= date(?)
          AND date(created_at) <= date(?)
          AND deleted_at IS NULL
        GROUP BY date(created_at)
      `)
      .all(startDate, endDate) as { d: string; count: number }[];

    const completedMap = new Map(dailyCompletedRows.map((r) => [r.d, r.count]));
    const createdMap = new Map(dailyCreatedRows.map((r) => [r.d, r.count]));

    const daily_trends: DailyTrendPoint[] = [];
    for (let i = 0; i < daysCount; i++) {
      const curDate = new Date(Date.parse(`${startDate}T00:00:00Z`) + i * 86400000);
      const dStr = curDate.toISOString().substring(0, 10);
      daily_trends.push({
        date: dStr,
        completed_count: completedMap.get(dStr) || 0,
        created_count: createdMap.get(dStr) || 0,
      });
    }

    // 5. Priority distribution
    const priorityRows = this.db
      .prepare(`
        SELECT priority, COUNT(*) as count FROM tasks
        WHERE deleted_at IS NULL AND archived_at IS NULL
        GROUP BY priority
      `)
      .all() as { priority: string; count: number }[];

    const priorityMap = new Map(priorityRows.map((r) => [r.priority, r.count]));
    const priorities: Priority[] = ["urgent", "high", "medium", "low"];
    const priority_distribution: PriorityDistributionItem[] = priorities.map(
      (p) => ({
        priority: p,
        count: priorityMap.get(p) || 0,
      })
    );

    return {
      tasks_completed_count,
      tasks_created_count,
      completion_rate,
      active_projects_count,
      habits_count,
      average_habit_consistency,
      daily_trends,
      priority_distribution,
      project_progress,
    };
  }
}
