"use client";

import { useState } from "react";
import { ClipboardList, Building2, DollarSign, TrendingDown, Wind } from "lucide-react";
import WorkplanTracker from "./WorkplanTracker";
import BureauScorecard from "./BureauScorecard";
import FinanceTracker from "./FinanceTracker";
import EmissionsTrajectory from "./EmissionsTrajectory";
import EnvironmentDetail from "../environment/EnvironmentDetail";
import EnvEmissionsTrajectory from "../environment/EmissionsTrajectory";
import EnvWorkplanTracker from "../environment/WorkplanTracker";
import EnvBureauScorecard from "../environment/BureauScorecard";
import EnvClimateFinanceTracker from "../environment/ClimateFinanceTracker";

const CLIMATE_COLOR = "#2d6a4f";

type Tab = "workplan" | "bureaus" | "finance" | "emissions" | "airquality";

const TABS: { id: Tab; label: string; shortLabel: string; Icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    id: "workplan",
    label: "Workplan Tracker",
    shortLabel: "Workplan",
    Icon: ClipboardList,
    description: "All 47 climate actions with status, filters, and detail",
  },
  {
    id: "bureaus",
    label: "Bureau Scorecard",
    shortLabel: "Bureaus",
    Icon: Building2,
    description: "Which bureaus are meeting their climate commitments?",
  },
  {
    id: "finance",
    label: "Climate Finance",
    shortLabel: "Finance",
    Icon: DollarSign,
    description: "Funding gaps, PCEF allocations, and interest diversions",
  },
  {
    id: "emissions",
    label: "Emissions Trajectory",
    shortLabel: "Emissions",
    Icon: TrendingDown,
    description: "Multnomah County GHG emissions vs. 2030 and 2050 targets",
  },
  {
    id: "airquality",
    label: "Air Quality",
    shortLabel: "AQI",
    Icon: Wind,
    description: "Current AQI readings and PM2.5 trend from EPA AirNow",
  },
];

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: CLIMATE_COLOR }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

export default function ClimateDetail() {
  const [activeTab, setActiveTab] = useState<Tab>("workplan");

  const ActiveTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-8">
      {/* Platform context banner */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-5 text-white/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-1">
                Climate Accountability Platform
              </p>
              <p className="text-[13px] text-white/70 leading-relaxed max-w-3xl">
                Direct response to the February 2026 City Auditor&apos;s climate justice audit. City Administrator Raymond Lee accepted all five recommendations. This platform is the technical infrastructure that makes accountability possible.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Audit Date</p>
              <p className="text-[14px] text-white font-semibold">Feb 25, 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* View tabs */}
      <section>
        <SectionHeader icon={ActiveTab.Icon} title={ActiveTab.label} />

        {/* Tab nav */}
        <div className="flex flex-wrap gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-[13px] font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? CLIMATE_COLOR : "var(--color-paper-warm)",
                color: activeTab === tab.id ? "white" : "var(--color-ink-muted)",
                border: `1px solid ${activeTab === tab.id ? CLIMATE_COLOR : "var(--color-parchment)"}`,
              }}
            >
              <tab.Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-[13px] text-[var(--color-ink-muted)] mb-5 italic">
          {ActiveTab.description}
        </p>

        {/* Active view */}
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5 sm:p-6">
          {activeTab === "workplan" && (
            <div className="space-y-10">
              <WorkplanTracker />
              <EnvWorkplanTracker />
            </div>
          )}
          {activeTab === "bureaus" && (
            <div className="space-y-10">
              <BureauScorecard />
              <EnvBureauScorecard />
            </div>
          )}
          {activeTab === "finance" && (
            <div className="space-y-10">
              <FinanceTracker />
              <EnvClimateFinanceTracker />
            </div>
          )}
          {activeTab === "emissions" && (
            <div className="space-y-10">
              <EmissionsTrajectory />
              <EnvEmissionsTrajectory />
            </div>
          )}
          {activeTab === "airquality" && <EnvironmentDetail />}
        </div>
      </section>

      {/* Audit recommendations cross-reference */}
      <section>
        <SectionHeader icon={ClipboardList} title="February 2026 Audit Recommendations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              rec: "Rec. 1",
              title: "Centralized leadership",
              platform: "Bureau Scorecard",
              description: "Scorecard creates accountability through transparency rather than hierarchy.",
            },
            {
              rec: "Rec. 2",
              title: "Climate cost in budgets",
              platform: "Climate Finance Tracker",
              description: "Maps every action to funding source, allocated amount, and gap.",
            },
            {
              rec: "Rec. 3",
              title: "Adaptation goals & strategy",
              platform: "Workplan Tracker",
              description: "Separates 22 decarbonization actions from 21 resilience actions.",
            },
            {
              rec: "Rec. 4",
              title: "Transparent prioritization",
              platform: "Workplan Tracker",
              description: "Every action has structured metadata — bureau, timeline, gap, status.",
            },
            {
              rec: "Rec. 5",
              title: "Community engagement",
              platform: "All Views",
              description: "Public dashboard answers: is Portland on track? Where is the money?",
            },
          ].map((item) => (
            <div
              key={item.rec}
              className="border border-[var(--color-parchment)] rounded-sm p-4 bg-white"
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-sm flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: CLIMATE_COLOR + "15", color: CLIMATE_COLOR }}
                >
                  {item.rec}
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-[var(--color-ink)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">{item.description}</p>
                  <button
                    onClick={() => {
                      const tabId = item.platform === "Bureau Scorecard" ? "bureaus"
                        : item.platform === "Climate Finance Tracker" ? "finance"
                        : item.platform === "Emissions Trajectory" ? "emissions"
                        : "workplan";
                      setActiveTab(tabId as Tab);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className="mt-2 text-[11px] font-semibold hover:underline"
                    style={{ color: CLIMATE_COLOR }}
                  >
                    → {item.platform}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
