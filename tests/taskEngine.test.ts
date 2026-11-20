import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { TaskRepository } from "../database/repositories/taskRepository";
import { TaskService } from "../electron/services/taskService";

describe("Phase 2 - Database and Core Task Engine", () => {
  let db: Database.Database;
  let repo: TaskRepository;
  let service: TaskService;

  beforeEach(() => {
    // In-memory SQLite database for test isolation
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");

    // Run schema
    const schemaSql = fs.readFileSync(
      path.join(__dirname, "../database/migrations/001_initial_schema.sql"),
      "utf-8"
    );
    db.exec(schemaSql);

    repo = new TaskRepository(db);
    service = new TaskService(repo);
  });

  afterEach(() => {
    db.close();
  });

  it("creates a task with subtasks, category, and tags successfully", () => {
    // Add dummy category and tag
    db.prepare("INSERT INTO categories (id, name, created_at) VALUES ('cat-1', 'Work', '2026-11-20')").run();
    db.prepare("INSERT INTO tags (id, name, created_at) VALUES ('tag-1', 'Urgent', '2026-11-20')").run();

    const task = service.createTask({
      title: "Complete quarterly review",
      description: "Gather metrics and team feedback",
      priority: "high",
      status: "todo",
      category_id: "cat-1",
      tag_ids: ["tag-1"],
      subtasks: ["Review metrics", "Write summary"],
      due_at: "2026-11-25T12:00:00Z",
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe("Complete quarterly review");
    expect(task.priority).toBe("high");
    expect(task.category?.name).toBe("Work");
    expect(task.tags).toHaveLength(1);
    expect(task.tags[0].name).toBe("Urgent");
    expect(task.subtasks).toHaveLength(2);
    expect(task.subtasks[0].title).toBe("Review metrics");
  });

  it("updates task status to done and records completed_at timestamp", () => {
    const task = service.createTask({ title: "Write unit tests" });
    expect(task.status).toBe("todo");
    expect(task.completed_at).toBeNull();

    const completed = service.toggleTask(task.id);
    expect(completed?.status).toBe("done");
    expect(completed?.completed_at).toBeDefined();

    // Toggle back
    const reopened = service.toggleTask(task.id);
    expect(reopened?.status).toBe("todo");
    expect(reopened?.completed_at).toBeNull();
  });

  it("handles My Day planning without altering original due date", () => {
    const originalDue = "2026-12-01T00:00:00Z";
    const task = service.createTask({
      title: "Plan Q1 goals",
      due_at: originalDue,
    });

    // Add to My Day for today
    const planDate = "2026-11-20";
    const isAdded = service.toggleDayPlan(task.id, planDate);
    expect(isAdded).toBe(true);

    // Verify task still retains original due date
    const fetched = service.getTask(task.id);
    expect(fetched?.due_at).toBe(originalDue);

    // Check list with My Day filter
    const myDayTasks = service.listTasks({ plan_date: planDate });
    expect(myDayTasks.some((t) => t.id === task.id)).toBe(true);

    // Toggle off My Day
    const isRemoved = service.toggleDayPlan(task.id, planDate);
    expect(isRemoved).toBe(false);

    const afterRemoval = service.listTasks({ plan_date: planDate });
    expect(afterRemoval.some((t) => t.id === task.id)).toBe(false);
  });

  it("generates next occurrence upon completing a recurring task", () => {
    const task = service.createTask({
      title: "Daily morning standup",
      due_at: "2026-11-20T09:00:00Z",
      recurrence_rule: "daily",
      subtasks: ["Prep agenda"],
    });

    service.toggleTask(task.id); // Complete the task

    const allTasks = service.listTasks();
    expect(allTasks).toHaveLength(2);

    const nextOccurrence = allTasks.find((t) => t.id !== task.id);
    expect(nextOccurrence).toBeDefined();
    expect(nextOccurrence?.title).toBe("Daily morning standup");
    expect(nextOccurrence?.status).toBe("todo");
    expect(nextOccurrence?.recurrence_rule).toBe("daily");
    expect(nextOccurrence?.subtasks).toHaveLength(1);
  });

  it("prevents self-dependency and circular dependencies", () => {
    const taskA = service.createTask({ title: "Task A" });
    const taskB = service.createTask({ title: "Task B" });
    const taskC = service.createTask({ title: "Task C" });

    // Self dependency
    const selfDep = service.addDependency(taskA.id, taskA.id);
    expect(selfDep.success).toBe(false);
    expect(selfDep.error).toContain("cannot depend on itself");

    // Valid chain: B depends on A, C depends on B
    expect(service.addDependency(taskB.id, taskA.id).success).toBe(true);
    expect(service.addDependency(taskC.id, taskB.id).success).toBe(true);

    // Circular dependency: A depends on C (would form A -> C -> B -> A)
    const cycleResult = service.addDependency(taskA.id, taskC.id);
    expect(cycleResult.success).toBe(false);
    expect(cycleResult.error).toContain("Circular dependency detected");
  });
});
