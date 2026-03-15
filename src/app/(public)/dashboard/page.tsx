"use client";

import { useState } from "react";
import HeadlineCard from "@/components/cards/HeadlineCard";
import InsightBanner from "@/components/cards/InsightBanner";
import DetailPanel from "@/components/cards/DetailPanel";
import { QUESTION_DATA_STATUS } from "@/data/source-status";
import type { QuestionId } from "@/types/dashboard";
import {
  Users,
  Building2,
  MapPin,
  Shield,
  Receipt,
  Home,
  Award,
} from "lucide-react";

const headlines = [
  {
    id: "migration",
    question: "Is Portland gaining or losing people?",
    headline: { value: "+127", label: "net households this month" },
    trend: { direction: "up" as const, value: "+12%", isPositive: true },
    sparklineData: [
      { value: -45 }, { value: -32 }, { value: -18 }, { value: -5 },
      { value: 12 }, { value: 28 }, { value: 35 }, { value: 54 },
      { value: 72 }, { value: 89 }, { value: 108 }, { value: 127 },
    ],
    source: "Portland Water Bureau",
    lastUpdated: "Mar 1, 2026",
    color: "#4a90d9",
    icon: Users,
    detailData: {
      chartData: [
        { date: "Apr", value: -45 }, { date: "May", value: -32 },
        { date: "Jun", value: -18 }, { date: "Jul", value: -5 },
        { date: "Aug", value: 12 }, { date: "Sep", value: 28 },
        { date: "Oct", value: 35 }, { date: "Nov", value: 54 },
        { date: "Dec", value: 72 }, { date: "Jan", value: 89 },
        { date: "Feb", value: 108 }, { date: "Mar", value: 127 },
      ],
      methodology:
        "Net migration is derived from Portland Water Bureau new residential account activations minus deactivations. This is the most real-time proxy for household migration available — every new water activation represents a household that just moved in.",
      keyFacts: [
        "Portland gained 127 net households in March 2026",
        "Positive trend since August 2025 after 18 months of net outflow",
        "ZIP 97209 (Pearl District) saw the highest net inflow: +34 households",
        "ZIP 97233 (East Portland) saw the largest net outflow: -12 households",
      ],
    },
  },
  {
    id: "business",
    question: "Is Portland gaining or losing businesses?",
    headline: { value: "+83", label: "net business formations this month" },
    trend: { direction: "up" as const, value: "+8%", isPositive: true },
    sparklineData: [
      { value: -12 }, { value: -5 }, { value: 8 }, { value: 15 },
      { value: 22 }, { value: 31 }, { value: 38 }, { value: 45 },
      { value: 52 }, { value: 64 }, { value: 71 }, { value: 83 },
    ],
    source: "Portland Revenue Division",
    lastUpdated: "Mar 1, 2026",
    color: "#2d8a7e",
    icon: Building2,
    detailData: {
      chartData: [
        { date: "Apr", value: -12 }, { date: "May", value: -5 },
        { date: "Jun", value: 8 }, { date: "Jul", value: 15 },
        { date: "Aug", value: 22 }, { date: "Sep", value: 31 },
        { date: "Oct", value: 38 }, { date: "Nov", value: 45 },
        { date: "Dec", value: 52 }, { date: "Jan", value: 64 },
        { date: "Feb", value: 71 }, { date: "Mar", value: 83 },
      ],
      methodology:
        "Net business formation = new Portland Business License Tax registrations minus cancellations/expirations in the same period. Data sourced from quarterly public records requests to the Portland Revenue Division.",
      keyFacts: [
        "83 net new businesses registered in March 2026",
        "Food & beverage sector leading with 24 new registrations",
        "Professional services second with 18 new registrations",
        "Central Eastside saw the most new business activity",
      ],
    },
  },
  {
    id: "downtown",
    question: "Is downtown coming back?",
    headline: {
      value: "86%",
      label: "of 2019 foot traffic",
      subValue: "73%",
      subLabel: "ground floors occupied",
    },
    trend: { direction: "up" as const, value: "+5.5%", isPositive: true },
    sparklineData: [
      { value: 62 }, { value: 65 }, { value: 68 }, { value: 71 },
      { value: 73 }, { value: 74 }, { value: 76 }, { value: 79 },
      { value: 80 }, { value: 82 }, { value: 84 }, { value: 86 },
    ],
    source: "Placer.ai via Clean & Safe",
    lastUpdated: "Mar 7, 2026",
    color: "#d4a843",
    icon: MapPin,
    detailData: {
      chartData: [
        { date: "Apr", value: 62 }, { date: "May", value: 65 },
        { date: "Jun", value: 68 }, { date: "Jul", value: 71 },
        { date: "Aug", value: 73 }, { date: "Sep", value: 74 },
        { date: "Oct", value: 76 }, { date: "Nov", value: 79 },
        { date: "Dec", value: 80 }, { date: "Jan", value: 82 },
        { date: "Feb", value: 84 }, { date: "Mar", value: 86 },
      ],
      methodology:
        "Foot traffic is measured by Placer.ai using anonymized mobile device signals, indexed to the same-week 2019 baseline. Ground floor occupancy is measured by quarterly ground-truthing walks along priority corridors plus BLT registration cross-reference.",
      keyFacts: [
        "Saturday foot traffic is now 94% of 2019 — the highest recovery of any day of the week",
        "Weekday lunch-hour traffic still lagging at 72% of 2019",
        "Pioneer Place corridor saw 8% month-over-month increase",
        "Average dwell time increased to 47 minutes (up from 38 min in Q1 2025)",
      ],
    },
  },
  {
    id: "safety",
    question: "Is Portland safe?",
    headline: {
      value: "4.2",
      label: "property crime per 1,000 residents",
      subValue: "8.4 min",
      subLabel: "avg 911 response (Priority 1)",
    },
    trend: { direction: "down" as const, value: "-8%", isPositive: true },
    sparklineData: [
      { value: 6.1 }, { value: 5.8 }, { value: 5.5 }, { value: 5.4 },
      { value: 5.2 }, { value: 5.0 }, { value: 4.9 }, { value: 4.7 },
      { value: 4.6 }, { value: 4.5 }, { value: 4.3 }, { value: 4.2 },
    ],
    source: "Portland Police Bureau",
    lastUpdated: "Feb 28, 2026",
    color: "#c44536",
    icon: Shield,
    detailData: {
      chartData: [
        { date: "Apr", value: 6.1 }, { date: "May", value: 5.8 },
        { date: "Jun", value: 5.5 }, { date: "Jul", value: 5.4 },
        { date: "Aug", value: 5.2 }, { date: "Sep", value: 5.0 },
        { date: "Oct", value: 4.9 }, { date: "Nov", value: 4.7 },
        { date: "Dec", value: 4.6 }, { date: "Jan", value: 4.5 },
        { date: "Feb", value: 4.3 }, { date: "Mar", value: 4.2 },
      ],
      methodology:
        "Property crime rate is calculated from Portland Police Bureau reported offense data (NIBRS), normalized per 1,000 residents using Census population estimates. 911 response time is the median time from dispatch to on-scene arrival for Priority 1 calls.",
      keyFacts: [
        "Property crime down 8% from 12-month average",
        "Vehicle theft down 22% year-over-year — the largest improvement of any category",
        "Old Town/Chinatown saw a 15% reduction in person crimes",
        "Priority 1 response time improved from 9.2 to 8.4 minutes",
      ],
    },
  },
  {
    id: "tax",
    question: "Is the tax burden competitive?",
    headline: {
      value: "12.4%",
      label: "effective rate at $200K income",
      subValue: "vs. 7.1%",
      subLabel: "Vancouver, WA",
    },
    trend: { direction: "flat" as const, value: "no change", isPositive: false },
    sparklineData: [
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
      { value: 12.4 }, { value: 12.4 }, { value: 12.4 }, { value: 12.4 },
    ],
    source: "Portland Commons analysis",
    lastUpdated: "Jan 2026",
    color: "#9333ea",
    icon: Receipt,
    detailData: {
      chartData: [
        { date: "2020", value: 10.8 }, { date: "2021", value: 11.2 },
        { date: "2022", value: 11.9 }, { date: "2023", value: 12.1 },
        { date: "2024", value: 12.3 }, { date: "2025", value: 12.4 },
        { date: "2026", value: 12.4 },
      ],
      methodology:
        "Effective tax rate includes: federal income tax, Oregon state income tax, Multnomah County income tax (Preschool for All), Metro Supportive Housing Services tax, Portland Arts Tax, and TriMet payroll tax. Compared at identical income levels across peer cities.",
      keyFacts: [
        "Portland's effective rate is 5.3 percentage points higher than Vancouver, WA at $200K income",
        "The gap is primarily driven by Oregon income tax (no sales tax offset) and local income taxes",
        "Portland's marginal rate for the next dollar at $200K: 14.7% (vs. 8.2% in Vancouver, WA)",
        "The Preschool for All tax added 1.5% for incomes above $125K ($200K+ jointly)",
      ],
    },
  },
  {
    id: "housing",
    question: "Is housing getting built?",
    headline: {
      value: "824",
      label: "units in pipeline",
      subValue: "14.2 mo",
      subLabel: "avg permit time",
    },
    trend: { direction: "up" as const, value: "+168 units", isPositive: true },
    sparklineData: [
      { value: 420 }, { value: 445 }, { value: 480 }, { value: 510 },
      { value: 548 }, { value: 590 }, { value: 620 }, { value: 656 },
      { value: 700 }, { value: 745 }, { value: 790 }, { value: 824 },
    ],
    source: "PP&D permit data",
    lastUpdated: "Mar 10, 2026",
    color: "#ea580c",
    icon: Home,
    detailData: {
      chartData: [
        { date: "Apr", value: 420 }, { date: "May", value: 445 },
        { date: "Jun", value: 480 }, { date: "Jul", value: 510 },
        { date: "Aug", value: 548 }, { date: "Sep", value: 590 },
        { date: "Oct", value: 620 }, { date: "Nov", value: 656 },
        { date: "Dec", value: 700 }, { date: "Jan", value: 745 },
        { date: "Feb", value: 790 }, { date: "Mar", value: 824 },
      ],
      methodology:
        "Housing pipeline counts all active residential building permits (new construction and conversion) from Portland Permitting & Development ArcGIS data. Average permit processing time is calculated as calendar days from application to issuance.",
      keyFacts: [
        "824 units currently in the permit pipeline (target: 10,000/year)",
        "Average permit processing time: 14.2 months (90-day guarantee not being met for most permit types)",
        "34% of pipeline units are in the Central City",
        "ADU permits up 28% year-over-year",
      ],
    },
  },
  {
    id: "program",
    question: "Is the Portland Commons working?",
    headline: {
      value: "347",
      label: "certified businesses",
      subValue: "89%",
      subLabel: "1-year survival (vs. 80% national avg)",
    },
    trend: { direction: "up" as const, value: "+23 this month", isPositive: true },
    sparklineData: [
      { value: 180 }, { value: 200 }, { value: 218 }, { value: 235 },
      { value: 248 }, { value: 262 }, { value: 278 }, { value: 295 },
      { value: 310 }, { value: 324 }, { value: 336 }, { value: 347 },
    ],
    source: "Portland Commons Registry",
    lastUpdated: "real-time",
    color: "#2d5016",
    icon: Award,
    detailData: {
      chartData: [
        { date: "Apr", value: 180 }, { date: "May", value: 200 },
        { date: "Jun", value: 218 }, { date: "Jul", value: 235 },
        { date: "Aug", value: 248 }, { date: "Sep", value: 262 },
        { date: "Oct", value: 278 }, { date: "Nov", value: 295 },
        { date: "Dec", value: 310 }, { date: "Jan", value: 324 },
        { date: "Feb", value: 336 }, { date: "Mar", value: 347 },
      ],
      methodology:
        "Portland Commons Business (PCB) certifications tracked through the PCB registry. Survival rate measured as the percentage of certified businesses still operating 12 months after certification. Jobs created are self-reported by certified businesses during quarterly check-ins.",
      keyFacts: [
        "347 businesses have earned Portland Commons certification",
        "89% one-year survival rate (vs. 80% national average for new businesses)",
        "1,240 jobs created by PCB-certified businesses",
        "Average Commons Credit utilization: $3,200 per business",
      ],
    },
  },
];

