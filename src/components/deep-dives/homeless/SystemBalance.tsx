import { BALANCE, CONTINUUM, PHASES, TONIGHT } from "@/lib/homeless/continuum";
import type { Basis } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";

const BASIS: Record<Basis, { label: string; cls: string }> = {
  counted: { label: "counted", cls: "bg-[var(--color-sage-tint)] text-[var(--color-fern)]" },
  estimate: { label: "our estimate", cls: "bg-[#f4ebe0] text-[#a9784f]" },
  unknown: { label: "unknown", cls: "bg-[var(--color-clay-tint)] text-[var(--color-clay)]" },
};
const fmt = (n: number | null) => (n == null ? "?" : n.toLocaleString());
const tone = (pct: number | null) => (pct == null ? "clay" : pct < 20 ? "clay" : pct < 60 ? "ember" : "fern");

function Chip({ b }: { b: Basis }) {
  return <span className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] ${BASIS[b].cls}`}>{BASIS[b].label}</span>;
}

/** Tonight's snapshot, then every stage: how many people are in it, how much support exists there, and the coverage that implies. */
export default function SystemBalance() {
  const stage = new Map(CONTINUUM.map((s, i) => [s.id, { ...s, n: i + 1 }]));
  const phaseOf = new Map(PHASES.map((p) => [p.key, p]));
  return (
    <div className="space-y-5">
      {/* tonight strip */}
      <div className="rounded-sm bg-[var(--color-canopy)] text-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">Tonight, in Multnomah County</p>
          <p className="font-mono text-[11px] text-white/55">what exists for the people outside, on an ordinary weeknight</p>
        </div>
        <ol className="grid grid-cols-2 gap-[1px] bg-white/10 md:grid-cols-4">
          {TONIGHT.map((t) => (
            <li key={t.label} className="bg-[var(--color-canopy)] px-4 py-4">
              <p className={`font-mono text-[30px] font-bold leading-none tabular-nums ${t.value === "0" ? "text-[var(--color-clay)]" : "text-[var(--color-ember-bright)]"}`}>{t.value}</p>
              <p className="mt-1.5 text-[13.5px] font-semibold leading-snug text-white">{t.label}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-white/55">{t.sub}</p>
              <SourceLinks ids={t.src} dark />
            </li>
          ))}
        </ol>
      </div>

      {/* balance board */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">People in each stage, and the support that exists there</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {(Object.keys(BASIS) as Basis[]).map((b) => <li key={b}><Chip b={b} /></li>)}
          </ul>
        </div>
        <p className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 text-[13px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
          <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">How to read this</span>
          One row per stage. Left: how many people are in it, or the best figure that exists, with a chip saying whether it is counted, our estimate (with the arithmetic), or unknown. Middle: the support that exists there, in the unit that matters (beds, slots, staff, placements). Right: the coverage that implies, on the basis stated. Red means under one in five, or that nobody can say. The units differ by stage on purpose; a sobering station is not a lease.
        </p>
        <ol className="divide-y divide-[var(--color-parchment)]">
          {BALANCE.map((b) => {
            const s = stage.get(b.stageId);
            const p = s ? phaseOf.get(s.phase) : undefined;
            const c = tone(b.coverage.pct);
            const barCls = c === "fern" ? "bg-[var(--color-fern)]" : c === "ember" ? "bg-[var(--color-ember)]" : "bg-[var(--color-clay)]";
            const txtCls = c === "fern" ? "text-[var(--color-fern)]" : c === "ember" ? "text-[#a9784f]" : "text-[var(--color-clay)]";
            return (
              <li key={b.stageId} className="grid gap-x-6 gap-y-3 px-5 py-4 sm:px-6 xl:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_260px] xl:items-start">
                <div>
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: p?.color }}>{String(s?.n ?? 0).padStart(2, "0")} · {p?.label}</p>
                  <p className="mt-0.5 text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{s?.name}</p>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className={`font-mono text-[24px] font-bold leading-none tabular-nums ${b.people.value == null ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{fmt(b.people.value)}</span>
                    <span className="text-[13px] font-medium text-[var(--color-ink)]">{b.people.label}</span>
                    <Chip b={b.people.basis} />
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-light)]">{b.people.how}</p>
                  <SourceLinks ids={b.people.src} />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className={`font-mono text-[24px] font-bold leading-none tabular-nums ${b.support.value == null ? "text-[var(--color-clay)]" : b.support.value === 0 ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{fmt(b.support.value)}</span>
                    <span className="text-[13px] font-medium text-[var(--color-ink)]">{b.support.label}</span>
                    <Chip b={b.support.basis} />
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-light)]">{b.support.how}</p>
                  <SourceLinks ids={b.support.src} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 flex-1 overflow-hidden rounded-sm bg-[var(--color-parchment)]">
                      {b.coverage.pct == null ? (
                        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--color-clay-tint)_5px_10px)]" />
                      ) : (
                        <div className={`h-full rounded-sm ${barCls}`} style={{ width: `${Math.max(1.5, Math.min(100, b.coverage.pct))}%` }} />
                      )}
                    </div>
                    <span className={`w-[52px] shrink-0 text-right font-mono text-[18px] font-bold tabular-nums ${txtCls}`}>{b.coverage.pct == null ? "?" : `${b.coverage.pct}%`}</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">{b.coverage.basis}</p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink)]">{b.breaks}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
          Five of fourteen stages cannot be put on this board at all, because nobody counts the people in them. That is not a gap in the board; it is the first finding. Every figure links to the document it came from; the memo carries the full registry.
        </p>
      </div>
    </div>
  );
}
