import { ipcMain } from "electron";
import { TaskService } from "../services/taskService";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
} from "../../shared/types/database";

export function registerTaskIpc(taskService: TaskService): void {
  ipcMain.handle("tasks:list", async (_event, filters?: TaskFilterParams) => {
    return taskService.listTasks(filters);
  });

  ipcMain.handle("tasks:get", async (_event, id: string) => {
    return taskService.getTask(id);
  });

  ipcMain.handle("tasks:create", async (_event, input: CreateTaskInput) => {
    return taskService.createTask(input);
  });

  ipcMain.handle(
    "tasks:update",
    async (_event, id: string, input: UpdateTaskInput) => {
      return taskService.updateTask(id, input);
    }
  );

  ipcMain.handle("tasks:toggle", async (_event, id: string) => {
    return taskService.toggleTask(id);
  });

  ipcMain.handle("tasks:delete", async (_event, id: string) => {
    return taskService.deleteTask(id);
  });

  ipcMain.handle(
    "tasks:toggle-day-plan",
    async (_event, taskId: string, planDate: string) => {
      return taskService.toggleDayPlan(taskId, planDate);
    }
  );

  ipcMain.handle(
    "tasks:add-dependency",
    async (_event, taskId: string, dependsOnTaskId: string) => {
      return taskService.addDependency(taskId, dependsOnTaskId);
    }
  );

  ipcMain.handle(
    "tasks:remove-dependency",
    async (_event, taskId: string, dependsOnTaskId: string) => {
      taskService.removeDependency(taskId, dependsOnTaskId);
      return { success: true };
    }
  );

  ipcMain.handle("tasks:reorder", async (_event, taskIds: string[]) => {
    taskService.reorderTasks(taskIds);
    return { success: true };
  });

  ipcMain.handle(
    "tasks:reorder-subtasks",
    async (_event, taskId: string, subtaskIds: string[]) => {
      taskService.reorderSubtasks(taskId, subtaskIds);
      return { success: true };
    }
  );
}
