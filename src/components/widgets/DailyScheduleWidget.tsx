import React, { useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useHabitStore } from "@/store/useHabitStore";
import { CheckCircle2, Clock, Flame, FolderKanban } from "lucide-react";
import { getTodayLocalDateString, extractLocalDate, formatTimeDisplay } from "@/lib/dateUtils";

export const DailyScheduleWidget: React.FC = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { habits, fetchHabits } = useHabitStore();
  const todayStr = getTodayLocalDateString();

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, [fetchTasks, fetchHabits]);

  const todayTasks = tasks.filter(
    (t) =>
      t.is_in_my_day ||
      extractLocalDate(t.start_at) === todayStr ||
      extractLocalDate(t.due_at) === todayStr
  );

  return (
    <div className="space-y-3 h-full flex flex-col justify-between font-sans">
      <div className="space-y-3">
        {/* Timeline Header */}
        <div className="flex items-center justify-between border-b border-[#2A303C] pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E99A43]">
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Timeline</span>
          </div>
          <span className="text-[11px] text-[#9299A5]">
            {todayTasks.length} items planned
          </span>
        </div>

        {/* Schedule list */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {todayTasks.length === 0 && habits.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9299A5]">
              No items scheduled for today.
            </div>
          ) : (
            <>
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-[#191D24] border border-[#2A303C] flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {t.status === "done" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#E99A43] shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate font-medium ${
                          t.status === "done" ? "line-through text-[#6B7280]" : "text-[#F3F4F6]"
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    {t.project_id && (
                      <div className="flex items-center gap-1 text-[10px] text-[#9299A5] mt-1 pl-3.5">
                        <FolderKanban className="w-3 h-3 text-[#E99A43]" />
                        <span>Project Task</span>
                      </div>
                    )}
                  </div>

                  {t.due_at && (
                    <span className="text-[10px] text-[#E99A43] bg-[#E99A43]/10 px-2 py-0.5 rounded-full font-mono shrink-0">
                      {formatTimeDisplay(t.due_at) || "Due today"}
                    </span>
                  )}
                </div>
              ))}

              {habits.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#9299A5] mb-1.5 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#E99A43]" />
                    <span>Habits Scheduled Today</span>
                  </div>
                  <div className="space-y-1.5">
                    {habits.slice(0, 3).map((h) => (
                      <div
                        key={h.id}
                        className="px-2.5 py-1.5 rounded-lg bg-[#191D24] border border-[#2A303C] flex items-center justify-between text-xs"
                      >
                        <span className="text-[#F3F4F6] truncate">{h.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            h.is_completed_today
                              ? "bg-green-950/60 text-green-400"
                              : "bg-[#252B35] text-[#9299A5]"
                          }`}
                        >
                          {h.is_completed_today ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
