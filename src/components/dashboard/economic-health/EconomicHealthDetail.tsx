"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Building2,
  Scale,
  AlertCircle,
  MapPin,
  ArrowRight,
  Calendar,
  Briefcase,
} from "lucide-react";

import StatGrid from "@/components/charts/StatGrid";
import TrendChart from "@/components/charts/TrendChart";
import BarChart from "@/components/charts/BarChart";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";

const ACCENT = "#5c8b9c"; // slate-teal

interface PeerObservation {
  metroCode: string;
  shortName: string;
  isPortland: boolean;
  current: number;
  population: number | null;
}

interface SubScore {
  key: string;
  label: string;
  value: number;
  weight: number;
  rawWeight: number;
  description: string;
  source?: string;
  portlandHistoricalPercentile?: number;
  peerPercentile?: number;
  portlandCurrent?: number;
  portlandHistory?: {
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    min: number;
    max: number;
    count: number;
  };
  peerSnapshot?: PeerObservation[];
  peerMedian?: number;
  peerMin?: number;
  peerMax?: number;
  inverted?: boolean;
}

interface BusinessRow {
  month: string;
  new_businesses: number;
  bankruptcies: number;
  lawsuits: number;
  tax_liens: number;
}

interface ReRow {
  month: string;
  entity_buyers: number;
  person_buyers: number;
  total_volume_usd: string | number;
  deal_count: number;
  entity_share_pct: string | number | null;
}

interface SerialBuyer {
  buyer_name: string;
  buyer_type: string | null;
  deal_count: number;
  total_volume_usd: string | number | null;
  zip_count: number | null;
}

interface DistressEntity {
  entity_name: string;
  categories: string[];
  category_count: number;
}

interface TopLawsuit {
  defendant_name: string;
  plaintiff_name: string | null;
  suit_type: string | null;
  damages_usd: string | number;
  filed_date: string | null;
}

interface ZipRow {
  zip_code: string;
  permit_count: number;
  permit_value_usd: string | number;
  re_deal_count: number;
  re_volume_usd: string | number;
  new_business_count: number;
  total_investment_usd: string | number;
}

interface IndustryRow {
  sector: string;
  jobs_delta: number;
  pct: number;
}

interface DetailPayload {
  composite: {
    score: number;
    label: "Healthy" | "Mixed" | "Concerning" | "Insufficient data";
    subScores: SubScore[];
    missing: string[];
  } | null;
  businessSeries: BusinessRow[];
  reSeries: ReRow[];
  serialBuyers: SerialBuyer[];
  distressEntities: DistressEntity[];
  topLawsuits: TopLawsuit[];
  zipInvestment: ZipRow[];
  industryGainers: IndustryRow[];
  industryLosers: IndustryRow[];
  unemployment: { rate: number | null; period: string | null };
  windowSummary: {
    newBiz12mo: number;
    newBizPriorYear: number;
    bankruptcies12mo: number;
    distress12mo: number;
    distressPriorYear: number;
    reVolume12mo: number;
    reDeals12mo: number;
    entityBuyers12mo: number;
    permitsCurr: number;
    permitsPrior: number;
  } | null;
  meta: { pbjAsOf: string | null; qcewAsOf: string | null; scoreAsOf: string | null };
  dataStatus: string;
}

// ── helpers ─────────────────────────────────────────────────────────────

const fmtUsd = (n: number | string | null) => {
  const v = Number(n ?? 0);
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
};

const fmtPct = (n: number | string | null, decimals = 1) => {
  const v = Number(n ?? 0);
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;
};

