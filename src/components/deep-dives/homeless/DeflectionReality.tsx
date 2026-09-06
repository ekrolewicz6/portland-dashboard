import { DEFLECTION_FUNNEL } from "@/lib/homeless/data";

/**
 * The deflection funnel, FY26 Q3. One scale (79 = full width), three stages,
 * and the drop-offs written in the gaps where they happen. The nine
 * completions are split by what "successful" actually contained.
 */
const F = DEFLECTION_FUNNEL;
const SPLIT_COLORS = ["var(--color-river-deep)", "var(--color-fern)", "var(--color-sage)"];

function Row({ label, sub, value, color, w }: { label: string; sub?: string; value: number; color: string; w: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,150px)_1fr] items-center gap-3 sm:grid-cols-[190px_1fr]">
      <div>
        <p className="text-[13.5px] font-semibold leading-tight text-[var(--color-ink)]">{label}</p>
        {sub ? <p className="text-[11px] leading-snug text-[var(--color-ink-muted)]">{sub}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 rounded-sm" style={{ width: `${w}%`, backgroundColor: color, minWidth: 6 }} />
        <span className="font-mono text-[18px] font-bold tabular-nums text-[var(--color-ink)]">{value}</span>
      </div>
    </div>
  );
}

function Drop({ text }: { text: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,150px)_1fr] gap-3 sm:grid-cols-[190px_1fr]">
      <span />
      <p className="flex items-center gap-2 py-1 text-[11.5px] text-[var(--color-clay)]">
        <span className="inline-block h-4 w-px bg-[var(--color-clay)]/50" aria-hidden />
        {text}
      </p>
    </div>
  );
}

export default function DeflectionReality() {
  const pct = (n: number) => (n / F.referrals) * 100;
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Deflection, Jan–Mar 2026</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">full width = {F.referrals} referrals</p>
      </div>

      <div className="mt-5 space-y-1">
        <Row label="Law-enforcement referrals" value={F.referrals} color="var(--color-storm)" w={pct(F.referrals)} />
        <Drop text={`${F.notYetAtWindow} had not yet reached the 90-day mark when the quarter closed`} />
        <Row label="Reached the 90-day window" sub="the real denominator" value={F.reachedWindow} color="var(--color-river)" w={pct(F.reachedWindow)} />
        <Drop text={`${F.didNotComplete} did not complete`} />
        <Row label="Successful 90-day completions" sub="January 2026 definition" value={F.completed} color="var(--color-canopy)" w={pct(F.completed)} />
      </div>

      {/* What the 9 contained */}
      <div className="mt-5 grid grid-cols-[minmax(0,150px)_1fr] gap-3 sm:grid-cols-[190px_1fr]">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">What “successful” contained</p>
        <div>
          <div className="flex h-7 gap-[2px] overflow-hidden rounded-sm" style={{ width: `${Math.max(pct(F.completed), 34)}%`, minWidth: 220 }}>
            {F.split.map((s, i) => (
              <div key={s.label} className="flex items-center justify-center font-mono text-[11px] font-bold text-white" style={{ flex: s.value, backgroundColor: SPLIT_COLORS[i] }} title={`${s.label}: ${s.value}`}>
                {s.value}
              </div>
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {F.split.map((s, i) => (
              <li key={s.label} className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-muted)]">
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: SPLIT_COLORS[i] }} />
                <span className="font-mono font-semibold text-[var(--color-ink)]">{s.value}</span> {s.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 border-t border-[var(--color-parchment)] pt-3 text-[12.5px] leading-relaxed text-[var(--color-ink-light)]">
        <strong>Read it carefully.</strong> Eight of the nine reached substance-use or recovery services, so “success” here was not a pantry visit or one shelter night. But a completion is not a residential-treatment completion, and the snapshot does not claim it is.
      </p>
    </div>
  );
}
