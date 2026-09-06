"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  simulateFundingPolicy,
  personalCost,
  fmtMillions,
  fmtMoney,
  fmtPct,
} from "@/lib/fpdr/engine";

const POB_OPTIONS: { id: number; label: string; blurb: string }[] = [
  { id: 0, label: "No bond", blurb: "Fund it entirely from the levy" },
  { id: 200, label: "$200M bond", blurb: "Borrow $200M to soften the bump" },
];

function deltaLabel(reform: number, payGo: number) {
  const d = reform - payGo;
  const pct = payGo > 0 ? (d / payGo) * 100 : 0;
  return `${d >= 0 ? "+" : "−"}${fmtMillions(Math.abs(d))} (${d >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(0)}%)`;
}

export default function ReformSimulator() {
  const [pob, setPob] = useState(0);
  const [ret, setRet] = useState(0.07);
  const [homeValue, setHomeValue] = useState(350_000);

  const sim = useMemo(() => simulateFundingPolicy(ret, pob), [ret, pob]);
  const share = personalCost(homeValue).shareOfLevy;

  const chartData = sim.rows.map((r) => ({
    year: r.year,
    payGo: +r.payGo.toFixed(1),
    reform: +r.reform.toFixed(1),
  }));

  const savingsPositive = sim.lifetimeSavings > 0;
  const peakPayGoThatYear =
    sim.rows.find((r) => r.year === sim.peakReformYear)?.payGo ?? 0;

  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white overflow-hidden">
      {/* ── Controls ── */}
      <div className="p-5 sm:p-7 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
          {/* Pension-obligation bond */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-light)]">
              Add a pension-obligation bond?
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {POB_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setPob(o.id)}
                  className={`rounded-sm border px-3 py-2.5 text-left transition-colors ${
                    pob === o.id
                      ? "border-[var(--color-canopy)] bg-white shadow-sm"
                      : "border-[var(--color-parchment)] bg-white/40 hover:border-[var(--color-sage)]"
                  }`}
                >
                  <span
                    className={`block text-[13px] font-semibold ${
                      pob === o.id ? "text-[var(--color-canopy)]" : "text-[var(--color-ink-light)]"
                    }`}
                  >
                    {o.label}
                  </span>
                  <span className="block text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                    {o.blurb}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Return */}
          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-light)]">
                Investment return
              </label>
              <span className="font-mono text-[18px] font-bold text-[var(--color-canopy)] tabular-nums">
                {fmtPct(ret, 0)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.08}
              step={0.005}
              value={ret}
              onChange={(e) => setRet(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--color-river)] cursor-pointer"
              aria-label="Assumed annual investment return"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--color-ink-muted)] mt-1">
              <span>0%</span>
              <span>what a trust might earn</span>
              <span>8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="p-5 sm:p-7">
        <p className="text-[13px] text-[var(--color-ink-light)] mb-3 leading-relaxed">
          The yearly property-tax bill for police &amp; fire pensions, in millions.
          A real funding policy costs{" "}
          <span className="text-[var(--color-clay)] font-semibold">more at first</span>
          {sim.crossoverYear && (
            <>
              {" "}(until <span className="font-mono">{sim.crossoverYear}</span>), then{" "}
              <span className="text-[var(--color-fern)] font-semibold">less every year</span>, and
              falls away once the liability is paid off in{" "}
              <span className="font-mono">{sim.fundedYear}</span>.
            </>
          )}
        </p>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#d6d3d1" strokeOpacity={0.5} vertical={false} />
              {sim.crossoverYear ? (
                <ReferenceArea x1={2025} x2={sim.crossoverYear} fill="#b85c3a" fillOpacity={0.1} />
              ) : null}
              {sim.crossoverYear ? (
                <ReferenceArea x1={sim.crossoverYear} x2={2082} fill="#3d7a5a" fillOpacity={0.11} />
              ) : null}
              {sim.crossoverYear ? (
                <ReferenceLine
                  x={sim.crossoverYear}
                  stroke="#78716c"
                  strokeDasharray="3 4"
                  strokeOpacity={0.7}
                  label={{ value: "break-even", position: "insideTopRight", fontSize: 11, fill: "#78716c" }}
                />
              ) : null}
              <ReferenceLine
                x={sim.fundedYear}
                stroke="#3d7a5a"
                strokeDasharray="3 4"
                strokeOpacity={0.6}
                label={{ value: "paid off", position: "insideTopRight", fontSize: 11, fill: "#3d7a5a" }}
              />
              <XAxis
                dataKey="year"
                type="number"
                domain={[2025, 2082]}
                ticks={[2025, 2035, 2045, 2055, 2065, 2075, 2082]}
                tick={{ fontSize: 13, fill: "#78716c", fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
              />
              <YAxis
                tick={{ fontSize: 13, fill: "#78716c", fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v: number) => `$${v}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#faf6f0",
                  border: "1px solid #ebe5da",
                  borderRadius: "2px",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  boxShadow: "0 4px 16px rgba(15,36,25,0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#1a3a2a", fontWeight: 700, marginBottom: "2px" }}
                labelFormatter={(l) => `Year ${l}`}
                formatter={(value: number, name: string) => [
                  fmtMillions(value),
                  name === "payGo" ? "Keep pay-as-you-go" : "With the fix",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-body)" }}
                formatter={(v: string) => (v === "payGo" ? "Keep pay-as-you-go" : "With the fix")}
              />
              <Line
                type="monotone"
                dataKey="payGo"
                stroke="#78716c"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                animationDuration={600}
              />
              <Line
                type="monotone"
                dataKey="reform"
                stroke="#1a3a2a"
                strokeWidth={2.5}
                dot={false}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Outcomes ── */}
      <div className="grid sm:grid-cols-3 border-t border-[var(--color-parchment)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-parchment)]">
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Lifetime cost saved
          </p>
          <p
            className={`mt-1 font-mono text-3xl font-bold tabular-nums ${
              savingsPositive ? "text-[var(--color-fern)]" : "text-[var(--color-ink-muted)]"
            }`}
          >
            {savingsPositive ? fmtMillions(sim.lifetimeSavings) : "$0"}
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            {savingsPositive ? (
              <>
                {fmtPct(sim.savingsPct, 0)} less than pay-go ({fmtMillions(sim.lifetimePayGo)} →{" "}
                {fmtMillions(sim.lifetimeReform)}), all from investment returns
              </>
            ) : (
              <>At a 0% return there&apos;s nothing to gain — saving only helps if the money is invested.</>
            )}
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            The near-term bump
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-clay)] tabular-nums">
            {deltaLabel(sim.peakReform, peakPayGoThatYear)}
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            higher at the start (around {sim.peakReformYear}), then it declines every year
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            For a {fmtMoney(homeValue)} home
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-canopy)] tabular-nums">
            {savingsPositive ? fmtMoney(sim.lifetimeSavings * 1_000_000 * share) : "$0"}
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-snug">
            your household&apos;s share of the lifetime savings
          </p>
          <input
            type="range"
            min={75_000}
            max={1_500_000}
            step={5_000}
            value={homeValue}
            onChange={(e) => setHomeValue(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-canopy)] cursor-pointer"
            aria-label="Home assessed value for household share"
          />
        </div>
      </div>
    </div>
  );
}
