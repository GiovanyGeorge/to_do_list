import { ipcMain } from "electron";
import { NoteRepository } from "../../database/repositories/noteRepository";

export function registerNoteIpc(repo: NoteRepository): void {
  ipcMain.handle("notes:list", async (_event, search?: string) => {
    return repo.list(search);
  });

  ipcMain.handle(
    "notes:create",
    async (
      _event,
      input: {
        title: string;
        content?: string;
        color?: string;
        isPinned?: boolean;
        tagIds?: string[];
      }
    ) => {
      return repo.create(input);
    }
  );

  ipcMain.handle("notes:get", async (_event, id: string) => {
    return repo.getById(id);
  });

  ipcMain.handle("notes:toggle-pin", async (_event, id: string) => {
    return repo.togglePin(id);
  });

  ipcMain.handle(
    "notes:update",
    async (
      _event,
      id: string,
      input: { title?: string; content?: string; color?: string }
    ) => {
      return repo.update(id, input);
    }
  );

  ipcMain.handle("notes:delete", async (_event, id: string) => {
    return repo.delete(id);
  });
}
