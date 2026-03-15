"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Code2,
  Share2,
  Calendar,
  Database,
} from "lucide-react";
import ExportButton from "@/components/dashboard/ExportButton";
import EmbedButton from "@/components/dashboard/EmbedButton";

interface DetailPageShellProps {
  question: string;
  questionId: string;
  headline: string;
  headlineValue?: string;
  color: string;
  source: string;
  lastUpdated: string;
  dataStatus?: "live" | "estimated" | "pending";
  children: React.ReactNode;
}

export default function DetailPageShell({
  question,
  questionId,
  headline,
  headlineValue,
  color,
  source,
  lastUpdated,
  dataStatus = "estimated",
  children,
}: DetailPageShellProps) {
  const statusConfig = {
    live: { label: "Live Data", dot: "#059669", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    estimated: { label: "Estimated", dot: "#d97706", bg: "bg-amber-50 text-amber-800 border-amber-200" },
    pending: { label: "PRR Pending", dot: "#dc2626", bg: "bg-red-50 text-red-800 border-red-200" },
  };

  const status = statusConfig[dataStatus];

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden noise-overlay">
        {/* Background with question color */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${color}18 0%, var(--color-canopy) 40%, ${color}10 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[var(--color-canopy)]/85" />

        {/* Decorative orb */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-14 sm:pt-10 sm:pb-20">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <ExportButton question={questionId} />
              <EmbedButton question={questionId} />
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-3xl">
            {/* Question tag */}
            <div className="flex items-center gap-3 mb-5 animate-fade-up">
              <div className="w-8 h-px" style={{ backgroundColor: color }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color }}
              >
                {questionId.charAt(0).toUpperCase() + questionId.slice(1)}
              </span>
              {/* Data status badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm ${status.bg}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: status.dot }}
                />
                {status.label}
              </span>
            </div>

            {/* Main question */}
            <h1
              className="font-editorial-normal text-[36px] sm:text-[48px] lg:text-[56px] text-white leading-[1.08] tracking-tight animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              {question}
            </h1>

            {/* Headline answer */}
            <div
              className="mt-6 flex flex-wrap items-baseline gap-4 animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {headlineValue && (
                <span
                  className="text-[48px] sm:text-[64px] font-mono font-bold tracking-tighter leading-none"
                  style={{ color }}
                >
                  {headlineValue}
                </span>
              )}
              <p className="text-[17px] text-white/60 font-editorial max-w-md leading-relaxed">
                {headline}
              </p>
            </div>

            {/* Meta row */}
            <div
              className="mt-8 flex flex-wrap items-center gap-6 text-[12px] text-white/35 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                {source}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Updated {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* ── Content ── */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 -mt-4 relative z-20 pb-16">
        {children}
      </div>

      {/* ── Source Citation Footer ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        <div className="story-callout">
          <p>
            Every number on this page is sourced from public records and
            government APIs. If you see something wrong, tell us.
          </p>
          <cite>
            Portland Commons Civic Dashboard &middot; {source} &middot;{" "}
            {lastUpdated}
          </cite>
        </div>
      </section>
    </div>
  );
}
