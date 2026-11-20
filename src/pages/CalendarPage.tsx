import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/Button";

export const CalendarPage: React.FC = () => {
  const {
    tasks,
    fetchTasks,
    toggleTask,
    setSelectedTaskId,
    toggleDayPlan,
    createTask,
    deleteTask,
  } = useTaskStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Month grid calculation (Monday as start of week, per Section 9)
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const selectedDateStr = selectedDate.toISOString().substring(0, 10);
  const selectedDateTasks = tasks.filter(
    (t) =>
      (t.due_at && t.due_at.substring(0, 10) === selectedDateStr) ||
      (t.start_at && t.start_at.substring(0, 10) === selectedDateStr)
  );

  const monthName = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight capitalize">
              {monthName}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Review deadlines and schedule tasks across dates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-background-elevated hover:bg-background-elevated/80 text-text-primary border border-[rgba(28,25,23,0.08)] transition-all"
          >
            Today
          </button>
          <div className="flex items-center border border-[rgba(28,25,23,0.08)] rounded-full bg-background-elevated p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:text-text-primary text-text-secondary hover:bg-white transition-all"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:text-text-primary text-text-secondary hover:bg-white transition-all"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid + Selected Day Task Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayHeaders.map((dh) => (
              <div
                key={dh}
                className="text-xs font-bold font-sora text-text-muted py-2"
              >
                {dh}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Days from previous month */}
            {Array.from({ length: startOffset }).map((_, idx) => {
              const d = daysInPrevMonth - startOffset + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="h-20 sm:h-24 p-2 rounded-xl border border-[rgba(28,25,23,0.04)] bg-background-elevated/20 opacity-30 select-none"
                >
                  <span className="text-xs font-mono text-text-muted">{d}</span>
                </div>
              );
            })}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const cellDate = new Date(year, month, dayNum);
              const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = cellDateStr === selectedDateStr;
              const isToday =
                cellDateStr === new Date().toISOString().substring(0, 10);

              const dayTasks = tasks.filter(
                (t) =>
                  (t.due_at && t.due_at.substring(0, 10) === cellDateStr) ||
                  (t.start_at && t.start_at.substring(0, 10) === cellDateStr)
              );

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`h-20 sm:h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? "bg-accent/10 border-accent shadow-sm ring-1 ring-accent"
                      : isToday
                      ? "bg-white border-accent shadow-sm"
                      : "bg-white border-[rgba(28,25,23,0.08)] hover:bg-[#FAF7F2] hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-sora font-semibold tabular-nums w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-accent text-accent-light"
                          : isSelected
                          ? "text-accent font-bold"
                          : "text-text-primary"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/15 text-accent font-bold font-mono">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task peek dots/indicators */}
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] truncate px-1 py-0.5 rounded bg-background-elevated text-text-secondary font-medium"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-text-muted font-mono">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Pane */}
        <div className="p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,25,23,0.08)] mb-4">
              <div>
                <h3 className="text-base font-bold font-sora text-text-primary">
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(selectedDate)}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedDateTasks.length}{" "}
                  {selectedDateTasks.length === 1 ? "task" : "tasks"} planned
                </p>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  createTask({
                    title: "New scheduled task",
                    due_at: selectedDate.toISOString(),
                    status: "todo",
                    priority: "medium",
                  });
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Task
              </Button>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <div className="py-16 text-center text-xs text-text-secondary rounded-xl bg-background-elevated/40 border border-dashed border-[rgba(28,25,23,0.12)]">
                  No tasks due or planned for this day.
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onSelect={setSelectedTaskId}
                    onToggleMyDay={() => toggleDayPlan(task.id, selectedDateStr)}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
