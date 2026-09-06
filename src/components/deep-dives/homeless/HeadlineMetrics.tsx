"use client";

import { useState } from "react";
import { HEADLINE_METRICS } from "@/lib/homeless/continuum";

/** The nine numbers the whole system is judged on: names always, definitions on tap. */
export default function HeadlineMetrics() {
  const [defs, setDefs] = useState(false);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={() => setDefs(!defs)} aria-pressed={defs} className="rounded-sm border border-[var(--color-parchment)] bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)]">{defs ? "hide definitions" : "show definitions and targets"}</button>
      </div>
      <ol className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-3">
        {HEADLINE_METRICS.map((m, i) => (
          <li key={m.name} className="bg-white px-4 py-3.5">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-[13px] font-bold text-[var(--color-ember)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[14.5px] font-semibold leading-tight text-[var(--color-ink)]">{m.name}</span>
            </p>
            {defs ? <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{m.def}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
