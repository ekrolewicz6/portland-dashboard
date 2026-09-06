import { LANES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";
import SourceLinks from "./SourceLinks";

const SHARE = [80, 10, 10];
const PEOPLE = ["14,000–17,000", "4,000–5,000", "900–1,200"];
const COST = ["$5,000–6,000", "$18,000–24,000", "$45,000–65,000"];

/** Three lanes, drawn to the share of people in each; per-lane volumes and costs are a proposal's assumptions and say so. */
export default function LanesVisual() {
  const cohortName = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Three lanes, drawn to the share of people in each</p>
          <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">width = share of shelter users (Kuhn &amp; Culhane, 1998); people and cost per year = Sharon Meieran&apos;s 2026 acuity model, a county-chair campaign proposal</p>
        </div>
        <div className="px-5 py-4 sm:px-6">
          <div className="flex h-24 gap-1">
            {LANES.map((l, i) => (
              <div key={l.id} className="flex flex-col justify-between rounded-sm px-3 py-2" style={{ width: `${SHARE[i]}%`, backgroundColor: `color-mix(in srgb, ${l.color} 18%, white)`, borderTop: `4px solid ${l.color}` }}>
                <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: l.color }}>{SHARE[i] < 20 ? l.name.split(" · ")[0] : l.name}</p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0 font-mono text-[11px] tabular-nums text-[var(--color-ink)]">
                  <span className="text-[18px] font-bold">{SHARE[i]}%</span>
                  {SHARE[i] >= 20 ? <span className="hidden sm:inline">{PEOPLE[i]} people a year · {COST[i]} each (Meieran proposal)</span> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {LANES.map((l, i) => (
              <p key={l.id} className="font-mono text-[10.5px] leading-snug text-[var(--color-ink-light)]"><span className="font-semibold" style={{ color: l.color }}>{l.name.split(" · ")[0]}</span> · {PEOPLE[i]} people a year at {COST[i]} each, by Sharon Meieran&apos;s 2026 acuity model</p>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-[var(--color-ink-muted)]">Lane 3 is a tenth of the people and half the shelter nights. It is also the only lane a responder can score at the scene.</p>
          <SourceLinks ids={["meieran-acuity", "kuhn-culhane"]} />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {LANES.map((l) => (
          <div key={l.id} className="rounded-sm border border-[var(--color-parchment)] bg-white">
            <div className="border-b-[3px] px-5 pt-4 pb-3" style={{ borderColor: l.color }}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: l.color }}>{l.name}</p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{l.who}</p>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">You can see or ask</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">{l.criteria.map((c) => <li key={c} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-2 py-0.5 text-[12px] text-[var(--color-ink-light)]">{c}</li>)}</ul>
              </div>
              <div><p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">First door</p><p className="mt-0.5 text-[13.5px] font-medium leading-snug text-[var(--color-ink)]">{l.firstDoor}</p></div>
              <div><p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Housing First here</p><p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{l.housingFirst}</p></div>
              <div><p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Success looks like</p><p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{l.successLooksLike}</p></div>
              <div><p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Scale</p><p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{l.scale}</p><SourceLinks ids={l.src ?? []} /></div>
              <div className="flex flex-wrap gap-1.5 pt-1">{l.cohorts.map((c) => <span key={c} className="rounded-full border border-[var(--color-parchment)] px-2 py-0.5 text-[11px] text-[var(--color-ink-muted)]">{cohortName.get(c) ?? c}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
