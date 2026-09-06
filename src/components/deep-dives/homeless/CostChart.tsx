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

/** What a year, or an episode, costs at each stage where anyone has published it; and the stages where nobody has. */
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-sm border border-dashed border-[var(--color-clay)] bg-[var(--color-clay-tint)] px-5 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)]">Never published: {UNPUBLISHED_COSTS.length} unit costs</p>
          <ul className="mt-2 grid gap-1 text-[13px] leading-snug text-[var(--color-ink)] sm:grid-cols-2">{UNPUBLISHED_COSTS.map((u) => <li key={u}>{u}</li>)}</ul>
          <p className="mt-2 text-[12px] text-[var(--color-ink-light)]">First deliverable for these: the unit cost, not an appropriation.</p>
        </div>
        <div className="grid gap-[1px] rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-2">
          <div className="bg-white px-5 py-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">A year, per person</p>
            <div className="mt-2 flex items-end gap-4">
              <div><p className="font-mono text-[34px] font-bold leading-none text-[var(--color-clay)]">$47,000</p><p className="mt-1 text-[12.5px] text-[var(--color-ink-light)]">a shelter bed</p></div>
              <span className="pb-4 font-mono text-[18px] text-[var(--color-ink-muted)]">vs</span>
              <div><p className="font-mono text-[34px] font-bold leading-none text-[var(--color-fern)]">$16,000</p><p className="mt-1 text-[12.5px] text-[var(--color-ink-light)]">supportive housing</p></div>
            </div>
            <p className="mt-3 text-[13px] leading-snug text-[var(--color-ink)]">The cheap steps between them (assessment, navigators, rapid rehousing) are the ones that were cut.</p>
          </div>
          <div className="bg-[var(--color-canopy)] px-5 py-5 text-white">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">Now, then later</p>
            <p className="mt-2 text-[14px] font-semibold leading-snug">Now: restore the defunded doors and build the cheap missing stages. Staff and rules, not buildings.</p>
            <p className="mt-2 text-[13px] leading-snug text-white/75">Later: shift shelter money toward exits and supportive housing. The big capital (detox, treatment, crisis beds) is state and payer money; the county publishes the need and holds the next bed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
