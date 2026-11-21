import { describe, it, expect } from "vitest";
import {
  formatLocalDate,
  getTodayLocalDateString,
  extractLocalDate,
  extractLocalTime,
  createDateTimeISO,
  formatDateOnlyDisplay,
  formatTimeDisplay,
  isSameLocalDay,
} from "../src/lib/dateUtils";

describe("Calendar Date & Time Synchronization Engine", () => {
  describe("Date-only handling & extraction", () => {
    it("formats year, month, day to strict YYYY-MM-DD", () => {
      expect(formatLocalDate(2026, 11, 21)).toBe("2026-11-21");
      expect(formatLocalDate(2026, 1, 5)).toBe("2026-01-05");
      expect(formatLocalDate(2028, 2, 29)).toBe("2028-02-29"); // Leap day
    });

    it("returns today local date as YYYY-MM-DD without UTC shift", () => {
      const todayStr = getTodayLocalDateString();
      const now = new Date();
      const expected = formatLocalDate(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      expect(todayStr).toBe(expected);
    });

    it("extractLocalDate returns pure YYYY-MM-DD directly without passing through Date parser", () => {
      // Critical check: passing "2026-11-21" must return "2026-11-21" in ANY timezone
      expect(extractLocalDate("2026-11-21")).toBe("2026-11-21");
      expect(extractLocalDate("2026-11-22")).toBe("2026-11-22");
      expect(extractLocalDate("2028-02-29")).toBe("2028-02-29");
    });

    it("extractLocalDate safely converts ISO timestamp to local calendar date", () => {
      // Local noon date
      const localDate = new Date(2026, 10, 21, 14, 45, 0); // Month is 0-indexed: 10 = Nov
      const iso = localDate.toISOString();
      expect(extractLocalDate(iso)).toBe("2026-11-21");
    });

    it("handles null, undefined and invalid dates gracefully", () => {
      expect(extractLocalDate(null)).toBe("");
      expect(extractLocalDate(undefined)).toBe("");
      expect(extractLocalDate("")).toBe("");
      expect(extractLocalDate("invalid-date")).toBe("");
    });
  });

  describe("Time preservation and ISO creation", () => {
    it("extracts local HH:MM correctly", () => {
      const localDate = new Date(2026, 10, 21, 14, 45, 0); // 2:45 PM
      expect(extractLocalTime(localDate)).toBe("14:45");
      expect(extractLocalTime(localDate.toISOString())).toBe("14:45");
    });

    it("creates ISO from local date and time and round-trips without shifting", () => {
      // 2:45 PM on Nov 21, 2026
      const iso = createDateTimeISO("2026-11-21", "14:45");
      expect(extractLocalDate(iso)).toBe("2026-11-21");
      expect(extractLocalTime(iso)).toBe("14:45");
    });

    it("preserves reminder time: 2:45 PM remains 2:45 PM", () => {
      const reminderIso = createDateTimeISO("2026-11-21", "14:45");
      const d = new Date(reminderIso);
      expect(d.getHours()).toBe(14);
      expect(d.getMinutes()).toBe(45);

      const formatted = formatTimeDisplay(reminderIso, "en-US");
      expect(formatted).toMatch(/2:45\s*PM/);
    });

    it("preserves morning time: 9:45 AM remains 9:45 AM", () => {
      const reminderIso = createDateTimeISO("2026-11-21", "09:45");
      const d = new Date(reminderIso);
      expect(d.getHours()).toBe(9);
      expect(d.getMinutes()).toBe(45);

      const formatted = formatTimeDisplay(reminderIso, "en-US");
      expect(formatted).toMatch(/9:45\s*AM/);
    });
  });

  describe("November 21 vs November 22 Synchronization Scenario", () => {
    it("guarantees selected date string Nov 21 always formats to Saturday Nov 21", () => {
      const selectedDateStr = "2026-11-21";

      const displayEn = formatDateOnlyDisplay(selectedDateStr, "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      // Must strictly be Sat, Nov 21, never Sun, Nov 22
      expect(displayEn).toContain("Sat");
      expect(displayEn).toContain("Nov");
      expect(displayEn).toContain("21");
      expect(displayEn).not.toContain("22");
      expect(displayEn).not.toContain("Sun");

      const displayAr = formatDateOnlyDisplay(selectedDateStr, "ar-EG", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      // Arabic Saturday is السبت
      expect(displayAr).toContain("السبت");
    });

    it("correctly separates tasks between Nov 20, Nov 21, Nov 22, and Nov 23", () => {
      const tasks = [
        {
          id: "task-1",
          title: "project DSP",
          due_at: createDateTimeISO("2026-11-23", "15:00"), // Nov 23 3:00 PM
          start_at: null,
        },
        {
          id: "task-2",
          title: "DSP",
          due_at: createDateTimeISO("2026-11-21", "10:00"), // Nov 21 10:00 AM
          start_at: "2026-11-21", // Planned for Nov 21
        },
        {
          id: "task-3",
          title: "Friday Prep",
          due_at: createDateTimeISO("2026-11-20", "20:00"), // Nov 20 8:00 PM
          start_at: "2026-11-20",
        },
      ];

      // Nov 21 filter
      const nov21Tasks = tasks.filter(
        (t) =>
          extractLocalDate(t.start_at) === "2026-11-21" ||
          extractLocalDate(t.due_at) === "2026-11-21"
      );
      expect(nov21Tasks).toHaveLength(1);
      expect(nov21Tasks[0].title).toBe("DSP");

      // Nov 23 filter
      const nov23Tasks = tasks.filter(
        (t) =>
          extractLocalDate(t.start_at) === "2026-11-23" ||
          extractLocalDate(t.due_at) === "2026-11-23"
      );
      expect(nov23Tasks).toHaveLength(1);
      expect(nov23Tasks[0].title).toBe("project DSP");

      // Nov 20 filter
      const nov20Tasks = tasks.filter(
        (t) =>
          extractLocalDate(t.start_at) === "2026-11-20" ||
          extractLocalDate(t.due_at) === "2026-11-20"
      );
      expect(nov20Tasks).toHaveLength(1);
      expect(nov20Tasks[0].title).toBe("Friday Prep");

      // Nov 22 has NO tasks
      const nov22Tasks = tasks.filter(
        (t) =>
          extractLocalDate(t.start_at) === "2026-11-22" ||
          extractLocalDate(t.due_at) === "2026-11-22"
      );
      expect(nov22Tasks).toHaveLength(0);
    });
  });

  describe("Calendar Grid & Boundary Edge Cases", () => {
    it("handles month transition from October to November correctly", () => {
      const oct31 = "2026-10-31";
      const nov1 = "2026-11-01";
      expect(extractLocalDate(oct31)).toBe("2026-10-31");
      expect(extractLocalDate(nov1)).toBe("2026-11-01");
      expect(isSameLocalDay(oct31, nov1)).toBe(false);
    });

    it("handles year transition from December 31 to January 1 correctly", () => {
      const dec31 = "2026-12-31";
      const jan1 = "2027-01-01";
      expect(extractLocalDate(dec31)).toBe("2026-12-31");
      expect(extractLocalDate(jan1)).toBe("2027-01-01");
      expect(isSameLocalDay(dec31, jan1)).toBe(false);
    });

    it("handles leap year February 29 correctly", () => {
      const leapDay = "2028-02-29";
      const march1 = "2028-03-01";
      expect(extractLocalDate(leapDay)).toBe("2028-02-29");
      expect(extractLocalDate(march1)).toBe("2028-03-01");

      const display = formatDateOnlyDisplay(leapDay, "en-US", {
        month: "short",
        day: "numeric",
      });
      expect(display).toContain("Feb");
      expect(display).toContain("29");
    });

    it("computes Monday-first week index correctly", () => {
      // In November 2026: Nov 1 is Sunday.
      // JS Sunday getDay() is 0.
      // Monday-first formula: (dayOfWeek + 6) % 7
      // For Sunday (0): (0 + 6) % 7 = 6 (7th column, index 6).
      // For Monday (1): (1 + 6) % 7 = 0 (1st column, index 0).
      // For Saturday Nov 21 (6): (6 + 6) % 7 = 5 (6th column, index 5).
      const nov1 = new Date(2026, 10, 1);
      const nov1Col = (nov1.getDay() + 6) % 7;
      expect(nov1Col).toBe(6); // Sunday is column index 6

      const nov2 = new Date(2026, 10, 2);
      const nov2Col = (nov2.getDay() + 6) % 7;
      expect(nov2Col).toBe(0); // Monday is column index 0

      const nov21 = new Date(2026, 10, 21);
      const nov21Col = (nov21.getDay() + 6) % 7;
      expect(nov21Col).toBe(5); // Saturday is column index 5
    });
  });
});
