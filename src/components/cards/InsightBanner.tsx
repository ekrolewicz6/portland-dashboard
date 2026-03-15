"use client";

import { Lightbulb, ChevronRight } from "lucide-react";

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
    <div className="bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-forest-light)] rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-[var(--color-gold-accent)]" />
        <h3 className="font-semibold text-sm uppercase tracking-wide">
          This Week&apos;s Stories
        </h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-3 bg-white/10 rounded-lg px-4 py-3 hover:bg-white/15 transition-colors cursor-pointer"
          >
            <span
              className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                insight.severity === "high"
                  ? "bg-[var(--color-gold-accent)]"
                  : insight.severity === "medium"
                    ? "bg-white/60"
                    : "bg-white/30"
              }`}
            />
            <p className="text-sm leading-relaxed flex-1">{insight.text}</p>
            <ChevronRight className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
