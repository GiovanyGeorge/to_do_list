import React from "react";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            "w-full h-10 px-3 py-2 text-sm rounded-lg bg-background-elevated/70 border text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-accent appearance-none cursor-pointer",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-border-subtle focus:border-accent",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-background-card text-text-primary"
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
