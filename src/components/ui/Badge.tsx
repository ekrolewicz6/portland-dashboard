import type { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-[var(--color-ember)]/10 text-[var(--color-clay)] border-[var(--color-ember)]/30",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-stone-100 text-stone-600 border-stone-200",
  info: "bg-[var(--color-river)]/10 text-[var(--color-river-deep)] border-[var(--color-river)]/25",
};

export default function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] border rounded-sm font-mono",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant };
