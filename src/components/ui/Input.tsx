import React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              "w-full h-10 px-3 py-2 text-sm rounded-lg bg-background-elevated/70 border text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-1 focus:ring-accent",
              leftIcon ? "pl-9 rtl:pl-3 rtl:pr-9" : "",
              rightIcon ? "pr-9 rtl:pr-3 rtl:pl-9" : "",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-border-subtle focus:border-accent",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 rtl:right-auto rtl:left-3 flex items-center text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 text-sm rounded-lg bg-background-elevated/70 border text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-1 focus:ring-accent resize-none min-h-[80px]",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-border-subtle focus:border-accent",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
