import { COUNT_FIELDS, COUNT_RULES, SCORECARD, STALENESS_BANDS } from "@/lib/homeless/continuum";
import More from "./More";

/** Seven fields as chips, three bands, eight rules as one-liners, and the county's own scorecard. */
export default function CountCompact() {
  const misses = SCORECARD.items.filter((i) => !i.met);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-5">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-4 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Seven fields, all already in HMIS or on a bill</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {COUNT_FIELDS.map((f) => (
              <li key={f.n} className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-3 py-2">
                <p className="text-[13px] font-semibold text-[var(--color-canopy)]"><span className="mr-1.5 font-mono text-[11px] text-[var(--color-ember)]">{f.n}</span>{f.name}</p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--color-fern)]">already in · {f.alreadyExists.split(";")[0].slice(0, 46)}</p>
                <More>{f.what} <span className="font-mono text-[10px]">Already in: {f.alreadyExists}</span></More>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {STALENESS_BANDS.map((b) => (
              <div key={b.label} className="rounded-sm px-3 py-2.5 text-white" style={{ backgroundColor: b.color }}>
                <p className="font-mono text-[11px] font-bold">{b.label} · {b.days}</p>
                <p className="text-[11.5px] leading-snug text-white/85">{b.meaning}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-4 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Eight rules that keep it honest</p>
          <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {COUNT_RULES.map((r, i) => (
              <li key={r.rule} className="flex gap-2 text-[13px] leading-snug text-[var(--color-ink)]"><span className="font-mono text-[11px] font-bold text-[var(--color-ember)]">{i + 1}</span><span>{r.rule}<More>{r.why}</More></span></li>
            ))}
          </ol>
        </div>
      </div>
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The county&apos;s own scorecard</p>
          <p className="font-mono text-[28px] font-bold leading-none text-[var(--color-clay)]">{SCORECARD.score}<span className="text-[14px] text-[var(--color-ink-muted)]"> / {SCORECARD.of}</span></p>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-muted)]">Built for Zero quality-data scorecard, single adults, Oct 2024. Red is unmet.</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {SCORECARD.items.map((i) => (
            <span key={i.id} title={i.text} className={`rounded-sm px-2 py-1 font-mono text-[10px] font-bold ${i.met ? "bg-[var(--color-sage-tint)] text-[var(--color-fern)]" : "bg-[var(--color-clay)] text-white"}`}>{i.id}</span>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">The {misses.length} unmet, all about knowing who is where</p>
        <ul className="mt-1.5 space-y-1">
          {misses.map((i) => <li key={i.id} className="flex gap-2 text-[12.5px] leading-snug text-[var(--color-ink-light)]"><span className="font-mono text-[10px] font-bold text-[var(--color-clay)]">{i.id}</span>{i.text}</li>)}
        </ul>
      </div>
    </div>
  );
}
