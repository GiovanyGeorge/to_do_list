import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Sparkles,
  GripVertical,
  ListTree,
  Bell,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useSoundManager } from "@/hooks/useSoundManager";
import { useMotion } from "@/hooks/useMotion";
import type { TaskWithDetails, Priority } from "@shared/types/database";

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    fetchTasks,
    toggleTask,
    deleteTask,
    createTask,
    setSelectedTaskId,
    reorderTasks,
    toggleSubtask,
  } = useTaskStore();
  const { playSound } = useSoundManager();
  const { enabled: motionEnabled } = useMotion();

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"ready" | "focusing" | "paused">("ready");

  // Inline Add Task Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newTime, setNewTime] = useState("19:00");
  const [newReminder, setNewReminder] = useState<"none" | "at_time" | "5m" | "15m" | "30m" | "1h" | "custom">("15m");
  const [newCustomReminder, setNewCustomReminder] = useState("");

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Focus Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setTimerMode("focusing");
    playSound("navigation");
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    setTimerMode("paused");
    playSound("navigation");
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerMode("ready");
    playSound("navigation");
  };

  const handleEndSession = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerMode("ready");
    playSound("success");
  };

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  // Today's tasks (in my day or scheduled for today)
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.is_in_my_day) return true;
      if (t.due_at && t.due_at.substring(0, 10) === todayStr) return true;
      return false;
    });
  }, [tasks, todayStr]);

  const completedToday = todayTasks.filter((t) => t.status === "done").length;
  const totalToday = todayTasks.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Inline Task Creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Parse Due Time (HH:MM)
    const timeParts = newTime.includes(":") ? newTime.split(":") : ["19", "00"];
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    const dueDateTime = new Date(`${todayStr}T00:00:00`);
    dueDateTime.setHours(hours, minutes, 0, 0);
    const dueAtISO = !isNaN(dueDateTime.getTime()) ? dueDateTime.toISOString() : `${todayStr}T19:00:00Z`;

    // Compute Reminder Time
    let reminderAtISO: string | undefined = undefined;
    if (newReminder === "at_time") {
      reminderAtISO = dueAtISO;
    } else if (newReminder === "5m" && !isNaN(dueDateTime.getTime())) {
      reminderAtISO = new Date(dueDateTime.getTime() - 5 * 60 * 1000).toISOString();
    } else if (newReminder === "15m" && !isNaN(dueDateTime.getTime())) {
      reminderAtISO = new Date(dueDateTime.getTime() - 15 * 60 * 1000).toISOString();
    } else if (newReminder === "30m" && !isNaN(dueDateTime.getTime())) {
      reminderAtISO = new Date(dueDateTime.getTime() - 30 * 60 * 1000).toISOString();
    } else if (newReminder === "1h" && !isNaN(dueDateTime.getTime())) {
      reminderAtISO = new Date(dueDateTime.getTime() - 60 * 60 * 1000).toISOString();
    } else if (newReminder === "custom" && newCustomReminder) {
      const cParts = newCustomReminder.split(":");
      const cHours = parseInt(cParts[0], 10) || 0;
      const cMinutes = parseInt(cParts[1], 10) || 0;
      const cDate = new Date(`${todayStr}T00:00:00`);
      cDate.setHours(cHours, cMinutes, 0, 0);
      if (!isNaN(cDate.getTime())) {
        reminderAtISO = cDate.toISOString();
      }
    }

    await createTask({
      title: newTitle.trim(),
      priority: newPriority,
      status: "todo",
      start_at: `${todayStr}T00:00:00Z`,
      due_at: dueAtISO,
      reminder_at: reminderAtISO,
      plan_date: todayStr,
    });

    setNewTitle("");
    setNewPriority("medium");
    setIsAddFormOpen(false);
    playSound("task_create");
  };

  const handleToggle = async (task: TaskWithDetails) => {
    await toggleTask(task.id);
    if (task.status !== "done") {
      playSound("task_complete");
    } else {
      playSound("navigation");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteTask(id);
    playSound("delete");
  };

  const handleReorderTodayTasks = (newOrdered: TaskWithDetails[]) => {
    reorderTasks(newOrdered.map((t) => t.id));
  };

  // Calendar logic
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDay = new Date(year, month, 1).getDay();
  // Monday as 0:
  const startOffset = (firstDay + 6) % 7;
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Prev month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: false, dateStr });
    }

    // Current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: true, dateStr });
    }

    // Next month filler
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [year, month, startOffset, daysInCurrentMonth, daysInPrevMonth]);

  const taskDatesMap = useMemo(() => {
    const map = new Set<string>();
    tasks.forEach((t) => {
      if (t.due_at) map.add(t.due_at.substring(0, 10));
    });
    return map;
  }, [tasks]);

  const handlePrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const handleSelectToday = () => {
    const now = new Date();
    setCalendarDate(now);
    setSelectedDate(now.toISOString().substring(0, 10));
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 pb-8 font-sans">
      {/* ========================================================
          CARD 1: Focus Timer Card
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="bg-white rounded-[20px] p-6 shadow-soft-card border border-[rgba(28,25,23,0.08)] flex flex-col justify-between"
      >
        {/* Status indicator row */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#78716C]">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              timerMode === "focusing"
                ? "bg-[#15803D] animate-pulse"
                : timerMode === "paused"
                ? "bg-[#C2410C]"
                : "bg-[#78716C]"
            }`}
          />
          <span className="capitalize font-medium">
            {timerMode === "focusing"
              ? "Focusing"
              : timerMode === "paused"
              ? "Paused"
              : "Ready"}
          </span>
        </div>

        {/* Center Digital Digits & Minimalist Clock */}
        <div className="flex items-center justify-between my-5">
          <div>
            <div className="text-4xl lg:text-5xl font-bold font-sora tabular-nums text-[#1C1917] tracking-tight">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-xs text-[#78716C] mt-1.5 font-normal">
              {timerMode === "focusing"
                ? "Deep work session active"
                : "Start a focus session"}
            </p>
          </div>

          {/* Analog Minimalist Clock Dial */}
          <div
            className={`relative w-20 h-20 rounded-full border-2 border-[rgba(28,25,23,0.12)] bg-[#FAF7F2] flex items-center justify-center shrink-0 transition-shadow ${
              isTimerRunning ? "shadow-terracotta-glow" : ""
            }`}
          >
            {/* Center dot */}
            <div className="w-2 h-2 rounded-full bg-[#1C1917] z-10" />

            {/* Dark Minute Hand */}
            <div
              className="absolute top-3 w-[2px] h-7 bg-[#1C1917] rounded-full origin-bottom"
              style={{
                transformOrigin: "bottom center",
                bottom: "50%",
                transform: `rotate(${((timerSeconds / 60) % 60) * 6}deg)`,
              }}
            />

            {/* Terracotta Second Hand */}
            <motion.div
              className="absolute top-2 w-[1.5px] h-8 bg-[#C2410C] rounded-full origin-bottom"
              style={{
                transformOrigin: "bottom center",
                bottom: "50%",
              }}
              animate={{
                rotate: (timerSeconds % 60) * 6,
              }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {/* Ghost Reset Button */}
            <button
              onClick={handleResetTimer}
              title="Reset timer"
              aria-label="Reset timer"
              className="w-9 h-9 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0] flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Round 2px Outlined Play / Pause Button */}
            <button
              onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
              title={isTimerRunning ? "Pause" : "Play"}
              aria-label={isTimerRunning ? "Pause focus session" : "Start focus session"}
              className="w-11 h-11 rounded-full border-2 border-[#1C1917] flex items-center justify-center hover:bg-[#F0EAE0] active:scale-95 transition-all text-[#1C1917]"
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Red Pill End Session Button */}
          <button
            onClick={handleEndSession}
            className="px-5 py-2 rounded-full font-medium text-xs bg-[#B91C1C] text-[#FFFBEB] hover:bg-[#991B1B] active:scale-95 transition-all shadow-sm"
          >
            End session
          </button>
        </div>
      </motion.div>

      {/* ========================================================
          CARD 2: Progress Card with Donut Ring
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="bg-white rounded-[20px] p-6 shadow-soft-card border border-[rgba(28,25,23,0.08)] flex flex-col justify-between"
      >
        {/* Header Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C2410C]">
          <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
          <span>Progress</span>
        </div>

        {/* Content Row: Tasks List Preview + Donut Ring */}
        <div className="flex items-center justify-between gap-5 my-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold font-sora text-[#1C1917] tracking-tight">
              Today
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5 font-medium">
              {completedToday} of {totalToday} done
            </p>

            {/* Checklist preview up to 5 items */}
            <div className="mt-3.5 space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {todayTasks.slice(0, 5).map((task) => {
                const isDone = task.status === "done";
                return (
                  <div key={task.id} className="flex items-center gap-2 text-xs truncate">
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[rgba(28,25,23,0.25)] shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        isDone
                          ? "line-through text-[#78716C] opacity-60"
                          : "text-[#1C1917] font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                );
              })}
              {todayTasks.length === 0 && (
                <p className="text-xs text-[#78716C] italic">No tasks planned for today</p>
              )}
            </div>
          </div>

          {/* SVG Donut Ring with Diagonal Accent Gradient */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="terracottaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C2410C" />
                  <stop offset="100%" stopColor="#E2622A" />
                </linearGradient>
              </defs>
              {/* Empty Track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#F0EAE0"
                strokeWidth="11"
              />
              {/* Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="url(#terracottaGradient)"
                strokeWidth="11"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${
                  2 * Math.PI * 38 * (1 - progressPercent / 100)
                }`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-sora tabular-nums text-[#1C1917]">
                {progressPercent}%
              </span>
              {progressPercent === 100 && totalToday > 0 && (
                <Sparkles className="w-3 h-3 text-[#C2410C] mt-0.5 animate-bounce" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          CARD 3: Task List Card (with Inline Add Task Form)
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="bg-white rounded-[20px] p-6 shadow-soft-card border border-[rgba(28,25,23,0.08)] flex flex-col justify-between"
      >
        {/* Header with Title & Rotating + Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-sora text-[#1C1917]">
            Today's tasks
          </h2>
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            title={isAddFormOpen ? "Close form" : "Add task"}
            aria-label={isAddFormOpen ? "Close form" : "Add task"}
            className="w-8 h-8 rounded-full bg-accent-gradient text-[#FFFBEB] flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
          >
            <motion.div
              animate={{ rotate: isAddFormOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </motion.div>
          </button>
        </div>

        {/* Inline Add Task Form (Elevated color) */}
        <AnimatePresence>
          {isAddFormOpen && (
            <motion.form
              onSubmit={handleCreateTask}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="p-4 rounded-inner bg-[#F0EAE0] mb-3 overflow-hidden space-y-3"
            >
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white text-sm text-[#1C1917] placeholder-[#78716C] border border-[rgba(28,25,23,0.12)] focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
              />

              {/* Time & Reminder Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Due Time */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[rgba(28,25,23,0.12)]">
                  <Clock className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <span className="text-[#78716C] shrink-0 font-medium">Time:</span>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 bg-transparent text-[#1C1917] font-mono focus:outline-none text-xs"
                  />
                </div>

                {/* Reminder selector */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[rgba(28,25,23,0.12)]">
                  <Bell className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  <span className="text-[#78716C] shrink-0 font-medium">Remind at:</span>
                  <select
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value as any)}
                    className="flex-1 bg-transparent text-[#1C1917] focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="none">No reminder</option>
                    <option value="at_time">At task time ({newTime})</option>
                    <option value="5m">5 mins before</option>
                    <option value="15m">15 mins before</option>
                    <option value="30m">30 mins before</option>
                    <option value="1h">1 hour before</option>
                    <option value="custom">Custom time...</option>
                  </select>
                </div>
              </div>

              {/* Custom reminder time input if selected */}
              {newReminder === "custom" && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[rgba(28,25,23,0.12)] text-xs">
                  <Bell className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  <span className="text-[#78716C] font-medium shrink-0">Custom Remind Time:</span>
                  <input
                    type="time"
                    value={newCustomReminder}
                    onChange={(e) => setNewCustomReminder(e.target.value)}
                    className="flex-1 bg-transparent text-[#1C1917] font-mono focus:outline-none text-xs"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* Priority Selection Pills */}
                <div className="flex items-center gap-1.5">
                  {(["high", "medium", "low"] as Priority[]).map((p) => {
                    const active = newPriority === p;
                    const dotColor =
                      p === "high" ? "bg-[#B91C1C]" : p === "medium" ? "bg-[#C2410C]" : "bg-[#15803D]";
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                          active
                            ? "bg-white text-[#1C1917] shadow-sm border border-[rgba(28,25,23,0.16)]"
                            : "text-[#78716C] hover:text-[#1C1917]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-full bg-accent-gradient text-[#FFFBEB] font-semibold text-xs shadow-glow hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                >
                  Add task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Task Rows List with Drag & Drop and Subtasks */}
        <div className="flex-1 overflow-y-auto max-h-72 pr-1">
          {todayTasks.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#F0EAE0] flex items-center justify-center text-[#78716C] mb-2">
                <Plus className="w-5 h-5 text-[#C2410C]" />
              </div>
              <p className="text-xs text-[#78716C] font-medium">
                All clear — Tap + to add a task
              </p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={todayTasks}
              onReorder={handleReorderTodayTasks}
              className="space-y-2.5"
            >
              {todayTasks.map((task) => {
                const isCompleted = task.status === "done";
                const priorityDot =
                  task.priority === "urgent" || task.priority === "high"
                    ? "bg-[#B91C1C]"
                    : task.priority === "medium"
                    ? "bg-[#C2410C]"
                    : "bg-[#15803D]";

                let timeFormatted = "";
                if (task.due_at) {
                  try {
                    timeFormatted = new Date(task.due_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {}
                }

                let reminderFormatted = "";
                if (task.reminder_at) {
                  try {
                    reminderFormatted = new Date(task.reminder_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {}
                }

                const completedSubs =
                  task.subtasks?.filter((s) => s.completed === 1).length || 0;
                const totalSubs = task.subtasks?.length || 0;

                return (
                  <Reorder.Item key={task.id} value={task}>
                    <div
                      onClick={() => setSelectedTaskId(task.id)}
                      className="flex flex-col p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[rgba(28,25,23,0.06)] hover:border-[rgba(28,25,23,0.14)] transition-all cursor-pointer group shadow-[0_1px_2px_rgba(28,25,23,0.02)]"
                    >
                      {/* Top Row: Drag handle, Checkbox, Title, and Right Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Drag handle */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-[#78716C] shrink-0 -ml-1 p-0.5"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          {/* Circle Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(task);
                            }}
                            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                              isCompleted
                                ? "bg-[#C2410C] text-[#FFFBEB] shadow-sm"
                                : "border-2 border-[rgba(28,25,23,0.25)] hover:border-[#C2410C] bg-white"
                            }`}
                          >
                            {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          {/* Title */}
                          <span
                            className={`text-sm truncate font-medium ${
                              isCompleted
                                ? "line-through text-[#78716C] opacity-60"
                                : "text-[#1C1917]"
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* Subtask count badge if any */}
                          {totalSubs > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/80 border border-[rgba(28,25,23,0.08)] text-[#78716C] shrink-0">
                              <ListTree className="w-3 h-3 text-[#C2410C]" />
                              <span>
                                {completedSubs}/{totalSubs}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Right metadata: Time, Reminder, Delete button, Priority dot */}
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {timeFormatted && (
                            <div
                              className="flex items-center gap-1 text-xs text-[#78716C] font-mono bg-white/70 px-2 py-0.5 rounded-md border border-[rgba(28,25,23,0.08)]"
                              title={`Due Time: ${timeFormatted}`}
                            >
                              <Clock className="w-3 h-3 text-[#78716C]" />
                              <span>{timeFormatted}</span>
                            </div>
                          )}

                          {reminderFormatted && (
                            <div
                              className="flex items-center gap-1 text-xs font-mono text-[#C2410C] bg-[#FFFBEB] px-2 py-0.5 rounded-md border border-[rgba(194,65,12,0.2)]"
                              title={`Remind at ${reminderFormatted}`}
                            >
                              <Bell className="w-3 h-3 text-[#C2410C]" />
                              <span className="font-medium whitespace-nowrap">Remind at {reminderFormatted}</span>
                            </div>
                          )}

                          {/* Delete hover icon */}
                          <button
                            onClick={(e) => handleDelete(e, task.id)}
                            title="Delete task"
                            aria-label="Delete task"
                            className="opacity-0 group-hover:opacity-100 text-[#78716C] hover:text-[#B91C1C] transition-opacity p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Priority Dot */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`}
                            title={`Priority: ${task.priority}`}
                          />
                        </div>
                      </div>

                      {/* Nested Subtasks List */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[rgba(28,25,23,0.08)] space-y-1.5 pl-6 rtl:pl-0 rtl:pr-6">
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubtask(task.id, st.id);
                              }}
                              className="flex items-center gap-2 text-xs py-0.5 group/sub cursor-pointer"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubtask(task.id, st.id);
                                }}
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                  st.completed === 1
                                    ? "bg-[#C2410C] border-[#C2410C] text-white"
                                    : "border-[rgba(28,25,23,0.3)] bg-white group-hover/sub:border-[#C2410C]"
                                }`}
                              >
                                {st.completed === 1 && (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </button>
                              <span
                                className={`truncate transition-all ${
                                  st.completed === 1
                                    ? "line-through text-[#78716C] opacity-60"
                                    : "text-[#1C1917] font-normal"
                                }`}
                              >
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}
        </div>
      </motion.div>

      {/* ========================================================
          CARD 4: Calendar Card
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="bg-white rounded-[20px] p-6 shadow-soft-card border border-[rgba(28,25,23,0.08)] flex flex-col justify-between"
      >
        {/* Header with Title & Today Pill */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold font-sora text-[#1C1917]">
            Calendar
          </h2>
          <button
            onClick={handleSelectToday}
            className="px-3 py-1 rounded-full text-xs font-semibold font-sora bg-[#F0EAE0] text-[#1C1917] hover:bg-[#E5DFD7] transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Navigation Row */}
        <div className="flex items-center justify-between text-xs font-semibold font-sora text-[#1C1917] mb-2 px-1">
          <span>
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1 text-[#78716C]">
            <button
              onClick={handlePrevMonth}
              title="Previous month"
              aria-label="Previous month"
              className="p-1 hover:text-[#1C1917] rounded-full hover:bg-[#F0EAE0] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next month"
              aria-label="Next month"
              className="p-1 hover:text-[#1C1917] rounded-full hover:bg-[#F0EAE0] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels (Monday Start) */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#78716C] mb-2 font-sora">
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
          {calendarDays.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const hasTasks = taskDatesMap.has(item.dateStr);

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(item.dateStr);
                  playSound("navigation");
                }}
                className="flex flex-col items-center justify-center h-8 relative group"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-sora font-medium text-xs transition-all ${
                    isSelected
                      ? "bg-accent-gradient text-[#FFFBEB] font-bold shadow-glow"
                      : isToday
                      ? "border-2 border-[#C2410C] text-[#C2410C] font-semibold"
                      : item.isCurrentMonth
                      ? "text-[#1C1917] group-hover:bg-[#F0EAE0]"
                      : "text-[#A8A29E]"
                  }`}
                >
                  {item.day}
                </span>
                {hasTasks && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#C2410C] absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
