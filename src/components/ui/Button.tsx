import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** When true, renders children directly — useful for wrapping <Link> or <a> */
  asChild?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-canopy)] text-white hover:bg-[var(--color-canopy-mid)] active:bg-[var(--color-canopy)]",
  secondary:
    "bg-[var(--color-paper-warm)] text-[var(--color-ink)] border border-[var(--color-parchment)] hover:bg-[var(--color-paper)] active:bg-[var(--color-parchment)]",
  accent:
    "bg-[var(--color-ember)] text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)] active:bg-[var(--color-ember)]",
  ghost:
    "bg-transparent text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)]/50 active:bg-[var(--color-parchment)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[12px] gap-1.5",
  md: "px-4 py-2.5 text-[14px] gap-2",
  lg: "px-6 py-3 text-[15px] gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", asChild, className, children, ...props }, ref) => {
    const classes = clsx(
      "inline-flex items-center justify-center font-medium rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sage)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asChild) {
      return <span className={classes}>{children}</span>;
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export type { ButtonProps };
