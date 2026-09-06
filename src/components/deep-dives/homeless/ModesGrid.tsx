import { CONTINUUM, PHASES, STAGE_MODES } from "@/lib/homeless/continuum";

/** For every stage: what it looks like when it works, and the ways it fails for the person in it. */
export default function ModesGrid() {
  const modes = new Map(STAGE_MODES.map((m) => [m.stageId, m]));
  const phaseOf = new Map(PHASES.map((p) => [p.key, p]));
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">When it works, and how it fails</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">the person&apos;s view of each stage</p>
      </div>
      <p className="border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
        <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
        One row per stage. The left column is what the stage looks like for the person when it works; the right is the ways it goes wrong for them, which are also the things the count in section 07 is built to catch. Section 08 turns these into the number that would show each failure.
      </p>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {CONTINUUM.map((s, i) => {
          const m = modes.get(s.id);
          const p = phaseOf.get(s.phase);
          if (!m) return null;
          return (
            <li key={s.id} className="grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] xl:gap-6">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: p?.color }}>{String(i + 1).padStart(2, "0")} · {p?.label}</p>
                <h4 className="mt-1 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-[var(--color-canopy)]">{s.name}</h4>
              </div>
              <div className="rounded-sm border-l-[3px] border-[var(--color-fern)] bg-[var(--color-sage-tint)] px-4 py-3">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-fern)]">When it works</p>
                <ul className="mt-1.5 space-y-1.5">
                  {m.success.map((x) => (
                    <li key={x} className="text-[13px] leading-snug text-[var(--color-ink)]">{x}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-sm border-l-[3px] border-[var(--color-clay)] bg-[var(--color-clay-tint)] px-4 py-3">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">How it fails</p>
                <ul className="mt-1.5 space-y-1.5">
                  {m.failure.map((x) => (
                    <li key={x} className="text-[13px] leading-snug text-[var(--color-ink)]">{x}</li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
