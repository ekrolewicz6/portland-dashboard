import { COUNT_FIELDS, COUNT_RULES, STALENESS_BANDS, SCORECARD } from "@/lib/homeless/continuum";

/**
 * How to count who is at each stage without a brittle process: the seven
 * fields that already exist, the three staleness bands, the rules, and the
 * county's own 20-of-29 scorecard showing which conditions are unmet today.
 */
export default function CountLedger() {
  const misses = SCORECARD.items.filter((i) => !i.met);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
      {/* Fields + bands */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Seven fields, all of which already exist</p>
          <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">What a worker records per contact: one living-situation code and one referral result, entered where the contact is already entered.</p>
        </div>
        <ol className="divide-y divide-[var(--color-parchment)]">
          {COUNT_FIELDS.map((f) => (
            <li key={f.n} className="grid gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-[28px_1fr] sm:px-6">
              <span className="font-mono text-[14px] font-bold leading-none text-[var(--color-ember)]">{f.n}</span>
              <div>
                <p className="text-[13.5px] font-semibold leading-tight text-[var(--color-ink)]">{f.name}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{f.what}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-[var(--color-ink-muted)]">already in: {f.alreadyExists}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-[var(--color-parchment)] px-5 py-4 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">A stage is last known situation plus days since contact</p>
          <div className="mt-2.5 flex gap-[2px] overflow-hidden rounded-sm">
            {STALENESS_BANDS.map((b) => (
              <div key={b.label} className="flex-1 px-3 py-2 text-white" style={{ backgroundColor: b.color }}>
                <p className="font-mono text-[11px] font-bold">{b.label} <span className="font-normal opacity-80">· {b.days}</span></p>
                <p className="text-[11px] leading-snug opacity-90">{b.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules + scorecard */}
      <div className="space-y-5">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <div className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The rules that keep it honest</p>
          </div>
          <ul className="divide-y divide-[var(--color-parchment)]">
            {COUNT_RULES.map((r) => (
              <li key={r.rule} className="px-5 py-2.5 sm:px-6">
                <p className="text-[13px] font-semibold leading-tight text-[var(--color-ink)]">{r.rule}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-[var(--color-ink-light)]">{r.why}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">The county&apos;s own scorecard</p>
              <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{SCORECARD.caption}</p>
            </div>
            <p className="shrink-0 font-mono text-[30px] font-bold leading-none tabular-nums text-[var(--color-clay)]">
              {SCORECARD.score}<span className="text-[15px] text-[var(--color-ink-muted)]"> / {SCORECARD.of}</span>
            </p>
          </div>
          <div className="px-5 py-3 sm:px-6">
            <div className="flex flex-wrap gap-1">
              {SCORECARD.items.map((i) => (
                <span
                  key={i.id}
                  title={i.text}
                  className={`h-5 w-7 rounded-[2px] text-center font-mono text-[9.5px] font-bold leading-5 ${
                    i.met ? "bg-[var(--color-sage-tint)] text-[var(--color-fern)]" : "bg-[var(--color-clay)] text-white"
                  }`}
                >
                  {i.id}
                </span>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-clay)]">The {misses.length} unmet conditions</p>
            <ul className="mt-1.5 space-y-1">
              {misses.map((i) => (
                <li key={i.id} className="flex gap-2 text-[12px] leading-snug text-[var(--color-ink-light)]">
                  <span className="shrink-0 font-mono text-[10.5px] font-bold text-[var(--color-clay)]">{i.id}</span>
                  {i.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
