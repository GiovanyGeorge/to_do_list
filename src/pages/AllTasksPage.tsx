import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  List,
  Columns,
  Search,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { TaskStatus } from "@shared/types/database";

export const AllTasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, fetchTasks, toggleTask, setSelectedTaskId, toggleDayPlan } =
    useTaskStore();

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (search.trim()) {
      const matchTitle = task.title.toLowerCase().includes(search.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

    return true;
  });

  const kanbanColumns: { id: TaskStatus; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.allTasks")}
            </h1>
            <p className="text-xs text-text-secondary">
              {filteredTasks.length} tasks matching current filters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Kanban toggle */}
          <div className="flex items-center p-1 rounded-lg bg-background-elevated border border-border-subtle">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-background font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === "kanban"
                  ? "bg-accent text-background font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-background-card/60 border border-border-subtle">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks..."
            className="w-full h-9 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-lg bg-background-elevated text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-background-elevated text-xs text-text-secondary border border-border-subtle focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="inbox">Inbox</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 rounded-lg bg-background-elevated text-xs text-text-secondary border border-border-subtle focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* View Content */}
      {viewMode === "list" ? (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-secondary rounded-2xl bg-background-card/50 border border-border-subtle">
              No tasks match your filters.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onSelect={setSelectedTaskId}
                onToggleMyDay={() => toggleDayPlan(task.id, todayStr)}
              />
            ))
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col p-4 rounded-2xl bg-background-card border border-border-subtle min-h-[400px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                  <h3 className="text-xs font-semibold text-text-primary tracking-wide">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-background-elevated text-text-secondary">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onSelect={setSelectedTaskId}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
