import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDatabase, closeDatabase } from "../database/connection";
import { runMigrations } from "../database/migrator";
import { TaskRepository } from "../database/repositories/taskRepository";
import { TaskService } from "./services/taskService";
import { registerTaskIpc } from "./ipc/taskIpc";
import { ProjectRepository } from "../database/repositories/projectRepository";
import { ProjectService } from "./services/projectService";
import { registerProjectIpc } from "./ipc/projectIpc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let mainWindow: BrowserWindow | null = null;

// Initialize Database & Services
const db = initDatabase();
runMigrations(db);

const taskRepo = new TaskRepository(db);
const taskService = new TaskService(taskRepo);
registerTaskIpc(taskService);

const projectRepo = new ProjectRepository(db);
const projectService = new ProjectService(projectRepo);
registerProjectIpc(projectService);

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
  createWindow();

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
