"use client";

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  change?: number;
  changeLabel?: string;
}

interface StatGridProps {
  stats: StatItem[];
  accentColor?: string;
}

export default function StatGrid({
  stats,
  accentColor = "#1a3a2a",
}: StatGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: accentColor }}
          />
          <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
            {stat.label}
          </p>
          <p className="text-[28px] lg:text-[32px] font-mono font-semibold text-[var(--color-ink)] leading-none tracking-tight">
            {stat.prefix}
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
            {stat.suffix}
          </p>
          {stat.change !== undefined && (
            <p
              className={`mt-2 text-[12px] font-mono font-medium ${
                stat.change > 0
                  ? "text-green-700"
                  : stat.change < 0
                    ? "text-red-700"
                    : "text-[var(--color-ink-muted)]"
              }`}
            >
              {stat.change > 0 ? "+" : ""}
              {stat.change.toFixed(1)}%{" "}
              <span className="text-[var(--color-ink-muted)]">
                {stat.changeLabel ?? "vs prior year"}
              </span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
