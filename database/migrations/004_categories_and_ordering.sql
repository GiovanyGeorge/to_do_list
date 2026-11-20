-- Migration 004: Categories enhancements and Task manual ordering position

-- Add position column to tasks for manual drag-and-drop reordering
ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

-- Add description and archived_at to categories
ALTER TABLE categories ADD COLUMN description TEXT;
ALTER TABLE categories ADD COLUMN archived_at TEXT;

-- Seed Starter Categories (if not already seeded)
INSERT OR IGNORE INTO categories (id, name, color, icon, description, created_at) VALUES
  ('cat-study', 'Study', '#C2410C', 'GraduationCap', 'Lectures, revisions, exams, and academic study', datetime('now')),
  ('cat-personal', 'Personal', '#15803D', 'User', 'Personal errands, habits, and everyday life', datetime('now')),
  ('cat-work', 'Work', '#EA580C', 'Briefcase', 'Work tasks, clients, deliverables, and meetings', datetime('now')),
  ('cat-learning', 'Learning', '#7C3AED', 'BookOpen', 'Skill building, online courses, and research', datetime('now')),
  ('cat-health', 'Health', '#16A34A', 'HeartPulse', 'Doctor visits, medications, and wellness', datetime('now')),
  ('cat-fitness', 'Fitness', '#65A30D', 'Dumbbell', 'Workouts, runs, stretching, and physical activity', datetime('now')),
  ('cat-family', 'Family', '#E11D48', 'Users', 'Family gatherings, responsibilities, and moments', datetime('now')),
  ('cat-errands', 'Errands', '#D97706', 'ShoppingBag', 'Groceries, shopping, repairs, and pickup', datetime('now')),
  ('cat-finance', 'Finance', '#0D9488', 'Wallet', 'Budgeting, bills, taxes, and subscriptions', datetime('now')),
  ('cat-reading', 'Reading', '#9A3412', 'Book', 'Books, articles, summaries, and book clubs', datetime('now')),
  ('cat-home', 'Home', '#475569', 'House', 'Cleaning, home maintenance, organization, and repairs', datetime('now')),
  ('cat-other', 'Other', '#78716C', 'Circle', 'General tasks and miscellaneous items', datetime('now'));
