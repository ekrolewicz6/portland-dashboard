"use client";

import { useState } from "react";

/** A one-tap reveal for the long text behind a short line. Quiet by design; readable on light and dark. */
export default function More({ label = "more", dark = false, children }: { label?: string; dark?: boolean; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const link = dark ? "text-white/55 hover:text-white" : "text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)]";
  const body = dark ? "text-white/75" : "text-[var(--color-ink-light)]";
  return (
    <>
      <button type="button" onClick={() => setOn(!on)} aria-expanded={on} className={`ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] underline decoration-dotted underline-offset-[3px] transition-colors ${link}`}>
        {on ? "less" : label}
      </button>
      {on ? <span className={`mt-1.5 block text-[12.5px] leading-relaxed ${body}`}>{children}</span> : null}
    </>
  );
}
