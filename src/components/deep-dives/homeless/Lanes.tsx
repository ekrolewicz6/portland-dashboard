import { LANES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";

/**
 * The three acuity lanes: who, what a responder can observe, the first door,
 * what Housing First means here, what success looks like, and scale. The
 * lane decides the first door, not eligibility for any later one.
 */
export default function Lanes() {
  const cohortName = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  return (
    <div className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] xl:grid-cols-3">
      {LANES.map((l) => (
        <div key={l.id} className="flex flex-col bg-white">
          <div className="border-b-[3px] px-5 pt-5 pb-4" style={{ borderColor: l.color }}>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: l.color }}>{l.name}</p>
            <p className="mt-2 text-[15px] leading-snug text-[var(--color-ink)]">{l.who}</p>
          </div>
          <div className="flex-1 space-y-4 px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">You can see</p>
              <ul className="mt-1.5 space-y-1">
                {l.criteria.map((c) => (
                  <li key={c} className="flex gap-2 text-[13px] leading-snug text-[var(--color-ink-light)]">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">First door</p>
              <p className="mt-1 text-[13.5px] font-medium leading-snug text-[var(--color-ink)]">{l.firstDoor}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Housing First here</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{l.housingFirst}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Success looks like</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{l.successLooksLike}</p>
            </div>
          </div>
          <div className="border-t border-[var(--color-parchment)] px-5 py-3">
            <p className="text-[12px] leading-snug text-[var(--color-ink-muted)]">{l.scale}</p>
            <p className="mt-2 flex flex-wrap gap-1">
              {l.cohorts.map((c) => (
                <span key={c} className="rounded-full border border-[var(--color-parchment)] px-2 py-0.5 text-[10.5px] text-[var(--color-ink-light)]">{cohortName.get(c) ?? c}</span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
