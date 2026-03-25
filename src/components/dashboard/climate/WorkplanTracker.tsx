"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star, Leaf, Shield, Filter, X } from "lucide-react";

const CLIMATE_COLOR = "#2d6a4f";

type WorkplanAction = {
  actionId: string;
  title: string;
  sector: string;
  category: "decarbonization" | "resilience";
  leadBureaus: string[];
  isDeclarationPriority: boolean;
  fiscalYear: string | null;
  resourceGap: string | null;
  isPcefFunded: boolean;
  isMultiBureau: boolean;
  status: "achieved" | "ongoing" | "delayed";
  description: string | null;
  cobenefits: string | null;
};

type WorkplanSummary = {
  total: number;
  achieved: number;
  ongoing: number;
  delayed: number;
  achievedPct: number;
  ongoingPct: number;
  delayedPct: number;
};

const STATUS_CONFIG = {
  achieved: { label: "Achieved", color: "#1a5c3a", dot: "#4caf82", bg: "#1a5c3a" },
  ongoing: { label: "Ongoing", color: "#2d4a6e", dot: "#5b8dd9", bg: "#2d4a6e" },
  delayed: { label: "Delayed", color: "#7a2020", dot: "#e05c5c", bg: "#7a2020" },
};

const SECTOR_LABELS: Record<string, string> = {
  "electricity": "Electricity",
  "buildings": "Buildings",
  "transportation": "Transportation",
  "industry": "Industry",
  "land-use": "Land Use",
  "waste-food": "Waste & Food",
  "cross-sector": "Cross-Sector",
  "flooding": "Flooding",
  "trees-canopy": "Trees & Canopy",
  "natural-resources": "Natural Resources",
  "wildfire": "Wildfire",
  "health-heat-smoke": "Heat & Smoke",
  "resilience-hubs": "Resilience Hubs",
  "infrastructure": "Infrastructure",
  "emergency-planning": "Emergency Planning",
};

const RESOURCE_GAP_LABEL: Record<string, string> = {
  "Funded": "Funded",
  "N/A": "N/A",
  "+": "Revenue positive",
  "$": "< $500K gap",
  "$$": "$500K–$1M gap",
  "$$$": "$1M–$2M gap",
  "$$$$": "$2M–$5M gap",
  "$$$$$": "> $5M gap",
  "TBD": "Gap TBD",
  "None": "No gap",
};

function gapStyle(gap: string | null) {
  if (!gap) return { color: "var(--color-ink-muted)", bg: "transparent" };
  const isFunded = gap === "Funded" || gap === "N/A" || gap === "+" || gap === "None";
  const isLarge = gap === "$$$$" || gap === "$$$$$";
  return {
    color: isFunded ? "#1a5c3a" : isLarge ? "#7a2020" : "#7a4a2a",
    bg: isFunded ? "#1a5c3a0c" : isLarge ? "#7a20200c" : "#c8956c0c",
    border: isFunded ? "#1a5c3a22" : isLarge ? "#7a202022" : "#c8956c22",
  };
}

