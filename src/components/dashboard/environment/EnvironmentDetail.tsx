"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/charts/TrendChart";
import {
  CloudSun,
  Wind,
} from "lucide-react";

const ENV_COLOR = "#5a8a6a";

interface AqiReading {
  pollutant: string;
  aqi: number;
  category: string;
  date: string;
  hour: number;
  reporting_area: string;
}

interface ForecastReading {
  pollutant: string;
  aqi: number;
  category: string;
  date_forecast: string;
  action_day: boolean;
  discussion: string | null;
}

interface EnvironmentDetailData {
  currentAqi: AqiReading[];
  forecast: ForecastReading[];
  aqiTrend: { date: string; value: number }[];
  dataStatus: string;
  lastSynced: string | null;
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
      <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
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
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/environment/detail", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const hasAqi = data?.dataStatus === "live" && (data?.currentAqi?.length ?? 0) > 0;
  const hasForecast = (data?.forecast?.length ?? 0) > 0;
  const primaryReading =
    data?.currentAqi?.find((r) => r.pollutant === "PM2.5") ?? data?.currentAqi?.[0];

  return (
    <div className="space-y-10">
      {/* AQI section — always shown if data available */}
      {!loading && hasAqi && primaryReading && (
        <section>
          <SectionHeader icon={Wind} title="Current Air Quality" color={ENV_COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[14px] font-mono font-semibold text-[#3d7a5a] bg-[#3d7a5a]/10 px-2 py-0.5 rounded-sm">
                LIVE
              </span>
              <span className="text-[14px] text-[var(--color-ink-muted)]">
                EPA AirNow — {primaryReading.reporting_area}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data!.currentAqi.map((reading) => (
                <div
                  key={reading.pollutant}
                  className="rounded-sm p-4 text-center"
                  style={{ backgroundColor: aqiBgColor(reading.aqi) }}
                >
                  <p
                    className="text-[32px] lg:text-[36px] 2xl:text-[40px] font-mono font-bold"
                    style={{ color: aqiColor(reading.aqi) }}
                  >
                    {reading.aqi}
                  </p>
                  <p className="text-[14px] font-semibold text-[var(--color-ink)] mt-1">
                    {reading.pollutant}
                  </p>
                  <span
                    className="inline-block mt-2 text-[12px] font-semibold px-2 py-0.5 rounded-sm"
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
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.airnow.gov/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">EPA &middot; AirNow</a>
          </p>
        </section>
      )}

      {/* Forecast section */}
      {!loading && hasForecast && data && (
        <section>
          <SectionHeader icon={CloudSun} title="AQI Forecast" color={ENV_COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-4">
              Tomorrow&apos;s forecast from EPA AirNow
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.forecast.map((fc) => (
                <div
                  key={`forecast-${fc.pollutant}`}
                  className="rounded-sm p-4 text-center"
                  style={{ backgroundColor: aqiBgColor(fc.aqi) }}
                >
                  <p
                    className="text-[28px] lg:text-[32px] font-mono font-bold"
                    style={{ color: aqiColor(fc.aqi) }}
                  >
                    {fc.aqi}
                  </p>
                  <p className="text-[14px] font-semibold text-[var(--color-ink)] mt-1">
                    {fc.pollutant}
                  </p>
                  <span
                    className="inline-block mt-2 text-[12px] font-semibold px-2 py-0.5 rounded-sm"
                    style={{
                      color: aqiColor(fc.aqi),
                      backgroundColor: aqiBgColor(fc.aqi),
                    }}
                  >
                    {fc.category}
                  </span>
                  {fc.action_day && (
                    <p className="mt-2 text-[11px] font-semibold text-[#9f1239]">
                      ACTION DAY
                    </p>
                  )}
                </div>
              ))}
            </div>
            {data.forecast.some((fc) => fc.discussion) && (
              <p className="mt-4 text-[13px] text-[var(--color-ink-muted)] italic">
                {data.forecast.find((fc) => fc.discussion)?.discussion}
              </p>
            )}
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.airnow.gov/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">EPA &middot; AirNow</a>
          </p>
        </section>
      )}

      {/* AQI trend */}
      {!loading && data && data.aqiTrend.length > 1 && (
        <section>
          <SectionHeader icon={Wind} title="PM2.5 AQI Trend (Daily Average)" color={ENV_COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[15px] text-[var(--color-ink-muted)] mb-4">
              Daily average PM2.5 Air Quality Index — lower values indicate cleaner air.
            </p>
            <TrendChart data={data.aqiTrend} color={ENV_COLOR} height={280} />
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.airnow.gov/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">EPA &middot; AirNow</a>
          </p>
        </section>
      )}
    </div>
  );
}
