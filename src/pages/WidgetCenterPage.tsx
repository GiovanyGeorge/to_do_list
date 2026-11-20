import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  ExternalLink,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { WidgetType } from "@shared/types/ipc";

interface WidgetItem {
  id: WidgetType;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultDimensions: string;
}

export const WidgetCenterPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState<Record<WidgetType, boolean>>({
    today_tasks: false,
    quick_add: false,
    pomodoro: false,
    habits: false,
  });

  const checkStatus = async () => {
    if (window.electronAPI?.getWidgetStatus) {
      const status = await window.electronAPI.getWidgetStatus();
      setActiveStatus(status);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (type: WidgetType) => {
    if (window.electronAPI) {
      if (activeStatus[type]) {
        await window.electronAPI.closeWidget(type);
      } else {
        await window.electronAPI.openWidget(type);
      }
      checkStatus();
    }
  };

  const widgets: WidgetItem[] = [
    {
      id: "today_tasks",
      title: "Today's Tasks Widget",
      description:
        "A compact floating checklist of tasks planned for today. Toggle completion without opening the full application window.",
      icon: <CheckCircle2 className="w-6 h-6 text-accent" />,
      defaultDimensions: "360 × 480 px",
    },
    {
      id: "quick_add",
      title: "Quick Add Mini Bar",
      description:
        "A lightweight desktop input bar for instantly capturing thoughts and tasks directly into today's schedule from anywhere.",
      icon: <Plus className="w-6 h-6 text-emerald-400" />,
      defaultDimensions: "380 × 260 px",
    },
    {
      id: "pomodoro",
      title: "Focus Pomodoro Timer",
      description:
        "A standalone floating countdown timer with 25-minute focus sprints and 5-minute restorative breaks.",
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      defaultDimensions: "300 × 340 px",
    },
    {
      id: "habits",
      title: "Habit Tracker Widget",
      description:
        "A mini tracker for logging daily habits and viewing your active streak counts while working on other tasks.",
      icon: <Flame className="w-6 h-6 text-purple-400" />,
      defaultDimensions: "360 × 420 px",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.widgets")}
            </h1>
            <p className="text-xs text-text-secondary">
              Independent floating desktop windows that remain accessible alongside your daily workflow
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Available Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((w) => {
          const isOpen = activeStatus[w.id];

          return (
            <div
              key={w.id}
              className="p-5 rounded-2xl bg-background-card border border-border-subtle flex flex-col justify-between space-y-4 hover:border-accent/30 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-background-elevated border border-border-subtle">
                    {w.icon}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isOpen
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-background-elevated text-text-muted border border-border-subtle"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOpen ? "bg-emerald-400 animate-pulse" : "bg-text-muted"
                      }`}
                    />
                    {isOpen ? "Running" : "Inactive"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary tracking-tight">
                    {w.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {w.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  Default size: {w.defaultDimensions}
                </span>

                <Button
                  variant={isOpen ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleToggle(w.id)}
                  leftIcon={isOpen ? <X className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                >
                  {isOpen ? "Close Window" : "Launch Widget"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
