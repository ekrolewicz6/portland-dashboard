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
} from "lucide-react";

interface BusinessRow {
  id: number;
  registry_number: string;
  business_name: string;
  entity_type: string;
  registry_date: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

interface SimilarRow {
  id: number;
  business_name: string;
  entity_type: string;
  registry_date: string;
}

interface EntityCountRow {
  count: number;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

async function getBusiness(id: number) {
  const rows = await sql<BusinessRow[]>`
    SELECT id, registry_number, business_name, entity_type,
           registry_date::text, address, city, state, zip,
           raw_data, created_at::text
    FROM business.oregon_sos_new_monthly
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function getSimilarBusinesses(entityType: string, excludeId: number) {
  return sql<SimilarRow[]>`
    SELECT id, business_name, entity_type, registry_date::text
    FROM business.oregon_sos_new_monthly
    WHERE entity_type = ${entityType}
      AND id != ${excludeId}
    ORDER BY registry_date DESC
    LIMIT 6
  `;
}

async function getEntityTypeCount(entityType: string) {
  const rows = await sql<EntityCountRow[]>`
    SELECT count FROM business.oregon_sos_entity_types
    WHERE entity_type = ${entityType}
    LIMIT 1
  `;
  return rows[0]?.count ?? 0;
}

// SEO: dynamic metadata
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

  return {
    title: `${name} | Portland Business Directory`,
    description: `${name} is a ${biz.entity_type.toLowerCase()} registered in ${location || "Portland, OR"}. View details, registration info, and similar businesses in the Portland Commons directory.`,
    openGraph: {
      title: `${name} — Portland Business Directory`,
      description: `${biz.entity_type} registered in ${location || "Portland, OR"}. Part of the Portland Commons civic platform.`,
      type: "website",
    },
  };
}

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

  const [similar, entityCount] = await Promise.all([
    getSimilarBusinesses(business.entity_type, id),
    getEntityTypeCount(business.entity_type),
  ]);

  const name = titleCase(business.business_name);
  const location = [business.city, business.state].filter(Boolean).join(", ");
  const fullAddress = [business.address, location, business.zip]
    .filter(Boolean)
    .join(" ");

  // Extract raw data fields of interest
  const rawData = business.raw_data ?? {};
  const sosUrl =
    typeof rawData.business_details === "object" &&
    rawData.business_details !== null &&
    "url" in rawData.business_details
      ? (rawData.business_details as { url: string }).url
      : null;

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Breadcrumb & back */}
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

      {/* Hero */}
      <section className="bg-[var(--color-canopy)] text-white pb-12">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Building2 className="w-7 h-7 text-[var(--color-ember)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] rounded-sm bg-white/10 text-[var(--color-ember)] border border-white/10">
                  {business.entity_type}
                </span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl italic leading-[1.15] mb-3">
                {name}
              </h1>
              {fullAddress && (
                <div className="flex items-center gap-2 text-[14px] text-white/60">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{titleCase(fullAddress)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Registration Details */}
            <div className="detail-panel p-6" style={{ "--accent-color": "var(--color-canopy)" } as React.CSSProperties}>
              <div className="section-divider mb-6">
                <h2>Registration Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] mb-1.5">
                    Registry Number
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    <span className="font-mono text-[14px] text-[var(--color-ink)]">
                      {business.registry_number}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] mb-1.5">
                    Registration Date
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    <span className="text-[14px] text-[var(--color-ink)]">
                      {formatDate(business.registry_date)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] mb-1.5">
                    Entity Type
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    <span className="text-[14px] text-[var(--color-ink)]">
                      {business.entity_type}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)] mb-1.5">
                    Location
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                    <span className="text-[14px] text-[var(--color-ink)]">
                      {fullAddress ? titleCase(fullAddress) : "Portland, OR"}
                    </span>
                  </div>
                </div>
              </div>

              {sosUrl && (
                <div className="mt-6 pt-4 border-t border-[var(--color-parchment)]">
                  <a
                    href={sosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-canopy)] bg-[var(--color-canopy)]/6 hover:bg-[var(--color-canopy)]/12 rounded-sm transition-all duration-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Oregon SOS
                  </a>
                </div>
              )}
            </div>

            {/* Commons Credit placeholder */}
            <div className="detail-panel p-6" style={{ "--accent-color": "var(--color-ember)" } as React.CSSProperties}>
              <div className="section-divider mb-4">
                <h2>Portland Commons</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="stat-grid grid-cols-2 flex-1">
                  <div>
                    <div className="stat-value text-2xl text-[var(--color-ember)]">--</div>
                    <div className="stat-label">Commons Credits</div>
                  </div>
                  <div>
                    <div className="stat-value text-2xl text-[var(--color-fern)]">--</div>
                    <div className="stat-label">Tier</div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[12px] text-[var(--color-ink-muted)] italic">
                Commons Credit balance and tier badges will be available when businesses
                join the Portland Commons platform.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entity type stats */}
            <div className="detail-panel p-5" style={{ "--accent-color": "var(--color-river)" } as React.CSSProperties}>
              <div className="section-divider mb-4">
                <h3>Entity Type Overview</h3>
              </div>
              <div className="text-center py-4">
                <div className="stat-value text-3xl text-[var(--color-river)]">
                  {entityCount.toLocaleString()}
                </div>
                <div className="stat-label">
                  {business.entity_type} in Portland
                </div>
              </div>
            </div>

            {/* Similar Businesses */}
            {similar.length > 0 && (
              <div className="detail-panel p-5" style={{ "--accent-color": "var(--color-fern)" } as React.CSSProperties}>
                <div className="section-divider mb-4">
                  <h3>Recently Registered</h3>
                </div>
                <div className="space-y-0">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/directory/${s.id}`}
                      className="milestone group"
                    >
                      <div className="milestone-dot bg-[var(--color-fern)] border-[var(--color-fern)]" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-canopy)] truncate transition-colors">
                          {titleCase(s.business_name)}
                        </div>
                        <div className="text-[11px] text-[var(--color-ink-muted)] font-mono">
                          {s.registry_date
                            ? new Date(s.registry_date).toLocaleDateString(
                                "en-US",
                                { month: "short", year: "numeric" }
                              )
                            : ""}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-parchment)]">
                  <Link
                    href={`/directory?entityType=${encodeURIComponent(business.entity_type)}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-canopy)] hover:text-[var(--color-fern)] transition-colors"
                  >
                    View all {business.entity_type} →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Source attribution */}
        <div className="mt-12 pt-6 border-t border-[var(--color-parchment)]">
          <p className="text-[11px] font-mono text-[var(--color-ink-muted)] tracking-wide">
            Source: Oregon Secretary of State Business Registry via data.oregon.gov.
            Registry #{business.registry_number}. Data reflects public business registration
            records for the Portland, OR metropolitan area.
          </p>
        </div>
      </section>
    </div>
  );
}