function pctChange(curr: number, prior: number): number {
  if (!prior) return 0;
  return Math.round(((curr - prior) / prior) * 1000) / 10;
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
      <Icon className="w-4 h-4" style={{ color: ACCENT }} />
      <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function DigDeeper({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-5 flex justify-end">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        {label}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function fmtVal(s: SubScore): string {
  if (s.portlandCurrent === undefined) return "—";
  const label = s.label.toLowerCase();
  if (label.includes("ratio")) {
    return `${s.portlandCurrent.toFixed(1)}×`;
  }
  if (label.includes("rate") || label.includes("growth") || label.includes("participation")) {
    return `${s.portlandCurrent.toFixed(1)}%`;
  }
  return Math.round(s.portlandCurrent).toLocaleString();
}

/**
 * Translate the historical percentile (0-100) into a plain-English phrase.
 * Higher percentile = better. Already accounts for inverted metrics (handled
 * upstream by the scoring lib).
 */
function plainHistoryCaption(pct: number): string {
  if (pct >= 80) return "Among Portland's strongest in the last decade";
  if (pct >= 60) return "Better than usual for Portland";
  if (pct >= 40) return "Roughly typical for Portland";
  if (pct >= 20) return `Weaker than ${100 - pct}% of the last decade`;
  return `Among Portland's weakest in the last decade`;
}

function plainPeerCaption(pct: number): string {
  if (pct >= 80) return "Beats most peer cities";
  if (pct >= 60) return "Ahead of peer median";
  if (pct >= 40) return "Around peer median";
  if (pct >= 20) return "Behind most peer cities";
  return "At the bottom of peer cities";
}

/**
 * Score bar with empirical baseline ribbon + peer-snapshot ticks.
 * Built around min/max of (Portland history + peer values) so all marks share an axis.
 */
function ScoreBar({ s }: { s: SubScore }) {
  const hasEmpirical =
    s.portlandHistory && s.peerSnapshot && s.portlandCurrent !== undefined;

  if (!hasEmpirical) {
    // Fallback to plain bar if empirical context is missing.
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-[14px]">
          <span className="text-[var(--color-ink)] font-semibold">{s.label}</span>
          <span className="font-mono text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-ink)] text-[16px] font-semibold">{s.value}</span>
            <span className="text-[var(--color-ink-muted)]">/100</span>
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-parchment)] rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm"
            style={{
              width: `${s.value}%`,
              backgroundColor: s.value >= 70 ? "#3d7a5a" : s.value >= 40 ? "#c8956c" : "#b85c3a",
            }}
          />
        </div>
        <p className="text-[13px] text-[var(--color-ink-muted)] leading-snug">{s.description}</p>
      </div>
    );
  }

  const hist = s.portlandHistory!;
  const peers = s.peerSnapshot!;
  const portlandPeer = peers.find((p) => p.isPortland);

  const allValues = [hist.min, hist.max, ...peers.map((p) => p.current), s.portlandCurrent!];
  const lo = Math.min(...allValues);
  const hi = Math.max(...allValues);
  const span = hi - lo || 1;
  const pos = (v: number) => ((v - lo) / span) * 100;
  const scoreColor = s.value >= 70 ? "#3d7a5a" : s.value >= 40 ? "#c8956c" : "#b85c3a";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline text-[14px]">
        <span className="text-[var(--color-ink)] font-semibold">{s.label}</span>
        <span className="font-mono">
          <span className="text-[var(--color-ink)] text-[18px] font-semibold">{s.value}</span>
          <span className="text-[12px] text-[var(--color-ink-muted)]">/100</span>
        </span>
      </div>

      {/* Editorial-almanac ribbon: 64px tall, three lanes (peer pills / track / caption) */}
      <RibbonChart
        s={s}
        scoreColor={scoreColor}
        pos={pos}
        peers={peers}
        portlandPeer={portlandPeer}
        hist={hist}
      />

      <p className="text-[13px] text-[var(--color-ink-muted)] leading-snug">
        {s.description} <span className="opacity-70">Source: {s.source ?? "—"}.</span>
      </p>
    </div>
  );
}

const PEER_CODES: Record<string, string> = {
  Seattle: "SEA",
  Denver: "DEN",
  Austin: "AUS",
  "San Francisco": "SFO",
  Minneapolis: "MIN",
  Phoenix: "PHX",
  Portland: "PDX",
};

const peerCode = (name: string): string =>
  PEER_CODES[name] ?? name.slice(0, 3).toUpperCase();

/**
 * Format a peer's value with the same convention as the Portland marker.
 * Pulls hint from the indicator label so we know whether to suffix with %.
 */
