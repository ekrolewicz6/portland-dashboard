"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingDown, Building2, Landmark, Scissors, PieChart } from "lucide-react";
import StatGrid from "@/components/charts/StatGrid";
import BureauBreakdown from "./BureauBreakdown";
import BudgetWhatIf from "./BudgetWhatIf";
import RevenueBreakdown from "./RevenueBreakdown";
import CashTransfers from "./CashTransfers";
import CityBudgetOverview from "./CityBudgetOverview";
import type { BudgetData } from "@/data/general-fund-budget";

const FISCAL_COLOR = "#1e40af";

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: FISCAL_COLOR }} />
      <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function formatM(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function BudgetExplorer() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutPct, setCutPct] = useState<0 | 3 | 10>(0);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/fiscal/budget", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: BudgetData) => {
        if (!cancelled) setData(d);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-parchment)]/50 rounded-sm h-48"
          />
        ))}
      </div>
    );
  }

  if (!data)
    return (
      <p className="text-[var(--color-ink-muted)] text-[16px]">
        Unable to load budget data.
      </p>
    );

  const { generalFund, fullBudget, fiveYearForecast } = data;
  const totalCityBudget = fullBudget.totalAllFunds;
  const gfPctOfTotal = fullBudget.generalFundPct;

  // Police % of GF
  const ppb = generalFund.bureaus.find((b) => b.code === "PPB");
  const ppbPct = ppb
    ? ((ppb.total / generalFund.totalExpenses) * 100).toFixed(1)
    : "0";

  // Public safety total (all public-safety category bureaus)
  const pubSafetyTotal = generalFund.bureaus
    .filter((b) => b.category === "public-safety")
    .reduce((s, b) => s + b.total, 0);
  const pubSafetyPct = (
    (pubSafetyTotal / generalFund.totalExpenses) *
    100
  ).toFixed(0);

  return (
    <div className="space-y-10">
      {/* Context banner */}
      <section>
        <div className="bg-[#1e293b] rounded-sm p-5 text-white/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.15em] mb-1">
                {data.fiscalYear} General Fund Analysis
              </p>
              <p className="text-[13px] text-white/70 leading-relaxed max-w-3xl">
                Portland&apos;s ${(totalCityBudget / 1_000_000_000).toFixed(1)}B
                total budget is {(100 - gfPctOfTotal).toFixed(0)}% legally
                restricted. The General Fund — {formatM(generalFund.totalExpenses)}{" "}
                — is the only flexible spending. It funds police, fire, parks,
                shelter operations, and city administration. Revenue falls{" "}
                {formatM(generalFund.deficit)} short of current service levels.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">
                Budget Gap
              </p>
              <p className="text-[22px] text-red-400 font-mono font-bold leading-none">
                −{formatM(generalFund.deficit)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Headline stats */}
      <StatGrid
        accentColor={FISCAL_COLOR}
        stats={[
          {
            label: "General Fund Revenue",
            value: formatM(generalFund.totalRevenue),
            subtitle: "Projected FY 2026-27",
          },
          {
            label: "Current Service Level Cost",
            value: formatM(generalFund.totalExpenses),
            subtitle: "What it costs to maintain services",
          },
          {
            label: "Structural Deficit",
            value: `−${formatM(generalFund.deficit)}`,
            subtitle: "Revenue minus expenses",
          },
          {
            label: "Public Safety Share",
            value: `${pubSafetyPct}%`,
            subtitle: `${formatM(pubSafetyTotal)} — PPB alone is ${ppbPct}%`,
          },
        ]}
      />

      {/* Full City Budget */}
      <section>
        <SectionHeader icon={PieChart} title="The Full Picture: All City Spending" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          <CityBudgetOverview
            totalAllFunds={fullBudget.totalAllFunds}
            generalFundPct={fullBudget.generalFundPct}
            restrictedFunds={fullBudget.restrictedFunds}
          />
        </div>
      </section>

      {/* What If scenarios */}
      <section>
        <SectionHeader icon={Scissors} title="What If We Cut?" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            All bureaus prepared 3% and 10% reduction scenarios as part of
            the budget process. Select a scenario to see the projected service
            impacts each bureau identified.
          </p>
          <BudgetWhatIf
            cutPct={cutPct}
            onCutChange={setCutPct}
            bureaus={generalFund.bureaus}
            totalExpenses={generalFund.totalExpenses}
          />
        </div>
      </section>

      {/* Where the money goes */}
      <section>
        <SectionHeader icon={Building2} title="Where the Money Goes" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            General Fund allocation by bureau at Current Appropriation Level
            (CAL). Click any bureau to see program-level detail and
            year-over-year changes.
            {cutPct > 0 && (
              <span className="text-red-600 font-medium">
                {" "}
                Showing {cutPct}% reduction scenario.
              </span>
            )}
          </p>
          <BureauBreakdown bureaus={generalFund.bureaus} cutPct={cutPct} />
        </div>
      </section>

      {/* Where the money comes from */}
      <section>
        <SectionHeader icon={Landmark} title="Where the Money Comes From" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            General Fund revenue sources. Property taxes and business licenses
            make up {(
              ((generalFund.revenueSources[0]?.amount ?? 0) +
                (generalFund.revenueSources[1]?.amount ?? 0)) /
              generalFund.totalRevenue *
              100
            ).toFixed(0)}
            % of all General Fund revenue. No sales tax — Oregon is one of five
            states without one.
          </p>
          <RevenueBreakdown
            revenueSources={generalFund.revenueSources}
            totalRevenue={generalFund.totalRevenue}
            totalExpenses={generalFund.totalExpenses}
            forecast={fiveYearForecast}
          />
        </div>
      </section>

      {/* Cash Transfers */}
      <section>
        <SectionHeader icon={TrendingDown} title="General Fund Cash Transfers" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          <CashTransfers transfers={generalFund.cashTransfers} />
        </div>
      </section>

      {/* Data source attribution */}
      <p className="text-[11px] text-[var(--color-ink-muted)] italic">
        Source: {data.dataSource}. Last verified: {data.lastVerified}. All
        figures represent Current Appropriation Level (CAL) and Current Service
        Level (CSL) as submitted to the City Budget Office. The Mayor&apos;s
        Proposed Budget may differ.
      </p>
    </div>
  );
}
