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
  AlertTriangle,
  Sun,
  FolderKanban,
  Calendar,
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useFocusStore } from "@/store/useFocusStore";
import { SmartDailyPlannerModal } from "@/components/planning/SmartDailyPlannerModal";
import { useSoundManager } from "@/hooks/useSoundManager";
import { useMotion } from "@/hooks/useMotion";
import type { TaskWithDetails, Priority } from "@shared/types/database";
import {
  getTodayLocalDateString,
  extractLocalDate,
  createDateTimeISO,
} from "@/lib/dateUtils";

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
    toggleDayPlan,
  } = useTaskStore();
  const { playSound } = useSoundManager();
  const { enabled: motionEnabled } = useMotion();

  // Focus Timer Store
  const {
    elapsedSeconds: timerSeconds,
    status: timerMode,
    todayFocusSeconds,
    fetchCurrentSession,
    fetchTodayFocusSeconds,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetFocus,
    endFocus,
    tick,
  } = useFocusStore();

  const isTimerRunning = timerMode === "focusing";
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  // Inline Add Task Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTaskTarget, setNewTaskTarget] = useState<"today" | "bank">("today");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [newTime, setNewTime] = useState("19:00");
  const [newReminder, setNewReminder] = useState<"none" | "at_time" | "5m" | "15m" | "30m" | "1h" | "custom">("15m");
  const [newCustomReminder, setNewCustomReminder] = useState("");

  // Drag & Drop State between Task Bank and Today's tasks
  const [isDragOverToday, setIsDragOverToday] = useState(false);
  const [isDragOverBank, setIsDragOverBank] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [bankFilter, setBankFilter] = useState<"all" | "overdue" | "upcoming">("all");

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayLocalDateString()
  );

  useEffect(() => {
    fetchTasks();
    fetchCurrentSession();
    fetchTodayFocusSeconds();
  }, [fetchTasks, fetchCurrentSession, fetchTodayFocusSeconds]);

  // Focus Timer Interval (Sync with system timestamps without background throttling)
  useEffect(() => {
    if (timerMode !== "focusing") return;
    const interval = setInterval(() => {
      tick();
    }, 500);
    return () => clearInterval(interval);
  }, [timerMode, tick]);

  const handleStartTimer = async () => {
    if (timerMode === "paused") {
      await resumeFocus();
    } else {
      await startFocus(undefined, "Focus Session");
    }
    playSound("navigation");
  };

  const handlePauseTimer = async () => {
    await pauseFocus();
    playSound("navigation");
  };

  const handleResetTimer = async () => {
    await resetFocus();
    playSound("navigation");
  };

  const handleEndSession = async () => {
    await endFocus();
    playSound("success");
  };

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const todayStr = getTodayLocalDateString();

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === "done") return false;
      const due = extractLocalDate(t.due_at);
      return due && due < todayStr;
    });
  }, [tasks, todayStr]);

  // Carried-over unfinished tasks
  const carriedOverTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === "done") return false;
      const planned = extractLocalDate(t.start_at);
      const due = extractLocalDate(t.due_at);
      if (t.is_in_my_day) return false;
      if (due === todayStr) return false;
      return (planned && planned < todayStr) || (due && due < todayStr);
    });
  }, [tasks, todayStr]);

  // Today's tasks (in my day or scheduled for today)
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.is_in_my_day) return true;
      if (extractLocalDate(t.start_at) === todayStr) return true;
      if (extractLocalDate(t.due_at) === todayStr) return true;
      return false;
    });
  }, [tasks, todayStr]);

  // Subtask-aware progress percentage
  const { completedToday, totalToday, progressPercent } = useMemo(() => {
    if (todayTasks.length === 0) {
      return { completedToday: 0, totalToday: 0, progressPercent: 0 };
    }
    let completedPoints = 0;
    todayTasks.forEach((t) => {
      if (t.status === "done") {
        completedPoints += 1;
      } else if (t.subtasks && t.subtasks.length > 0) {
        const doneSubs = t.subtasks.filter((s) => s.completed === 1).length;
        completedPoints += doneSubs / t.subtasks.length;
      }
    });
    const doneCount = todayTasks.filter((t) => t.status === "done").length;
    return {
      completedToday: doneCount,
      totalToday: todayTasks.length,
      progressPercent: Math.round((completedPoints / todayTasks.length) * 100),
    };
  }, [todayTasks]);

  // Task Bank: open tasks not currently scheduled in Today
  const bankTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === "done") return false;
      if (t.is_in_my_day) return false;
      const planned = extractLocalDate(t.start_at);
      if (planned === todayStr) return false;
      return true;
    });
  }, [tasks, todayStr]);

  const overdueInBankCount = useMemo(() => {
    return bankTasks.filter((t) => {
      const due = extractLocalDate(t.due_at);
      return due && due < todayStr;
    }).length;
  }, [bankTasks, todayStr]);

  const upcomingInBankCount = useMemo(() => {
    return bankTasks.filter((t) => {
      const due = extractLocalDate(t.due_at);
      return due && due >= todayStr;
    }).length;
  }, [bankTasks, todayStr]);

  const filteredBankTasks = useMemo(() => {
    let list = bankTasks;
    if (bankFilter === "overdue") {
      list = bankTasks.filter((t) => {
        const due = extractLocalDate(t.due_at);
        return due && due < todayStr;
      });
    } else if (bankFilter === "upcoming") {
      list = bankTasks.filter((t) => {
        const due = extractLocalDate(t.due_at);
        return due && due >= todayStr;
      });
    }

    return [...list].sort((a, b) => {
      const dueA = extractLocalDate(a.due_at);
      const dueB = extractLocalDate(b.due_at);
      const isOverdueA = dueA && dueA < todayStr;
      const isOverdueB = dueB && dueB < todayStr;
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;
      if (dueA && dueB) return dueA.localeCompare(dueB);
      if (dueA && !dueB) return -1;
      if (!dueA && dueB) return 1;
      return 0;
    });
  }, [bankTasks, bankFilter, todayStr]);

  // Inline Task Creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetDate = newTaskTarget === "today" ? todayStr : (newDueDate || todayStr);

    // Parse Due Time (HH:MM)
    const timeParts = newTime.includes(":") ? newTime.split(":") : ["19", "00"];
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    const dueAtISO =
      newTaskTarget === "bank" && !newDueDate
        ? null
        : createDateTimeISO(targetDate, `${hours}:${minutes}`);

    // Compute Reminder Time
    let reminderAtISO: string | undefined = undefined;
    if (dueAtISO) {
      if (newReminder === "at_time") {
        reminderAtISO = dueAtISO;
      } else if (newReminder === "5m") {
        reminderAtISO = new Date(new Date(dueAtISO).getTime() - 5 * 60 * 1000).toISOString();
      } else if (newReminder === "15m") {
        reminderAtISO = new Date(new Date(dueAtISO).getTime() - 15 * 60 * 1000).toISOString();
      } else if (newReminder === "30m") {
        reminderAtISO = new Date(new Date(dueAtISO).getTime() - 30 * 60 * 1000).toISOString();
      } else if (newReminder === "1h") {
        reminderAtISO = new Date(new Date(dueAtISO).getTime() - 60 * 60 * 1000).toISOString();
      } else if (newReminder === "custom" && newCustomReminder) {
        const cParts = newCustomReminder.split(":");
        const cHours = parseInt(cParts[0], 10) || 0;
        const cMinutes = parseInt(cParts[1], 10) || 0;
        reminderAtISO = createDateTimeISO(targetDate, `${cHours}:${cMinutes}`);
      }
    }

    await createTask({
      title: newTitle.trim(),
      priority: newPriority,
      status: "todo",
      start_at: newTaskTarget === "today" ? todayStr : undefined,
      due_at: dueAtISO || undefined,
      reminder_at: reminderAtISO,
      plan_date: newTaskTarget === "today" ? todayStr : undefined,
    });

    setNewTitle("");
    setNewPriority("medium");
    setNewDueDate("");
    setIsAddFormOpen(false);
    playSound("task_create");
  };

  const handleMoveToTodayById = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (!task.is_in_my_day) {
      await toggleDayPlan(taskId, todayStr);
    }
    playSound("task_create");
  };

  const handleRemoveFromTodayById = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.is_in_my_day) {
      await toggleDayPlan(taskId, todayStr);
    }
    playSound("navigation");
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
      const planned = extractLocalDate(t.start_at);
      if (planned) map.add(planned);
      const due = extractLocalDate(t.due_at);
      if (due) map.add(due);
    });
    return map;
  }, [tasks]);

  // Tasks for the selected calendar date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => {
      const planned = extractLocalDate(t.start_at);
      const due = extractLocalDate(t.due_at);
      return planned === selectedDate || due === selectedDate;
    });
  }, [tasks, selectedDate]);

  const handlePrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const handleSelectToday = () => {
    const now = new Date();
    setCalendarDate(now);
    setSelectedDate(getTodayLocalDateString());
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 pb-8 font-sans">
      {/* Alert / Carry-over Attention Banner */}
      {overdueTasks.length === 0 && carriedOverTasks.length > 0 && (
        <div className="col-span-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-sora">
                {overdueTasks.length > 0
                  ? `${overdueTasks.length} overdue task(s) requiring attention`
                  : `${carriedOverTasks.length} unfinished task(s) from previous days`}
              </p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                LifeFlow never drops unfinished tasks silently. Review and plan your day.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan My Day</span>
          </button>
        </div>
      )}

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
                : todayFocusSeconds > 0
                ? `Today's focus: ${Math.floor(todayFocusSeconds / 60)}m`
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
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDragOverToday(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOverToday(false);
          }
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragOverToday(false);
          const id =
            e.dataTransfer.getData("lifeflow/task-id") ||
            e.dataTransfer.getData("text/plain");
          if (id) {
            await handleMoveToTodayById(id);
          }
        }}
        className={`bg-white rounded-[20px] p-6 shadow-soft-card border transition-all flex flex-col justify-between ${
          isDragOverToday
            ? "border-2 border-dashed border-[#C2410C] bg-[#FFF7ED]/40 ring-2 ring-[#C2410C]/20"
            : "border-[rgba(28,25,23,0.08)]"
        }`}
      >
        {/* Header with Title & Rotating + Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-sora text-[#1C1917]">
              Today's tasks
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[rgba(28,25,23,0.08)]">
              {completedToday}/{totalToday}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-sora text-[#C2410C] bg-[#FFFBEB] border border-[rgba(194,65,12,0.2)] hover:bg-[#FEE2E2] active:scale-95 transition-all shadow-sm"
              title="Open Smart Daily Planner"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan Day</span>
            </button>
            <button
              onClick={() => {
                setNewTaskTarget("today");
                setIsAddFormOpen(!isAddFormOpen);
              }}
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
        </div>

        {/* Drop zone visual indicator */}
        {isDragOverToday && (
          <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-[#C2410C] bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center gap-2 font-sora font-semibold text-xs animate-pulse">
            <Sun className="w-4 h-4" />
            <span>Drop here to add to Today's Tasks</span>
          </div>
        )}

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
              {/* Destination selector: Today vs Task Bank */}
              <div className="flex items-center gap-1.5 p-1 bg-white/80 rounded-xl border border-[rgba(28,25,23,0.08)]">
                <button
                  type="button"
                  onClick={() => setNewTaskTarget("today")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    newTaskTarget === "today"
                      ? "bg-[#C2410C] text-[#FFFBEB] shadow-xs"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Today's Tasks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskTarget("bank")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    newTaskTarget === "bank"
                      ? "bg-[#C2410C] text-[#FFFBEB] shadow-xs"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Task Bank (Deadline)</span>
                </button>
              </div>

              {/* Deadline Date picker if Task Bank is chosen */}
              {newTaskTarget === "bank" && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[rgba(28,25,23,0.12)] text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  <span className="text-[#78716C] font-medium shrink-0">Deadline Date:</span>
                  <input
                    type="date"
                    min={todayStr}
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="flex-1 bg-transparent text-[#1C1917] font-mono focus:outline-none text-xs"
                  />
                </div>
              )}

              <input
                type="text"
                autoFocus
                placeholder={newTaskTarget === "today" ? "What needs to be done today?" : "What task needs a future deadline?"}
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
                let isDueDifferentDay = false;
                if (task.due_at) {
                  try {
                    const dueDateStr = extractLocalDate(task.due_at);
                    const dueTimeStr = new Date(task.due_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    if (dueDateStr !== todayStr) {
                      const formattedDate = new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(task.due_at));
                      timeFormatted = `Due ${formattedDate} (${dueTimeStr})`;
                      isDueDifferentDay = true;
                    } else {
                      timeFormatted = dueTimeStr;
                    }
                  } catch {}
                }

                let reminderFormatted = "";
                if (task.reminder_at) {
                  try {
                    const rDateStr = extractLocalDate(task.reminder_at);
                    const rTimeStr = new Date(task.reminder_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    if (rDateStr !== todayStr) {
                      const formattedRDate = new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(task.reminder_at));
                      reminderFormatted = `${formattedRDate}, ${rTimeStr}`;
                    } else {
                      reminderFormatted = rTimeStr;
                    }
                  } catch {}
                }

                const completedSubs =
                  task.subtasks?.filter((s) => s.completed === 1).length || 0;
                const totalSubs = task.subtasks?.length || 0;

                return (
                  <Reorder.Item key={task.id} value={task}>
                    <div
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("lifeflow/task-id", task.id);
                        e.dataTransfer.setData("text/plain", task.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedTaskId(task.id);
                      }}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer group shadow-[0_1px_2px_rgba(28,25,23,0.02)] space-y-1.5 ${
                        draggedTaskId === task.id
                          ? "opacity-40 scale-95 border-[#C2410C]"
                          : "bg-[#FAF7F2] hover:bg-[#F0EAE0] border-[rgba(28,25,23,0.06)] hover:border-[rgba(28,25,23,0.14)]"
                      }`}
                    >
                      {/* Top Row: Checkbox, Full Title, Priority dot, Delete button */}
                      <div className="flex items-center justify-between gap-2">
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

                          {/* Full Title (never cramped by metadata) */}
                          <span
                            className={`text-sm truncate font-medium flex-1 ${
                              isCompleted
                                ? "line-through text-[#78716C] opacity-60"
                                : "text-[#1C1917]"
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </span>
                        </div>

                        {/* Right controls: Delete hover icon, Priority Dot */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => handleDelete(e, task.id)}
                            title="Delete task"
                            aria-label="Delete task"
                            className="opacity-0 group-hover:opacity-100 text-[#78716C] hover:text-[#B91C1C] transition-opacity p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`}
                            title={`Priority: ${task.priority}`}
                          />
                        </div>
                      </div>

                      {/* Row 2: Metadata row (indented under title) */}
                      {(totalSubs > 0 || timeFormatted || reminderFormatted || task.category) && (
                        <div className="flex flex-wrap items-center gap-2 pl-7.5 rtl:pl-0 rtl:pr-7.5 text-xs">
                          {/* Category chip if any */}
                          {task.category && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0"
                              style={{
                                backgroundColor: `${task.category.color || "#C2410C"}15`,
                                color: task.category.color || "#C2410C",
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: task.category.color || "#C2410C" }}
                              />
                              {task.category.name}
                            </span>
                          )}

                          {/* Subtask count badge */}
                          {totalSubs > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white border border-[rgba(28,25,23,0.08)] text-[#78716C] whitespace-nowrap shrink-0 shadow-xs">
                              <ListTree className="w-3 h-3 text-[#C2410C]" />
                              <span>
                                {completedSubs}/{totalSubs} ({Math.round((completedSubs / totalSubs) * 100)}%)
                              </span>
                            </span>
                          )}

                          {/* Due Date & Time */}
                          {timeFormatted && (
                            <div
                              className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${
                                isDueDifferentDay
                                  ? "bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]"
                                  : "bg-white/80 text-[#78716C] border-[rgba(28,25,23,0.08)]"
                              }`}
                              title={isDueDifferentDay ? `Deadline: ${timeFormatted}` : `Due Time: ${timeFormatted}`}
                            >
                              <Clock className="w-3 h-3 text-[#78716C]" />
                              <span>{timeFormatted}</span>
                            </div>
                          )}

                          {/* Reminder pill */}
                          {reminderFormatted && (
                            <div
                              className="flex items-center gap-1 text-[11px] font-mono text-[#C2410C] bg-[#FFFBEB] px-2 py-0.5 rounded-md border border-[rgba(194,65,12,0.2)] whitespace-nowrap shrink-0"
                              title={`Reminder set for ${reminderFormatted}`}
                            >
                              <Bell className="w-3 h-3 text-[#C2410C] shrink-0" />
                              <span>{reminderFormatted}</span>
                            </div>
                          )}
                        </div>
                      )}

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
          CARD 4: Task Bank & Deadlines Card (Draggable into Today)
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDragOverBank(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOverBank(false);
          }
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragOverBank(false);
          const id =
            e.dataTransfer.getData("lifeflow/task-id") ||
            e.dataTransfer.getData("text/plain");
          if (id) {
            await handleRemoveFromTodayById(id);
          }
        }}
        className={`bg-white rounded-[20px] p-6 shadow-soft-card border transition-all flex flex-col justify-between ${
          isDragOverBank
            ? "border-2 border-dashed border-[#78716C] bg-[#F5F5F4]/60 ring-2 ring-[#78716C]/20"
            : "border-[rgba(28,25,23,0.08)]"
        }`}
      >
        <div>
          {/* Header with Title, Count, Filters, and Quick Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-glow flex items-center justify-center text-accent-light shrink-0">
                <FolderKanban className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-sora text-[#1C1917]">
                    Task Bank
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F2] text-[#78716C] border border-[rgba(28,25,23,0.08)]">
                    {bankTasks.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Drag tasks into Today or click + Today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {/* Filter Pills */}
              <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-lg border border-[rgba(28,25,23,0.06)] text-[11px]">
                <button
                  type="button"
                  onClick={() => setBankFilter("all")}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    bankFilter === "all"
                      ? "bg-white text-[#1C1917] shadow-xs font-semibold"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  All ({bankTasks.length})
                </button>
                {overdueInBankCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setBankFilter("overdue")}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      bankFilter === "overdue"
                        ? "bg-[#FEE2E2] text-[#B91C1C] shadow-xs font-semibold"
                        : "text-[#B91C1C] hover:bg-[#FEE2E2]/50"
                    }`}
                  >
                    ⚠️ Overdue ({overdueInBankCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setBankFilter("upcoming")}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    bankFilter === "upcoming"
                      ? "bg-white text-[#1C1917] shadow-xs font-semibold"
                      : "text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  Upcoming ({upcomingInBankCount})
                </button>
              </div>

              {/* Add to Bank Button */}
              <button
                type="button"
                onClick={() => {
                  setNewTaskTarget("bank");
                  setIsAddFormOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F0EAE0] text-[#1C1917] flex items-center justify-center border border-[rgba(28,25,23,0.12)] hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0"
                title="Add task with deadline to Bank"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Active Drop zone indicator when dragging from Today to Bank */}
          {isDragOverBank && (
            <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-[#78716C] bg-[#F5F5F4] text-[#78716C] flex items-center justify-center gap-2 font-sora font-semibold text-xs animate-pulse">
              <FolderKanban className="w-4 h-4" />
              <span>Drop here to return task to Bank</span>
            </div>
          )}

          {/* Task Bank List */}
          {filteredBankTasks.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center text-xs text-[#78716C] bg-[#FAF7F2] rounded-xl border border-[rgba(28,25,23,0.04)] p-4 space-y-1">
              <FolderKanban className="w-6 h-6 text-[#78716C]/60 mb-1" />
              <p className="font-semibold text-[#1C1917]">No tasks in this view</p>
              <p className="text-[11px] text-[#78716C]">
                Add tasks with a deadline to plan ahead, or drag tasks here from Today.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredBankTasks.map((task) => {
                const isCompleted = task.status === "done";
                const dueLocalDate = extractLocalDate(task.due_at);
                const isOverdue = dueLocalDate && dueLocalDate < todayStr;
                const isUpcoming = dueLocalDate && dueLocalDate >= todayStr;
                const priorityDot =
                  task.priority === "urgent" || task.priority === "high"
                    ? "bg-[#DC2626]"
                    : task.priority === "medium"
                    ? "bg-[#EA580C]"
                    : "bg-[#78716C]";

                return (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("lifeflow/task-id", task.id);
                      e.dataTransfer.setData("text/plain", task.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedTaskId(task.id);
                    }}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer group shadow-[0_1px_2px_rgba(28,25,23,0.02)] space-y-1.5 ${
                      draggedTaskId === task.id
                        ? "opacity-40 scale-95 border-[#C2410C]"
                        : isOverdue
                        ? "bg-[#FFFBEB]/70 hover:bg-[#FFFBEB] border-[rgba(245,158,11,0.25)] hover:border-[rgba(194,65,12,0.3)]"
                        : "bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[rgba(28,25,23,0.06)] hover:border-[rgba(28,25,23,0.14)]"
                    }`}
                  >
                    {/* Top Row: Drag handle, Checkbox, Title, + Today button, Delete, Priority */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Drag Handle Indicator */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-40 group-hover:opacity-100 hover:text-[#C2410C] transition-opacity cursor-grab active:cursor-grabbing text-[#78716C] shrink-0 -ml-1 p-0.5"
                          title="Drag into Today's Tasks"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        {/* Circle Checkbox */}
                        <button
                          type="button"
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
                          className={`text-sm truncate font-medium flex-1 ${
                            isCompleted
                              ? "line-through text-[#78716C] opacity-60"
                              : "text-[#1C1917]"
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Right controls: + Today Button, Priority Dot, Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Drag or Click to Add to Today */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToTodayById(task.id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] bg-white hover:bg-[#FEE2E2] px-2 py-0.5 rounded-md border border-[rgba(194,65,12,0.25)] shadow-xs transition-colors"
                          title="Schedule for Today (or drag into Today)"
                        >
                          <Sun className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>+ Today</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, task.id)}
                          title="Delete task"
                          aria-label="Delete task"
                          className="opacity-0 group-hover:opacity-100 text-[#78716C] hover:text-[#B91C1C] transition-opacity p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${priorityDot}`}
                          title={`Priority: ${task.priority}`}
                        />
                      </div>
                    </div>

                    {/* Second Row: Deadline badge and Category */}
                    <div className="flex flex-wrap items-center gap-2 pl-7.5 rtl:pl-0 rtl:pr-7.5 text-xs">
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] whitespace-nowrap shrink-0">
                          <AlertTriangle className="w-3 h-3 text-[#B91C1C]" />
                          <span>Due {dueLocalDate}</span>
                        </span>
                      )}

                      {!isOverdue && isUpcoming && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white border border-[#FDBA74] text-[#C2410C] whitespace-nowrap shrink-0 shadow-xs">
                          <Clock className="w-3 h-3 text-[#C2410C]" />
                          <span>Due {dueLocalDate}</span>
                        </span>
                      )}

                      {!dueLocalDate && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white border border-[rgba(28,25,23,0.08)] text-[#78716C] whitespace-nowrap shrink-0">
                          <span>📌 Backlog</span>
                        </span>
                      )}

                      {task.category && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0"
                          style={{
                            backgroundColor: `${task.category.color || "#C2410C"}15`,
                            color: task.category.color || "#C2410C",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.category.color || "#C2410C" }}
                          />
                          {task.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================
          CARD 5: Calendar Card (Full-width dual-pane)
         ======================================================== */}
      <motion.div
        whileHover={motionEnabled ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="col-span-full bg-white rounded-[20px] p-6 shadow-soft-card border border-[rgba(28,25,23,0.08)] flex flex-col justify-between"
      >
        <div>
          {/* Header with Title & Today Pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-sora text-[#1C1917]">
                Calendar
              </h2>
              <span className="text-xs text-[#78716C] hidden sm:inline">
                Schedule & deadlines overview
              </span>
            </div>
            <button
              onClick={handleSelectToday}
              className="px-3 py-1 rounded-full text-xs font-semibold font-sora bg-[#F0EAE0] text-[#1C1917] hover:bg-[#E5DFD7] transition-colors"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Calendar Month Grid */}
            <div>
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
            </div>

            {/* Right Pane: Selected Date's Scheduled Tasks */}
            <div className="border-t lg:border-t-0 lg:border-l border-[rgba(28,25,23,0.08)] pt-4 lg:pt-0 lg:pl-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-sora text-[#1C1917]">
                  {selectedDate === todayStr ? "Today's Schedule" : `Tasks for ${selectedDate}`}
                </h3>
                <span className="text-[11px] font-mono font-medium text-[#78716C]">
                  {selectedDateTasks.length} task(s)
                </span>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#78716C] bg-[#FAF7F2] rounded-xl border border-[rgba(28,25,23,0.04)]">
                  No tasks scheduled for this day
                </div>
              ) : (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {selectedDateTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE0] border border-[rgba(28,25,23,0.06)] cursor-pointer text-xs"
                    >
                      <span className={`truncate font-medium ${t.status === "done" ? "line-through text-[#78716C] opacity-60" : "text-[#1C1917]"}`}>
                        {t.title}
                      </span>
                      {t.due_at && (
                        <span className="text-[10px] font-mono text-[#78716C] shrink-0 ml-2">
                          {extractLocalDate(t.due_at)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Daily Planner Modal */}
      <SmartDailyPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
    </div>
  );
};
