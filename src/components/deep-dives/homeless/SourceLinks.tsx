"use client";

import { useState } from "react";
import { SRC } from "@/lib/homeless/continuum";

/** Sources for a figure: a small count by default, the linked documents on tap. */
export default function SourceLinks({ ids, dark = false }: { ids: string[]; dark?: boolean }) {
  const [on, setOn] = useState(false);
  const known = Array.from(new Set(ids.filter((id) => SRC[id])));
  if (!known.length) return null;
  const base = dark ? "text-white/50 hover:text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)]";
  return (
    <span className="mt-1.5 block font-mono text-[10px] leading-snug">
      <button type="button" onClick={() => setOn(!on)} aria-expanded={on} className={`underline decoration-dotted underline-offset-2 uppercase tracking-[0.1em] ${base}`}>
        {known.length === 1 ? "source" : `${known.length} sources`}
      </button>
      {on ? (
        <span className={`mt-1 block ${dark ? "text-white/60" : "text-[var(--color-ink-light)]"}`}>
          {known.map((id, i) => (
            <span key={id}>{i > 0 ? "; " : ""}<a href={SRC[id].u} target="_blank" rel="noopener noreferrer" className={`underline decoration-dotted underline-offset-2 ${base}`}>{SRC[id].t}</a></span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
