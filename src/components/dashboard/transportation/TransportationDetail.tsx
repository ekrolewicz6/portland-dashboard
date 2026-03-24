"use client";

import { useEffect, useState } from "react";
import DataNeeded from "../DataNeeded";
import { Bus, MapPin, Car, Train, Lightbulb } from "lucide-react";

interface RouteByType {
  type: string;
  count: number;
}

interface CommuteModeTrend {
  year: number;
  drivePct: number;
  transitPct: number;
  wfhPct: number;
}

interface SampleRoute {
  routeName: string;
  routeType: string;
  routeColor: string;
}

interface TransportationDetailData {
  dataStatus: string;
  dataAvailable: boolean;
  routesByType: RouteByType[];
  commuteModeTrend: CommuteModeTrend[];
  ridershipTrend: unknown[];
  sampleRoutes: SampleRoute[];
  totalRoutes: number;
  totalStops: number;
}

const COLOR = "#4a7f9e";

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
      <Icon className="w-4 h-4" style={{ color: color ?? COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function TransportationDetail() {
  const [data, setData] = useState<TransportationDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/transportation/detail")
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
          <div key={i} className="bg-[var(--color-parchment)]/50 rounded-sm h-48" />
        ))}
      </div>
    );
  }

  if (!data || !data.dataAvailable) {
    return (
      <div className="space-y-8">
        <p className="text-[var(--color-ink-muted)] text-[14px]">
          Unable to load transportation detail data.
        </p>
        <DataNeeded
          title="TriMet ridership trends"
          description="TriMet publishes monthly ridership reports by mode (bus, MAX, WES, streetcar). Tracking recovery from pandemic lows shows whether transit remains viable for Portlanders."
          actions={[
            { label: "Download TriMet monthly ridership reports", type: "download" },
          ]}
          color={COLOR}
        />
      </div>
    );
  }

  const { routesByType, commuteModeTrend, ridershipTrend, sampleRoutes, totalRoutes, totalStops } =
    data;

  const maxRouteCount =
    routesByType.length > 0 ? Math.max(...routesByType.map((r) => r.count)) : 1;

  // Latest commute data
  const latestCommute =
    commuteModeTrend.length > 0
      ? commuteModeTrend[commuteModeTrend.length - 1]
      : null;

  return (
    <div className="space-y-10">
      {/* 1. Key Stats */}
      <section>
        <SectionHeader icon={Lightbulb} title="Transit Network Overview" color={COLOR} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: COLOR }} />
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
              TriMet Routes
            </p>
            <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
              {totalRoutes}
            </p>
          </div>
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: COLOR }} />
            <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
              Stops
            </p>
            <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
              {totalStops.toLocaleString()}
            </p>
          </div>
          {latestCommute && (
            <>
              <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: COLOR }} />
                <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                  Transit Commute
                </p>
                <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                  {latestCommute.transitPct}%
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  Census {latestCommute.year}
                </p>
              </div>
              <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: COLOR }} />
                <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em] mb-2">
                  Work From Home
                </p>
                <p className="text-[28px] font-mono font-semibold text-[var(--color-ink)] leading-none">
                  {latestCommute.wfhPct}%
                </p>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  Census {latestCommute.year}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 2. Routes by Type */}
      {routesByType.length > 0 && (
        <section>
          <SectionHeader icon={Bus} title="Routes by Type" color={COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-3">
              {routesByType.map((rt, i) => {
                const pct = Math.round((rt.count / maxRouteCount) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[13px] text-[var(--color-ink-light)] w-[120px] text-right flex-shrink-0">
                      {rt.type}
                    </span>
                    <div className="flex-1 h-8 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLOR,
                          opacity: 0.7 + 0.3 * (1 - i / routesByType.length),
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-mono font-semibold text-[var(--color-ink)] w-[60px] text-right">
                      {rt.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Commute Mode Share */}
      {commuteModeTrend.length > 0 && (
        <section>
          <SectionHeader icon={Car} title="Commute Mode Share (Census ACS)" color="#3d7a5a" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Drive Alone</th>
                    <th className="py-2 pr-4">Transit</th>
                    <th className="py-2 pr-4">Work From Home</th>
                  </tr>
                </thead>
                <tbody>
                  {commuteModeTrend.map((row) => (
                    <tr key={row.year} className="border-t border-[var(--color-parchment)]/60">
                      <td className="py-2.5 pr-4 font-mono font-semibold text-[var(--color-ink)]">
                        {row.year}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.drivePct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.transitPct}%
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-ink-light)]">
                        {row.wfhPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {latestCommute && (
              <p className="text-[13px] text-[var(--color-ink-muted)] mt-4 leading-relaxed">
                As of {latestCommute.year}, {latestCommute.drivePct}% of Portland workers drive
                alone, {latestCommute.wfhPct}% work from home, and only{" "}
                {latestCommute.transitPct}% commute by public transit.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 4. Sample Routes (MAX, Streetcar, WES) */}
      {sampleRoutes.length > 0 && (
        <section>
          <SectionHeader icon={Train} title="Rail & Streetcar Lines" color={COLOR} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleRoutes.map((route, i) => (
              <div
                key={i}
                className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-4 flex items-center gap-3"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: route.routeColor
                      ? `#${route.routeColor}`
                      : COLOR,
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-ink)] truncate">
                    {route.routeName}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)]">
                    {route.routeType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Stops count note */}
      {totalStops > 0 && (
        <section>
          <SectionHeader icon={MapPin} title="Stop Coverage" color={COLOR} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              TriMet operates <strong>{totalStops.toLocaleString()}</strong> stops across the
              Portland metro area, serving {totalRoutes} routes. This includes bus stops, MAX
              light rail stations, WES commuter rail stations, and Portland Streetcar stops.
            </p>
          </div>
        </section>
      )}

      {/* 6. Data still needed */}
      {ridershipTrend.length === 0 && (
        <DataNeeded
          title="TriMet ridership trends"
          description="TriMet publishes monthly ridership reports by mode (bus, MAX, WES, streetcar). Tracking recovery from pandemic lows shows whether transit remains viable for Portlanders."
          actions={[
            { label: "Download TriMet monthly ridership reports", type: "download" },
          ]}
          color={COLOR}
        />
      )}

      <DataNeeded
        title="Traffic fatalities (Vision Zero)"
        description="PBOT crash data tracks traffic fatalities and serious injuries against Portland's Vision Zero goal of eliminating traffic deaths. Available via ArcGIS MapServer."
        actions={[
          { label: "Access PBOT crash data via ArcGIS API", type: "api_key" },
        ]}
        color={COLOR}
      />

      <DataNeeded
        title="Bike lane miles"
        description="PBOT bike plan data tracks protected, buffered, and standard bike lane miles built against the city's bicycle network goals."
        actions={[
          { label: "Download PBOT bike plan and infrastructure data", type: "download" },
        ]}
        color={COLOR}
      />
    </div>
  );
}
