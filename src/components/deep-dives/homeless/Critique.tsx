"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CAVEATS } from "@/lib/homeless/continuum";

const STATUS = [
  { key: "built-in", label: "Built into the design", sub: "the critic was right and the plan changed", color: "var(--color-fern)", tint: "var(--color-sage-tint)", ask: "What the design does" },
  { key: "open", label: "Open", sub: "a document or decision nobody has produced would settle it", color: "#a9784f", tint: "#f4ebe0", ask: "What would settle it" },
  { key: "watch", label: "Cannot be designed away", sub: "a risk to publish and watch", color: "var(--color-clay)", tint: "var(--color-clay-tint)", ask: "How to watch it" },
] as const;
const KIND: Record<string, string> = { cohort: "people", legal: "law", data: "data", governance: "governance", risk: "gaming" };

/** The critique as a ledger: every finding kept, each with its status and what the design does about it. */
export default function Critique() {
  const [open, setOpen] = useState<string>("");
  const total = CAVEATS.length;
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The critique, and what became of each point</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">{total} findings · tap one for the finding and the response</p>
      </div>
      {/* status bar */}
      <div className="px-5 py-4 sm:px-6">
        <div className="flex h-8 w-full overflow-hidden rounded-sm">
          {STATUS.map((s) => {
            const n = CAVEATS.filter((c) => c.status === s.key).length;
            return (
              <div key={s.key} className="flex items-center justify-center font-mono text-[12px] font-bold text-white" style={{ width: `${(n / total) * 100}%`, backgroundColor: s.color }} title={s.label}>{n}</div>
            );
          })}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {STATUS.map((s) => (
            <p key={s.key} className="text-[12.5px] leading-snug text-[var(--color-ink-light)]"><span className="font-semibold" style={{ color: s.color }}>{s.label}</span> · {s.sub}</p>
          ))}
        </div>
      </div>
      {/* groups */}
      <div className="grid gap-[1px] border-t border-[var(--color-parchment)] bg-[var(--color-parchment)] xl:grid-cols-3 xl:items-start">
        {STATUS.map((s) => {
          const items = CAVEATS.filter((c) => c.status === s.key);
          return (
            <div key={s.key} className="bg-white">
              <p className="border-b-[3px] px-4 pt-4 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: s.color, color: s.color }}>{s.label} · {items.length}</p>
              <ul className="divide-y divide-[var(--color-parchment)]">
                {items.map((c) => {
                  const on = open === c.title;
                  return (
                    <li key={c.title}>
                      <button type="button" onClick={() => setOpen(on ? "" : c.title)} aria-expanded={on} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-paper-warm)]">
                        <span>
                          <span className="block text-[13.5px] font-semibold leading-snug text-[var(--color-ink)]">{c.title}</span>
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{KIND[c.kind]}</span>
                        </span>
                        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[var(--color-ink-muted)] transition-transform ${on ? "rotate-180" : ""}`} />
                      </button>
                      {on ? (
                        <div className="space-y-2 px-4 pb-4">
                          <p className="text-[12.5px] leading-relaxed text-[var(--color-ink-light)]"><span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">The finding</span>{c.body}</p>
                          <p className="rounded-sm px-3 py-2.5 text-[13px] leading-relaxed text-[var(--color-ink)]" style={{ backgroundColor: s.tint }}><span className="mr-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color: s.color }}>{s.ask}</span>{c.response}</p>
                        </div>
                      ) : null}
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
