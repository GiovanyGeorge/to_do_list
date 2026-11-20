import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "../database/sqlite";
import fs from "node:fs";
import path from "node:path";
import { AnalyticsRepository } from "../database/repositories/analyticsRepository";
import { TaskRepository } from "../database/repositories/taskRepository";
import { TaskService } from "../electron/services/taskService";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { HabitRepository } from "../database/repositories/habitRepository";

describe("Phase 7 - Analytics Aggregation Engine", () => {
  let db: Database;
  let analyticsRepo: AnalyticsRepository;
  let taskRepo: TaskRepository;
  let taskService: TaskService;
  let projectRepo: ProjectRepository;
  let habitRepo: HabitRepository;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");

    const m1 = fs.readFileSync(path.join(__dirname, "../database/migrations/001_initial_schema.sql"), "utf-8");
    const m2 = fs.readFileSync(path.join(__dirname, "../database/migrations/002_notifications.sql"), "utf-8");
    const m3 = fs.readFileSync(path.join(__dirname, "../database/migrations/003_habits_goals_notes.sql"), "utf-8");

    db.exec(m1);
    db.exec(m2);
    db.exec(m3);

    analyticsRepo = new AnalyticsRepository(db);
    taskRepo = new TaskRepository(db);
    taskService = new TaskService(taskRepo);
    projectRepo = new ProjectRepository(db);
    habitRepo = new HabitRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it("calculates accurate completion rates and daily trend counts", () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const startStr = new Date(Date.now() - 6 * 86400000).toISOString().substring(0, 10);

    // Create 3 tasks: 2 completed, 1 pending
    const t1 = taskService.createTask({ title: "Task 1", priority: "urgent" });
    const t2 = taskService.createTask({ title: "Task 2", priority: "high" });
    taskService.createTask({ title: "Task 3", priority: "low" });

    taskService.toggleTask(t1.id);
    taskService.toggleTask(t2.id);

    const summary = analyticsRepo.getSummary(startStr, todayStr);
    expect(summary.tasks_created_count).toBe(3);
    expect(summary.tasks_completed_count).toBe(2);
    expect(summary.completion_rate).toBe(67); // 2/3 = 66.6% -> 67%

    // Priority breakdown
    const urgentCount = summary.priority_distribution.find((p) => p.priority === "urgent")?.count;
    expect(urgentCount).toBe(1);
  });

  it("calculates active projects and habit consistency rates", () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const startStr = new Date(Date.now() - 6 * 86400000).toISOString().substring(0, 10);

    // Create project
    projectRepo.create({ name: "Q4 Roadmap", status: "active" });

    // Create habit and log for today
    const habit = habitRepo.create({ name: "Hydration" });
    habitRepo.toggleLog(habit.id, todayStr);

    const summary = analyticsRepo.getSummary(startStr, todayStr);
    expect(summary.active_projects_count).toBe(1);
    expect(summary.habits_count).toBe(1);
    expect(summary.average_habit_consistency).toBeGreaterThan(0);
  });
});
