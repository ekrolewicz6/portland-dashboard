import { OFF_THE_STREET, POLICE_ROLE, REFUSAL_LADDER } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";
import More from "./More";
import { LADDER_SHORT, OFF_SHORT, POLICE_SHORT } from "@/lib/homeless/continuum-short";

/** What happens when someone says no, where police belong, and how people actually get off the street. */
export default function WhenNo() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <ol className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <li className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">When someone says no, in this order</p>
        </li>
        {REFUSAL_LADDER.map((s) => (
          <li key={s.n} className="grid gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 py-4 last:border-b-0 sm:grid-cols-[40px_minmax(0,1fr)] sm:px-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-canopy)] font-mono text-[13px] font-bold text-white">{s.n}</span>
            <div>
              <p className="text-[15px] font-semibold leading-snug text-[var(--color-canopy)]">{s.title}</p>
              <p className="mt-1 text-[13.5px] leading-snug text-[var(--color-ink-light)]">{LADDER_SHORT[s.n] ?? s.body}<More>{s.body}</More></p>
              {s.law ? <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Law · {s.law}</p> : null}
              <SourceLinks ids={s.src ?? []} />
            </div>
          </li>
        ))}
      </ol>
      <div className="space-y-5">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
          <p className="border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-clay)] sm:px-6">Where police belong</p>
          <ul className="divide-y divide-[var(--color-parchment)]">
            {POLICE_ROLE.map((t, i) => (
              <li key={t.slice(0, 40)} className="px-5 py-3 text-[13.5px] leading-snug text-[var(--color-ink)] sm:px-6">{POLICE_SHORT[i] ?? t}<More>{t}</More></li>
            ))}
          </ul>
        </div>
        <div className="rounded-sm bg-[var(--color-canopy)] text-white">
          <p className="border-b border-white/10 px-5 pt-4 pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)] sm:px-6">How people actually get off the street</p>
          <ol className="divide-y divide-white/10">
            {OFF_THE_STREET.map((t, i) => (
              <li key={t.slice(0, 40)} className="flex gap-3 px-5 py-3 text-[13.5px] leading-snug text-white/85 sm:px-6">
                <span className="font-mono text-[12px] font-bold text-[var(--color-ember-bright)]">{i + 1}</span>
                <span>{OFF_SHORT[i] ?? t}<More dark>{t}</More></span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
