import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { ProjectService } from "../electron/services/projectService";
import { TaskRepository } from "../database/repositories/taskRepository";
import { TaskService } from "../electron/services/taskService";

describe("Phase 4 - Projects and Calendar Engine", () => {
  let db: Database.Database;
  let projectRepo: ProjectRepository;
  let projectService: ProjectService;
  let taskRepo: TaskRepository;
  let taskService: TaskService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");

    const schemaSql = fs.readFileSync(
      path.join(__dirname, "../database/migrations/001_initial_schema.sql"),
      "utf-8"
    );
    db.exec(schemaSql);

    projectRepo = new ProjectRepository(db);
    projectService = new ProjectService(projectRepo);
    taskRepo = new TaskRepository(db);
    taskService = new TaskService(taskRepo);
  });

  afterEach(() => {
    db.close();
  });

  it("creates, retrieves, and lists projects with color and status", () => {
    const project = projectService.createProject({
      name: "Desktop App Launch",
      description: "Launch Windows desktop app version 1.0",
      color: "#E99A43",
      due_at: "2026-12-15T00:00:00Z",
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe("Desktop App Launch");
    expect(project.color).toBe("#E99A43");
    expect(project.task_count).toBe(0);
    expect(project.progress_percent).toBe(0);

    const list = projectService.listProjects();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(project.id);
  });

  it("calculates project progress percentage dynamically as tasks are completed", () => {
    const project = projectService.createProject({
      name: "Website Redesign",
      color: "#3B82F6",
    });

    // Create 4 tasks under this project
    const t1 = taskService.createTask({ title: "Design mockup", project_id: project.id });
    const t2 = taskService.createTask({ title: "Build hero section", project_id: project.id });
    const t3 = taskService.createTask({ title: "Setup router", project_id: project.id });
    const t4 = taskService.createTask({ title: "Write copy", project_id: project.id });

    // Check initial progress
    let fetched = projectService.getProject(project.id);
    expect(fetched?.task_count).toBe(4);
    expect(fetched?.completed_task_count).toBe(0);
    expect(fetched?.progress_percent).toBe(0);

    // Complete 2 tasks (50% progress)
    taskService.toggleTask(t1.id);
    taskService.toggleTask(t2.id);

    fetched = projectService.getProject(project.id);
    expect(fetched?.completed_task_count).toBe(2);
    expect(fetched?.progress_percent).toBe(50);

    // Complete remaining 2 tasks (100% progress)
    taskService.toggleTask(t3.id);
    taskService.toggleTask(t4.id);

    fetched = projectService.getProject(project.id);
    expect(fetched?.completed_task_count).toBe(4);
    expect(fetched?.progress_percent).toBe(100);
  });

  it("archives and restores projects without losing linked tasks", () => {
    const project = projectService.createProject({ name: "Internal Tools" });
    const task = taskService.createTask({ title: "Deploy internal tool", project_id: project.id });

    // Archive project
    projectService.archiveProject(project.id);

    const activeList = projectService.listProjects(false);
    expect(activeList).toHaveLength(0);

    const allList = projectService.listProjects(true);
    expect(allList).toHaveLength(1);
    expect(allList[0].status).toBe("archived");

    // Task still belongs to the project
    const fetchedTask = taskService.getTask(task.id);
    expect(fetchedTask?.project_id).toBe(project.id);

    // Restore project
    projectService.restoreProject(project.id);
    expect(projectService.listProjects(false)).toHaveLength(1);
  });
});
