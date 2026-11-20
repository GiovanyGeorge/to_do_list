import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface BackupMetadata {
  filename: string;
  filepath: string;
  sizeBytes: number;
  type: "manual" | "automatic" | "pre_restore";
  createdAt: string;
}

export class BackupService {
  constructor(
    private db: Database.Database,
    private dbPath: string,
    private backupsDir: string
  ) {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  async createBackup(type: "manual" | "automatic" | "pre_restore" = "manual"): Promise<BackupMetadata> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `lifeflow_backup_${type}_${timestamp}.db`;
    const targetDir = path.join(this.backupsDir, type);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filepath = path.join(targetDir, filename);

    // Use SQLite's safe atomic backup API
    await this.db.backup(filepath);

    // Verify backup integrity
    const tempDb = new Database(filepath, { readonly: true });
    const check = tempDb.pragma("integrity_check") as { integrity_check: string }[];
    tempDb.close();

    const isOk = check.length > 0 && check[0].integrity_check === "ok";
    if (!isOk) {
      fs.unlinkSync(filepath);
      throw new Error("Backup integrity check failed!");
    }

    // Enforce retention limit for automatic backups (keep last 5)
    if (type === "automatic") {
      this.cleanupOldBackups(targetDir, 5);
    }

    const stat = fs.statSync(filepath);
    return {
      filename,
      filepath,
      sizeBytes: stat.size,
      type,
      createdAt: new Date().toISOString(),
    };
  }

  listBackups(): BackupMetadata[] {
    const results: BackupMetadata[] = [];
    const types: ("manual" | "automatic" | "pre_restore")[] = [
      "manual",
      "automatic",
      "pre_restore",
    ];

    for (const t of types) {
      const dir = path.join(this.backupsDir, t);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".db"));
        for (const file of files) {
          const fp = path.join(dir, file);
          const stat = fs.statSync(fp);
          results.push({
            filename: file,
            filepath: fp,
            sizeBytes: stat.size,
            type: t,
            createdAt: stat.birthtime.toISOString(),
          });
        }
      }
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async restoreBackup(filepath: string): Promise<{ success: boolean; message: string }> {
    if (!fs.existsSync(filepath)) {
      return { success: false, message: "Backup file does not exist." };
    }

    // 1. Validate target backup file integrity before touching active database
    const tempDb = new Database(filepath, { readonly: true });
    const check = tempDb.pragma("integrity_check") as { integrity_check: string }[];
    tempDb.close();

    if (check.length === 0 || check[0].integrity_check !== "ok") {
      return { success: false, message: "Corrupted backup file: integrity check failed." };
    }

    // 2. Create safety recovery point of current active database
    await this.createBackup("pre_restore");

    // 3. Restore backup data into active database using sqlite backup
    const sourceDb = new Database(filepath, { readonly: true });
    await sourceDb.backup(this.dbPath);
    sourceDb.close();

    return {
      success: true,
      message: "Database restored successfully. A pre-restore recovery point was preserved.",
    };
  }

  checkDatabaseIntegrity(): { status: "ok" | "error"; details: string } {
    try {
      const check = this.db.pragma("integrity_check") as { integrity_check: string }[];
      const isOk = check.length > 0 && check[0].integrity_check === "ok";
      return {
        status: isOk ? "ok" : "error",
        details: isOk ? "Database is healthy and passes all integrity checks." : JSON.stringify(check),
      };
    } catch (err: unknown) {
      return {
        status: "error",
        details: (err as Error).message,
      };
    }
  }

  private cleanupOldBackups(dir: string, maxRetention: number): void {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".db"))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxRetention) {
      const toDelete = files.slice(maxRetention);
      for (const item of toDelete) {
        fs.unlinkSync(path.join(dir, item.name));
      }
    }
  }
}
