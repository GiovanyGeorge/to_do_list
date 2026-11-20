import { ipcMain } from "electron";
import { ProjectService } from "../services/projectService";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../../shared/types/database";

export function registerProjectIpc(projectService: ProjectService): void {
  ipcMain.handle("projects:list", async (_event, includeArchived?: boolean) => {
    return projectService.listProjects(includeArchived);
  });

  ipcMain.handle("projects:get", async (_event, id: string) => {
    return projectService.getProject(id);
  });

  ipcMain.handle("projects:create", async (_event, input: CreateProjectInput) => {
    return projectService.createProject(input);
  });

  ipcMain.handle(
    "projects:update",
    async (_event, id: string, input: UpdateProjectInput) => {
      return projectService.updateProject(id, input);
    }
  );

  ipcMain.handle("projects:delete", async (_event, id: string) => {
    return projectService.deleteProject(id);
  });

  ipcMain.handle("projects:archive", async (_event, id: string) => {
    return projectService.archiveProject(id);
  });
}
