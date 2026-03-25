/**
 * scrape-permit-details-bulk.ts
 *
 * Scrapes detailed activity data for all permits in the CSV export.
 * Uses the Referer header to authenticate with Portland Maps API.
 *
 * Fetches: review steps, completion dates, days from setup for each permit.
 * Stores in: housing.permit_details + housing.permit_activities
 *
 * Usage: npx tsx scripts/scrape-permit-details-bulk.ts [--start N] [--limit N]
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const isPooled = DB_URL.includes("pooler.supabase.com");
const sql = postgres(DB_URL, {
  max: 3,
  ...(isPooled ? { prepare: false } : {}),
  onnotice: () => {},
});

const API_KEY = process.env.PORTLAND_MAPS_API_KEY || "7D700138A0EA40349E799EA216BF82F9";
const BASE_URL = "https://www.portlandmaps.com/api/detail.cfm";
const REFERER = "https://www.portlandmaps.com/advanced/?action=permits";
const DELAY_MS = 200; // 200ms between batches
const CONCURRENT = 5; // 5 concurrent requests

// Parse CLI args
const args = process.argv.slice(2);
const startIdx = args.includes("--start") ? parseInt(args[args.indexOf("--start") + 1], 10) : 0;
const limitArg = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1], 10) : Infinity;

// ── Parse CSV ──

function parseCSV(filepath: string): { ivr_number: string; setup_date: string }[] {
  const raw = fs.readFileSync(filepath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

  const ivrIdx = header.indexOf("IVR_NUMBER");
  const setupIdx = header.indexOf("SET_UP");

  if (ivrIdx < 0) throw new Error("CSV missing IVR_NUMBER column");

  const results: { ivr_number: string; setup_date: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (handles quoted fields)
    const fields = lines[i].match(/(".*?"|[^",]+)/g)?.map((f) => f.replace(/^"|"$/g, "").trim()) ?? [];
    const ivr = fields[ivrIdx];
    if (ivr && /^\d+$/.test(ivr)) {
      results.push({ ivr_number: ivr, setup_date: fields[setupIdx] ?? "" });
    }
  }
  return results;
}

// ── HTML Parser ──

interface ParsedPermit {
  detail_id: number;
  ivr_number: string | null;
  permit_type: string | null;
  work_description: string | null;
  address: string | null;
  setup_date: string | null;
  under_review_date: string | null;
  issue_date: string | null;
  final_date: string | null;
  status: string | null;
  activities: ParsedActivity[];
}

interface ParsedActivity {
  activity_name: string;
  activity_type: string;
  must_check: string;
  activity_status: string;
  last_activity_date: string | null;
  completed_date: string | null;
  goal_date: string | null;
  staff_contact: string | null;
}

function parseDate(s: string | null | undefined): string | null {
  if (!s || !s.trim()) return null;
  const clean = s.trim().split(" ")[0]; // Remove time portion
  // Handle MM/DD/YYYY format
  const parts = clean.split("/");
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return clean.slice(0, 10);
  return null;
}

function extractText(html: string, after: string): string | null {
  const idx = html.indexOf(after);
  if (idx < 0) return null;
  const rest = html.slice(idx + after.length);
  // Match <dd>, <td>, or plain text after </dt>
  const match = rest.match(/<(?:dd|td)[^>]*>([\s\S]*?)<\/(?:dd|td)>/i);
  if (!match) return null;
  return match[1].replace(/<[^>]+>/g, "").trim() || null;
}

function parsePermitHTML(html: string, detailId: number): ParsedPermit | null {
  if (html.includes("An error has occurred") || html.length < 500) return null;

  const permit: ParsedPermit = {
    detail_id: detailId,
    ivr_number: extractText(html, "IVR Number") ?? extractText(html, "IVR_NUMBER"),
    permit_type: extractText(html, "Permit/Case Type") ?? extractText(html, "Permit Type"),
    work_description: extractText(html, "Work/Case Description") ?? extractText(html, "Work Description"),
    address: null,
    setup_date: parseDate(extractText(html, "Set Up Date") ?? extractText(html, "Setup Date")),
    under_review_date: parseDate(extractText(html, "Under Review Date")),
    issue_date: parseDate(extractText(html, "Issue Date")),
    final_date: parseDate(extractText(html, "Final Date")),
    status: extractText(html, "Status"),
    activities: [],
  };

  // Parse activity table rows
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi);
  if (tbodyMatch) {
    for (const tbody of tbodyMatch) {
      const rows = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) ?? [];
      for (const row of rows) {
        const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? []).map((c) =>
          c.replace(/<[^>]+>/g, "").trim()
        );
        if (cells.length >= 5) {
          permit.activities.push({
            activity_name: cells[0] || "",
            activity_type: cells[1] || "",
            must_check: cells[2] || "",
            activity_status: cells[3] || "",
            last_activity_date: parseDate(cells[4]),
            goal_date: parseDate(cells[5]),
            completed_date: parseDate(cells[6]),
            staff_contact: cells[7] || null,
          });
        }
      }
    }
  }

  return permit;
}

// ── Fetch with retry ──

async function fetchDetail(detailId: number, retries = 2): Promise<string | null> {
  const url = `${BASE_URL}?format=html&detail_type=permit&sections=*&expand=1&expand_tables=1&detail_id=${detailId}&property_id=null&api_key=${API_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Referer: REFERER },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return null;
      }
      return await res.text();
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ── Insert into DB ──

async function insertPermit(permit: ParsedPermit) {
  const daysToIssue =
    permit.setup_date && permit.issue_date
      ? Math.round((new Date(permit.issue_date).getTime() - new Date(permit.setup_date).getTime()) / 86400000)
      : null;
  const daysInReview =
    permit.under_review_date && permit.issue_date
      ? Math.round((new Date(permit.issue_date).getTime() - new Date(permit.under_review_date).getTime()) / 86400000)
      : null;

  await sql`
    INSERT INTO housing.permit_details (
      detail_id, ivr_number, permit_type, work_description, address,
      setup_date, under_review_date, issue_date, final_date, status,
      days_to_issue, days_in_review
    ) VALUES (
      ${permit.detail_id}, ${permit.ivr_number}, ${permit.permit_type},
      ${permit.work_description}, ${permit.address},
      ${permit.setup_date}::date, ${permit.under_review_date}::date,
      ${permit.issue_date}::date, ${permit.final_date}::date,
      ${permit.status}, ${daysToIssue}, ${daysInReview}
    )
    ON CONFLICT (detail_id) DO UPDATE SET
      status = EXCLUDED.status,
      final_date = EXCLUDED.final_date,
      days_to_issue = EXCLUDED.days_to_issue,
      days_in_review = EXCLUDED.days_in_review
  `;

  // Delete old activities for this permit, then insert new ones
  await sql`DELETE FROM housing.permit_activities WHERE detail_id = ${permit.detail_id}`;

  for (const act of permit.activities) {
    const daysFromSetup =
      permit.setup_date && act.completed_date
        ? Math.round((new Date(act.completed_date).getTime() - new Date(permit.setup_date).getTime()) / 86400000)
        : null;

    try {
      await sql`
        INSERT INTO housing.permit_activities (
          detail_id, activity_name, activity_type, must_check,
          activity_status, last_activity_date, completed_date,
          goal_date, staff_contact, days_from_setup
        ) VALUES (
          ${permit.detail_id}, ${act.activity_name}, ${act.activity_type},
          ${act.must_check}, ${act.activity_status},
          ${act.last_activity_date}::date, ${act.completed_date}::date,
          ${act.goal_date}::date, ${act.staff_contact}, ${daysFromSetup}
        )
      `;
    } catch {
      // Skip individual activity insert errors
    }
  }
}

// ── Main ──

async function main() {
  console.log("Portland Permits — Bulk Detail Scraper");
  console.log("======================================\n");

  const csvPath = path.resolve("data/Permit-Search-Results.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found at", csvPath);
    process.exit(1);
  }

  const records = parseCSV(csvPath);
  console.log(`CSV loaded: ${records.length} permits`);

  // Check which IDs we already have
  const existingRows = await sql`SELECT detail_id FROM housing.permit_details`;
  const existingIds = new Set(existingRows.map((r) => Number(r.detail_id)));
  console.log(`Already scraped: ${existingIds.size} permits`);

  // Filter to IDs we haven't scraped yet
  const toScrape = records
    .map((r) => parseInt(r.ivr_number, 10))
    .filter((id) => !isNaN(id) && !existingIds.has(id));

  const subset = toScrape.slice(startIdx, startIdx + limitArg);
  console.log(`To scrape: ${toScrape.length} new (starting at ${startIdx}, batch: ${subset.length})\n`);

  let scraped = 0;
  let errors = 0;
  let totalActivities = 0;
  const startTime = Date.now();

  // Process in batches of CONCURRENT
  for (let i = 0; i < subset.length; i += CONCURRENT) {
    const batch = subset.slice(i, i + CONCURRENT);
    const results = await Promise.allSettled(
      batch.map(async (detailId) => {
        const html = await fetchDetail(detailId);
        if (!html) return null;
        return parsePermitHTML(html, detailId);
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        try {
          await insertPermit(result.value);
          scraped++;
          totalActivities += result.value.activities.length;
        } catch {
          errors++;
        }
      } else {
        errors++;
      }
    }

    // Progress
    const done = i + batch.length;
    if (done % 100 === 0 || done === subset.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = scraped / elapsed;
      const remaining = (subset.length - done) / Math.max(rate, 0.1);
      console.log(
        `  ${done}/${subset.length} (${scraped} scraped, ${errors} errors, ${totalActivities} activities) ` +
        `— ${rate.toFixed(1)}/s, ~${Math.round(remaining / 60)}m remaining`
      );
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  // Final stats
  const totalElapsed = (Date.now() - startTime) / 1000;
  console.log("\n======================================");
  console.log(`Done in ${Math.round(totalElapsed)}s`);
  console.log(`Scraped: ${scraped}, Errors: ${errors}`);
  console.log(`Total activities: ${totalActivities}`);

  const finalCount = await sql`SELECT count(*)::int as cnt FROM housing.permit_details`;
  const finalActivities = await sql`SELECT count(*)::int as cnt FROM housing.permit_activities`;
  console.log(`DB totals: ${finalCount[0].cnt} permits, ${finalActivities[0].cnt} activities`);

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