const insights = [
  {
    id: "1",
    text: "Saturday foot traffic is now 94% of 2019 — the highest recovery of any day of the week.",
    question: "downtown",
    severity: "high" as const,
  },
  {
    id: "2",
    text: "After 18 months of decline, net household migration turned positive for the third consecutive month.",
    question: "migration",
    severity: "high" as const,
  },
  {
    id: "3",
    text: "Vehicle theft dropped 22% year-over-year — the largest improvement of any crime category.",
    question: "safety",
    severity: "medium" as const,
  },
  {
    id: "4",
    text: "The Central Eastside saw 22% more foot traffic this month — the largest increase of any corridor.",
    question: "downtown",
    severity: "medium" as const,
  },
];

export default function DashboardPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const selectedData = headlines.find((h) => h.id === selectedQuestion);

  return (
    <div>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-forest-dark)] tracking-tight">
            How is Portland doing?
          </h1>
          <p className="mt-2 text-lg text-gray-500 max-w-2xl">
            Seven questions that drive Portland&apos;s story, answered with real
            data. Updated automatically from public records and government APIs.
          </p>
        </div>

        {/* Insight Banner */}
        <div className="mb-8">
          <InsightBanner insights={insights} />
        </div>

        {/* Headline Grid */}
        <div
          id="dashboard"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
        >
          {headlines.map((h) => {
            const status = QUESTION_DATA_STATUS[h.id as QuestionId];
            return (
              <HeadlineCard
                key={h.id}
                question={h.question}
                headline={h.headline}
                trend={h.trend}
                sparklineData={h.sparklineData}
                source={h.source}
                lastUpdated={h.lastUpdated}
                color={h.color}
                onClick={() =>
                  setSelectedQuestion(
                    selectedQuestion === h.id ? null : h.id
                  )
                }
                dataStatus={
                  status
                    ? {
                        status: status.overallStatus,
                        label: status.badgeLabel,
                        tooltip: status.badgeTooltip,
                      }
                    : undefined
                }
              />
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedData && (
          <DetailPanel
            question={selectedData.question}
            chartData={selectedData.detailData.chartData}
            methodology={selectedData.detailData.methodology}
            keyFacts={selectedData.detailData.keyFacts}
            color={selectedData.color}
            source={selectedData.source}
            lastUpdated={selectedData.lastUpdated}
            onClose={() => setSelectedQuestion(null)}
          />
        )}
      </div>
    </div>
  );
}
