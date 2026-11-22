import { ipcMain, BrowserWindow } from "electron";
import { FocusRepository } from "../../database/repositories/focusRepository";

export function registerFocusIpc(repo: FocusRepository): void {
  ipcMain.handle("focus:get-current", async () => {
    return repo.getCurrentSession();
  });

  ipcMain.handle("focus:start", async (_event, taskId?: string, title?: string) => {
    const res = repo.startSession(taskId, title);
    broadcastFocusUpdate();
    return res;
  });

  ipcMain.handle("focus:pause", async () => {
    const res = repo.pauseSession();
    broadcastFocusUpdate();
    return res;
  });

  ipcMain.handle("focus:resume", async () => {
    const res = repo.resumeSession();
    broadcastFocusUpdate();
    return res;
  });

  ipcMain.handle("focus:reset", async () => {
    const res = repo.resetSession();
    broadcastFocusUpdate();
    return res;
  });

  ipcMain.handle("focus:end", async () => {
    const res = repo.endSession();
    broadcastFocusUpdate();
    return res;
  });

  ipcMain.handle("focus:get-today-seconds", async (_event, todayStr: string) => {
    return repo.getTodayFocusSeconds(todayStr);
  });
}

function broadcastFocusUpdate() {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send("focus:state-changed");
    }
  });
}
