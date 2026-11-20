import { describe, it, expect, beforeEach } from "vitest";
import Database from "../database/sqlite";
import { runMigrations } from "../database/migrator";
import { BibleRepository } from "../database/repositories/bibleRepository";

describe("Phase — Daily Bible Verse Feature (Smith & Van Dyke)", () => {
  let db: Database;
  let repo: BibleRepository;

  beforeEach(() => {
    db = new Database(":memory:");
    runMigrations(db);
    repo = new BibleRepository(db);
  });

  it("seeds all 66 canonical Bible books with testaments and chapters", () => {
    const books = repo.listBooks();
    expect(books.length).toBe(66);

    const oldTestament = repo.listBooks("old");
    expect(oldTestament.length).toBe(39);
    expect(oldTestament[0].name_ar).toBe("التكوين");
    expect(oldTestament[0].name_en).toBe("Genesis");

    const newTestament = repo.listBooks("new");
    expect(newTestament.length).toBe(27);
    expect(newTestament[0].name_ar).toBe("متى");
    expect(newTestament[3].name_ar).toBe("يوحنا");
    expect(newTestament[3].name_en).toBe("John");
  });

  it("loads and indexes all 31,104 verses of the Smith & Van Dyke translation", () => {
    const countRow = db
      .prepare("SELECT count(*) as count FROM bible_verses WHERE translation = 'svd'")
      .get() as { count: number };
    expect(countRow.count).toBe(31104);

    // Verify John 3:16 text
    const john316 = db
      .prepare("SELECT * FROM bible_verses WHERE book_id = 43 AND chapter = 3 AND verse = 16")
      .get() as { text: string };
    expect(john316).toBeDefined();
    expect(john316.text).toContain("لِأَنَّهُ هَكَذَا أَحَبَّ ٱللهُ ٱلْعَالَمَ");
  });

  it("daily verse remains stable throughout the same calendar day", () => {
    const dateStr = "2026-11-20";
    const verse1 = repo.getDailyVerse(dateStr);
    expect(verse1).toBeDefined();
    expect(verse1.text.length).toBeGreaterThan(5);
    expect(verse1.book_name_ar).toBeDefined();

    // Call again for the same date
    const verse2 = repo.getDailyVerse(dateStr);
    expect(verse2.id).toBe(verse1.id);
    expect(verse2.chapter).toBe(verse1.chapter);
    expect(verse2.verse).toBe(verse1.verse);
    expect(verse2.text).toBe(verse1.text);
  });

  it("daily verse rolls over to a new verse on the next calendar day", () => {
    const day1 = repo.getDailyVerse("2026-11-20");
    const day2 = repo.getDailyVerse("2026-11-21");

    expect(day1).toBeDefined();
    expect(day2).toBeDefined();
    // They should be different verses (not repeating)
    expect(day1.id).not.toBe(day2.id);
  });

  it("favorites system: toggling, checking, searching, and removing favorites", () => {
    const daily = repo.getDailyVerse("2026-11-20");

    // Initially not favorite
    expect(repo.isFavorite(daily.id)).toBe(false);

    // Add to favorites
    const addRes = repo.toggleFavorite(daily.id, "Favorite memory verse");
    expect(addRes.isFavorite).toBe(true);
    expect(repo.isFavorite(daily.id)).toBe(true);

    // List favorites
    const favorites = repo.listFavorites();
    expect(favorites.length).toBe(1);
    expect(favorites[0].verse_id).toBe(daily.id);
    expect(favorites[0].text).toBe(daily.id ? daily.text : "");

    // Search favorites
    const searchMatch = repo.listFavorites(daily.book_name_ar);
    expect(searchMatch.length).toBe(1);

    const searchNoMatch = repo.listFavorites("NonExistentSearchTerm12345");
    expect(searchNoMatch.length).toBe(0);

    // Remove favorite
    const removeRes = repo.toggleFavorite(daily.id);
    expect(removeRes.isFavorite).toBe(false);
    expect(repo.isFavorite(daily.id)).toBe(false);
    expect(repo.listFavorites().length).toBe(0);
  });

  it("separates Psalm headings from verse text (e.g., Psalm 100:1 and Psalm 23:1)", () => {
    // Check Psalm 100:1
    const ps100 = db
      .prepare("SELECT * FROM bible_verses WHERE book_id = 19 AND chapter = 100 AND verse = 1")
      .get() as { id: number; heading: string; text: string };
    expect(ps100).toBeDefined();
    expect(ps100.heading).toBe("مَزْمُورُ حَمْدٍ");
    expect(ps100.text).toBe("اِهْتِفِي لِلرَّبِّ يَا كُلَّ ٱلْأَرْضِ.");
    expect(ps100.text).not.toContain("مَزْمُورُ حَمْدٍ");

    // Check Psalm 23:1
    const ps23 = db
      .prepare("SELECT * FROM bible_verses WHERE book_id = 19 AND chapter = 23 AND verse = 1")
      .get() as { id: number; heading: string; text: string };
    expect(ps23).toBeDefined();
    expect(ps23.heading).toBe("مَزْمُورٌ لِدَاوُدَ");
    expect(ps23.text).toBe("ٱلرَّبُّ رَاعِيَّ فَلَا يُعْوِزُنِي شَيْءٌ.");
    expect(ps23.text).not.toContain("مَزْمُورٌ لِدَاوُدَ");

    // Check orphan Psalm (Psalm 1:1 has no superscription)
    const ps1 = db
      .prepare("SELECT * FROM bible_verses WHERE book_id = 19 AND chapter = 1 AND verse = 1")
      .get() as { id: number; heading: string | null; text: string };
    expect(ps1).toBeDefined();
    expect(ps1.heading).toBeNull();
    expect(ps1.text).toContain("طُوبَى لِلرَّجُلِ");

    // Check repository getVerse with Psalm 100:1
    const verseDetails = repo.getVerse(ps100.id);
    expect(verseDetails).toBeDefined();
    expect(verseDetails!.heading).toBe("مَزْمُورُ حَمْدٍ");
    expect(verseDetails!.text).toBe("اِهْتِفِي لِلرَّبِّ يَا كُلَّ ٱلْأَرْضِ.");

    // Check Favorites preserves heading
    repo.toggleFavorite(ps100.id);
    const favs = repo.listFavorites();
    const fav100 = favs.find((f) => f.verse_id === ps100.id);
    expect(fav100).toBeDefined();
    expect(fav100!.heading).toBe("مَزْمُورُ حَمْدٍ");
    expect(fav100!.text).toBe("اِهْتِفِي لِلرَّبِّ يَا كُلَّ ٱلْأَرْضِ.");

    // Check Search results preserves heading
    const searchRes = repo.searchVerses("اِهْتِفِي");
    expect(searchRes.length).toBeGreaterThan(0);
    const foundPs100 = searchRes.find((r) => r.book_id === 19 && r.chapter === 100 && r.verse === 1);
    expect(foundPs100).toBeDefined();
    expect(foundPs100!.heading).toBe("مَزْمُورُ حَمْدٍ");
    expect(foundPs100!.text).toBe("اِهْتِفِي لِلرَّبِّ يَا كُلَّ ٱلْأَرْضِ.");
  });
});
