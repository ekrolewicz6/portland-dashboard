"use client";

import { X, Download, Code2, CheckCircle2, BookOpen } from "lucide-react";
import TrendChart from "@/components/charts/TrendChart";

interface DetailPanelProps {
  question: string;
  chartData: { date: string; value: number }[];
  methodology: string;
  keyFacts: string[];
  color: string;
  source: string;
  lastUpdated: string;
  onClose: () => void;
}

export default function DetailPanel({
  question,
  chartData,
  methodology,
  keyFacts,
  color,
  source,
  lastUpdated,
  onClose,
}: DetailPanelProps) {
  return (
    <div
      className="detail-panel p-6 sm:p-8 mb-8 animate-slide-down"
      style={{ "--accent-color": color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-editorial-normal text-2xl sm:text-3xl text-[var(--color-ink)]">
            {question}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[12px] text-[var(--color-ink-muted)] font-medium uppercase tracking-wide">
              {source}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-parchment)]" />
            <span className="text-[12px] text-[var(--color-ink-muted)]/60 font-mono">
              Updated {lastUpdated}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)] rounded-sm transition-colors">
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)] rounded-sm transition-colors">
            <Code2 className="w-3.5 h-3.5" />
            Embed
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-ink-muted)]/50 hover:text-[var(--color-ink)] rounded-sm hover:bg-[var(--color-parchment)]/50 transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <h3 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
            12-Month Trend
          </h3>
          <div className="flex-1 h-px bg-[var(--color-parchment)]" />
        </div>
        <div className="bg-white/60 rounded-sm p-4 border border-[var(--color-parchment)]/60">
          <TrendChart data={chartData} color={color} />
        </div>
      </div>

      {/* Two-column: Key Facts + Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Facts */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <CheckCircle2 className="w-4 h-4" style={{ color }} />
            <h3 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
              Key Findings
            </h3>
          </div>
          <ul className="space-y-3">
            {keyFacts.map((fact, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-[var(--color-ink-light)] leading-relaxed"
              >
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {/* Methodology */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <BookOpen className="w-4 h-4 text-[var(--color-ink-muted)]" />
            <h3 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
              Methodology
            </h3>
          </div>
          <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-4">
            <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
              {methodology}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
