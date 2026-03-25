"use client";

import { useState, useEffect } from "react";
import StatGrid from "@/components/charts/StatGrid";
import MultiLineChart from "@/components/charts/MultiLineChart";
import StackedAreaChart from "@/components/charts/StackedAreaChart";
import { TrendingDown, Zap } from "lucide-react";

const ENV_COLOR = "#5a8a6a";

interface EmissionsData {
  historical: {
    year: number;
    total: number;
    transportation: number;
    electricity: number;
    natural_gas: number;
    industrial: number;
    waste: number;
  }[];
  targets: { year: number; target: number; label: string }[];
  latestYear: number;
  latestTotal: number;
  baselineTotal: number;
  reductionPct: number;
  targetGapPct: number;
  renewableEnergy: { year: number; pctRenewable: number; pctCommunityOwned: number }[];
  dataStatus: string;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: ENV_COLOR }} />
      <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function EmissionsTrajectory() {
  const [data, setData] = useState<EmissionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/environment/emissions")
      .then((r) => r.json())
      .then((d: EmissionsData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-64" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-ink-muted)] text-[16px]">Unable to load emissions data.</p>;

  // Build trajectory chart data: historical + target points
  const trajectoryData = [
    ...data.historical.map((h) => ({
      year: String(h.year),
      actual: h.total,
    })),
    // Add target projections beyond latest data
    ...data.targets
      .filter((t) => t.year > data.latestYear)
      .map((t) => ({
        year: String(t.year),
        target: t.target,
      })),
  ];

  // Merge targets into the trajectory data for reference lines
  const target2030 = data.targets.find((t) => t.year === 2030);
  const target2050 = data.targets.find((t) => t.year === 2050);

  // Sector breakdown data for stacked area
  const sectorData = data.historical.map((h) => ({
    year: String(h.year),
    transportation: h.transportation,
    electricity: h.electricity,
    natural_gas: h.natural_gas,
    industrial: h.industrial,
    waste: h.waste,
  }));

  // Renewable energy progress data
  const latestRenewable = data.renewableEnergy.length > 0
    ? data.renewableEnergy[data.renewableEnergy.length - 1]
    : null;

  return (
    <div className="space-y-10">
      {/* Headline stats */}
      <StatGrid
        accentColor={ENV_COLOR}
        stats={[
          {
            label: `${data.latestYear} Emissions`,
            value: `${(data.latestTotal / 1_000_000).toFixed(1)}M`,
            suffix: " MT CO₂e",
            subtitle: `Multnomah County total`,
          },
          {
            label: "Below 1990 Baseline",
            value: `${data.reductionPct}%`,
            subtitle: `Target: 50% by 2030`,
            change: -data.reductionPct,
            changeLabel: "from 1990 levels",
          },
          {
            label: "Gap to 2030 Target",
            value: `${data.targetGapPct}%`,
            subtitle: "Additional reduction needed",
          },
          {
            label: "Renewable Electricity",
            value: latestRenewable ? `${latestRenewable.pctRenewable}%` : "—",
            subtitle: "Goal: 100% by 2030",
          },
        ]}
      />

      {/* Emissions trajectory */}
      <section>
        <SectionHeader icon={TrendingDown} title="Emissions Trajectory vs. Targets" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            Multnomah County total greenhouse gas emissions (1990–{data.latestYear}) compared to
            Portland&apos;s adopted reduction targets. The city needs to double its annual reduction
            rate to meet the 2030 goal.
          </p>
          <MultiLineChart
            data={trajectoryData as Record<string, string | number>[]}
            lines={[
              { key: "actual", label: "Actual Emissions (MT CO₂e)", color: "#1a3a2a" },
              { key: "target", label: "Target Pathway", color: "#dc2626", dashed: true },
            ]}
            xKey="year"
            height={380}
            referenceLines={[
              ...(target2030 ? [{ y: target2030.target, label: `2030 Target: ${(target2030.target / 1_000_000).toFixed(1)}M`, color: "#dc2626" }] : []),
            ]}
          />
        </div>
      </section>

      {/* Sector breakdown */}
      <section>
        <SectionHeader icon={TrendingDown} title="Emissions by Sector" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
            Transportation accounts for 44% of Multnomah County emissions — the single largest sector.
            The top four sources (electricity, gasoline, natural gas, diesel) account for 85% of total emissions.
          </p>
          <StackedAreaChart
            data={sectorData as Record<string, string | number>[]}
            areas={[
              { key: "transportation", label: "Transportation", color: "#b85c3a" },
              { key: "electricity", label: "Electricity", color: "#4a7f9e" },
              { key: "natural_gas", label: "Natural Gas", color: "#c8956c" },
              { key: "industrial", label: "Industrial", color: "#7c6f9e" },
              { key: "waste", label: "Waste & Other", color: "#64748b" },
            ]}
            xKey="year"
            height={380}
          />
        </div>
      </section>

      {/* Renewable energy progress */}
      {data.renewableEnergy.length > 0 && (
        <section>
          <SectionHeader icon={Zap} title="Renewable Energy Progress" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
              Progress toward 100% renewable electricity by 2030 and 2% community-owned renewable by 2030.
            </p>
            <MultiLineChart
              data={data.renewableEnergy.map((r) => ({
                year: String(r.year),
                renewable: r.pctRenewable,
                communityOwned: r.pctCommunityOwned,
              })) as Record<string, string | number>[]}
              lines={[
                { key: "renewable", label: "% Renewable Electricity", color: "#3d7a5a" },
                { key: "communityOwned", label: "% Community-Owned", color: "#d4a843" },
              ]}
              xKey="year"
              height={300}
              valueSuffix="%"
              referenceLines={[
                { y: 100, label: "2030 Goal: 100%", color: "#3d7a5a" },
                { y: 2, label: "Community Goal: 2%", color: "#d4a843" },
              ]}
            />
          </div>
        </section>
      )}

      {/* Key insights */}
      <section>
        <SectionHeader icon={TrendingDown} title="Key Findings" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          <ul className="space-y-3">
            {[
              `Multnomah County emissions are ${data.reductionPct}% below 1990 levels — but the 2030 target requires a 50% reduction. Portland must double its annual reduction rate.`,
              `Transportation is the largest source at 44% of total emissions. Despite EV adoption, overall VMT has not declined.`,
              `Building sector emissions are down ~14% since 2017, driven by efficiency improvements and electrification.`,
              latestRenewable ? `Renewable electricity supplies ${latestRenewable.pctRenewable}% of the county's power, with a goal of 100% by 2030.` : null,
              `The Feb 2026 audit found 13% of workplan actions achieved, 79% ongoing, 9% delayed. The city lacks infrastructure to track progress systematically.`,
              `Of 47 workplan actions, ~25% have funding gaps exceeding $500K. Many gaps are substantially higher.`,
            ]
              .filter(Boolean)
              .map((insight, i) => (
                <li key={i} className="text-[16px] text-[var(--color-ink-light)] leading-relaxed flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6a] flex-shrink-0 mt-2" />
                  {insight}
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
