import { describe, it } from "vitest";
import Database from "../database/sqlite";
import { runMigrations } from "../database/migrator";
import { TaskRepository } from "../database/repositories/taskRepository";
import { FocusRepository } from "../database/repositories/focusRepository";
import { performance } from "node:perf_hooks";
import fs from "node:fs";
import path from "node:path";

describe("Performance Benchmarking Suite", () => {
  it("measures cold database migration and warm start duration", () => {
    const testDbPath = path.join(__dirname, `perf_test_${Date.now()}.db`);
    
    // 1. Cold DB initialization + runMigrations
    const coldStart = performance.now();
    const db = new Database(testDbPath);
    db.pragma("foreign_keys = ON;");
    db.pragma("journal_mode = WAL;");
    const dbOpened = performance.now();
    runMigrations(db);
    const coldEnd = performance.now();

    console.log(`[PERF BENCHMARK] Cold DB Open: ${(dbOpened - coldStart).toFixed(2)} ms`);
    console.log(`[PERF BENCHMARK] Cold Migrations Total: ${(coldEnd - dbOpened).toFixed(2)} ms`);

    // 2. Warm start on existing database (subsequent launches)
    const warmStart = performance.now();
    runMigrations(db);
    const warmEnd = performance.now();
    console.log(`[PERF BENCHMARK] Warm Migrations (Subsequent boot): ${(warmEnd - warmStart).toFixed(2)} ms`);

    // 3. Task listing duration with 100 tasks
    const taskRepo = new TaskRepository(db);
    for (let i = 0; i < 50; i++) {
      taskRepo.create({
        title: `Benchmark Task ${i}`,
        priority: i % 2 === 0 ? "high" : "medium",
        subtasks: ["Subtask A", "Subtask B"],
      });
    }

    const tListStart = performance.now();
    const tasks = taskRepo.list();
    const tListEnd = performance.now();
    console.log(`[PERF BENCHMARK] List ${tasks.length} tasks with subtasks: ${(tListEnd - tListStart).toFixed(2)} ms`);

    db.close();
    try {
      fs.unlinkSync(testDbPath);
    } catch {}
  });
});
