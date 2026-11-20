import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../shared/types/ipc";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
} from "../shared/types/database";

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

  // Task methods
  listTasks: (filters?: TaskFilterParams) => ipcRenderer.invoke("tasks:list", filters),
  getTask: (id: string) => ipcRenderer.invoke("tasks:get", id),
  createTask: (input: CreateTaskInput) => ipcRenderer.invoke("tasks:create", input),
  updateTask: (id: string, input: UpdateTaskInput) =>
    ipcRenderer.invoke("tasks:update", id, input),
  toggleTask: (id: string) => ipcRenderer.invoke("tasks:toggle", id),
  deleteTask: (id: string) => ipcRenderer.invoke("tasks:delete", id),
  toggleDayPlan: (taskId: string, planDate: string) =>
    ipcRenderer.invoke("tasks:toggle-day-plan", taskId, planDate),
  addDependency: (taskId: string, dependsOnTaskId: string) =>
    ipcRenderer.invoke("tasks:add-dependency", taskId, dependsOnTaskId),
  removeDependency: (taskId: string, dependsOnTaskId: string) =>
    ipcRenderer.invoke("tasks:remove-dependency", taskId, dependsOnTaskId),
};

contextBridge.exposeInMainWorld("electronAPI", api);
