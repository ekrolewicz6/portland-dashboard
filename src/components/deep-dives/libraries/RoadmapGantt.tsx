import { PHASES } from "@/lib/libraries/data";

/** 2026 → 2040 as a Gantt: four phases against a year axis, with the Board gates marked. */
const X0 = 2026;
const X1 = 2040.5;
const pct = (y: number) => ((y - X0) / (X1 - X0)) * 100;

const GATES = [
  { y: 2026.95, label: "90-day checkpoint" },
  { y: 2027.7, label: "Readiness return" },
  { y: 2030, label: "Scale decision" },
  { y: 2035, label: "Independent review" },
];

export default function RoadmapGantt() {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="px-5 pt-5 sm:px-7">
        {/* axis */}
        <div className="relative h-6 border-b border-[var(--color-parchment)]">
          {[2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040].map((y) => (
            <span key={y} className="absolute -translate-x-1/2 font-mono text-[12px] tabular-nums text-[var(--color-ink-muted)]" style={{ left: `${pct(y)}%` }}>
              {y}
            </span>
          ))}
        </div>
        {/* gates */}
        <div className="relative mt-3 h-12">
          {GATES.map((g, i) => (
            <div key={g.label} className="absolute top-0 -translate-x-1/2" style={{ left: `${pct(g.y)}%` }}>
              <span className="mx-auto block h-2.5 w-2.5 rotate-45 bg-[var(--color-clay)]" />
              <span className={`block whitespace-nowrap font-mono text-[11.5px] uppercase tracking-[0.1em] text-[var(--color-clay)] ${i % 2 ? "mt-5" : "mt-1"}`}>
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {PHASES.map((p, i) => (
          <li key={p.title} className="grid gap-x-6 gap-y-2 px-5 py-4 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div className="relative h-9">
              {(() => {
                const w = pct(p.end) - pct(p.start);
                const narrow = w < 20;
                const bg = i === 0 ? "var(--color-clay)" : i === 3 ? "var(--color-canopy)" : "var(--color-fern)";
                return (
                  <>
                    <div className="absolute inset-y-0 rounded-sm" style={{ left: `${pct(p.start)}%`, width: `${w}%`, background: bg, opacity: i === 2 ? 0.85 : 1 }} />
                    <span
                      className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[13px] font-bold uppercase tracking-[0.12em]"
                      style={narrow ? { left: `calc(${pct(p.end)}% + 8px)`, color: bg } : { left: `calc(${pct(p.start)}% + 12px)`, color: "white" }}
                    >
                      {p.title}
                    </span>
                  </>
                );
              })()}
            </div>
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{p.range}</p>
              <p className="mt-0.5 text-[15px] leading-snug text-[var(--color-ink-light)]">{p.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
