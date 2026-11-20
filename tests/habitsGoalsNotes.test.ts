import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "../database/sqlite";
import fs from "node:fs";
import path from "node:path";
import { HabitRepository } from "../database/repositories/habitRepository";
import { GoalRepository } from "../database/repositories/goalRepository";
import { NoteRepository } from "../database/repositories/noteRepository";

describe("Phase 6 - Habits, Goals, and Notes Engine", () => {
  let db: Database;
  let habitRepo: HabitRepository;
  let goalRepo: GoalRepository;
  let noteRepo: NoteRepository;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");

    const m1 = fs.readFileSync(path.join(__dirname, "../database/migrations/001_initial_schema.sql"), "utf-8");
    const m2 = fs.readFileSync(path.join(__dirname, "../database/migrations/002_notifications.sql"), "utf-8");
    const m3 = fs.readFileSync(path.join(__dirname, "../database/migrations/003_habits_goals_notes.sql"), "utf-8");

    db.exec(m1);
    db.exec(m2);
    db.exec(m3);

    habitRepo = new HabitRepository(db);
    goalRepo = new GoalRepository(db);
    noteRepo = new NoteRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it("calculates habit streaks accurately when logging consecutive days", () => {
    const habit = habitRepo.create({ name: "Daily Reading", frequency: "daily" });

    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().substring(0, 10);

    // Log yesterday and two days ago
    habitRepo.toggleLog(habit.id, twoDaysAgoStr);
    habitRepo.toggleLog(habit.id, yesterdayStr);

    let fetched = habitRepo.getById(habit.id);
    expect(fetched?.current_streak).toBe(2);
    expect(fetched?.longest_streak).toBe(2);
    expect(fetched?.is_completed_today).toBe(false);

    // Log today -> streak should increase to 3
    habitRepo.toggleLog(habit.id, todayStr);
    fetched = habitRepo.getById(habit.id);
    expect(fetched?.current_streak).toBe(3);
    expect(fetched?.longest_streak).toBe(3);
    expect(fetched?.is_completed_today).toBe(true);

    // Toggle today off -> streak drops back to 2
    habitRepo.toggleLog(habit.id, todayStr);
    fetched = habitRepo.getById(habit.id);
    expect(fetched?.current_streak).toBe(2);
    expect(fetched?.is_completed_today).toBe(false);
  });

  it("calculates goal progress from milestone completion", () => {
    const goal = goalRepo.create({
      title: "Write Novel Draft",
      milestones: ["Chapter 1-5", "Chapter 6-10", "Chapter 11-15", "Chapter 16-20"],
    });

    expect(goal.total_milestones_count).toBe(4);
    expect(goal.completed_milestones_count).toBe(0);
    expect(goal.progress_percent).toBe(0);

    // Complete first milestone (25%)
    goalRepo.toggleMilestone(goal.milestones[0].id);
    let updated = goalRepo.getById(goal.id);
    expect(updated?.completed_milestones_count).toBe(1);
    expect(updated?.progress_percent).toBe(25);

    // Complete second milestone (50%)
    goalRepo.toggleMilestone(goal.milestones[1].id);
    updated = goalRepo.getById(goal.id);
    expect(updated?.completed_milestones_count).toBe(2);
    expect(updated?.progress_percent).toBe(50);
  });

  it("creates, pins, searches, and deletes notes", () => {
    const note1 = noteRepo.create({
      title: "Architecture Decisions",
      content: "Use SQLite with WAL mode and foreign keys.",
      isPinned: false,
    });

    const note2 = noteRepo.create({
      title: "Weekly Grocery List",
      content: "Apples, Milk, Oats.",
      isPinned: false,
    });

    // Pin note 1
    noteRepo.togglePin(note1.id);

    const list = noteRepo.list();
    expect(list[0].id).toBe(note1.id); // Pinned appears first
    expect(list[0].is_pinned).toBe(1);

    // Search notes
    const searchResults = noteRepo.list("SQLite");
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe("Architecture Decisions");

    // Delete note 2
    expect(noteRepo.delete(note2.id)).toBe(true);
    expect(noteRepo.list()).toHaveLength(1);
  });
});
