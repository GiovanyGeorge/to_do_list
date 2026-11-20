import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Disable hardware acceleration fallback for maximum Windows desktop compatibility
app.disableHardwareAcceleration();

// Error logging helper
process.on("uncaughtException", (err) => {
  try {
    fs.appendFileSync("lifeflow-error.log", `[${new Date().toISOString()}] Uncaught: ${err.stack || err}\n`);
  } catch {}
});
process.on("unhandledRejection", (reason) => {
  try {
    fs.appendFileSync("lifeflow-error.log", `[${new Date().toISOString()}] Unhandled: ${reason}\n`);
  } catch {}
});
import { initDatabase, closeDatabase, getDatabasePath } from "../database/connection";
import { runMigrations } from "../database/migrator";
import { TaskRepository } from "../database/repositories/taskRepository";
import { TaskService } from "./services/taskService";
import { registerTaskIpc } from "./ipc/taskIpc";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { ProjectService } from "./services/projectService";
import { registerProjectIpc } from "./ipc/projectIpc";
import { ReminderRepository } from "../database/repositories/reminderRepository";
import { NotificationService } from "./services/notificationService";
import { registerNotificationIpc } from "./ipc/notificationIpc";
import { HabitRepository } from "../database/repositories/habitRepository";
import { registerHabitIpc } from "./ipc/habitIpc";
import { GoalRepository } from "../database/repositories/goalRepository";
import { registerGoalIpc } from "./ipc/goalIpc";
import { NoteRepository } from "../database/repositories/noteRepository";
import { registerNoteIpc } from "./ipc/noteIpc";
import { AnalyticsRepository } from "../database/repositories/analyticsRepository";
import { registerAnalyticsIpc } from "./ipc/analyticsIpc";
import { WidgetWindowManager } from "./windows/widgetWindowManager";
import { registerWidgetIpc } from "./ipc/widgetIpc";
import { BackupService } from "./services/backupService";
import { ExportService } from "./services/exportService";
import { ArchiveRepository } from "../database/repositories/archiveRepository";
import { registerBackupExportIpc } from "./ipc/backupExportIpc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let mainWindow: BrowserWindow | null = null;
let notificationServiceInstance: NotificationService | null = null;

function initServices() {
  const dbPath = getDatabasePath();
  const db = initDatabase();
  runMigrations(db);

  const taskRepo = new TaskRepository(db);
  const taskService = new TaskService(taskRepo);
  registerTaskIpc(taskService);

  const projectRepo = new ProjectRepository(db);
  const projectService = new ProjectService(projectRepo);
  registerProjectIpc(projectService);

  const reminderRepo = new ReminderRepository(db);
  notificationServiceInstance = new NotificationService(reminderRepo);
  registerNotificationIpc(notificationServiceInstance);

  const habitRepo = new HabitRepository(db);
  registerHabitIpc(habitRepo);

  const goalRepo = new GoalRepository(db);
  registerGoalIpc(goalRepo);

  const noteRepo = new NoteRepository(db);
  registerNoteIpc(noteRepo);

  const analyticsRepo = new AnalyticsRepository(db);
  registerAnalyticsIpc(analyticsRepo);

  const widgetManager = new WidgetWindowManager(
    path.join(__dirname, "preload.js"),
    process.env.VITE_DEV_SERVER_URL,
    RENDERER_DIST,
    reminderRepo
  );
  registerWidgetIpc(widgetManager);

  const backupsDir = path.join(path.dirname(dbPath), "backups");
  const backupService = new BackupService(db, dbPath, backupsDir);
  const exportService = new ExportService(db);
  const archiveRepo = new ArchiveRepository(db);
  registerBackupExportIpc(backupService, exportService, archiveRepo);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#111318",
    frame: false,
    titleBarStyle: "hidden",
    title: "LifeFlow",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  notificationServiceInstance?.setNotificationListener((notif) => {
    mainWindow?.webContents.send("notifications:new", notif);
  });

  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window-state-change", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window-state-change", false);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// IPC Handlers for window controls
ipcMain.handle("app:info", () => {
  return {
    name: "LifeFlow",
    version: app.getVersion(),
    platform: process.platform,
    isPackaged: app.isPackaged,
  };
});

ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle("window:close", () => {
  mainWindow?.close();
});

ipcMain.handle("window:is-maximized", () => {
  return mainWindow?.isMaximized() ?? false;
});

app.whenReady().then(() => {
  try {
    initServices();
    createWindow();
    notificationServiceInstance?.initializeScheduler();
  } catch (err: unknown) {
    fs.appendFileSync("lifeflow-error.log", `[${new Date().toISOString()}] whenReady error: ${(err as Error).stack || err}\n`);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  closeDatabase();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
