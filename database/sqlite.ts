/**
 * database/sqlite.ts
 *
 * Compatibility layer that wraps Node.js built-in `node:sqlite` (DatabaseSync)
 * to provide a better-sqlite3-compatible API surface.
 *
 * This allows all existing repositories and services to continue working with
 * minimal changes after migrating away from better-sqlite3.
 */

import { DatabaseSync } from "node:sqlite";

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * Wraps a node:sqlite StatementSync to provide better-sqlite3-compatible API.
 */
class WrappedStatement<R = any> {
  private stmt: any;

  constructor(stmt: any) {
    this.stmt = stmt;
  }

  run(...params: unknown[]): RunResult {
    const result = this.stmt.run(...params);
    return {
      changes: Number(result.changes),
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  get(...params: unknown[]): R | undefined {
    return this.stmt.get(...params) as any;
  }

  all(...params: unknown[]): R[] {
    return this.stmt.all(...params) as any;
  }
}

export interface DatabaseOptions {
  readonly?: boolean;
  readOnly?: boolean;
}

/**
 * Wraps node:sqlite DatabaseSync to provide better-sqlite3-compatible API.
 */
export class Database {
  private db: any;

  constructor(filename: string, options?: DatabaseOptions) {
    const isReadOnly = options?.readonly ?? options?.readOnly ?? false;
    this.db = new DatabaseSync(filename, {
      readOnly: isReadOnly,
    } as any);
  }

  /**
   * Execute raw SQL (no return value). Can handle multiple statements.
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Prepare a statement. Returns a wrapped statement with .run(), .get(), .all().
   * Accepts an optional generic type parameter for result row type.
   */
  prepare<R = any>(sql: string): WrappedStatement<R> {
    return new WrappedStatement<R>(this.db.prepare(sql));
  }

  /**
   * Execute a PRAGMA and return the result.
   * better-sqlite3 has db.pragma("key = value") which both sets and returns.
   * We simulate this by running "PRAGMA key = value" via prepare().
   */
  pragma(pragmaStr: string): unknown {
    const sql = `PRAGMA ${pragmaStr}`;
    try {
      // If it's a setter pragma (contains =), just exec it
      if (pragmaStr.includes("=")) {
        // Some pragmas like journal_mode return a value even when setting
        try {
          const result = this.db.prepare(sql).all();
          return result;
        } catch {
          this.db.exec(sql);
          return [];
        }
      }
      // Reader pragma — return all rows
      return this.db.prepare(sql).all();
    } catch {
      this.db.exec(sql);
      return [];
    }
  }

  /**
   * Create a transaction wrapper (better-sqlite3 style).
   * db.transaction(fn) returns a function that, when called, runs fn inside BEGIN/COMMIT.
   */
  transaction<T extends (...args: any[]) => any>(fn: T): T {
    const self = this;
    const wrapper = ((...args: any[]) => {
      self.db.exec("BEGIN");
      try {
        const result = fn(...args);
        self.db.exec("COMMIT");
        return result;
      } catch (err) {
        self.db.exec("ROLLBACK");
        throw err;
      }
    }) as unknown as T;
    return wrapper;
  }

  /**
   * Backup the database to a file.
   * node:sqlite doesn't have a built-in backup API on the instance,
   * so we use VACUUM INTO for a consistent snapshot.
   */
  async backup(filepath: string): Promise<void> {
    // VACUUM INTO creates a consistent, clean copy of the database
    this.db.exec(`VACUUM INTO '${filepath.replace(/'/g, "''")}'`);
  }

  /**
   * Close the database connection.
   */
  close(): void {
    this.db.close();
  }
}

// Re-export Database as both default and named, mirroring better-sqlite3's export
export default Database;
