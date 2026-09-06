import {
  CONDITIONS,
  DECIDE_NOW,
  NINETY_DAYS,
  OPTIONS_AFTER,
  READINESS_DELIVERABLES,
} from "@/lib/libraries/data";

/**
 * What can actually be done — the page's destination. Renders on the dark
 * canopy section. Four movements: what's decidable today vs. not; the
 * twelve-month readiness phase as six deliverables each with its gate; the
 * first ninety days with stop rules; the eight conditions; the three
 * options a Board would choose among afterward.
 */

function DarkEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">
      {children}
    </p>
  );
}

export default function ActionPath() {
  return (
    <div className="space-y-12">
      {/* 1 · decide today */}
      <div>
        <DarkEyebrow>What a Board can decide today, and what it can&apos;t yet</DarkEyebrow>
        <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-sm border border-white/15 bg-white/[0.04]">
          {DECIDE_NOW.map((d) => (
            <li key={d.decision} className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:p-5">
              <span
                className={`inline-flex w-fit items-center whitespace-nowrap rounded-sm px-2.5 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] ${
                  d.verdict === "now"
                    ? "bg-[var(--color-ember)] text-[var(--color-canopy)]"
                    : "border border-white/25 text-white/60"
                }`}
              >
                {d.verdict === "now" ? "Approve now" : "Not today"}
              </span>
              <div>
                <p className="text-[15px] font-semibold leading-snug text-white">{d.decision}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-white/65">{d.why}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-white/70">
          The safe motion is a <strong className="text-white">direction to plan and return</strong> — not an
          authorization to implement 2040. It asks for no new tax, no bond, no recurring service, no
          procurement, and it hands the incoming Board a clean record.
        </p>
      </div>

      {/* 2 · six deliverables */}
      <div>
        <DarkEyebrow>Twelve months, six deliverables, six gates · by September 2027</DarkEyebrow>
        <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {READINESS_DELIVERABLES.map((d) => (
            <li key={d.n} className="flex flex-col rounded-sm border border-white/15 bg-white/[0.04] p-5">
              <span className="font-mono text-[28px] font-bold tabular-nums leading-none text-[var(--color-ember-bright)]">
                {String(d.n).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-editorial text-[19px] leading-snug text-white">{d.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-white/70">{d.body}</p>
              <p className="mt-4 border-t border-white/10 pt-3 text-[14px] leading-snug text-[var(--color-ember-bright)]">
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em] text-white/45">Gate · </span>
                {d.gate}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* 3 · ninety days */}
      <div>
        <DarkEyebrow>The first ninety days, with stop rules</DarkEyebrow>
        <div className="relative mt-5">
          <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-white/20 md:block" />
          <ol className="grid gap-4 md:grid-cols-3">
            {NINETY_DAYS.map((s) => (
              <li key={s.day} className="relative">
                <div className="flex items-center gap-3">
                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-ember)] font-mono text-[14px] font-bold text-[var(--color-canopy)]">
                    {s.day}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/50">days</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/85">{s.result}</p>
                <p className="mt-2.5 border-l-2 border-[var(--color-clay)] pl-3 text-[14px] leading-snug text-white/60">
                  <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-ember)]">Stop rule · </span>
                  {s.stop}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 4 · eight conditions */}
      <div>
        <DarkEyebrow>Eight conditions before any systemwide expansion</DarkEyebrow>
        <ol className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {CONDITIONS.map((c, i) => (
            <li key={c.title} className="flex gap-3">
              <span className="shrink-0 font-mono text-[14px] font-bold tabular-nums text-[var(--color-ember-bright)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[16px] font-semibold text-white">{c.title}</p>
                <p className="mt-0.5 text-[14px] leading-snug text-white/60">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 5 · three options */}
      <div>
        <DarkEyebrow>Then, three honest options — none assumes efficiency absorbs a structural deficit</DarkEyebrow>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {OPTIONS_AFTER.map((o) => (
            <div key={o.n} className={`rounded-sm p-5 ${o.n === 3 ? "border border-[var(--color-ember)]/60 bg-[var(--color-ember)]/10" : "border border-white/15 bg-white/[0.04]"}`}>
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-white/45">Option {o.n}</p>
              <h3 className="mt-1 font-editorial text-[20px] leading-snug text-white">{o.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">{o.body}</p>
              <p className="mt-3 border-t border-white/10 pt-2.5 font-mono text-[13px] leading-snug text-[var(--color-ember-bright)]">{o.money}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
