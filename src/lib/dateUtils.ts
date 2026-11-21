/**
 * src/lib/dateUtils.ts
 *
 * Strict, robust date and time synchronization utilities for LifeFlow.
 *
 * Principles:
 * 1. Date-only values (planned day, calendar day, habit log date, YYYY-MM-DD):
 *    - Never pass raw "YYYY-MM-DD" into new Date("YYYY-MM-DD") because JS parses it as UTC midnight,
 *      causing off-by-one shifts in negative or positive timezones.
 *    - Use explicit year, month, day extraction and formatting in the user's local timezone.
 *
 * 2. Date and time values (due_at, reminder_at, timestamps):
 *    - Store as ISO 8601 strings in UTC representing the exact intended instant.
 *    - Display in the user's local timezone.
 *    - Extract local dates using local getters (getFullYear, getMonth, getDate).
 */

/**
 * Formats year, month (1-12), and day into a strict YYYY-MM-DD string.
 */
export function formatLocalDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Returns today's calendar date in the user's local timezone as "YYYY-MM-DD".
 */
export function getTodayLocalDateString(): string {
  const now = new Date();
  return formatLocalDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Safely extracts "YYYY-MM-DD" in local time from any date-only string, ISO timestamp, or Date object.
 * If the input is already a pure "YYYY-MM-DD" string, it is returned directly to prevent any timezone shifts.
 */
export function extractLocalDate(dateTimeInput?: string | Date | null): string {
  if (!dateTimeInput) return "";

  if (typeof dateTimeInput === "string") {
    const trimmed = dateTimeInput.trim();
    // If it's already a clean date-only string: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // If it starts with YYYY-MM-DD and contains a local-format separator without Z
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return "";
    return formatLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  if (isNaN(dateTimeInput.getTime())) return "";
  return formatLocalDate(dateTimeInput.getFullYear(), dateTimeInput.getMonth() + 1, dateTimeInput.getDate());
}

/**
 * Safely extracts local "HH:MM" from any ISO timestamp or Date object.
 * Returns "19:00" as a fallback if not parseable.
 */
export function extractLocalTime(dateTimeInput?: string | Date | null, fallback = "19:00"): string {
  if (!dateTimeInput) return fallback;
  const d = typeof dateTimeInput === "string" ? new Date(dateTimeInput) : dateTimeInput;
  if (isNaN(d.getTime())) return fallback;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Creates an exact ISO 8601 UTC timestamp from local date "YYYY-MM-DD" and local time "HH:MM".
 * Guaranteed to reflect the user's local timezone without double-conversion.
 */
export function createDateTimeISO(dateStr: string, timeStr = "19:00"): string {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (!dateMatch) {
    const fallback = new Date();
    return fallback.toISOString();
  }

  const y = parseInt(dateMatch[1], 10);
  const m = parseInt(dateMatch[2], 10);
  const d = parseInt(dateMatch[3], 10);

  const timeMatch = /^(\d{1,2}):(\d{1,2})/.exec((timeStr || "19:00").trim());
  const hh = timeMatch ? parseInt(timeMatch[1], 10) : 19;
  const mm = timeMatch ? parseInt(timeMatch[2], 10) : 0;

  // Local date construction: Year, MonthIndex (0-11), Day, Hours, Minutes, Seconds, Milliseconds
  const localDate = new Date(y, m - 1, d, hh, mm, 0, 0);
  return localDate.toISOString();
}

/**
 * Formats a date-only "YYYY-MM-DD" string for human display (e.g., "Sat, Nov 21" or "السبت، ٢١ نوفمبر").
 * Uses noon (12:00:00) local time to prevent any Daylight Saving Time boundary shifts.
 */
export function formatDateOnlyDisplay(
  dateStr: string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  }
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (!match) return dateStr;

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  const localNoon = new Date(y, m - 1, d, 12, 0, 0);
  return new Intl.DateTimeFormat(locale || undefined, options).format(localNoon);
}

/**
 * Formats an ISO datetime string into human readable local time (e.g., "2:45 PM" / "٠٢:٤٥ م").
 */
export function formatTimeDisplay(
  dateTimeInput?: string | Date | null,
  locale?: string,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }
): string | null {
  if (!dateTimeInput) return null;
  const d = typeof dateTimeInput === "string" ? new Date(dateTimeInput) : dateTimeInput;
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale || undefined, options).format(d);
}

/**
 * Returns true if two date representations resolve to the exact same calendar day in local time.
 */
export function isSameLocalDay(
  date1?: string | Date | null,
  date2?: string | Date | null
): boolean {
  if (!date1 || !date2) return false;
  return extractLocalDate(date1) === extractLocalDate(date2);
}
