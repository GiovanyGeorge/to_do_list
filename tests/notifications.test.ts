import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ReminderRepository } from "../database/repositories/reminderRepository";
import { NotificationService } from "../electron/services/notificationService";

describe("Phase 5 - Reminders and Notifications", () => {
  let db: Database.Database;
  let reminderRepo: ReminderRepository;
  let notificationService: NotificationService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON;");

    // Run migrations 001 and 002
    const migration1 = fs.readFileSync(
      path.join(__dirname, "../database/migrations/001_initial_schema.sql"),
      "utf-8"
    );
    const migration2 = fs.readFileSync(
      path.join(__dirname, "../database/migrations/002_notifications.sql"),
      "utf-8"
    );
    db.exec(migration1);
    db.exec(migration2);

    reminderRepo = new ReminderRepository(db);
    notificationService = new NotificationService(reminderRepo);
  });

  afterEach(() => {
    db.close();
  });

  it("creates and logs a reminder correctly", () => {
    const remindAt = new Date(Date.now() + 60000).toISOString();
    const reminder = reminderRepo.create({
      title: "Team Standup",
      message: "Join morning standup call",
      remindAt,
    });

    expect(reminder.id).toBeDefined();
    expect(reminder.title).toBe("Team Standup");
    expect(reminder.status).toBe("pending");

    const fetched = reminderRepo.getById(reminder.id);
    expect(fetched?.title).toBe("Team Standup");
  });

  it("delivers due reminders and logs notification without duplicate delivery", () => {
    const pastTime = new Date(Date.now() - 10000).toISOString();
    const reminder = reminderRepo.create({
      title: "Overdue Review",
      remindAt: pastTime,
    });

    // Deliver first time
    notificationService.deliverReminder(reminder);

    const updated = reminderRepo.getById(reminder.id);
    expect(updated?.status).toBe("delivered");

    const logs = reminderRepo.listNotifications();
    expect(logs).toHaveLength(1);
    expect(logs[0].title).toBe("Overdue Review");

    // Second call should NOT re-deliver or log duplicate
    notificationService.deliverReminder(reminder);
    const logsAfter = reminderRepo.listNotifications();
    expect(logsAfter).toHaveLength(1);
  });

  it("rebuilds missed reminders on startup initialization", () => {
    // Insert 2 missed reminders directly
    const past1 = new Date(Date.now() - 20000).toISOString();
    const past2 = new Date(Date.now() - 5000).toISOString();
    reminderRepo.create({ title: "Missed Reminder 1", remindAt: past1 });
    reminderRepo.create({ title: "Missed Reminder 2", remindAt: past2 });

    // Initialize scheduler (simulating app start)
    notificationService.initializeScheduler();

    const inAppLogs = reminderRepo.listNotifications();
    expect(inAppLogs).toHaveLength(2);
    expect(inAppLogs.map((l) => l.title)).toContain("Missed Reminder 1");
    expect(inAppLogs.map((l) => l.title)).toContain("Missed Reminder 2");
  });

  it("respects user preference when notifications are disabled", () => {
    reminderRepo.setSetting("notifications_enabled", "false");

    const pastTime = new Date(Date.now() - 5000).toISOString();
    const reminder = reminderRepo.create({
      title: "Muted Alert",
      remindAt: pastTime,
    });

    notificationService.deliverReminder(reminder);

    const updated = reminderRepo.getById(reminder.id);
    expect(updated?.status).toBe("dismissed");

    const logs = reminderRepo.listNotifications();
    expect(logs[0].status).toBe("skipped");
  });
});
