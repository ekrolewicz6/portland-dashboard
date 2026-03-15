import type { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS color value for the left accent stripe (omit to hide) */
  accent?: string;
  /** Enable hover lift effect */
  hover?: boolean;
  /** Padding preset */
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  accent,
  hover = false,
  padding = "md",
  className,
  children,
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden",
        hover &&
          "cursor-pointer transition-all duration-300 hover:border-[var(--color-sage)] hover:shadow-[0_1px_2px_rgba(15,36,25,0.04),0_8px_32px_rgba(15,36,25,0.06)] hover:-translate-y-0.5",
        paddingStyles[padding],
        className
      )}
      style={accent ? { ...style, "--accent-color": accent } as React.CSSProperties : style}
      {...props}
    >
      {accent && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accent }}
        />
      )}
      {children}
    </div>
  );
}

export type { CardProps };
