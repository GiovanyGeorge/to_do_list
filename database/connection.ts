import Database from "./sqlite";
import path from "node:path";
import fs from "node:fs";

let dbInstance: Database | null = null;

export function getDatabasePath(): string {
  let baseDir = process.env.LIFEFLOW_DATA_DIR;
  if (!baseDir) {
    try {
      const electron = require("electron");
      const electronApp = electron.app || electron.default?.app;
      if (electronApp && typeof electronApp.getPath === "function") {
        baseDir = path.join(electronApp.getPath("userData"), "data");
      }
    } catch {
      // Not in Electron main process (e.g. test environment)
    }
  }
  if (!baseDir) {
    baseDir = path.join(process.cwd(), ".lifeflow-data");
  }
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return path.join(baseDir, "lifeflow.db");
}

export function initDatabase(customPath?: string): Database {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || getDatabasePath();
  const db = new Database(dbPath);

  // Enable foreign keys and WAL mode per Project Plan Section 6
  db.pragma("foreign_keys = ON;");
  db.pragma("journal_mode = WAL;");

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
