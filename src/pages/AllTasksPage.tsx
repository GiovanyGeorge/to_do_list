import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  List,
  Columns,
  Search,
  Filter,
} from "lucide-react";
import { Reorder } from "motion/react";
import { useTaskStore } from "@/store/useTaskStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { TaskStatus, TaskWithDetails } from "@shared/types/database";
import { getTodayLocalDateString } from "@/lib/dateUtils";

export const AllTasksPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    tasks,
    fetchTasks,
    toggleTask,
    setSelectedTaskId,
    toggleDayPlan,
    deleteTask,
    reorderTasks,
  } = useTaskStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const todayStr = getTodayLocalDateString();

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [fetchTasks, fetchCategories]);

  const filteredTasks = tasks.filter((task) => {
    if (search.trim()) {
      const matchTitle = task.title.toLowerCase().includes(search.toLowerCase());
      const matchDesc = task.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }

    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (categoryFilter !== "all") {
      if (categoryFilter === "none" && task.category_id) return false;
      if (categoryFilter !== "none" && task.category_id !== categoryFilter) return false;
    }

    return true;
  });

  const isFiltered =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all";

  const handleReorder = (newOrderedTasks: TaskWithDetails[]) => {
    reorderTasks(newOrderedTasks.map((t) => t.id));
  };

  const kanbanColumns: { id: TaskStatus; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.allTasks")}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}{" "}
              {isFiltered ? "matching current filters" : "total"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Kanban toggle */}
          <div className="flex items-center p-1 rounded-full bg-background-elevated border border-[rgba(28,25,23,0.08)]">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white text-text-primary font-semibold shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-text-primary font-semibold shadow-sm"
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
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-xl bg-background-elevated/60 text-xs text-text-primary placeholder:text-text-muted border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-text-muted" />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background-elevated/60 text-xs text-text-secondary border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent"
          >
            <option value="all">All Categories</option>
            <option value="none">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background-elevated/60 text-xs text-text-secondary border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-background-elevated/60 text-xs text-text-secondary border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "list" ? (
        <div>
          {filteredTasks.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
              <CheckSquare className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-text-primary">No tasks found</p>
              <p className="text-xs text-text-secondary mt-1">
                {isFiltered
                  ? "Try resetting your search or filter options."
                  : "Start by adding a task to organize your day."}
              </p>
            </div>
          ) : isFiltered ? (
            // Non-reorderable while filtered to prevent fighting the filter
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onSelect={setSelectedTaskId}
                  onToggleMyDay={() => toggleDayPlan(task.id, todayStr)}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          ) : (
            // Full drag-and-drop manual reordering
            <Reorder.Group
              axis="y"
              values={filteredTasks}
              onReorder={handleReorder}
              className="space-y-2.5"
            >
              {filteredTasks.map((task) => (
                <Reorder.Item key={task.id} value={task}>
                  <TaskItem
                    task={task}
                    onToggle={toggleTask}
                    onSelect={setSelectedTaskId}
                    onToggleMyDay={() => toggleDayPlan(task.id, todayStr)}
                    onDelete={deleteTask}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col p-4 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card min-h-[460px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(28,25,23,0.08)]">
                  <h3 className="text-xs font-bold font-sora text-text-primary uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-background-elevated text-text-secondary">
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
                      onDelete={deleteTask}
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
