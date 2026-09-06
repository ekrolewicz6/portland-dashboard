import { BENCHMARKS, REACH_COMPARE, SOURCES } from "@/lib/libraries/data";

/**
 * Portland on the same axis as the systems the report benchmarks. Definitions
 * differ and the chart says so; the shape of the gap is still the point.
 * Then the eight practice lessons as a tight grid.
 */
export default function ReachCompare() {
  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-7">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
          Share of the public the library reaches
        </p>
        <ol className="mt-5 space-y-3">
          {REACH_COMPARE.map((r) => {
            const isPortland = r.id.startsWith("portland");
            const isTarget = r.id === "portland-target";
            const color = isTarget ? "var(--color-canopy)" : isPortland ? "var(--color-clay)" : "var(--color-river)";
            return (
              <li key={r.id} className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)_56px] items-center gap-3 sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)_64px]">
                <div className="min-w-0">
                  <p className={`truncate text-[15px] font-semibold ${isPortland ? "text-[var(--color-ink)]" : "text-[var(--color-ink-light)]"}`}>{r.label}</p>
                  <p className="truncate text-[13px] text-[var(--color-ink-muted)]">{r.measure}</p>
                </div>
                <div className="h-6 w-full rounded-sm bg-[var(--color-paper-warm)]">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${r.value}%`,
                      background: color,
                      backgroundImage: isTarget ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.28) 0 4px, transparent 4px 8px)" : undefined,
                    }}
                    title={`${r.label}: ${r.value}%`}
                  />
                </div>
                <span className="text-right font-mono text-[15px] font-bold tabular-nums" style={{ color }}>
                  {r.value}%
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Not one dataset: Toronto and Singapore count residents who use the library; Portland has no
          resident-use survey, so its two bars are registered borrowers ÷ population and the FY2026
          active-cardholder-household measure. The 2040 target adopts Toronto&apos;s definition.{" "}
          {REACH_COMPARE.map((r, i) => (
            <span key={r.id}>
              {i > 0 ? " · " : ""}
              <a href={SOURCES[r.sourceId].url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--color-sage)]/60 underline-offset-2 hover:text-[var(--color-canopy)]">
                {SOURCES[r.sourceId].org}
              </a>
            </span>
          ))}
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-parchment)] sm:grid-cols-2 xl:grid-cols-4">
        {BENCHMARKS.map((b) => (
          <article key={b.city} className="bg-white p-4 sm:p-5">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">{b.city}</p>
            <h3 className="mt-0.5 font-editorial text-[18px] leading-tight text-[var(--color-ink)]">{b.system}</h3>
            <p className="mt-1.5 font-mono text-[13px] tabular-nums leading-snug text-[var(--color-canopy)]">{b.stat}</p>
            <p className="mt-2 text-[14px] leading-snug text-[var(--color-ink-light)]">{b.lesson}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
