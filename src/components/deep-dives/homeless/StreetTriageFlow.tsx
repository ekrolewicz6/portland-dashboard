import { FIELD_TRIAGE, OUTREACH_ACTORS, SOURCES } from "@/lib/homeless/data";

/**
 * First contact as an actual decision tree: one root, three branches, and
 * the third branch (no crime, no hold) drawn as the gap it is. The four
 * things a worker needs inside the "yes-now" window are chips, not a
 * paragraph. Server component; connectors are one stretched SVG.
 */

const QUESTIONS = ["Is a crime being committed?", "Does it meet a mental-health hold?", "No crime, no hold. Will they say yes?"];
const WINDOW_STEPS = ["an eligible bed", "phone confirmation", "a hold on it", "transport"];

export default function StreetTriageFlow() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
      {/* Root */}
      <div className="flex justify-center">
        <div className="rounded-sm bg-[var(--color-canopy)] px-4 py-2 text-center text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ember-bright)]">First contact</p>
          <p className="text-[14px] font-semibold">A worker meets a person on the street</p>
        </div>
      </div>

      {/* Connectors (desktop) */}
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="hidden h-9 w-full md:block" aria-hidden>
        <path d="M150 0 V12 H50 V36 M150 12 V36 M150 12 H250 V36" fill="none" stroke="#d6d0c4" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="my-3 h-6 w-px bg-[var(--color-parchment)] md:hidden" style={{ marginLeft: "calc(50% - 0.5px)" }} aria-hidden />

      {/* Branches */}
      <div className="grid gap-3 md:grid-cols-3">
        {FIELD_TRIAGE.map((step, i) => {
          const gap = i === 2;
          return (
            <div
              key={step.step}
              className={`flex flex-col rounded-sm border p-4 ${
                gap ? "border-[var(--color-ember)] bg-[#fff9f2]" : "border-[var(--color-parchment)] bg-[var(--color-paper-warm)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-semibold leading-snug text-[var(--color-canopy)]">{QUESTIONS[i]}</p>
                {gap ? (
                  <span className="shrink-0 rounded-sm bg-[var(--color-ember)] px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-canopy)]">the gap</span>
                ) : null}
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-ember)]">→ {step.route}</p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{step.reality}</p>
            </div>
          );
        })}
      </div>

      {/* The yes-now window */}
      <div className="mt-4 rounded-sm border border-[var(--color-parchment)] p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[12.5px] font-semibold text-[var(--color-ink)]">
            When they say yes, the worker needs, in minutes:
          </p>
          <ol className="flex flex-wrap items-center gap-1.5">
            {WINDOW_STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className="rounded-full border border-[var(--color-parchment)] bg-white px-2.5 py-1 text-[12px] text-[var(--color-ink-light)]">
                  <span className="mr-1 font-mono text-[10px] text-[var(--color-ember)]">{i + 1}</span>{s}
                </span>
                {i < WINDOW_STEPS.length - 1 ? <span className="text-[var(--color-parchment)]">→</span> : null}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-2 text-[12px] text-[var(--color-ink-muted)]">
          Today that mostly means calling lists and hoping the information is current. The window closes before the calls do.
        </p>
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--color-ink-muted)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">In the field</span>
        {OUTREACH_ACTORS.map((a, i) => {
          const s = SOURCES[a.source as keyof typeof SOURCES];
          return (
            <span key={a.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]">{a.name}</a>
              {i < OUTREACH_ACTORS.length - 1 ? " ·" : ""}
            </span>
          );
        })}
      </p>
    </div>
  );
}
