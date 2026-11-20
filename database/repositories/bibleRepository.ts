import Database from "../sqlite";
import crypto from "node:crypto";
import type {
  BibleBookRecord,
  DailyVerseWithDetails,
  BibleFavoriteRecord,
  BibleFavoriteWithVerse,
} from "../../shared/types/database";

interface RawVerseRow {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  heading?: string | null;
  text: string;
  translation: string;
  book_name_ar: string;
  book_name_en: string;
  book_abbr_ar: string;
  book_abbr_en: string;
  testament: "old" | "new";
  is_favorite: number;
}

export class BibleRepository {
  constructor(private db: Database) {}

  // List of classic inspirational verses for daily rotation (Book ID, Chapter, Verse)
  private readonly inspirationalVerses: { b: number; c: number; v: number }[] = [
    { b: 43, c: 3, v: 16 },   // John 3:16
    { b: 19, c: 23, v: 1 },   // Psalm 23:1
    { b: 50, c: 4, v: 13 },   // Philippians 4:13
    { b: 20, c: 3, v: 5 },    // Proverbs 3:5
    { b: 45, c: 8, v: 28 },   // Romans 8:28
    { b: 24, c: 29, v: 11 },  // Jeremiah 29:11
    { b: 23, c: 40, v: 31 },  // Isaiah 40:31
    { b: 40, c: 11, v: 28 },  // Matthew 11:28
    { b: 19, c: 119, v: 105 },// Psalm 119:105
    { b: 6, c: 1, v: 9 },     // Joshua 1:9
    { b: 45, c: 12, v: 2 },   // Romans 12:2
    { b: 19, c: 46, v: 1 },   // Psalm 46:1
    { b: 46, c: 13, v: 4 },   // 1 Corinthians 13:4
    { b: 48, c: 5, v: 22 },   // Galatians 5:22
    { b: 43, c: 14, v: 6 },   // John 14:6
    { b: 19, c: 27, v: 1 },   // Psalm 27:1
    { b: 49, c: 2, v: 8 },    // Ephesians 2:8
    { b: 55, c: 1, v: 7 },    // 2 Timothy 1:7
    { b: 58, c: 11, v: 1 },   // Hebrews 11:1
    { b: 59, c: 1, v: 5 },    // James 1:5
    { b: 62, c: 4, v: 19 },   // 1 John 4:19
    { b: 19, c: 37, v: 4 },   // Psalm 37:4
    { b: 19, c: 91, v: 1 },   // Psalm 91:1
    { b: 20, c: 4, v: 23 },   // Proverbs 4:23
    { b: 23, c: 41, v: 10 },  // Isaiah 41:10
    { b: 36, c: 3, v: 17 },   // Zephaniah 3:17
    { b: 40, c: 28, v: 20 },  // Matthew 28:20
    { b: 43, c: 10, v: 10 },  // John 10:10
    { b: 40, c: 6, v: 33 },   // Matthew 6:33
    { b: 51, c: 3, v: 14 },   // Colossians 3:14
    { b: 52, c: 5, v: 16 },   // 1 Thessalonians 5:16
    { b: 66, c: 21, v: 4 },   // Revelation 21:4
    { b: 19, c: 121, v: 1 },  // Psalm 121:1
    { b: 25, c: 3, v: 22 },   // Lamentations 3:22
    { b: 45, c: 8, v: 38 },   // Romans 8:38
    { b: 43, c: 1, v: 1 },    // John 1:1
    { b: 1, c: 1, v: 1 },     // Genesis 1:1
    { b: 43, c: 8, v: 12 },   // John 8:12
    { b: 19, c: 103, v: 1 },  // Psalm 103:1
    { b: 60, c: 5, v: 7 },    // 1 Peter 5:7
    { b: 19, c: 139, v: 14 }, // Psalm 139:14
    { b: 20, c: 16, v: 3 },   // Proverbs 16:3
    { b: 33, c: 6, v: 8 },    // Micah 6:8
    { b: 40, c: 5, v: 16 },   // Matthew 5:16
    { b: 43, c: 15, v: 5 },   // John 15:5
    { b: 45, c: 15, v: 13 },  // Romans 15:13
    { b: 47, c: 5, v: 17 },   // 2 Corinthians 5:17
    { b: 50, c: 4, v: 6 },    // Philippians 4:6
    { b: 51, c: 3, v: 2 },    // Colossians 3:2
    { b: 58, c: 4, v: 12 },   // Hebrews 4:12
    { b: 19, c: 34, v: 8 },   // Psalm 34:8
    { b: 19, c: 63, v: 1 },   // Psalm 63:1
    { b: 19, c: 100, v: 1 },  // Psalm 100:1
    { b: 23, c: 26, v: 3 },   // Isaiah 26:3
    { b: 35, c: 3, v: 18 },   // Habakkuk 3:18
    { b: 40, c: 7, v: 7 },    // Matthew 7:7
    { b: 42, c: 1, v: 37 },   // Luke 1:37
    { b: 43, c: 16, v: 33 },  // John 16:33
    { b: 45, c: 5, v: 8 },    // Romans 5:8
    { b: 47, c: 12, v: 9 },   // 2 Corinthians 12:9
    { b: 48, c: 2, v: 20 },   // Galatians 2:20
    { b: 49, c: 4, v: 32 },   // Ephesians 4:32
    { b: 50, c: 1, v: 6 },    // Philippians 1:6
    { b: 52, c: 5, v: 18 },   // 1 Thessalonians 5:18
    { b: 58, c: 12, v: 2 },   // Hebrews 12:2
    { b: 62, c: 1, v: 9 },    // 1 John 1:9
    { b: 19, c: 16, v: 11 },  // Psalm 16:11
    { b: 19, c: 118, v: 24 }, // Psalm 118:24
    { b: 21, c: 3, v: 1 },    // Ecclesiastes 3:1
    { b: 23, c: 55, v: 6 },   // Isaiah 55:6
  ];

