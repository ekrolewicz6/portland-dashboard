"use client";

import { useState } from "react";
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
  ReferenceDot,
} from "recharts";
import {
  utilization,
  utilizationCurve,
  UTIL,
  PARITY_HOMES,
  VIABLE_HOMES,
  fmtMoney,
  fmtSignedPct,
} from "@/lib/mass-timber/engine";

const ZONE = {
  failure: {
    label: "Failure zone",
    sub: "Costs MORE than building on site",
    color: "var(--color-clay)",
    chip: "bg-[#f0d9cf] text-[var(--color-clay)]",
  },
  parity: {
    label: "Break-even",
    sub: "Cheaper than site-built, but not yet a sustaining business",
    color: "var(--color-ember)",
    chip: "bg-[#f6ecdf] text-[#9a6b34]",
  },
  viable: {
    label: "Viable business",
    sub: "Beats the site-built price AND earns a sustaining margin",
    color: "var(--color-fern)",
    chip: "bg-[#dceadf] text-[var(--color-fern)]",
  },
} as const;

export default function UtilizationCalculator() {
  const [homes, setHomes] = useState(350);
  const u = utilization(homes);
  const curve = utilizationCurve();
  const z = ZONE[u.zone];

  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white overflow-hidden">
      {/* Control */}
      <div className="p-5 sm:p-7 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-light)]">
            How many homes the factory builds per year
          </label>
          <span className="font-mono text-[22px] font-bold text-[var(--color-canopy)] tabular-nums">
            {homes}
            <span className="text-[13px] text-[var(--color-ink-muted)] font-normal"> / {UTIL.capacity}</span>
          </span>
        </div>
        <input
          type="range"
          min={60}
          max={UTIL.capacity}
          step={5}
          value={homes}
          onChange={(e) => setHomes(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--color-fern)] cursor-pointer"
          aria-label="Homes built per year"
        />
        <div className="flex justify-between text-[10px] font-mono text-[var(--color-ink-muted)] mt-1">
          <span>nearly idle</span>
          <span>break-even ≈ {PARITY_HOMES}</span>
          <span>viable ≈ {VIABLE_HOMES}</span>
          <span>full ({UTIL.capacity})</span>
        </div>
      </div>

      {/* Result row */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-parchment)]">
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Cost per home
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-canopy)] tabular-nums">
            {fmtMoney(u.costPerHome)}
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">
            vs {fmtMoney(UTIL.conventionalAllIn)} built on site
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Compared to site-built
          </p>
          <p
            className="mt-1 font-mono text-3xl font-bold tabular-nums"
            style={{ color: u.deltaVsConventional > 0 ? "var(--color-clay)" : "var(--color-fern)" }}
          >
            {fmtSignedPct(u.pctVsConventional)}
          </p>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1">
            {u.deltaVsConventional > 0 ? "more expensive" : "cheaper"} per home
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Verdict
          </p>
          <span className={`mt-1.5 inline-block rounded-sm px-2.5 py-1 text-[12px] font-semibold ${z.chip}`}>
            {z.label}
          </span>
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-1.5 leading-snug">{z.sub}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 sm:p-7 border-t border-[var(--color-parchment)]">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 14, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#d6d3d1" strokeOpacity={0.5} vertical={false} />
              <ReferenceArea x1={60} x2={PARITY_HOMES} fill="#b85c3a" fillOpacity={0.07} />
              <ReferenceArea x1={PARITY_HOMES} x2={VIABLE_HOMES} fill="#c8956c" fillOpacity={0.08} />
              <ReferenceArea x1={VIABLE_HOMES} x2={UTIL.capacity} fill="#3d7a5a" fillOpacity={0.09} />
              <ReferenceLine x={PARITY_HOMES} stroke="#78716c" strokeDasharray="3 4" strokeOpacity={0.6}
                label={{ value: "break-even", position: "insideTopLeft", fontSize: 10, fill: "#78716c" }} />
              <ReferenceLine x={VIABLE_HOMES} stroke="#78716c" strokeDasharray="3 4" strokeOpacity={0.6}
                label={{ value: "viable", position: "insideTopLeft", fontSize: 10, fill: "#78716c" }} />
              <XAxis
                dataKey="homes"
                type="number"
                domain={[60, UTIL.capacity]}
                ticks={[100, 265, 490, 700]}
                tick={{ fontSize: 12, fill: "#78716c", fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={{ stroke: "#d6d3d1", strokeOpacity: 0.5 }}
                label={{ value: "homes built per year", position: "insideBottom", offset: -2, fontSize: 11, fill: "#78716c" }}
              />
              <YAxis
                domain={[340000, 680000]}
                tick={{ fontSize: 12, fill: "#78716c", fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
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
                labelFormatter={(l) => `${l} homes/year`}
                formatter={(value: number, name: string) => [
                  fmtMoney(value),
                  name === "modular" ? "Factory-built" : "Built on site",
                ]}
              />
              <Line type="monotone" dataKey="siteBuilt" stroke="#78716c" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="modular" stroke="#1a3a2a" strokeWidth={2.5} dot={false} animationDuration={700} />
              <ReferenceDot x={homes} y={u.costPerHome} r={5} fill={z.color} stroke="#fff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[12px] text-[var(--color-ink-muted)] mt-2 leading-relaxed">
          The same factory builds homes that cost <strong>more</strong> than site-built when it&apos;s
          half-empty and <strong>less</strong> when it&apos;s full. That hyperbola — fixed cost
          divided by output — is why a half-empty factory is a money-loser, and why securing
          committed demand is the whole game.
        </p>
      </div>
    </div>
  );
}
