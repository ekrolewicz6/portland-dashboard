import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONTINUUM, PHASES, PRINCIPLES } from "@/lib/homeless/continuum";
import type { CountStatus } from "@/lib/homeless/continuum-types";

/**
 * The short version for the homelessness deep dive: the fourteen stages as a
 * strip with their count status, the four rules, and the link to the full
 * continuum page.
 */
const DOT: Record<CountStatus, string> = {
  known: "bg-[var(--color-fern)]",
  partial: "bg-[var(--color-ember)]",
  unknown: "bg-[var(--color-clay)]",
};

export default function ContinuumTldr() {
  const unknown = CONTINUUM.filter((s) => s.count.status === "unknown").length;
  const known = CONTINUUM.filter((s) => s.count.status === "known").length;
  const phase = new Map(PHASES.map((p) => [p.key, p]));
  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Fourteen stages, sidewalk to lease</p>
          <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">
            {known} counted · {CONTINUUM.length - known - unknown} partly · <span className="text-[var(--color-clay)]">{unknown} not counted at all</span>
          </p>
        </div>
        <p className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 text-[12.5px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">Read in number order, left to right then down: each card is one place a person can physically be, from keeping the door shut to staying housed. The dot says whether anyone can count who is there today.</p>
        <div className="px-5 py-4 sm:px-6">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {CONTINUUM.map((s, i) => {
              const p = phase.get(s.phase);
              return (
                <li key={s.id} className="flex min-h-[92px] flex-col rounded-sm border border-[var(--color-parchment)] border-t-[3px] bg-[var(--color-paper-warm)] px-3 py-2.5" style={{ borderTopColor: p?.color }}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[var(--color-ink-muted)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`h-2 w-2 rounded-full ${DOT[s.count.status]}`} title={s.count.status} />
                  </div>
                  <span className="mt-1.5 text-[13px] font-semibold leading-snug text-[var(--color-ink)]">{s.name}</span>
                  <span className="mt-auto pt-2 font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color: p?.color }}>{p?.label}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="grid gap-[1px] border-t border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.rule} className="bg-white px-4 py-3.5">
              <p className="text-[13.5px] font-semibold leading-tight text-[var(--color-canopy)]">{p.rule}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Link
        href="/deep-dives/continuum"
        className="group flex flex-col gap-3 rounded-sm bg-[var(--color-canopy)] p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(15,36,25,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">The full continuum</p>
          <p className="mt-1 font-editorial-normal text-[21px] leading-tight sm:text-[23px]">Every stage defined, who needs which door first, when Housing First works, and how to count each bucket</p>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-white/70">A single framework for outreach, police, EMS, hospitals, and jails to decide the next best step for each person, and to see where people fall through.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ember-bright)]">
          Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
