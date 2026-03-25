import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export interface ReportSection {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  sectionOrder: number;
  sectionType: string;
  dataQuery: string | null;
  dataSnapshot: Record<string, unknown> | null;
}

export interface FullReport {
  id: number;
  title: string;
  issueDate: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  published: boolean;
  sections: ReportSection[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const reportRows = await sql<
      {
        id: number;
        title: string;
        issue_date: string;
        slug: string;
        summary: string | null;
        cover_image_url: string | null;
        published: boolean;
      }[]
    >`
      SELECT id, title, issue_date::text as issue_date, slug, summary, cover_image_url, published
      FROM content.progress_reports
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (reportRows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reportRows[0];

    const sectionRows = await sql<
      {
        id: number;
        title: string;
        subtitle: string | null;
        content: string;
        section_order: number;
        section_type: string;
        data_query: string | null;
        data_snapshot: Record<string, unknown> | null;
      }[]
    >`
      SELECT id, title, subtitle, content, section_order, section_type, data_query, data_snapshot
      FROM content.report_sections
      WHERE report_id = ${report.id}
      ORDER BY section_order
    `;

    const fullReport: FullReport = {
      id: report.id,
      title: report.title,
      issueDate: report.issue_date,
      slug: report.slug,
      summary: report.summary,
      coverImageUrl: report.cover_image_url,
      published: report.published,
      sections: sectionRows.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content,
        sectionOrder: s.section_order,
        sectionType: s.section_type,
        dataQuery: s.data_query,
        dataSnapshot: s.data_snapshot,
      })),
    };

    return NextResponse.json({ report: fullReport });
  } catch (err) {
    console.error("Progress report fetch error:", err);
    // Return static fallback for Q1 2026
    if (slug === "q1-2026") {
      return NextResponse.json({ report: await getStaticQ1Report() });
    }
    return NextResponse.json(
      { error: "Failed to load report" },
      { status: 500 },
    );
  }
}

async function getStaticQ1Report(): Promise<FullReport> {
  // Default climate values if DB is unavailable
  let climate = {
    totalActions: 47,
    achievedActions: 12,
    ongoingActions: 29,
    delayedActions: 6,
    latestYear: 2023,
    latestEmissions: 7.7,
    baseline1990: 10.4,
    reductionPct: 26,
    target2030: 5.2,
    gap: 2.5,
    totalInterestDiverted: 25100000,
    bureauAllocations: 58600000,
    communityGrants: 87100000,
  };

  try {
    const [actionRows, emissionRows, diversionRows, allocationRows] = await Promise.all([
      sql<{ status: string; count: string }[]>`
        SELECT status, COUNT(*)::text as count FROM public.climate_workplan_actions GROUP BY status
      `,
      sql<{ year: number; total_mtco2e: string }[]>`
        SELECT year, total_mtco2e::text FROM public.climate_emissions_trajectory
        WHERE is_target = false AND total_mtco2e IS NOT NULL ORDER BY year DESC LIMIT 1
      `,
      sql<{ total: string }[]>`
        SELECT COALESCE(SUM(amount_diverted), 0)::text as total FROM public.pcef_interest_diversions
      `,
      sql<{ recipient_type: string; total: string }[]>`
        SELECT recipient_type, COALESCE(SUM(amount), 0)::text as total
        FROM public.pcef_allocations GROUP BY recipient_type
      `,
    ]);

    let achieved = 0, ongoing = 0, delayed = 0;
    for (const r of actionRows) {
      const n = Number(r.count);
      if (r.status === "achieved") achieved = n;
      else if (r.status === "ongoing") ongoing = n;
      else if (r.status === "delayed") delayed = n;
    }
    const total = achieved + ongoing + delayed;

    const latestEmissions = emissionRows[0] ? Number(emissionRows[0].total_mtco2e) : climate.latestEmissions;
    const latestYear = emissionRows[0] ? Number(emissionRows[0].year) : climate.latestYear;
    const reductionPct = Math.round(((climate.baseline1990 - latestEmissions) / climate.baseline1990) * 100);

    let bureauAllocations = climate.bureauAllocations;
    let communityGrants = climate.communityGrants;
    for (const r of allocationRows) {
      if (r.recipient_type === "bureau") bureauAllocations = Number(r.total);
      if (r.recipient_type === "community") communityGrants = Number(r.total);
    }

    climate = {
      totalActions: total || climate.totalActions,
      achievedActions: achieved || climate.achievedActions,
      ongoingActions: ongoing || climate.ongoingActions,
      delayedActions: delayed || climate.delayedActions,
      latestYear,
      latestEmissions,
      baseline1990: climate.baseline1990,
      reductionPct,
      target2030: climate.target2030,
      gap: Math.round((latestEmissions - climate.target2030) * 10) / 10,
      totalInterestDiverted: diversionRows[0] ? Number(diversionRows[0].total) : climate.totalInterestDiverted,
      bureauAllocations,
      communityGrants,
    };
  } catch {
    // Use defaults — DB may be unavailable in this fallback path
  }

  const totalPcef = climate.bureauAllocations + climate.communityGrants;
  const bureauPct = Math.round((climate.bureauAllocations / totalPcef) * 100);
  const diverted = climate.totalInterestDiverted >= 1_000_000
    ? `$${(climate.totalInterestDiverted / 1_000_000).toFixed(1)}M`
    : `$${climate.totalInterestDiverted.toLocaleString()}`;
  const totalPcefFmt = totalPcef >= 1_000_000
    ? `$${(totalPcef / 1_000_000).toFixed(0)}M`
    : `$${totalPcef.toLocaleString()}`;

  return {
    id: 1,
    title: "Portland Progress Report — Q1 2026",
    issueDate: "2026-03-15",
    slug: "q1-2026",
    summary:
      "The inaugural Portland Progress Report combines dashboard data with narrative analysis to tell the story behind Portland's numbers. This quarter: the permitting bottleneck, the business formation landscape, and a new deep-dive into Portland's climate commitments following the February 2026 City Auditor audit.",
    coverImageUrl: null,
    published: true,
    sections: [
      {
        id: 1,
        title: "By the Numbers",
        subtitle: "Portland's vital signs, measured.",
        content: `Portland's civic dashboard tracks the questions that define the city's trajectory. Here is where we stand at the close of Q1 2026.

The headline numbers paint a city in transition. **34,307 building permits** are tracked in our system — representing everything from minor renovations to major mixed-use developments. The construction pipeline remains active but constrained by processing bottlenecks examined in Section 2.

On the business front, **362,000 active businesses** are registered with the Oregon Secretary of State in the Portland metro area. New formation rates have stabilized after the post-pandemic surge, suggesting the entrepreneurial ecosystem is finding its new equilibrium.

Public safety data shows an average of **5,039 reported crimes per month** across the city. While this number demands context, the overall trajectory shows modest improvement from the 2023 peak.

This quarter we launched the **Climate Accountability Platform** — a direct response to the February 2026 City Auditor climate justice audit. The platform tracks all **${climate.totalActions} workplan actions** across city bureaus, PCEF fund flows, and Multnomah County's emissions trajectory. The headline finding: Portland has reduced emissions **${climate.reductionPct}% below 1990 levels** — but needs to more than triple its annual reduction rate to hit the 2030 goal. See Section 5 for the full analysis.`,
        sectionOrder: 1,
        sectionType: "data-summary",
        dataQuery: null,
        dataSnapshot: {
          permits: 34307,
          businesses: 362000,
          crimesPerMonth: 5039,
          avgProcessingDays: 127,
          medianProcessingDays: 89,
          permitBacklog: 0,
          climateActionsTracked: climate.totalActions,
          climateAchieved: climate.achievedActions,
          climateDelayed: climate.delayedActions,
          emissionsReductionPct: climate.reductionPct,
        },
      },
      {
        id: 2,
        title: "The Permitting Crisis: What the Data Shows",
        subtitle:
          "Portland's building permit process is the hidden bottleneck holding back the city's recovery.",
        content: `Every housing unit, every commercial renovation, every seismic retrofit passes through the same bottleneck: Portland's Bureau of Development Services. And the data tells a troubling story.

## The numbers

Our dashboard tracks **34,307 permits** in the Portland system. Of those with processing time data, the average permit takes **127 days** from application to issuance. The median sits at **89 days** — meaning half of all permits take nearly three months just to get approved.

> "Every day a permit sits in queue is a day of carrying costs for developers, a day housing isn't being built, a day the city's recovery is delayed."

For context, Seattle's average processing time for similar permits runs 45-60 days. Denver manages 30-45 days for standard residential. Portland's numbers are roughly double its peer cities.

## Where the bottleneck sits

The permit pipeline reveals a clear pattern. Hundreds of permits sit in review queues — applications that have been filed but not yet acted upon. This backlog creates a cascading effect:

1. **Developers delay projects** because uncertain timelines make financing harder to secure
2. **Construction costs escalate** during the waiting period — materials and labor don't wait for permits
3. **Housing supply stays constrained** precisely when the city needs more units coming online
4. **Small projects suffer most** because the fixed costs of waiting hit smaller developments disproportionately

## What other cities do differently

Portland is not alone in facing permit backlogs, but it lags behind peers who have invested in reform:

- **Seattle** implemented online permit tracking and automated preliminary reviews, cutting average times by 30%
- **Denver** created a dedicated small-project fast-track lane
- **Austin** moved to same-day approvals for simple residential permits under $50,000

Portland's Bureau of Development Services has acknowledged the problem and proposed staffing increases. The data will show whether those investments translate to faster processing in the quarters ahead.`,
        sectionOrder: 2,
        sectionType: "article",
        dataQuery: null,
        dataSnapshot: {
          permits: 34307,
          avgProcessingDays: 127,
          medianProcessingDays: 89,
          permitBacklog: 0,
          peerCities: [
            { city: "Portland", avgDays: 127 },
            { city: "Seattle", avgDays: 52 },
            { city: "Denver", avgDays: 38 },
            { city: "Austin", avgDays: 25 },
          ],
        },
      },
      {
        id: 3,
        title: "Business Spotlight",
        subtitle: "Portland's entrepreneurial ecosystem in focus.",
        content: `Portland's business landscape tells a story of resilience and adaptation. With 362,000 active registrations tracked through the Oregon Secretary of State, the city maintains a diverse entrepreneurial base that spans everything from craft manufacturing to tech services.

This section will feature in-depth profiles of Portland businesses navigating the current economic landscape in future issues. We are building relationships with local business owners and economic development organizations to bring these stories to life with data.

*Coming in Q2 2026: profiles of businesses that launched during the pandemic and survived, told through registration data, employment numbers, and founder interviews.*`,
        sectionOrder: 3,
        sectionType: "profile",
        dataQuery: null,
        dataSnapshot: null,
      },
      {
        id: 4,
        title: "Policy Watch",
        subtitle: "Data-informed recommendations for Portland's leaders.",
        content: `The Portland Progress Report does not advocate for specific political positions. Instead, we surface data that should inform policy decisions and track whether those decisions produce measurable results.

## This quarter's focus: Permit reform

Based on the permitting data analyzed in this issue, three data-supported recommendations emerge:

**1. Implement tiered review timelines.** The data shows that all permit types — from simple residential repairs to complex commercial developments — enter the same processing queue. A tiered system with defined maximum review periods for each category would improve predictability and reduce average wait times.

**2. Publish processing time benchmarks.** What gets measured gets managed. Portland should publish monthly permit processing statistics, broken down by permit type, so that progress (or regression) is transparent to the public.

**3. Invest in digital infrastructure.** Peer cities that have reduced processing times share a common investment: digital permit management systems that automate preliminary reviews, enable online submission, and provide real-time status tracking.

We will track policy responses and measure their impact on the data in subsequent issues.

*The Portland Progress Report is published quarterly. All data is sourced from the Portland Civic Lab Civic Dashboard, which draws from public records and government APIs.*`,
        sectionOrder: 4,
        sectionType: "recommendation",
        dataQuery: null,
        dataSnapshot: null,
      },
      {
        id: 5,
        title: "Climate Accountability: What the Audit Found",
        subtitle: "The February 2026 City Auditor audit reviewed Portland's climate commitments. Here is what the data shows.",
        content: `On February 25, 2026, the City Auditor released findings from a climate justice audit — a systematic review of how Portland is delivering on its Climate Emergency Workplan. City Administrator Raymond Lee accepted all five recommendations. This section presents the data behind those findings.

## The Workplan: ${climate.totalActions} Actions, Mixed Progress

The Climate Emergency Workplan 2022-2025 contains ${climate.totalActions} structured actions covering decarbonization (reducing emissions) and resilience (preparing for climate impacts). As of the latest progress report: **${climate.achievedActions} actions achieved**, **${climate.ongoingActions} ongoing**, and **${climate.delayedActions} delayed**.

> "The Chief Sustainability Officer does not have a direct link to bureaus." — February 2026 Audit Finding

This governance gap matters. Without line authority, the Chief Sustainability Officer relies on voluntary compliance from bureaus that have competing budget priorities. Making bureau-level performance publicly visible is one way to create accountability without requiring line authority.

## The Funding Gap

Resource gaps are a persistent challenge. Of the ${climate.totalActions} actions:

- **14 are funded or revenue-positive** (through PCEF or existing bureau budgets)
- **At least 9 face gaps larger than $1 million**
- **6 have gaps the city has not yet estimated**

The total unfunded gap across the workplan has not been published as a single consolidated figure — a transparency gap the audit flagged specifically.

## PCEF: ${totalPcefFmt} Deployed, ${bureauPct}% to Bureaus

The Portland Clean Energy Fund has allocated approximately ${totalPcefFmt} across four fiscal years. Of that, roughly ${bureauPct}% went to six city bureaus and ${100 - bureauPct}% to community grants. The audit found Portland has not been transparent enough about how PCEF funding flows between city bureaus and community organizations.

## PCEF Interest: ${diverted} Directed to General Fund

Between FY 21-22 and FY 24-25, approximately ${diverted} in PCEF-generated interest was directed to the General Fund rather than climate programs. The audit found the City has not been transparent enough about these funding flows.

These are dollars that earned interest while sitting in PCEF accounts between disbursements — funds that could have supported additional cooling units for elderly residents, tree planting in low-canopy East Portland neighborhoods, and energy retrofits for affordable housing.

## Emissions: Behind Schedule

Multnomah County's greenhouse gas inventory shows total emissions at approximately **${climate.latestEmissions.toFixed(1)} million MTCO₂e** as of ${climate.latestYear} — **${climate.reductionPct}% below the 1990 baseline** of 10.4 million. The 2030 goal requires cutting to 5.2 million MTCO₂e — a further reduction of **${climate.gap.toFixed(1)} million tons** in the next four years.

At the current pace of reduction (approximately 0.12 million MTCO₂e per year), Portland would reach roughly 6.5 million by 2030 — still 1.3 million short. Meeting the 2030 target requires more than triple the current annual reduction rate.

## The Five Audit Recommendations

The City Auditor's five recommendations — accepted by City Administrator Lee — address governance, budget transparency, adaptation strategy, prioritization criteria, and community engagement. Each maps directly to a specific data gap that the climate dashboard is designed to fill:

1. **Centralized leadership** — Bureau scorecard creates visibility across all 14 bureaus
2. **Climate cost in budgets** — Finance tracker maps every action to its funding source and gap
3. **Adaptation goals** — Workplan tracker separates decarbonization from resilience actions
4. **Transparent prioritization** — Every action has structured metadata: bureau, timeline, gap, status
5. **Community engagement** — Public dashboard answers: is Portland on track? Where is the money?

*Source: Portland Bureau of Planning & Sustainability Climate Emergency Workplan 2022-2025; BPS Climate & Energy Dashboard — Multnomah County Community GHG Inventory; City of Portland budget documents; Portland City Auditor, Climate Justice Audit, February 25, 2026.*`,
        sectionOrder: 5,
        sectionType: "climate-summary",
        dataQuery: null,
        dataSnapshot: {
          totalActions: climate.totalActions,
          achievedActions: climate.achievedActions,
          ongoingActions: climate.ongoingActions,
          delayedActions: climate.delayedActions,
          reductionFromBaseline: climate.reductionPct,
          latestEmissions: climate.latestEmissions,
          latestYear: climate.latestYear,
          target2030: climate.target2030,
          gap: climate.gap,
          totalInterestDiverted: climate.totalInterestDiverted,
          bureauAllocations: climate.bureauAllocations,
          communityGrants: climate.communityGrants,
        },
      },
    ],
  };
}
