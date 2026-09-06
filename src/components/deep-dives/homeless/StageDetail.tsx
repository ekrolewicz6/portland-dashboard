"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CONTINUUM, PHASES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";
import type { CountStatus } from "@/lib/homeless/continuum-types";

/**
 * Every stage, opened one at a time: what it is for, who enters and how they
 * leave, how long, who belongs, how to count it, what Portland has, and the
 * documented gap. The definitions are the point: this is the shared
 * vocabulary for police, EMS, hospitals, jails, and outreach.
 */

const STATUS: Record<CountStatus, { label: string; cls: string }> = {
  known: { label: "counted", cls: "text-[var(--color-fern)]" },
  partial: { label: "partly counted", cls: "text-[#a9784f]" },
  unknown: { label: "not counted", cls: "text-[var(--color-clay)]" },
};

export default function StageDetail() {
  const [open, setOpen] = useState<string | null>(CONTINUUM[0]?.id ?? null);
  const cohortName = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  const phase = new Map(PHASES.map((p) => [p.key, p]));

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 py-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Every stage, defined</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">tap a stage · entry, exit, duration, count, Portland today, gap</p>
      </div>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {CONTINUUM.map((s, i) => {
          const on = open === s.id;
          const p = phase.get(s.phase);
          const st = STATUS[s.count.status];
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setOpen(on ? null : s.id)}
                aria-expanded={on}
                className={`grid w-full items-center gap-x-4 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-paper-warm)]/60 sm:px-6 md:grid-cols-[32px_180px_1fr_130px_20px] ${on ? "bg-[var(--color-paper-warm)]/60" : ""}`}
              >
                <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--color-ink-muted)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p?.color }} aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{p?.label}</span>
                </span>
                <span>
                  <span className="text-[15px] font-semibold text-[var(--color-ink)]">{s.name}</span>
                  <span className="block font-mono text-[10.5px] text-[var(--color-ink-muted)] sm:ml-2 sm:inline">{s.duration.split(";")[0].split(".")[0]}</span>
                </span>
                <span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${st.cls}`}>{st.label}</span>
                <ChevronDown className={`h-4 w-4 text-[var(--color-ink-muted)] transition-transform ${on ? "rotate-180" : ""}`} />
              </button>
              {on ? (
                <div className="border-t border-dashed border-[var(--color-parchment)] px-5 py-5 sm:px-6">
                  <p className="max-w-3xl text-[14.5px] leading-relaxed text-[var(--color-ink)]">{s.purpose}</p>
                  <div className="mt-4 grid gap-5 md:grid-cols-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-fern)]">Enter when</p>
                      <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{s.entry}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-river)]">Leave when</p>
                      <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{s.exit}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">How long</p>
                      <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{s.duration}</p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Who passes through</p>
                      <p className="mt-1 flex flex-wrap gap-1">
                        {s.cohorts.map((c) => (
                          <span key={c} className="rounded-full border border-[var(--color-parchment)] px-2 py-0.5 text-[10.5px] text-[var(--color-ink-light)]">{cohortName.get(c) ?? c}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-[1px] rounded-sm bg-[var(--color-parchment)] md:grid-cols-3">
                    <div className="bg-[var(--color-paper-warm)] p-4">
                      <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${st.cls}`}>How to count it · {st.label}</p>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{s.count.what}</p>
                      <p className="mt-2 text-[11.5px] leading-snug text-[var(--color-ink-muted)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em]">source · </span>{s.count.source}</p>
                      <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em]">cadence · </span>{s.count.cadence}</p>
                    </div>
                    <div className="bg-white p-4">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Portland today</p>
                      <p className="mt-1.5 font-mono text-[13px] font-semibold tabular-nums text-[var(--color-ink)]">{s.count.portlandToday}</p>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{s.exists}</p>
                    </div>
                    <div className="bg-[var(--color-clay-tint)] p-4">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">The gap</p>
                      <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{s.gap}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
