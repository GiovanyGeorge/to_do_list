import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-accent text-background hover:bg-accent-hover font-semibold shadow-sm active:scale-[0.98]",
      secondary:
        "bg-background-elevated text-text-primary hover:bg-[#303744] border border-border-subtle active:scale-[0.98]",
      outline:
        "border border-border-subtle text-text-primary hover:bg-background-elevated active:scale-[0.98]",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-background-elevated active:scale-[0.98]",
      danger:
        "bg-red-600/90 text-white hover:bg-red-600 active:scale-[0.98] focus:ring-red-500/50",
    };

    const sizeStyles = {
      xs: "text-xs px-2.5 py-1 gap-1.5",
      sm: "text-xs px-3 py-1.5 gap-2",
      md: "text-sm px-4 py-2 gap-2.5",
      lg: "text-base px-5 py-2.5 gap-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