/* ── Card Component ── */
function ActionCard({
  action,
  isExpanded,
  onToggle,
}: {
  action: WorkplanAction;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sc = STATUS_CONFIG[action.status];
  const gs = gapStyle(action.resourceGap);

  return (
    <div
      className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden transition-shadow hover:shadow-sm"
      style={{ borderLeftWidth: "3px", borderLeftColor: sc.bg }}
    >
      {/* Main card content */}
      <button onClick={onToggle} className="w-full text-left p-4">
        {/* Top row: ID + Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-mono font-bold text-[var(--color-ink-muted)] bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm">
              {action.actionId}
            </span>
            {action.isDeclarationPriority && (
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
            style={{ backgroundColor: sc.bg + "18", color: sc.color, border: `1px solid ${sc.bg}30` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
            {sc.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-medium text-[var(--color-ink)] leading-snug mb-3">
          {action.title}
        </h3>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
          {/* Category */}
          <span
            className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-sm"
            style={{
              backgroundColor: action.category === "decarbonization" ? "#2d6a4f0c" : "#2d4a6e0c",
              color: action.category === "decarbonization" ? "#2d6a4f" : "#2d4a6e",
            }}
          >
            {action.category === "decarbonization"
              ? <Leaf className="w-2.5 h-2.5" />
              : <Shield className="w-2.5 h-2.5" />}
            {SECTOR_LABELS[action.sector] ?? action.sector}
          </span>

          {/* Bureaus */}
          <span className="text-[var(--color-ink-muted)]">
            {action.leadBureaus.join(" / ")}
          </span>

          {/* Divider */}
          <span className="text-[var(--color-parchment)]" aria-hidden>|</span>

          {/* Timeline */}
          <span className="text-[var(--color-ink-muted)]">
            {action.fiscalYear ?? "TBD"}
          </span>

          {/* Funding gap */}
          {action.resourceGap && (
            <>
              <span className="text-[var(--color-parchment)]" aria-hidden>|</span>
              <span
                className="font-mono font-semibold px-1.5 py-0.5 rounded-sm"
                style={{ backgroundColor: gs.bg, color: gs.color, border: `1px solid ${gs.border}` }}
              >
                {RESOURCE_GAP_LABEL[action.resourceGap] ?? action.resourceGap}
              </span>
            </>
          )}

          {/* PCEF badge */}
          {action.isPcefFunded && (
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">
              PCEF
            </span>
          )}
        </div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-2">
          <ChevronDown
            className={`w-4 h-4 text-[var(--color-ink-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)]/[0.03] px-4 py-4">
          {action.description && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-[13px] text-[var(--color-ink)] leading-relaxed">
                {action.description}
              </p>
            </div>
          )}

          {action.cobenefits && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Co-Benefits
              </p>
              <p className="text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
                {action.cobenefits}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-[11px]">
            {action.isDeclarationPriority && (
              <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-sm px-2 py-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                Climate Emergency Declaration Priority
              </span>
            )}
            {action.isMultiBureau && (
              <span className="text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 rounded-sm px-2 py-1">
                Multi-bureau coordination required
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function WorkplanTracker() {
  const [actions, setActions] = useState<WorkplanAction[]>([]);
  const [summary, setSummary] = useState<WorkplanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBureau, setFilterBureau] = useState<string>("");
  const [filterDeclaration, setFilterDeclaration] = useState(false);
  const [filterPcef, setFilterPcef] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/climate/workplan")
      .then((r) => r.json())
      .then((d) => {
        setActions(d.actions ?? []);
        setSummary(d.summary ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allBureaus = [...new Set(actions.flatMap((a) => a.leadBureaus))].sort();

  const filtered = actions.filter((a) => {
    if (filterCategory && a.category !== filterCategory) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterBureau && !a.leadBureaus.includes(filterBureau)) return false;
    if (filterDeclaration && !a.isDeclarationPriority) return false;
    if (filterPcef && !a.isPcefFunded) return false;
    return true;
  });

  const hasFilters = filterCategory || filterStatus || filterBureau || filterDeclaration || filterPcef;

  function clearFilters() {
    setFilterCategory("");
    setFilterStatus("");
    setFilterBureau("");
    setFilterDeclaration(false);
    setFilterPcef(false);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-[var(--color-parchment)]/50 rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Status summary bar */}
      {summary && (
        <div className="mb-6 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
              All {summary.total} Actions:
            </span>
            {(["achieved", "ongoing", "delayed"] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = summary[s];
              const pct = summary[`${s}Pct` as keyof WorkplanSummary] as number;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm transition-colors ${
                    filterStatus === s ? "ring-1" : "hover:bg-[var(--color-parchment)]/40"
                  }`}
                  style={{
                    backgroundColor: filterStatus === s ? cfg.color + "0c" : undefined,
                    outline: filterStatus === s ? `1px solid ${cfg.color}` : undefined,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  <span className="text-[13px] font-semibold" style={{ color: cfg.color }}>
                    {count} {cfg.label}
                  </span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">({pct}%)</span>
                </button>
              );
            })}
            <div className="flex-1 hidden sm:block h-2 bg-[var(--color-parchment)] rounded-full overflow-hidden min-w-[100px]">
              <div className="flex h-full">
                <div style={{ width: `${summary.achievedPct}%`, backgroundColor: "#4caf82" }} />
                <div style={{ width: `${summary.ongoingPct}%`, backgroundColor: "#5b8dd9" }} />
                <div style={{ width: `${summary.delayedPct}%`, backgroundColor: "#e05c5c" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border border-[var(--color-parchment)] rounded-sm hover:bg-[var(--color-parchment)]/50 transition-colors"
          style={{ color: hasFilters ? CLIMATE_COLOR : undefined }}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasFilters && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: CLIMATE_COLOR }}
            >
              {[filterCategory, filterStatus, filterBureau, filterDeclaration, filterPcef].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}

        <span className="ml-auto text-[12px] text-[var(--color-ink-muted)]">
          Showing {filtered.length} of {actions.length} actions
        </span>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-[12px] border border-[var(--color-parchment)] rounded-sm px-2 py-1.5 bg-white"
              >
                <option value="">All</option>
                <option value="decarbonization">Decarbonization</option>
                <option value="resilience">Resilience</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-[12px] border border-[var(--color-parchment)] rounded-sm px-2 py-1.5 bg-white"
              >
                <option value="">All</option>
                <option value="achieved">Achieved</option>
                <option value="ongoing">Ongoing</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
                Bureau
              </label>
              <select
                value={filterBureau}
                onChange={(e) => setFilterBureau(e.target.value)}
                className="w-full text-[12px] border border-[var(--color-parchment)] rounded-sm px-2 py-1.5 bg-white"
              >
                <option value="">All</option>
                {allBureaus.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterDeclaration}
                  onChange={(e) => setFilterDeclaration(e.target.checked)}
                  className="rounded"
                />
                <span className="text-[12px]">
                  <Star className="inline w-3 h-3 text-yellow-500 mr-0.5" />
                  Declaration Priority
                </span>
              </label>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPcef}
                  onChange={(e) => setFilterPcef(e.target.checked)}
                  className="rounded"
                />
                <span className="text-[12px]">PCEF-Funded</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-[13px] text-[var(--color-ink-muted)] bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm">
          No actions match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((action) => (
            <ActionCard
              key={action.actionId}
              action={action}
              isExpanded={expandedId === action.actionId}
              onToggle={() =>
                setExpandedId(expandedId === action.actionId ? null : action.actionId)
              }
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-[var(--color-ink-muted)]">
        Source: Climate Emergency Workplan 2022-2025 / Portland Bureau of Planning & Sustainability.
        Status as of August 2025 final progress report.
      </p>
    </div>
  );
}
