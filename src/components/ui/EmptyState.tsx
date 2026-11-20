import React from "react";
import { Button } from "./Button";
import clsx from "clsx";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-background-card/50 border border-border-subtle/70",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-background-elevated flex items-center justify-center text-text-muted mb-3 border border-border-subtle/50">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
