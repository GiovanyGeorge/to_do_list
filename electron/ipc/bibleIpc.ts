import { ipcMain } from "electron";
import { BibleRepository } from "../../database/repositories/bibleRepository";

export function registerBibleIpc(bibleRepo: BibleRepository): void {
  ipcMain.handle("bible:get-daily-verse", async (_event, dateStr?: string) => {
    return bibleRepo.getDailyVerse(dateStr);
  });

  ipcMain.handle(
    "bible:toggle-favorite",
    async (_event, verseId: number, notes?: string) => {
      return bibleRepo.toggleFavorite(verseId, notes);
    }
  );

  ipcMain.handle("bible:is-favorite", async (_event, verseId: number) => {
    return bibleRepo.isFavorite(verseId);
  });

  ipcMain.handle("bible:list-favorites", async (_event, searchQuery?: string) => {
    return bibleRepo.listFavorites(searchQuery);
  });

  ipcMain.handle("bible:remove-favorite", async (_event, verseId: number) => {
    return bibleRepo.removeFavorite(verseId);
  });

  ipcMain.handle(
    "bible:list-books",
    async (_event, testament?: "old" | "new") => {
      return bibleRepo.listBooks(testament);
    }
  );

  ipcMain.handle(
    "bible:search-verses",
    async (
      _event,
      query: string,
      options?: { bookId?: number; testament?: "old" | "new"; limit?: number; offset?: number }
    ) => {
      return bibleRepo.searchVerses(query, options);
    }
  );

  ipcMain.handle(
    "bible:get-chapter",
    async (_event, bookId: number, chapter: number) => {
      return bibleRepo.getChapter(bookId, chapter);
    }
  );
}
