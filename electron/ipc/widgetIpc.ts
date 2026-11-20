import { ipcMain } from "electron";
import { WidgetWindowManager, type WidgetType } from "../windows/widgetWindowManager";

export function registerWidgetIpc(manager: WidgetWindowManager): void {
  ipcMain.handle("widgets:open", async (_event, type: WidgetType) => {
    manager.openWidget(type);
    return true;
  });

  ipcMain.handle("widgets:close", async (_event, type: WidgetType) => {
    manager.closeWidget(type);
    return true;
  });

  ipcMain.handle("widgets:get-status", async () => {
    return manager.getActiveWidgets();
  });

  ipcMain.handle(
    "widgets:set-always-on-top",
    async (_event, type: WidgetType, flag: boolean) => {
      manager.setAlwaysOnTop(type, flag);
      return true;
    }
  );
}
