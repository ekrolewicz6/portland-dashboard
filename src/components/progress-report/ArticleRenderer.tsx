"use client";

import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, Users } from "lucide-react";
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
            Sources: Portland Commons Dashboard, peer city permit data (2025-2026)
          </p>
        </div>
      )}
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
