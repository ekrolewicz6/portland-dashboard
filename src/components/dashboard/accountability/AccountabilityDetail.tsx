"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
import { Vote, Users, Lightbulb } from "lucide-react";

interface BallotMeasure {
  measureNumber: string;
  title: string;
  electionYear: number;
  yesPercentage: number;
  noPercentage: number;
  passed: boolean;
  annualRevenueEstimate: number;
  description: string;
  jurisdiction: string;
}

interface ElectedOfficial {
  name: string;
  title: string;
  district: string | null;
  termStart: string | null;
  termEnd: string | null;
  email: string | null;
  party: string | null;
}

interface AccountabilityDetailData {
  ballotMeasures: BallotMeasure[];
  electedOfficials: ElectedOfficial[];
  dataStatus: string;
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: color ?? "#8a5c6a" }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function AccountabilityDetail() {
  const [data, setData] = useState<AccountabilityDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/accountability/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-64" />
        ))}
      </div>
    );
  }

  if (!data || data.dataStatus === "unavailable") {
    return <p className="text-[var(--color-ink-muted)] text-[14px]">Unable to load accountability data.</p>;
  }

  const { ballotMeasures, electedOfficials } = data;

  const totalRevenue = ballotMeasures.reduce(
    (s, m) => s + m.annualRevenueEstimate,
    0,
  );
  const passedCount = ballotMeasures.filter((m) => m.passed).length;

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="accountability" />

      {/* 1. Summary stats */}
      <section>
        <SectionHeader icon={Lightbulb} title="Overview" color="#8a5c6a" />
        <StatGrid
          accentColor="#8a5c6a"
          stats={[
            { label: "Ballot Measures", value: ballotMeasures.length },
            { label: "Passed", value: passedCount },
            {
              label: "Annual Revenue",
              value: formatRevenue(totalRevenue),
            },
            { label: "Officials Tracked", value: electedOfficials.length },
          ]}
        />
      </section>

      {/* 2. Ballot Measures */}
      {ballotMeasures.length > 0 && (
        <section>
          <SectionHeader icon={Vote} title="Ballot Measures" color="#8a5c6a" />
          <div className="grid gap-4 md:grid-cols-2">
            {ballotMeasures.map((m, i) => (
              <div
                key={i}
                className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: m.passed ? "#3d7a5a" : "#b85c3a" }}
                />
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[12px] font-mono font-semibold text-[var(--color-ink-muted)]">
                      {m.measureNumber}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] ml-2">
                      ({m.electionYear})
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                      m.passed
                        ? "bg-[#3d7a5a]/10 text-[#3d7a5a]"
                        : "bg-[#b85c3a]/10 text-[#b85c3a]"
                    }`}
                  >
                    {m.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-2 leading-snug">
                  {m.title}
                </h3>
                {m.description && (
                  <p className="text-[13px] text-[var(--color-ink-muted)] mb-3 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[12px] font-mono">
                  <span className="text-[#3d7a5a]">
                    Yes: {m.yesPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[#b85c3a]">
                    No: {m.noPercentage.toFixed(1)}%
                  </span>
                  {m.annualRevenueEstimate > 0 && (
                    <span className="text-[var(--color-ink-muted)] ml-auto">
                      {formatRevenue(m.annualRevenueEstimate)}/yr
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Elected Officials */}
      {electedOfficials.length > 0 && (
        <section>
          <SectionHeader icon={Users} title="Elected Officials" color="#8a5c6a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      District
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Term End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {electedOfficials.map((o, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)]/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">
                        {o.name}
                        {o.email && (
                          <a
                            href={`mailto:${o.email}`}
                            className="ml-2 text-[11px] text-[var(--color-river)] hover:underline"
                          >
                            email
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-ink-light)]">
                        {o.title}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-ink-light)]">
                        {o.district ?? "--"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--color-ink-muted)]">
                        {o.termEnd ?? "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 4. Data still needed */}
      <DataNeeded
        title="Campaign finance data"
        description="Oregon's ORESTAR system tracks campaign contributions and expenditures for all state and local candidates. Essential for understanding who funds Portland politics."
        actions={[
          {
            label: "Access Oregon ORESTAR campaign finance system",
            type: "api_key",
            href: "https://secure.sos.state.or.us/orestar/",
          },
        ]}
        color="#8a5c6a"
      />
      <DataNeeded
        title="Agency performance metrics"
        description="City budget documents include bureau-level performance metrics and key performance indicators. Tracking these over time shows whether city agencies are meeting their own goals."
        actions={[
          { label: "Download City of Portland budget documents", type: "download" },
        ]}
        color="#8a5c6a"
      />
    </div>
  );
}
