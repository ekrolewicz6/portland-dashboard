"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, ChevronRight } from "lucide-react";
import StatGrid from "@/components/charts/StatGrid";

interface BureauAction {
  action_id: string;
  title: string;
  status: string;
  sector: string;
}

interface BureauData {
  abbreviation: string;
  fullName: string;
  totalActions: number;
  achieved: number;
  ongoing: number;
  delayed: number;
  actions: BureauAction[];
}

interface BureauResponse {
  bureaus: BureauData[];
  dataStatus: string;
}

const STATUS_DOT: Record<string, string> = {
  achieved: "#059669",
  ongoing: "#d97706",
  delayed: "#dc2626",
};

const ENV_COLOR = "#5a8a6a";

export default function BureauScorecard() {
  const [data, setData] = useState<BureauResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBureau, setExpandedBureau] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/environment/bureaus")
      .then((r) => r.json())
      .then((d: BureauResponse) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-48" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-ink-muted)] text-[16px]">Unable to load bureau data.</p>;

  // Summary stats
  const totalBureaus = data.bureaus.length;
  const totalActions = data.bureaus.reduce((s, b) => s + b.totalActions, 0);
  const totalAchieved = data.bureaus.reduce((s, b) => s + b.achieved, 0);
  const totalDelayed = data.bureaus.reduce((s, b) => s + b.delayed, 0);

  // Sort by total actions descending
  const sorted = [...data.bureaus].sort((a, b) => b.totalActions - a.totalActions);

  return (
    <div className="space-y-6">
      <StatGrid
        accentColor={ENV_COLOR}
        stats={[
          { label: "Bureaus Assigned", value: totalBureaus },
          { label: "Total Action Assignments", value: totalActions },
          { label: "Actions Achieved", value: totalAchieved, subtitle: `${Math.round((totalAchieved / totalActions) * 100)}% of total` },
          { label: "Actions Delayed", value: totalDelayed, subtitle: `${Math.round((totalDelayed / totalActions) * 100)}% of total` },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((bureau) => {
          const isExpanded = expandedBureau === bureau.abbreviation;
          const total = bureau.totalActions;
          const achievedPct = total > 0 ? Math.round((bureau.achieved / total) * 100) : 0;
          const ongoingPct = total > 0 ? Math.round((bureau.ongoing / total) * 100) : 0;
          const delayedPct = total > 0 ? Math.round((bureau.delayed / total) * 100) : 0;

          return (
            <div
              key={bureau.abbreviation}
              className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedBureau(isExpanded ? null : bureau.abbreviation)}
                className="w-full text-left p-4 hover:bg-[var(--color-parchment)]/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" style={{ color: ENV_COLOR }} />
                    <span className="text-[16px] font-semibold text-[var(--color-ink)]">
                      {bureau.abbreviation}
                    </span>
                  </div>
                  <span className="text-[22px] lg:text-[26px] 2xl:text-[30px] font-mono font-bold text-[var(--color-ink)]">
                    {bureau.totalActions}
                  </span>
                </div>

                <p className="text-[14px] text-[var(--color-ink-muted)] mb-3 leading-snug">
                  {bureau.fullName}
                </p>

                {/* Mini progress bar */}
                <div className="h-2 rounded-full bg-[var(--color-parchment)] flex overflow-hidden mb-2">
                  {bureau.achieved > 0 && (
                    <div className="bg-emerald-500" style={{ width: `${achievedPct}%` }} />
                  )}
                  {bureau.ongoing > 0 && (
                    <div className="bg-amber-400" style={{ width: `${ongoingPct}%` }} />
                  )}
                  {bureau.delayed > 0 && (
                    <div className="bg-red-400" style={{ width: `${delayedPct}%` }} />
                  )}
                </div>

                <div className="flex gap-4 text-[13px]">
                  <span className="text-emerald-700 font-mono lg:text-[15px] 2xl:text-[16px]">{bureau.achieved} done</span>
                  <span className="text-amber-700 font-mono lg:text-[15px] 2xl:text-[16px]">{bureau.ongoing} ongoing</span>
                  <span className="text-red-700 font-mono lg:text-[15px] 2xl:text-[16px]">{bureau.delayed} delayed</span>
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-[13px] font-medium" style={{ color: ENV_COLOR }}>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {isExpanded ? "Hide actions" : "Show actions"}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--color-parchment)] px-4 py-3 space-y-1.5">
                  {bureau.actions.map((a) => (
                    <div key={a.action_id} className="flex items-center gap-2 text-[14px]">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_DOT[a.status] ?? "#78716c" }}
                      />
                      <span className="font-mono text-[var(--color-ink-muted)] w-10 flex-shrink-0">{a.action_id}</span>
                      <span className="text-[var(--color-ink)] flex-1 leading-snug">{a.title}</span>
                      <span className="text-[12px] text-[var(--color-ink-muted)] flex-shrink-0 hidden sm:inline">{a.sector}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
