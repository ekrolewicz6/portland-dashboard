"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type BureauCard = {
  bureauCode: string;
  bureauName: string;
  totalActions: number;
  achievedActions: number;
  ongoingActions: number;
  delayedActions: number;
  crossBureauActions: number;
  pcefFundingReceived: number | null;
  performanceScore: number;
  performanceLabel: "on-track" | "mixed" | "needs-attention";
};

type BureauAction = {
  actionId: string;
  title: string;
  sector: string;
  category: string;
  leadBureaus: string[];
  status: "achieved" | "ongoing" | "delayed";
  resourceGap: string | null;
  fiscalYear: string | null;
};

const PERFORMANCE_STYLES = {
  "on-track": {
    border: "#1a5c3a",
    bg: "#1a5c3a08",
    badge: "#1a5c3a",
    badgeBg: "#1a5c3a11",
    label: "On Track",
  },
  "mixed": {
    border: "#c8956c",
    bg: "#c8956c06",
    badge: "#7a4a1a",
    badgeBg: "#c8956c11",
    label: "Mixed",
  },
  "needs-attention": {
    border: "#7a2020",
    bg: "#7a202008",
    badge: "#7a2020",
    badgeBg: "#7a202011",
    label: "Needs Attention",
  },
};

const STATUS_COLORS = {
  achieved: "#4caf82",
  ongoing: "#5b8dd9",
  delayed: "#e05c5c",
};

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function BureauScorecard() {
  const [bureaus, setBureaus] = useState<BureauCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBureau, setSelectedBureau] = useState<string | null>(null);
  const [bureauActions, setBureauActions] = useState<BureauAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/climate/bureaus")
      .then((r) => r.json())
      .then((d) => {
        setBureaus(d.bureaus ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleBureauClick(bureauCode: string) {
    if (selectedBureau === bureauCode) {
      setSelectedBureau(null);
      setBureauActions([]);
      return;
    }
    setSelectedBureau(bureauCode);
    setLoadingActions(true);
    fetch(`/api/dashboard/climate/bureaus?bureau=${encodeURIComponent(bureauCode)}`)
      .then((r) => r.json())
      .then((d) => {
        setBureauActions(d.bureauActions ?? []);
        setLoadingActions(false);
      })
      .catch(() => setLoadingActions(false));
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-40 bg-[var(--color-parchment)]/50 rounded-sm" />
        ))}
      </div>
    );
  }

  const selectedCard = bureaus.find((b) => b.bureauCode === selectedBureau);

  return (
    <div>
      {/* Audit context note */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm">
        <p className="text-[12px] text-amber-800 leading-relaxed">
          <strong>Audit Finding:</strong> &ldquo;The Chief Sustainability Officer does not have a direct link to bureaus.&rdquo; This scorecard makes every bureau&apos;s climate performance visible without requiring line authority. When the data shows zero actions on track, the data does the enforcing.
        </p>
      </div>

      {/* Bureau cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {bureaus.map((bureau) => {
          const style = PERFORMANCE_STYLES[bureau.performanceLabel];
          const isSelected = selectedBureau === bureau.bureauCode;
          const achievedPct = bureau.totalActions > 0 ? (bureau.achievedActions / bureau.totalActions) * 100 : 0;
          const ongoingPct = bureau.totalActions > 0 ? (bureau.ongoingActions / bureau.totalActions) * 100 : 0;
          const delayedPct = bureau.totalActions > 0 ? (bureau.delayedActions / bureau.totalActions) * 100 : 0;

          return (
            <button
              key={bureau.bureauCode}
              onClick={() => handleBureauClick(bureau.bureauCode)}
              className="text-left rounded-sm border p-4 transition-all hover:shadow-md"
              style={{
                borderColor: isSelected ? style.border : "var(--color-parchment)",
                backgroundColor: isSelected ? style.bg : "var(--color-paper-warm)",
                boxShadow: isSelected ? `0 0 0 2px ${style.border}33` : undefined,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[11px] font-mono font-bold text-[var(--color-ink-muted)] mb-0.5">
                    {bureau.bureauCode}
                  </div>
                  <div className="text-[13px] font-semibold text-[var(--color-ink)] leading-tight">
                    {bureau.bureauName}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-sm whitespace-nowrap"
                    style={{ color: style.badge, backgroundColor: style.badgeBg }}
                  >
                    {style.label}
                  </span>
                  {isSelected ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-ink-muted)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-ink-muted)]" />
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-[20px] font-bold font-mono" style={{ color: "#4caf82" }}>
                    {bureau.achievedActions}
                  </div>
                  <div className="text-[9px] text-[var(--color-ink-muted)] uppercase tracking-wider">Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-[20px] font-bold font-mono" style={{ color: "#5b8dd9" }}>
                    {bureau.ongoingActions}
                  </div>
                  <div className="text-[9px] text-[var(--color-ink-muted)] uppercase tracking-wider">Ongoing</div>
                </div>
                <div className="text-center">
                  <div className="text-[20px] font-bold font-mono" style={{ color: "#e05c5c" }}>
                    {bureau.delayedActions}
                  </div>
                  <div className="text-[9px] text-[var(--color-ink-muted)] uppercase tracking-wider">Delayed</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-[var(--color-parchment)] rounded-full overflow-hidden mb-3">
                <div className="flex h-full">
                  <div style={{ width: `${achievedPct}%`, backgroundColor: STATUS_COLORS.achieved }} />
                  <div style={{ width: `${ongoingPct}%`, backgroundColor: STATUS_COLORS.ongoing }} />
                  <div style={{ width: `${delayedPct}%`, backgroundColor: STATUS_COLORS.delayed }} />
                </div>
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between text-[10px] text-[var(--color-ink-muted)]">
                <span>{bureau.totalActions} total actions</span>
                <span>{bureau.crossBureauActions} cross-bureau</span>
                {bureau.pcefFundingReceived != null && (
                  <span className="text-emerald-700 font-medium">
                    {formatMoney(bureau.pcefFundingReceived)} PCEF
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bureau action detail panel */}
      {selectedBureau && selectedCard && (
        <div className="border border-[var(--color-parchment)] rounded-sm overflow-hidden">
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ backgroundColor: PERFORMANCE_STYLES[selectedCard.performanceLabel].border + "15" }}
          >
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{selectedCard.bureauName}</h3>
              <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">
                {selectedCard.totalActions} assigned climate actions — click any row for detail
              </p>
            </div>
            {selectedCard.pcefFundingReceived != null && (
              <div className="text-right">
                <div className="text-[11px] text-[var(--color-ink-muted)] uppercase tracking-wider">PCEF Allocation</div>
                <div className="text-[18px] font-bold font-mono text-emerald-700">
                  {formatMoney(selectedCard.pcefFundingReceived)}
                </div>
                <div className="text-[10px] text-[var(--color-ink-muted)]">FY 21-22 through FY 24-25</div>
              </div>
            )}
          </div>

          {loadingActions ? (
            <div className="p-6 space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[var(--color-parchment)]/50 rounded" />)}
            </div>
          ) : (
            <div>
              {bureauActions.map((a, i) => (
                <div
                  key={a.actionId}
                  className={`px-4 py-3 grid grid-cols-[60px_1fr_80px_80px] gap-3 items-center text-[12px] ${
                    i % 2 === 0 ? "bg-white" : "bg-[var(--color-paper-warm)]"
                  }`}
                >
                  <span className="font-mono font-bold text-[var(--color-ink-muted)] bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm text-[10px]">
                    {a.actionId}
                  </span>
                  <span className="text-[var(--color-ink)]">{a.title}</span>
                  <span className="text-[var(--color-ink-muted)]">{a.fiscalYear ?? "—"}</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm text-center"
                    style={{
                      backgroundColor: a.status === "achieved" ? "#1a5c3a11" : a.status === "delayed" ? "#7a202011" : "#2d4a6e11",
                      color: a.status === "achieved" ? "#1a5c3a" : a.status === "delayed" ? "#7a2020" : "#2d4a6e",
                    }}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-[11px] text-[var(--color-ink-muted)]">
        Source: Climate Emergency Workplan 2022-2025. Bureau performance score calculated from achieved and ongoing actions weighted by status.
      </p>
    </div>
  );
}
