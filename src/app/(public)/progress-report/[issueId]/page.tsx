import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2, BookOpen } from "lucide-react";
import ArticleRenderer from "@/components/progress-report/ArticleRenderer";
import type { FullReport } from "@/app/api/progress-report/[slug]/route";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getQuarterLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.getMonth();
  const year = d.getFullYear();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
}

async function fetchReport(
  baseUrl: string,
  slug: string,
): Promise<FullReport | null> {
  try {
    const res = await fetch(`${baseUrl}/api/progress-report/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.report ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issueId: string }>;
}): Promise<Metadata> {
  const { issueId } = await params;
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const report = await fetchReport(baseUrl, issueId);

  if (!report) {
    return { title: "Report Not Found | Portland Commons" };
  }

  return {
    title: `${report.title} | Portland Commons`,
    description: report.summary ?? "Portland Progress Report",
    openGraph: {
      title: report.title,
      description:
        report.summary ?? "Portland Progress Report — quarterly data analysis",
      type: "article",
    },
  };
}

export default async function ProgressReportPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const report = await fetchReport(baseUrl, issueId);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Report header */}
      <header className="bg-[var(--color-canopy)] text-white relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--color-ember) 0%, transparent 70%)",
              transform: "translate(30%, -40%)",
            }}
          />
        </div>

        <div className="relative max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-16 sm:pb-20">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/progress-report"
              className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              All Issues
            </Link>
            <ShareButton title={report.title} />
          </div>

          {/* Issue badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-sm bg-[var(--color-ember)]/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[var(--color-ember)]" />
            </div>
            <span className="text-[11px] font-mono font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em]">
              Portland Progress Report
            </span>
            <span className="text-[11px] font-mono text-white/30">
              {getQuarterLabel(report.issueDate)}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.08] max-w-4xl mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {report.title}
          </h1>

          {/* Summary */}
          {report.summary && (
            <p
              className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mb-8"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
              }}
            >
              {report.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-[12px] font-mono text-white/40">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Published {formatDate(report.issueDate)}
            </span>
            <span>
              {report.sections.length} section
              {report.sections.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-ember)]/40 to-transparent" />
      </header>

      {/* Table of contents */}
      <nav className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] sticky top-14 z-40">
        <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-1 scrollbar-hide">
            {report.sections.map((section) => (
              <a
                key={section.id}
                href={`#section-${section.sectionOrder}`}
                className="flex-shrink-0 px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-parchment)]/50 rounded transition-all duration-200"
              >
                <span className="font-mono text-[10px] text-[var(--color-ink-muted)]/60 mr-1.5">
                  {section.sectionOrder}.
                </span>
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Report content */}
      <article className="py-12 sm:py-16 lg:py-20">
        <ArticleRenderer sections={report.sections} />
      </article>

      {/* Report footer */}
      <div className="border-t border-[var(--color-parchment)]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <div className="w-10 h-px bg-[var(--color-ember)] mx-auto mb-6" />
          <p
            className="text-lg text-[var(--color-ink-muted)] mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Portland Progress Report is published quarterly.
          </p>
          <p className="text-[13px] text-[var(--color-ink-muted)]">
            All data sourced from the{" "}
            <Link
              href="/dashboard"
              className="text-[var(--color-canopy-light)] hover:text-[var(--color-canopy)] underline underline-offset-2 decoration-[var(--color-canopy-light)]/30 hover:decoration-[var(--color-canopy)]/50 transition-all"
            >
              Portland Commons Civic Dashboard
            </Link>
            , which draws from public records and government APIs.
          </p>
          <div className="mt-8">
            <Link
              href="/progress-report"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white bg-[var(--color-canopy)] hover:bg-[var(--color-canopy-mid)] rounded-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to All Issues
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client component for share button
function ShareButton({ title }: { title: string }) {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-sm transition-all"
      title={`Share: ${title}`}
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  );
}
