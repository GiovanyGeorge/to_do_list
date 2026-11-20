import { ipcMain } from "electron";
import { CategoryRepository } from "../../database/repositories/categoryRepository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../shared/types/database";

export function registerCategoryIpc(categoryRepo: CategoryRepository): void {
  ipcMain.handle("categories:list", async (_event, includeArchived?: boolean) => {
    return categoryRepo.list(includeArchived);
  });

  ipcMain.handle("categories:get", async (_event, id: string) => {
    return categoryRepo.getById(id);
  });

  ipcMain.handle("categories:create", async (_event, input: CreateCategoryInput) => {
    return categoryRepo.create(input);
  });

  ipcMain.handle(
    "categories:update",
    async (_event, id: string, input: UpdateCategoryInput) => {
      return categoryRepo.update(id, input);
    }
  );

  ipcMain.handle("categories:archive", async (_event, id: string) => {
    return categoryRepo.archive(id);
  });

  ipcMain.handle("categories:unarchive", async (_event, id: string) => {
    return categoryRepo.unarchive(id);
  });

  ipcMain.handle(
    "categories:delete",
    async (_event, id: string, reassignToCategoryId?: string | null) => {
      return categoryRepo.delete(id, reassignToCategoryId);
    }
  );
}
