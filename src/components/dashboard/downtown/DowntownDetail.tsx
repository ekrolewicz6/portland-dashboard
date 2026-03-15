"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";

interface DowntownDetailData {
  graffitiTrend: { month: string; count: number }[] | null;
  footTrafficTrend: null;
  vacancyTrend: null;
  weekdayVsWeekend: null;
  recoveryMilestones: null;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function DowntownDetail() {
  const [data, setData] = useState<DowntownDetailData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/downtown/detail")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        Failed to load downtown detail data.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)] animate-pulse">
        Loading downtown data...
      </div>
    );
  }

  const { graffitiTrend } = data;

  return (
    <div className="space-y-10">
      {/* Graffiti Trend — REAL from Portland BPS */}
      {graffitiTrend && graffitiTrend.length > 0 && (
        <section>
          <SectionHeader title="Graffiti / Disorder Trend (Real Data)" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Monthly graffiti reports from Portland BPS serve as a proxy for visible street-level disorder.
            </p>
            <TrendChart
              data={graffitiTrend.map((r) => ({ date: r.month, value: r.count }))}
              color="#c8956c"
              height={320}
            />
          </div>
        </section>
      )}

      {/* Foot Traffic — DATA NEEDED */}
      <section>
        <SectionHeader title="Foot Traffic Recovery" />
        <DataNeeded
          title="Foot Traffic Data Needed"
          description="Foot traffic data for downtown Portland requires either a Placer.ai subscription or a partnership with the Clean & Safe District, which already collects this data for their reporting."
          color="#c8956c"
          actions={[
            {
              label: "Placer.ai subscription ($2K-$5K/month)",
              href: "https://www.placer.ai",
              type: "subscription",
            },
            {
              label: "Partner with Portland Clean & Safe District",
              href: "https://downtownportland.org/clean-safe/",
              type: "prr",
            },
          ]}
        />
      </section>

      {/* Vacancy Rate — DATA NEEDED */}
      <section>
        <SectionHeader title="Commercial Vacancy Rate" />
        <DataNeeded
          title="Vacancy Rate Data Needed"
          description="Commercial vacancy data for downtown Portland requires either a CoStar subscription or free quarterly reports from major brokerages like CBRE and Colliers."
          color="#4a7f9e"
          actions={[
            {
              label: "CoStar subscription ($500-$1.5K/month)",
              href: "https://www.costar.com",
              type: "subscription",
            },
            {
              label: "Download free quarterly reports from CBRE",
              href: "https://www.cbre.com/insights/local-market-reports",
              type: "download",
            },
            {
              label: "Download free quarterly reports from Colliers",
              href: "https://www.colliers.com/en-us/research",
              type: "download",
            },
          ]}
        />
      </section>
    </div>
  );
}
