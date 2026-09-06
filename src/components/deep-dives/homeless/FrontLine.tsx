"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { OBJECTIONS } from "@/lib/homeless/continuum";

/** What each part of the front line will say about this design, and the answer. Grouped by role; one group open at a time. */
export default function FrontLine() {
  const roles = Array.from(new Set(OBJECTIONS.map((o) => o.role)));
  const [open, setOpen] = useState<string>(roles[0] ?? "");
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">What the front line will say</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{OBJECTIONS.length} objections · {roles.length} roles · tap a role</p>
      </div>
      <ul className="divide-y divide-[var(--color-parchment)]">
        {roles.map((role) => {
          const items = OBJECTIONS.filter((o) => o.role === role);
          const on = open === role;
          return (
            <li key={role}>
              <button
                type="button"
                onClick={() => setOpen(on ? "" : role)}
                aria-expanded={on}
                className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-paper-warm)] sm:px-6"
              >
                <span className="text-[15px] font-semibold text-[var(--color-canopy)]">{role}</span>
                <span className="flex items-center gap-3 font-mono text-[11px] text-[var(--color-ink-muted)]">
                  {items.length} {items.length === 1 ? "objection" : "objections"}
                  <ChevronDown className={`h-4 w-4 transition-transform ${on ? "rotate-180" : ""}`} />
                </span>
              </button>
              {on ? (
                <ol className="grid gap-[1px] border-t border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-2">
                  {items.map((o) => (
                    <li key={o.says} className="bg-[var(--color-paper-warm)] px-5 py-4 sm:px-6">
                      <p className="text-[14px] font-semibold leading-snug text-[var(--color-ink)]">&ldquo;{o.says}&rdquo;</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">
                        <span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-fern)]">The answer</span>
                        {o.answer}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
