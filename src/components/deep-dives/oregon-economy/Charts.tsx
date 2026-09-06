"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BUDGET_FUNDS,
  BUDGET_OPERATIONS,
  INCENTIVE_ROI,
  JOBS_KPM,
  METHODOLOGY,
} from "@/lib/oregon-economy/data";
import { fmtDollars, fmtNum, fmtUSD } from "@/lib/oregon-economy/engine";

function NumberCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-y border-[var(--color-parchment)] bg-white p-4 sm:rounded-sm sm:border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-1 break-words font-mono text-[24px] font-bold leading-none tabular-nums text-[var(--color-ink)] [overflow-wrap:anywhere]">
        {value}
      </p>
      {note ? <p className="mt-2 text-[12px] leading-snug text-[var(--color-ink-light)]">{note}</p> : null}
    </div>
  );
}

function TooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-3 py-2 shadow-lg">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The scorecard — jobs created (actual bars) vs target (line)         */
/* ------------------------------------------------------------------ */

function ScorecardTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ payload?: { actual?: number; target?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const gap = (d.actual ?? 0) - (d.target ?? 0);
  return (
    <TooltipBox>
      <p className="font-mono text-[12px] font-semibold text-[var(--color-ink)]">FY {label}</p>
      <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-light)]">Created: {fmtNum(d.actual ?? 0)} jobs</p>
      <p className="font-mono text-[12px] text-[var(--color-ink-light)]">Target: {fmtNum(d.target ?? 0)} jobs</p>
      <p className="mt-1 font-mono text-[12px] font-semibold text-[#8c3d25]">Missed by {fmtNum(Math.abs(gap))}</p>
    </TooltipBox>
  );
}

export function ScorecardChart() {
  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
        Jobs created vs. the goal
      </p>
      <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[30px]">
        The bars never reach the line, so the line came down to meet them.
      </h3>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
        Each bar is the jobs Business Oregon takes credit for that year. The dashed line is the goal it was
        measured against. After years of missing, the goal dropped from 1,200 to 800 in 2024, and in 2025 the
        agency finally cleared it, by eight jobs, in a year Oregon&apos;s private sector lost about 6,500.
      </p>

      <div
        role="img"
        aria-label="Chart of Business Oregon jobs created versus its target, fiscal years 2020 to 2025. Actuals 811, 504, 378, 541, 490, 808 against targets 1,200, 1,300, 1,200, 1,200, 800, 800 — the target was lowered to 800 in 2024 and first cleared in 2025 by eight jobs."
        className="mt-5 h-[260px] sm:h-[320px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={JOBS_KPM} margin={{ top: 24, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" vertical={false} />
            <XAxis dataKey="year" tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={{ stroke: "#ebe5da" }} />
            <YAxis tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={42} domain={[0, 1400]} />
            <Tooltip content={<ScorecardTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="actual" name="Jobs created" radius={[4, 4, 0, 0]} maxBarSize={54}>
              {JOBS_KPM.map((d) => (
                <Cell key={d.year} fill={d.year === "2024" ? "#b85c3a" : "#c8956c"} />
              ))}
            </Bar>
            <Line
              dataKey="target"
              name="Target"
              stroke="#1a3a2a"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: "#1a3a2a" }}
              activeDot={{ r: 4 }}
            />
            <ReferenceLine x="2024" stroke="#b85c3a" strokeDasharray="3 3">
              <Label value="goal cut to 800" position="top" fill="#8c3d25" fontSize={11} fontFamily="var(--font-mono)" />
            </ReferenceLine>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <NumberCard label="2025 jobs" value="808" note="Finally cleared the cut bar — by 8." />
        <NumberCard label="The goal, cut" value="800" note="Down from 1,200 — a 33% reduction." />
        <NumberCard label="Years it cleared it" value="1 of 6" note="Only 2025, after lowering the bar." />
        <NumberCard label="Oregon jobs in 2025" value="−6,500" note="Private-sector jobs the state lost that year." />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Two rulers — methodology toggle                                     */
/* ------------------------------------------------------------------ */

export function MethodologyToggle() {
  const [after, setAfter] = useState(true);
  const reg = after ? METHODOLOGY.after : METHODOLOGY.before;

  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
        The asterisk: two different rulers
      </p>
      <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[30px]">
        The agency changed how it counts jobs in 2024.
      </h3>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
        Under {METHODOLOGY.policy}, Business Oregon switched its job-counting method. Pre-2024 numbers were much
        bigger. So the popular &ldquo;missed nine of ten years&rdquo; line splices together two yardsticks that
        don&apos;t line up.
      </p>

      <div className="mt-5 inline-flex rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-1">
        <button
          type="button"
          onClick={() => setAfter(false)}
          className={`rounded-[3px] px-4 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember)] ${
            !after ? "bg-white text-[var(--color-ink)] shadow-sm" : "text-[var(--color-ink-muted)]"
          }`}
        >
          Before FY2024
        </button>
        <button
          type="button"
          onClick={() => setAfter(true)}
          className={`rounded-[3px] px-4 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember)] ${
            after ? "bg-white text-[var(--color-ink)] shadow-sm" : "text-[var(--color-ink-muted)]"
          }`}
        >
          FY2024 onward
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
            {reg.label} — how a “job” is counted
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-[var(--color-ink)]">{reg.method}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{reg.effect}</p>
        </div>
        <div className="rounded-sm border-l-2 border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
            Why it matters
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink)]">{METHODOLOGY.takeaway}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Follow the billion — budget composition                             */
/* ------------------------------------------------------------------ */

function BudgetTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload?: { name?: string; millions?: number; note?: string; kind?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <TooltipBox>
      <p className="max-w-[240px] font-mono text-[12px] font-semibold text-[var(--color-ink)]">{d.name}</p>
      <p className="mt-1 font-mono text-[13px] font-bold text-[var(--color-canopy)]">{fmtUSD(d.millions ?? 0)}</p>
      <p className="mt-1 max-w-[240px] text-[12px] leading-snug text-[var(--color-ink-light)]">{d.note}</p>
    </TooltipBox>
  );
}

export function BudgetChart() {
  const sorted = [...BUDGET_FUNDS].sort((a, b) => b.millions - a.millions);
  const total = BUDGET_FUNDS.reduce((s, f) => s + f.millions, 0);
  const operating = BUDGET_FUNDS.filter((f) => f.kind === "operating").reduce((s, f) => s + f.millions, 0);

  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
        Where the “$1 billion” actually goes
      </p>
      <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[30px]">
        Most of the money is infrastructure finance passing through.
      </h3>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
        The 2025-27 budget is about {fmtUSD(total)} in total funds for two years. But most of it is bonded money
        the agency lends out for water, sewer, and broadband — capital that flows through, not money it runs on.
      </p>

      <div
        role="img"
        aria-label={`Bar chart of Business Oregon's 2025-27 budget by division: Infrastructure Financing $1.74B and bond debt service $187M (bonded pass-through) dwarf the Business, Innovation & Trade division $250M, Arts $47M, and Operations $31M.`}
        className="mt-5 h-[230px] sm:h-[260px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={sorted} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => fmtUSD(v)} tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "#78716c" }} tickLine={false} axisLine={{ stroke: "#ebe5da" }} />
            <YAxis type="category" dataKey="name" width={134} tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "#57534e" }} tickLine={false} axisLine={false} tickFormatter={(v: string) => (v.length > 24 ? v.slice(0, 23) + "…" : v)} />
            <Tooltip content={<BudgetTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="millions" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {sorted.map((f) => (
                <Cell key={f.name} fill={f.kind === "operating" ? "#1a3a2a" : "#d8cfc0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--color-ink-light)]">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-[2px] bg-[#1a3a2a]" />Agency programs &amp; overhead ({fmtUSD(operating)})</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-[2px] bg-[#d8cfc0]" />Bonded capital &amp; debt</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <NumberCard label="Operations division" value={fmtUSD(BUDGET_OPERATIONS.operationsDivisionMillions)} note={`The part that runs the agency (${BUDGET_OPERATIONS.operationsDivisionPositions} positions), for two years.`} />
        <NumberCard label="Recurring base" value="$1.2B" note="Two-year “current service level,” ~$600M/yr." />
        <NumberCard label="Headcount" value={fmtNum(BUDGET_OPERATIONS.totalPositions)} note="Authorized positions in 2025-27." />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Incentive ROI — output per $1 of property tax abated                */
/* ------------------------------------------------------------------ */

function RoiTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { note?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <p className="max-w-[220px] font-mono text-[12px] font-semibold text-[var(--color-ink)]">{label}</p>
      <p className="mt-1 font-mono text-[13px] font-bold text-[var(--color-canopy)]">{fmtDollars(payload[0]?.value ?? 0, 2)} per $1 abated</p>
      <p className="mt-1 max-w-[220px] text-[12px] leading-snug text-[var(--color-ink-light)]">{payload[0]?.payload?.note}</p>
    </TooltipBox>
  );
}

export function IncentiveRoiChart() {
  const data = INCENTIVE_ROI.map((r) => ({ ...r, short: r.program.replace(" (Intel)", "").replace("Strategic Investment Program", "SIP").replace("Standard Enterprise Zone", "Std. Enterprise Zone").replace("Long-Term Rural Enterprise Zone", "Rural Enterprise Zone") }));
  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
        Economic output per $1 of property tax given up
      </p>
      <h3 className="mt-2 font-editorial text-[26px] leading-tight text-[var(--color-ink)] sm:text-[30px]">
        Not every tax break is the same deal.
      </h3>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
        By the agency&apos;s own 2022 study, a dollar abated through a standard enterprise zone returned about $29
        in output, but Intel&apos;s flagship program returned $6, and rural zones barely more than the dollar
        given up.
      </p>

      <div
        role="img"
        aria-label="Bar chart of economic output per dollar of property tax abated by program: Standard Enterprise Zone $29.16, Strategic Investment Program $6.24, Long-Term Rural Enterprise Zone $1.18."
        className="mt-5 h-[230px] sm:h-[260px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" vertical={false} />
            <XAxis dataKey="short" tick={{ fontFamily: "var(--font-mono)", fontSize: 11, fill: "#78716c" }} tickLine={false} axisLine={{ stroke: "#ebe5da" }} interval={0} />
            <YAxis tickFormatter={(v: number) => `$${v}`} tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<RoiTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <ReferenceLine y={1} stroke="#8c3d25" strokeDasharray="3 3">
              <Label value="break-even ($1)" position="insideTopRight" fill="#8c3d25" fontSize={10} fontFamily="var(--font-mono)" />
            </ReferenceLine>
            <Bar dataKey="perDollar" radius={[4, 4, 0, 0]} maxBarSize={90}>
              {data.map((d) => (
                <Cell key={d.program} fill={d.perDollar >= 10 ? "#3d7a5a" : d.perDollar >= 3 ? "#c8956c" : "#b85c3a"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
        Source: Business Oregon&apos;s own Property Tax Incentives Impact Study (2007-2020 output). This measures
        gross economic output, not net return to schools or the state.
      </p>
    </div>
  );
}
