"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight, Star, Filter } from "lucide-react";

interface CewAction {
  action_id: string;
  sector: string;
  category: "decarbonization" | "resilience";
  title: string;
  lead_bureaus: string[];
  maps_to_declaration: boolean;
  fiscal_year: string;
  resource_gap: string;
  status: "achieved" | "ongoing" | "delayed";
  pcef_funded: boolean;
  multi_bureau: boolean;
}

interface WorkplanData {
  actions: CewAction[];
  summary: { total: number; achieved: number; ongoing: number; delayed: number };
  sectors: string[];
  bureaus: string[];
  dataStatus: string;
}

const STATUS_CONFIG = {
  achieved: { label: "Achieved", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "#059669" },
  ongoing: { label: "Ongoing", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "#d97706" },
  delayed: { label: "Delayed", bg: "bg-red-50", text: "text-red-800", border: "border-red-200", dot: "#dc2626" },
};

const GAP_LABELS: Record<string, string> = {
  "$": "< $100K",
  "$$": "$100K–$500K",
  "$$$": "$500K–$1M",
  "$$$$": "$1M–$5M",
  "$$$$$": "> $5M",
  "+": "Revenue generating",
  "Funded": "Fully funded",
  "N/A": "N/A",
  "TBD": "To be determined",
  "None": "No gap",
};

export default function WorkplanTracker() {
  const [data, setData] = useState<WorkplanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterSector, setFilterSector] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBureau, setFilterBureau] = useState<string>("all");

  useEffect(() => {
    fetch("/api/dashboard/environment/workplan")
      .then((r) => r.json())
      .then((d: WorkplanData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.actions.filter((a) => {
      if (filterSector !== "all" && a.sector !== filterSector) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterBureau !== "all" && !a.lead_bureaus.includes(filterBureau)) return false;
      return true;
    });
  }, [data, filterSector, filterStatus, filterBureau]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-16" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-[var(--color-ink-muted)] text-[16px]">Unable to load workplan data.</p>;

  const { summary } = data;
  const achievedPct = Math.round((summary.achieved / summary.total) * 100);
  const ongoingPct = Math.round((summary.ongoing / summary.total) * 100);
  const delayedPct = Math.round((summary.delayed / summary.total) * 100);

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Summary bar */}
      <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.1em]">
            {summary.total} Actions Total
          </p>
          <p className="text-[14px] text-[var(--color-ink-muted)]">
            Climate Emergency Workplan 2022–2025
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-[var(--color-parchment)] flex overflow-hidden">
          <div className="bg-emerald-500 transition-all" style={{ width: `${achievedPct}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${ongoingPct}%` }} />
          <div className="bg-red-400 transition-all" style={{ width: `${delayedPct}%` }} />
        </div>

        <div className="flex gap-6 mt-3">
          <span className="flex items-center gap-1.5 text-[14px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono font-semibold text-emerald-800 lg:text-[16px] 2xl:text-[18px]">{summary.achieved}</span>
            <span className="text-[var(--color-ink-muted)]">Achieved ({achievedPct}%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-[14px]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-mono font-semibold text-amber-800 lg:text-[16px] 2xl:text-[18px]">{summary.ongoing}</span>
            <span className="text-[var(--color-ink-muted)]">Ongoing ({ongoingPct}%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-[14px]">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="font-mono font-semibold text-red-800 lg:text-[16px] 2xl:text-[18px]">{summary.delayed}</span>
            <span className="text-[var(--color-ink-muted)]">Delayed ({delayedPct}%)</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-ink-muted)]" />
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="text-[15px] bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm px-3 py-1.5 text-[var(--color-ink)]"
        >
          <option value="all">All Sectors</option>
          {data.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-[15px] bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm px-3 py-1.5 text-[var(--color-ink)]"
        >
          <option value="all">All Statuses</option>
          <option value="achieved">Achieved</option>
          <option value="ongoing">Ongoing</option>
          <option value="delayed">Delayed</option>
        </select>
        <select
          value={filterBureau}
          onChange={(e) => setFilterBureau(e.target.value)}
          className="text-[15px] bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm px-3 py-1.5 text-[var(--color-ink)]"
        >
          <option value="all">All Bureaus</option>
          {data.bureaus.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {(filterSector !== "all" || filterStatus !== "all" || filterBureau !== "all") && (
          <button
            onClick={() => { setFilterSector("all"); setFilterStatus("all"); setFilterBureau("all"); }}
            className="text-[14px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline"
          >
            Clear filters
          </button>
        )}
        <span className="text-[14px] text-[var(--color-ink-muted)] ml-auto">
          Showing {filtered.length} of {data.actions.length}
        </span>
      </div>

      {/* Action list */}
      <div className="space-y-1.5">
        {filtered.map((action) => {
          const isExpanded = expanded.has(action.action_id);
          const cfg = STATUS_CONFIG[action.status];

          return (
            <div key={action.action_id} className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm">
              <button
                onClick={() => toggleExpand(action.action_id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-parchment)]/30 transition-colors min-w-0"
              >
                {isExpanded
                  ? <ChevronDown className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0" />
                }

                <span className="text-[15px] font-mono font-semibold text-[var(--color-ink-muted)] w-12 flex-shrink-0">
                  {action.action_id}
                </span>

                <span className="text-[16px] text-[var(--color-ink)] flex-1 leading-snug min-w-0 truncate sm:whitespace-normal">
                  {action.title}
                </span>

                {action.maps_to_declaration && (
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}

                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider border rounded-sm flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  {cfg.label}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 ml-7 border-t border-[var(--color-parchment)] space-y-3">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-[14px]">
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Sector</p>
                      <p className="text-[var(--color-ink)] font-medium">{action.sector}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Category</p>
                      <p className="text-[var(--color-ink)] font-medium capitalize">{action.category}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Lead Bureau(s)</p>
                      <p className="text-[var(--color-ink)] font-medium break-words">{action.lead_bureaus.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Fiscal Year</p>
                      <p className="text-[var(--color-ink)] font-medium">{action.fiscal_year}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Resource Gap</p>
                      <p className="text-[var(--color-ink)] font-medium">
                        {action.resource_gap} {GAP_LABELS[action.resource_gap] ? `(${GAP_LABELS[action.resource_gap]})` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-ink-muted)] uppercase tracking-wider text-[12px] mb-1">Flags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {action.maps_to_declaration && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-sm">
                            ★ Declaration Priority
                          </span>
                        )}
                        {action.pcef_funded && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-semibold bg-green-50 text-green-800 border border-green-200 rounded-sm">
                            PCEF Funded
                          </span>
                        )}
                        {action.multi_bureau && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded-sm">
                            Multi-Bureau
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
