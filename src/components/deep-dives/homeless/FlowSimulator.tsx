"use client";

import { useMemo, useState } from "react";
import { simulate, FLOW, fmtNum, fmtMoney, type Levers } from "@/lib/homeless/engine";
import { STATS } from "@/lib/homeless/data";

/**
 * The stocks-and-flows simulator, laid out to be seen in one view at desktop
 * width: presets, then all five levers in a strip, then the chart beside the
 * outcomes and the cost. Opens on the "close the inflow" preset so the chart
 * tells the page's thesis before anyone touches a slider.
 */

const PRESETS: { key: string; label: string; hint: string; levers: Levers }[] = [
  { key: "nothing", label: "Do nothing", hint: "the current trajectory", levers: { evictionPrevention: 0, dischargeBan: 0, treatmentBeds: 0, workforceFill: 0.8, masterLeased: 0 } },
  { key: "inflow", label: "Close the inflow", hint: "prevention + no street discharge, zero new units", levers: { evictionPrevention: 0.9, dischargeBan: 0.9, treatmentBeds: 0, workforceFill: 0.8, masterLeased: 0 } },
  { key: "build", label: "Build only", hint: "2,000 leased units + 500 beds, inflow untouched", levers: { evictionPrevention: 0, dischargeBan: 0, treatmentBeds: 500, workforceFill: 0.8, masterLeased: 2000 } },
  { key: "plan", label: "Both", hint: "close the inflow and open the outflow", levers: { evictionPrevention: 0.9, dischargeBan: 0.9, treatmentBeds: 800, workforceFill: 0.8, masterLeased: 1500 } },
];

const COST_SEGMENTS = [
  { key: "prevention", label: "Prevention", cohort: "economic group, kept housed", color: "var(--color-clay)" },
  { key: "housing", label: "Leased housing", cohort: "economic & episodic groups", color: "var(--color-fern)" },
  { key: "treatment", label: "Treatment beds", cohort: "chronic & severe group", color: "var(--color-river-deep)" },
] as const;

function sameLevers(a: Levers, b: Levers) {
  return (Object.keys(a) as (keyof Levers)[]).every((k) => Math.abs(a[k] - b[k]) < 1e-9);
}

function Slider({
  label, value, min, max, step, onChange, display, hint, accent,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string; hint?: string; accent: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <label className="truncate text-[12.5px] font-medium text-[var(--color-ink)]">{label}</label>
        <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--color-canopy)]">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full cursor-pointer"
        style={{ accentColor: accent }}
        aria-label={label}
      />
      {hint ? <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-ink-muted)]">{hint}</p> : null}
    </div>
  );
}

// ── SVG chart ─────────────────────────────────────────────────────

const W = 900, H = 440, PL = 52, PR = 190, PT = 18, PB = 30;

