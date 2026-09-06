"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DEADLINE_BUCKETS, PLACEMENT_COHORTS } from "@/lib/homeless/data";

/**
 * Twelve cohorts on one ladder, ordered by how fast the first placement has
 * to happen. Each row opens to show the capacity, owners, and metrics that
 * used to be twelve full-height cards.
 */
export default function CohortLadder() {
  const [open, setOpen] = useState<string | null>("families");
  const byId = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c]));

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-parchment)] px-5 py-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Twelve cohorts, by the clock they run on</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">tap a row</p>
      </div>

      {DEADLINE_BUCKETS.map((bucket, bi) => (
        <div key={bucket.key} className="grid border-b border-[var(--color-parchment)] last:border-b-0 md:grid-cols-[200px_1fr]">
          {/* Clock column */}
          <div className="relative border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4 md:border-b-0 md:border-r sm:px-6">
            <div className="flex items-center gap-2.5 md:block">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-white shadow-[0_0_0_1px_var(--color-ember)]"
                style={{ backgroundColor: `color-mix(in oklab, var(--color-ember) ${100 - bi * 15}%, white)` }}
                aria-hidden
              />
              <div className="md:mt-2">
                <p className="text-[13px] font-semibold leading-tight text-[var(--color-canopy)]">{bucket.label}</p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">{bucket.sub}</p>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--color-parchment)]">
            {bucket.ids.map((id) => {
              const c = byId.get(id)!;
              const on = open === id;
              return (
                <div key={id}>
                  <button
                    type="button"
                    onClick={() => setOpen(on ? null : id)}
                    aria-expanded={on}
                    className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-paper-warm)]/60 sm:px-6 ${on ? "bg-[var(--color-paper-warm)]/60" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-[14.5px] font-semibold text-[var(--color-ink)]">{c.cohort}</span>
                        <span className="font-mono text-[11px] text-[var(--color-ember)]">{c.deadline}</span>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{c.firstPlacement}</p>
                    </div>
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[var(--color-ink-muted)] transition-transform ${on ? "rotate-180" : ""}`} />
                  </button>
                  {on ? (
                    <div className="grid gap-4 border-t border-dashed border-[var(--color-parchment)] px-5 py-4 sm:px-6 md:grid-cols-3">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Capacity needed</p>
                        <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-[var(--color-ink-light)]">
                          {c.capacityNeeded.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Who owns it</p>
                        <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-[var(--color-ink-light)]">
                          {c.responsibleOwners.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Measure</p>
                        <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-[var(--color-ink-light)]">
                          {c.metrics.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
