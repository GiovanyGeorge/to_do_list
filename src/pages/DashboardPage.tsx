import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Sparkles, FolderKanban } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting.morning");
    if (hour < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  const currentDateFormatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-background-card border border-border-subtle shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-xs text-text-secondary mt-1">{currentDateFormatted}</p>
          <p className="text-sm text-text-muted mt-2">{t("dashboard.summary")}</p>
        </div>

        <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-background-elevated/50 border border-border-subtle shrink-0">
          <div>
            <div className="text-xs text-text-secondary">{t("dashboard.progress")}</div>
            <div className="text-xl font-bold text-accent mt-0.5">0%</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-border-subtle flex items-center justify-center text-accent">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Tasks */}
        <div className="p-5 rounded-xl bg-background-card border border-border-subtle flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">{t("dashboard.todayTasks")}</span>
            <span className="p-2 rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">0</span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">tasks</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="p-5 rounded-xl bg-background-card border border-border-subtle flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">{t("dashboard.overdueTasks")}</span>
            <span className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">0</span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">pending</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="p-5 rounded-xl bg-background-card border border-border-subtle flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">{t("dashboard.activeProjects")}</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">0</span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">active</span>
          </div>
        </div>

        {/* Today's Habits */}
        <div className="p-5 rounded-xl bg-background-card border border-border-subtle flex flex-col justify-between hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">{t("dashboard.habitsToday")}</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">0</span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">logged</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Today's Focus & Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-background-card border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">{t("dashboard.todayTasks")}</h2>
            <Clock className="w-4 h-4 text-text-secondary" />
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-text-secondary max-w-sm">
              {t("dashboard.noTasks")}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-background-card border border-border-subtle">
          <h2 className="text-base font-semibold text-text-primary mb-4">{t("dashboard.weeklyProductivity")}</h2>
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm text-text-secondary">
              Productivity tracking will populate as you complete daily tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
