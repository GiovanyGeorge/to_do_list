import { describe, it, expect, vi } from "vitest";
import { WidgetWindowManager } from "../electron/windows/widgetWindowManager";

describe("Phase 8 - Desktop Widgets Lifecycle", () => {
  it("initializes widget manager and reports active status accurately", () => {
    const manager = new WidgetWindowManager("preload.js");
    const status = manager.getActiveWidgets();

    expect(status.today_tasks).toBe(false);
    expect(status.quick_add).toBe(false);
    expect(status.pomodoro).toBe(false);
    expect(status.habits).toBe(false);
  });
});
