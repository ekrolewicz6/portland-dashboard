import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Category classification ─────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  housing: [
    "housing", "inclusionary", "rent", "rental", "tenant", "landlord",
    "shelter", "affordable", "eviction", "short-term rental", "airbnb",
    "home", "homeowner", "property maintenance",
  ],
  homelessness: [
    "homeless", "shelter", "unsheltered", "joint office", "johs",
    "encampment", "houseless", "unhoused", "portland solutions",
  ],
  safety: [
    "police", "fire", "vision zero", "traffic", "crash", "crime",
    "gun violence", "body camera", "tow", "towing", "911", "emergency",
    "public safety",
  ],
  climate: [
    "climate", "emission", "sustainability", "carbon", "fossil fuel",
    "zenith", "clean energy", "pcef", "workplan", "adaptation",
  ],
  education: [
    "school", "education", "arts tax", "teacher", "student", "pps",
    "enrollment", "graduation",
  ],
  fiscal: [
    "budget", "spending", "fiscal", "asset management", "infrastructure",
    "technology purchasing", "procurement", "fund", "unspent",
    "per-pupil", "tax revenue",
  ],
  accountability: [
    "audit", "recommendation", "implement", "oversight", "ombudsman",
    "fraud", "lobbying", "campaign finance", "disclosure", "transparency",
    "accountability", "peer review", "impact report",
  ],
  quality_of_life: [
    "parks", "recreation", "library", "community", "archive",
    "neighborhood", "raceway", "kenton",
  ],
  transportation: [
    "transportation", "pbot", "transit", "bike", "pedestrian",
    "speed camera", "bus", "trimet",
  ],
  economy: [
    "business", "economic", "employment", "jobs", "workforce",
    "downtown", "development",
  ],
};

interface ParsedArticle {
  title: string;
  date: string;
  url: string;
  description: string;
}

function classifyArticle(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const matches: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches.push(category);
        break;
      }
    }
  }

  // Everything from the Auditor is accountability-adjacent
  if (matches.length === 0) {
    matches.push("accountability");
  }

  return matches;
}

function generateRelevance(title: string, categories: string[]): string {
  const catNames = categories
    .map((c) => c.replace(/_/g, " "))
    .join(", ");
  return `Portland City Auditor finding relevant to the ${catNames} dashboard — tracking government performance and accountability.`;
}

// ── HTML parsing (no external deps) ─────────────────────────────────────

function parseArticlesFromHtml(html: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];

  // Portland.gov wraps each article in <div class="row position-relative">
  // Structure: <h2><a href="/auditor/...">title</a></h2> <p>summary</p> <time datetime="...">
  const blocks = html.split(/class="row position-relative"/i);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    // Extract URL and title from the <a> tag inside <h2>
    const linkMatch = block.match(
      /href="(\/auditor[^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    if (!linkMatch) continue;

    const path = linkMatch[1];
    // Skip non-news links (nav, filter links)
    if (!path.includes("news/20")) continue;

    const url = `https://www.portland.gov${path}`;
    const title = linkMatch[2]
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!title || title.length < 10) continue;

    // Extract date from <time datetime="...">
    const dateMatch = block.match(/datetime="(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) continue;
    const date = dateMatch[1];

    // Extract description from <p> tags between the link and the time element
    // The summary is in the first <p> after the </h2> closing tag
    const afterHeading = block.split(/<\/h[23]>/i)[1] || "";
    const descMatch = afterHeading.match(/<p>([\s\S]*?)<\/p>/i);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    articles.push({ title, date, url, description });
  }

  return articles;
}

// ── Fetch individual article for summary ────────────────────────────────

async function fetchArticleSummary(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Portland-Civic-Dashboard/1.0 (civic data aggregation)",
      },
    });
    if (!res.ok) return "";

    const html = await res.text();

    // Extract main content area
    const contentMatch = html.match(
      /class="[^"]*field--name-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    );
    if (!contentMatch) {
      // Try alternate content selectors
      const altMatch = html.match(
        /class="[^"]*node__content[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
      );
      if (!altMatch) return "";
      return altMatch[1]
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500);
    }

    return contentMatch[1]
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);
  } catch {
    return "";
  }
}

// ── Main handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Fetching auditor news...");

    // Fetch the auditor news listing page
    const res = await fetch("https://www.portland.gov/auditor/news", {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Portland-Civic-Dashboard/1.0 (civic data aggregation)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.status}` },
        { status: 502 },
      );
    }

    const html = await res.text();
    const articles = parseArticlesFromHtml(html);
    console.log(`[cron] Parsed ${articles.length} articles from listing page`);

    if (articles.length === 0) {
      // Fallback: if HTML parsing failed, still return success
      return NextResponse.json({
        message: "No articles parsed from page — HTML structure may have changed",
        articlesFound: 0,
        inserted: 0,
      });
    }

    // Only process articles from the last 12 months
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    const recentArticles = articles.filter(
      (a) => new Date(a.date) >= cutoffDate,
    );

    console.log(`[cron] ${recentArticles.length} articles within last 12 months`);

    // Ensure table exists
    await sql`
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
    `;

    let inserted = 0;
    let skipped = 0;

    for (const article of recentArticles) {
      // Check if we already have this URL
      const existing = await sql`
        SELECT id FROM content.news_context WHERE url = ${article.url}
      `;
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Classify into dashboard categories
      const categories = classifyArticle(article.title, article.description);

      // If we don't have a description from the listing, fetch the article
      let summary = article.description;
      if (!summary || summary.length < 50) {
        summary = await fetchArticleSummary(article.url);
      }
      if (!summary) {
        summary = article.title;
      }

      // Truncate summary to reasonable length
      if (summary.length > 400) {
        summary = summary.slice(0, 397) + "...";
      }

      // Insert one row per category (so the article shows up on each relevant dashboard)
      for (const category of categories) {
        const relevance = generateRelevance(article.title, [category]);

        try {
          await sql`
            INSERT INTO content.news_context
              (category, headline, source, url, published_date, summary, relevance)
            VALUES (
              ${category},
              ${article.title},
              ${"Portland City Auditor"},
              ${article.url},
              ${article.date},
              ${summary},
              ${relevance}
            )
            ON CONFLICT DO NOTHING
          `;
          inserted++;
        } catch (err: any) {
          console.log(`[cron] Insert error: ${err.message}`);
        }
      }
    }

    // Clean up articles older than 18 months
    const cleanupCutoff = new Date();
    cleanupCutoff.setMonth(cleanupCutoff.getMonth() - 18);
    const deleted = await sql`
      DELETE FROM content.news_context
      WHERE source = 'Portland City Auditor'
        AND published_date < ${cleanupCutoff.toISOString().slice(0, 10)}
      RETURNING id
    `;

    console.log(
      `[cron] Done: ${inserted} inserted, ${skipped} skipped, ${deleted.length} cleaned up`,
    );

    return NextResponse.json({
      message: "Auditor news fetch complete",
      articlesFound: recentArticles.length,
      inserted,
      skipped,
      cleaned: deleted.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[cron] Error:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