function fmtPeerValue(value: number, label: string): string {
  const isPercent =
    label.toLowerCase().includes("rate") || label.toLowerCase().includes("growth");
  return isPercent ? `${value.toFixed(1)}%` : Math.round(value).toLocaleString();
}

/**
 * When peer values cluster (e.g., 5 metros within 2 percentage points), a
 * single-row layout can't fit pills without overlap. Greedy-assign each peer
 * to the lowest-numbered row where no prior pill in the same row is within
 * PILL_WIDTH px. Up to 3 rows. Returns a map of metroCode → row index (0 =
 * closest to track, 1 = above, 2 = highest).
 */
function rowAssignments(
  peers: PeerObservation[],
  pos: (v: number) => number,
  trackWidthPx = 700,
): Record<string, number> {
  const PILL_WIDTH = 42; // 3-letter code + padding + 4px buffer
  const sorted = [...peers]
    .filter((p) => !p.isPortland)
    .sort((a, b) => a.current - b.current);
  const rowLastX: number[] = []; // last assigned X per row
  const result: Record<string, number> = {};
  for (const p of sorted) {
    const x = (pos(p.current) / 100) * trackWidthPx;
    let row = -1;
    for (let r = 0; r < rowLastX.length; r++) {
      if (x - rowLastX[r] >= PILL_WIDTH) {
        row = r;
        break;
      }
    }
    if (row === -1) {
      row = rowLastX.length;
      rowLastX.push(0);
    }
    rowLastX[row] = x;
    result[p.metroCode] = row;
  }
  return result;
}

interface RibbonChartProps {
  s: SubScore;
  scoreColor: string;
  pos: (v: number) => number;
  peers: PeerObservation[];
  portlandPeer: PeerObservation | undefined;
  hist: NonNullable<SubScore["portlandHistory"]>;
}

