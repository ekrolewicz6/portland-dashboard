"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import BusinessCard from "@/components/directory/BusinessCard";
import DirectorySearch from "@/components/directory/DirectorySearch";

interface Business {
  id: number;
  registryNumber: string;
  name: string;
  entityType: string;
  registryDate: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface EntityType {
  type: string;
  count: number;
}

interface DirectoryResponse {
  businesses: Business[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  entityTypes: EntityType[];
}

export default function DirectoryPage() {
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (entityType) params.set("entityType", entityType);
      params.set("page", String(page));
      params.set("limit", "24");

      const res = await fetch(`/api/directory?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Directory fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, entityType, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(
    (newSearch: string, newEntityType: string) => {
      setSearch(newSearch);
      setEntityType(newEntityType);
      setPage(1);
    },
    []
  );

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Generate page numbers to display
  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPages - 2) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Hero */}
      <section className="relative bg-[var(--color-canopy)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--color-ember)]" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-ember)]">
              Portland Civic Lab
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl lg:text-5xl xl:text-[3.5rem] italic leading-[1.15] mb-4">
            Portland Business Directory
          </h1>
          <p className="text-[18px] lg:text-[20px] text-white/70 max-w-2xl leading-relaxed">
            Explore the businesses that power Portland&apos;s economy. Real data from the
            Oregon Secretary of State business registry, covering recent registrations
            across all entity types.
          </p>
          {pagination && !loading && (
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-[var(--color-ember)]">
                  {pagination.total.toLocaleString()}
                </span>
                <span className="text-[12px] uppercase tracking-[0.1em] text-white/50">
                  Businesses
                </span>
              </div>
              <div className="w-px h-6 bg-white/15" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-[var(--color-sage)]">
                  {data?.entityTypes?.length ?? 0}
                </span>
                <span className="text-[12px] uppercase tracking-[0.1em] text-white/50">
                  Entity Types
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        {/* Search & Filters */}
        <DirectorySearch
          entityTypes={data?.entityTypes ?? []}
          onSearch={handleSearch}
          initialSearch={search}
          initialEntityType={entityType}
          totalResults={pagination?.total ?? 0}
        />

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-sage)]" />
              <span className="text-[13px] text-[var(--color-ink-muted)] font-medium">
                Loading businesses...
              </span>
            </div>
          ) : data?.businesses && data.businesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.businesses.map((biz, i) => (
                  <BusinessCard
                    key={biz.id}
                    id={biz.id}
                    name={biz.name}
                    entityType={biz.entityType}
                    registryDate={biz.registryDate}
                    address={biz.address}
                    city={biz.city}
                    state={biz.state}
                    zip={biz.zip}
                    index={i}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-sm border border-[var(--color-parchment)] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((pn, i) =>
                    pn === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-[13px] text-[var(--color-ink-muted)]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pn}
                        onClick={() => setPage(pn)}
                        className={`min-w-[36px] h-9 rounded-sm text-[13px] font-medium transition-all duration-200 ${
                          page === pn
                            ? "bg-[var(--color-canopy)] text-white"
                            : "border border-[var(--color-parchment)] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {pn}
                      </button>
                    )
                  )}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-sm border border-[var(--color-parchment)] text-[var(--color-ink-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <div className="w-14 h-14 rounded-full bg-[var(--color-parchment)] flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-[var(--color-ink-muted)]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mb-2">
                No businesses found
              </h3>
              <p className="text-[13px] text-[var(--color-ink-muted)] max-w-md mx-auto">
                Try adjusting your search terms or clearing the entity type filter to
                see more results.
              </p>
            </div>
          )}
        </div>

        {/* Source attribution */}
        <div className="mt-12 pt-6 border-t border-[var(--color-parchment)]">
          <p className="text-[11px] font-mono text-[var(--color-ink-muted)] tracking-wide">
            Source: Oregon Secretary of State Business Registry via data.oregon.gov
            (datasets tckn-sxa6, esjy-u4fc). Data reflects recent business registrations
            in the Portland, OR metropolitan area.
          </p>
        </div>
      </section>
    </div>
  );
}
