import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations(db: Database.Database): void {
  // Ensure _migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const candidatePaths = [
    path.join(__dirname, "migrations"),
    path.join(__dirname, "../database/migrations"),
    path.join(process.cwd(), "database/migrations"),
    path.join(process.resourcesPath || "", "database/migrations"),
  ];
  const migrationsDir = candidatePaths.find((p) => fs.existsSync(p));
  if (!migrationsDir) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const checkStmt = db.prepare("SELECT id FROM _migrations WHERE id = ?");
  const insertStmt = db.prepare(
    "INSERT INTO _migrations (id, applied_at) VALUES (?, ?)"
  );

  const applyMigration = db.transaction((id: string, sql: string) => {
    db.exec(sql);
    insertStmt.run(id, new Date().toISOString());
  });

  for (const file of files) {
    const row = checkStmt.get(file);
    if (!row) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      applyMigration(file, sql);
    }
  }
}
