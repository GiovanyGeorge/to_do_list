import { Notification } from "electron";
import { ReminderRepository } from "../../database/repositories/reminderRepository";
import type {
  ReminderRecord,
  NotificationLogRecord,
  ReminderType,
} from "../../shared/types/database";

export class NotificationService {
  private activeTimers = new Map<string, NodeJS.Timeout>();
  private onNotificationDelivered?: (notif: NotificationLogRecord) => void;

  constructor(private repo: ReminderRepository) {}

  setNotificationListener(callback: (notif: NotificationLogRecord) => void): void {
    this.onNotificationDelivered = callback;
  }

  // Called on app startup to rebuild pending schedules & process missed reminders
  initializeScheduler(): void {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Process any missed past reminders that are still 'pending'
    const missedReminders = this.repo.getPendingDueReminders(nowIso);
    for (const reminder of missedReminders) {
      this.deliverReminder(reminder);
    }

    // 2. Reschedule future pending reminders
    const upcoming = this.repo.getUpcomingPendingReminders();
    for (const reminder of upcoming) {
      this.scheduleTimer(reminder);
    }
  }

  scheduleReminder(input: {
    taskId?: string;
    remindAt: string;
    title: string;
    message?: string;
    type?: ReminderType;
  }): ReminderRecord {
    const reminder = this.repo.create(input);
    const diff = new Date(reminder.remind_at).getTime() - Date.now();

    if (diff <= 0) {
      this.deliverReminder(reminder);
    } else {
      this.scheduleTimer(reminder);
    }

    return reminder;
  }

  private scheduleTimer(reminder: ReminderRecord): void {
    // Prevent duplicate timers
    if (this.activeTimers.has(reminder.id)) {
      clearTimeout(this.activeTimers.get(reminder.id)!);
      this.activeTimers.delete(reminder.id);
    }

    const diff = new Date(reminder.remind_at).getTime() - Date.now();
    if (diff <= 0) {
      this.deliverReminder(reminder);
      return;
    }

    // Cap delay to 32-bit signed int max (~24.8 days)
    const maxDelay = 2147483647;
    const delay = Math.min(diff, maxDelay);

    const timer = setTimeout(() => {
      this.activeTimers.delete(reminder.id);
      this.deliverReminder(reminder);
    }, delay);

    this.activeTimers.set(reminder.id, timer);
  }

  deliverReminder(reminder: ReminderRecord): void {
    // Prevent duplicate delivery: check current status
    const current = this.repo.getById(reminder.id);
    if (!current || current.status !== "pending") return;

    // Check user preference
    const notifsEnabled = this.repo.getSetting("notifications_enabled", "true") === "true";
    const windowsNotifsEnabled =
      this.repo.getSetting("windows_notifications_enabled", "true") === "true";

    if (!notifsEnabled) {
      this.repo.updateStatus(reminder.id, "dismissed");
      this.repo.logNotification({
        reminderId: reminder.id,
        channel: "in_app",
        title: reminder.title,
        message: reminder.message || undefined,
        status: "skipped",
      });
      return;
    }

    // Deliver Native Windows Notification
    const hasNativeNotif =
      typeof Notification !== "undefined" &&
      typeof Notification.isSupported === "function" &&
      Notification.isSupported();

    if (windowsNotifsEnabled && hasNativeNotif) {
      try {
        const notif = new Notification({
          title: reminder.title,
          body: reminder.message || "You have a planned task or reminder.",
          silent: false,
        });
        notif.show();

        this.repo.logNotification({
          reminderId: reminder.id,
          channel: "native_windows",
          title: reminder.title,
          message: reminder.message || undefined,
          status: "delivered",
        });
      } catch (err) {
        this.repo.logNotification({
          reminderId: reminder.id,
          channel: "native_windows",
          title: reminder.title,
          message: reminder.message || undefined,
          status: "failed",
        });
      }
    }

    // Always log In-App notification
    const inAppLog = this.repo.logNotification({
      reminderId: reminder.id,
      channel: "in_app",
      title: reminder.title,
      message: reminder.message || undefined,
      status: "delivered",
    });

    this.repo.updateStatus(reminder.id, "delivered");

    if (this.onNotificationDelivered) {
      this.onNotificationDelivered(inAppLog);
    }
  }

  listNotifications(limit = 50): NotificationLogRecord[] {
    return this.repo.listNotifications(limit);
  }

  clearNotifications(): void {
    this.repo.clearNotifications();
  }

  getSetting(key: string, defaultValue = ""): string {
    return this.repo.getSetting(key, defaultValue);
  }

  setSetting(key: string, value: string): void {
    this.repo.setSetting(key, value);
  }
}
