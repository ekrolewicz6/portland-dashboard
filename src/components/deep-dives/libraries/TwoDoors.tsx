import { DERIVED, YEARS } from "@/lib/libraries/data";

/**
 * Fifteen years in one chart: physical circulation, digital circulation, and
 * in-person visits, drawn on the four fiscal years the State Library series
 * reports, with the events that bent the lines annotated in place. Then the
 * numbers the report never adds up, as insight tiles.
 */

const SERIES = {
  physical: { label: "Physical circulation", color: "#3d7a5a" },
  digital: { label: "Digital circulation", color: "#c8956c" },
  visits: { label: "In-person visits", color: "#4a7f9e" },
} as const;

// chart geometry
const VW = 720;
const VH = 320;
const PAD = { l: 44, r: 24, t: 28, b: 40 };
const X0 = 2010;
const X1 = 2026;
const YMAX = 25; // millions

const x = (fy: number) => PAD.l + ((fy - X0) / (X1 - X0)) * (VW - PAD.l - PAD.r);
const y = (m: number) => PAD.t + (1 - m / YMAX) * (VH - PAD.t - PAD.b);

function path(points: Array<[number, number]>) {
  return points.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
}

export default function TwoDoors() {
  const physical = YEARS.map((p) => [x(p.fy), y(p.physicalM)] as [number, number]);
  const digital = YEARS.filter((p) => p.digitalM !== null).map((p) => [x(p.fy), y(p.digitalM!)] as [number, number]);
  const visits = YEARS.filter((p) => p.visits !== null).map((p) => [x(p.fy), y(p.visits! / 1_000_000)] as [number, number]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4 sm:px-7">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Millions per year, FY2011–FY2025
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            {Object.values(SERIES).map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span className="h-[3px] w-4 rounded-full" style={{ background: s.color }} /> {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto px-2 pt-2 sm:px-4">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full min-w-[640px]" role="img" aria-label="Line chart: physical circulation fell from 24 million in 2011 to 10 million in 2025; digital circulation rose from 3.5 million in 2019 to 7.4 million in 2025; in-person visits fell from 5.5 million to 2.2 million.">
            {/* gridlines */}
            {[0, 5, 10, 15, 20, 25].map((m) => (
              <g key={m}>
                <line x1={PAD.l} x2={VW - PAD.r} y1={y(m)} y2={y(m)} stroke="#ebe5da" strokeWidth={m === 0 ? 1.2 : 0.8} />
                <text x={PAD.l - 8} y={y(m) + 3.5} textAnchor="end" fontSize="12" fill="#78716c" fontFamily="var(--font-mono)">
                  {m}M
                </text>
              </g>
            ))}
            {/* x labels */}
            {YEARS.map((p) => (
              <text key={p.fy} x={x(p.fy)} y={VH - PAD.b + 18} textAnchor="middle" fontSize="12.5" fill="#44403c" fontFamily="var(--font-mono)">
                FY{p.fy}
              </text>
            ))}

            {/* event bands */}
            <rect x={x(2020.2)} y={PAD.t} width={x(2021.5) - x(2020.2)} height={VH - PAD.t - PAD.b} fill="#b85c3a" fillOpacity="0.07" />
            <text x={x(2020.85)} y={VH - PAD.b - 8} textAnchor="middle" fontSize="11.5" fill="#b85c3a" fontFamily="var(--font-mono)" letterSpacing="0.5">
              CLOSED
            </text>
            <rect x={x(2021.5)} y={PAD.t} width={x(2026) - x(2021.5)} height={VH - PAD.t - PAD.b} fill="#c8956c" fillOpacity="0.06" />
            <text x={x(2026) - 4} y={PAD.t + 12} textAnchor="end" fontSize="11.5" fill="#a06f45" fontFamily="var(--font-mono)" letterSpacing="0.5">
              BOND CONSTRUCTION · ROLLING CLOSURES
            </text>
            <line x1={x(2013)} x2={x(2013)} y1={PAD.t} y2={VH - PAD.b} stroke="#0f2419" strokeOpacity="0.35" strokeDasharray="3 3" />
            <text x={x(2013) + 5} y={VH - PAD.b - 8} fontSize="11.5" fill="#0f2419" fillOpacity="0.7" fontFamily="var(--font-mono)" letterSpacing="0.5">
              DISTRICT FUNDING BEGINS
            </text>

            {/* lines */}
            <path d={path(physical)} fill="none" stroke={SERIES.physical.color} strokeWidth="2.5" strokeLinejoin="round" />
            <path d={path(visits)} fill="none" stroke={SERIES.visits.color} strokeWidth="2.5" strokeLinejoin="round" />
            <path d={path(digital)} fill="none" stroke={SERIES.digital.color} strokeWidth="2.5" strokeLinejoin="round" />
            {/* visits: dashed bridge across the unreported 2021 point */}
            <path d={path([visits[1], visits[2]])} fill="none" stroke="white" strokeWidth="4" />
            <path d={path([visits[1], visits[2]])} fill="none" stroke={SERIES.visits.color} strokeWidth="2.5" strokeDasharray="4 4" />

            {/* markers + labels */}
            {YEARS.map((p) => (
              <g key={p.fy}>
                <circle cx={x(p.fy)} cy={y(p.physicalM)} r="4.5" fill={SERIES.physical.color} stroke="white" strokeWidth="2">
                  <title>{`FY${p.fy} physical circulation: ${p.physicalM}M`}</title>
                </circle>
                {p.digitalM !== null ? (
                  <circle cx={x(p.fy)} cy={y(p.digitalM)} r="4.5" fill={SERIES.digital.color} stroke="white" strokeWidth="2">
                    <title>{`FY${p.fy} digital circulation: ${p.digitalM}M`}</title>
                  </circle>
                ) : null}
                {p.visits !== null ? (
                  <circle cx={x(p.fy)} cy={y(p.visits / 1e6)} r="4.5" fill={SERIES.visits.color} stroke="white" strokeWidth="2">
                    <title>{`FY${p.fy} in-person visits: ${(p.visits / 1e6).toFixed(2)}M`}</title>
                  </circle>
                ) : null}
              </g>
            ))}
            {/* endpoint labels */}
            <text x={x(2011) - 6} y={y(23.95) - 8} fontSize="13" fontWeight="700" fill={SERIES.physical.color} fontFamily="var(--font-mono)" textAnchor="start">24.0M</text>
            <text x={x(2025) + 8} y={y(10.15) + 4} fontSize="13" fontWeight="700" fill={SERIES.physical.color} fontFamily="var(--font-mono)">10.2M</text>
            <text x={x(2025) + 8} y={y(7.37) + 4} fontSize="13" fontWeight="700" fill={SERIES.digital.color} fontFamily="var(--font-mono)">7.4M</text>
            <text x={x(2025) + 8} y={y(2.18) + 4} fontSize="13" fontWeight="700" fill={SERIES.visits.color} fontFamily="var(--font-mono)">2.2M</text>
            <text x={x(2011) - 6} y={y(5.52) - 8} fontSize="13" fontWeight="700" fill={SERIES.visits.color} fontFamily="var(--font-mono)">5.5M</text>
            <text x={x(2019)} y={y(3.46) + 16} fontSize="12" fontWeight="700" fill={SERIES.digital.color} fontFamily="var(--font-mono)" textAnchor="middle">3.5M</text>
          </svg>
        </div>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-7">
          Four reported years, connected. FY2011 used older circulation categories, so the physical line&apos;s
          first leg is directional. Visits were not reported for FY2021 (dashed). Source: State Library of Oregon.
        </p>
      </div>

      {/* insight tiles: the arithmetic the report leaves to the reader */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            big: `${DERIVED.visitsPerResident2011} → ${DERIVED.visitsPerResident2025}`,
            k: "visits per resident per year, 2011 → 2025",
            note: "Every resident used to walk into a library seven times a year. Now it's under three — closures explain part, not all.",
            tone: "clay",
          },
          {
            big: `${Math.round(DERIVED.borrowerShare2011 * 100)}% → ${Math.round(DERIVED.borrowerShare2025 * 100)}%`,
            k: "residents holding a library card",
            note: "Registered borrowers fell 67,000 while the county grew by 62,000 people.",
            tone: "clay",
          },
          {
            big: `${DERIVED.eSpendVsPrint}×`,
            k: "e-materials spending vs. print, FY2025",
            note: `$4.87M on licenses against $2.30M on print. In 2011 it was the other way around, 1 : 3.7.`,
            tone: "ember",
          },
          {
            big: `$${DERIVED.eSpendPerCirc.toFixed(2)} vs $${DERIVED.printSpendPerCirc.toFixed(2)}`,
            k: "materials spend per checkout, digital vs. print",
            note: "A print book is bought once and lends for years; a license is often per-year. Digital convenience is real, and priced.",
            tone: "ember",
          },
        ].map((t) => (
          <div key={t.k} className={`rounded-sm border-l-[3px] bg-white p-4 ${t.tone === "clay" ? "border-l-[var(--color-clay)]" : "border-l-[var(--color-ember)]"}`}>
            <p className={`font-mono text-[22px] font-bold tabular-nums leading-none ${t.tone === "clay" ? "text-[var(--color-clay)]" : "text-[var(--color-ink)]"}`}>{t.big}</p>
            <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{t.k}</p>
            <p className="mt-2 text-[14px] leading-snug text-[var(--color-ink-light)]">{t.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