  /**
   * Retrieves today's stable daily verse.
   * If not already assigned for the date, selects one deterministically
   * and saves it in `daily_verses`.
   */
  getDailyVerse(dateStr?: string): DailyVerseWithDetails {
    const today = dateStr || new Date().toISOString().substring(0, 10);

    // 1. Check if already recorded for this calendar day
    const existing = this.db
      .prepare(`
        SELECT dv.date, v.id, v.book_id, v.chapter, v.verse, v.heading, v.text, v.translation,
               b.name_ar as book_name_ar, b.name_en as book_name_en,
               b.abbr_ar as book_abbr_ar, b.abbr_en as book_abbr_en, b.testament,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM daily_verses dv
        JOIN bible_verses v ON dv.verse_id = v.id
        JOIN bible_books b ON v.book_id = b.id
        LEFT JOIN bible_favorites f ON f.verse_id = v.id
        WHERE dv.date = ?
      `)
      .get(today) as RawVerseRow | undefined;

    if (existing) {
      return {
        ...existing,
        is_favorite: existing.is_favorite === 1,
      };
    }

    // 2. Select a fresh verse not repeated in the last 180 days
    const recentVerseIds = (
      this.db
        .prepare(`
          SELECT verse_id FROM daily_verses
          WHERE date >= date(?, '-180 days')
        `)
        .all(today) as { verse_id: number }[]
    ).map((r) => r.verse_id);

    const recentSet = new Set(recentVerseIds);

    // Find the first inspirational verse that hasn't been shown recently
    let selectedVerseId: number | null = null;

    // Use date hash for consistent pseudo-random choice if needed
    let dateHash = 0;
    for (let i = 0; i < today.length; i++) {
      dateHash = (dateHash << 5) - dateHash + today.charCodeAt(i);
      dateHash |= 0;
    }
    const startIndex = Math.abs(dateHash) % this.inspirationalVerses.length;

    for (let i = 0; i < this.inspirationalVerses.length; i++) {
      const idx = (startIndex + i) % this.inspirationalVerses.length;
      const target = this.inspirationalVerses[idx];
      const row = this.db
        .prepare(
          "SELECT id FROM bible_verses WHERE book_id = ? AND chapter = ? AND verse = ? LIMIT 1"
        )
        .get(target.b, target.c, target.v) as { id: number } | undefined;

      if (row && !recentSet.has(row.id)) {
        selectedVerseId = row.id;
        break;
      }
    }

    // Fallback if all inspirational verses were shown recently: pick any inspiring verse from Psalms / Gospels
    if (!selectedVerseId) {
      const fallback = this.db
        .prepare(`
          SELECT id FROM bible_verses
          WHERE book_id IN (19, 20, 40, 41, 42, 43, 45, 50)
          ORDER BY RANDOM() LIMIT 1
        `)
        .get() as { id: number } | undefined;

      selectedVerseId = fallback?.id || 1;
    }

    // Persist daily assignment
    const now = new Date().toISOString();
    this.db
      .prepare(
        "INSERT OR REPLACE INTO daily_verses (date, verse_id, created_at) VALUES (?, ?, ?)"
      )
      .run(today, selectedVerseId, now);

    return this.getVerse(selectedVerseId, today)!;
  }

