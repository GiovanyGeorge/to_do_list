import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Plus, Sparkles } from "lucide-react";
import { Reorder } from "motion/react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { TaskWithDetails } from "@shared/types/database";

export const MyDayPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    tasks,
    fetchTasks,
    createTask,
    toggleTask,
    setSelectedTaskId,
    toggleDayPlan,
    deleteTask,
    reorderTasks,
  } = useTaskStore();

  const [quickTitle, setQuickTitle] = useState("");
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await createTask({
      title: quickTitle.trim(),
      status: "todo",
      priority: "medium",
      plan_date: todayStr,
      start_at: new Date().toISOString(),
      due_at: new Date().toISOString(),
    });

    setQuickTitle("");
  };

  const myDayTasks = tasks.filter(
    (t) => t.is_in_my_day || t.due_at?.substring(0, 10) === todayStr
  );
  const completedCount = myDayTasks.filter((t) => t.status === "done").length;
  const progressPercent =
    myDayTasks.length > 0
      ? Math.round((completedCount / myDayTasks.length) * 100)
      : 0;

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handleReorder = (newOrderedTasks: TaskWithDetails[]) => {
    reorderTasks(newOrderedTasks.map((t) => t.id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-glow">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.myDay")}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">{dateLabel}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-text-secondary font-medium">Daily Progress</div>
          <div className="text-2xl font-bold font-sora text-accent tabular-nums">
            {progressPercent}%
          </div>
          <div className="text-[11px] text-text-muted">
            {completedCount} of {myDayTasks.length} done
          </div>
        </div>
      </div>

      {/* Quick Add Form directly into My Day */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a task for today... (Press Enter to add)"
          className="h-11 shadow-[0_1px_2px_rgba(28,25,23,0.04)]"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!quickTitle.trim()}
          className="h-11 px-5 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </form>

      {/* Task List with Drag & Drop */}
      <div>
        {myDayTasks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold font-sora text-text-primary mb-1">
              Your day is clear
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Capture what matters today. Tasks planned for today will appear here
              without altering their original due date.
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={myDayTasks}
            onReorder={handleReorder}
            className="space-y-2.5"
          >
            {myDayTasks.map((task) => (
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
    </div>
  );
};
