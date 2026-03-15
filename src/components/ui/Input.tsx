import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[var(--color-ink-light)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2.5 bg-[var(--color-paper-warm)] border rounded text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] transition-colors focus:outline-none focus:ring-1",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-300"
              : "border-[var(--color-parchment)] focus:border-[var(--color-sage)] focus:ring-[var(--color-sage)]",
            className
          )}
          {...props}
        />
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

Input.displayName = "Input";

export default Input;
export type { InputProps };
