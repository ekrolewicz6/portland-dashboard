"use client";

import Link from "next/link";
import {
  MapPin,
  Maximize2,
  DollarSign,
  Clock,
  Zap,
  TrendingDown,
} from "lucide-react";
import type { Listing } from "@/lib/real-estate-types";
import { SPACE_TYPE_LABELS } from "@/lib/real-estate-types";

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

const SPACE_TYPE_COLORS: Record<string, string> = {
  retail: "bg-[var(--color-river)] text-white",
  office: "bg-[var(--color-canopy)] text-white",
  restaurant: "bg-[var(--color-ember)] text-[var(--color-canopy)]",
  industrial: "bg-[var(--color-storm)] text-white",
  flex: "bg-[var(--color-violet-mist)] text-white",
};

const CONDITION_DOTS: Record<string, string> = {
  "move-in ready": "bg-green-500",
  "gallery ready": "bg-green-500",
  "built-out stall": "bg-green-500",
  "white box": "bg-yellow-500",
  "previous restaurant": "bg-yellow-500",
  "partially renovated": "bg-orange-500",
  "industrial shell": "bg-orange-500",
  "needs renovation": "bg-red-400",
};

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const hasPCB =
    listing.pcb_terms.popup_available || listing.pcb_terms.graduated_rent;

  return (
    <Link
      href={`/spaces/${listing.id}`}
      className="group block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <article className="metric-card h-full flex flex-col" style={{ cursor: "pointer" } as React.CSSProperties}>
        {/* Top: Type badge + condition */}
        <div className="flex items-start justify-between mb-4">
          <span
            className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] rounded-sm ${SPACE_TYPE_COLORS[listing.space_type] || "bg-[var(--color-parchment)]"}`}
          >
            {SPACE_TYPE_LABELS[listing.space_type] || listing.space_type}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${CONDITION_DOTS[listing.condition] || "bg-gray-400"}`}
            />
            <span className="text-[11px] text-[var(--color-ink-muted)] capitalize">
              {listing.condition}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-editorial-normal text-xl leading-snug text-[var(--color-canopy)] group-hover:text-[var(--color-canopy-light)] transition-colors mb-2">
          {listing.title}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 mb-4">
          <MapPin className="w-3.5 h-3.5 text-[var(--color-ink-muted)] mt-0.5 shrink-0" />
          <span className="text-[13px] text-[var(--color-ink-light)] leading-snug">
            {listing.address}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-[var(--color-parchment)] mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[var(--color-ink-muted)] mb-0.5">
              <Maximize2 className="w-3 h-3" />
            </div>
            <p className="font-mono text-[15px] font-bold text-[var(--color-ink)]">
              {listing.sqft.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
              Sq Ft
            </p>
          </div>
          <div className="text-center border-x border-[var(--color-parchment)]">
            <div className="flex items-center justify-center gap-1 text-[var(--color-ink-muted)] mb-0.5">
              <DollarSign className="w-3 h-3" />
            </div>
            <p className="font-mono text-[15px] font-bold text-[var(--color-ink)]">
              ${listing.asking_rent.toFixed(0)}
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
              /SF/Yr
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[var(--color-ink-muted)] mb-0.5">
              <Clock className="w-3 h-3" />
            </div>
            <p className="font-mono text-[15px] font-bold text-[var(--color-ink)]">
              {listing.vacancy_duration || "N/A"}
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
              Vacant
            </p>
          </div>
        </div>

        {/* PCB Terms badges */}
        {hasPCB && (
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.pcb_terms.popup_available && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-ember)]/10 text-[var(--color-clay)] border border-[var(--color-ember)]/20 rounded-sm">
                <Zap className="w-3 h-3" />
                Pop-Up Ready
              </span>
            )}
            {listing.pcb_terms.graduated_rent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--color-canopy)]/5 text-[var(--color-canopy)] border border-[var(--color-canopy)]/15 rounded-sm">
                <TrendingDown className="w-3 h-3" />
                Graduated Rent
              </span>
            )}
          </div>
        )}

        {/* Neighborhood tag */}
        <div className="mt-auto pt-2">
          <span className="text-[11px] font-medium text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
            {listing.neighborhood}
          </span>
        </div>
      </article>
    </Link>
  );
}
