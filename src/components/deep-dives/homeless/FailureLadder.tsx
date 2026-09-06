import { ACCOUNTABILITY_LADDER, NEVER_A_FAILURE, WHO_ENFORCES } from "@/lib/homeless/continuum";
import More from "./More";
import { ENFORCER_SHORT, FAIL_SHORT } from "@/lib/homeless/continuum-short";

/** What happens when a stage fails, who enforces it, and what is never counted as a worker's failure. */
export default function FailureLadder() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <ol className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <li className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">When a stage fails, in this order</p>
        </li>
        {ACCOUNTABILITY_LADDER.map((s) => (
          <li key={s.n} className="grid gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 py-4 last:border-b-0 sm:grid-cols-[40px_minmax(0,1fr)] sm:px-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-clay)] font-mono text-[13px] font-bold text-white">{s.n}</span>
            <div>
              <p className="text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{s.title}</p>
              <p className="mt-1 text-[13.5px] leading-snug text-[var(--color-ink-light)]">{FAIL_SHORT[s.n] ?? s.body}<More>{s.body}</More></p>
            </div>
          </li>
        ))}
        <li className="bg-[var(--color-paper-warm)] px-5 py-4 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Never counted as the worker&apos;s or the program&apos;s failure</p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-[var(--color-ink-light)]">
            {NEVER_A_FAILURE.map((t) => <li key={t.slice(0, 30)} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-fern)]" />{t}</li>)}
          </ul>
        </li>
      </ol>
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <p className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)] sm:px-6">Who enforces, and what they hold</p>
        <ul className="divide-y divide-[var(--color-parchment)]">
          {WHO_ENFORCES.map((w) => (
            <li key={w.body} className="px-5 py-3.5 sm:px-6">
              <p className="text-[14px] font-semibold leading-snug text-[var(--color-canopy)]">{w.body}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-[var(--color-ink-light)]">{ENFORCER_SHORT[w.body] ?? w.holds}<More>{w.holds}</More></p>
            </li>
          ))}
        </ul>
        <p className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)] px-5 py-4 text-[13.5px] leading-relaxed text-white/85 sm:px-6">
          <span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">The missing owner</span>
          No one answers for the whole continuum today. The design asks for one system director, accountable to a joint city-county body, whose product is the weekly table.
        </p>
      </div>
    </div>
  );
}
