"use client";

import { useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Zap,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import type { ListingsFilters, SpaceType } from "@/lib/real-estate-types";
import { SPACE_TYPE_LABELS } from "@/lib/real-estate-types";

interface SpaceSearchProps {
  neighborhoods: string[];
  onFiltersChange: (filters: ListingsFilters) => void;
  currentFilters: ListingsFilters;
  totalResults: number;
}

const SORT_OPTIONS: { value: NonNullable<ListingsFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "rent_asc", label: "Rent: Low to High" },
  { value: "rent_desc", label: "Rent: High to Low" },
  { value: "sqft_asc", label: "Size: Small to Large" },
  { value: "sqft_desc", label: "Size: Large to Small" },
];

const CONDITIONS = [
  "move-in ready",
  "white box",
  "previous restaurant",
  "industrial shell",
  "partially renovated",
  "needs renovation",
  "gallery ready",
  "built-out stall",
];

export default function SpaceSearch({
  neighborhoods,
  onFiltersChange,
  currentFilters,
  totalResults,
}: SpaceSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

  const updateFilter = useCallback(
    (key: keyof ListingsFilters, value: unknown) => {
      const next = { ...currentFilters, [key]: value || undefined };
      // Remove falsy values
      Object.keys(next).forEach((k) => {
        const v = next[k as keyof ListingsFilters];
        if (v === undefined || v === "" || v === false) {
          delete next[k as keyof ListingsFilters];
        }
      });
      onFiltersChange(next);
    },
    [currentFilters, onFiltersChange],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(currentFilters).filter(
    (k) => k !== "sort" && currentFilters[k as keyof ListingsFilters],
  ).length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by neighborhood, address, or space type..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)] focus:ring-1 focus:ring-[var(--color-canopy)] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 border rounded-sm text-[13px] font-semibold transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-[var(--color-canopy)] text-white border-[var(--color-canopy)]"
                : "bg-white text-[var(--color-ink-light)] border-[var(--color-parchment)] hover:border-[var(--color-sage)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[var(--color-ember)] text-[var(--color-canopy)] text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="detail-panel p-6 animate-slide-down" style={{ "--accent-color": "var(--color-ember)" } as React.CSSProperties}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Space Type */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Space Type
              </label>
              <div className="relative">
                <select
                  value={currentFilters.space_type || ""}
                  onChange={(e) =>
                    updateFilter("space_type", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] appearance-none focus:outline-none focus:border-[var(--color-canopy)] pr-8"
                >
                  <option value="">All Types</option>
                  {(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map((t) => (
                    <option key={t} value={t}>
                      {SPACE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Neighborhood
              </label>
              <div className="relative">
                <select
                  value={currentFilters.neighborhood || ""}
                  onChange={(e) =>
                    updateFilter("neighborhood", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] appearance-none focus:outline-none focus:border-[var(--color-canopy)] pr-8"
                >
                  <option value="">All Neighborhoods</option>
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)] pointer-events-none" />
              </div>
            </div>

            {/* Max Rent */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Max Rent ($/SF/Yr)
              </label>
              <input
                type="number"
                value={currentFilters.max_rent || ""}
                onChange={(e) =>
                  updateFilter(
                    "max_rent",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="e.g. 25"
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)]"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Condition
              </label>
              <div className="relative">
                <select
                  value={currentFilters.condition || ""}
                  onChange={(e) =>
                    updateFilter("condition", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] appearance-none focus:outline-none focus:border-[var(--color-canopy)] pr-8"
                >
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Size range + PCB toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Min Sq Ft
              </label>
              <input
                type="number"
                value={currentFilters.min_sqft || ""}
                onChange={(e) =>
                  updateFilter(
                    "min_sqft",
                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                  )
                }
                placeholder="e.g. 1000"
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-2">
                Max Sq Ft
              </label>
              <input
                type="number"
                value={currentFilters.max_sqft || ""}
                onChange={(e) =>
                  updateFilter(
                    "max_sqft",
                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                  )
                }
                placeholder="e.g. 5000"
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)]"
              />
            </div>

            {/* PCB Toggles */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    "popup_available",
                    !currentFilters.popup_available,
                  )
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-[13px] font-semibold transition-all w-full justify-center ${
                  currentFilters.popup_available
                    ? "bg-[var(--color-ember)]/10 text-[var(--color-clay)] border-[var(--color-ember)]/30"
                    : "bg-white text-[var(--color-ink-muted)] border-[var(--color-parchment)] hover:border-[var(--color-sage)]"
                }`}
              >
                <Zap className="w-4 h-4" />
                Pop-Up Available
              </button>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    "graduated_rent",
                    !currentFilters.graduated_rent,
                  )
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-[13px] font-semibold transition-all w-full justify-center ${
                  currentFilters.graduated_rent
                    ? "bg-[var(--color-canopy)]/5 text-[var(--color-canopy)] border-[var(--color-canopy)]/20"
                    : "bg-white text-[var(--color-ink-muted)] border-[var(--color-parchment)] hover:border-[var(--color-sage)]"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Graduated Rent
              </button>
            </div>
          </div>

          {/* Clear + result count */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--color-parchment)]">
            <button
              type="button"
              onClick={clearFilters}
              className="text-[13px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              Clear all filters
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-[13px] font-semibold text-[var(--color-canopy)] hover:text-[var(--color-canopy-light)] transition-colors"
            >
              Show {totalResults} {totalResults === 1 ? "result" : "results"}
            </button>
          </div>
        </div>
      )}

      {/* Sort + result count bar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--color-ink-muted)]">
          <span className="font-mono font-semibold text-[var(--color-ink)]">
            {totalResults}
          </span>{" "}
          {totalResults === 1 ? "space" : "spaces"} available
          {activeFilterCount > 0 && (
            <>
              {" "}
              <span className="text-[var(--color-ink-muted)]">
                ({activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} applied)
              </span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.08em]">
            Sort
          </label>
          <div className="relative">
            <select
              value={currentFilters.sort || "newest"}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="px-3 py-1.5 bg-white border border-[var(--color-parchment)] rounded-sm text-[13px] text-[var(--color-ink)] appearance-none focus:outline-none focus:border-[var(--color-canopy)] pr-7"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-ink-muted)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
