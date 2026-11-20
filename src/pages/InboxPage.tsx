import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Inbox, Plus } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const InboxPage: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, fetchTasks, createTask, toggleTask, setSelectedTaskId, toggleDayPlan } =
    useTaskStore();

  const [title, setTitle] = useState("");
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title: title.trim(),
      status: "inbox",
      priority: "medium",
    });

    setTitle("");
  };

  // Inbox tasks: status = 'inbox' or unassigned to a project
  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
          <Inbox className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            {t("nav.inbox")}
          </h1>
          <p className="text-xs text-text-secondary">
            Quickly capture ideas and unsorted tasks. Organize and schedule them later.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture a thought or task into Inbox..."
          className="h-11"
        />
        <Button type="submit" variant="primary" size="md">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-2">
        {inboxTasks.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Your inbox is clear!
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Use this space to quickly write down tasks as they come to mind.
            </p>
          </div>
        ) : (
          inboxTasks.map((task) => (
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
