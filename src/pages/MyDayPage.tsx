import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Plus } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const MyDayPage: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, fetchTasks, createTask, toggleTask, setSelectedTaskId, toggleDayPlan } =
    useTaskStore();

  const [quickTitle, setQuickTitle] = useState("");
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    createTask({
      title: quickTitle.trim(),
      status: "todo",
      priority: "medium",
      plan_date: todayStr,
      due_at: new Date().toISOString(),
    });

    setQuickTitle("");
  };

  const myDayTasks = tasks.filter((t) => t.is_in_my_day || t.due_at?.substring(0, 10) === todayStr);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-background-card border border-border-subtle shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              {t("nav.myDay")}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">{dateLabel}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-text-secondary">Progress</div>
          <div className="text-lg font-bold text-accent">{progressPercent}%</div>
          <div className="text-[10px] text-text-muted">
            {completedCount} of {myDayTasks.length} done
          </div>
        </div>
      </div>

      {/* Quick Add Form directly into My Day */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a task to My Day... (Press Enter)"
          className="h-11"
        />
        <Button type="submit" variant="primary" size="md">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {myDayTasks.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <Sun className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Focus on your day
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Add tasks that you want to accomplish today. Tasks planned for today will appear here without changing their original deadline.
            </p>
          </div>
        ) : (
          myDayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onSelect={setSelectedTaskId}
              onToggleMyDay={() => toggleDayPlan(task.id, todayStr)}
            />
          ))
        )}
      </div>
    </div>
  );
};
