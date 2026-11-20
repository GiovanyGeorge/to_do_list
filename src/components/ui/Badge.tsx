import React from "react";
import clsx from "clsx";

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "inbox" | "todo" | "in_progress" | "done" | "cancelled";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "neutral";
  size?: "xs" | "sm";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "xs",
  ...props
}) => {
  const variantStyles = {
    default: "bg-background-elevated text-text-secondary border border-border-subtle",
    accent: "bg-accent/15 text-accent border border-accent/25",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    danger: "bg-red-500/15 text-red-400 border border-red-500/25",
    neutral: "bg-gray-800 text-gray-300 border border-gray-700",
  };

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 font-medium rounded-md",
    sm: "text-xs px-2.5 py-0.5 font-medium rounded-md",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 leading-none whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className,
}) => {
  const map: Record<Priority, { label: string; variant: BadgeProps["variant"] }> = {
    low: { label: "Low", variant: "neutral" },
    medium: { label: "Medium", variant: "default" },
    high: { label: "High", variant: "warning" },
    urgent: { label: "Urgent", variant: "danger" },
  };

  const conf = map[priority] || map.medium;
  return (
    <Badge variant={conf.variant} className={className}>
      {conf.label}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className,
}) => {
  const map: Record<TaskStatus, { label: string; variant: BadgeProps["variant"] }> = {
    inbox: { label: "Inbox", variant: "default" },
    todo: { label: "To Do", variant: "neutral" },
    in_progress: { label: "In Progress", variant: "accent" },
    done: { label: "Done", variant: "success" },
    cancelled: { label: "Cancelled", variant: "danger" },
  };

  const conf = map[status] || map.todo;
  return (
    <Badge variant={conf.variant} className={className}>
      {conf.label}
    </Badge>
  );
};
