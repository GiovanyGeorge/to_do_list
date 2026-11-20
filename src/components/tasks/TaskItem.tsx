import React from "react";
import { Check, Calendar, Sun, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { TaskWithDetails, SubtaskRecord } from "@shared/types/database";
import { PriorityBadge } from "../ui/Badge";

interface TaskItemProps {
  task: TaskWithDetails;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onToggleMyDay?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onSelect,
  onToggleMyDay,
}) => {
  const isDone = task.status === "done";

  // Check if overdue: has due date in past and not done
  const isOverdue =
    task.due_at && !isDone && new Date(task.due_at).getTime() < Date.now();

  const formattedDueDate = task.due_at
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(new Date(task.due_at))
    : null;

  return (
    <div
      onClick={() => onSelect(task.id)}
      className={clsx(
        "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 cursor-pointer",
        isDone
          ? "bg-background-card/40 border-border-subtle/40 opacity-70"
          : "bg-background-card border-border-subtle hover:border-accent/40 hover:bg-background-card/90"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox button */}
        <button
          type="button"
          aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={clsx(
            "w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0",
            isDone
              ? "bg-accent border-accent text-background"
              : "border-border hover:border-accent bg-background-elevated/40"
          )}
        >
          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Title and details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-sm font-medium truncate",
                isDone ? "line-through text-text-muted" : "text-text-primary"
              )}
            >
              {task.title}
            </span>

            {task.blocked_by_incomplete_count && task.blocked_by_incomplete_count > 0 ? (
              <span
                title="Blocked by incomplete dependency"
                className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded"
              >
                Blocked
              </span>
            ) : null}
          </div>

          {/* Subtasks summary & Due date */}
          <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted">
            {task.subtasks && task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter((s: SubtaskRecord) => s.completed === 1).length}/
                {task.subtasks.length} subtasks
              </span>
            )}

            {formattedDueDate && (
              <span
                className={clsx(
                  "flex items-center gap-1",
                  isOverdue ? "text-red-400 font-medium" : "text-text-muted"
                )}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>{formattedDueDate}</span>
              </span>
            )}

            {task.category && (
              <span className="px-1.5 py-0.2 rounded bg-background-elevated text-text-secondary">
                {task.category.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <PriorityBadge priority={task.priority} />

        {onToggleMyDay && (
          <button
            type="button"
            title={task.is_in_my_day ? "Remove from My Day" : "Add to My Day"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyDay(task.id);
            }}
            className={clsx(
              "p-1.5 rounded-lg border transition-colors",
              task.is_in_my_day
                ? "bg-accent/15 text-accent border-accent/30"
                : "text-text-muted border-border-subtle hover:text-text-primary hover:bg-background-elevated opacity-0 group-hover:opacity-100"
            )}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
