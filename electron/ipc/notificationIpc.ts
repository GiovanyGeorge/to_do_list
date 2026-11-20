import { ipcMain } from "electron";
import { NotificationService } from "../services/notificationService";
import type { ReminderType } from "../../shared/types/database";

export function registerNotificationIpc(service: NotificationService): void {
  ipcMain.handle("notifications:list", async (_event, limit?: number) => {
    return service.listNotifications(limit);
  });

  ipcMain.handle("notifications:clear-all", async () => {
    service.clearNotifications();
    return true;
  });

  ipcMain.handle(
    "reminders:create",
    async (
      _event,
      input: {
        taskId?: string;
        remindAt: string;
        title: string;
        message?: string;
        type?: ReminderType;
      }
    ) => {
      return service.scheduleReminder(input);
    }
  );

  ipcMain.handle("settings:get", async (_event, key: string, defaultValue?: string) => {
    return service.getSetting(key, defaultValue);
  });

  ipcMain.handle("settings:set", async (_event, key: string, value: string) => {
    service.setSetting(key, value);
    return true;
  });
}
