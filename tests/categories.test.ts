import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "../database/sqlite";
import { runMigrations } from "../database/migrator";
import { CategoryRepository } from "../database/repositories/categoryRepository";
import { TaskRepository } from "../database/repositories/taskRepository";

describe("Category Repository & Management Engine", () => {
  let db: Database;
  let categoryRepo: CategoryRepository;
  let taskRepo: TaskRepository;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");
    runMigrations(db);

    categoryRepo = new CategoryRepository(db);
    taskRepo = new TaskRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it("lists seeded starter categories with task counts", () => {
    const list = categoryRepo.list();
    expect(list.length).toBeGreaterThanOrEqual(12);
    const study = list.find((c) => c.name === "Study");
    expect(study).toBeDefined();
    expect(study?.color).toBe("#C2410C");
    expect(study?.icon).toBe("GraduationCap");
    expect(study?.task_count).toBe(0);
  });

  it("creates a new custom category and retrieves it", () => {
    const custom = categoryRepo.create({
      name: "Side Projects",
      color: "#0D9488",
      icon: "Sparkles",
      description: "My personal indie hacking ventures",
    });

    expect(custom.id).toBeDefined();
    expect(custom.name).toBe("Side Projects");

    const fetched = categoryRepo.getById(custom.id);
    expect(fetched?.name).toBe("Side Projects");
    expect(fetched?.color).toBe("#0D9488");
    expect(fetched?.description).toBe("My personal indie hacking ventures");
  });

  it("updates an existing category", () => {
    const created = categoryRepo.create({
      name: "Old Name",
      color: "#475569",
    });

    const updated = categoryRepo.update(created.id, {
      name: "New Name",
      color: "#EA580C",
      description: "Updated description",
    });

    expect(updated?.name).toBe("New Name");
    expect(updated?.color).toBe("#EA580C");
  });

  it("archives and unarchives a category", () => {
    const created = categoryRepo.create({ name: "To Archive" });

    categoryRepo.archive(created.id);
    let list = categoryRepo.list(false);
    expect(list.some((c) => c.id === created.id)).toBe(false);

    let archivedList = categoryRepo.list(true);
    expect(archivedList.some((c) => c.id === created.id)).toBe(true);

    categoryRepo.unarchive(created.id);
    list = categoryRepo.list(false);
    expect(list.some((c) => c.id === created.id)).toBe(true);
  });

  it("deletes a category and safely reassigns linked tasks", () => {
    const catA = categoryRepo.create({ name: "Category A" });
    const catB = categoryRepo.create({ name: "Category B" });

    // Create a task assigned to Cat A
    const task = taskRepo.create({
      title: "Task in Cat A",
      category_id: catA.id,
      priority: "medium",
    });

    expect(task.category_id).toBe(catA.id);

    // Delete Cat A and reassign to Cat B
    categoryRepo.delete(catA.id, catB.id);

    const reloadedTask = taskRepo.getById(task.id);
    expect(reloadedTask?.category_id).toBe(catB.id);
    expect(categoryRepo.getById(catA.id)).toBeNull();
  });
});
