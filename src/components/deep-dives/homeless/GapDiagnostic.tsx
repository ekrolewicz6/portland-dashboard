import { CONTINUUM, GAP_SIGNALS } from "@/lib/homeless/continuum";

/**
 * How to read the counts: for each stage, the pattern in the numbers that
 * says a gap is there, what it usually means, and what Portland's numbers
 * say today. This is the diagnostic the continuum exists to make possible.
 */
export default function GapDiagnostic() {
  const stage = new Map(CONTINUUM.map((s) => [s.id, s]));
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="hidden grid-cols-[170px_1fr_1fr_1fr] gap-6 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)] sm:px-6 xl:grid">
        <span>Stage</span><span>The signal in the counts</span><span>What it usually means</span><span className="text-[var(--color-clay)]">Portland&apos;s reading today</span>
      </div>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {GAP_SIGNALS.map((g) => (
          <li key={g.stageId} className="grid gap-x-6 gap-y-2 px-5 py-4 sm:px-6 xl:grid-cols-[170px_1fr_1fr_1fr]">
            <p className="text-[14px] font-semibold leading-tight text-[var(--color-canopy)]">{stage.get(g.stageId)?.name ?? g.stageId}</p>
            <p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] xl:hidden">signal · </span>{g.signal}</p>
            <p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)] xl:hidden">means · </span>{g.likelyGap}</p>
            <p className="text-[12.5px] leading-snug text-[var(--color-clay)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em] xl:hidden">Portland · </span>{g.portlandReading}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
