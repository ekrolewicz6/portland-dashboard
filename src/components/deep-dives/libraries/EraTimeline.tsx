import { ERAS, TIMELINE } from "@/lib/libraries/data";

/**
 * 1864–2026 in five eras. Each era is a band with a large year rail; the
 * events inside it are compact. The eras are the argument — "access
 * widening in layers" — the events are the evidence.
 */
export default function EraTimeline() {
  return (
    <div className="space-y-3">
      {ERAS.map((era, i) => {
        const events = TIMELINE.filter((e) => era.years.includes(e.year));
        const dark = i === ERAS.length - 1;
        return (
          <section
            key={era.range}
            className={`overflow-hidden rounded-sm border ${dark ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-white"}`}
          >
            <div className={`grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)] ${dark ? "" : ""}`}>
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className={`font-mono text-[12px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"}`}>
                  Era {i + 1}
                </p>
                <p className={`mt-1 font-mono text-[26px] font-bold leading-none tracking-tight ${dark ? "text-white" : "text-[var(--color-ink)]"}`}>{era.range}</p>
                <h3 className={`mt-2 font-editorial text-[19px] leading-snug ${dark ? "text-white/85" : "text-[var(--color-ink-light)]"}`}>{era.title}</h3>
              </div>
              <ol className={`grid gap-x-6 gap-y-4 sm:grid-cols-2 ${events.length > 4 ? "xl:grid-cols-3" : ""}`}>
                {events.map((e) => (
                  <li key={e.year} className={`border-l-2 pl-3.5 ${dark ? "border-[var(--color-ember)]/60" : "border-[var(--color-parchment)]"}`}>
                    <p className={`font-mono text-[13px] font-bold tabular-nums ${dark ? "text-[var(--color-ember-bright)]" : "text-[var(--color-clay)]"}`}>{e.year}</p>
                    <p className={`mt-0.5 text-[16px] font-semibold leading-snug ${dark ? "text-white" : "text-[var(--color-ink)]"}`}>{e.title}</p>
                    <p className={`mt-1 text-[14px] leading-snug ${dark ? "text-white/65" : "text-[var(--color-ink-light)]"}`}>{e.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}