function RibbonChart({ s, scoreColor, pos, peers, portlandPeer, hist }: RibbonChartProps) {
  const rows = rowAssignments(peers, pos);
  const numRows = Math.max(1, ...Object.values(rows).map((r) => r + 1));
  const ROW_HEIGHT = 26; // pill (22px) + 4px gap
  const trackTop = numRows * ROW_HEIGHT + 18; // pills + drop-line padding
  const totalHeight = trackTop + 60; // track + Portland caption

  return (
    <div className="relative w-full" style={{ height: totalHeight }}>
      {/* ── Lane 1 (top): peer pills, possibly stacked across multiple rows ── */}
      {peers
        .filter((p) => !p.isPortland)
        .map((p) => {
          const leftPct = pos(p.current);
          const row = rows[p.metroCode] ?? 0;
          // Row 0 is closest to track (lowest visually); higher row indices
          // sit further above. So `top` decreases with row.
          const topPx = (numRows - 1 - row) * ROW_HEIGHT;
          const dropLineHeight = trackTop - topPx - 22; // pill height = 22
          return (
            <div
              key={p.metroCode}
              className="group absolute"
              style={{
                top: topPx,
                left: `${leftPct}%`,
                transform: "translateX(-50%)",
                zIndex: 5,
              }}
            >
              {/* The pill (always visible 3-letter code) — also the hover hit target */}
              <div
                className="relative inline-flex items-center justify-center cursor-pointer select-none
                           h-[22px] px-2 rounded-full border border-[#7c9bb0]/60 bg-[var(--color-paper-warm)]
                           text-[11px] font-mono tracking-[0.06em] uppercase text-[#5a7a8a]
                           transition-all duration-150 ease-out
                           group-hover:bg-[var(--color-canopy)] group-hover:text-white
                           group-hover:border-[var(--color-canopy)]
                           group-hover:shadow-[0_2px_6px_rgba(15,36,25,0.22)]"
                style={{ minWidth: 36 }}
              >
                {peerCode(p.shortName)}
                {/* Custom CSS-only tooltip */}
                <span
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+4px)]
                             whitespace-nowrap rounded-sm bg-[var(--color-canopy)] text-white
                             px-2 py-1 text-[12px] font-mono leading-none
                             opacity-0 group-hover:opacity-100 transition-opacity duration-100
                             shadow-[0_4px_16px_rgba(15,36,25,0.22)] z-20"
                >
                  {p.shortName} • {fmtPeerValue(p.current, s.label)}
                </span>
              </div>

              {/* Drop-line from pill down to track (thickens on hover) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-[22px] w-px
                           bg-[#7c9bb0]/45 transition-all duration-150
                           group-hover:bg-[var(--color-canopy)] group-hover:w-[2px]"
                style={{ height: dropLineHeight }}
              />
            </div>
          );
        })}

      {/* ── Lane 2 (middle, the track) ─────────────────────────────────── */}
      <div className="absolute left-0 right-0" style={{ top: trackTop }}>
        {/* Faint Portland historical full range */}
        <div
          className="absolute h-px bg-[var(--color-parchment)]"
          style={{
            left: `${pos(hist.min)}%`,
            width: `${Math.max(0.5, pos(hist.max) - pos(hist.min))}%`,
            top: 4,
          }}
        />
        {/* Portland historical p25-p75 band */}
        <div
          className="absolute h-2 rounded-sm"
          style={{
            left: `${pos(hist.p25)}%`,
            width: `${Math.max(2, pos(hist.p75) - pos(hist.p25))}%`,
            top: 0,
            backgroundColor: "#d8c8a8",
            opacity: 0.55,
          }}
        />
        {/* Portland 10-year median tick */}
        <div
          className="absolute w-px h-4 bg-[#a8956c]"
          style={{ left: `${pos(hist.median)}%`, top: -4 }}
          aria-label={`Portland 10y median: ${hist.median.toFixed(1)}`}
        />

        {/* Portland current marker — the dominant element */}
        <div
          className="absolute rounded-full"
          style={{
            left: `calc(${pos(s.portlandCurrent!)}% - 9px)`,
            top: -5,
            width: 18,
            height: 18,
            backgroundColor: scoreColor,
            border: "3px solid var(--color-paper-warm)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.20)",
            zIndex: 4,
          }}
        />
      </div>

      {/* ── Lane 3 (bottom): Portland caption + percentile readout ───── */}
      <div
        className="absolute"
        style={{
          left: `${pos(s.portlandCurrent!)}%`,
          top: trackTop + 20, // ~20px below the track baseline
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="text-[13px] font-bold whitespace-nowrap px-2 py-0.5 rounded-sm"
            style={{ color: scoreColor, backgroundColor: "var(--color-paper-warm)" }}
          >
            Portland · {fmtVal(s)}
          </div>
          <div className="text-[12px] text-[var(--color-ink-muted)] whitespace-nowrap text-center max-w-[300px]">
            {plainHistoryCaption(s.portlandHistoricalPercentile ?? 50)}
            {" · "}
            {plainPeerCaption(s.peerPercentile ?? 50)}
          </div>
        </div>
      </div>
      {/* Hidden but available for screen readers — Portland metro context */}
      {portlandPeer && (
        <span className="sr-only">
          Portland today: {fmtVal(s)}. {s.portlandHistoricalPercentile}th percentile vs Portland&apos;s
          own history. {s.peerPercentile}th percentile vs peer metros.
        </span>
      )}
    </div>
  );
}

function PeerLegend() {
  // Decoded once at the section level — each ribbon below uses the same codes.
  const peers: Array<[string, string]> = [
    ["SEA", "Seattle"],
    ["DEN", "Denver"],
    ["AUS", "Austin"],
    ["SFO", "San Francisco"],
    ["MIN", "Minneapolis"],
    ["PHX", "Phoenix"],
  ];
  return (
    <div className="space-y-2 pt-1">
      {/* Code → city map (one row, applies to all three ribbons below) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--color-ink-muted)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]/80 mr-1">
          Peer metros
        </span>
        {peers.map(([code, name]) => (
          <span key={code} className="inline-flex items-center gap-1.5">
            <span
              className="inline-flex items-center justify-center h-[20px] px-1.5 rounded-full
                         border border-[#7c9bb0]/60 text-[11px] font-mono uppercase tracking-[0.06em]
                         text-[#5a7a8a]"
              style={{ minWidth: 32 }}
            >
              {code}
            </span>
            <span>{name}</span>
          </span>
        ))}
      </div>
      {/* Mark legend — Portland's marker, historical band, median tick */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-[14px] h-[14px] rounded-full"
            style={{ backgroundColor: "#5c8b9c", border: "2px solid var(--color-paper-warm)", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}
          />
          Portland today (PDX)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 bg-[#d8c8a8] rounded-sm opacity-55" />
          Portland p25–p75 (10y range)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-px h-3 bg-[#a8956c]" />
          Portland 10y median
        </span>
      </div>
    </div>
  );
}

// ── component ───────────────────────────────────────────────────────────

export default function EconomicHealthDetail() {
  const [data, setData] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/economic-health/detail", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: DetailPayload) => {
        if (!cancelled) setData(d);
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-48 rounded-sm bg-[var(--color-parchment)]" />
        ))}
      </div>
    );
  }

  if (error || !data || data.dataStatus === "error") {
    return (
      <div className="text-center py-16 text-[var(--color-ink-muted)]">
        <p className="text-sm">Economic Health data temporarily unavailable.</p>
      </div>
    );
  }

  const c = data.composite;
  const w = data.windowSummary;
  const newBizPct = w ? pctChange(w.newBiz12mo, w.newBizPriorYear) : 0;
  const distressPct = w ? pctChange(w.distress12mo, w.distressPriorYear) : 0;
  const permitPct = w ? pctChange(w.permitsCurr, w.permitsPrior) : 0;
  const entitySharePct =
    w && w.reDeals12mo > 0
      ? Math.round((w.entityBuyers12mo / w.reDeals12mo) * 1000) / 10
      : 0;
  const topDistress = data.distressEntities[0];
  const pbjStale =
    data.meta.pbjAsOf && Date.now() - new Date(data.meta.pbjAsOf).getTime() > 60 * 86400 * 1000;

  return (
    <div className="space-y-10">
      {pbjStale && (
        <div className="bg-[#fff7e6] border border-[#e8c87a] rounded-sm p-4 text-[15px]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9a6b1a]" />
            <span className="font-semibold text-[#5a3a0a]">PBJ data refresh due</span>
          </div>
          <p className="text-[14px] text-[#7a5a2a] mt-1">
            Source data last refreshed {data.meta.pbjAsOf}. Re-run the PBJ scrape + sync to update.
          </p>
        </div>
      )}

      {/* ━━━ 1. HEALTH SCORE ━━━ */}
      <section>
        <SectionHeader icon={Activity} title="State of the Economy — Health Score" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
          {c ? (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(${ACCENT} ${c.score * 3.6}deg, #efe7d8 ${c.score * 3.6}deg)`,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-[var(--color-paper-warm)] flex flex-col items-center justify-center">
                      <span className="text-[36px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                        {c.score}
                      </span>
                      <span className="text-[12px] text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mt-0.5">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] mb-1.5">
                    Composite Economic Health
                  </p>
                  <h3 className="font-editorial-normal text-[28px] leading-tight text-[var(--color-ink)] mb-2">
                    {c.label === "Healthy" && "Portland's economy is broadly healthy."}
                    {c.label === "Mixed" && "Mixed signals — some indicators positive, some concerning."}
                    {c.label === "Concerning" && "Concerning signals across multiple indicators."}
                    {c.label === "Insufficient data" && "Insufficient data to compute a score."}
                  </h3>
                  <p className="text-[15px] text-[var(--color-ink-muted)] leading-relaxed">
                    A weighted blend of six economic indicators with 10+ years of comparable peer-metro
                    data — covering jobs, wages, business dynamism, labor participation, and housing
                    affordability. Each sub-score asks two empirical questions: <em>How does Portland
                    compare to its own past?</em> and <em>How does Portland compare to peer cities right
                    now?</em> The two answers are averaged. <strong className="text-[var(--color-ink)]">A score
                    near 50 is normal for Portland and average vs peers; 80+ is exceptional; below 30 is
                    weaker than typical and behind peer cities.</strong>
                  </p>
                </div>
              </div>

              {c.subScores.length > 0 && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {c.subScores.map((s) => (
                      <ScoreBar key={s.key} s={s} />
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-[var(--color-parchment)]">
                    <PeerLegend />
                    <p className="text-[13px] text-[var(--color-ink-muted)] mt-2 leading-snug">
                      Each indicator is scored as the average of two empirical percentiles —
                      Portland&apos;s rank against its own 10-year history, and Portland&apos;s rank
                      against 6 peer metros (Seattle, Denver, Austin, San Francisco, Minneapolis,
                      Phoenix) at the most recent comparable period. 50 = exactly average for both
                      Portland history and peer metros.
                    </p>
                  </div>
                </>
              )}

              {c.missing.length > 0 && (
                <p className="text-[13px] text-[var(--color-ink-muted)] mt-5 italic">
                  Missing inputs ({c.missing.join(", ")}) excluded; remaining weights re-normalized.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)]">Score unavailable.</p>
          )}

          {w && (
            <div className="mt-8 pt-6 border-t border-[var(--color-parchment)]">
              <StatGrid
                accentColor={ACCENT}
                stats={[
                  {
                    label: "New businesses (12mo)",
                    value: w.newBiz12mo,
                    change: newBizPct,
                    changeLabel: "vs prior 12",
                  },
                  {
                    label: "Bankruptcies (12mo)",
                    value: w.bankruptcies12mo,
                    change: distressPct,
                    changeLabel: "distress YoY",
                  },
                  {
                    label: "Unemployment (MSA)",
                    value: data.unemployment.rate?.toFixed(1) ?? "—",
                    suffix: "%",
                    subtitle: data.unemployment.period ?? "",
                  },
                  {
                    label: "BDS permits (12mo)",
                    value: w.permitsCurr,
                    change: permitPct,
                    changeLabel: "vs prior 12",
                  },
                ]}
              />
            </div>
          )}
        </div>
      </section>

      {/* ━━━ 2. WINNERS ━━━ */}
      <section>
        <SectionHeader icon={TrendingUp} title="Where Portland is Doing Well" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Industries adding jobs (YoY)
              </h3>
              {data.industryGainers.length > 0 ? (
                <ul className="space-y-2">
                  {data.industryGainers.map((g) => (
                    <li
                      key={g.sector}
                      className="flex justify-between text-[15px] py-1.5 border-b border-[var(--color-parchment)]"
                    >
                      <span className="text-[var(--color-ink)]">{g.sector}</span>
                      <span className="font-mono text-[#3d7a5a]">
                        +{g.jobs_delta.toLocaleString()} ({fmtPct(g.pct)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">
                  Industry breakdown unavailable.
                </p>
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Top ZIPs by total investment (permits + real estate)
              </h3>
              {data.zipInvestment.length > 0 ? (
                <div className="space-y-2">
                  {data.zipInvestment.slice(0, 5).map((z, i, arr) => {
                    const maxVal = Number(arr[0].total_investment_usd) || 1;
                    const v = Number(z.total_investment_usd);
                    const pct = Math.max(2, Math.round((v / maxVal) * 100));
                    return (
                      <div key={z.zip_code} className="flex items-center gap-3">
                        <span className="text-[14px] font-mono text-[var(--color-ink)] w-[60px] text-right flex-shrink-0">
                          {z.zip_code}
                        </span>
                        <div className="flex-1 h-6 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: ACCENT,
                              opacity: 0.65 + 0.35 * (1 - i / Math.max(1, arr.length - 1)),
                            }}
                          />
                        </div>
                        <span className="text-[14px] font-mono font-semibold text-[var(--color-ink)] w-[80px] text-right flex-shrink-0">
                          {fmtUsd(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">No ZIP data.</p>
              )}
            </div>
          </div>
          <DigDeeper href="/dashboard/economy" label="Industry & wage detail on Economy" />
          <DigDeeper href="/dashboard/housing" label="Permit pipeline detail on Housing" />
        </div>
      </section>

      {/* ━━━ 3. LOSERS ━━━ */}
      <section>
        <SectionHeader icon={TrendingDown} title="Where Portland is Struggling" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Industries shedding jobs (YoY)
              </h3>
              {data.industryLosers.length > 0 ? (
                <ul className="space-y-2">
                  {data.industryLosers.map((g) => (
                    <li
                      key={g.sector}
                      className="flex justify-between text-[15px] py-1.5 border-b border-[var(--color-parchment)]"
                    >
                      <span className="text-[var(--color-ink)]">{g.sector}</span>
                      <span className="font-mono text-[#b85c3a]">
                        {g.jobs_delta.toLocaleString()} ({fmtPct(g.pct)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">
                  Industry breakdown unavailable.
                </p>
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Bankruptcies — last 24 months
              </h3>
              {data.businessSeries.length > 0 ? (
                <TrendChart
                  height={220}
                  color="#b85c3a"
                  data={data.businessSeries.map((r) => ({
                    date: r.month,
                    value: r.bankruptcies,
                  }))}
                />
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">No bankruptcy data.</p>
              )}
            </div>
          </div>
          <DigDeeper href="/dashboard/economy" label="Sector-level wage and job detail on Economy" />
        </div>
      </section>

      {/* ━━━ 4. WHO'S WINNING ━━━ */}
      <section>
        <SectionHeader icon={Building2} title="Who's Winning — Capital Concentration" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <p className="text-[15px] text-[var(--color-ink-muted)] leading-relaxed mb-4">
            Of {Number(w?.reDeals12mo ?? 0).toLocaleString()} real-estate transactions in the last
            12 months, <strong>{entitySharePct}%</strong> went to LLCs, corporations, or trusts —
            meaning roughly <strong>{Number(w?.entityBuyers12mo ?? 0).toLocaleString()}</strong>{" "}
            Portland properties were absorbed by entities, not individuals.
          </p>

          {data.reSeries.length > 0 && (
            <div className="mb-5">
              <ComparisonBarChart
                height={240}
                xKey="month"
                bars={[
                  { key: "person_buyers", label: "Individual buyer", color: ACCENT, stackId: "a" },
                  { key: "entity_buyers", label: "Entity buyer (LLC/corp/trust)", color: "#7c5a8c", stackId: "a" },
                ]}
                data={data.reSeries as unknown as Record<string, string | number>[]}
                showLegend={true}
              />
            </div>
          )}

          {data.serialBuyers.length > 0 && (
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Most-active buyers
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="text-left text-[var(--color-ink-muted)] border-b border-[var(--color-parchment)]">
                      <th className="py-2 font-semibold">Buyer</th>
                      <th className="py-2 font-semibold">Type</th>
                      <th className="py-2 font-semibold text-right">Properties</th>
                      <th className="py-2 font-semibold text-right">Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.serialBuyers.slice(0, 10).map((b) => (
                      <tr key={b.buyer_name} className="border-b border-[var(--color-parchment)]">
                        <td className="py-2 text-[var(--color-ink)]">{b.buyer_name}</td>
                        <td className="py-2 text-[var(--color-ink-muted)]">
                          {b.buyer_type ?? "—"}
                        </td>
                        <td className="py-2 text-right font-mono">{b.deal_count}</td>
                        <td className="py-2 text-right font-mono">{fmtUsd(b.total_volume_usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DigDeeper href="/dashboard/housing" label="Rent and home-value detail on Housing" />
        </div>
      </section>

      {/* ━━━ 5. WHO'S LOSING ━━━ */}
      <section>
        <SectionHeader icon={Scale} title="Who's Losing — Lawsuits and Distress" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Biggest lawsuits (claimed damages)
              </h3>
              {data.topLawsuits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="text-left text-[var(--color-ink-muted)] border-b border-[var(--color-parchment)]">
                        <th className="py-2 font-semibold">Defendant</th>
                        <th className="py-2 font-semibold">Plaintiff</th>
                        <th className="py-2 font-semibold text-right">Damages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topLawsuits.slice(0, 10).map((s, i) => (
                        <tr key={i} className="border-b border-[var(--color-parchment)]">
                          <td className="py-2 text-[var(--color-ink)]">{s.defendant_name}</td>
                          <td className="py-2 text-[var(--color-ink-muted)]">
                            {s.plaintiff_name ?? "—"}
                          </td>
                          <td className="py-2 text-right font-mono">{fmtUsd(s.damages_usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">No lawsuit data.</p>
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-ink)] mb-3">
                Multi-category distress entities
              </h3>
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-3">
                Companies appearing in 2+ negative categories (lawsuit + lien + bankruptcy +
                judgment).
              </p>
              {data.distressEntities.length > 0 ? (
                <ul className="space-y-1.5">
                  {data.distressEntities.slice(0, 12).map((e) => (
                    <li
                      key={e.entity_name}
                      className="flex justify-between gap-3 text-[14px] py-1 border-b border-[var(--color-parchment)]"
                    >
                      <span className="text-[var(--color-ink)] truncate">{e.entity_name}</span>
                      <span className="text-[var(--color-ink-muted)] flex-shrink-0">
                        {e.categories.join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-[var(--color-ink-muted)]">No distress data.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 6. WHY ━━━ */}
      <section>
        <SectionHeader icon={AlertCircle} title="Why — Putting it Together" />
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/85">
          <p className="text-[15px] leading-relaxed text-white/90 mb-4">
            Portland filed{" "}
            <strong className="text-white">
              {Number(w?.newBiz12mo ?? 0).toLocaleString()}
            </strong>{" "}
            new businesses over the last 12 months
            {w && w.newBizPriorYear > 0 ? (
              <>
                ,{" "}
                <strong className={newBizPct >= 0 ? "text-[#9ec8a8]" : "text-[#e8a88f]"}>
                  {newBizPct >= 0 ? "+" : ""}
                  {newBizPct}%
                </strong>{" "}
                versus the prior 12
              </>
            ) : null}
            . Bankruptcies totaled{" "}
            <strong className="text-white">{w?.bankruptcies12mo ?? 0}</strong>; total distress
            filings (bankruptcies + lawsuits + active liens) ran{" "}
            <strong className={distressPct >= 0 ? "text-[#e8a88f]" : "text-[#9ec8a8]"}>
              {distressPct >= 0 ? "+" : ""}
              {distressPct}%
            </strong>{" "}
            year-over-year.
          </p>
          <p className="text-[14px] leading-relaxed text-white/80 mb-4">
            Unemployment sits at{" "}
            <strong className="text-white">
              {data.unemployment.rate != null ? data.unemployment.rate.toFixed(1) + "%" : "—"}
            </strong>{" "}
            ({data.unemployment.period ?? "latest"}). Of{" "}
            <strong className="text-white">
              {Number(w?.reDeals12mo ?? 0).toLocaleString()}
            </strong>{" "}
            real-estate transactions, <strong className="text-white">{entitySharePct}%</strong>{" "}
            went to LLCs, corporations, or trusts — meaning{" "}
            <strong className="text-white">
              {Number(w?.entityBuyers12mo ?? 0).toLocaleString()}
            </strong>{" "}
            Portland properties were absorbed by entities rather than individuals over the past
            year.
          </p>
          {topDistress && (
            <p className="text-[14px] leading-relaxed text-white/80">
              <strong className="text-white">{data.distressEntities.length}</strong> entities
              appear in two or more negative categories (lawsuit + lien + bankruptcy + judgment),
              led by{" "}
              <strong className="text-white">{topDistress.entity_name}</strong> (
              {topDistress.categories.join(", ")}).
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/10">
            <Link
              href="/dashboard/economy"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/90 hover:text-white transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Detailed jobs, wages, and industry breakdown
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/housing"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/90 hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Rent, home-value, and permit-pipeline detail
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* coverage footer */}
      <section>
        <p className="text-[13px] text-[var(--color-ink-muted)] italic">
          Coverage: PBJ public records through {data.meta.pbjAsOf ?? "(no data)"} ·
          QCEW through {data.meta.qcewAsOf ?? "(no data)"} ·
          score recomputed {data.meta.scoreAsOf}.
          {data.composite?.missing.length
            ? ` Score uses ${data.composite.subScores.length} of 6 indicators (missing: ${data.composite.missing.join(", ")}).`
            : ""}
        </p>
      </section>
    </div>
  );
}
