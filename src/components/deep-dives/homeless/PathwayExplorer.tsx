"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CONTINUUM, EXTRA_COHORTS, PATHWAYS, PHASES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";
import SourceLinks from "./SourceLinks";

/**
 * Pick a person; see their path. Twelve cohorts, each an ordered chain of
 * stages drawn across the continuum, with the evidence for that order.
 * The first door is marked, because most failures are the wrong first door.
 */
export default function PathwayExplorer() {
  const [cohort, setCohort] = useState(PATHWAYS[0]?.cohort ?? "");
  const path = PATHWAYS.find((p) => p.cohort === cohort) ?? PATHWAYS[0];
  const cohortName = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  const stage = new Map(CONTINUUM.map((s) => [s.id, s]));
  const phase = new Map(PHASES.map((p) => [p.key, p]));
  const inPath = new Map(path.steps.map((id, i) => [id, i + 1]));

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      {/* Cohort picker */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-4 py-3 sm:px-5">
        <span className="mr-1 self-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Pick a person</span>
        {PATHWAYS.map((p) => {
          const on = p.cohort === cohort;
          return (
            <button
              key={p.cohort}
              type="button"
              onClick={() => setCohort(p.cohort)}
              aria-pressed={on}
              className={`min-h-[34px] rounded-sm border px-2.5 text-[12px] font-medium transition-colors ${on ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"}`}
            >
              {cohortName.get(p.cohort) ?? EXTRA_COHORTS[p.cohort] ?? p.cohort}
            </button>
          );
        })}
      </div>

      {/* All 14 stages as a track; the path lights up */}
      <div className="px-4 pt-5 pb-2 sm:px-5">
        <p className="mb-3 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">The fourteen stages in order, left to right then down. The ones this person passes through light up with their step number; the amber circle is the first door.</p>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {CONTINUUM.map((s) => {
            const n = inPath.get(s.id);
            const p = phase.get(s.phase);
            return (
              <li key={s.id} className={`flex min-h-[96px] flex-col rounded-sm border px-3 py-2.5 text-center transition-opacity ${n ? "border-[var(--color-canopy)] bg-white" : "border-[var(--color-parchment)] bg-[var(--color-paper-warm)] opacity-45"}`}>
                <span className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold ${n === 1 ? "bg-[var(--color-ember)] text-[var(--color-canopy)]" : n ? "bg-[var(--color-canopy)] text-white" : "bg-transparent text-transparent"}`}>{n ?? "·"}</span>
                <span className="mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--color-ink)]">{s.name}</span>
                <span className="mt-auto pt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: p?.color }}>{p?.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* The chain, in words */}
      <div className="px-4 pb-5 sm:px-5">
        <ol className="mt-3 flex flex-wrap items-center gap-1.5">
          {path.steps.map((id, i) => (
            <li key={id} className="flex items-center gap-1.5">
              <span className={`rounded-sm px-2.5 py-1 text-[12.5px] font-medium ${i === 0 ? "bg-[var(--color-ember)] text-[var(--color-canopy)]" : "bg-[var(--color-canopy)]/[0.06] text-[var(--color-canopy)]"}`}>
                <span className="mr-1 font-mono text-[10px]">{i + 1}</span>{stage.get(id)?.name ?? id}
              </span>
              {i < path.steps.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-[var(--color-ink-muted)]" /> : null}
            </li>
          ))}
        </ol>
        <p className="mt-3 max-w-4xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{path.why}</p>
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          strongest evidence for this order: <span className="text-[var(--color-fern)]">{path.evidence}</span>
          <span className="ml-3 normal-case tracking-normal">· the <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ember)] align-middle font-mono text-[9px] font-bold text-[var(--color-canopy)]">1</span> is the door that has to exist first</span>
        </p>
        <SourceLinks ids={path.evidenceSource ? [path.evidenceSource] : []} />
      </div>
    </div>
  );
}
