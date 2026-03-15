import type { ReactNode, ThHTMLAttributes } from "react";
import clsx from "clsx";
import { ChevronUp, ChevronDown } from "lucide-react";

/* ─── Root wrapper ──────────────────────────────────────────────────── */

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full text-[14px] text-[var(--color-ink)]">
        {children}
      </table>
    </div>
  );
}

/* ─── Head ──────────────────────────────────────────────────────────── */

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--color-parchment)]">
      {children}
    </thead>
  );
}

/* ─── Header cell ───────────────────────────────────────────────────── */

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sorted?: "asc" | "desc" | false;
  onSort?: () => void;
}

export function TableHeader({
  sorted,
  onSort,
  className,
  children,
  ...props
}: TableHeaderProps) {
  const isSortable = onSort !== undefined;

  return (
    <th
      className={clsx(
        "px-4 py-3 text-left text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.08em]",
        isSortable && "cursor-pointer select-none hover:text-[var(--color-ink-light)]",
        className
      )}
      onClick={onSort}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sorted === "asc" && <ChevronUp className="w-3 h-3" />}
        {sorted === "desc" && <ChevronDown className="w-3 h-3" />}
      </span>
    </th>
  );
}

/* ─── Body ──────────────────────────────────────────────────────────── */

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-parchment)]">{children}</tbody>;
}

/* ─── Row ───────────────────────────────────────────────────────────── */

export function TableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={clsx(
        "hover:bg-[var(--color-paper-warm)] transition-colors",
        className
      )}
    >
      {children}
    </tr>
  );
}

/* ─── Cell ──────────────────────────────────────────────────────────── */

export function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={clsx("px-4 py-3", className)}>{children}</td>
  );
}
