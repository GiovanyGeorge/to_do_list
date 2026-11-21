import { BrowserWindow } from "electron";
import path from "node:path";
import fs from "node:fs";
import { ReminderRepository } from "../../database/repositories/reminderRepository";

function getWidgetIconPath(preloadPath: string): string | undefined {
  const candidates = [
    path.join(process.resourcesPath || "", "resources", "icon.ico"),
    path.join(process.resourcesPath || "", "icon.ico"),
    path.join(path.dirname(preloadPath), "..", "resources", "icon.ico"),
    path.join(process.cwd(), "resources", "icon.ico"),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return undefined;
}

export type WidgetType = "today_tasks" | "quick_add" | "pomodoro" | "habits";

interface WidgetConfig {
  title: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}

const WIDGET_CONFIGS: Record<WidgetType, WidgetConfig> = {
  today_tasks: {
    title: "LifeFlow — Today's Tasks",
    width: 360,
    height: 480,
    minWidth: 300,
    minHeight: 350,
  },
  quick_add: {
    title: "LifeFlow — Quick Add",
    width: 380,
    height: 260,
    minWidth: 320,
    minHeight: 220,
  },
  pomodoro: {
    title: "LifeFlow — Pomodoro Timer",
    width: 300,
    height: 340,
    minWidth: 260,
    minHeight: 300,
  },
  habits: {
    title: "LifeFlow — Habit Tracker",
    width: 360,
    height: 420,
    minWidth: 300,
    minHeight: 320,
  },
};

export class WidgetWindowManager {
  private activeWidgets = new Map<WidgetType, BrowserWindow>();

  constructor(
    private preloadPath: string,
    private devServerUrl?: string,
    private rendererDist?: string,
    private reminderRepo?: ReminderRepository
  ) {}

  openWidget(type: WidgetType): void {
    // If already open, bring to focus
    if (this.activeWidgets.has(type)) {
      const existing = this.activeWidgets.get(type)!;
      if (!existing.isDestroyed()) {
        existing.show();
        existing.focus();
        return;
      } else {
        this.activeWidgets.delete(type);
      }
    }

    const config = WIDGET_CONFIGS[type];
    const savedPos = this.loadPosition(type);
    const appIconPath = getWidgetIconPath(this.preloadPath);

    const win = new BrowserWindow({
      title: config.title,
      width: config.width,
      height: config.height,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      x: savedPos?.x,
      y: savedPos?.y,
      backgroundColor: "#111318",
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: false,
      icon: appIconPath,
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    win.on("close", () => {
      if (!win.isDestroyed()) {
        const bounds = win.getBounds();
        this.savePosition(type, bounds.x, bounds.y);
      }
      this.activeWidgets.delete(type);
    });

    // Load widget view
    const widgetQuery = `?widget=${type}`;
    if (this.devServerUrl) {
      win.loadURL(`${this.devServerUrl}${widgetQuery}`);
    } else if (this.rendererDist) {
      win.loadFile(path.join(this.rendererDist, "index.html"), {
        query: { widget: type },
      });
    }

    this.activeWidgets.set(type, win);
  }

  closeWidget(type: WidgetType): void {
    if (this.activeWidgets.has(type)) {
      const win = this.activeWidgets.get(type)!;
      if (!win.isDestroyed()) {
        win.close();
      }
      this.activeWidgets.delete(type);
    }
  }

  isWidgetOpen(type: WidgetType): boolean {
    const win = this.activeWidgets.get(type);
    return !!win && !win.isDestroyed();
  }

  getActiveWidgets(): Record<WidgetType, boolean> {
    return {
      today_tasks: this.isWidgetOpen("today_tasks"),
      quick_add: this.isWidgetOpen("quick_add"),
      pomodoro: this.isWidgetOpen("pomodoro"),
      habits: this.isWidgetOpen("habits"),
    };
  }

  setAlwaysOnTop(type: WidgetType, flag: boolean): void {
    const win = this.activeWidgets.get(type);
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(flag);
    }
  }

  private savePosition(type: WidgetType, x: number, y: number): void {
    if (this.reminderRepo) {
      this.reminderRepo.setSetting(`widget_pos_${type}`, JSON.stringify({ x, y }));
    }
  }

  private loadPosition(type: WidgetType): { x: number; y: number } | null {
    if (!this.reminderRepo) return null;
    const raw = this.reminderRepo.getSetting(`widget_pos_${type}`, "");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
