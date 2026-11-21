import React, { useEffect } from "react";
import { useHabitStore } from "@/store/useHabitStore";
import { Flame, Check } from "lucide-react";
import { getTodayLocalDateString } from "@/lib/dateUtils";

export const HabitTrackerWidget: React.FC = () => {
  const { habits, fetchHabits, toggleHabitLog } = useHabitStore();
  const todayStr = getTodayLocalDateString();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return (
    <div className="space-y-2 max-h-[350px] overflow-y-auto">
      {habits.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#9299A5]">
          No habits defined yet.
        </div>
      ) : (
        habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => toggleHabitLog(habit.id, todayStr)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#191D24] border border-[#2A303C] hover:border-[#E99A43]/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border text-[10px] transition-all ${
                  habit.is_completed_today
                    ? "bg-[#E99A43] border-[#E99A43] text-black shadow-sm"
                    : "border-[#374151] bg-[#252B35] text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-[#F3F4F6] truncate">
                {habit.name}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-[#E99A43] shrink-0">
              <Flame className="w-3.5 h-3.5 fill-[#E99A43]" />
              <span>{habit.current_streak}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
