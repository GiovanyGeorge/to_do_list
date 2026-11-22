import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "../database/sqlite";
import { FocusRepository } from "../database/repositories/focusRepository";
import { TaskRepository } from "../database/repositories/taskRepository";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { GoalRepository } from "../database/repositories/goalRepository";
import { CategoryRepository } from "../database/repositories/categoryRepository";
import { runMigrations } from "../database/migrator";
import fs from "node:fs";
import path from "node:path";

describe("Advanced Planning, Focus Stopwatch, and Subtask Progress", () => {
  let db: Database;
  let testDbPath: string;
  let focusRepo: FocusRepository;
  let taskRepo: TaskRepository;
  let projectRepo: ProjectRepository;
  let goalRepo: GoalRepository;
  let categoryRepo: CategoryRepository;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test_advanced_${Date.now()}_${Math.random().toString(36).substring(7)}.db`);
    db = new Database(testDbPath);
    runMigrations(db);

    focusRepo = new FocusRepository(db);
    categoryRepo = new CategoryRepository(db);
    taskRepo = new TaskRepository(db);
    projectRepo = new ProjectRepository(db);
    goalRepo = new GoalRepository(db);
  });

  afterEach(() => {
    try {
      db.close();
    } catch {}
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {}
    }
  });

  describe("1. Focus Session Stopwatch (Timestamp-based accuracy)", () => {
    it("starts an open-ended session at 00:00:00 without countdown", () => {
      const res = focusRepo.startSession(undefined, "Deep Work Session");
      expect(res.session).toBeDefined();
      expect(res.session.status).toBe("active");
      expect(res.elapsedSeconds).toBe(0);
      expect(res.session.duration_seconds).toBe(0);

      const current = focusRepo.getCurrentSession();
      expect(current).not.toBeNull();
      expect(current?.session.id).toBe(res.session.id);
      expect(current?.session.status).toBe("active");
    });

    it("calculates elapsed time accurately with simulated pause and resume", () => {
      // Create session started 100 seconds ago
      const id = "focus-test-1";
      const startMs = Date.now() - 100 * 1000;
      const startedAt = new Date(startMs).toISOString();

      db.prepare(`
        INSERT INTO focus_sessions (id, title, started_at, duration_seconds, status, accumulated_paused_seconds, created_at)
        VALUES (?, ?, ?, 0, 'active', 0, ?)
      `).run(id, "Test Elapsed", startedAt, startedAt);

      const current = focusRepo.getCurrentSession();
      expect(current).not.toBeNull();
      // Should be around 100 seconds (tolerance: 98-102)
      expect(current!.elapsedSeconds).toBeGreaterThanOrEqual(99);
      expect(current!.elapsedSeconds).toBeLessThanOrEqual(102);

      // Pause the session
      const pauseRes = focusRepo.pauseSession();
      expect(pauseRes).not.toBeNull();
      expect(pauseRes?.session.status).toBe("paused");
      expect(pauseRes?.session.last_paused_at).not.toBeNull();

      // Resume session
      const resumeRes = focusRepo.resumeSession();
      expect(resumeRes).not.toBeNull();
      expect(resumeRes?.session.status).toBe("active");

      // End session
      const endRes = focusRepo.endSession();
      expect(endRes.session).not.toBeNull();
      expect(endRes.session?.status).toBe("completed");
      expect(endRes.durationSeconds).toBeGreaterThanOrEqual(99);

      // Verify no active session remains
      expect(focusRepo.getCurrentSession().session).toBeNull();
    });

    it("resets active session cleanly", () => {
      focusRepo.startSession(undefined, "To be reset");
      expect(focusRepo.getCurrentSession().session).not.toBeNull();

      const resetRes = focusRepo.resetSession();
      expect(resetRes.session).toBeNull();
      expect(resetRes.elapsedSeconds).toBe(0);
      expect(focusRepo.getCurrentSession().session).toBeNull();
    });
  });

  describe("2. Subtasks Progress and Project Aggregation", () => {
    it("calculates partial subtask progress percentage correctly (e.g. 3/5 = 60%)", () => {
      const task = taskRepo.create({
        title: "Build Feature",
        priority: "high",
        subtasks: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
      });

      expect(task.subtasks.length).toBe(5);
      const withDetails1 = taskRepo.getById(task.id);
      expect(withDetails1?.progress_percent).toBe(0);

      // Complete 3 of the 5 subtasks
      taskRepo.toggleSubtask(task.subtasks[0].id, true);
      taskRepo.toggleSubtask(task.subtasks[1].id, true);
      taskRepo.toggleSubtask(task.subtasks[2].id, true);

      const withDetails2 = taskRepo.getById(task.id);
      expect(withDetails2?.progress_percent).toBe(60);

      // Update subtask title
      taskRepo.updateSubtask(task.subtasks[0].id, "Step 1 - Refined");
      const withDetails3 = taskRepo.getById(task.id);
      expect(withDetails3?.subtasks[0].title).toBe("Step 1 - Refined");
    });

    it("aggregates subtask progress into project overall progress", () => {
      const project = projectRepo.create({
        name: "Q4 Deliverables",
        color: "#C2410C",
      });

      // Create Task A with 2 subtasks (1 of 2 completed = 50%)
      const taskA = taskRepo.create({
        title: "Task A",
        project_id: project.id,
        subtasks: ["Sub A1", "Sub A2"],
      });
      taskRepo.toggleSubtask(taskA.subtasks[0].id, true);

      // Create Task B with no subtasks (marked completed = 100%)
      const taskB = taskRepo.create({
        title: "Task B",
        project_id: project.id,
        status: "done",
      });

      // Overall project progress should average Task A (50%) and Task B (100%) = 75%
      const projectDetails = projectRepo.getById(project.id);
      expect(projectDetails).not.toBeNull();
      expect(projectDetails?.task_count).toBe(2);
      expect(projectDetails?.progress_percent).toBe(75);
    });
  });

  describe("3. Unfinished Tasks Carry-over & Deadlines", () => {
    it("identifies carried over and overdue tasks so tasks never disappear silently", () => {
      const pastDate = "2026-11-15";
      const todayDate = "2026-11-20";

      // Past task incomplete with planned start_at
      const carriedOverTask = taskRepo.create({
        title: "Carry over task",
        start_at: pastDate,
        status: "todo",
      });

      // Past task overdue with due_at
      const overdueTask = taskRepo.create({
        title: "Overdue task",
        due_at: `${pastDate}T12:00:00.000Z`,
        status: "todo",
      });

      // Completed past task
      const doneTask = taskRepo.create({
        title: "Done past task",
        start_at: pastDate,
        status: "done",
      });

      const allTasks = taskRepo.list();

      // Filter carried-over tasks for today
      const carriedOver = allTasks.filter(
        (t) => t.status !== "done" && t.start_at && t.start_at.substring(0, 10) < todayDate && !t.is_in_my_day
      );
      expect(carriedOver.some((t) => t.id === carriedOverTask.id)).toBe(true);
      expect(carriedOver.some((t) => t.id === doneTask.id)).toBe(false);

      // Filter overdue tasks
      const overdue = allTasks.filter(
        (t) => t.status !== "done" && t.due_at && t.due_at.substring(0, 10) < todayDate
      );
      expect(overdue.some((t) => t.id === overdueTask.id)).toBe(true);
      expect(overdue.some((t) => t.id === doneTask.id)).toBe(false);
    });
  });

  describe("4. Goal Milestones Rebuild", () => {
    it("supports adding, updating title, reordering, and deleting milestones", () => {
      const goal = goalRepo.create({
        title: "Learn Rust Programming",
        milestones: ["Syntax Basics", "Ownership & Borrowing", "Async Rust"],
      });

      expect(goal.milestones.length).toBe(3);
      expect(goal.progress_percent).toBe(0);

      // Add dynamic milestone directly
      const newMilestone = goalRepo.addMilestone(goal.id, {
        title: "Build CLI Project",
        targetDate: "2026-12-01",
      });
      expect(newMilestone.title).toBe("Build CLI Project");

      const afterAdd = goalRepo.getById(goal.id);
      expect(afterAdd?.milestones.length).toBe(4);

      // Update milestone title
      goalRepo.updateMilestone(newMilestone.id, {
        title: "Build High-Performance CLI Project",
      });
      const afterUpdate = goalRepo.getById(goal.id);
      expect(
        afterUpdate?.milestones.find((m) => m.id === newMilestone.id)?.title
      ).toBe("Build High-Performance CLI Project");

      // Toggle milestone completed
      goalRepo.toggleMilestone(newMilestone.id);
      const afterToggle = goalRepo.getById(goal.id);
      expect(afterToggle?.completed_milestones_count).toBe(1);
      expect(afterToggle?.progress_percent).toBe(25); // 1 of 4 = 25%

      // Delete milestone
      goalRepo.deleteMilestone(newMilestone.id);
      const afterDelete = goalRepo.getById(goal.id);
      expect(afterDelete?.milestones.length).toBe(3);
    });
  });
});
