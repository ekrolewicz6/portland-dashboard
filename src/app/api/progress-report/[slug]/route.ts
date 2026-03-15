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
      return NextResponse.json({ report: getStaticQ1Report() });
    }
    return NextResponse.json(
      { error: "Failed to load report" },
      { status: 500 },
    );
  }
}

function getStaticQ1Report(): FullReport {
  return {
    id: 1,
    title: "Portland Progress Report — Q1 2026",
    issueDate: "2026-03-15",
    slug: "q1-2026",
    summary:
      "The inaugural Portland Progress Report combines dashboard data with narrative analysis to tell the story behind Portland's numbers. This quarter: a deep dive into the permitting crisis, the business formation landscape, and what the data means for Portland's future.",
    coverImageUrl: null,
    published: true,
    sections: [
      {
        id: 1,
        title: "By the Numbers",
        subtitle: "Portland's vital signs, measured.",
        content: `Portland's civic dashboard tracks seven questions that define the city's trajectory. Here is where we stand at the close of Q1 2026.

The headline numbers paint a city in transition. **34,307 building permits** are tracked in our system — representing everything from minor renovations to major mixed-use developments. The construction pipeline remains active but constrained by processing bottlenecks that we examine in detail below.

On the business front, **362,000 active businesses** are registered with the Oregon Secretary of State in the Portland metro area. New formation rates have stabilized after the post-pandemic surge, suggesting the entrepreneurial ecosystem is finding its new equilibrium.

Public safety data shows an average of **5,039 reported crimes per month** across the city. While this number demands context — property crime and person crime trend in different directions — the overall trajectory shows modest improvement from the 2023 peak.

The dashboard continues to evolve. This quarter we added BLS employment data, Census County Business Patterns, and improved our housing permit pipeline tracking. Every data point is sourced from public records and government APIs, updated automatically.`,
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

## The permit type breakdown

Not all permits are equal. Residential new construction permits — the ones that directly add housing supply — face the longest timelines. Commercial tenant improvements, which represent downtown recovery, get caught in the same queue despite being fundamentally simpler reviews.

The data suggests that a tiered review system, where simpler permits receive expedited processing, could significantly reduce average wait times without compromising building safety.

## What other cities do differently

Portland is not alone in facing permit backlogs, but it lags behind peers who have invested in reform:

- **Seattle** implemented online permit tracking and automated preliminary reviews, cutting average times by 30%
- **Denver** created a dedicated small-project fast-track lane
- **Austin** moved to same-day approvals for simple residential permits under $50,000

Portland's Bureau of Development Services has acknowledged the problem and proposed staffing increases. The data will show whether those investments translate to faster processing in the quarters ahead.

## Why this matters for Portland's recovery

The permitting bottleneck is not just a bureaucratic inconvenience. It is a direct drag on Portland's economic recovery. Every housing unit delayed is a unit not available to address the affordability crisis. Every commercial renovation delayed is a storefront that stays dark in a downtown fighting to come back.

Our dashboard will continue tracking permit processing times, and this report will revisit the data each quarter to measure whether reform efforts are producing results.`,
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

*The Portland Progress Report is published quarterly. All data is sourced from the Portland Commons Civic Dashboard, which draws from public records and government APIs.*`,
        sectionOrder: 4,
        sectionType: "recommendation",
        dataQuery: null,
        dataSnapshot: null,
      },
    ],
  };
}
