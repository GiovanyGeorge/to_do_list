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

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<"7d" | "30d" | "this_month">("7d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const now = new Date();
      const endStr = now.toISOString().substring(0, 10);
      let start = new Date();

      if (range === "7d") {
        start.setDate(now.getDate() - 6);
      } else if (range === "30d") {
        start.setDate(now.getDate() - 29);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const startStr = start.toISOString().substring(0, 10);

      if (window.electronAPI?.getAnalyticsSummary) {
        const res = await window.electronAPI.getAnalyticsSummary(startStr, endStr);
        setData(res);
      } else {
        // Mock fallback for isolated preview
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
              color: "#E99A43",
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
    ? Math.max(1, ...data.daily_trends.map((d) => Math.max(d.completed_count, d.created_count)))
    : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.analytics")}
            </h1>
            <p className="text-xs text-text-secondary">
              Productivity trends, completion velocity, and habit consistency
            </p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center p-1 rounded-xl bg-background-elevated border border-border-subtle self-start sm:self-auto">
          <button
            onClick={() => setRange("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              range === "7d"
                ? "bg-accent text-background font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              range === "30d"
                ? "bg-accent text-background font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange("this_month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              range === "this_month"
                ? "bg-accent text-background font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-background-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Completion Rate</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">
              {data?.completion_rate || 0}%
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">of created tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-background-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Tasks Completed</span>
            <span className="p-2 rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">
              {data?.tasks_completed_count || 0}
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-background-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Active Projects</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">
              {data?.active_projects_count || 0}
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-background-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Habit Consistency</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-text-primary">
              {data?.average_habit_consistency || 0}%
            </span>
            <span className="text-xs text-text-muted ml-2 rtl:mr-2">in range</span>
          </div>
        </div>
      </div>

      {/* Main Trends Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Completion Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-background-card border border-border-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Daily Completion Trends
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tasks finished compared to new tasks captured
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-accent" />
                  <span className="text-text-secondary">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-background-elevated border border-border-subtle" />
                  <span className="text-text-secondary">Created</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-border-subtle/50">
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
                          className="w-full max-w-[14px] rounded-t-sm bg-accent transition-all group-hover:brightness-110"
                          title={`${item.date}: ${item.completed_count} completed`}
                        />
                        {/* Created bar */}
                        <div
                          style={{ height: `${creatHeight}px` }}
                          className="w-full max-w-[14px] rounded-t-sm bg-background-elevated border border-border-subtle transition-all"
                          title={`${item.date}: ${item.created_count} created`}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted mt-2 rotate-0 truncate">
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
          <div className="p-6 rounded-2xl bg-background-card border border-border-subtle space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">
              Tasks by Priority
            </h3>
            <div className="space-y-3">
              {data?.priority_distribution.map((item) => {
                const total = data.priority_distribution.reduce((acc, p) => acc + p.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const colors: Record<string, string> = {
                  urgent: "bg-red-500",
                  high: "bg-amber-500",
                  medium: "bg-accent",
                  low: "bg-gray-500",
                };

                return (
                  <div key={item.priority} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-text-secondary font-medium">
                        {item.priority}
                      </span>
                      <span className="text-text-muted text-[11px]">
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
            <div className="p-6 rounded-2xl bg-background-card border border-border-subtle space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">
                Active Projects Progress
              </h3>
              <div className="space-y-2.5">
                {data.project_progress.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-primary truncate max-w-[160px]">
                        {proj.name}
                      </span>
                      <span className="text-accent font-semibold">
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
