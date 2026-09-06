import { UNIT_COSTS, UNPUBLISHED_COSTS } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";

const STATUS: Record<string, { label: string; cls: string }> = {
  published: { label: "published", cls: "bg-[var(--color-fern)]" },
  derived: { label: "derived from published figures", cls: "bg-[var(--color-river)]" },
  assumption: { label: "a proposal's assumption", cls: "bg-[repeating-linear-gradient(135deg,var(--color-ember)_0_5px,#f4ebe0_5px_9px)]" },
  analog: { label: "another city's figure", cls: "bg-[var(--color-sage)]" },
};
const money = (n: number) => `$${n.toLocaleString()}`;

function Bars({ kind, title }: { kind: "year" | "episode"; title: string }) {
  const rows = UNIT_COSTS.filter((c) => c.kind === kind);
  const max = Math.max(...rows.map((r) => r.high ?? r.value));
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <p className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)] sm:px-6">{title}</p>
      <ol className="space-y-3 px-5 py-4 sm:px-6">
        {rows.map((r) => {
          const w = ((r.high ?? r.value) / max) * 100;
          const wl = (r.value / max) * 100;
          return (
            <li key={r.label} className="grid gap-x-4 gap-y-1 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
              <div>
                <p className="text-[13px] font-medium leading-snug text-[var(--color-ink)]">{r.label}</p>
                <p className="font-mono text-[10px] text-[var(--color-ink-muted)]">{r.source}</p>
                <SourceLinks ids={r.src} />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-6 flex-1">
                  <div className={`absolute inset-y-0 left-0 rounded-sm ${STATUS[r.status].cls}`} style={{ width: `${w}%` }} />
                  {r.high ? <div className="absolute inset-y-0 left-0 rounded-sm bg-[var(--color-ember)]" style={{ width: `${wl}%`, opacity: 0.55 }} /> : null}
                </div>
                <span className="w-[130px] shrink-0 text-right font-mono text-[12px] font-semibold tabular-nums text-[var(--color-ink)]">{money(r.value)}{r.high ? `–${r.high.toLocaleString()}` : ""}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** What a year, or an episode, costs at each stage where anyone has published it; the stages where nobody has; and what to do with the money. */
export default function CostChart() {
  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
        {Object.entries(STATUS).map(([k, v]) => <li key={k} className="flex items-center gap-1.5"><span className={`inline-block h-2.5 w-5 rounded-[2px] ${v.cls}`} />{v.label}</li>)}
      </ul>
      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <Bars kind="year" title="What a year costs, per bed or per person" />
        <Bars kind="episode" title="What one episode costs" />
      </div>
      <div className="grid gap-[1px] overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] md:grid-cols-3">
        <div className="min-w-0 bg-[var(--color-clay-tint)] px-5 py-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)]">Never published: {UNPUBLISHED_COSTS.length} unit costs</p>
          <ul className="mt-2 space-y-1 text-[13px] leading-snug text-[var(--color-ink)]">{UNPUBLISHED_COSTS.map((u) => <li key={u}>{u}</li>)}</ul>
          <p className="mt-3 text-[12px] leading-snug text-[var(--color-ink-light)]">For these, the first thing to ask for is the unit cost, not an appropriation.</p>
        </div>
        <div className="min-w-0 bg-white px-5 py-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">A year, per person</p>
          <p className="mt-3 font-mono text-[34px] font-bold leading-none tabular-nums text-[var(--color-clay)]">$47,000</p>
          <p className="mt-1 text-[13px] text-[var(--color-ink-light)]">in a shelter bed</p>
          <p className="mt-4 font-mono text-[34px] font-bold leading-none tabular-nums text-[var(--color-fern)]">$16,000</p>
          <p className="mt-1 text-[13px] text-[var(--color-ink-light)]">in supportive housing</p>
          <p className="mt-4 text-[13px] leading-snug text-[var(--color-ink)]">The inexpensive steps between the two, assessment, navigators, and rapid rehousing, were the ones cut.</p>
        </div>
        <div className="min-w-0 bg-[var(--color-canopy)] px-5 py-5 text-white">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">Now, then later</p>
          <p className="mt-3 text-[14.5px] font-semibold leading-snug">Now: restore the doors that were defunded and build the missing stages that are cheap. That is staff and rules, not buildings.</p>
          <p className="mt-3 text-[13px] leading-snug text-white/75">Later: move shelter money toward exits and supportive housing as the front of the continuum starts to work. The expensive capital, detox, treatment, and crisis beds, is state and payer money; the county publishes the need and holds the next bed.</p>
        </div>
      </div>
    </div>
  );
}
