import { FIRST_DOOR, FIRST_DOOR_RULES, CONTINUUM } from "@/lib/homeless/continuum";

/**
 * The shared first-door protocol: six questions, in order, that any responder
 * can answer at the scene with what they can observe. Each yes names the
 * first door, the stage it maps to, and what that door is in Portland today.
 * Server component. The rules underneath are the ones every agency signs.
 */
export default function FirstDoor() {
  const stageName = new Map(CONTINUUM.map((s) => [s.id, s.name]));
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Six questions, in order, at the scene</p>
          <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">answerable with what you can see or ask in one breath; no diagnosis needed</p>
        </div>
        <ol className="divide-y divide-[var(--color-parchment)]">
          {FIRST_DOOR.map((q) => (
            <li key={q.n} className="grid gap-x-6 gap-y-3 px-5 py-5 sm:px-6 xl:grid-cols-[44px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-canopy)] font-mono text-[15px] font-bold text-white">{q.n}</span>
              <div>
                <h4 className="text-[16px] font-semibold leading-tight text-[var(--color-canopy)]">{q.ask}</h4>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">What you can see or ask</p>
                <p className="text-[13px] leading-snug text-[var(--color-ink-light)]">{q.observe}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-fern)]">If yes</p>
                <p className="mt-0.5 text-[14px] font-semibold leading-snug text-[var(--color-ink)]">{q.door}</p>
                <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{q.ifYes}</p>
                <p className="mt-1.5 font-mono text-[10.5px] text-[var(--color-ink-muted)]">stage: {stageName.get(q.stageId) ?? q.stageId}</p>
              </div>
              <div className="rounded-sm border border-dashed border-[var(--color-clay)]/40 bg-[var(--color-clay-tint)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-clay)]">That door in Portland today</p>
                <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{q.today}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The six rules every agency signs</p>
        <ol className="mt-3 grid gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          {FIRST_DOOR_RULES.map((r, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-[var(--color-ink-light)]">
              <span className="shrink-0 font-mono text-[13px] font-bold text-[var(--color-ember)]">{i + 1}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
