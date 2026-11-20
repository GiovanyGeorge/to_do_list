import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { BackupService } from "../electron/services/backupService";
import { ExportService } from "../electron/services/exportService";
import { ArchiveRepository } from "../database/repositories/archiveRepository";
import { TaskRepository } from "../database/repositories/taskRepository";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { HabitRepository } from "../database/repositories/habitRepository";
import { NoteRepository } from "../database/repositories/noteRepository";

describe("Phase 9 - Backup, Restore, Export & Archive Engine", () => {
  let db: Database.Database;
  let tempDir: string;
  let dbPath: string;
  let backupsDir: string;
  let backupService: BackupService;
  let exportService: ExportService;
  let archiveRepo: ArchiveRepository;
  let taskRepo: TaskRepository;
  let projectRepo: ProjectRepository;
  let habitRepo: HabitRepository;
  let noteRepo: NoteRepository;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lifeflow-test-p9-"));
    dbPath = path.join(tempDir, "test_lifeflow.db");
    backupsDir = path.join(tempDir, "backups");

    db = new Database(dbPath);
    db.pragma("foreign_keys = ON;");

    const m1 = fs.readFileSync(path.join(__dirname, "../database/migrations/001_initial_schema.sql"), "utf-8");
    const m2 = fs.readFileSync(path.join(__dirname, "../database/migrations/002_notifications.sql"), "utf-8");
    const m3 = fs.readFileSync(path.join(__dirname, "../database/migrations/003_habits_goals_notes.sql"), "utf-8");

    db.exec(m1);
    db.exec(m2);
    db.exec(m3);

    backupService = new BackupService(db, dbPath, backupsDir);
    exportService = new ExportService(db);
    archiveRepo = new ArchiveRepository(db);
    taskRepo = new TaskRepository(db);
    projectRepo = new ProjectRepository(db);
    habitRepo = new HabitRepository(db);
    noteRepo = new NoteRepository(db);
  });

  afterEach(() => {
    try {
      db.close();
    } catch {
      // ignore if already closed
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("checks database integrity successfully", () => {
    const health = backupService.checkDatabaseIntegrity();
    expect(health.status).toBe("ok");
    expect(health.details).toContain("healthy");
  });

  it("creates a safe atomic backup and lists it with metadata", async () => {
    // Populate some sample data
    taskRepo.create({ title: "Backup Test Task", priority: "urgent" });

    const backupMeta = await backupService.createBackup("manual");
    expect(backupMeta.filename).toContain("lifeflow_backup_manual_");
    expect(backupMeta.type).toBe("manual");
    expect(fs.existsSync(backupMeta.filepath)).toBe(true);
    expect(backupMeta.sizeBytes).toBeGreaterThan(0);

    const list = backupService.listBackups();
    expect(list.length).toBe(1);
    expect(list[0].filename).toBe(backupMeta.filename);
  });

  it("creates a pre_restore recovery point before restoring a backup", async () => {
    taskRepo.create({ title: "Task Before Backup", priority: "medium" });
    const backup1 = await backupService.createBackup("manual");

    // Add another task after backup
    taskRepo.create({ title: "Task After Backup", priority: "high" });
    expect(taskRepo.list().length).toBe(2);

    // Now restore backup1
    const res = await backupService.restoreBackup(backup1.filepath);
    expect(res.success).toBe(true);

    // List backups should now have a "pre_restore" backup!
    const list = backupService.listBackups();
    const preRestoreBackup = list.find((b) => b.type === "pre_restore");
    expect(preRestoreBackup).toBeDefined();

    // Verify task count after restore is back to 1
    const restoredTasks = taskRepo.list();
    expect(restoredTasks.length).toBe(1);
    expect(restoredTasks[0].title).toBe("Task Before Backup");
  });

  it("exports tasks, projects, and notes to valid CSV format with proper escaping", () => {
    // Create task with commas and quotes in description
    taskRepo.create({
      title: "Task with, comma and \"quotes\"",
      description: "Line 1\nLine 2, with comma",
      priority: "high",
    });

    const project = projectRepo.create({
      name: "Launch \"Alpha\", 2026",
      description: "Project description, test",
      color: "#6366f1",
    });

    noteRepo.create({
      title: "Note Title, 1",
      content: "Note content with \"quotes\", and commas",
    });

    const tasksCSV = exportService.exportTasksCSV();
    expect(tasksCSV).toContain("ID,Title,Description,Status,Priority,Project,Category,Due Date,Completed At,Created At");
    expect(tasksCSV).toContain("\"Task with, comma and \"\"quotes\"\"\"");

    const projectsCSV = exportService.exportProjectsCSV();
    expect(projectsCSV).toContain("ID,Project Name,Description,Color,Status,Total Tasks,Completed Tasks,Deadline,Created At");
    expect(projectsCSV).toContain("\"Launch \"\"Alpha\"\", 2026\"");

    const notesCSV = exportService.exportNotesCSV();
    expect(notesCSV).toContain("ID,Title,Content,Pinned,Created At,Updated At");
    expect(notesCSV).toContain("\"Note Title, 1\"");
  });

  it("manages multi-entity archive querying, restore, and permanent delete", () => {
    const task = taskRepo.create({ title: "Task to archive" });
    const proj = projectRepo.create({ name: "Project to archive" });
    const habit = habitRepo.create({ name: "Habit to archive", frequencyType: "daily", targetDays: [] });
    const note = noteRepo.create({ title: "Note to archive" });

    // Initially no archived items
    expect(archiveRepo.listArchived().length).toBe(0);

    // Archive all 4
    const nowIso = new Date().toISOString();
    db.prepare("UPDATE tasks SET archived_at = ? WHERE id = ?").run(nowIso, task.id);
    db.prepare("UPDATE projects SET archived_at = ? WHERE id = ?").run(nowIso, proj.id);
    db.prepare("UPDATE habits SET archived_at = ? WHERE id = ?").run(nowIso, habit.id);
    db.prepare("UPDATE notes SET archived_at = ? WHERE id = ?").run(nowIso, note.id);

    const archivedList = archiveRepo.listArchived();
    expect(archivedList.length).toBe(4);

    const types = archivedList.map((i) => i.type).sort();
    expect(types).toEqual(["habit", "note", "project", "task"]);

    // Restore the task
    const restoreSuccess = archiveRepo.restoreItem("task", task.id);
    expect(restoreSuccess).toBe(true);
    expect(archiveRepo.listArchived().length).toBe(3);

    // Permanently delete the note
    const deleteSuccess = archiveRepo.deletePermanently("note", note.id);
    expect(deleteSuccess).toBe(true);
    expect(archiveRepo.listArchived().length).toBe(2);

    // Confirm note is completely removed from DB
    expect(noteRepo.getById(note.id)).toBeNull();
  });
});