"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { TRIAGE, STATS } from "@/lib/homeless/data";
import { fmtNum } from "@/lib/homeless/engine";

/**
 * Three populations, one coat. A proportional share bar first (the only
 * sourced split is chronic vs. not), then the three tabs, then the cost of
 * the right fix drawn against the most expensive one.
 */

const HATCH = "repeating-linear-gradient(45deg, rgba(74,127,158,0.6) 0 5px, rgba(74,127,158,0.15) 5px 10px)";
const COST_BY_ID: Record<string, { low: number; high: number }> = {
  economic: { low: STATS.rrhCostPerYear, high: STATS.rrhCostPerYear },
  moderate: { low: STATS.rrhCostPerYear, high: STATS.pshCostPerYear },
  chronic: { low: STATS.pshCostPerYear, high: STATS.pshCostPerYear },
};

export default function TriageTool() {
  const [active, setActive] = useState(TRIAGE[0].id);
  const group = TRIAGE.find((g) => g.id === active)!;
  const chronicPct = Math.round(STATS.chronicSharePct * 100);
  const cost = COST_BY_ID[group.id];
  const max = STATS.pshCostPerYear;

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      {/* Share bar */}
      <div className="border-b border-[var(--color-parchment)] px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Who is on the street</p>
          <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">Multnomah 2023 count · 6,297 people</p>
        </div>
        <div className="mt-3 flex h-9 w-full gap-[2px] overflow-hidden rounded-sm">
          <button
            type="button"
            onClick={() => setActive("economic")}
            className={`flex items-center px-3 text-left transition-opacity ${active === "chronic" ? "opacity-60" : ""}`}
            style={{ width: `${100 - chronicPct}%`, backgroundColor: "var(--color-fern)" }}
            aria-label="Not chronically homeless: economic and episodic groups"
          >
            <span className="truncate font-mono text-[11px] font-semibold text-white"><span className="sm:hidden">{100 - chronicPct}% not chronic</span><span className="hidden sm:inline">{100 - chronicPct}% · economic + episodic, the majority</span></span>
          </button>
          <button
            type="button"
            onClick={() => setActive("chronic")}
            className={`flex items-center px-3 text-left transition-opacity ${active !== "chronic" ? "opacity-60" : ""}`}
            style={{ width: `${chronicPct}%`, backgroundColor: "var(--color-clay)" }}
            aria-label="Chronically homeless"
          >
            <span className="truncate font-mono text-[11px] font-semibold text-white">{chronicPct}% chronic</span>
          </button>
        </div>
        <p className="mt-2 text-[11.5px] text-[var(--color-ink-muted)]">
          The count only separates chronic from not. The economic vs. episodic line inside the majority is a typology, not a measured split.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid border-b border-[var(--color-parchment)] sm:grid-cols-3" role="tablist">
        {TRIAGE.map((g) => {
          const on = g.id === active;
          return (
            <button
              key={g.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(g.id)}
              className={`min-h-[56px] border-b p-3.5 text-left transition-colors last:border-r-0 sm:border-b-0 sm:border-r border-[var(--color-parchment)] ${
                on ? "bg-[var(--color-paper-warm)]" : "bg-white hover:bg-[var(--color-paper-warm)]/60"
              }`}
            >
              <span className="mb-1.5 block h-1 w-8 rounded-full" style={{ backgroundColor: on ? g.color : "var(--color-parchment)" }} />
              <span className={`block text-[14px] font-semibold ${on ? "text-[var(--color-canopy)]" : "text-[var(--color-ink-light)]"}`}>{g.label}</span>
              <span className="block text-[11.5px] text-[var(--color-ink-muted)]">{g.share}</span>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className="p-5 sm:p-6">
        <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--color-ink)]">{group.who}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[var(--color-fern)]/30 bg-[var(--color-sage-tint)] p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-fern)]"><Check className="h-3.5 w-3.5" /> The right fix</p>
            <p className="mt-1.5 text-[14px] font-medium leading-snug text-[var(--color-ink)]">{group.rightFix}</p>
          </div>
          <div className="rounded-sm border border-[var(--color-clay)]/30 bg-[var(--color-clay-tint)] p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]"><X className="h-3.5 w-3.5" /> The expensive mistake</p>
            <p className="mt-1.5 text-[14px] leading-snug text-[var(--color-ink)]">{group.mismatch}</p>
          </div>
        </div>

        {/* Cost bar */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Cost of the right fix, per household per year</p>
            <p className="whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums text-[var(--color-ink)]">
              {cost.low === cost.high ? `≈ $${fmtNum(cost.low)}` : `$${fmtNum(cost.low)}–${fmtNum(cost.high)}`}
            </p>
          </div>
          <div className="mt-1.5 h-4 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
            {cost.low === cost.high ? (
              <div className="h-full rounded-sm" style={{ width: `${(cost.low / max) * 100}%`, backgroundColor: group.color }} />
            ) : (
              <div className="flex h-full">
                <div className="h-full" style={{ width: `${(cost.low / max) * 100}%`, backgroundColor: group.color }} />
                <div className="h-full" style={{ width: `${((cost.high - cost.low) / max) * 100}%`, backgroundImage: HATCH }} />
              </div>
            )}
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-0.5 font-mono text-[10.5px] tabular-nums text-[var(--color-ink-muted)]">
            <span>rapid rehousing ${fmtNum(STATS.rrhCostPerYear)}</span>
            <span>supportive housing ${fmtNum(STATS.pshCostPerYear)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
