import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import type { AnalyticsSummary } from "@shared/types/database";
import { getTodayLocalDateString, extractLocalDate } from "@/lib/dateUtils";

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<"7d" | "30d" | "this_month">("7d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const now = new Date();
      const endStr = getTodayLocalDateString();
      let start = new Date();

      if (range === "7d") {
        start.setDate(now.getDate() - 6);
      } else if (range === "30d") {
        start.setDate(now.getDate() - 29);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const startStr = extractLocalDate(start);

      if (window.electronAPI?.getAnalyticsSummary) {
        const res = await window.electronAPI.getAnalyticsSummary(startStr, endStr);
        setData(res);
      } else {
        setData({
          tasks_completed_count: 8,
          tasks_created_count: 10,
          completion_rate: 80,
          active_projects_count: 2,
          habits_count: 3,
          average_habit_consistency: 75,
          daily_trends: [
            { date: "2026-11-15", completed_count: 1, created_count: 2 },
            { date: "2026-11-16", completed_count: 2, created_count: 1 },
            { date: "2026-11-17", completed_count: 0, created_count: 3 },
            { date: "2026-11-18", completed_count: 3, created_count: 2 },
            { date: "2026-11-19", completed_count: 1, created_count: 1 },
            { date: "2026-11-20", completed_count: 1, created_count: 1 },
          ],
          priority_distribution: [
            { priority: "urgent", count: 2 },
            { priority: "high", count: 4 },
            { priority: "medium", count: 6 },
            { priority: "low", count: 1 },
          ],
          project_progress: [
            {
              id: "p1",
              name: "LifeFlow Desktop",
              color: "#C2410C",
              progress_percent: 65,
              completed_tasks: 13,
              total_tasks: 20,
            },
          ],
        });
      }
    };

    fetchAnalytics();
  }, [range]);

  const maxDailyCount = data?.daily_trends
    ? Math.max(
        1,
        ...data.daily_trends.map((d) =>
          Math.max(d.completed_count, d.created_count)
        )
      )
    : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.analytics") || "Insights & Trends"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Gentle, calm insights on completion velocity and habit consistency.
            </p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center p-1 rounded-full bg-background-elevated border border-[rgba(28,25,23,0.08)] self-start sm:self-auto">
          <button
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              range === "7d"
                ? "bg-white text-text-primary font-semibold shadow-sm font-sora"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              range === "30d"
                ? "bg-white text-text-primary font-semibold shadow-sm font-sora"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange("this_month")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              range === "this_month"
                ? "bg-white text-text-primary font-semibold shadow-sm font-sora"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Completion Rate
            </span>
            <span className="p-2 rounded-xl bg-status-success/10 text-status-success">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold font-sora text-text-primary tabular-nums">
              {data?.completion_rate || 0}%
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">
              of active tasks
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Tasks Completed
            </span>
            <span className="p-2 rounded-xl bg-accent/10 text-accent">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold font-sora text-accent tabular-nums">
              {data?.tasks_completed_count || 0}
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Active Projects
            </span>
            <span className="p-2 rounded-xl bg-background-elevated text-text-secondary">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold font-sora text-text-primary tabular-nums">
              {data?.active_projects_count || 0}
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Habit Consistency
            </span>
            <span className="p-2 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold font-sora text-[#7C3AED] tabular-nums">
              {data?.average_habit_consistency || 0}%
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">streak rate</span>
          </div>
        </div>
      </div>

      {/* Main Trends Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Completion Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-sora text-text-primary">
                  Daily Activity Trends
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tasks finished compared to new items captured.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="text-text-secondary font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-background-elevated border border-[rgba(28,25,23,0.12)]" />
                  <span className="text-text-secondary font-medium">Created</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-[rgba(28,25,23,0.06)]">
              {data?.daily_trends && data.daily_trends.length > 0 ? (
                data.daily_trends.map((item) => {
                  const compHeight = Math.max(
                    6,
                    Math.round((item.completed_count / maxDailyCount) * 160)
                  );
                  const creatHeight = Math.max(
                    6,
                    Math.round((item.created_count / maxDailyCount) * 160)
                  );
                  const shortDate = item.date.substring(5);

                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                    >
                      <div className="w-full flex items-end justify-center gap-1 mb-1">
                        {/* Completed bar */}
                        <div
                          style={{ height: `${compHeight}px` }}
                          className="w-full max-w-[14px] rounded-t-sm bg-accent hover:bg-accent-glow transition-all"
                          title={`${item.date}: ${item.completed_count} completed`}
                        />
                        {/* Created bar */}
                        <div
                          style={{ height: `${creatHeight}px` }}
                          className="w-full max-w-[14px] rounded-t-sm bg-background-elevated border border-[rgba(28,25,23,0.1)] transition-all"
                          title={`${item.date}: ${item.created_count} created`}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted mt-2 font-mono truncate">
                        {shortDate}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
                  No activity data recorded in this range.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority Distribution & Project Breakdown */}
        <div className="space-y-6">
          {/* Priority Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card space-y-4">
            <h3 className="text-sm font-bold font-sora text-text-primary">
              Tasks by Priority
            </h3>
            <div className="space-y-3">
              {data?.priority_distribution.map((item) => {
                const total = data.priority_distribution.reduce(
                  (acc, p) => acc + p.count,
                  0
                );
                const pct =
                  total > 0 ? Math.round((item.count / total) * 100) : 0;
                const colors: Record<string, string> = {
                  urgent: "bg-status-danger",
                  high: "bg-status-danger",
                  medium: "bg-accent",
                  low: "bg-status-success",
                };

                return (
                  <div key={item.priority} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-text-secondary font-medium">
                        {item.priority}
                      </span>
                      <span className="text-text-muted text-[11px] font-mono">
                        {item.count} tasks ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-background-elevated overflow-hidden">
                      <div
                        className={`h-full ${colors[item.priority] || "bg-accent"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Progress */}
          {data?.project_progress && data.project_progress.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card space-y-3">
              <h3 className="text-sm font-bold font-sora text-text-primary">
                Active Projects Progress
              </h3>
              <div className="space-y-2.5">
                {data.project_progress.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-primary truncate max-w-[160px] font-medium">
                        {proj.name}
                      </span>
                      <span className="text-accent font-bold font-sora tabular-nums">
                        {proj.progress_percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-background-elevated overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${proj.progress_percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
