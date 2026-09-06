import { PLAN, PLAN_SPEED } from "@/lib/homeless/data";

/**
 * The five moves on the axis that orders them: how fast each one starts
 * working. Weeks, months, years. The numbers on the axis are the same
 * numbers on the list below.
 */
const ZONES: { key: "weeks" | "months" | "years"; label: string; note: string }[] = [
  { key: "weeks", label: "Weeks", note: "policy and admin changes" },
  { key: "months", label: "Months", note: "build and ship" },
  { key: "years", label: "Years", note: "capital and staffing" },
];
const ZONE_TINT: Record<string, string> = { weeks: "var(--color-fern)", months: "var(--color-river)", years: "var(--color-storm)" };

export default function PlanTimeline() {
  return (
    <div className="space-y-5">
      {/* Speed axis */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">How fast each move starts working</p>
        <div className="mt-4 grid grid-cols-3 gap-[2px]">
          {ZONES.map((z) => {
            const steps = PLAN.filter((s) => PLAN_SPEED[s.n].horizon === z.key);
            return (
              <div key={z.key} className="rounded-sm bg-[var(--color-paper-warm)] p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold text-[var(--color-ink)]">{z.label}</p>
                  <p className="hidden font-mono text-[10px] text-[var(--color-ink-muted)] sm:block">{z.note}</p>
                </div>
                <div className="mt-2.5 flex gap-1.5">
                  {steps.map((s) => (
                    <a key={s.n} href={`#plan-${s.n}`} className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[13px] font-bold text-white" style={{ backgroundColor: ZONE_TINT[z.key] }} title={s.title}>
                      {s.n}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-[var(--color-ink-muted)]">
          The iron rule underneath: capacity precedes enforcement. You can&apos;t move someone off the street faster than you can build a place to put them.
        </p>
      </div>

      {/* The five moves */}
      <ol className="divide-y divide-[var(--color-parchment)] rounded-sm border border-[var(--color-parchment)] bg-white">
        {PLAN.map((step) => {
          const meta = PLAN_SPEED[step.n];
          return (
            <li key={step.n} id={`plan-${step.n}`} className="grid gap-x-5 gap-y-2 p-5 scroll-mt-28 sm:grid-cols-[44px_1fr] sm:p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-[15px] font-bold text-white" style={{ backgroundColor: ZONE_TINT[meta.horizon] }}>
                {step.n}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[17px] font-semibold leading-tight text-[var(--color-canopy)]">{step.title}</h3>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: ZONE_TINT[meta.horizon] }}>{meta.horizon}</span>
                  <span className="text-[11.5px] text-[var(--color-ink-muted)]">{meta.costTag}</span>
                </div>
                <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-ink-light)]">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
