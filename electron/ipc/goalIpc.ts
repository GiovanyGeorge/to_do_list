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
    async (
      _event,
      goalId: string,
      input: string | { title: string; targetDate?: string; taskId?: string; projectId?: string }
    ) => {
      return repo.addMilestone(goalId, input);
    }
  );

  ipcMain.handle(
    "goals:update-milestone",
    async (
      _event,
      milestoneId: string,
      input: { title?: string; targetDate?: string | null; taskId?: string | null; projectId?: string | null }
    ) => {
      return repo.updateMilestone(milestoneId, input);
    }
  );

  ipcMain.handle("goals:delete-milestone", async (_event, milestoneId: string) => {
    return repo.deleteMilestone(milestoneId);
  });

  ipcMain.handle(
    "goals:reorder-milestones",
    async (_event, goalId: string, milestoneIds: string[]) => {
      return repo.reorderMilestones(goalId, milestoneIds);
    }
  );

  ipcMain.handle("goals:delete", async (_event, id: string) => {
    return repo.delete(id);
  });
}