function Chart({
  rows, crossover, hover, onHover,
}: {
  rows: { month: number; baseline: number; scenario: number }[];
  crossover: number | null;
  hover: number | null;
  onHover: (m: number | null) => void;
}) {
  const maxY = Math.max(...rows.map((r) => Math.max(r.baseline, r.scenario)));
  const yTop = Math.ceil((maxY * 1.03) / 10000) * 10000;
  const x = (m: number) => PL + (m / 48) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / yTop) * (H - PT - PB);
  const path = (key: "baseline" | "scenario") =>
    rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.month).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  const last = rows[rows.length - 1];
  const yTicks = Array.from({ length: yTop / 10000 + 1 }, (_, i) => i * 10000);
  let yB = y(last.baseline), yS = y(last.scenario);
  if (Math.abs(yB - yS) < 16) { const mid = (yB + yS) / 2; const dir = Math.sign(yB - yS) || 1; yB = mid + 8 * dir; yS = mid - 8 * dir; }
  const h = hover !== null ? rows[hover] : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      role="img"
      aria-label="Projected people on the by-name list over four years, do-nothing versus your scenario"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        const m = Math.round(((px - PL) / (W - PL - PR)) * 48);
        onHover(m >= 0 && m <= 48 ? m : null);
      }}
      onMouseLeave={() => onHover(null)}
    >
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="#e7e2d8" strokeDasharray={t === 0 ? undefined : "2 5"} />
          <text x={PL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#78716c" fontFamily="var(--font-mono)">
            {t === 0 ? "0" : `${t / 1000}k`}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((yr) => (
        <text key={yr} x={x(yr * 12)} y={H - 10} textAnchor="middle" fontSize="11" fill="#78716c" fontFamily="var(--font-mono)">
          {yr === 0 ? "now" : `+${yr}y`}
        </text>
      ))}
      {crossover !== null ? (
        <g>
          <line x1={x(crossover)} x2={x(crossover)} y1={PT} y2={H - PB} stroke="#3d7a5a" strokeDasharray="3 4" strokeOpacity="0.8" />
          <text x={x(crossover) + 6} y={H - PB - 8} fontSize="10.5" fill="#3d7a5a" fontFamily="var(--font-mono)">
            growth stops · month {crossover}
          </text>
        </g>
      ) : null}
      <path d={path("baseline")} fill="none" stroke="#78716c" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={path("scenario")} fill="none" stroke="#1a3a2a" strokeWidth="2.5" strokeLinejoin="round" />
      <g fontFamily="var(--font-mono)" fontSize="11">
        <text x={W - PR + 8} y={yB + 4} fill="#78716c"><tspan fontWeight="700">{fmtNum(last.baseline)}</tspan> do nothing</text>
        <text x={W - PR + 8} y={yS + 4} fill="#1a3a2a"><tspan fontWeight="700">{fmtNum(last.scenario)}</tspan> your scenario</text>
      </g>
      {h ? (
        <g>
          <line x1={x(h.month)} x2={x(h.month)} y1={PT} y2={H - PB} stroke="#1c1917" strokeOpacity="0.25" />
          <circle cx={x(h.month)} cy={y(h.baseline)} r="4" fill="#fff" stroke="#78716c" strokeWidth="1.5" />
          <circle cx={x(h.month)} cy={y(h.scenario)} r="4.5" fill="#fff" stroke="#1a3a2a" strokeWidth="2" />
          {(() => {
            const bx = Math.min(x(h.month) + 10, W - PR - 150);
            return (
              <g transform={`translate(${bx}, ${PT + 4})`} fontFamily="var(--font-mono)" fontSize="11">
                <rect width="146" height="52" rx="2" fill="#faf6f0" stroke="#ebe5da" />
                <text x="8" y="16" fill="#78716c">month {h.month}</text>
                <text x="8" y="32" fill="#78716c">do nothing {fmtNum(h.baseline)}</text>
                <text x="8" y="46" fill="#1a3a2a" fontWeight="700">scenario {fmtNum(h.scenario)}</text>
              </g>
            );
          })()}
        </g>
      ) : null}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────

function Tile({ label, value, sub, cls }: { label: string; value: string; sub: string; cls: string }) {
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{label}</p>
      <p className={`mt-1 font-mono text-[26px] font-bold tabular-nums leading-none ${cls}`}>{value}</p>
      <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{sub}</p>
    </div>
  );
}

