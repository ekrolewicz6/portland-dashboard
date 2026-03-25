"use client";

import { useState, useEffect } from "react";
import StatGrid from "@/components/charts/StatGrid";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import { DollarSign } from "lucide-react";

const ENV_COLOR = "#5a8a6a";

interface FinanceData {
  pcefByCategory: { name: string; value: number; color: string }[];
  pcefByRecipientType: { name: string; value: number; color: string }[];
  resourceGaps: { name: string; value: number; color: string }[];
  totalAllocated: number;
  totalSpent: number;
  totalProjectsFunded: number;
  fundingTimeline: { name: string; allocated: number; spent: number }[];
  dataStatus: string;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <DollarSign className="w-4 h-4" style={{ color: ENV_COLOR }} />
      <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function ClimateFinanceTracker() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/environment/finance")
      .then((r) => r.json())
      .then((d: FinanceData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-48" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-ink-muted)] text-[16px]">Unable to load finance data.</p>;

  return (
    <div className="space-y-10">
      {/* Headline stats */}
      <StatGrid
        accentColor={ENV_COLOR}
        stats={[
          {
            label: "Total PCEF Allocated",
            value: `$${(data.totalAllocated / 1_000_000).toFixed(0)}M`,
            subtitle: "5-year Climate Investment Plan",
          },
          {
            label: "Total Spent/Committed",
            value: `$${(data.totalSpent / 1_000_000).toFixed(0)}M`,
            subtitle: `${Math.round((data.totalSpent / data.totalAllocated) * 100)}% disbursed`,
          },
          {
            label: "Projects Funded",
            value: data.totalProjectsFunded,
            subtitle: "Community + bureau projects",
          },
          {
            label: "Unfunded Actions",
            value: data.resourceGaps.find((g) => g.name === "TBD")?.value ?? 0,
            subtitle: "Actions with unknown funding",
          },
        ]}
      />

      {/* PCEF by category */}
      <section>
        <SectionHeader title="PCEF Funding by Category" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            Portland Clean Energy Fund $750M 5-year Climate Investment Plan allocation by program area.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart
              data={data.pcefByCategory}
              height={300}
              innerRadius={50}
              showLabels={false}
            />
            <div className="space-y-2">
              {data.pcefByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-2 border-b border-[var(--color-parchment)]/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[15px] text-[var(--color-ink)]">{cat.name}</span>
                  </div>
                  <span className="text-[16px] font-mono font-semibold text-[var(--color-ink)] lg:text-[18px] 2xl:text-[20px]">
                    ${(cat.value / 1_000_000).toFixed(0)}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bureau vs Community split */}
      <section>
        <SectionHeader title="PCEF Recipients: Bureau vs Community" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            Breakdown of PCEF funding flowing to city bureaus versus community organizations.
            The Feb 2026 audit found the City has not been transparent enough about PCEF use by bureaus.
          </p>
          <BarChart data={data.pcefByRecipientType} height={200} />
        </div>
      </section>

      {/* Resource gaps */}
      <section>
        <SectionHeader title="Workplan Resource Gaps" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            Resource gap classification for all 47 workplan actions. The audit found ~25% of actions
            had staffing or funding gaps exceeding $500K, with most gaps substantially higher.
          </p>
          <BarChart data={data.resourceGaps} layout="vertical" height={280} />
        </div>
      </section>

      {/* Funding timeline */}
      <section>
        <SectionHeader title="PCEF Spending Timeline" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            PCEF allocations and spending by fiscal year.
          </p>
          <BarChart
            data={data.fundingTimeline.map((d) => ({
              name: d.name,
              value: d.allocated,
              color: "#5a8a6a",
            }))}
            height={250}
          />
        </div>
      </section>
    </div>
  );
}
