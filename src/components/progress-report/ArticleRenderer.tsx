"use client";

import Link from "next/link";
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, Users, Leaf } from "lucide-react";
import type { ReportSection } from "@/app/api/progress-report/[slug]/route";

// ── Section type icon mapping ──
function SectionIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "data-summary":
      return <BarChart3 className={iconClass} />;
    case "article":
      return <TrendingUp className={iconClass} />;
    case "profile":
      return <Users className={iconClass} />;
    case "recommendation":
      return <Lightbulb className={iconClass} />;
    case "climate-summary":
      return <Leaf className={iconClass} />;
    default:
      return <AlertTriangle className={iconClass} />;
  }
}

function sectionTypeLabel(type: string): string {
  switch (type) {
    case "data-summary":
      return "Dashboard Summary";
    case "article":
      return "Deep Dive";
    case "profile":
      return "Business Profile";
    case "recommendation":
      return "Policy Watch";
    case "climate-summary":
      return "Climate Analysis";
    default:
      return "Section";
  }
}

function sectionAccentColor(type: string): string {
  switch (type) {
    case "data-summary":
      return "var(--color-river)";
    case "article":
      return "var(--color-clay)";
    case "profile":
      return "var(--color-fern)";
    case "recommendation":
      return "var(--color-violet-mist)";
    case "climate-summary":
      return "#2d6a4f";
    default:
      return "var(--color-canopy)";
  }
}

// ── Markdown-like rendering ──
// Renders markdown-style content to JSX with editorial styling.
// Supports: ## headings, **bold**, *italic*, > blockquotes, - lists, 1. lists

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // H2 heading
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={key++}
          className="text-2xl sm:text-[1.65rem] leading-snug mt-12 mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }

    // H3 heading
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={key++}
          className="text-xl leading-snug mt-8 mb-3 font-semibold"
        >
          {renderInline(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }

    // Blockquote — pull quote styling
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <aside key={key++} className="story-callout my-10">
          <p>{renderInline(quoteLines.join(" "))}</p>
        </aside>,
      );
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul
          key={key++}
          className="my-6 space-y-2.5 pl-0 list-none"
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-3 text-[var(--color-ink-light)] leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ember)] mt-2.5 flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="my-6 space-y-4 pl-0 list-none counter-reset-list">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4 text-[var(--color-ink-light)] leading-relaxed">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-canopy)] text-white text-[12px] font-mono font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={key++}
        className="text-[var(--color-ink-light)] leading-[1.8] mb-6"
      >
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return elements;
}

// Inline rendering: **bold**, *italic*
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    let earliest: { type: "bold" | "italic"; match: RegExpMatchArray } | null =
      null;

    if (boldMatch?.index !== undefined) {
      earliest = { type: "bold", match: boldMatch };
    }
    if (
      italicMatch?.index !== undefined &&
      (!earliest || italicMatch.index < earliest.match.index!)
    ) {
      earliest = { type: "italic", match: italicMatch };
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    // Text before match
    if (earliest.match.index! > 0) {
      parts.push(remaining.slice(0, earliest.match.index!));
    }

    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} className="font-semibold text-[var(--color-ink)]">
          {earliest.match[1]}
        </strong>,
      );
    } else {
      parts.push(
        <em key={key++} className="font-[var(--font-display)] not-italic" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          {earliest.match[1]}
        </em>,
      );
    }

    remaining = remaining.slice(
      earliest.match.index! + earliest.match[0].length,
    );
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ── Data Callout Cards ──
interface DataCalloutProps {
  label: string;
  value: string;
  detail?: string;
  color?: string;
}

function DataCallout({ label, value, detail, color }: DataCalloutProps) {
  return (
    <div className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6 overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color || "var(--color-canopy)" }}
      />
      <p className="text-[11px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-1.5">
        {label}
      </p>
      <p className="font-mono font-bold text-2xl sm:text-3xl text-[var(--color-ink)] tracking-tight leading-none mb-1">
        {value}
      </p>
      {detail && (
        <p className="text-[12px] text-[var(--color-ink-muted)] leading-snug mt-2">
          {detail}
        </p>
      )}
    </div>
  );
}

