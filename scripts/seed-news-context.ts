/**
 * seed-news-context.ts
 *
 * Creates the content.news_context table and seeds news stories
 * that provide context for dashboard data.
 *
 * Usage: npx tsx scripts/seed-news-context.ts
 */

import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

interface NewsStory {
  category: string;
  headline: string;
  source: string;
  url: string;
  published_date: string;
  summary: string;
  relevance: string;
}

const STORIES: NewsStory[] = [
  // ── Education ──
  {
    category: "education",
    headline: "Here's What PPS Will Consider as It Selects Schools to Close",
    source: "Willamette Week",
    url: "https://www.wweek.com/news/schools/2026/03/18/heres-what-pps-will-consider-as-it-selects-schools-to-close/",
    published_date: "2026-03-18",
    summary:
      "PPS plans to close up to 10 schools by 2027-28. Enrollment has dropped 12% since 2018-19 peak of 48,708 to 42,622. PSU forecasts project 37,057 students by 2034-35. District faces $50M budget deficit.",
    relevance:
      "Direct context for the enrollment decline shown in dashboard data. The 15 lowest-enrolled schools face potential closure.",
  },
  {
    category: "education",
    headline: "Arts Tax: City needs improvements to deliver on voter approved arts education and grants commitments",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2026/3/18/arts-tax-city-needs-make-improvements-deliver-voter-approved",
    published_date: "2026-03-18",
    summary:
      "Portland's Arts Tax ($35/yr) generates ~$11.2M annually. Audit found city overpaid 5 of 6 school districts $8K–$1.3M using wrong salary calculations. Only 5% of grant funds target underserved communities.",
    relevance:
      "Arts education funding directly affects all 6 Portland-area school districts shown in our enrollment data. Audit reveals misallocation across the same districts we track.",
  },
  {
    category: "fiscal",
    headline: "Arts Tax: City needs improvements to deliver on voter approved arts education and grants commitments",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2026/3/18/arts-tax-city-needs-make-improvements-deliver-voter-approved",
    published_date: "2026-03-18",
    summary:
      "Portland's Arts Tax ($35/yr) generates ~$11.2M annually. Audit found city overpaid 5 of 6 school districts $8K–$1.3M using wrong salary calculations. Could have disbursed $1.3M more in grants with corrected calculations.",
    relevance:
      "Tax revenue misallocation — $11.2M annual program with significant calculation errors and oversight gaps.",
  },
  // ── Housing ──
  {
    category: "housing",
    headline: "Unspent housing funds show accountability isn't optional in Portland's next budget",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/news/2026/3/25/unspent-housing-funds-show-accountability-isnt-optional-portlands-next",
    published_date: "2026-03-25",
    summary:
      "$100+ million in housing funds went unbudgeted for years without City oversight. Disclosed in February by Portland's City Administrator. Upcoming audits include 911/emergency comms, police body cameras, gun violence prevention.",
    relevance:
      "Major housing accountability gap — over $100M in housing funds sat unspent while Portland faces a housing crisis. Directly relevant to housing pipeline and spending data.",
  },
  {
    category: "housing",
    headline: "Inclusionary Housing: Housing Bureau should improve program goals, support, and monitoring",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/5/15/inclusionary-housing-housing-bureau-should-improve-program",
    published_date: "2024-05-15",
    summary:
      "566 affordable apartments built across 78 buildings as of April 2023, with 1,157 more anticipated. But 44% of 3-bedroom units vacant 4-15 months after opening. Bureau was 2 years behind on compliance reviews. $5M+ in fees used for operations, not building housing.",
    relevance:
      "Directly tracks the affordable housing pipeline. 566 built + 1,157 planned units are part of Portland's housing supply. The vacancy and monitoring failures undermine the program's goals.",
  },
  {
    category: "housing",
    headline: "Short-Term Rentals: Changes needed to increase equity and effectiveness",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/ombudsman/news/2026/3/4/accessory-short-term-rentals-changes-city-rules-and-enforcement",
    published_date: "2026-03-04",
    summary:
      "Portland's first-time STR violation fine of $27,513 is 27x higher than any other city surveyed. ~55% of operators fined $10K+ may be non-white, immigrants, or LGBTQ+. Complaint-based enforcement yields citations in only 46% of cases.",
    relevance:
      "Housing policy enforcement with significant equity concerns. STR regulation affects housing supply and disproportionately impacts vulnerable communities.",
  },
  // ── Climate ──
  {
    category: "climate",
    headline: "Climate Justice: Clear direction, strategies, and transparency needed for climate commitments",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2026/2/25/climate-justice-clear-direction-strategies-and-transparency",
    published_date: "2026-02-25",
    summary:
      "79% of Portland's 47 Climate Emergency Workplan actions remain ongoing, only 13% achieved, 9% delayed. ~25% of actions have $500K+ funding gap. No climate adaptation targets despite heat, wildfire, and flooding risks. 21% of actions lack timeframes.",
    relevance:
      "This is the source audit for our Climate Accountability Platform. The 79%/13%/9% action status directly maps to the workplan tracker we built.",
  },
  // ── Safety ──
  {
    category: "safety",
    headline: "Vision Zero: PBOT needs to evaluate whether safety projects reduce traffic deaths",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/11/13/vision-zero-portland-bureau-transportation-needs",
    published_date: "2024-11-13",
    summary:
      "Traffic fatalities rose to 69 in 2023 despite Vision Zero adoption in 2016. 70% of fatalities in low-light conditions. Promised speed cameras not installed. 65% of safety spending focused on high-equity areas, but 22% of fatalities in low-income/BIPOC communities on streets outside the High Crash Network.",
    relevance:
      "Traffic deaths are a core safety metric. Rising fatalities despite Vision Zero is one of Portland's biggest accountability failures — the audit documents exactly why.",
  },
  {
    category: "safety",
    headline: "Fire & Rescue's Community Health Division needs guidance and leadership",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/1/10/audit-report-portland-fire-rescues-community-health-division",
    published_date: "2024-01-10",
    summary:
      "Audit identified management gaps in Portland Fire & Rescue's community health programs. Recommended improved goals and oversight to better serve residents and reduce demands on firefighters.",
    relevance:
      "Emergency services capacity directly affects public safety outcomes. Fire Bureau community health programs are part of the city's first-responder system.",
  },
  // ── Homelessness ──
  {
    category: "homelessness",
    headline: "Joint Office of Homeless Services: Sustained focus on shelter system needed",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/4/17/joint-office-homeless-services-sustained-focus-shelter-system",
    published_date: "2024-04-17",
    summary:
      "300-350 families waiting for ~100 shelter beds (1-6 month waits). Only 25% of shelter exits reached permanent housing (FY 2023). More people returned to homelessness (1,287) than were housed (1,136). Only 3 of 18 shelters met exit-to-housing goals. Black residents: 7% of population but 17% of homeless population.",
    relevance:
      "Core data for the homelessness flow-through pipeline. Shelter capacity, wait times, housing outcomes, and racial disparities are exactly what our dashboard tracks.",
  },
  {
    category: "homelessness",
    headline: "JOHS contract managers have more training, but role conflicts remain",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/fraud-hotline/news/2024/2/21/fraud-hotline-update-joint-office-homeless-services-contract",
    published_date: "2024-02-21",
    summary:
      "Follow-up found progress on staff training for homeless services contract managers, but organizational hesitation to implement separation of duties recommendations persists.",
    relevance:
      "Accountability follow-up on homeless services contracting — tracks whether audit recommendations are being implemented.",
  },
  // ── Accountability ──
  {
    category: "accountability",
    headline: "2024 Audit Impact Report: Prioritization needed to implement outstanding recommendations",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2025/10/1/2024-audit-impact-report-prioritization-needed-implement",
    published_date: "2025-10-01",
    summary:
      "Portland has implemented only 49% of audit recommendations over 5 years, down from 51% in 2022. The national average is 64%. Top barriers: prioritization (35 stalled), coordination (19 stalled). Unimplemented recommendations disproportionately affect vulnerable populations.",
    relevance:
      "This IS the accountability scorecard. Portland's 49% implementation rate vs 64% national average is the single most important accountability metric.",
  },
  {
    category: "accountability",
    headline: "2023 Audit Impact Report: Leadership on coordination and prioritization most needed",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/12/18/2023-audit-impact-report-leadership-coordination",
    published_date: "2024-12-18",
    summary:
      "City implemented less than half of audit recommendations by 2023, performing below comparable municipalities. Implementation rates varied significantly by service area. Bold leadership emphasizing coordination is essential.",
    relevance:
      "Prior year accountability data — shows the trend of declining recommendation implementation. The pattern continued into 2024.",
  },
  {
    category: "accountability",
    headline: "Exit Poll: Portland voters were well informed on ranked-choice voting",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/elections/news/2024/12/3/exit-poll-portland-voters-were-well-informed-ranked-choice-voting",
    published_date: "2024-12-03",
    summary:
      "Most Portland voters understood ranked-choice voting in the November 2024 election. However, outreach gaps existed for District 1 and communities of color.",
    relevance:
      "Voter engagement and election integrity are part of government accountability. The new electoral system's first major test showed broadly positive results with equity gaps to address.",
  },
  // ── Fiscal ──
  {
    category: "fiscal",
    headline: "Asset Management: Strategic and coordinated approach needed for City's infrastructure",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2025/4/23/asset-management-strategic-and-coordinated-approach-needed",
    published_date: "2025-04-23",
    summary:
      "Portland needs over $1 billion annually for infrastructure maintenance (up from $112M in 2007). City owns $74+ billion in assets. Nearly 25% of assets in poor/very poor condition. Most infrastructure built mid-1900s is near or beyond useful life.",
    relevance:
      "The $1B+ annual infrastructure gap is a defining fiscal challenge. This audit quantifies the cost of decades of deferred maintenance across all city systems.",
  },
  {
    category: "fiscal",
    headline: "Technology Purchasing: Citywide strategy and guidance needed",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/10/30/technology-purchasing-citywide-strategy-and-guidance-needed",
    published_date: "2024-10-30",
    summary:
      "$63M in annual technology spending with no citywide strategy. Delays of 1-32 months across 7 case studies. Transportation wallet app delayed 32 months then cancelled. Can't track spending with historically disadvantaged businesses despite 20% goal.",
    relevance:
      "Government spending efficiency — $63M/yr in technology with no coordinated strategy is a fiscal accountability issue.",
  },
  {
    category: "fiscal",
    headline: "Unspent housing funds show accountability isn't optional in Portland's next budget",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/news/2026/3/25/unspent-housing-funds-show-accountability-isnt-optional-portlands-next",
    published_date: "2026-03-25",
    summary:
      "$100+ million in housing funds went unbudgeted for years. City faces historic budget shortfall. Auditor requests budget cuts limited to 3% vs citywide 10% being considered.",
    relevance:
      "Budget accountability — $100M in unspent housing funds while the city faces a $93M general fund shortfall highlights fiscal management failures.",
  },
  // ── Quality of Life ──
  {
    category: "quality_of_life",
    headline: "Parks Fiscal Management: Systemwide goals and sustainability strategies needed",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2025/10/15/parks-fiscal-management-systemwide-goals-and-sustainability",
    published_date: "2025-10-15",
    summary:
      "86% of Parks assets — playgrounds, paths, restrooms — are in poor or very bad condition. Maintenance backlog estimated at $550-800 million. Parks manages 11,677 acres. 5 reviewed capital projects generated ~$4.7M in unfunded annual maintenance costs.",
    relevance:
      "Parks condition directly measures quality of life. The 86% poor/very-bad rate and $550-800M backlog show the gap between what Portland has and what it maintains.",
  },
  // ── Transportation ──
  {
    category: "transportation",
    headline: "Vision Zero: PBOT needs to evaluate whether safety projects reduce traffic deaths",
    source: "Portland City Auditor",
    url: "https://www.portland.gov/auditor/audit-services/news/2024/11/13/vision-zero-portland-bureau-transportation-needs",
    published_date: "2024-11-13",
    summary:
      "Traffic fatalities rose to 69 in 2023. PBOT partially completed safety projects but lacks systematic evaluation of whether they work. Promised speed cameras not installed. Transportation wallet app delayed 32 months then cancelled.",
    relevance:
      "Transportation safety outcomes — rising deaths despite Vision Zero investments demands evaluation of whether PBOT projects are effective.",
  },
];

