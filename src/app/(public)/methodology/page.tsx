import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology & Data Sources — Portland Civic Lab",
  description:
    "How we collect, verify, and present Portland's civic data. Every metric is sourced from public records, government APIs, and verified datasets.",
};

// ---------------------------------------------------------------------------
// Data source definitions for the methodology table
// ---------------------------------------------------------------------------

interface MethodologySource {
  name: string;
  provider: string;
  frequency: string;
  status: "Live" | "Static" | "Periodic Download" | "API Key Required" | "PRR Needed" | "Subscription" | "Seeded";
}

interface CategoryInfo {
  name: string;
  description: string;
  sources: MethodologySource[];
}

const CATEGORIES: CategoryInfo[] = [
  {
    name: "Housing",
    description:
      "Building permits, construction activity, and rental market trends across Portland.",
    sources: [
      {
        name: "Building Permits (BDS)",
        provider: "Portland Permitting & Development via ArcGIS",
        frequency: "Continuous (live API)",
        status: "Live",
      },
      {
        name: "Zillow Home Value Index (ZHVI)",
        provider: "Zillow Research",
        frequency: "Monthly CSV",
        status: "Periodic Download",
      },
      {
        name: "Zillow Observed Rent Index (ZORI)",
        provider: "Zillow Research",
        frequency: "Monthly CSV",
        status: "Periodic Download",
      },
    ],
  },
  {
    name: "Public Safety",
    description:
      "Crime trends, 911 response data, and public safety metrics for Portland.",
    sources: [
      {
        name: "PPB Crime Grid Data",
        provider: "Portland Police Bureau via ArcGIS MapServer",
        frequency: "Continuous (live API)",
        status: "Live",
      },
      {
        name: "BOEC 911 Response Times",
        provider: "Bureau of Emergency Communications",
        frequency: "Hardcoded from published reports",
        status: "PRR Needed",
      },
    ],
  },
  {
    name: "Economy",
    description:
      "Employment, wages, business formation, and commercial vacancy across Multnomah County.",
    sources: [
      {
        name: "BLS QCEW (Employment & Wages)",
        provider: "Bureau of Labor Statistics",
        frequency: "Quarterly CSV API, ~6 month lag, 10-year history",
        status: "Live",
      },
      {
        name: "BLS LAUS (Unemployment Rate)",
        provider: "Bureau of Labor Statistics",
        frequency: "Monthly API, ~2 month lag",
        status: "Live",
      },
      {
        name: "Oregon SOS Business Registry",
        provider: "Oregon Secretary of State via data.oregon.gov",
        frequency: "Continuous (live API)",
        status: "Live",
      },
    ],
  },
  {
    name: "Fiscal Health",
    description:
      "Tax burden comparisons, city budget analysis, and pension liability tracking.",
    sources: [
      {
        name: "Tax Rate Analysis",
        provider:
          "Lincoln Institute / OR DOR / WA DOR / City budgets",
        frequency: "Annual (published rates)",
        status: "Static",
      },
    ],
  },
  {
    name: "Education",
    description:
      "PPS enrollment, test scores, graduation rates, chronic absenteeism, per-pupil spending, and class size.",
    sources: [
      {
        name: "PPS Enrollment Data",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual XLSX (October headcount)",
        status: "Periodic Download",
      },
      {
        name: "Test Scores (Smarter Balanced)",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual",
        status: "Periodic Download",
      },
      {
        name: "Graduation Rates",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual (4-year adjusted cohort)",
        status: "Periodic Download",
      },
      {
        name: "Chronic Absenteeism",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual",
        status: "Periodic Download",
      },
      {
        name: "Per-Pupil Spending",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual",
        status: "Periodic Download",
      },
      {
        name: "Class Size",
        provider: "Oregon Dept of Education (ODE)",
        frequency: "Annual",
        status: "Periodic Download",
      },
    ],
  },
  {
    name: "Homelessness",
    description:
      "Point-in-time counts, shelter capacity, and service utilization data.",
    sources: [
      {
        name: "HUD Point-in-Time Count",
        provider: "HUD Exchange",
        frequency: "Annual XLSB",
        status: "Periodic Download",
      },
      {
        name: "HSD/JOHS Shelter Dashboard",
        provider: "Joint Office of Homeless Services / Tableau",
        frequency: "Varies",
        status: "PRR Needed",
      },
    ],
  },
  {
    name: "Transportation",
    description:
      "Transit routes, ridership, and commute patterns across the Portland metro.",
    sources: [
      {
        name: "TriMet GTFS (Routes & Stops)",
        provider: "TriMet",
        frequency: "Continuous (89 routes, 6,399 stops)",
        status: "Live",
      },
      {
        name: "Census ACS Commute Mode Share",
        provider: "U.S. Census Bureau",
        frequency: "Annual (American Community Survey)",
        status: "API Key Required",
      },
    ],
  },
  {
    name: "Environment",
    description:
      "Air quality, emissions, and environmental health metrics for Portland.",
    sources: [
      {
        name: "AirNow AQI",
        provider: "EPA AirNow API",
        frequency: "Hourly",
        status: "API Key Required",
      },
    ],
  },
  {
    name: "Quality of Life",
    description:
      "Parks access, street conditions, library services, and neighborhood livability.",
    sources: [
      {
        name: "Portland Parks Data",
        provider: "Portland Parks & Recreation via ArcGIS",
        frequency: "Continuous (live API)",
        status: "Live",
      },
      {
        name: "PBOT Pavement Condition Index",
        provider: "Portland Bureau of Transportation via ArcGIS",
        frequency: "Annual survey",
        status: "Periodic Download",
      },
      {
        name: "Oregon Library Statistics",
        provider: "State Library of Oregon via Socrata API",
        frequency: "Annual",
        status: "Live",
      },
    ],
  },
  {
    name: "Accountability",
    description:
      "Ballot measure results, elected officials, and government transparency tracking.",
    sources: [
      {
        name: "Ballot Measure Results",
        provider: "Multnomah County Elections / public records",
        frequency: "Seeded from election results",
        status: "Seeded",
      },
      {
        name: "Elected Officials",
        provider: "portland.gov",
        frequency: "Seeded from public records",
        status: "Seeded",
      },
    ],
  },
  {
    name: "Climate Accountability Platform",
    description:
      "All 47 Climate Emergency Workplan actions, bureau performance scorecards, PCEF fund tracking, and Multnomah County emissions trajectory vs. 2030/2050 goals. Built in direct response to the February 2026 City Auditor climate justice audit — all five recommendations cross-referenced. Methodology: each workplan action is encoded with structured metadata (sector, category, lead bureaus, fiscal year, resource gap, PCEF funding status, multi-bureau flag, and current status). Bureau scorecards are computed from action assignments. PCEF interest diversions are tracked separately from allocations to surface the ~$25M redirected to the General Fund.",
    sources: [
      {
        name: "Climate Emergency Workplan 2022–2025",
        provider: "Portland Bureau of Planning & Sustainability (BPS)",
        frequency: "Seeded from published workplan tables",
        status: "Seeded",
      },
      {
        name: "CEW Annual Progress Reports",
        provider: "Portland Bureau of Planning & Sustainability",
        frequency: "Annual (FY 22-23, FY 23-24 encoded)",
        status: "Seeded",
      },
      {
        name: "PCEF Climate Investment Plan",
        provider: "Portland Clean Energy Fund",
        frequency: "Annual allocation reports (FY 21-22 through FY 24-25)",
        status: "Seeded",
      },
      {
        name: "Multnomah County Community GHG Inventory",
        provider: "BPS Climate & Energy Dashboard",
        frequency: "Annual (1990–2023 actuals + 2030/2050 targets)",
        status: "Seeded",
      },
      {
        name: "City Budget Documents",
        provider: "City of Portland Budget Office",
        frequency: "Annual (resource gap and funding source data)",
        status: "Seeded",
      },
      {
        name: "Climate Justice Audit",
        provider: "City Auditor's Office, February 25, 2026",
        frequency: "One-time — 5 recommendations cross-referenced in platform",
        status: "Seeded",
      },
      {
        name: "Climate Action Plan Targets",
        provider: "BPS / Multnomah County",
        frequency: "Seeded from 2030 (50% below 1990) and 2050 (net-zero) goal documents",
        status: "Seeded",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

function statusColor(status: MethodologySource["status"]) {
  switch (status) {
    case "Live":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Static":
    case "Seeded":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "Periodic Download":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "API Key Required":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "PRR Needed":
      return "bg-red-50 text-red-800 border-red-200";
    case "Subscription":
      return "bg-purple-50 text-purple-800 border-purple-200";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-[var(--color-canopy)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-canopy-light)] rounded-full blur-[200px] opacity-20 -translate-y-1/2 translate-x-1/4" />

        <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-14 sm:pt-10 sm:pb-20">
          {/* Nav */}
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </Link>
          </div>

          {/* Title */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[var(--color-ember)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                Transparency
              </span>
            </div>
            <h1 className="font-editorial-normal text-[36px] sm:text-[48px] lg:text-[56px] text-white leading-[1.08] tracking-tight">
              Methodology &amp; Data Sources
            </h1>
            <p className="mt-6 text-[17px] text-white/60 font-editorial max-w-lg leading-relaxed">
              How we collect, verify, and present Portland&apos;s civic data.
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* ── Content ── */}
      <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 -mt-4 relative z-20 pb-20">
        {/* ━━━ Philosophy ━━━ */}
        <section className="mt-12 mb-16">
          <div className="section-divider mb-8">
            <h2 className="font-editorial-normal text-xl text-[var(--color-ink)]">
              Our Principles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Real data only",
                body: "We show real data where we have it and clearly mark what\u2019s missing. Every metric on the dashboard is labeled with its source and status.",
              },
              {
                title: "No fake data as real",
                body: "We never present estimated or mock data as real. If a data source is unavailable, we say so rather than fabricating numbers.",
              },
              {
                title: "Public sources",
                body: "Every metric is sourced from public records, government APIs, and verified datasets. We do not use proprietary data without disclosure.",
              },
              {
                title: "Open source",
                body: "All code and data pipelines are open source. Anyone can audit how we fetch, transform, and display every number on this dashboard.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6"
              >
                <h3 className="text-[13px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.1em] mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ Data Sources by Category ━━━ */}
        <section className="mb-16">
          <div className="section-divider mb-8">
            <h2 className="font-editorial-normal text-xl text-[var(--color-ink)]">
              Data Sources by Category
            </h2>
          </div>

          <div className="space-y-10">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <h3 className="font-editorial-normal text-lg text-[var(--color-ink)] mb-1">
                  {cat.name}
                </h3>
                <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                  {cat.description}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[var(--color-parchment)]">
                        <th className="text-left py-2 pr-4 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                          Source
                        </th>
                        <th className="text-left py-2 pr-4 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                          Provider
                        </th>
                        <th className="text-left py-2 pr-4 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                          Update Frequency
                        </th>
                        <th className="text-left py-2 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.sources.map((src) => (
                        <tr
                          key={src.name}
                          className="border-b border-[var(--color-parchment)]/60"
                        >
                          <td className="py-2.5 pr-4 text-[var(--color-ink-light)] font-medium">
                            {src.name}
                          </td>
                          <td className="py-2.5 pr-4 text-[var(--color-ink-muted)]">
                            {src.provider}
                          </td>
                          <td className="py-2.5 pr-4 text-[var(--color-ink-muted)]">
                            {src.frequency}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm ${statusColor(src.status)}`}
                            >
                              {src.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━ Data Quality & Known Limitations ━━━ */}
        <section className="mb-16">
          <div className="section-divider mb-8">
            <h2 className="font-editorial-normal text-xl text-[var(--color-ink)]">
              Data Quality &amp; Known Limitations
            </h2>
          </div>

          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <div className="space-y-4 text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  Oregon SOS business data has survivorship bias.
                </strong>{" "}
                The Oregon Secretary of State registry only tracks currently
                active businesses. Dissolved or inactive entities drop out of the
                dataset, so net formation counts overstate business growth and
                understate churn.
              </div>
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  QCEW data has approximately a 6-month lag.
                </strong>{" "}
                The Bureau of Labor Statistics publishes Quarterly Census of
                Employment and Wages data with a delay of roughly two quarters.
                The most recent quarter shown on the dashboard reflects this lag.
              </div>
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  ArcGIS crime data counts grid cells, not individual crimes.
                </strong>{" "}
                The PPB crime MapServer returns counts per geographic grid cell.
                Multiple offenses at the same location are collapsed into a
                single cell count. This means raw totals from the API
                undercount actual crime volume.
              </div>
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  Permit processing times have survivorship bias.
                </strong>{" "}
                Only completed permits are included in processing time
                calculations. Permits still in review (which are likely the
                slowest) are excluded, making median processing times appear
                faster than they actually are.
              </div>
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  Census ACS data has margin of error.
                </strong>{" "}
                American Community Survey estimates are based on sampling, not a
                full count. Small geographies and rare characteristics have
                wider margins of error. We display point estimates without
                confidence intervals for readability.
              </div>
              <div>
                <strong className="text-[var(--color-ink-light)]">
                  ArcGIS date fields may contain garbage values.
                </strong>{" "}
                Some ArcGIS feature services return dates in the year 1899 or
                other obviously invalid timestamps. We filter these out rather
                than display them.
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ Update Schedule ━━━ */}
        <section className="mb-16">
          <div className="section-divider mb-8">
            <h2 className="font-editorial-normal text-xl text-[var(--color-ink)]">
              Update Schedule
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-parchment)]">
                  <th className="text-left py-2 pr-4 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    Frequency
                  </th>
                  <th className="text-left py-2 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.1em]">
                    Data Sources
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    freq: "Real-time / Continuous",
                    items:
                      "BDS Building Permits, PPB Crime Grid, Oregon SOS Business Registry, TriMet GTFS, Portland Parks ArcGIS",
                  },
                  {
                    freq: "Hourly",
                    items: "AirNow AQI (when API key configured)",
                  },
                  {
                    freq: "Monthly",
                    items:
                      "BLS LAUS Unemployment (~2 month lag), Zillow ZHVI/ZORI",
                  },
                  {
                    freq: "Quarterly",
                    items:
                      "BLS QCEW Employment & Wages (~6 month lag)",
                  },
                  {
                    freq: "Annually",
                    items:
                      "ODE Enrollment, Test Scores, Graduation Rates, Chronic Absenteeism, Per-Pupil Spending, Class Size; HUD PIT Count; Tax Rate Analysis; PBOT Pavement PCI; Oregon Library Stats; Census ACS",
                  },
                  {
                    freq: "As published",
                    items:
                      "Ballot measure results, Elected officials, BOEC 911 reports",
                  },
                ].map((row) => (
                  <tr
                    key={row.freq}
                    className="border-b border-[var(--color-parchment)]/60"
                  >
                    <td className="py-2.5 pr-4 text-[var(--color-ink-light)] font-medium whitespace-nowrap align-top">
                      {row.freq}
                    </td>
                    <td className="py-2.5 text-[var(--color-ink-muted)]">
                      {row.items}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ━━━ Contact / Contribute ━━━ */}
        <section>
          <div className="section-divider mb-8">
            <h2 className="font-editorial-normal text-xl text-[var(--color-ink)]">
              Report Errors &amp; Contribute
            </h2>
          </div>

          <div className="bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm p-6">
            <div className="space-y-3 text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
              <p>
                If you spot an error in our data, see a metric that
                doesn&apos;t match an official source, or have a suggestion
                for a new data source, we want to hear from you.
              </p>
              <p>
                <strong className="text-[var(--color-ink-light)]">
                  Report a data error:
                </strong>{" "}
                Open an issue on our GitHub repository with the category,
                metric, and the correct value with its source.
              </p>
              <p>
                <strong className="text-[var(--color-ink-light)]">
                  Suggest a data source:
                </strong>{" "}
                We prioritize sources that are free, publicly accessible, and
                machine-readable. If you know of a Portland-area dataset we
                should include, let us know the URL, format, and update
                frequency.
              </p>
              <p>
                <strong className="text-[var(--color-ink-light)]">
                  Contribute code:
                </strong>{" "}
                This project is open source. Data ingestion pipelines,
                API routes, and visualization components are all available for
                contribution.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
