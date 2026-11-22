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

  // Enable foreign keys, WAL mode, and high-performance in-memory cache/mmap
  db.pragma("foreign_keys = ON;");
  db.pragma("journal_mode = WAL;");
  db.pragma("synchronous = NORMAL;");
  db.pragma("temp_store = MEMORY;");
  db.pragma("cache_size = -64000;"); // 64 MB page cache
  db.pragma("mmap_size = 268435456;"); // 256 MB memory-mapped I/O

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
