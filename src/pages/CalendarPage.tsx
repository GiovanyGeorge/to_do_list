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
  const { tasks, fetchTasks, toggleTask, setSelectedTaskId, toggleDayPlan, createTask } =
    useTaskStore();

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

  // Month grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedDateStr = selectedDate.toISOString().substring(0, 10);
  const selectedDateTasks = tasks.filter(
    (t) => t.due_at && t.due_at.substring(0, 10) === selectedDateStr
  );

  const monthName = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight capitalize">
              {monthName}
            </h1>
            <p className="text-xs text-text-secondary">
              Review deadlines and schedule tasks across dates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="xs" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border border-border-subtle rounded-lg bg-background-elevated">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:text-text-primary text-text-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:text-text-primary text-text-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid + Selected Day Task Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View Grid */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-background-card border border-border-subtle">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayHeaders.map((dh) => (
              <div
                key={dh}
                className="text-xs font-semibold text-text-muted py-2"
              >
                {dh}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 p-1 rounded-xl opacity-20" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const cellDate = new Date(year, month, dayNum);
              const cellDateStr = cellDate.toISOString().substring(0, 10);
              const isSelected = cellDateStr === selectedDateStr;
              const isToday =
                cellDateStr === new Date().toISOString().substring(0, 10);

              const dayTasks = tasks.filter(
                (t) => t.due_at && t.due_at.substring(0, 10) === cellDateStr
              );

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`h-20 sm:h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-accent/10 border-accent text-accent"
                      : isToday
                      ? "bg-background-elevated/80 border-accent/40"
                      : "bg-background-elevated/30 border-border-subtle/50 hover:bg-background-elevated/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "text-accent font-bold" : "text-text-primary"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-semibold">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task peek dots/indicators */}
                  <div className="space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] truncate px-1 rounded bg-background-card/90 text-text-secondary"
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-text-muted">
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
        <div className="p-5 rounded-2xl bg-background-card border border-border-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {new Intl.DateTimeFormat(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(selectedDate)}
              </h3>
              <p className="text-xs text-text-secondary">
                {selectedDateTasks.length} scheduled tasks
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

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                No tasks due on this date.
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onSelect={setSelectedTaskId}
                  onToggleMyDay={() => toggleDayPlan(task.id, selectedDateStr)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
