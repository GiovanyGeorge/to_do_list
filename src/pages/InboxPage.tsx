import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Inbox, Plus, Sparkles } from "lucide-react";
import { Reorder } from "motion/react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { TaskWithDetails } from "@shared/types/database";

export const InboxPage: React.FC = () => {
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

  const [title, setTitle] = useState("");
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      status: "inbox",
      priority: "medium",
    });

    setTitle("");
  };

  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  const handleReorder = (newOrderedTasks: TaskWithDetails[]) => {
    reorderTasks(newOrderedTasks.map((t) => t.id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-glow">
          <Inbox className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
            {t("nav.inbox") || "Inbox"}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Quickly capture ideas and unsorted tasks. Organize and schedule them later.
          </p>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture a thought or task into Inbox... (Press Enter)"
          className="h-11 shadow-[0_1px_2px_rgba(28,25,23,0.04)]"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!title.trim()}
          className="h-11 px-5 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </form>

      {/* Task List with Drag & Drop */}
      <div>
        {inboxTasks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-accent mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold font-sora text-text-primary mb-1">
              Your inbox is clear!
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Use this space to quickly capture thoughts and tasks as they come to mind.
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={inboxTasks}
            onReorder={handleReorder}
            className="space-y-2.5"
          >
            {inboxTasks.map((task) => (
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