// ── Peer City Comparison Bar ──
function PeerCityBar({
  city,
  avgDays,
  maxDays,
  isPortland,
}: {
  city: string;
  avgDays: number;
  maxDays: number;
  isPortland: boolean;
}) {
  const pct = Math.round((avgDays / maxDays) * 100);
  return (
    <div className="flex items-center gap-4">
      <span
        className={`w-20 text-right text-[13px] font-mono ${isPortland ? "font-bold text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"}`}
      >
        {city}
      </span>
      <div className="flex-1 h-7 bg-[var(--color-parchment)] rounded-sm overflow-hidden relative">
        <div
          className="h-full rounded-sm transition-all duration-1000"
          style={{
            width: `${pct}%`,
            backgroundColor: isPortland
              ? "var(--color-clay)"
              : "var(--color-fern)",
          }}
        />
        <span
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-mono font-bold ${pct > 85 ? "text-white" : "text-[var(--color-ink)]"}`}
        >
          {avgDays} days
        </span>
      </div>
    </div>
  );
}

// ── Data Summary Section ──
function DataSummarySection({ section }: { section: ReportSection }) {
  const data = section.dataSnapshot as {
    permits?: number;
    businesses?: number;
    crimesPerMonth?: number;
    avgProcessingDays?: number;
    medianProcessingDays?: number;
    permitBacklog?: number;
    climateActionsTracked?: number;
    climateAchieved?: number;
    climateDelayed?: number;
    emissionsReductionPct?: number;
  } | null;

  return (
    <>
      {/* Data callout grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
          {data.permits && (
            <DataCallout
              label="Building Permits"
              value={data.permits.toLocaleString()}
              detail="Total permits tracked in system"
              color="var(--color-river)"
            />
          )}
          {data.businesses && (
            <DataCallout
              label="Active Businesses"
              value={data.businesses.toLocaleString()}
              detail="Oregon Secretary of State registrations"
              color="var(--color-fern)"
            />
          )}
          {data.crimesPerMonth && (
            <DataCallout
              label="Crimes / Month"
              value={data.crimesPerMonth.toLocaleString()}
              detail="Average monthly reported incidents"
              color="var(--color-clay)"
            />
          )}
          {data.avgProcessingDays ? (
            <DataCallout
              label="Avg. Permit Processing"
              value={`${data.avgProcessingDays} days`}
              detail="Application to issuance"
              color="var(--color-rose-hip)"
            />
          ) : null}
          {data.medianProcessingDays ? (
            <DataCallout
              label="Median Processing"
              value={`${data.medianProcessingDays} days`}
              detail="Half of permits processed faster"
              color="var(--color-violet-mist)"
            />
          ) : null}
          {data.permitBacklog ? (
            <DataCallout
              label="Permits in Queue"
              value={data.permitBacklog.toLocaleString()}
              detail="Under review or submitted"
              color="var(--color-ember)"
            />
          ) : null}
          {data.climateActionsTracked != null && (
            <DataCallout
              label="Climate Actions Tracked"
              value={data.climateActionsTracked.toLocaleString()}
              detail="Climate Emergency Workplan 2022-2025"
              color="#2d6a4f"
            />
          )}
          {data.climateAchieved != null && (
            <DataCallout
              label="Actions Achieved"
              value={data.climateAchieved.toLocaleString()}
              detail={`of ${data.climateActionsTracked ?? "—"} total workplan actions`}
              color="#4caf82"
            />
          )}
          {data.climateDelayed != null && (
            <DataCallout
              label="Actions Delayed"
              value={data.climateDelayed.toLocaleString()}
              detail="Behind schedule as of latest progress report"
              color="#c84040"
            />
          )}
          {data.emissionsReductionPct != null && (
            <DataCallout
              label="Emissions vs. 1990"
              value={`−${data.emissionsReductionPct}%`}
              detail="Multnomah County GHG inventory — 2030 goal is −50%"
              color="#2d4a6e"
            />
          )}
        </div>
      )}

      {/* Article text */}
      <div className="article-content">{renderContent(section.content)}</div>
    </>
  );
}

// ── Deep Dive Section with Peer Comparison ──
function ArticleSection({ section }: { section: ReportSection }) {
  const data = section.dataSnapshot as {
    peerCities?: { city: string; avgDays: number }[];
    permits?: number;
    avgProcessingDays?: number;
    medianProcessingDays?: number;
  } | null;

  const peerCities = data?.peerCities;
  const maxDays = peerCities
    ? Math.max(...peerCities.map((c) => c.avgDays))
    : 150;

  return (
    <>
      <div className="article-content">{renderContent(section.content)}</div>

      {/* Peer city comparison chart */}
      {peerCities && peerCities.length > 0 && (
        <div className="my-10 p-6 sm:p-8 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm">
          <p className="text-[11px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-5">
            Average Permit Processing Time — Peer City Comparison
          </p>
          <div className="space-y-3">
            {peerCities.map((city) => (
              <PeerCityBar
                key={city.city}
                city={city.city}
                avgDays={city.avgDays}
                maxDays={maxDays * 1.1}
                isPortland={city.city === "Portland"}
              />
            ))}
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] mt-4 font-mono">
            Sources: Portland Civic Lab Dashboard, peer city permit data (2025-2026)
          </p>
        </div>
      )}
    </>
  );
}

// ── Climate Section ──
function ClimateSection({ section }: { section: ReportSection }) {
  const data = section.dataSnapshot as {
    totalActions?: number;
    achievedActions?: number;
    ongoingActions?: number;
    delayedActions?: number;
    reductionFromBaseline?: number;
    latestEmissions?: number;
    latestYear?: number;
    target2030?: number;
    gap?: number;
    totalInterestDiverted?: number;
    bureauAllocations?: number;
    communityGrants?: number;
  } | null;

  function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  }

  const total = data?.totalActions ?? 0;
  const achieved = data?.achievedActions ?? 0;
  const ongoing = data?.ongoingActions ?? 0;
  const delayed = data?.delayedActions ?? 0;
  const achievedPct = total > 0 ? Math.round((achieved / total) * 100) : 0;
  const ongoingPct = total > 0 ? Math.round((ongoing / total) * 100) : 0;
  const delayedPct = total > 0 ? Math.round((delayed / total) * 100) : 0;

  const totalPcef = (data?.bureauAllocations ?? 0) + (data?.communityGrants ?? 0);
  const bureauPct = totalPcef > 0 ? Math.round(((data?.bureauAllocations ?? 0) / totalPcef) * 100) : 0;

  return (
    <>
      {data && (
        <div className="my-8 space-y-6">
          {/* Workplan status cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DataCallout label="Actions Tracked" value={total.toString()} detail="Climate Emergency Workplan" color="#2d6a4f" />
            <DataCallout label="Achieved" value={`${achieved} (${achievedPct}%)`} detail="Completed as of latest report" color="#4caf82" />
            <DataCallout label="Ongoing" value={`${ongoing} (${ongoingPct}%)`} detail="Active and on schedule" color="#2d4a6e" />
            <DataCallout label="Delayed" value={`${delayed} (${delayedPct}%)`} detail="Behind schedule" color="#c84040" />
          </div>

          {/* Emissions stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DataCallout
              label={`${data.latestYear ?? 2023} Emissions`}
              value={`${(data.latestEmissions ?? 7.7).toFixed(1)}M`}
              detail="MTCO₂e — Multnomah County"
              color="var(--color-ink)"
            />
            <DataCallout
              label="vs. 1990 Baseline"
              value={`−${data.reductionFromBaseline ?? 26}%`}
              detail="1990 baseline: 10.4M MTCO₂e"
              color="#2d6a4f"
            />
            <DataCallout
              label="2030 Target"
              value={`${(data.target2030 ?? 5.2).toFixed(1)}M`}
              detail="50% below 1990 — required by 2030"
              color="#2d4a6e"
            />
            <DataCallout
              label="Gap to 2030 Goal"
              value={`${(data.gap ?? 2.5).toFixed(1)}M`}
              detail="Additional tons to cut in 4 years"
              color="#c84040"
            />
          </div>

          {/* PCEF bar */}
          {totalPcef > 0 && (
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <p className="text-[11px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-3">
                PCEF Allocation — {fmt(totalPcef)} Total (FY 21-22 through FY 24-25)
              </p>
              <div className="h-7 bg-[var(--color-parchment)] rounded-sm overflow-hidden mb-2">
                <div className="flex h-full">
                  <div
                    className="h-full flex items-center justify-end pr-2"
                    style={{ width: `${bureauPct}%`, backgroundColor: "#2d4a6e" }}
                  >
                    {bureauPct > 15 && <span className="text-[10px] font-bold text-white">{bureauPct}% bureaus</span>}
                  </div>
                  <div
                    className="h-full flex items-center pl-2"
                    style={{ width: `${100 - bureauPct}%`, backgroundColor: "#4a7a3a" }}
                  >
                    {100 - bureauPct > 15 && <span className="text-[10px] font-bold text-white">{100 - bureauPct}% community</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] text-[var(--color-ink-muted)]">
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: "#2d4a6e" }} />{fmt(data.bureauAllocations ?? 0)} to six city bureaus</span>
                <span><span className="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" style={{ backgroundColor: "#4a7a3a" }} />{fmt(data.communityGrants ?? 0)} in community grants</span>
              </div>
            </div>
          )}

          {/* PCEF interest diversion */}
          {(data.totalInterestDiverted ?? 0) > 0 && (
            <div className="border border-red-200 bg-red-50 rounded-sm p-5">
              <p className="text-[11px] font-mono font-semibold text-red-700 uppercase tracking-[0.15em] mb-1">
                PCEF Interest Directed to General Fund
              </p>
              <p className="text-3xl font-bold font-mono text-red-800 mb-1">
                {fmt(data.totalInterestDiverted ?? 0)}
              </p>
              <p className="text-[12px] text-red-700">
                The audit found the City has not been transparent enough about PCEF funding flows. FY 21-22 through FY 24-25.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="article-content">{renderContent(section.content)}</div>

      <div className="mt-8 p-5 bg-[var(--color-canopy)] rounded-sm text-white">
        <p className="text-[11px] font-mono font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-2">
          Full Interactive Data
        </p>
        <p className="text-[13px] text-white/70 mb-3">
          The Climate Accountability Platform provides a filterable workplan tracker, bureau scorecard, PCEF allocation breakdown, and emissions trajectory chart with sector detail.
        </p>
        <Link
          href="/dashboard/climate"
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-[var(--color-ember)] text-[var(--color-canopy)] rounded-sm hover:opacity-90 transition-opacity"
        >
          Explore Climate Dashboard →
        </Link>
      </div>
    </>
  );
}

// ── Main ArticleRenderer ──
export default function ArticleRenderer({
  sections,
}: {
  sections: ReportSection[];
}) {
  return (
    <div className="space-y-0">
      {sections.map((section, idx) => {
        const accentColor = sectionAccentColor(section.sectionType);

        return (
          <section
            key={section.id}
            id={`section-${section.sectionOrder}`}
            className="scroll-mt-20"
          >
            {/* Section divider (except first) */}
            {idx > 0 && (
              <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
                <div className="flex items-center gap-4">
                  <div
                    className="w-8 h-px"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="flex-1 h-px bg-[var(--color-parchment)]" />
                </div>
              </div>
            )}

            {/* Section header */}
            <div className="max-w-3xl mx-auto px-5 sm:px-8">
              {/* Section type label */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono font-semibold uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                    color: accentColor,
                  }}
                >
                  <SectionIcon type={section.sectionType} />
                  {sectionTypeLabel(section.sectionType)}
                </span>
                <span className="text-[11px] font-mono text-[var(--color-ink-muted)]">
                  Section {section.sectionOrder}
                </span>
              </div>

              {/* Section title */}
              <h2
                className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.15] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section.title}
              </h2>

              {/* Subtitle */}
              {section.subtitle && (
                <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed mb-8 max-w-2xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* Section body */}
            <div className="max-w-3xl mx-auto px-5 sm:px-8">
              {section.sectionType === "data-summary" ? (
                <DataSummarySection section={section} />
              ) : section.sectionType === "article" ? (
                <ArticleSection section={section} />
              ) : section.sectionType === "climate-summary" ? (
                <ClimateSection section={section} />
              ) : (
                <div className="article-content">
                  {renderContent(section.content)}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
