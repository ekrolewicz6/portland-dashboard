"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface Insight {
  id: string;
  text: string;
  question: string;
  severity: "high" | "medium" | "low";
}

interface InsightBannerProps {
  insights: Insight[];
}

export default function InsightBanner({ insights }: InsightBannerProps) {
  if (insights.length === 0) return null;

  return (
    <div className="relative bg-[var(--color-canopy-mid)] rounded-sm overflow-hidden noise-overlay">
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header row */}
        <div className="flex items-center gap-2.5 mb-5">
          <Sparkles className="w-4 h-4 text-[var(--color-ember)]" />
          <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
            This Week&apos;s Stories
          </h3>
          <div className="flex-1 h-px bg-white/10 ml-2" />
        </div>

        {/* Insight items */}
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={insight.id}
              className="group flex items-start gap-4 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-sm transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Severity indicator */}
              <div className="mt-1.5 flex-shrink-0">
                <span
                  className="signal-dot"
                  style={{
                    backgroundColor:
                      insight.severity === "high"
                        ? "var(--color-ember)"
                        : insight.severity === "medium"
                          ? "var(--color-sage)"
                          : "var(--color-storm)",
                    color:
                      insight.severity === "high"
                        ? "var(--color-ember)"
                        : insight.severity === "medium"
                          ? "var(--color-sage)"
                          : "var(--color-storm)",
                  }}
                />
              </div>

              {/* Text */}
              <p className="flex-1 text-[14px] leading-relaxed text-white/80 group-hover:text-white/95 transition-colors">
                {insight.text}
              </p>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 mt-0.5 text-white/20 group-hover:text-[var(--color-ember)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
