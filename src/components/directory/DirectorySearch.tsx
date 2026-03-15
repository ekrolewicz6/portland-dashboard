"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";

interface EntityType {
  type: string;
  count: number;
}

interface DirectorySearchProps {
  entityTypes: EntityType[];
  onSearch: (search: string, entityType: string) => void;
  initialSearch?: string;
  initialEntityType?: string;
  totalResults: number;
}

export default function DirectorySearch({
  entityTypes,
  onSearch,
  initialSearch = "",
  initialEntityType = "",
  totalResults,
}: DirectorySearchProps) {
  const [search, setSearch] = useState(initialSearch);
  const [entityType, setEntityType] = useState(initialEntityType);
  const [filterOpen, setFilterOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (newSearch: string, newEntityType: string) => {
      onSearch(newSearch, newEntityType);
    },
    [onSearch]
  );

  // Debounced text search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(search, entityType);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, entityType, handleSearch]);

  const clearFilters = () => {
    setSearch("");
    setEntityType("");
    handleSearch("", "");
  };

  const hasFilters = search !== "" || entityType !== "";

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-ink-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Portland businesses by name..."
          className="w-full pl-12 pr-4 py-3.5 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/60 focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)]/30 transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Entity type filter button */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] border rounded-sm transition-all duration-200 ${
            entityType
              ? "bg-[var(--color-canopy)] text-white border-[var(--color-canopy)]"
              : "bg-[var(--color-paper-warm)] text-[var(--color-ink-muted)] border-[var(--color-parchment)] hover:border-[var(--color-sage)]"
          }`}
        >
          <Filter className="w-3 h-3" />
          {entityType || "Entity Type"}
        </button>

        {/* Active filter count + clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-clay)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}

        {/* Results count */}
        <span className="ml-auto text-[12px] font-mono text-[var(--color-ink-muted)]">
          {totalResults.toLocaleString()} {totalResults === 1 ? "business" : "businesses"}
        </span>
      </div>

      {/* Entity type dropdown */}
      {filterOpen && (
        <div className="detail-panel p-4 animate-slide-down" style={{ "--accent-color": "var(--color-canopy)" } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              Filter by Entity Type
            </h4>
            <button
              onClick={() => setFilterOpen(false)}
              className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setEntityType("");
                setFilterOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-sm text-[13px] transition-all duration-150 ${
                entityType === ""
                  ? "bg-[var(--color-canopy)] text-white font-medium"
                  : "hover:bg-[var(--color-parchment)]/60 text-[var(--color-ink-light)]"
              }`}
            >
              All Types
            </button>
            {entityTypes.map((et) => (
              <button
                key={et.type}
                onClick={() => {
                  setEntityType(et.type);
                  setFilterOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-sm text-[13px] transition-all duration-150 flex items-center justify-between ${
                  entityType === et.type
                    ? "bg-[var(--color-canopy)] text-white font-medium"
                    : "hover:bg-[var(--color-parchment)]/60 text-[var(--color-ink-light)]"
                }`}
              >
                <span className="truncate">{et.type}</span>
                <span
                  className={`text-[10px] font-mono ml-2 flex-shrink-0 ${
                    entityType === et.type ? "text-white/70" : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {et.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
