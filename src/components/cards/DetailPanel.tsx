"use client";

import { X, Download, Code, CheckCircle2 } from "lucide-react";
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
    <div className="bg-white border border-[#e8e5e0] rounded-xl p-6 mb-8 shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-forest-dark)]">
            {question}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Source: {source} &middot; Updated {lastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Code className="w-3.5 h-3.5" />
            Embed
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          12-Month Trend
        </h3>
        <TrendChart data={chartData} color={color} />
      </div>

      {/* Key Facts */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Key Findings
        </h3>
        <ul className="space-y-2">
          {keyFacts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <CheckCircle2
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color }}
              />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {/* Methodology */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Methodology
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{methodology}</p>
      </div>
    </div>
  );
}
