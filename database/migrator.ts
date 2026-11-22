import Database from "./sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations(db: Database): void {
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

  // Fast-path: Check if post-migration hooks have already been executed
  const columnsEnsured = checkStmt.get("_schema_columns_ensured");
  if (!columnsEnsured) {
    ensureSchemaColumns(db);
    insertStmt.run("_schema_columns_ensured", new Date().toISOString());
  }

  const bibleLoaded = checkStmt.get("_bible_data_loaded");
  if (!bibleLoaded) {
    ensureBibleDataLoaded(db);
    insertStmt.run("_bible_data_loaded", new Date().toISOString());
  }
}

function ensureSchemaColumns(db: Database): void {
  try {
    // 1. Reminders repeat_reminder_daily
    const reminderCols = db.prepare("PRAGMA table_info(reminders)").all() as { name: string }[];
    if (reminderCols.length > 0 && !reminderCols.some((c) => c.name === "repeat_reminder_daily")) {
      db.exec("ALTER TABLE reminders ADD COLUMN repeat_reminder_daily INTEGER DEFAULT 0;");
    }

    // 2. Goal milestones task_id, project_id, target_date
    const milestoneCols = db.prepare("PRAGMA table_info(goal_milestones)").all() as { name: string }[];
    if (milestoneCols.length > 0) {
      if (!milestoneCols.some((c) => c.name === "task_id")) {
        db.exec("ALTER TABLE goal_milestones ADD COLUMN task_id TEXT;");
      }
      if (!milestoneCols.some((c) => c.name === "project_id")) {
        db.exec("ALTER TABLE goal_milestones ADD COLUMN project_id TEXT;");
      }
      if (!milestoneCols.some((c) => c.name === "target_date")) {
        db.exec("ALTER TABLE goal_milestones ADD COLUMN target_date TEXT;");
      }
    }
  } catch (err) {
    console.error("ensureSchemaColumns error:", err);
  }
}

export function ensureBibleDataLoaded(db: Database): void {
  try {
    const tableCheck = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'")
      .get() as { name: string } | undefined;
    if (!tableCheck) return;

    // 1. Ensure heading column exists
    const colInfo = db.prepare("PRAGMA table_info(bible_verses)").all() as { name: string }[];
    const hasHeading = colInfo.some((c) => c.name === "heading");
    if (!hasHeading) {
      db.exec("ALTER TABLE bible_verses ADD COLUMN heading TEXT;");
    }

    // 2. Load verses from svd.sqlite if empty
    const countRow = db
      .prepare("SELECT count(*) as count FROM bible_verses")
      .get() as { count: number } | undefined;
    if (!countRow || countRow.count === 0) {
      const candidatePaths = [
        path.join(__dirname, "svd.sqlite"),
        path.join(__dirname, "../database/svd.sqlite"),
        path.join(process.cwd(), "database/svd.sqlite"),
        path.join(process.resourcesPath || "", "database/svd.sqlite"),
      ];
      const svdPath = candidatePaths.find((p) => fs.existsSync(p));
      if (svdPath) {
        const normalizedPath = path.resolve(svdPath).replace(/\\/g, "/");
        db.exec(`ATTACH DATABASE '${normalizedPath}' AS svd;`);
        db.exec(`
          INSERT OR IGNORE INTO bible_verses (id, book_id, chapter, verse, text, translation)
          SELECT id, book_id, chapter, number, text, 'svd' FROM svd.verses;
        `);
        db.exec(`DETACH DATABASE svd;`);
      }
    }

    // 3. Separate Psalm headings and verse text if not yet done
    const ps100Check = db
      .prepare("SELECT heading FROM bible_verses WHERE book_id = 19 AND chapter = 100 AND verse = 1")
      .get() as { heading?: string } | undefined;

    if (!ps100Check || !ps100Check.heading) {
      const splitCandidatePaths = [
        path.join(__dirname, "psalmsSplit.json"),
        path.join(__dirname, "../database/psalmsSplit.json"),
        path.join(process.cwd(), "database/psalmsSplit.json"),
        path.join(process.resourcesPath || "", "database/psalmsSplit.json"),
      ];
      const splitPath = splitCandidatePaths.find((p) => fs.existsSync(p));
      if (splitPath) {
        const rawData = fs.readFileSync(splitPath, "utf-8");
        const psalmsMap = JSON.parse(rawData) as Record<string, { heading: string; text: string }>;
        const updateStmt = db.prepare(
          "UPDATE bible_verses SET heading = ?, text = ? WHERE book_id = 19 AND chapter = ? AND verse = 1"
        );
        const updateTx = db.transaction(() => {
          for (const [ch, item] of Object.entries(psalmsMap)) {
            updateStmt.run(item.heading, item.text, Number(ch));
          }
        });
        updateTx();
      }
    }
  } catch (err) {
    console.error("Failed to load Bible verses from svd.sqlite:", err);
  }
}
