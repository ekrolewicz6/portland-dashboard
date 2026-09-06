"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CAVEATS } from "@/lib/homeless/continuum";

const KINDS: { kind: string; label: string }[] = [
  { kind: "cohort", label: "People with no pathway yet" },
  { kind: "legal", label: "Legal limits on a shared count" },
  { kind: "data", label: "Data that does not exist, or already does" },
  { kind: "governance", label: "Nobody owns it yet" },
  { kind: "risk", label: "How the metrics could mislead" },
];

/** The critique kept in view: titles always visible, bodies on tap. */
export default function CaveatsAccordion() {
  const [open, setOpen] = useState<string>("");
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What this does not yet cover</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{CAVEATS.length} findings from the completeness critic · tap one</p>
      </div>
      <div className="grid gap-[1px] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-5">
        {KINDS.map((k) => {
          const items = CAVEATS.filter((c) => c.kind === k.kind);
          return (
            <div key={k.kind} className="bg-white px-4 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ember)]">{k.label}</p>
              <ul className="mt-2 space-y-1">
                {items.map((c) => {
                  const on = open === c.title;
                  return (
                    <li key={c.title}>
                      <button type="button" onClick={() => setOpen(on ? "" : c.title)} aria-expanded={on} className="flex w-full items-start justify-between gap-2 rounded-sm px-1 py-1.5 text-left text-[13px] font-semibold leading-snug text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-warm)]">
                        {c.title}
                        <ChevronDown className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-ink-muted)] transition-transform ${on ? "rotate-180" : ""}`} />
                      </button>
                      {on ? <p className="px-1 pb-2 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">{c.body}</p> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
