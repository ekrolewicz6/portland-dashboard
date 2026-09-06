"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { CONTINUUM, FIRST_DOOR, FIRST_DOOR_RULES } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";

/** Walk the six questions the way a responder would: answer yes or no, in order, and land on a door. */
export default function TriageStepper() {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const [rules, setRules] = useState(false);
  const q = FIRST_DOOR[done ?? i];
  const stage = CONTINUUM.find((s) => s.id === q.stageId);
  const last = i === FIRST_DOOR.length - 1;
  const reset = () => { setI(0); setDone(null); };

  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Six questions, in order. Answer them.</p>
        <ol className="flex flex-wrap gap-1">
          {FIRST_DOOR.map((f, k) => (
            <li key={f.n} className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold ${k === (done ?? i) ? "bg-[var(--color-canopy)] text-white" : k < (done ?? i) ? "bg-[var(--color-parchment)] text-[var(--color-ink-muted)] line-through" : "border border-[var(--color-parchment)] text-[var(--color-ink-muted)]"}`}>{f.n}</li>
          ))}
        </ol>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Question {q.n} of {FIRST_DOOR.length}</p>
          <h3 className="mt-1 font-editorial-normal text-[26px] leading-tight text-[var(--color-canopy)] sm:text-[30px]">{q.ask}</h3>
          <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">What you can see or ask</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-ink-light)]">{q.observe}</p>
          {done == null ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => setDone(i)} className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-[var(--color-ember)] px-5 text-[14px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">Yes <ArrowRight className="h-4 w-4" /></button>
              {!last ? <button type="button" onClick={() => setI(i + 1)} className="inline-flex min-h-[44px] items-center rounded-sm border border-[var(--color-parchment)] bg-white px-5 text-[14px] font-semibold text-[var(--color-canopy)] transition-colors hover:border-[var(--color-sage)]">No, next question</button> : null}
              {i > 0 ? <button type="button" onClick={reset} className="inline-flex min-h-[44px] items-center gap-1.5 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)]"><RotateCcw className="h-3.5 w-3.5" /> start over</button> : null}
            </div>
          ) : (
            <button type="button" onClick={reset} className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-[var(--color-parchment)] px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"><RotateCcw className="h-3.5 w-3.5" /> Start over</button>
          )}
        </div>

        <div className={`rounded-sm border p-4 transition-opacity sm:p-5 ${done == null ? "border-dashed border-[var(--color-parchment)] opacity-60" : "border-[var(--color-canopy)]"}`}>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-fern)]">{done == null ? "If yes, the first door is" : "The first door"}</p>
          <p className="mt-1 text-[18px] font-semibold leading-snug text-[var(--color-canopy)]">{q.door}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{q.ifYes}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">stage {String(CONTINUUM.findIndex((s) => s.id === q.stageId) + 1).padStart(2, "0")} · {stage?.name}</p>
          <div className="mt-3 rounded-sm border border-dashed border-[var(--color-clay)] bg-[var(--color-clay-tint)] px-4 py-3">
            <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">That door in Portland tonight</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink)]">{q.today}</p>
            <SourceLinks ids={q.src ?? []} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-parchment)]">
        <button type="button" onClick={() => setRules(!rules)} aria-expanded={rules} className="flex w-full items-center justify-between px-5 py-3 text-left sm:px-6">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">The six rules every agency signs</span>
          <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">{rules ? "hide" : "show"}</span>
        </button>
        {rules ? (
          <ol className="grid gap-x-8 gap-y-3 border-t border-[var(--color-parchment)] px-5 py-4 md:grid-cols-2 xl:grid-cols-3 sm:px-6">
            {FIRST_DOOR_RULES.map((r, k) => (
              <li key={k} className="flex gap-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]"><span className="font-mono text-[12px] font-bold text-[var(--color-ember)]">{k + 1}</span>{r}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}