export default function FlowSimulator() {
  const [levers, setLevers] = useState<Levers>(PRESETS[1].levers);
  const [hover, setHover] = useState<number | null>(null);
  const set = (k: keyof Levers) => (v: number) => setLevers((l) => ({ ...l, [k]: v }));
  const sim = useMemo(() => simulate(levers), [levers]);
  const active = PRESETS.find((p) => sameLevers(p.levers, levers))?.key ?? "custom";
  const shrinking = sim.scenarioNetMonthly < 0;
  const delta = sim.baselineEnd - sim.scenarioEnd;

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-4 py-3 sm:px-5">
        <span className="mr-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">Try</span>
        {PRESETS.map((p) => {
          const on = p.key === active;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setLevers(p.levers)}
              title={p.hint}
              className={`min-h-[36px] rounded-sm border px-3 text-[12.5px] font-medium transition-colors ${
                on
                  ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white"
                  : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"
              }`}
              aria-pressed={on}
            >
              {p.label}
            </button>
          );
        })}
        {active === "custom" ? (
          <span className="rounded-sm border border-dashed border-[var(--color-ember)] px-3 py-1.5 text-[12px] text-[var(--color-ember)]">your mix</span>
        ) : null}
        <span className="ml-auto hidden text-[11.5px] text-[var(--color-ink-muted)] md:block">
          {PRESETS.find((p) => p.key === active)?.hint ?? "sliders moved by hand"}
        </span>
      </div>

      {/* Levers: one strip, all five visible */}
      <div className="grid gap-x-8 gap-y-5 border-b border-[var(--color-parchment)] px-4 py-4 sm:px-5 xl:grid-cols-5">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:col-span-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-clay)] sm:col-span-2">Close the inflow · cheapest</p>
          <Slider label="Eviction prevention" value={levers.evictionPrevention} min={0} max={1} step={0.05} onChange={set("evictionPrevention")} accent="#b85c3a" display={`${Math.round(levers.evictionPrevention * 100)}%`} hint="One-time arrears for a verified crisis, paid to the landlord." />
          <Slider label="Stop street discharge" value={levers.dischargeBan} min={0} max={1} step={0.05} onChange={set("dischargeBan")} accent="#b85c3a" display={`${Math.round(levers.dischargeBan * 100)}%`} hint="No release from jail, hospital, or foster care to the sidewalk." />
        </div>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3 xl:col-span-3 xl:border-l xl:border-[var(--color-parchment)] xl:pl-8">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-fern)] sm:col-span-3">Open the outflow</p>
          <Slider label="Master-leased units" value={levers.masterLeased} min={0} max={3000} step={50} onChange={set("masterLeased")} accent="#3d7a5a" display={fmtNum(levers.masterLeased)} hint="Lease existing apartments: homes this year, not in construction-years." />
          <Slider label="New treatment beds" value={levers.treatmentBeds} min={0} max={2000} step={50} onChange={set("treatmentBeds")} accent="#2d5f7e" display={fmtNum(levers.treatmentBeds)} hint="Detox and residential beds." />
          <Slider label="…share actually staffed" value={levers.workforceFill} min={0.5} max={1} step={0.05} onChange={set("workforceFill")} accent="#64748b" display={`${Math.round(levers.workforceFill * 100)}%`} hint="A bed you can't staff is a press release." />
        </div>
      </div>

      {/* Chart beside outcomes + cost */}
      <div className="grid xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 px-4 pt-4 pb-3 sm:px-5 xl:border-r xl:border-[var(--color-parchment)]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            People on the by-name list, next four years
          </p>
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[760px]">
              <Chart rows={sim.rows} crossover={sim.crossover} hover={hover} onHover={setHover} />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col divide-y divide-[var(--color-parchment)] border-t border-[var(--color-parchment)] xl:border-t-0">
          <div className="grid divide-x divide-[var(--color-parchment)] sm:grid-cols-3 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
            <Tile label="Do nothing, year 4" value={fmtNum(sim.baselineEnd)} sub={`from ${fmtNum(FLOW.startTotal)} today`} cls="text-[var(--color-storm)]" />
            <Tile label="Your scenario, year 4" value={fmtNum(sim.scenarioEnd)} sub={delta > 0 ? `${fmtNum(delta)} fewer people` : "same as doing nothing"} cls="text-[var(--color-canopy)]" />
            <Tile label="Does growth stop?" value={shrinking ? "Yes" : "No"} sub={shrinking ? `list shrinks ${fmtNum(-sim.scenarioNetMonthly)}/month` : `still +${fmtNum(sim.scenarioNetMonthly)}/month`} cls={shrinking ? "text-[var(--color-fern)]" : "text-[var(--color-clay)]"} />
          </div>

          {/* Cost */}
          <div className="flex-1 bg-[var(--color-paper-warm)] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-light)]">Cost to run, per year</p>
              <p className="font-mono text-[22px] font-bold tabular-nums leading-none text-[var(--color-canopy)]">{fmtMoney(sim.cost.total)}</p>
            </div>
            {sim.cost.total > 0 ? (
              <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]">
                ≈ {Math.round((sim.cost.total / STATS.shsCollectedFY25) * 100)}% of what the homeless-services tax raises now
              </p>
            ) : (
              <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]">$0 program cost. The list grows to {fmtNum(sim.baselineEnd)}; the street is the expensive option.</p>
            )}
            <div className="mt-3 flex h-6 w-full gap-[2px] overflow-hidden rounded-sm bg-white">
              {sim.cost.total > 0
                ? COST_SEGMENTS.map((seg) => {
                    const val = sim.cost[seg.key];
                    if (val <= 0) return null;
                    const pct = (val / sim.cost.total) * 100;
                    return (
                      <div key={seg.key} className="flex h-full items-center overflow-hidden px-1.5" style={{ width: `${pct}%`, backgroundColor: seg.color }} title={`${seg.label}: ${fmtMoney(val)}/yr`}>
                        {pct > 22 ? <span className="truncate font-mono text-[10px] font-semibold text-white">{fmtMoney(val)}</span> : null}
                      </div>
                    );
                  })
                : null}
            </div>
            <div className="mt-2 space-y-0.5">
              {COST_SEGMENTS.map((seg) => (
                <div key={seg.key} className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
                  <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: seg.color }} />
                  <span className="font-medium text-[var(--color-ink-light)]">{seg.label}</span>
                  <span className="truncate">· {seg.cohort}</span>
                  <span className="ml-auto font-mono tabular-nums">{fmtMoney(sim.cost[seg.key])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
