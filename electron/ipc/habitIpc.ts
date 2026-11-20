import { ipcMain } from "electron";
import { HabitRepository } from "../../database/repositories/habitRepository";
import type { HabitFrequency } from "../../shared/types/database";

export function registerHabitIpc(repo: HabitRepository): void {
  ipcMain.handle("habits:list", async (_event, includeArchived?: boolean) => {
    return repo.list(includeArchived);
  });

  ipcMain.handle(
    "habits:create",
    async (
      _event,
      input: {
        name: string;
        description?: string;
        frequency?: HabitFrequency;
        target_value?: number;
        unit?: string;
        color?: string;
      }
    ) => {
      return repo.create(input);
    }
  );

  ipcMain.handle("habits:get", async (_event, id: string) => {
    return repo.getById(id);
  });

  ipcMain.handle("habits:toggle-log", async (_event, habitId: string, logDate: string) => {
    return repo.toggleLog(habitId, logDate);
  });

  ipcMain.handle("habits:delete", async (_event, id: string) => {
    return repo.delete(id);
  });
}
