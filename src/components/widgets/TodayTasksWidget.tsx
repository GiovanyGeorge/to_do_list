import React, { useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { Check } from "lucide-react";

export const TodayTasksWidget: React.FC = () => {
  const { tasks, fetchTasks, toggleTask } = useTaskStore();
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const todayTasks = tasks.filter(
    (t) => t.is_in_my_day || (t.due_at && t.due_at.substring(0, 10) === todayStr)
  );

  const completed = todayTasks.filter((t) => t.status === "done").length;
  const pct = todayTasks.length > 0 ? Math.round((completed / todayTasks.length) * 100) : 0;

  return (
    <div className="space-y-3 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#9299A5]">Today's Focus</span>
          <span className="text-xs font-bold text-[#E99A43]">{pct}% Done</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#252B35] overflow-hidden mb-3">
          <div
            className="h-full bg-[#E99A43] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {todayTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9299A5]">
              No tasks scheduled for today.
            </div>
          ) : (
            todayTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#191D24] border border-[#2A303C] hover:border-[#E99A43]/40 cursor-pointer transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    t.status === "done"
                      ? "bg-[#E99A43] border-[#E99A43] text-black"
                      : "border-[#374151]"
                  }`}
                >
                  {t.status === "done" && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span
                  className={`text-xs truncate flex-1 ${
                    t.status === "done" ? "line-through text-[#6B7280]" : "text-[#F3F4F6]"
                  }`}
                >
                  {t.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
