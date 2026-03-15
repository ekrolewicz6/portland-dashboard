"use client";

import { MapPin, Layers, Eye } from "lucide-react";

/**
 * VacancyMap — styled placeholder for the map-based discovery view.
 *
 * We don't have a Mapbox token yet, so this renders an editorial placeholder
 * that explains what the map will show once integrated.
 */
export default function VacancyMap() {
  return (
    <div className="relative overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-canopy)]">
      {/* Simulated map grid */}
      <div className="relative h-[420px] lg:h-[500px]">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-sage) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-sage) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Simulated Portland neighborhoods as abstract shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* River line */}
          <div
            className="absolute h-full w-[2px] opacity-30"
            style={{
              left: "45%",
              background:
                "linear-gradient(to bottom, transparent, var(--color-river), var(--color-river), transparent)",
              transform: "rotate(8deg)",
            }}
          />

          {/* Neighborhood labels */}
          <div className="absolute top-[15%] left-[20%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            NW Portland
          </div>
          <div className="absolute top-[25%] left-[30%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Pearl
          </div>
          <div className="absolute top-[40%] left-[35%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Downtown
          </div>
          <div className="absolute top-[30%] left-[58%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Lloyd
          </div>
          <div className="absolute top-[50%] left-[55%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Central Eastside
          </div>
          <div className="absolute top-[60%] left-[60%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Hawthorne
          </div>
          <div className="absolute top-[20%] left-[65%] text-[10px] font-mono text-[var(--color-sage)] opacity-60 uppercase tracking-widest">
            Alberta
          </div>

          {/* Sample vacancy dots */}
          {VACANCY_DOTS.map((dot, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            >
              {/* Outer pulse */}
              <div
                className="absolute -inset-2 rounded-full opacity-20"
                style={{
                  backgroundColor: dot.color,
                  animation: `pulseGlow 3s ease-in-out ${i * 0.4}s infinite`,
                }}
              />
              {/* Dot */}
              <div
                className="w-3 h-3 rounded-full border-2 border-white/20 relative z-10"
                style={{ backgroundColor: dot.color }}
              />
            </div>
          ))}
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-lg">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
              <MapPin className="w-7 h-7 text-[var(--color-ember)]" />
            </div>
            <h3 className="font-editorial-normal text-2xl text-white mb-3">
              Map-Based Discovery
            </h3>
            <p className="text-[14px] text-white/50 leading-relaxed mb-6">
              Interactive map with available spaces, vacancy heatmap, transit
              overlays, and PCB priority zones. Coming soon with Mapbox
              integration.
            </p>
          </div>
        </div>
      </div>

      {/* Legend bar */}
      <div className="border-t border-white/10 px-5 py-3 flex flex-wrap items-center gap-6 bg-[var(--color-canopy-mid)]">
        <div className="flex items-center gap-4">
          <Layers className="w-3.5 h-3.5 text-[var(--color-sage)]" />
          <span className="text-[11px] font-semibold text-[var(--color-sage)] uppercase tracking-[0.1em]">
            Map Layers
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <LegendItem color="#22c55e" label="Available Listing" />
          <LegendItem color="#f59e0b" label="Pop-Up Ready" />
          <LegendItem color="#9ca3af" label="Suspected Vacancy" />
          <LegendItem color="#3b82f6" label="Transit Stop" />
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-white/40">
          <Eye className="w-3 h-3" />
          <span className="text-[10px] font-mono uppercase tracking-wider">
            6,399 TriMet stops loaded
          </span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full border border-white/20"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] text-white/50">{label}</span>
    </div>
  );
}

// Simulated vacancy dots for the map placeholder
const VACANCY_DOTS = [
  { x: 33, y: 35, color: "#22c55e" }, // Downtown - available
  { x: 38, y: 42, color: "#22c55e" }, // Downtown
  { x: 30, y: 25, color: "#f59e0b" }, // Pearl - popup
  { x: 35, y: 22, color: "#22c55e" }, // Pearl
  { x: 60, y: 48, color: "#22c55e" }, // Central Eastside
  { x: 65, y: 55, color: "#9ca3af" }, // Hawthorne - suspected
  { x: 22, y: 30, color: "#f59e0b" }, // NW - popup
  { x: 55, y: 25, color: "#9ca3af" }, // Lloyd - suspected
  { x: 68, y: 22, color: "#22c55e" }, // Alberta
  { x: 58, y: 58, color: "#9ca3af" }, // Division - suspected
  { x: 40, y: 50, color: "#3b82f6" }, // Transit stop
  { x: 50, y: 35, color: "#3b82f6" }, // Transit stop
  { x: 25, y: 45, color: "#9ca3af" }, // Suspected vacancy
  { x: 72, y: 40, color: "#22c55e" }, // Belmont
  { x: 45, y: 60, color: "#9ca3af" }, // S Waterfront suspected
];
