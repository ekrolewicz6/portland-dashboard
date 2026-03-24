/**
 * seed-news-context.ts
 *
 * Creates the content.news_context table and seeds initial news stories
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
  {
    category: "education",
    headline:
      "Here's What PPS Will Consider as It Selects Schools to Close",
    source: "Willamette Week",
    url: "https://www.wweek.com/news/schools/2026/03/18/heres-what-pps-will-consider-as-it-selects-schools-to-close/",
    published_date: "2026-03-18",
    summary:
      "PPS plans to close up to 10 schools by 2027-28. Enrollment has dropped 12% since 2018-19 peak of 48,708 to 42,622. PSU forecasts project 37,057 students by 2034-35 — another 13% decline. District faces $50M budget deficit. School Board wants all schools on the table, not just lowest-enrolled.",
    relevance:
      "Direct context for the enrollment decline shown in dashboard data. The 15 lowest-enrolled schools (Rosa Parks at 160 to Rieke at 264) face potential closure.",
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
    // Create schema (may already exist for progress_reports / report_sections)
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS content`);

    // Create table
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

    // Create index
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_news_category
        ON content.news_context(category)
    `);

    console.log("  Created content.news_context table");

    // Insert stories
    let inserted = 0;
    for (const s of STORIES) {
      try {
        // Avoid duplicates by checking URL
        const existing = await sql`
          SELECT id FROM content.news_context WHERE url = ${s.url}
        `;
        if (existing.length > 0) {
          console.log(`  Skipped (already exists): ${s.headline}`);
          // Update in place
          await sql`
            UPDATE content.news_context SET
              category = ${s.category},
              headline = ${s.headline},
              source = ${s.source},
              published_date = ${s.published_date},
              summary = ${s.summary},
              relevance = ${s.relevance}
            WHERE url = ${s.url}
          `;
          inserted++;
          continue;
        }

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
    console.log(`  Inserted/updated ${inserted} news stories`);

    // Verify
    const rows = await sql`
      SELECT category, headline, source, published_date
      FROM content.news_context
      ORDER BY published_date DESC
    `;
    console.log("\n  Stories in database:");
    for (const row of rows) {
      console.log(
        `    [${row.category}] ${row.headline} — ${row.source} (${String(row.published_date).slice(0, 10)})`
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
