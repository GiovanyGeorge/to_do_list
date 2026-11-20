import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Calendar,
  Sun,
  AlertTriangle,
  GripVertical,
  Trash2,
  ListTree,
} from "lucide-react";
import clsx from "clsx";
import type { TaskWithDetails } from "@shared/types/database";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";

interface TaskItemProps {
  task: TaskWithDetails;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onToggleMyDay?: (id: string) => void;
  onDelete?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onSelect,
  onToggleMyDay,
  onDelete,
  dragHandleProps,
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

  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed === 1).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Priority dot colors matching lifeflow-design.md
  const priorityColor =
    task.priority === "urgent" || task.priority === "high"
      ? "#B91C1C" // Danger / Red
      : task.priority === "medium"
      ? "#C2410C" // Primary / Terracotta
      : "#15803D"; // Success / Green

  return (
    <motion.div
      layout={enabled ? true : false}
      onClick={() => onSelect(task.id)}
      className={clsx(
        "group relative flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        isDone
          ? "bg-white/60 border-[rgba(28,25,23,0.06)] opacity-60 shadow-none"
          : "bg-white border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)] hover:shadow-card hover:-translate-y-0.5 hover:border-accent/30"
      )}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-40 hover:!opacity-90 transition-opacity cursor-grab active:cursor-grabbing text-text-muted shrink-0 -ml-1 p-0.5"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Circular Checkbox */}
        <button
          type="button"
          aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
          onClick={handleToggle}
          className={clsx(
            "w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0",
            isDone
              ? "bg-accent border-accent text-accent-light shadow-sm"
              : "border-[rgba(28,25,23,0.22)] hover:border-accent hover:bg-accent/5 bg-background-elevated/40"
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
                <Check className="w-3 h-3 stroke-[3]" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Title and details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-sm font-medium truncate transition-all duration-150",
                isDone
                  ? "line-through text-text-muted"
                  : "text-text-primary group-hover:text-black"
              )}
            >
              {task.title}
            </span>

            {/* Priority dot indicator */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: priorityColor }}
              title={`Priority: ${task.priority}`}
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 mt-1 text-xs">
            {/* Category Chip */}
            {task.category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{
                  backgroundColor: `${task.category.color || "#C2410C"}15`,
                  color: task.category.color || "#C2410C",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.category.color || "#C2410C" }}
                />
                {task.category.name}
              </span>
            )}

            {/* Subtasks progress */}
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-background-elevated px-2 py-0.5 rounded-full">
                <ListTree className="w-3 h-3 text-text-muted" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </span>
            )}

            {/* Due date */}
            {formattedDueDate && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 text-[11px]",
                  isOverdue ? "text-status-danger font-medium" : "text-text-secondary"
                )}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-status-danger" />
                ) : (
                  <Calendar className="w-3 h-3 text-text-muted" />
                )}
                {formattedDueDate}
              </span>
            )}

            {/* My Day pill */}
            {task.is_in_my_day && (
              <span className="inline-flex items-center gap-1 text-[11px] text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                <Sun className="w-3 h-3" />
                My Day
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {onToggleMyDay && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyDay(task.id);
            }}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              task.is_in_my_day
                ? "text-accent bg-accent/10 hover:bg-accent/20"
                : "text-text-muted hover:text-accent hover:bg-accent/10"
            )}
            title={task.is_in_my_day ? "Remove from My Day" : "Add to My Day"}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
