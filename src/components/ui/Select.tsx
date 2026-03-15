import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[13px] font-medium text-[var(--color-ink-light)] mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border rounded text-[14px] text-[var(--color-ink)] transition-colors focus:outline-none focus:ring-1 appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px]",
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
            "pr-10",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-300"
              : "border-[var(--color-parchment)] focus:border-[var(--color-sage)] focus:ring-[var(--color-sage)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-[12px] text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
export type { SelectProps };
