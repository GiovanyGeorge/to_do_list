import type DatabaseType from "better-sqlite3";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as typeof DatabaseType;

let dbInstance: DatabaseType.Database | null = null;

export function getDatabasePath(): string {
  // If running in Node/Electron or test environment
  const baseDir = process.env.LIFEFLOW_DATA_DIR || path.join(process.cwd(), ".lifeflow-data");
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return path.join(baseDir, "lifeflow.db");
}

export function initDatabase(customPath?: string): DatabaseType.Database {
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
