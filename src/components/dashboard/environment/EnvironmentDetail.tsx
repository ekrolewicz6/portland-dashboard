"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "../DataNeeded";
import { Wind } from "lucide-react";

const ENV_COLOR = "#5a8a6a";

interface AqiReading {
  pollutant: string;
  aqi: number;
  category: string;
  date: string;
  hour: number;
  reporting_area: string;
}

interface EnvironmentDetailData {
  currentAqi: AqiReading[];
  aqiTrend: { date: string; value: number }[];
  dataStatus: string;
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#3d7a5a";
  if (aqi <= 100) return "#c8956c";
  if (aqi <= 150) return "#d97706";
  if (aqi <= 200) return "#b85c3a";
  if (aqi <= 300) return "#9f1239";
  return "#7f1d1d";
}

function aqiBgColor(aqi: number): string {
  if (aqi <= 50) return "#3d7a5a15";
  if (aqi <= 100) return "#c8956c15";
  if (aqi <= 150) return "#d9770615";
  if (aqi <= 200) return "#b85c3a15";
  if (aqi <= 300) return "#9f123915";
  return "#7f1d1d15";
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
      <Icon className="w-4 h-4" style={{ color: color ?? ENV_COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function EnvironmentDetail() {
  const [data, setData] = useState<EnvironmentDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/environment/detail")
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
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-64" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-[var(--color-ink-muted)] text-[14px]">Unable to load environment detail data.</p>;
  }

  const hasAqi = data.dataStatus === "live" && data.currentAqi.length > 0;

  // Find the primary reading (PM2.5 or first available)
  const primaryReading =
    data.currentAqi.find((r) => r.pollutant === "PM2.5") ?? data.currentAqi[0];

  return (
    <div className="space-y-10">
      {/* 1. Current AQI */}
      {hasAqi && primaryReading && (
        <section>
          <SectionHeader icon={Wind} title="Current Air Quality" color={ENV_COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[12px] font-mono font-semibold text-[#3d7a5a] bg-[#3d7a5a]/10 px-2 py-0.5 rounded-sm">
                LIVE
              </span>
              <span className="text-[12px] text-[var(--color-ink-muted)]">
                EPA AirNow — {primaryReading.reporting_area}
              </span>
            </div>

            {/* AQI cards per pollutant */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.currentAqi.map((reading) => (
                <div
                  key={reading.pollutant}
                  className="rounded-sm p-4 text-center"
                  style={{ backgroundColor: aqiBgColor(reading.aqi) }}
                >
                  <p
                    className="text-[32px] font-mono font-bold"
                    style={{ color: aqiColor(reading.aqi) }}
                  >
                    {reading.aqi}
                  </p>
                  <p className="text-[12px] font-semibold text-[var(--color-ink)] mt-1">
                    {reading.pollutant}
                  </p>
                  <span
                    className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                    style={{
                      color: aqiColor(reading.aqi),
                      backgroundColor: aqiBgColor(reading.aqi),
                    }}
                  >
                    {reading.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. AQI Trend Chart */}
      {data.aqiTrend.length > 1 && (
        <section>
          <SectionHeader icon={Wind} title="PM2.5 AQI Trend (Daily Average)" color={ENV_COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
              Daily average PM2.5 Air Quality Index — lower values indicate cleaner air.
            </p>
            <TrendChart data={data.aqiTrend} color={ENV_COLOR} height={280} />
          </div>
        </section>
      )}

      {/* 3. Data still needed */}
      <DataNeeded
        title="Greenhouse gas emissions"
        description="Portland's Bureau of Planning & Sustainability publishes a community-wide greenhouse gas inventory as part of the Climate Action Plan, tracking progress toward reduction targets."
        actions={[
          { label: "Download BPS Climate Action Plan emissions inventory", type: "download" },
        ]}
        color={ENV_COLOR}
      />
      <DataNeeded
        title="Tree canopy coverage"
        description="Portland Urban Forestry tracks tree canopy coverage by neighborhood, a key indicator of urban heat island mitigation and environmental equity."
        actions={[
          { label: "Download Portland Urban Forestry canopy data", type: "download" },
        ]}
        color={ENV_COLOR}
      />
      <DataNeeded
        title="Waste diversion rate"
        description="Metro regional government tracks the percentage of waste diverted from landfills through recycling and composting programs across the Portland metro area."
        actions={[
          { label: "Download Metro waste diversion data", type: "download" },
        ]}
        color={ENV_COLOR}
      />
    </div>
  );
}
