import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Check, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import { useSoundManager } from "@/hooks/useSoundManager";
import { getTodayLocalDateString, extractLocalDate, formatTimeDisplay } from "@/lib/dateUtils";

interface SmartDailyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartDailyPlannerModal: React.FC<SmartDailyPlannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { tasks, toggleDayPlan, fetchTasks } = useTaskStore();
  const { playSound } = useSoundManager();

  const todayStr = getTodayLocalDateString();
  const now = new Date();

  // Intelligent Candidate Detection
  const suggestions = useMemo(() => {
    // 1. Overdue tasks (critical)
    const overdue = tasks.filter((t) => {
      if (t.status === "done") return false;
      if (!t.due_at) return false;
      const d = new Date(t.due_at);
      return d.getTime() < now.getTime() && extractLocalDate(t.due_at) !== todayStr;
    });

    // 2. Unfinished carried-over tasks (planned for past day, not done)
    const carriedOver = tasks.filter((t) => {
      if (t.status === "done") return false;
      const planDate = extractLocalDate(t.start_at);
      return planDate && planDate < todayStr && !overdue.some((ot) => ot.id === t.id);
    });

    // 3. Due today
    const dueToday = tasks.filter((t) => {
      if (t.status === "done") return false;
      return extractLocalDate(t.due_at) === todayStr;
    });

    // 4. High / Urgent priority not yet in today
    const highPriority = tasks.filter((t) => {
      if (t.status === "done") return false;
      if (t.is_in_my_day) return false;
      if (t.priority !== "urgent" && t.priority !== "high") return false;
      return (
        !overdue.some((ot) => ot.id === t.id) &&
        !carriedOver.some((ct) => ct.id === t.id) &&
        !dueToday.some((dt) => dt.id === t.id)
      );
    });

    return {
      overdue,
      carriedOver,
      dueToday,
      highPriority,
    };
  }, [tasks, now, todayStr]);

  // Selected task IDs to add to today's plan
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Auto-select candidates when modal opens
  useEffect(() => {
    if (isOpen) {
      const allCandidateIds = [
        ...suggestions.overdue.map((t) => t.id),
        ...suggestions.carriedOver.map((t) => t.id),
        ...suggestions.dueToday.map((t) => t.id),
        ...suggestions.highPriority.map((t) => t.id),
      ];
      setSelectedIds(new Set(allCandidateIds));
    }
  }, [isOpen, suggestions]);

  const toggleSelection = (taskId: string) => {
    const next = new Set(selectedIds);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    setSelectedIds(next);
  };

  const handleApplyPlan = async () => {
    playSound("task_complete");
    for (const taskId of selectedIds) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && !task.is_in_my_day) {
        await toggleDayPlan(taskId, todayStr);
      }
    }
    await fetchTasks();
    onClose();
  };

  const totalCandidates =
    suggestions.overdue.length +
    suggestions.carriedOver.length +
    suggestions.dueToday.length +
    suggestions.highPriority.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? "تخطيط ذكي لليوم (Hybrid Planner)" : "Intelligent Daily Planner"}
      description={
        isRtl
          ? "يقترح النظام المهام ذات الأولوية والمتأخرة لتنظيم يوم متوازن. يمكنك قبول أو تعديل الخطة كما تشاء."
          : "Review suggested overdue, carried-over, and priority tasks. You remain in full control to customize today's plan."
      }
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {totalCandidates === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[#FAF7F2] border border-[rgba(28,25,23,0.08)] flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#15803D] flex items-center justify-center mb-2 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1C1917] font-sora">
              {isRtl ? "جدولك منظم ولا توجد مهام متأخرة!" : "You're All Caught Up!"}
            </h4>
            <p className="text-xs text-[#78716C] max-w-sm mt-1">
              {isRtl
                ? "لا توجد مهام متأخرة أو مرحلة من أيام سابقة. يومك جاهز ونظيف."
                : "No overdue or carried-over tasks detected. Your backlog is in great shape."}
            </p>
          </div>
        ) : (
          <>
            {/* 1. Overdue Section */}
            {suggestions.overdue.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B91C1C]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? "مهام متأخرة عن موعدها النهائي" : "Overdue Deadlines"} (
                    {suggestions.overdue.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {suggestions.overdue.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-red-50/40 border border-red-200/60 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                        className="w-4 h-4 rounded text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917] truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-[#B91C1C]">
                          Due: {task.due_at ? formatTimeDisplay(task.due_at) : "Past deadline"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-mono">
                        Overdue
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Carried-over Unfinished Tasks */}
            {suggestions.carriedOver.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C2410C]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? "مهام سابقة لم تكتمل (Carry-Over)" : "Carried-Over Unfinished Tasks"} (
                    {suggestions.carriedOver.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {suggestions.carriedOver.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[rgba(28,25,23,0.08)] hover:bg-[#F0EAE0] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                        className="w-4 h-4 rounded text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917] truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-[#78716C]">
                          Planned for: {extractLocalDate(task.start_at) || "Past"}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#78716C] bg-white px-2 py-0.5 rounded-full border border-[rgba(28,25,23,0.08)]">
                        Carry Over
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Due Today */}
            {suggestions.dueToday.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? "مستحقة اليوم" : "Due Today"} ({suggestions.dueToday.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {suggestions.dueToday.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 border border-amber-200/60 hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                        className="w-4 h-4 rounded text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917] truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-[#B45309]">
                          Time: {formatTimeDisplay(task.due_at) || "Today"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Due Today
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. High Priority Backlog */}
            {suggestions.highPriority.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>
                    {isRtl ? "أولويات مرتفعة من القائمة" : "High Priority Backlog"} (
                    {suggestions.highPriority.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {suggestions.highPriority.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[rgba(28,25,23,0.08)] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                        className="w-4 h-4 rounded text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917] truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-[#78716C] capitalize">
                          Priority: {task.priority}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#C2410C] bg-[#FFFBEB] px-2 py-0.5 rounded-full border border-[#C2410C]/20 uppercase">
                        {task.priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Actions */}
      <div className="pt-4 border-t border-[rgba(28,25,23,0.08)] flex items-center justify-between">
        <span className="text-xs text-[#78716C]">
          {selectedIds.size} {selectedIds.size === 1 ? "task" : "tasks"} selected for today
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isRtl ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyPlan}
            disabled={selectedIds.size === 0}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isRtl ? "اعتماد خطة اليوم" : "Apply to Today's Plan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
