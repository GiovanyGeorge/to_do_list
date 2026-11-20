import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Calendar, Sun, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { TaskWithDetails } from "@shared/types/database";
import { PriorityBadge } from "../ui/Badge";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";

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
  const { checkboxPop, enabled } = useMotion();
  const { playSound } = useSoundManager();

  const isOverdue =
    task.due_at && !isDone && new Date(task.due_at).getTime() < Date.now();

  const formattedDueDate = task.due_at
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(new Date(task.due_at))
    : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone) {
      playSound("task_complete");
    }
    onToggle(task.id);
  };

  return (
    <motion.div
      layout={enabled ? true : false}
      onClick={() => onSelect(task.id)}
      className={clsx(
        "group flex items-center justify-between p-3.5 rounded-xl border transition-colors duration-150 cursor-pointer",
        isDone
          ? "bg-background-card/40 border-border-subtle/40 opacity-70"
          : "bg-background-card border-border-subtle hover:border-accent/40 hover:bg-background-card/90"
      )}
      whileHover={enabled ? { y: -1 } : undefined}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox button */}
        <button
          type="button"
          aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
          onClick={handleToggle}
          className={clsx(
            "w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0",
            isDone
              ? "bg-accent border-accent text-background"
              : "border-border hover:border-accent bg-background-elevated/40"
          )}
        >
          <AnimatePresence mode="wait">
            {isDone && (
              <motion.span
                variants={checkboxPop}
                initial="initial"
                animate="animate"
                exit="exit"
                key="check"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.span>
            )}
          </AnimatePresence>
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
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-0.5">
            {formattedDueDate && (
              <span
                className={clsx(
                  "text-xs flex items-center gap-1",
                  isOverdue
                    ? "text-red-400"
                    : "text-text-muted"
                )}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                {formattedDueDate}
              </span>
            )}
            {task.is_in_my_day && (
              <span className="text-xs text-accent flex items-center gap-1">
                <Sun className="w-3 h-3" />
                My Day
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-xs text-text-muted">
                {task.subtasks.filter((s) => s.completed).length}/
                {task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onToggleMyDay && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyDay(task.id);
            }}
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              task.is_in_my_day
                ? "text-accent hover:bg-accent/10"
                : "text-text-muted hover:text-accent hover:bg-accent/10"
            )}
            title={task.is_in_my_day ? "Remove from My Day" : "Add to My Day"}
          >
            <Sun className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