async function main() {
  console.log("Portland Dashboard — News Context Seed");
  console.log("======================================");

  const sql = postgres(DB_URL, {
    max: 5,
    onnotice: () => {},
  });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS content`);

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS content.news_context (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        headline TEXT NOT NULL,
        source TEXT NOT NULL,
        url TEXT NOT NULL,
        published_date DATE NOT NULL,
        summary TEXT NOT NULL,
        relevance TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_news_category
        ON content.news_context(category)
    `);

    console.log("  Created content.news_context table");

    // Clear existing auditor stories to avoid duplicates
    const cleared = await sql`
      DELETE FROM content.news_context
      WHERE source = 'Portland City Auditor'
      RETURNING id
    `;
    if (cleared.length > 0) {
      console.log(`  Cleared ${cleared.length} existing auditor stories`);
    }

    let inserted = 0;
    for (const s of STORIES) {
      try {
        await sql`
          INSERT INTO content.news_context
            (category, headline, source, url, published_date, summary, relevance)
          VALUES (
            ${s.category}, ${s.headline}, ${s.source}, ${s.url},
            ${s.published_date}, ${s.summary}, ${s.relevance}
          )
        `;
        inserted++;
      } catch (err: any) {
        console.log(`  Error inserting story: ${err.message}`);
      }
    }
    console.log(`  Inserted ${inserted} news stories`);

    // Verify
    const rows = await sql`
      SELECT category, headline, source, published_date
      FROM content.news_context
      ORDER BY published_date DESC
    `;
    console.log(`\n  ${rows.length} stories in database:`);
    for (const row of rows) {
      console.log(
        `    [${row.category}] ${row.headline.slice(0, 70)}... — ${row.source} (${String(row.published_date).slice(0, 10)})`
      );
    }

    await sql.end();
  } catch (err: any) {
    console.error("  Database error:", err.message);
    await sql.end();
    throw err;
  }

  console.log("\n======================================");
  console.log("News context seed complete!");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
