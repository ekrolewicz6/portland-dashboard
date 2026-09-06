"use client";

import { useState } from "react";
import { HOUSING_FIRST } from "@/lib/homeless/continuum";

const GROUPS = [
  { verdict: "works", label: "Works", sub: "offer the lease now", color: "var(--color-fern)", tint: "var(--color-sage-tint)" },
  { verdict: "works-with-conditions", label: "Works with conditions", sub: "the conditions are the model", color: "var(--color-ember)", tint: "#f4ebe0" },
  { verdict: "not-by-itself", label: "Not by itself", sub: "something else comes first or alongside", color: "var(--color-clay)", tint: "var(--color-clay-tint)" },
] as const;

/** Thirteen cases, three verdicts. The rule is shown; the evidence is one tap away. */
export default function HousingFirstBoard() {
  const [ev, setEv] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">A placement rule, case by case</p>
        <button type="button" onClick={() => setEv(!ev)} aria-pressed={ev} className={`min-h-[36px] rounded-sm border px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${ev ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"}`}>{ev ? "Hide the evidence" : "Show the evidence"}</button>
      </div>
      <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
        {GROUPS.map((g) => {
          const rules = HOUSING_FIRST.filter((r) => r.verdict === g.verdict);
          return (
            <div key={g.verdict} className="rounded-sm border border-[var(--color-parchment)] bg-white">
              <div className="flex items-baseline justify-between border-b-[3px] px-5 pt-4 pb-3" style={{ borderColor: g.color }}>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: g.color }}>{g.label}</p>
                  <p className="text-[12.5px] text-[var(--color-ink-muted)]">{g.sub}</p>
                </div>
                <span className="font-editorial-normal text-[28px] leading-none" style={{ color: g.color }}>{rules.length}</span>
              </div>
              <ul className="divide-y divide-[var(--color-parchment)]">
                {rules.map((r) => (
                  <li key={r.who} className="px-5 py-4">
                    <p className="text-[14.5px] font-semibold leading-tight text-[var(--color-ink)]">{r.who}</p>
                    <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{r.finding}</p>
                    {ev ? <p className="mt-2 rounded-sm px-2.5 py-2 text-[12px] leading-snug text-[var(--color-ink-light)]" style={{ backgroundColor: g.tint }}><span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Evidence · </span>{r.evidence}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
