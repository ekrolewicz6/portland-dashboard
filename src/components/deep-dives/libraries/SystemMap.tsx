"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { LOCATIONS } from "@/lib/libraries/data";
import { MAP_CENTER, MAP_DEFAULT_ZOOM, TIER_META } from "@/lib/libraries/map";

/**
 * The real thing: an OpenStreetMap-tiled map of Multnomah County with a
 * marker at every MCL location's actual geocoded address, colored by the
 * future model's own layers (two flagships, seventeen neighborhood commons).
 * No API key required — OSM's standard tile server is free for this volume
 * of traffic under its usage policy.
 */
export default function SystemMap() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-4">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">
            Multnomah County, dotted with every location
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {(Object.keys(TIER_META) as Array<keyof typeof TIER_META>).map((tier) => (
              <span
                key={tier}
                className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: TIER_META[tier].color }}
                />
                {TIER_META[tier].label}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[440px] w-full sm:h-[560px]">
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_DEFAULT_ZOOM}
            minZoom={9}
            maxZoom={17}
            scrollWheelZoom={false}
            className="h-full w-full"
            attributionControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            />
            {LOCATIONS.map((loc) => (
              <CircleMarker
                key={loc.id}
                center={[loc.lat, loc.lng]}
                radius={TIER_META[loc.tier].radius}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: TIER_META[loc.tier].color,
                  fillOpacity: 0.92,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} className="mcl-map-tooltip">
                  {loc.name}
                </Tooltip>
                <Popup>
                  <div className="min-w-[180px] font-sans">
                    <p className="text-[15px] font-semibold text-[#1c1917]">{loc.name}</p>
                    <p className="mt-0.5 text-[14px] text-[#44403c]">
                      {loc.address}, {loc.neighborhood}
                    </p>
                    {loc.note ? (
                      <p className="mt-1 text-[13.5px] text-[#78716c]">{loc.note}</p>
                    ) : null}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="border-t border-[var(--color-parchment)] px-5 py-4">
          <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((loc, i) => (
              <li key={loc.id} className="flex items-baseline gap-2 text-[14px] leading-snug text-[var(--color-ink)]">
                <span className="w-4 shrink-0 text-right font-mono text-[12px] tabular-nums text-[var(--color-ink-muted)]">
                  {i + 1}
                </span>
                <span
                  className="mt-[1px] h-1.5 w-1.5 shrink-0 self-center rounded-full"
                  style={{ background: TIER_META[loc.tier].color }}
                />
                <span>
                  <span className="font-medium">{loc.name}</span>
                  <span className="text-[var(--color-ink-muted)]"> · {loc.neighborhood}</span>
                  {loc.note ? <span className="text-[var(--color-ink-muted)]"> — {loc.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-[var(--color-parchment)] pt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            Pan and drag to explore · click a dot for its address · scroll-zoom is off so the map
            doesn&apos;t trap your page scroll — use the +/− controls or double-click to zoom
          </p>
        </div>
      </div>
    </div>
  );
}
