import { ipcMain } from "electron";
import { AnalyticsRepository } from "../../database/repositories/analyticsRepository";

export function registerAnalyticsIpc(repo: AnalyticsRepository): void {
  ipcMain.handle(
    "analytics:get-summary",
    async (_event, startDate: string, endDate: string) => {
      return repo.getSummary(startDate, endDate);
    }
  );
}
