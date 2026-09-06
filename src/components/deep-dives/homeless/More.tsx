"use client";

import { useState } from "react";

/** A one-tap reveal for the long text behind a short line. */
export default function More({ label = "more", children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <span className={className}>
      <button type="button" onClick={() => setOn(!on)} aria-expanded={on} className="ml-1 rounded-sm border border-[var(--color-parchment)] bg-white px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-sage)] hover:text-[var(--color-canopy)]">
        {on ? "less" : label}
      </button>
      {on ? <span className="mt-2 block text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">{children}</span> : null}
    </span>
  );
}
