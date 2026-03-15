import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import sql from "@/lib/db-query";
import {
  Building2,
  Calendar,
  MapPin,
  ArrowLeft,
  FileText,
  Hash,
  ExternalLink,
  Globe,
  User,
  Scale,
} from "lucide-react";

/* ── Types ── */

interface BusinessRow {
  id: number;
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  address: string | null;
  address_continued: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  jurisdiction: string | null;
  business_details: string | null;
  associated_name_type: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface SimilarRow {
  id: number;
  business_name: string;
  entity_type: string;
  registry_date: string;
  city: string | null;
  state: string | null;
}

/* ── Helpers ── */

function titleCase(str: string): string {
  const smallWords = new Set([
    "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at",
    "to", "by", "in", "of", "up", "as", "is", "it", "if",
  ]);
  return str
    .toLowerCase()
    .split(" ")
    .map((w, i) => {
      if (i === 0 || !smallWords.has(w)) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }
      return w;
    })
    .join(" ");
}

function formatEntityType(raw: string): string {
  const map: Record<string, string> = {
    "DOMESTIC LIMITED LIABILITY COMPANY": "Limited Liability Company",
    "DOMESTIC BUSINESS CORPORATION": "Business Corporation",
    "DOMESTIC NONPROFIT CORPORATION": "Nonprofit Corporation",
    "DOMESTIC LIMITED PARTNERSHIP": "Limited Partnership",
    "DOMESTIC PROFESSIONAL CORPORATION": "Professional Corporation",
    "FOREIGN LIMITED LIABILITY COMPANY": "Foreign LLC",
    "FOREIGN BUSINESS CORPORATION": "Foreign Business Corporation",
    "FOREIGN NONPROFIT CORPORATION": "Foreign Nonprofit",
    "FOREIGN LIMITED PARTNERSHIP": "Foreign Limited Partnership",
    "ASSUMED BUSINESS NAME": "Assumed Business Name",
    "DOMESTIC GENERAL PARTNERSHIP": "General Partnership",
    "FOREIGN PROFESSIONAL CORPORATION": "Foreign Professional Corporation",
  };
  return map[raw.toUpperCase()] ?? titleCase(raw);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  try {
    // Handle both "1979-04-20" and "1979-04-20 00:00:00-06" formats
    const clean = dateStr.split(" ")[0].split("T")[0];
    const d = new Date(clean + "T12:00:00");
    if (isNaN(d.getTime())) return dateStr.split(" ")[0];
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const clean = dateStr.split(" ")[0].split("T")[0];
    const d = new Date(clean + "T12:00:00");
    if (isNaN(d.getTime())) return clean;
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function googleMapsUrl(address: string | null, city: string | null): string {
  const parts = [address, city, "OR"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}

function entityBadgeColor(entityType: string): {
  bg: string;
  text: string;
  border: string;
} {
  const t = entityType.toUpperCase();
  if (t.includes("DOMESTIC") && t.includes("LIMITED LIABILITY"))
    return {
      bg: "bg-[var(--color-canopy)]/8",
      text: "text-[var(--color-canopy)]",
      border: "border-[var(--color-canopy)]/20",
    };
  if (t.includes("DOMESTIC") && t.includes("BUSINESS CORPORATION"))
    return {
      bg: "bg-[var(--color-river)]/8",
      text: "text-[var(--color-river-deep)]",
      border: "border-[var(--color-river)]/20",
    };
  if (t.includes("FOREIGN"))
    return {
      bg: "bg-[var(--color-violet-mist)]/8",
      text: "text-[var(--color-violet-mist)]",
      border: "border-[var(--color-violet-mist)]/20",
    };
  if (t.includes("NONPROFIT"))
    return {
      bg: "bg-[var(--color-fern)]/8",
      text: "text-[var(--color-fern)]",
      border: "border-[var(--color-fern)]/20",
    };
  if (t.includes("ASSUMED"))
    return {
      bg: "bg-[var(--color-ember)]/8",
      text: "text-[var(--color-clay)]",
      border: "border-[var(--color-ember)]/20",
    };
  return {
    bg: "bg-[var(--color-storm)]/8",
    text: "text-[var(--color-storm)]",
    border: "border-[var(--color-storm)]/20",
  };
}

/* ── Data fetching ── */

interface AssociatedEntry {
  id: number;
  associated_name_type: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  not_of_record_entity: string | null;
  entity_of_record_name: string | null;
  entity_of_record_reg_number: string | null;
  address: string | null;
  address_continued: string | null;
}

async function getBusiness(id: number) {
  const rows = await sql<BusinessRow[]>`
    SELECT id, registry_number, business_name, entity_type,
           registry_date::text, address, address_continued, city, state, zip,
           jurisdiction, business_details, associated_name_type,
           first_name, last_name
    FROM business.oregon_sos_all_active
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function getAllAssociatedEntries(registryNumber: string) {
  return sql<AssociatedEntry[]>`
    SELECT id, associated_name_type, first_name, middle_name, last_name, suffix,
           not_of_record_entity, entity_of_record_name, entity_of_record_reg_number,
           address, address_continued
    FROM business.oregon_sos_all_active
    WHERE registry_number = ${registryNumber}
    ORDER BY
      CASE associated_name_type
        WHEN 'AUTHORIZED REPRESENTATIVE' THEN 1
        WHEN 'PRINCIPAL PLACE OF BUSINESS' THEN 2
        WHEN 'MAILING ADDRESS' THEN 3
        WHEN 'REGISTERED AGENT' THEN 4
        ELSE 5
      END
  `;
}

async function getSimilarBusinesses(businessName: string, entityType: string, excludeId: number) {
  // First try to find businesses with similar names (other locations, related entities)
  const firstWord = businessName.split(/[\s']+/)[0];
  const nameMatches = await sql<SimilarRow[]>`
    SELECT id, business_name, entity_type, registry_date::text, city, state
    FROM business.oregon_sos_all_active
    WHERE business_name ILIKE ${`%${firstWord}%`}
      AND id != ${excludeId}
    ORDER BY
      CASE WHEN business_name ILIKE ${`%${businessName}%`} THEN 0 ELSE 1 END,
      registry_date DESC
    LIMIT 6
  `;

  if (nameMatches.length >= 3) return nameMatches;

  // Fall back to same entity type if not enough name matches
  const typeMatches = await sql<SimilarRow[]>`
    SELECT id, business_name, entity_type, registry_date::text, city, state
    FROM business.oregon_sos_all_active
    WHERE entity_type = ${entityType}
      AND id != ${excludeId}
      AND id NOT IN (${sql(nameMatches.map(r => r.id))})
    ORDER BY registry_date DESC
    LIMIT ${6 - nameMatches.length}
  `;

  return [...nameMatches, ...typeMatches];
}

/* ── SEO Metadata ── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}): Promise<Metadata> {
  const { businessId } = await params;
  const id = parseInt(businessId, 10);
  if (isNaN(id)) return { title: "Business Not Found" };

  const biz = await getBusiness(id);
  if (!biz) return { title: "Business Not Found" };

  const name = titleCase(biz.business_name);
  const location = [biz.city, biz.state].filter(Boolean).join(", ");
  const humanType = formatEntityType(biz.entity_type);

  return {
    title: `${name} | Portland Business Directory`,
    description: `${name} is a ${humanType.toLowerCase()} registered in ${location || "Portland, OR"}. View registration details and similar businesses in the Portland Commons directory.`,
    openGraph: {
      title: `${name} — Portland Business Directory`,
      description: `${humanType} registered in ${location || "Portland, OR"}. Part of the Portland Commons civic platform.`,
      type: "website",
    },
  };
}

/* ── Page Component ── */

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const id = parseInt(businessId, 10);
  if (isNaN(id)) notFound();

  const business = await getBusiness(id);
  if (!business) notFound();

  const [similar, associatedEntries] = await Promise.all([
    getSimilarBusinesses(business.business_name, business.entity_type, id),
    business.registry_number ? getAllAssociatedEntries(business.registry_number) : Promise.resolve([]),
  ]);

  const name = titleCase(business.business_name);
  const humanEntityType = formatEntityType(business.entity_type);
  const badge = entityBadgeColor(business.entity_type);
  const combinedAddress = [business.address, business.address_continued]
    .filter(Boolean)
    .join(", ");
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const fullAddress = [combinedAddress, location, business.zip]
    .filter(Boolean)
    .join(", ");
  const registeredAgent = [business.first_name, business.last_name]
    .filter(Boolean)
    .join(" ") || null;
  const sosUrl = business.business_details || null;
  const mapsUrl = googleMapsUrl(combinedAddress, business.city);
  const jurisdictionLabel = business.jurisdiction === "OR"
    ? "Oregon"
    : business.jurisdiction
      ? titleCase(business.jurisdiction)
      : null;

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* ── Breadcrumb nav ── */}
      <div className="bg-[var(--color-canopy)]">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Directory
          </Link>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative bg-[var(--color-canopy)] text-white pb-14 lg:pb-16 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Entity type badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] rounded-sm bg-white/10 text-[var(--color-ember)] border border-white/10">
              {humanEntityType}
            </span>
          </div>

          {/* Business name */}
          <h1 className="font-editorial-normal text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-5 max-w-3xl">
            {name}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/60">
            {fullAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 text-[var(--color-ember)]" />
                <span>{titleCase(fullAddress)}</span>
              </div>
            )}
            {business.registry_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--color-ember)]" />
                <span>Registered {formatDate(business.registry_date)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left Column: Address & Map ── */}
          <div className="space-y-6">
            <div
              className="detail-panel p-6 lg:p-8"
              style={{ "--accent-color": "var(--color-fern)" } as React.CSSProperties}
            >
              <div className="section-divider mb-6">
                <h2>Location</h2>
              </div>

              {/* Address card */}
              <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white relative overflow-hidden">
                {/* Decorative pin */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--color-ember)]" />
                </div>

                <div className="pr-14">
                  {combinedAddress ? (
                    <>
                      <p className="font-editorial-normal text-xl lg:text-2xl leading-snug mb-1">
                        {titleCase(combinedAddress)}
                      </p>
                      <p className="text-[15px] text-white/60">
                        {[location, business.zip].filter(Boolean).join(" ")}
                      </p>
                    </>
                  ) : (
                    <p className="text-[15px] text-white/50 italic">
                      Address not on file
                    </p>
                  )}
                </div>

                {combinedAddress && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all duration-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* ── Oregon SOS Link ── */}
            {sosUrl && (
              <div
                className="detail-panel p-6"
                style={{ "--accent-color": "var(--color-ember)" } as React.CSSProperties}
              >
                <div className="section-divider mb-4">
                  <h2>Official Record</h2>
                </div>
                <p className="text-[13px] text-[var(--color-ink-muted)] mb-5 leading-relaxed">
                  View the full registration record on the Oregon Secretary of State
                  website, including filing history and status updates.
                </p>
                <a
                  href={sosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 w-full sm:w-auto px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white bg-[var(--color-canopy)] hover:bg-[var(--color-canopy-mid)] rounded-sm transition-all duration-200"
                >
                  <Globe className="w-4 h-4" />
                  View on Oregon Secretary of State
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
                </a>
              </div>
            )}
          </div>

          {/* ── Right Column: Registration Details ── */}
          <div className="space-y-6">
            <div
              className="detail-panel p-6 lg:p-8"
              style={{ "--accent-color": "var(--color-canopy)" } as React.CSSProperties}
            >
              <div className="section-divider mb-6">
                <h2>Registration Details</h2>
              </div>

              <div className="space-y-5">
                {/* Registry Number */}
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Registry Number"
                  value={business.registry_number}
                  mono
                />

                {/* Entity Type */}
                <DetailRow
                  icon={<FileText className="w-4 h-4" />}
                  label="Entity Type"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] rounded-sm border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {humanEntityType}
                  </span>
                </DetailRow>

                {/* Registration Date */}
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Registration Date"
                  value={formatDate(business.registry_date)}
                />

                {/* Jurisdiction */}
                {jurisdictionLabel && (
                  <DetailRow
                    icon={<Scale className="w-4 h-4" />}
                    label="Jurisdiction"
                    value={jurisdictionLabel}
                  />
                )}

                {/* Associated Name Type */}
                {business.associated_name_type && (
                  <DetailRow
                    icon={<Building2 className="w-4 h-4" />}
                    label="Associated Name Type"
                    value={titleCase(business.associated_name_type)}
                  />
                )}

                {/* Registered Agent / Contact */}
                {registeredAgent && (
                  <DetailRow
                    icon={<User className="w-4 h-4" />}
                    label={business.associated_name_type
                      ? titleCase(business.associated_name_type)
                      : "Contact"}
                    value={titleCase(registeredAgent)}
                  />
                )}
              </div>
            </div>

            {/* SOS link (if no sosUrl shown in left column, show nothing extra) */}
            {!sosUrl && (
              <div
                className="detail-panel p-6"
                style={{ "--accent-color": "var(--color-storm)" } as React.CSSProperties}
              >
                <div className="section-divider mb-4">
                  <h2>Official Record</h2>
                </div>
                <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                  No direct SOS link is available for this business. You can search
                  the{" "}
                  <a
                    href="https://sos.oregon.gov/business/pages/find.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-river)] hover:text-[var(--color-river-deep)] underline underline-offset-2"
                  >
                    Oregon Business Registry
                  </a>{" "}
                  directly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── All Associated People & Addresses ── */}
        {associatedEntries.length > 1 && (
          <div className="mt-10">
            <div className="section-divider mb-6">
              <h2>People & Addresses on File</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associatedEntries.map((entry, i) => {
                const personName = [entry.first_name, entry.middle_name, entry.last_name, entry.suffix]
                  .filter(Boolean)
                  .join(" ");
                const entryAddress = [entry.address, entry.address_continued].filter(Boolean).join(", ");
                const typeLabel = entry.associated_name_type ? titleCase(entry.associated_name_type) : "Unknown";
                const isOwner = entry.associated_name_type?.toUpperCase().includes("AUTHORIZED") ||
                  entry.associated_name_type?.toUpperCase().includes("INDIVIDUAL");
                const isAgent = entry.associated_name_type?.toUpperCase().includes("REGISTERED AGENT");

                return (
                  <div
                    key={i}
                    className="detail-panel p-5"
                    style={{ "--accent-color": isOwner ? "var(--color-ember)" : isAgent ? "var(--color-river)" : "var(--color-sage)" } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm ${
                        isOwner
                          ? "bg-[var(--color-ember)]/10 text-[var(--color-clay)]"
                          : isAgent
                            ? "bg-[var(--color-river)]/10 text-[var(--color-river-deep)]"
                            : "bg-[var(--color-parchment)] text-[var(--color-ink-muted)]"
                      }`}>
                        {typeLabel}
                      </span>
                    </div>

                    {personName && (
                      <p className="text-[16px] font-semibold text-[var(--color-ink)] mb-1">
                        <User className="w-4 h-4 inline mr-2 text-[var(--color-sage)]" />
                        {titleCase(personName)}
                      </p>
                    )}

                    {entry.entity_of_record_name && (
                      <p className="text-[14px] text-[var(--color-ink-light)] mb-1">
                        <Building2 className="w-4 h-4 inline mr-2 text-[var(--color-sage)]" />
                        {titleCase(entry.entity_of_record_name)}
                        {entry.entity_of_record_reg_number && (
                          <span className="text-[12px] font-mono text-[var(--color-ink-muted)] ml-2">
                            #{entry.entity_of_record_reg_number}
                          </span>
                        )}
                      </p>
                    )}

                    {entry.not_of_record_entity && (
                      <p className="text-[13px] text-[var(--color-ink-muted)]">
                        {titleCase(entry.not_of_record_entity)}
                      </p>
                    )}

                    {entryAddress && (
                      <p className="text-[13px] text-[var(--color-ink-muted)] mt-2">
                        <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-[var(--color-sage)]" />
                        {titleCase(entryAddress)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Similar Businesses ── */}
        {similar.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <div className="section-divider mb-6">
              <h2>Related Businesses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map((s) => {
                const simBadge = entityBadgeColor(s.entity_type);
                const simLocation = [s.city, s.state].filter(Boolean).join(", ");
                return (
                  <Link
                    key={s.id}
                    href={`/directory/${s.id}`}
                    className="metric-card group block"
                    style={
                      { "--accent-color": "var(--color-fern)" } as React.CSSProperties
                    }
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-sm bg-[var(--color-canopy)]/6 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-[var(--color-canopy)]" />
                        </div>
                        <h3 className="font-semibold text-[14px] text-[var(--color-ink)] leading-snug truncate group-hover:text-[var(--color-canopy)] transition-colors duration-200">
                          {titleCase(s.business_name)}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] rounded-sm border ${simBadge.bg} ${simBadge.text} ${simBadge.border}`}
                      >
                        {formatEntityType(s.entity_type)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {simLocation && (
                        <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-muted)]">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-[var(--color-sage)]" />
                          <span className="truncate">{titleCase(simLocation)}</span>
                        </div>
                      )}
                      {s.registry_date && (
                        <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-muted)]">
                          <Calendar className="w-3 h-3 flex-shrink-0 text-[var(--color-sage)]" />
                          <span>Registered {formatShortDate(s.registry_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-parchment)] flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                        View Profile
                      </span>
                      <span className="text-[11px] font-medium text-[var(--color-canopy)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`/directory?entityType=${encodeURIComponent(business.entity_type)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--color-canopy)] border border-[var(--color-parchment)] hover:border-[var(--color-sage)] rounded-sm transition-all duration-200"
              >
                View all {humanEntityType} businesses
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Source Attribution ── */}
        <div className="mt-12 pt-6 border-t border-[var(--color-parchment)]">
          <p className="text-[11px] font-mono text-[var(--color-ink-muted)] tracking-wide">
            Source: Oregon Secretary of State Business Registry via data.oregon.gov.
            Registry #{business.registry_number}. Data reflects public business
            registration records for the Portland, OR metropolitan area.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ── Detail Row Sub-component ── */

function DetailRow({
  icon,
  label,
  value,
  mono,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-sm bg-[var(--color-parchment)] flex items-center justify-center flex-shrink-0 text-[var(--color-sage)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] mb-0.5">
          {label}
        </div>
        {children ?? (
          <div
            className={`text-[14px] text-[var(--color-ink)] ${mono ? "font-mono" : ""}`}
          >
            {value || "Not available"}
          </div>
        )}
      </div>
    </div>
  );
}
