import { ipcMain } from "electron";
import { BackupService } from "../services/backupService";
import { ExportService } from "../services/exportService";
import { ArchiveRepository } from "../../database/repositories/archiveRepository";

export function registerBackupExportIpc(
  backupService: BackupService,
  exportService: ExportService,
  archiveRepo: ArchiveRepository
): void {
  // Backup IPC
  ipcMain.handle("backup:create", async (_event, type?: "manual" | "automatic") => {
    return backupService.createBackup(type || "manual");
  });

  ipcMain.handle("backup:list", async () => {
    return backupService.listBackups();
  });

  ipcMain.handle("backup:restore", async (_event, filepath: string) => {
    return backupService.restoreBackup(filepath);
  });

  ipcMain.handle("backup:check-integrity", async () => {
    return backupService.checkDatabaseIntegrity();
  });

  // Export CSV IPC
  ipcMain.handle("export:tasks-csv", async () => {
    return exportService.exportTasksCSV();
  });

  ipcMain.handle("export:projects-csv", async () => {
    return exportService.exportProjectsCSV();
  });

  ipcMain.handle("export:notes-csv", async () => {
    return exportService.exportNotesCSV();
  });

  // Archive IPC
  ipcMain.handle("archive:list", async () => {
    return archiveRepo.listArchived();
  });

  ipcMain.handle(
    "archive:restore",
    async (_event, type: "task" | "project" | "habit" | "note", id: string) => {
      return archiveRepo.restoreItem(type, id);
    }
  );

  ipcMain.handle(
    "archive:delete",
    async (_event, type: "task" | "project" | "habit" | "note", id: string) => {
      return archiveRepo.deletePermanently(type, id);
    }
  );
}
