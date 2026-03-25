"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

type PcefAllocation = {
  fiscalYear: string;
  recipient: string;
  recipientType: "bureau" | "community";
  amount: number;
  programArea: string;
};

type PcefDiversion = {
  fiscalYear: string;
  amountDiverted: number;
  destination: string;
  notes: string;
};

type AllocationSplitRow = {
  fiscalYear: string;
  bureauTotal: number;
  communityTotal: number;
  total: number;
  bureauPct: number;
};

type FinanceData = {
  financeSources: Array<{
    source: string;
    actionCount: number;
    allocationAmount: number | null;
  }>;
  pcefAllocations: PcefAllocation[];
  pcefInterestDiversions: PcefDiversion[];
  summary: {
    totalBureauAllocations: number;
    totalCommunityGrants: number;
    totalInterestDiverted: number;
    allocationSplit: AllocationSplitRow[];
    bureauTotals: Record<string, number>;
  };
};

function formatMoney(n: number, decimals = 0): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const BUREAU_COLORS: Record<string, string> = {
  "BES": "#2d6a4f",
  "BPS": "#2d4a6e",
  "PP&R": "#4a7a3a",
  "PBOT": "#6a4a2e",
  "PWB": "#4a2e6a",
};

export default function FinanceTracker() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"gaps" | "pcef" | "diversions">("gaps");

  useEffect(() => {
    fetch("/api/dashboard/climate/finance")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[var(--color-parchment)]/50 rounded-sm" />)}
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-ink-muted)] text-[14px]">Finance data unavailable.</p>;

  const { summary } = data;
  const totalPcef = summary.totalBureauAllocations + summary.totalCommunityGrants;

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--color-parchment)] rounded-sm">
        {(["gaps", "pcef", "diversions"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className="flex-1 text-[12px] font-medium py-1.5 px-3 rounded-sm transition-all"
            style={{
              backgroundColor: activeSection === section ? "white" : "transparent",
              color: activeSection === section ? "var(--color-ink)" : "var(--color-ink-muted)",
              boxShadow: activeSection === section ? "0 1px 3px rgba(0,0,0,0.1)" : undefined,
            }}
          >
            {section === "gaps" ? "Funding by Source" : section === "pcef" ? "PCEF Allocation Split" : "PCEF Interest Diversions"}
          </button>
        ))}
      </div>

      {/* ── Funding by Source ───────────────────────────────────────────────── */}
      {activeSection === "gaps" && (
        <div>
          <p className="text-[13px] text-[var(--color-ink-light)] mb-5 leading-relaxed">
            What percentage of workplan actions are funded, PCEF-backed, or facing a resource gap?
            The February 2026 audit found that <strong>around a quarter of all actions</strong> had funding or staffing gaps exceeding $500,000.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {data.financeSources.map((s) => {
              const isPcef = s.source === "PCEF";
              const isFunded = s.source === "Funded (General/Other)";
              const isUnfunded = s.source === "Unfunded Gap";
              const color = isPcef ? "#2d6a4f" : isFunded ? "#2d4a6e" : isUnfunded ? "#7a2020" : "#78716c";

              return (
                <div
                  key={s.source}
                  className="border rounded-sm p-4"
                  style={{ borderColor: color + "33", backgroundColor: color + "06" }}
                >
                  <div className="text-[28px] font-bold font-mono" style={{ color }}>
                    {s.actionCount}
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--color-ink)] mt-0.5">{s.source}</div>
                  {s.allocationAmount != null && (
                    <div className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                      {formatMoney(s.allocationAmount)} allocated
                    </div>
                  )}
                  <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
                    {Math.round((s.actionCount / 43) * 100)}% of all actions
                  </div>
                </div>
              );
            })}
          </div>

          {/* Funding gap visual */}
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">
              Funding Gap by Resource Gap Category
            </h4>
            <div className="space-y-2">
              {[
                { label: "Funded / Revenue-positive", count: 7, color: "#4caf82" },
                { label: "N/A (PCEF-funded)", count: 7, color: "#2d6a4f" },
                { label: "$ (< $500K gap)", count: 5, color: "#c8956c" },
                { label: "$$ ($500K–$1M gap)", count: 4, color: "#b87040" },
                { label: "$$$ ($1M–$2M gap)", count: 5, color: "#9a5020" },
                { label: "$$$$ ($2M–$5M gap)", count: 3, color: "#c84040" },
                { label: "$$$$$ (> $5M gap)", count: 6, color: "#9a1010" },
                { label: "Gap TBD", count: 6, color: "#78716c" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-24 sm:w-32 text-[10px] sm:text-[11px] text-[var(--color-ink-muted)] text-right flex-shrink-0 leading-tight">{row.label}</div>
                  <div className="flex-1 h-5 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: `${(row.count / 43) * 100}%`, backgroundColor: row.color }}
                    />
                  </div>
                  <div className="text-[11px] font-mono font-semibold w-6 text-[var(--color-ink)]">{row.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PCEF Allocation Split ───────────────────────────────────────────── */}
      {activeSection === "pcef" && (
        <div>
          <p className="text-[13px] text-[var(--color-ink-light)] mb-5 leading-relaxed">
            PCEF (Portland Clean Energy Fund) allocates money to both city bureaus and community grants.
            The audit found Portland has <strong>not been transparent enough</strong> about how PCEF funding flows to bureaus vs. community organizations.
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
              <div className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Total PCEF (FY 21–25)</div>
              <div className="text-[28px] font-bold font-mono" style={{ color: "#2d6a4f" }}>{formatMoney(totalPcef, 0)}</div>
            </div>
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
              <div className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">To Six City Bureaus</div>
              <div className="text-[28px] font-bold font-mono" style={{ color: "#2d4a6e" }}>{formatMoney(summary.totalBureauAllocations, 0)}</div>
              <div className="text-[11px] text-[var(--color-ink-muted)]">
                {Math.round((summary.totalBureauAllocations / totalPcef) * 100)}% of total
              </div>
            </div>
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 text-center">
              <div className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Community Grants</div>
              <div className="text-[28px] font-bold font-mono" style={{ color: "#4a7a3a" }}>{formatMoney(summary.totalCommunityGrants, 0)}</div>
              <div className="text-[11px] text-[var(--color-ink-muted)]">
                {Math.round((summary.totalCommunityGrants / totalPcef) * 100)}% of total
              </div>
            </div>
          </div>

          {/* Year-over-year split chart */}
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 mb-5">
            <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">
              Bureau vs. Community Grants by Fiscal Year
            </h4>
            <div className="space-y-3">
              {summary.allocationSplit.map((row) => (
                <div key={row.fiscalYear} className="flex items-center gap-2">
                  <div className="w-16 sm:w-20 text-[11px] font-mono text-[var(--color-ink-muted)] flex-shrink-0">{row.fiscalYear}</div>
                  <div className="flex-1 h-6 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className="h-full flex items-center justify-end pr-2"
                        style={{ width: `${row.bureauPct}%`, backgroundColor: "#2d4a6e" }}
                        title={`Bureaus: ${formatMoney(row.bureauTotal)}`}
                      >
                        {row.bureauPct > 20 && (
                          <span className="text-[9px] font-semibold text-white">{row.bureauPct}%</span>
                        )}
                      </div>
                      <div
                        className="h-full flex items-center pl-2"
                        style={{ width: `${100 - row.bureauPct}%`, backgroundColor: "#4a7a3a" }}
                        title={`Community: ${formatMoney(row.communityTotal)}`}
                      >
                        {100 - row.bureauPct > 15 && (
                          <span className="text-[9px] font-semibold text-white">{100 - row.bureauPct}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--color-ink)] w-14 sm:w-20 text-right flex-shrink-0">{formatMoney(row.total)}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-ink-muted)]">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2d4a6e" }} /> Bureau allocations
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-ink-muted)]">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#4a7a3a" }} /> Community grants
              </div>
            </div>
          </div>

          {/* Bureau breakdown */}
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">
              PCEF Allocations by Bureau (FY 21-22 through FY 24-25)
            </h4>
            <div className="space-y-2">
              {Object.entries(summary.bureauTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([bureau, total]) => {
                  const color = BUREAU_COLORS[bureau] ?? "#78716c";
                  const maxVal = Math.max(...Object.values(summary.bureauTotals));
                  return (
                    <div key={bureau} className="flex items-center gap-3">
                      <div className="w-12 text-[11px] font-mono font-bold flex-shrink-0" style={{ color }}>{bureau}</div>
                      <div className="flex-1 h-5 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${(total / maxVal) * 100}%`, backgroundColor: color }} />
                      </div>
                      <div className="text-[12px] font-mono font-semibold w-16 text-right" style={{ color }}>
                        {formatMoney(total)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── PCEF Interest Diversions ────────────────────────────────────────── */}
      {activeSection === "diversions" && (
        <div>
          {/* Alert banner */}
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-sm flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-red-800 mb-1">
                {formatMoney(summary.totalInterestDiverted)} in PCEF Interest Redirected to General Fund
              </p>
              <p className="text-[12px] text-red-700 leading-relaxed">
                The audit found the City has not been transparent enough about PCEF funding flows.
                This view shows where PCEF-generated interest was directed each fiscal year.
              </p>
            </div>
          </div>

          {/* Diversion total card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="sm:col-span-1 bg-red-50 border border-red-200 rounded-sm p-5 text-center">
              <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-2">Total Diverted</div>
              <div className="text-[36px] font-bold font-mono text-red-800">
                {formatMoney(summary.totalInterestDiverted, 1)}
              </div>
              <div className="text-[11px] text-red-600 mt-1">FY 21-22 through FY 24-25</div>
            </div>
            <div className="sm:col-span-2 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <div className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">What This Money Was Supposed to Fund</div>
              <ul className="space-y-1.5 text-[12px] text-[var(--color-ink-light)]">
                <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />Additional cooling units for elderly and disabled residents</li>
                <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />Tree planting in low-canopy East Portland neighborhoods</li>
                <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />Community solar installations for income-qualified households</li>
                <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />Energy retrofits for affordable housing buildings</li>
              </ul>
            </div>
          </div>

          {/* Year-by-year table */}
          <div className="overflow-x-auto rounded-sm border border-[var(--color-parchment)]">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[100px_120px_1fr_120px] gap-3 px-4 py-2 bg-[var(--color-canopy)] text-[10px] font-semibold text-white/70 uppercase tracking-wider">
              <div>Fiscal Year</div>
              <div>Amount Diverted</div>
              <div>Context</div>
              <div>Destination</div>
            </div>
            {data.pcefInterestDiversions.map((d, i) => (
              <div
                key={d.fiscalYear}
                className={`grid grid-cols-[100px_120px_1fr_120px] gap-3 px-4 py-3 text-[12px] items-start ${
                  i % 2 === 0 ? "bg-white" : "bg-[var(--color-paper-warm)]"
                }`}
              >
                <span className="font-mono font-semibold text-[var(--color-ink)]">{d.fiscalYear}</span>
                <span className="font-mono font-bold text-red-700">{formatMoney(d.amountDiverted, 1)}</span>
                <span className="text-[var(--color-ink-light)] leading-relaxed">{d.notes}</span>
                <span className="text-[var(--color-ink-muted)]">{d.destination}</span>
              </div>
            ))}
            <div className="grid grid-cols-[100px_120px_1fr_120px] gap-3 px-4 py-3 bg-red-50 border-t border-red-200 text-[12px] font-bold">
              <span className="text-red-800">TOTAL</span>
              <span className="font-mono text-red-800">{formatMoney(summary.totalInterestDiverted, 1)}</span>
              <span className="text-red-700">Directed to General Fund</span>
              <span className="text-red-700">General Fund</span>
            </div>
          </div>
          </div>

          <p className="mt-4 text-[11px] text-[var(--color-ink-muted)]">
            Source: City of Portland budget documents. PCEF interest earnings are generated by the fund&apos;s cash balance between grant disbursements.
            These diversions were approved by City Council as part of annual budget actions.
          </p>
        </div>
      )}
    </div>
  );
}
