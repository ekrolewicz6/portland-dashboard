"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingDown,
  Zap,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";
import ListingCard from "@/components/real-estate/ListingCard";
import SpaceSearch from "@/components/real-estate/SpaceSearch";
import VacancyMap from "@/components/real-estate/VacancyMap";
import type { Listing, ListingsFilters } from "@/lib/real-estate-types";

export default function SpacesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [filters, setFilters] = useState<ListingsFilters>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "map">("grid");

  const fetchListings = useCallback(async (f: ListingsFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set("search", f.search);
      if (f.space_type) params.set("space_type", f.space_type);
      if (f.neighborhood) params.set("neighborhood", f.neighborhood);
      if (f.min_sqft) params.set("min_sqft", f.min_sqft.toString());
      if (f.max_sqft) params.set("max_sqft", f.max_sqft.toString());
      if (f.max_rent) params.set("max_rent", f.max_rent.toString());
      if (f.popup_available) params.set("popup", "true");
      if (f.graduated_rent) params.set("graduated", "true");
      if (f.condition) params.set("condition", f.condition);
      if (f.sort) params.set("sort", f.sort);

      const res = await fetch(`/api/real-estate/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
      setNeighborhoods(data.neighborhoods || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleFiltersChange = useCallback((newFilters: ListingsFilters) => {
    setFilters(newFilters);
  }, []);

  // Compute stats
  const popupCount = listings.filter(
    (l) => l.pcb_terms.popup_available,
  ).length;
  const graduatedCount = listings.filter(
    (l) => l.pcb_terms.graduated_rent,
  ).length;
  const avgRent =
    listings.length > 0
      ? listings.reduce((s, l) => s + l.asking_rent, 0) / listings.length
      : 0;
  const neighborhoodCount = new Set(listings.map((l) => l.neighborhood)).size;

  return (
    <div className="bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="relative bg-[var(--color-canopy)] text-white overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-sage) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-sage) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--color-ember)]/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--color-ember)]" />
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
                Portland Commons Real Estate
              </span>
            </div>

            <h1 className="font-editorial-normal text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-5">
              Find Your Space
              <br />
              <span className="text-[var(--color-sage)]">in Portland</span>
            </h1>

            <p className="text-white/55 text-[16px] sm:text-[17px] leading-relaxed max-w-xl mb-10">
              Browse commercial spaces across Portland with PCB-exclusive terms
              — graduated rent, pop-up availability, and priority access to
              emerging corridors.
            </p>

            {/* Quick stats */}
            <div className="stat-grid grid-cols-2 sm:grid-cols-4 stat-grid-dark">
              <div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  {listings.length}
                </p>
                <p className="stat-label text-white/40">Active Listings</p>
              </div>
              <div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  {neighborhoodCount}
                </p>
                <p className="stat-label text-white/40">Neighborhoods</p>
              </div>
              <div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  {popupCount}
                </p>
                <p className="stat-label text-white/40">Pop-Up Ready</p>
              </div>
              <div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  ${avgRent.toFixed(0)}
                </p>
                <p className="stat-label text-white/40">Avg $/SF/Yr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PCB Terms callout */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 -mt-6 relative z-10 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="metric-card" style={{ "--accent-color": "var(--color-ember)", cursor: "default" } as React.CSSProperties}>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-[var(--color-ember)]" />
              <h3 className="text-[13px] font-semibold text-[var(--color-canopy)]">
                Pop-Up Program
              </h3>
            </div>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              Test your concept in a real storefront. Short-term leases from 2
              weeks to 6 months at below-market rates.
            </p>
          </div>

          <div className="metric-card" style={{ "--accent-color": "var(--color-canopy)", cursor: "default" } as React.CSSProperties}>
            <div className="flex items-center gap-3 mb-3">
              <TrendingDown className="w-5 h-5 text-[var(--color-canopy)]" />
              <h3 className="text-[13px] font-semibold text-[var(--color-canopy)]">
                Graduated Rent
              </h3>
            </div>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              Start at 40-70% of market rate and scale to full rent over 2-4
              years. Exclusive to PCB-certified businesses.
            </p>
          </div>

          <div className="metric-card" style={{ "--accent-color": "var(--color-river)", cursor: "default" } as React.CSSProperties}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[var(--color-river)]" />
              <h3 className="text-[13px] font-semibold text-[var(--color-canopy)]">
                Priority Zones
              </h3>
            </div>
            <p className="text-[13px] text-[var(--color-ink-light)] leading-relaxed">
              Deeper incentives in corridors like Old Town, MLK, Foster, and St.
              Johns where activation is most needed.
            </p>
          </div>
        </div>
      </section>

      {/* View toggle + Map / Grid */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="section-divider flex-1">
            <h2>Browse Spaces</h2>
          </div>
          <div className="flex items-center bg-white border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                view === "grid"
                  ? "bg-[var(--color-canopy)] text-white"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-4 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                view === "map"
                  ? "bg-[var(--color-canopy)] text-white"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {view === "map" && (
          <div className="mb-8 animate-fade-up">
            <VacancyMap />
          </div>
        )}

        {/* Search + Filters */}
        <SpaceSearch
          neighborhoods={neighborhoods}
          onFiltersChange={handleFiltersChange}
          currentFilters={filters}
          totalResults={listings.length}
        />
      </section>

      {/* Listings Grid */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-[var(--color-canopy)] animate-spin" />
            <span className="ml-3 text-[14px] text-[var(--color-ink-muted)]">
              Loading spaces...
            </span>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-[var(--color-parchment)] flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-8 h-8 text-[var(--color-ink-muted)]" />
            </div>
            <h3 className="font-editorial-normal text-2xl text-[var(--color-canopy)] mb-2">
              No spaces match your criteria
            </h3>
            <p className="text-[14px] text-[var(--color-ink-muted)] mb-6">
              Try adjusting your filters or broadening your search.
            </p>
            <button
              onClick={() => setFilters({})}
              className="px-5 py-2.5 bg-[var(--color-canopy)] text-white text-[13px] font-semibold rounded-sm hover:bg-[var(--color-canopy-mid)] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <div key={listing.id} className="animate-fade-up">
                <ListingCard listing={listing} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && listings.length > 0 && (
          <div className="mt-16">
            <div className="story-callout">
              <p>
                Portland has over 1.2 million square feet of vacant commercial
                space downtown. The PCB program turns vacancy into opportunity
                with graduated rent and pop-up programs.
              </p>
              <cite>Portland Commons Real Estate</cite>
              <div className="mt-6">
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded-sm hover:bg-[var(--color-ember-bright)] transition-colors"
                >
                  Get PCB Certified for Space Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
