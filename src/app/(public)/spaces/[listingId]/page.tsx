"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  DollarSign,
  Clock,
  Zap,
  TrendingDown,
  Mail,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import type { Listing } from "@/lib/real-estate-types";
import { SPACE_TYPE_LABELS, CONDITION_LABELS } from "@/lib/real-estate-types";

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const { listingId } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(
          `/api/real-estate/listings?id=${listingId}`,
        );
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        if (data.error) {
          setError(true);
          return;
        }
        setListing(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[var(--color-canopy)] animate-spin" />
        <span className="ml-3 text-[14px] text-[var(--color-ink-muted)]">
          Loading listing...
        </span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-parchment)] flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8 text-[var(--color-ink-muted)]" />
          </div>
          <h2 className="font-editorial-normal text-2xl text-[var(--color-canopy)] mb-2">
            Listing Not Found
          </h2>
          <p className="text-[14px] text-[var(--color-ink-muted)] mb-6">
            This space may have been leased or is no longer available.
          </p>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-canopy)] text-white text-[13px] font-semibold rounded-sm hover:bg-[var(--color-canopy-mid)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Spaces
          </Link>
        </div>
      </div>
    );
  }

  const hasPCB =
    listing.pcb_terms.popup_available || listing.pcb_terms.graduated_rent;
  const monthlyEstimate = Math.round(
    (listing.asking_rent * listing.sqft) / 12,
  );
  const graduatedMonthly =
    listing.pcb_terms.graduated_rent && listing.pcb_terms.graduated_schedule
      ? Math.round(monthlyEstimate * 0.5) // Year 1 estimate
      : null;

  return (
    <div className="bg-[var(--color-paper)]">
      {/* Demo data banner */}
      <div className="bg-[var(--color-ember)]/10 border-b border-[var(--color-ember)]/20">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-3 flex items-center gap-3">
          <span className="text-[11px] font-semibold text-[var(--color-clay)] bg-[var(--color-ember)]/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
            Preview
          </span>
          <p className="text-[13px] text-[var(--color-clay)]">
            This is a sample listing for demonstration purposes. Real commercial space data is coming soon.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-[var(--color-canopy)] border-b border-white/10">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-2 text-[12px]">
            <Link
              href="/spaces"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Spaces
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/70">{listing.neighborhood}</span>
            <span className="text-white/30">/</span>
            <span className="text-[var(--color-ember)] font-medium">
              {listing.title}
            </span>
          </div>
        </div>
      </div>

      {/* Hero header */}
      <section className="bg-[var(--color-canopy)] text-white pb-12 sm:pb-16">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pt-8">
          <div className="max-w-4xl">
            {/* Type badge */}
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] rounded-sm bg-[var(--color-ember)] text-[var(--color-canopy)]">
                {SPACE_TYPE_LABELS[listing.space_type] || listing.space_type}
              </span>
              {hasPCB && (
                <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] rounded-sm bg-white/10 text-[var(--color-ember)]">
                  PCB Terms Available
                </span>
              )}
            </div>

            <h1 className="font-editorial-normal text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4">
              {listing.title}
            </h1>

            <div className="flex items-center gap-2 text-white/50 text-[15px] mb-8">
              <MapPin className="w-4 h-4" />
              <span>{listing.address}</span>
            </div>

            {/* Key metrics */}
            <div className="stat-grid grid-cols-2 sm:grid-cols-4 stat-grid-dark">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-white/40 mb-2">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  {listing.sqft.toLocaleString()}
                </p>
                <p className="stat-label text-white/40">Square Feet</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-white/40 mb-2">
                  <DollarSign className="w-4 h-4" />
                </div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  ${listing.asking_rent.toFixed(2)}
                </p>
                <p className="stat-label text-white/40">/SF/Year</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-white/40 mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  ${monthlyEstimate.toLocaleString()}
                </p>
                <p className="stat-label text-white/40">Est. Monthly</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-white/40 mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="stat-value text-2xl text-[var(--color-ember)]">
                  {listing.vacancy_duration || "N/A"}
                </p>
                <p className="stat-label text-white/40">Vacant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="detail-panel p-6 sm:p-8" style={{ "--accent-color": "var(--color-canopy)" } as React.CSSProperties}>
              <div className="section-divider">
                <h2>About This Space</h2>
              </div>
              <p className="text-[15px] text-[var(--color-ink-light)] leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Space details grid */}
            <div className="detail-panel p-6 sm:p-8" style={{ "--accent-color": "var(--color-river)" } as React.CSSProperties}>
              <div className="section-divider">
                <h2>Space Details</h2>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <DetailItem
                  label="Space Type"
                  value={
                    SPACE_TYPE_LABELS[listing.space_type] || listing.space_type
                  }
                />
                <DetailItem
                  label="Condition"
                  value={
                    CONDITION_LABELS[listing.condition] || listing.condition
                  }
                />
                <DetailItem label="Floor" value={listing.floor || "Ground"} />
                <DetailItem
                  label="Square Footage"
                  value={`${listing.sqft.toLocaleString()} SF`}
                />
                <DetailItem label="Neighborhood" value={listing.neighborhood} />
                <DetailItem
                  label="Listed"
                  value={new Date(listing.listed_date).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                />
              </dl>
            </div>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="detail-panel p-6 sm:p-8" style={{ "--accent-color": "var(--color-fern)" } as React.CSSProperties}>
                <div className="section-divider">
                  <h2>Features & Amenities</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-[14px] text-[var(--color-ink-light)]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-fern)] shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PCB Terms */}
            {hasPCB && (
              <div className="detail-panel p-6 sm:p-8" style={{ "--accent-color": "var(--color-ember)" } as React.CSSProperties}>
                <div className="section-divider">
                  <h2>PCB Program Terms</h2>
                </div>
                <div className="space-y-5">
                  {listing.pcb_terms.graduated_rent && (
                    <div className="p-4 bg-[var(--color-canopy)]/[0.03] border border-[var(--color-canopy)]/10 rounded-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-[var(--color-canopy)]" />
                        <h4 className="text-[13px] font-semibold text-[var(--color-canopy)] uppercase tracking-wider">
                          Graduated Rent Schedule
                        </h4>
                      </div>
                      <p className="text-[14px] text-[var(--color-ink-light)] leading-relaxed mb-3">
                        {listing.pcb_terms.graduated_schedule ||
                          "Contact for graduated rent details."}
                      </p>
                      {graduatedMonthly && (
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xl font-bold text-[var(--color-canopy)]">
                            ~${graduatedMonthly.toLocaleString()}/mo
                          </span>
                          <span className="text-[12px] text-[var(--color-ink-muted)]">
                            estimated Year 1 rent (PCB certified)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {listing.pcb_terms.popup_available && (
                    <div className="p-4 bg-[var(--color-ember)]/5 border border-[var(--color-ember)]/15 rounded-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-[var(--color-ember)]" />
                        <h4 className="text-[13px] font-semibold text-[var(--color-clay)] uppercase tracking-wider">
                          Pop-Up Available
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[14px]">
                        {listing.pcb_terms.popup_minimum && (
                          <div>
                            <span className="text-[var(--color-ink-muted)] text-[12px] uppercase tracking-wider block">
                              Minimum Term
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              {listing.pcb_terms.popup_minimum}
                            </span>
                          </div>
                        )}
                        {listing.pcb_terms.popup_rate && (
                          <div>
                            <span className="text-[var(--color-ink-muted)] text-[12px] uppercase tracking-wider block">
                              Pop-Up Rate
                            </span>
                            <span className="font-semibold text-[var(--color-ink)]">
                              ${listing.pcb_terms.popup_rate.toLocaleString()}/mo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Contact + Map placeholder */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="detail-panel p-6" style={{ "--accent-color": "var(--color-ember)", position: "sticky", top: "80px" } as React.CSSProperties}>
              <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-4">
                Inquire About This Space
              </h3>

              <div className="space-y-4 mb-6">
                <div className="p-3 bg-[var(--color-paper)] rounded-sm text-center">
                  <p className="font-mono text-2xl font-bold text-[var(--color-canopy)]">
                    ${listing.asking_rent.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Per SF / Year
                  </p>
                </div>

                {graduatedMonthly && (
                  <div className="p-3 bg-[var(--color-canopy)]/[0.03] border border-[var(--color-canopy)]/10 rounded-sm text-center">
                    <p className="text-[10px] font-semibold text-[var(--color-canopy)] uppercase tracking-wider mb-1">
                      With PCB Graduated Rent
                    </p>
                    <p className="font-mono text-xl font-bold text-[var(--color-canopy)]">
                      ~${graduatedMonthly.toLocaleString()}/mo
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]">
                      Year 1 estimate
                    </p>
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-[var(--color-canopy)]/40 text-white/60 text-[14px] font-semibold rounded-sm cursor-default mb-3"
              >
                <Mail className="w-4 h-4" />
                Contact Leasing — Coming Soon
              </div>

              <div
                className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-[var(--color-parchment)] text-[var(--color-ink-muted)] text-[14px] font-semibold rounded-sm cursor-default"
              >
                <Zap className="w-4 h-4" />
                PCB Certification — Coming Soon
              </div>

              <p className="mt-4 text-[12px] text-[var(--color-ink-muted)] leading-relaxed">
                PCB-certified businesses receive priority access and exclusive
                terms including graduated rent and pop-up programs.
              </p>
            </div>

            {/* Mini map placeholder */}
            <div className="detail-panel overflow-hidden" style={{ "--accent-color": "var(--color-river)" } as React.CSSProperties}>
              <div className="bg-[var(--color-canopy)] p-6 text-center">
                <div
                  className="h-48 flex items-center justify-center relative"
                  style={{
                    backgroundImage: `
                      linear-gradient(var(--color-sage) 1px, transparent 1px),
                      linear-gradient(90deg, var(--color-sage) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                    opacity: 0.9,
                  }}
                >
                  <div className="absolute inset-0 bg-[var(--color-canopy)]/80" />
                  <div className="relative z-10 text-center">
                    <MapPin className="w-8 h-8 text-[var(--color-ember)] mx-auto mb-2" />
                    <p className="text-[12px] text-white/50 font-mono uppercase tracking-wider">
                      {listing.neighborhood}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center gap-2 text-[12px] text-[var(--color-ink-muted)]">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  Interactive map coming soon with Mapbox integration
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pb-16">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-canopy)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Spaces
        </Link>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mb-1">
        {label}
      </dt>
      <dd className="text-[14px] text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}
