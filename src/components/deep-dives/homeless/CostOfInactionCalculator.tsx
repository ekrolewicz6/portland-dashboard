"use client";

import { useState } from "react";
import { costOfInaction, COST, fmtMoney, fmtNum } from "@/lib/homeless/engine";

const PRESETS = [
  { label: "a city block", value: 50 },
  { label: "one neighborhood", value: 500 },
  { label: "everyone unsheltered", value: 6912 },
];

export default function CostOfInactionCalculator() {
  const [people, setPeople] = useState(500);
  const r = costOfInaction(people);

  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="coi-people" className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-light)]">
            Chronically homeless people housed instead of left outside
          </label>
          <span className="font-mono text-[22px] font-bold tabular-nums text-[var(--color-canopy)]">{fmtNum(people)}</span>
        </div>
        <input id="coi-people" type="range" min={10} max={7000} step={10} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="mt-3 w-full cursor-pointer" style={{ accentColor: "var(--color-canopy)" }} />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.value} type="button" onClick={() => setPeople(p.value)} className={`min-h-[36px] rounded-sm border px-3 text-[12px] transition-colors ${people === p.value ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"}`}>
              <span className="font-mono">{fmtNum(p.value)}</span> · {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_260px]">
        <div className="p-5 sm:p-6">
          {[
            { label: "Leave them on the street", sub: "ER, jail, EMS, sanitation, across a dozen budgets", value: r.streetCost, color: "var(--color-clay)" },
            { label: "House them with support", sub: "rent plus case management", value: r.housedCost, color: "var(--color-fern)" },
          ].map((row) => (
            <div key={row.label} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-[14px] font-medium text-[var(--color-ink)]">{row.label}</span>
                <span className="font-mono text-[15px] font-bold tabular-nums" style={{ color: row.color }}>{fmtMoney(row.value)}/yr</span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-sm bg-[var(--color-paper-warm)]">
                <div className="h-full rounded-sm transition-[width] duration-300" style={{ width: `${(row.value / r.streetCost) * 100}%`, backgroundColor: row.color }} />
              </div>
              <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]">{row.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center bg-[var(--color-canopy)] p-5 text-white sm:p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember-bright)]">The street costs more by</p>
          <p className="mt-1 font-mono text-[30px] font-bold tabular-nums leading-none">{fmtMoney(r.saved)}<span className="text-[13px] font-normal text-white/60"> /yr</span></p>
          <p className="mt-2 text-[12.5px] leading-snug text-white/70">≈ {fmtMoney(r.savedPerPerson)} per person per year</p>
        </div>
      </div>

      <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
        <strong className="text-[var(--color-ink-light)]">The honest caveat:</strong> most of that saving is federal Medicaid money (ER and hospital care), not the city or county budget. Housing doesn&apos;t pay for itself locally; the fix is pulling the federal payer into funding what saves it money. Street figure ${fmtNum(COST.streetPerYear)}, within a national range of ${fmtNum(COST.streetRangeLow)}–{fmtNum(COST.streetRangeHigh)}.
      </p>
    </div>
  );
}
