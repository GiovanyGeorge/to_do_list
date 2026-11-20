import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../shared/types/ipc";

const api: ElectronAPI = {
  getAppInfo: () => ipcRenderer.invoke("app:info"),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => {
      callback(isMaximized);
    };
    ipcRenderer.on("window-state-change", handler);
    return () => {
      ipcRenderer.removeListener("window-state-change", handler);
    };
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
