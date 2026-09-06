import { DELTAS, SOURCES } from "@/lib/libraries/data";

/**
 * The delta, in one screen. A dumbbell per measurable commitment: where the
 * number sits today (clay) and where the report says it must be by 2040
 * (canopy), with the distance between them drawn as the bar. This is the
 * page's central chart — everything after it explains one of these rows.
 */

const W = 100; // percent-based track

export default function DeltaChart() {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4 sm:px-7">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          Today → 2040, every number the report commits to
        </p>
        <div className="flex items-center gap-5 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[var(--color-clay)] ring-2 ring-white" /> now
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[var(--color-canopy)] ring-2 ring-white" /> 2040 target
          </span>
        </div>
      </div>

      <ol className="divide-y divide-[var(--color-parchment)]">
        {DELTAS.map((d) => {
          const nowPct = d.now === null ? null : (d.now / d.max) * W;
          const targetPct = (d.target / d.max) * W;
          const gap = d.now === null ? null : d.target - d.now;
          return (
            <li key={d.id} className="grid gap-x-8 gap-y-3 px-5 py-5 sm:px-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-center">
              <div>
                <p className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">{d.label}</p>
                <p className="mt-1 text-[14px] leading-snug text-[var(--color-ink-muted)]">
                  {d.nowNote}.{" "}
                  {d.sourceIds.map((sid, j) => (
                    <a
                      key={sid}
                      href={SOURCES[sid].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-[var(--color-sage)]/60 underline-offset-2 hover:text-[var(--color-canopy)]"
                    >
                      {j > 0 ? "; " : ""}
                      {SOURCES[sid].org}
                    </a>
                  ))}
                </p>
              </div>

              <div className="relative mt-7 h-14 lg:mt-0">
                {/* track */}
                <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--color-parchment)]" />
                {/* gap bar */}
                {nowPct !== null ? (
                  <div
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--color-ember)]"
                    style={{ left: `${Math.min(nowPct, targetPct)}%`, width: `${Math.abs(targetPct - nowPct)}%` }}
                  />
                ) : (
                  <div
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                    style={{
                      left: 0,
                      width: `${targetPct}%`,
                      backgroundImage: "repeating-linear-gradient(90deg, var(--color-ember) 0 6px, transparent 6px 11px)",
                    }}
                  />
                )}
                {/* now dot */}
                {nowPct !== null ? (
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${nowPct}%` }}>
                    <span className="block h-4 w-4 rounded-full bg-[var(--color-clay)] ring-[3px] ring-white shadow-[0_0_0_1px_var(--color-parchment)]" />
                    <span
                      className={`absolute top-full mt-1.5 whitespace-nowrap font-mono text-[14px] font-bold tabular-nums text-[var(--color-clay)] ${
                        nowPct < 8 ? "left-0" : "left-1/2 -translate-x-1/2"
                      }`}
                    >
                      {d.nowLabel}
                    </span>
                  </div>
                ) : (
                  <span className="absolute left-0 top-full mt-1.5 whitespace-nowrap font-mono text-[13px] italic text-[var(--color-clay)]">
                    no baseline yet · {d.nowLabel}
                  </span>
                )}
                {/* target dot */}
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${targetPct}%` }}>
                  <span className="block h-4 w-4 rounded-full bg-[var(--color-canopy)] ring-[3px] ring-white shadow-[0_0_0_1px_var(--color-parchment)]" />
                  <span className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[14px] font-bold tabular-nums text-[var(--color-canopy)]">
                    {d.targetLabel}
                  </span>
                </div>
                {/* gap label */}
                {gap !== null && nowPct !== null ? (
                  <span
                    className="absolute bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-ember)]"
                    style={{ left: `${(nowPct + targetPct) / 2}%` }}
                  >
                    {d.unit === "%" ? `+${gap} pts` : `+${gap}`}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-7">
        Targets are the report&apos;s proposed north stars, to be finalized after a representative 2027
        baseline. &ldquo;Residents who use the library&rdquo; has no measured baseline; registered borrowers
        ÷ population is the closest published proxy and overstates use.
      </p>
    </div>
  );
}
