"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Star, Leaf, Shield, Filter, X } from "lucide-react";

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

const STATUS_COLORS = {
  achieved: { bg: "#1a5c3a", text: "#ffffff", dot: "#4caf82" },
  ongoing: { bg: "#2d4a6e", text: "#ffffff", dot: "#5b8dd9" },
  delayed: { bg: "#7a2020", text: "#ffffff", dot: "#e05c5c" },
};

const STATUS_LABELS = {
  achieved: "Achieved",
  ongoing: "Ongoing",
  delayed: "Delayed",
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

function StatusBadge({ status }: { status: "achieved" | "ongoing" | "delayed" }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ backgroundColor: c.bg + "22", color: c.bg === "#1a5c3a" ? "#1a5c3a" : c.bg === "#2d4a6e" ? "#2d4a6e" : "#7a2020", border: `1px solid ${c.bg}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function GapBadge({ gap }: { gap: string | null }) {
  if (!gap) return null;
  const label = RESOURCE_GAP_LABEL[gap] ?? gap;
  const isLarge = gap === "$$$$" || gap === "$$$$$";
  const isFunded = gap === "Funded" || gap === "N/A" || gap === "+" || gap === "None";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold whitespace-nowrap"
      style={{
        backgroundColor: isFunded ? "#1a5c3a11" : isLarge ? "#7a202011" : "#c8956c11",
        color: isFunded ? "#1a5c3a" : isLarge ? "#7a2020" : "#7a4a2a",
        border: `1px solid ${isFunded ? "#1a5c3a33" : isLarge ? "#7a202033" : "#c8956c33"}`,
      }}
    >
      {label}
    </span>
  );
}

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

  // Build bureau list from actions
  const allBureaus = [...new Set(actions.flatMap((a) => a.leadBureaus))].sort();

  // Apply client-side filters
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
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-[var(--color-parchment)]/50 rounded-sm" />
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
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                All {summary.total} Actions:
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4caf82" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#1a5c3a" }}>
                {summary.achieved} Achieved
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">({summary.achievedPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#5b8dd9" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#2d4a6e" }}>
                {summary.ongoing} Ongoing
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">({summary.ongoingPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#e05c5c" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#7a2020" }}>
                {summary.delayed} Delayed
              </span>
              <span className="text-[11px] text-[var(--color-ink-muted)]">({summary.delayedPct}%)</span>
            </div>
            {/* Progress bar */}
            <div className="flex-1 hidden sm:block h-2 bg-[var(--color-parchment)] rounded-full overflow-hidden min-w-[120px]">
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
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: CLIMATE_COLOR }}>
              {[filterCategory, filterStatus, filterBureau, filterDeclaration, filterPcef].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasFilters && (
          <button onClick={clearFilters} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
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
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Category</label>
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
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Status</label>
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
              <label className="block text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Bureau</label>
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

      {/* Action table */}
      <div className="rounded-sm border border-[var(--color-parchment)]">
      <div>
        {/* Header */}
        <div className="grid grid-cols-[50px_1fr_90px_80px_80px_100px] gap-2 px-3 py-2 bg-[var(--color-canopy)] text-[10px] font-semibold text-white/70 uppercase tracking-wider">
          <div>Action</div>
          <div>Title</div>
          <div className="hidden md:block">Bureau</div>
          <div className="hidden lg:block">Timeline</div>
          <div className="hidden lg:block">Gap</div>
          <div>Status</div>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
            No actions match the current filters.
          </div>
        )}

        {filtered.map((action, i) => (
          <div key={action.actionId}>
            {/* Row */}
            <button
              onClick={() => setExpandedId(expandedId === action.actionId ? null : action.actionId)}
              className="w-full text-left"
            >
              <div
                className={`grid grid-cols-[50px_1fr_100px] md:grid-cols-[50px_1fr_90px_100px] lg:grid-cols-[50px_1fr_90px_80px_80px_100px] gap-2 px-3 py-3 transition-colors ${
                  i % 2 === 0 ? "bg-[var(--color-paper-warm)]" : "bg-white"
                } hover:bg-[var(--color-parchment)]/30 ${expandedId === action.actionId ? "border-l-2" : ""}`}
                style={{ borderLeftColor: expandedId === action.actionId ? CLIMATE_COLOR : undefined }}
              >
                {/* Action ID */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[var(--color-ink-muted)] bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm">
                    {action.actionId}
                  </span>
                  {action.isDeclarationPriority && (
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {/* Title + category */}
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="text-[13px] font-medium text-[var(--color-ink)] leading-snug">
                      {action.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: action.category === "decarbonization" ? "#2d6a4f11" : "#2d4a6e11",
                        color: action.category === "decarbonization" ? "#2d6a4f" : "#2d4a6e",
                      }}
                    >
                      {action.category === "decarbonization" ? <Leaf className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                      {action.category === "decarbonization" ? "Decarbonization" : "Resilience"}
                    </span>
                    <span className="text-[10px] text-[var(--color-ink-muted)]">
                      {SECTOR_LABELS[action.sector] ?? action.sector}
                    </span>
                    {action.isPcefFunded && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">PCEF</span>
                    )}
                  </div>
                </div>

                {/* Bureaus — hidden on small */}
                <div className="hidden md:flex flex-wrap gap-1 items-start">
                  {action.leadBureaus.map((b) => (
                    <span key={b} className="text-[10px] font-mono bg-[var(--color-parchment)] px-1.5 py-0.5 rounded-sm text-[var(--color-ink-muted)]">
                      {b}
                    </span>
                  ))}
                </div>

                {/* FY — hidden on small/medium */}
                <div className="hidden lg:flex text-[11px] text-[var(--color-ink-muted)] items-center">
                  {action.fiscalYear ?? "—"}
                </div>

                {/* Gap — hidden on small/medium */}
                <div className="hidden lg:flex items-center">
                  <GapBadge gap={action.resourceGap} />
                </div>

                {/* Status + expand */}
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={action.status} />
                  {expandedId === action.actionId ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded detail */}
            {expandedId === action.actionId && (
              <div className="border-t border-[var(--color-parchment)] bg-[var(--color-canopy)]/3 px-6 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Description */}
                  <div className="lg:col-span-2">
                    <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">Description</p>
                    <p className="text-[13px] text-[var(--color-ink)] leading-relaxed">{action.description}</p>

                    {action.cobenefits && (
                      <div className="mt-4">
                        <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Co-Benefits</p>
                        <p className="text-[12px] text-[var(--color-ink-light)]">{action.cobenefits}</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">All Responsible Bureaus</p>
                      <div className="flex flex-wrap gap-1">
                        {action.leadBureaus.map((b) => (
                          <span key={b} className="text-[11px] font-mono bg-[var(--color-canopy)] text-white px-2 py-0.5 rounded-sm">{b}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Timeline</p>
                        <p className="text-[12px]">{action.fiscalYear ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Resource Gap</p>
                        <GapBadge gap={action.resourceGap} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Status</p>
                        <StatusBadge status={action.status} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Funding Source</p>
                        <p className="text-[12px]">{action.isPcefFunded ? "PCEF" : "City / Other"}</p>
                      </div>
                    </div>
                    {action.isDeclarationPriority && (
                      <div className="flex items-center gap-1.5 text-[12px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-sm px-2 py-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        Climate Emergency Declaration Priority
                      </div>
                    )}
                    {action.isMultiBureau && (
                      <div className="text-[11px] text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/60 rounded-sm px-2 py-1">
                        Multi-bureau coordination required
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-ink-muted)]">
        Source: Climate Emergency Workplan 2022-2025 / Portland Bureau of Planning & Sustainability.
        Status as of August 2025 final progress report.
        ★ = Climate Emergency Declaration priority action.
      </p>
    </div>
  );
}