  /**
   * Retrieves single verse with full details and favorite status.
   */
  getVerse(id: number, date?: string): DailyVerseWithDetails | null {
    const row = this.db
      .prepare(`
        SELECT v.id, v.book_id, v.chapter, v.verse, v.heading, v.text, v.translation,
               b.name_ar as book_name_ar, b.name_en as book_name_en,
               b.abbr_ar as book_abbr_ar, b.abbr_en as book_abbr_en, b.testament,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        LEFT JOIN bible_favorites f ON f.verse_id = v.id
        WHERE v.id = ?
      `)
      .get(id) as RawVerseRow | undefined;

    if (!row) return null;

    return {
      ...row,
      date,
      is_favorite: row.is_favorite === 1,
    };
  }

  /**
   * Toggles a verse as favorite.
   */
  toggleFavorite(verseId: number, notes?: string): { isFavorite: boolean; favorite?: BibleFavoriteRecord } {
    const existing = this.db
      .prepare("SELECT * FROM bible_favorites WHERE verse_id = ?")
      .get(verseId) as BibleFavoriteRecord | undefined;

    if (existing) {
      this.db.prepare("DELETE FROM bible_favorites WHERE verse_id = ?").run(verseId);
      return { isFavorite: false };
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.db
      .prepare(
        "INSERT INTO bible_favorites (id, verse_id, notes, created_at) VALUES (?, ?, ?, ?)"
      )
      .run(id, verseId, notes || null, now);

    return {
      isFavorite: true,
      favorite: { id, verse_id: verseId, notes: notes || null, created_at: now },
    };
  }

  isFavorite(verseId: number): boolean {
    const row = this.db
      .prepare("SELECT id FROM bible_favorites WHERE verse_id = ?")
      .get(verseId);
    return !!row;
  }

  removeFavorite(verseId: number): boolean {
    const res = this.db
      .prepare("DELETE FROM bible_favorites WHERE verse_id = ?")
      .run(verseId);
    return res.changes > 0;
  }

  /**
   * Lists all saved favorites with full verse and book details.
   */
  listFavorites(searchQuery?: string): BibleFavoriteWithVerse[] {
    let sql = `
      SELECT f.id as favorite_id, f.verse_id, f.notes, f.created_at as favorited_at,
             v.id, v.book_id, v.chapter, v.verse, v.heading, v.text, v.translation,
             b.name_ar as book_name_ar, b.name_en as book_name_en,
             b.abbr_ar as book_abbr_ar, b.abbr_en as book_abbr_en, b.testament,
             1 as is_favorite
      FROM bible_favorites f
      JOIN bible_verses v ON f.verse_id = v.id
      JOIN bible_books b ON v.book_id = b.id
    `;

    const params: unknown[] = [];
    if (searchQuery && searchQuery.trim()) {
      sql += " WHERE (v.text LIKE ? OR b.name_ar LIKE ? OR b.name_en LIKE ?)";
      const q = `%${searchQuery.trim()}%`;
      params.push(q, q, q);
    }

    sql += " ORDER BY f.created_at DESC";

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map((r) => ({
      id: r.id,
      favorite_id: r.favorite_id,
      verse_id: r.verse_id,
      notes: r.notes,
      favorited_at: r.favorited_at,
      book_id: r.book_id,
      chapter: r.chapter,
      verse: r.verse,
      heading: r.heading || null,
      text: r.text,
      translation: r.translation,
      book_name_ar: r.book_name_ar,
      book_name_en: r.book_name_en,
      book_abbr_ar: r.book_abbr_ar,
      book_abbr_en: r.book_abbr_en,
      testament: r.testament,
      is_favorite: true,
    }));
  }

  /**
   * Lists all 66 Bible books with testaments and chapter counts.
   */
  listBooks(testament?: "old" | "new"): BibleBookRecord[] {
    if (testament) {
      return this.db
        .prepare("SELECT * FROM bible_books WHERE testament = ? ORDER BY id ASC")
        .all(testament) as BibleBookRecord[];
    }
    return this.db
      .prepare("SELECT * FROM bible_books ORDER BY id ASC")
      .all() as BibleBookRecord[];
  }

  /**
   * Search across all 31,104 Bible verses.
   */
  searchVerses(
    query: string,
    options?: { bookId?: number; testament?: "old" | "new"; limit?: number; offset?: number }
  ): DailyVerseWithDetails[] {
    let sql = `
      SELECT v.id, v.book_id, v.chapter, v.verse, v.heading, v.text, v.translation,
             b.name_ar as book_name_ar, b.name_en as book_name_en,
             b.abbr_ar as book_abbr_ar, b.abbr_en as book_abbr_en, b.testament,
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM bible_verses v
      JOIN bible_books b ON v.book_id = b.id
      LEFT JOIN bible_favorites f ON f.verse_id = v.id
      WHERE v.text LIKE ?
    `;

    const params: unknown[] = [`%${query.trim()}%`];

    if (options?.bookId) {
      sql += " AND v.book_id = ?";
      params.push(options.bookId);
    }

    if (options?.testament) {
      sql += " AND b.testament = ?";
      params.push(options.testament);
    }

    sql += " ORDER BY v.book_id ASC, v.chapter ASC, v.verse ASC";

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const rows = this.db.prepare(sql).all(...params) as RawVerseRow[];

    return rows.map((r) => ({
      ...r,
      is_favorite: r.is_favorite === 1,
    }));
  }

  /**
   * Retrieves all verses in a given book chapter.
   */
  getChapter(bookId: number, chapter: number): DailyVerseWithDetails[] {
    const rows = this.db
      .prepare(`
        SELECT v.id, v.book_id, v.chapter, v.verse, v.heading, v.text, v.translation,
               b.name_ar as book_name_ar, b.name_en as book_name_en,
               b.abbr_ar as book_abbr_ar, b.abbr_en as book_abbr_en, b.testament,
               CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM bible_verses v
        JOIN bible_books b ON v.book_id = b.id
        LEFT JOIN bible_favorites f ON f.verse_id = v.id
        WHERE v.book_id = ? AND v.chapter = ?
        ORDER BY v.verse ASC
      `)
      .all(bookId, chapter) as RawVerseRow[];

    return rows.map((r) => ({
      ...r,
      is_favorite: r.is_favorite === 1,
    }));
  }
}
