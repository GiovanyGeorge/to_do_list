-- Migration 005: Bible Verse Feature (Smith & Van Dyke Arabic Translation)

CREATE TABLE IF NOT EXISTS bible_books (
  id INTEGER PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  testament TEXT NOT NULL CHECK(testament IN ('old', 'new')),
  abbr_ar TEXT NOT NULL,
  abbr_en TEXT NOT NULL,
  chapters_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bible_verses (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES bible_books(id),
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  heading TEXT,
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'svd'
);

CREATE INDEX IF NOT EXISTS idx_bible_verses_book_ch_v ON bible_verses(book_id, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_verses_translation ON bible_verses(translation);

CREATE TABLE IF NOT EXISTS daily_verses (
  date TEXT PRIMARY KEY,
  verse_id INTEGER NOT NULL REFERENCES bible_verses(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bible_favorites (
  id TEXT PRIMARY KEY,
  verse_id INTEGER NOT NULL UNIQUE REFERENCES bible_verses(id),
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bible_favorites_verse_id ON bible_favorites(verse_id);

-- Seed Bible Books
INSERT OR IGNORE INTO bible_books (id, name_ar, name_en, testament, abbr_ar, abbr_en, chapters_count) VALUES
  (1, 'التكوين', 'Genesis', 'old', 'تك', 'Gen', 50),
  (2, 'الخروج', 'Exodus', 'old', 'خر', 'Exod', 40),
  (3, 'اللاويين', 'Leviticus', 'old', 'لا', 'Lev', 27),
  (4, 'العدد', 'Numbers', 'old', 'عد', 'Num', 36),
  (5, 'التثنية', 'Deuteronomy', 'old', 'تث', 'Deut', 34),
  (6, 'يشوع', 'Joshua', 'old', 'يش', 'Josh', 24),
  (7, 'القضاة', 'Judges', 'old', 'قض', 'Judg', 21),
  (8, 'راعوث', 'Ruth', 'old', 'را', 'Ruth', 4),
  (9, 'صموئيل الأول', '1 Samuel', 'old', '1صم', '1Sam', 31),
  (10, 'صموئيل الثاني', '2 Samuel', 'old', '2صم', '2Sam', 24),
  (11, 'الملوك الأول', '1 Kings', 'old', '1مل', '1Kgs', 22),
  (12, 'الملوك الثاني', '2 Kings', 'old', '2مل', '2Kgs', 25),
  (13, 'أخبار الأيام الأول', '1 Chronicles', 'old', '1أخ', '1Chr', 29),
  (14, 'أخبار الأيام الثاني', '2 Chronicles', 'old', '2أخ', '2Chr', 36),
  (15, 'عزرا', 'Ezra', 'old', 'عز', 'Ezra', 10),
  (16, 'نحميا', 'Nehemiah', 'old', 'نح', 'Neh', 13),
  (17, 'أستير', 'Esther', 'old', 'أس', 'Esth', 10),
  (18, 'أيوب', 'Job', 'old', 'أي', 'Job', 42),
  (19, 'المزامير', 'Psalms', 'old', 'مز', 'Ps', 150),
  (20, 'الأمثال', 'Proverbs', 'old', 'أم', 'Prov', 31),
  (21, 'الجامعة', 'Ecclesiastes', 'old', 'جا', 'Eccl', 12),
  (22, 'نشيد الأنشاد', 'Song of Solomon', 'old', 'نش', 'Song', 8),
  (23, 'إشعياء', 'Isaiah', 'old', 'إش', 'Isa', 66),
  (24, 'إرميا', 'Jeremiah', 'old', 'إر', 'Jer', 52),
  (25, 'مراثي إرميا', 'Lamentations', 'old', 'مرا', 'Lam', 5),
  (26, 'حزقيال', 'Ezekiel', 'old', 'حز', 'Ezek', 48),
  (27, 'دانيال', 'Daniel', 'old', 'دا', 'Dan', 12),
  (28, 'هوشع', 'Hosea', 'old', 'هو', 'Hos', 14),
  (29, 'يوئيل', 'Joel', 'old', 'يوئيل', 'Joel', 3),
  (30, 'عاموس', 'Amos', 'old', 'عا', 'Amos', 9),
  (31, 'عوبديا', 'Obadiah', 'old', 'عو', 'Obad', 1),
  (32, 'يونان', 'Jonah', 'old', 'يون', 'Jonah', 4),
  (33, 'ميخا', 'Micah', 'old', 'مي', 'Mic', 7),
  (34, 'ناحوم', 'Nahum', 'old', 'نا', 'Nah', 3),
  (35, 'حبقوق', 'Habakkuk', 'old', 'حب', 'Hab', 3),
  (36, 'صفنيا', 'Zephaniah', 'old', 'صف', 'Zeph', 3),
  (37, 'حجي', 'Haggai', 'old', 'حج', 'Hag', 2),
  (38, 'زكريا', 'Zechariah', 'old', 'زك', 'Zech', 14),
  (39, 'ملاخي', 'Malachi', 'old', 'مل', 'Mal', 4),
  (40, 'متى', 'Matthew', 'new', 'مت', 'Matt', 28),
  (41, 'مرقس', 'Mark', 'new', 'مر', 'Mark', 16),
  (42, 'لوقا', 'Luke', 'new', 'لو', 'Luke', 24),
  (43, 'يوحنا', 'John', 'new', 'يو', 'John', 21),
  (44, 'أعمال الرسل', 'Acts', 'new', 'أع', 'Acts', 28),
  (45, 'رومية', 'Romans', 'new', 'رو', 'Rom', 16),
  (46, 'كورنثوس الأولى', '1 Corinthians', 'new', '1كو', '1Cor', 16),
  (47, 'كورنثوس الثانية', '2 Corinthians', 'new', '2كو', '2Cor', 13),
  (48, 'غلاطية', 'Galatians', 'new', 'غل', 'Gal', 6),
  (49, 'أفسس', 'Ephesians', 'new', 'أف', 'Eph', 6),
  (50, 'فيلبي', 'Philippians', 'new', 'في', 'Phil', 4),
  (51, 'كولوسي', 'Colossians', 'new', 'كو', 'Col', 4),
  (52, 'تسالونيكي الأولى', '1 Thessalonians', 'new', '1تس', '1Thess', 5),
  (53, 'تسالونيكي الثانية', '2 Thessalonians', 'new', '2تس', '2Thess', 3),
  (54, 'تيموثاوس الأولى', '1 Timothy', 'new', '1تي', '1Tim', 6),
  (55, 'تيموثاوس الثانية', '2 Timothy', 'new', '2تي', '2Tim', 4),
  (56, 'تيطس', 'Titus', 'new', 'تي', 'Titus', 3),
  (57, 'فليمون', 'Philemon', 'new', 'فل', 'Phlm', 1),
  (58, 'العبرانيين', 'Hebrews', 'new', 'عب', 'Heb', 13),
  (59, 'يعقوب', 'James', 'new', 'يع', 'Jas', 5),
  (60, 'بطرس الأولى', '1 Peter', 'new', '1بط', '1Pet', 5),
  (61, 'بطرس الثانية', '2 Peter', 'new', '2بط', '2Pet', 3),
  (62, 'يوحنا الأولى', '1 John', 'new', '1يو', '1John', 5),
  (63, 'يوحنا الثانية', '2 John', 'new', '2يو', '2John', 1),
  (64, 'يوحنا الثالثة', '3 John', 'new', '3يو', '3John', 1),
  (65, 'يهوذا', 'Jude', 'new', 'يه', 'Jude', 1),
  (66, 'الرؤيا', 'Revelation', 'new', 'رؤ', 'Rev', 22);
