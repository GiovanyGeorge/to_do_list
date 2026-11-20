import { ipcMain } from "electron";
import { GoalRepository } from "../../database/repositories/goalRepository";

export function registerGoalIpc(repo: GoalRepository): void {
  ipcMain.handle("goals:list", async (_event, includeArchived?: boolean) => {
    return repo.list(includeArchived);
  });

  ipcMain.handle(
    "goals:create",
    async (
      _event,
      input: {
        title: string;
        description?: string;
        categoryId?: string;
        projectId?: string;
        startAt?: string;
        targetDate?: string;
        milestones?: string[];
      }
    ) => {
      return repo.create(input);
    }
  );

  ipcMain.handle("goals:get", async (_event, id: string) => {
    return repo.getById(id);
  });

  ipcMain.handle("goals:toggle-milestone", async (_event, milestoneId: string) => {
    return repo.toggleMilestone(milestoneId);
  });

  ipcMain.handle(
    "goals:add-milestone",
    async (_event, goalId: string, title: string) => {
      return repo.addMilestone(goalId, title);
    }
  );

  ipcMain.handle("goals:delete", async (_event, id: string) => {
    return repo.delete(id);
  });
}
