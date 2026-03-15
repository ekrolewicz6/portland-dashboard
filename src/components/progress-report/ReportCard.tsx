import Link from "next/link";
import { Calendar, FileText, ArrowRight } from "lucide-react";
import type { ProgressReportSummary } from "@/app/api/progress-report/route";

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

export default function ReportCard({
  report,
  featured = false,
}: {
  report: ProgressReportSummary;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Link
        href={`/progress-report/${report.slug}`}
        className="group block"
      >
        <article className="relative bg-[var(--color-canopy)] text-white rounded-sm overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(15,36,25,0.2)] hover:-translate-y-1">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-ember)] via-[var(--color-ember-bright)] to-[var(--color-clay)]" />

          <div className="p-8 sm:p-10 lg:p-12">
            {/* Quarter badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-ember)]/20 text-[var(--color-ember-bright)] rounded-sm text-[11px] font-semibold uppercase tracking-[0.15em] font-mono">
                Latest Issue
              </span>
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-[0.1em]">
                {getQuarterLabel(report.issueDate)}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] mb-4 group-hover:text-[var(--color-lichen)] transition-colors duration-300" style={{ fontFamily: "var(--font-display)" }}>
              {report.title}
            </h2>

            {/* Summary */}
            {report.summary && (
              <p className="text-white/70 text-[15px] leading-relaxed max-w-2xl mb-8">
                {report.summary}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-6 text-[12px] text-white/40 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(report.issueDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {report.sectionCount} sections
              </span>
              <span className="flex items-center gap-1.5 text-[var(--color-ember)] font-semibold group-hover:gap-2.5 transition-all duration-300">
                Read report
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/progress-report/${report.slug}`}
      className="group block"
    >
      <article className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden transition-all duration-300 hover:border-[var(--color-sage)] hover:shadow-[0_1px_2px_rgba(15,36,25,0.04),0_8px_32px_rgba(15,36,25,0.06)] hover:-translate-y-0.5">
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-canopy)] group-hover:w-1.5 transition-all duration-300" />

        <div className="p-6 sm:p-8 pl-7 sm:pl-9">
          {/* Quarter label */}
          <span className="text-[11px] font-mono font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-2 block">
            {getQuarterLabel(report.issueDate)}
          </span>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl leading-snug mb-3 group-hover:text-[var(--color-canopy-light)] transition-colors duration-300" style={{ fontFamily: "var(--font-display)" }}>
            {report.title}
          </h3>

          {/* Summary */}
          {report.summary && (
            <p className="text-[var(--color-ink-muted)] text-[14px] leading-relaxed line-clamp-2 mb-4">
              {report.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-5 text-[11px] text-[var(--color-ink-muted)] font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatDate(report.issueDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {report.sectionCount} sections
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
