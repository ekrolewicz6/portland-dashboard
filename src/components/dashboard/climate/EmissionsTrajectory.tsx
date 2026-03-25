"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

type EmissionsActual = {
  year: number;
  totalMtco2e: number | null;
  electricityMtco2e: number | null;
  buildingsMtco2e: number | null;
  transportationMtco2e: number | null;
  wasteMtco2e: number | null;
  industryMtco2e: number | null;
  otherMtco2e: number | null;
  populationThousands: number | null;
  perCapitaMtco2e: number | null;
};

type EmissionsSummary = {
  latestYear: number;
  latestTotalMtco2e: number;
  baseline1990Mtco2e: number;
  reductionFromBaseline: number;
  target2030Mtco2e: number;
  target2050Mtco2e: number;
  gapTo2030: number | null;
  currentTrajectoryNote: string;
  sectorSummary: {
    electricity: number | null;
    buildings: number | null;
    transportation: number | null;
    waste: number | null;
    industry: number | null;
    other: number | null;
  } | null;
};

const SECTOR_COLORS = {
  transportation: "#c84040",
  buildings: "#c8956c",
  electricity: "#f0b429",
  industry: "#9a5020",
  waste: "#6a7f5a",
  other: "#78716c",
};

const SECTOR_LABELS = {
  transportation: "Transportation",
  buildings: "Buildings",
  electricity: "Electricity",
  industry: "Industry",
  waste: "Waste",
  other: "Other",
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4">
      <div className="text-[10px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[24px] font-bold font-mono" style={{ color: color ?? "var(--color-ink)" }}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-[var(--color-parchment)] rounded-sm p-3 shadow-lg text-[12px]">
      <p className="font-bold text-[var(--color-ink)] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-semibold">{Number(p.value).toFixed(2)}M MTCO₂e</span>
        </div>
      ))}
    </div>
  );
};

