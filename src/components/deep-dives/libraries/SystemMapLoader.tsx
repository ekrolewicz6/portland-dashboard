"use client";

import dynamic from "next/dynamic";

/**
 * `ssr: false` dynamic imports must originate from a Client Component in
 * the App Router, so this thin wrapper is the boundary — the actual Leaflet
 * map (SystemMap) never touches the server render.
 */
const SystemMap = dynamic(() => import("@/components/deep-dives/libraries/SystemMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] w-full items-center justify-center rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] sm:h-[560px]">
      <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        Loading map…
      </p>
    </div>
  ),
});

export default SystemMap;
