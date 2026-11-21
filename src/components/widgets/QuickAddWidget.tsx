import React, { useState } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { Plus } from "lucide-react";
import { getTodayLocalDateString } from "@/lib/dateUtils";

export const QuickAddWidget: React.FC = () => {
  const { createTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayStr = getTodayLocalDateString();
    await createTask({
      title: title.trim(),
      priority,
      status: "todo",
      plan_date: todayStr,
      start_at: todayStr,
    });

    setTitle("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          className="w-full h-10 px-3 text-xs rounded-lg bg-[#252B35] border border-[#2A303C] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#E99A43]"
        />

        <div className="flex items-center gap-1.5">
          {(["low", "medium", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-1 rounded text-[11px] capitalize font-medium border transition-colors ${
                priority === p
                  ? "bg-[#E99A43]/20 border-[#E99A43] text-[#E99A43]"
                  : "border-[#2A303C] text-[#9299A5] hover:text-[#F3F4F6]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded-lg bg-[#E99A43] text-black font-semibold text-xs hover:bg-[#F0A857] flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{submitted ? "Added to Today!" : "Add Task"}</span>
      </button>
    </form>
  );
};