export default function EmissionsTrajectory() {
  const [actuals, setActuals] = useState<EmissionsActual[]>([]);
  const [summary, setSummary] = useState<EmissionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"trajectory" | "sectors" | "percapita">("trajectory");

  useEffect(() => {
    fetch("/api/dashboard/climate/emissions")
      .then((r) => r.json())
      .then((d) => {
        setActuals(d.actuals ?? []);
        setSummary(d.summary ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-[var(--color-parchment)]/50 rounded-sm" />
        <div className="h-72 bg-[var(--color-parchment)]/50 rounded-sm" />
      </div>
    );
  }

  if (!summary) return <p className="text-[var(--color-ink-muted)] text-[14px]">Emissions data unavailable.</p>;

  const gap = summary.gapTo2030 ?? (summary.latestTotalMtco2e - summary.target2030Mtco2e);
  const gapPct = Math.round((gap / summary.latestTotalMtco2e) * 100);

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label={`${summary.latestYear} Emissions`}
          value={`${summary.latestTotalMtco2e.toFixed(1)}M`}
          sub="MTCO₂e — Multnomah County"
          color="var(--color-ink)"
        />
        <StatCard
          label="Reduction from 1990"
          value={`${summary.reductionFromBaseline}%`}
          sub={`Was ${summary.baseline1990Mtco2e.toFixed(1)}M in 1990`}
          color="#2d6a4f"
        />
        <StatCard
          label="2030 Target"
          value={`${summary.target2030Mtco2e.toFixed(1)}M`}
          sub="50% below 1990 baseline"
          color="#2d4a6e"
        />
        <StatCard
          label="Gap to 2030 Goal"
          value={`${gap.toFixed(1)}M`}
          sub={`Must cut ${gapPct}% more by 2030`}
          color="#7a2020"
        />
      </div>

      {/* Critical trajectory note */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm">
        <p className="text-[12px] text-amber-800 leading-relaxed">
          <strong>The pace problem:</strong> {summary.currentTrajectoryNote}
        </p>
      </div>

      {/* Chart tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-[var(--color-parchment)] rounded-sm">
        {(["trajectory", "sectors", "percapita"] as const).map((chart) => (
          <button
            key={chart}
            onClick={() => setActiveChart(chart)}
            className="flex-1 text-[12px] font-medium py-1.5 px-3 rounded-sm transition-all"
            style={{
              backgroundColor: activeChart === chart ? "white" : "transparent",
              color: activeChart === chart ? "var(--color-ink)" : "var(--color-ink-muted)",
              boxShadow: activeChart === chart ? "0 1px 3px rgba(0,0,0,0.1)" : undefined,
            }}
          >
            {chart === "trajectory" ? "Emissions vs. Targets" : chart === "sectors" ? "By Sector" : "Per-Capita"}
          </button>
        ))}
      </div>

      {/* Trajectory chart */}
      {activeChart === "trajectory" && (
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
            Multnomah County Total Emissions vs. Climate Targets (Million MTCO₂e)
          </h4>
          <p className="text-[11px] text-[var(--color-ink-muted)] mb-4">
            Actual emissions 1990–{summary.latestYear} with 2030 (50% below 1990) and 2050 (net-zero) targets.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={actuals} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe5da" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, 12]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Target lines */}
              <ReferenceLine
                y={summary.target2030Mtco2e}
                stroke="#2d4a6e"
                strokeDasharray="6 3"
                label={{ value: "2030 Goal", position: "insideTopRight", fontSize: 10, fill: "#2d4a6e" }}
              />
              <ReferenceLine
                y={summary.target2050Mtco2e}
                stroke="#1a5c3a"
                strokeDasharray="6 3"
                label={{ value: "2050 Net Zero", position: "insideTopRight", fontSize: 10, fill: "#1a5c3a" }}
              />
              <Line
                type="monotone"
                dataKey="totalMtco2e"
                stroke="#c84040"
                strokeWidth={2.5}
                dot={{ fill: "#c84040", r: 3 }}
                name="Total Emissions"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[10px] text-[var(--color-ink-muted)]">
            Source: BPS Climate & Energy Dashboard — Multnomah County Community GHG Inventory. 2023 data is latest available.
          </p>
        </div>
      )}

      {/* Sector breakdown */}
      {activeChart === "sectors" && (
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
            Emissions by Sector Over Time (Million MTCO₂e)
          </h4>
          <p className="text-[11px] text-[var(--color-ink-muted)] mb-4">
            Stacked area showing which sectors are driving reductions. Transportation remains the largest source.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={actuals} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe5da" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {(["other", "waste", "industry", "electricity", "buildings", "transportation"] as const).map((sector) => (
                <Area
                  key={sector}
                  type="monotone"
                  dataKey={`${sector}Mtco2e`}
                  stackId="1"
                  stroke={SECTOR_COLORS[sector]}
                  fill={SECTOR_COLORS[sector]}
                  fillOpacity={0.8}
                  name={SECTOR_LABELS[sector]}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          {/* Sector summary for latest year */}
          {summary.sectorSummary && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.entries(summary.sectorSummary) as [keyof typeof SECTOR_COLORS, number | null][]).map(([sector, val]) => (
                <div key={sector} className="text-center">
                  <div className="w-3 h-3 rounded-sm mx-auto mb-1" style={{ backgroundColor: SECTOR_COLORS[sector] }} />
                  <div className="text-[10px] text-[var(--color-ink-muted)]">{SECTOR_LABELS[sector]}</div>
                  <div className="text-[12px] font-mono font-semibold">{val != null ? `${val.toFixed(2)}M` : "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-capita */}
      {activeChart === "percapita" && (
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">
            Per-Capita Emissions Trend
          </h4>
          <p className="text-[11px] text-[var(--color-ink-muted)] mb-4">
            MTCO₂e per person. Per-capita reductions account for population growth and provide a fairer basis for comparison.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={actuals.filter((a) => a.perCapitaMtco2e != null)}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe5da" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, 20]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} MTCO₂e/person`, "Per-Capita"]}
                labelFormatter={(l) => `${l}`}
              />
              <Line
                type="monotone"
                dataKey="perCapitaMtco2e"
                stroke="#2d6a4f"
                strokeWidth={2.5}
                dot={{ fill: "#2d6a4f", r: 3 }}
                name="Per-Capita Emissions"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[10px] text-[var(--color-ink-muted)]">
            Per-capita calculated from total county emissions divided by Multnomah County population estimate.
          </p>
        </div>
      )}
    </div>
  );
}
