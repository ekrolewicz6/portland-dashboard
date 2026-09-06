import { ADOPTED_TARGETS, PATRON_SURVEY } from "@/lib/libraries/data";

/**
 * What the people who already use the library said matters — collections,
 * overwhelmingly, and the satisfaction slide, next to the targets MCL has
 * already committed to in its own budget.
 */
export default function PatronSignal() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7 lg:col-span-3">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          &ldquo;What matters most to you?&rdquo; — {PATRON_SURVEY.responses.toLocaleString()} patrons, 2024
        </p>
        <ol className="mt-5 space-y-3">
          {PATRON_SURVEY.mostImportant.map((m, i) => (
            <li key={m.label} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_48px] items-center gap-3 sm:grid-cols-[minmax(0,170px)_minmax(0,1fr)_56px]">
              <span className={`text-[15px] font-semibold ${i < 2 ? "text-[var(--color-ink)]" : "text-[var(--color-ink-light)]"}`}>{m.label}</span>
              <div className="h-7 rounded-sm bg-[var(--color-paper-warm)]">
                <div className={`h-full rounded-sm ${i < 2 ? "bg-[var(--color-canopy)]" : "bg-[var(--color-sage)]"}`} style={{ width: `${(m.pct / 40) * 100}%` }} />
              </div>
              <span className="text-right font-mono text-[15px] font-bold tabular-nums text-[var(--color-ink)]">{m.pct}%</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          Two-thirds of patrons put <strong className="text-[var(--color-ink)]">materials</strong> first — physical
          and digital nearly tied. The next-ranked item, seven-day hours, was picked by one in eleven. And
          {" "}{PATRON_SURVEY.commentsPraisingStaffPct}% of written comments were about staff. Whatever the library
          becomes, patrons are telling it what not to trade away.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)]">
          <div className="bg-white p-4">
            <p className="font-mono text-[22px] font-bold tabular-nums leading-none text-[var(--color-ink)]">
              <span className="text-[var(--color-ink-muted)]">{PATRON_SURVEY.satisfied2022}%</span>
              <span className="mx-1.5 text-[16px] text-[var(--color-clay)]">→</span>
              <span className="text-[var(--color-clay)]">{PATRON_SURVEY.satisfied2024}%</span>
            </p>
            <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--color-ink-muted)]">satisfied, 2022 → 2024</p>
          </div>
          <div className="bg-white p-4">
            <p className="font-mono text-[22px] font-bold tabular-nums leading-none text-[var(--color-ink)]">{PATRON_SURVEY.findWhatINeed}%</p>
            <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--color-ink-muted)]">usually find what they need</p>
          </div>
          <div className="bg-white p-4">
            <p className="font-mono text-[22px] font-bold tabular-nums leading-none text-[var(--color-ink)]">{PATRON_SURVEY.stronglyRecommend}%</p>
            <p className="mt-1.5 text-[13.5px] leading-snug text-[var(--color-ink-muted)]">would strongly recommend</p>
          </div>
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Self-selected. Respondents were older and whiter than the county, and {PATRON_SURVEY.englishFormPct}% used the
          English form. A good read on patrons; no read at all on the residents who don&apos;t come.
        </p>
      </div>

      <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 lg:col-span-2">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          The clock already running · FY2027 adopted targets
        </p>
        <dl className="mt-4 divide-y divide-[var(--color-parchment)]">
          {ADOPTED_TARGETS.map((t) => (
            <div key={t.label} className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-[14px] text-[var(--color-ink-light)]">{t.label}</dt>
              <dd className="font-mono text-[16px] font-bold tabular-nums text-[var(--color-ink)]">{t.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Any new framework should carry these forward — not start a fresh clock that erases an
          inconvenient trend. A card count isn&apos;t use, and training completion isn&apos;t safety; but
          they are the measures the public can already hold the library to.
        </p>
      </div>
    </div>
  );
}
