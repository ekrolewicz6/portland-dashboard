"use client";

import { useState } from "react";
import { CONTINUUM_SOURCES } from "@/lib/homeless/continuum";

const FIRST = 12;

/** The source registry: primary documents first, the rest behind a toggle. */
export default function SourcesList() {
  const [all, setAll] = useState(false);
  const shown = all ? CONTINUUM_SOURCES : CONTINUUM_SOURCES.slice(0, FIRST);
  const kinds = ["primary", "research", "news"].map((k) => ({ k, n: CONTINUUM_SOURCES.filter((s) => s.kind === k).length }));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{CONTINUUM_SOURCES.length} sources · {kinds.map((x) => `${x.n} ${x.k}`).join(" · ")}</p>
        <button type="button" onClick={() => setAll(!all)} aria-expanded={all} className="min-h-[36px] rounded-sm border border-[var(--color-parchment)] bg-white px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-ink-light)] transition-colors hover:border-[var(--color-sage)]">
          {all ? "Show fewer" : `Show all ${CONTINUUM_SOURCES.length}`}
        </button>
      </div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 2xl:grid-cols-3">
        {shown.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="group -m-2 flex items-start gap-3 rounded-sm border border-transparent p-2 transition-colors hover:border-[var(--color-parchment)] hover:bg-white">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-fern)]" />
            <span>
              <span className="block text-[13px] leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-canopy)]">{s.title}</span>
              <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">{s.org} · {s.kind}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
