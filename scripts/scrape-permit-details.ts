/**
 * scrape-permit-details.ts
 *
 * Scrapes Portland Maps permit detail pages for activity-level review data.
 * Parses HTML responses to extract permit metadata and all review activity rows.
 * Saves to PostgreSQL (housing.permit_details + housing.permit_activities) and
 * raw JSON files in data/permit-details/.
 *
 * Usage: npx tsx scripts/scrape-permit-details.ts [startId] [endId]
 * Example: npx tsx scripts/scrape-permit-details.ts 5166200 5166300
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const sql = postgres(DB_URL);

const SCRIPT_DIR = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.resolve(SCRIPT_DIR, "..", "data", "permit-details");
fs.mkdirSync(DATA_DIR, { recursive: true });

const API_KEY = "7D700138A0EA40349E799EA216BF82F9";
const BASE_URL = "https://www.portlandmaps.com/api/detail.cfm";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://www.portlandmaps.com/",
  Accept: "text/html,application/xhtml+xml,*/*",
};

const DELAY_MS = 1000;

// ── HTML entity decoder ─────────────────────────────────────────────────

function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// ── Strip HTML tags ─────────────────────────────────────────────────────

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim();
}

// ── Parse date from MM/DD/YYYY ──────────────────────────────────────────

function parseDate(dateStr: string): string | null {
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

// ── Compute days between two date strings ───────────────────────────────

function daysBetween(
  dateA: string | null,
  dateB: string | null
): number | null {
  if (!dateA || !dateB) return null;
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Extract metadata from <dl> section ──────────────────────────────────

interface PermitMetadata {
  ivr_number: string | null;
  permit_type: string | null;
  work_description: string | null;
  address: string | null;
  setup_date: string | null;
  under_review_date: string | null;
  issue_date: string | null;
  final_date: string | null;
  status: string | null;
}

function extractMetadata(html: string): PermitMetadata {
  const meta: PermitMetadata = {
    ivr_number: null,
    permit_type: null,
    work_description: null,
    address: null,
    setup_date: null,
    under_review_date: null,
    issue_date: null,
    final_date: null,
    status: null,
  };

  // Extract address from the first <h4> link
  const addressMatch = html.match(
    /<a[^>]*detail-type="property"[^>]*>.*?<h4>([^<]+)<\/h4>/
  );
  if (addressMatch) {
    meta.address = stripTags(addressMatch[1]);
  }

  // Extract <dt>...<dd> pairs
  const dtddPattern = /<dt>([^<]*)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let match;
  while ((match = dtddPattern.exec(html)) !== null) {
    const label = stripTags(match[1]).toLowerCase();
    const rawValue = stripTags(match[2]);

    if (label.includes("ivr number")) {
      meta.ivr_number = rawValue;
    } else if (label.includes("permit/case type") || label.includes("permit type")) {
      meta.permit_type = rawValue;
    } else if (label.includes("work") || label.includes("description")) {
      meta.work_description = rawValue;
    } else if (label === "set up date") {
      meta.setup_date = parseDate(rawValue);
    } else if (label.includes("under review")) {
      meta.under_review_date = parseDate(rawValue);
    } else if (label === "issue date") {
      meta.issue_date = parseDate(rawValue);
    } else if (label === "final date") {
      meta.final_date = parseDate(rawValue);
    } else if (label === "status") {
      meta.status = rawValue;
    }
  }

  return meta;
}

// ── Extract activity rows from the first <tbody> ────────────────────────

interface ActivityRow {
  activity_name: string;
  activity_type: string;
  must_check: string;
  activity_status: string;
  last_activity_date: string | null;
  completed_date: string | null;
  goal_date: string | null;
  staff_contact: string;
}

function extractActivities(html: string): ActivityRow[] {
  const activities: ActivityRow[] = [];

  // Find the first tbody (the main activity table, not the modal duplicate)
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tbodyMatch) return activities;

  const tbody = tbodyMatch[1];

  // Extract each <tr>...</tr>
  const rowPattern = /<tr>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowPattern.exec(tbody)) !== null) {
    const rowHtml = rowMatch[1];

    // Extract all <td>...</td> cells
    const cellPattern = /<td>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }

    if (cells.length >= 7) {
      activities.push({
        activity_name: cells[0],
        activity_type: cells[1],
        must_check: cells[2],
        activity_status: cells[3],
        last_activity_date: parseDate(cells[4]),
        goal_date: parseDate(cells[5]),
        completed_date: parseDate(cells[6]),
        staff_contact: cells[7] ?? "",
      });
    }
  }

  return activities;
}

// ── Fetch a single permit ───────────────────────────────────────────────

async function fetchPermit(detailId: number): Promise<{
  metadata: PermitMetadata;
  activities: ActivityRow[];
  rawHtml: string;
} | null> {
  const url = `${BASE_URL}?format=html&detail_type=permit&sections=*&expand=1&expand_tables=1&detail_id=${detailId}&api_key=${API_KEY}`;

  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) {
    return null;
  }

  const html = await res.text();

  // Check if the response has actual permit content
  if (
    !html.includes("IVR Number") &&
    !html.includes("detail-section") &&
    !html.includes("activity-table")
  ) {
    return null;
  }

  const metadata = extractMetadata(html);
  const activities = extractActivities(html);

  // If no IVR number found, this isn't a valid permit page
  if (!metadata.ivr_number && !metadata.permit_type) {
    return null;
  }

  return { metadata, activities, rawHtml: html };
}

// ── Save to PostgreSQL ──────────────────────────────────────────────────

async function saveToDb(
  detailId: number,
  meta: PermitMetadata,
  activities: ActivityRow[]
): Promise<void> {
  const daysToIssue = daysBetween(meta.setup_date, meta.issue_date);
  const daysInReview = daysBetween(meta.setup_date, meta.under_review_date);

  await sql`
    INSERT INTO housing.permit_details (
      detail_id, ivr_number, permit_type, work_description, address,
      setup_date, under_review_date, issue_date, final_date, status,
      days_to_issue, days_in_review, fetched_at
    ) VALUES (
      ${detailId}, ${meta.ivr_number}, ${meta.permit_type}, ${meta.work_description}, ${meta.address},
      ${meta.setup_date}, ${meta.under_review_date}, ${meta.issue_date}, ${meta.final_date}, ${meta.status},
      ${daysToIssue}, ${daysInReview}, NOW()
    )
    ON CONFLICT (detail_id) DO UPDATE SET
      ivr_number = EXCLUDED.ivr_number,
      permit_type = EXCLUDED.permit_type,
      work_description = EXCLUDED.work_description,
      address = EXCLUDED.address,
      setup_date = EXCLUDED.setup_date,
      under_review_date = EXCLUDED.under_review_date,
      issue_date = EXCLUDED.issue_date,
      final_date = EXCLUDED.final_date,
      status = EXCLUDED.status,
      days_to_issue = EXCLUDED.days_to_issue,
      days_in_review = EXCLUDED.days_in_review,
      fetched_at = NOW()
  `;

  // Delete existing activities for this permit (to allow re-scrape)
  await sql`DELETE FROM housing.permit_activities WHERE detail_id = ${detailId}`;

  for (const act of activities) {
    const daysFromSetup = daysBetween(meta.setup_date, act.completed_date);

    await sql`
      INSERT INTO housing.permit_activities (
        detail_id, activity_name, activity_type, must_check, activity_status,
        last_activity_date, completed_date, goal_date, staff_contact, days_from_setup
      ) VALUES (
        ${detailId}, ${act.activity_name}, ${act.activity_type}, ${act.must_check},
        ${act.activity_status}, ${act.last_activity_date}, ${act.completed_date},
        ${act.goal_date}, ${act.staff_contact}, ${daysFromSetup}
      )
    `;
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const startId = parseInt(process.argv[2] || "5166200", 10);
  const endId = parseInt(process.argv[3] || "5166300", 10);

  console.log(`\n=== Portland Maps Permit Detail Scraper ===`);
  console.log(`Range: ${startId} to ${endId} (${endId - startId + 1} permits)`);
  console.log(`Delay: ${DELAY_MS}ms between requests\n`);

  // Ensure tables exist
  await sql`
    CREATE TABLE IF NOT EXISTS housing.permit_details (
      detail_id INTEGER PRIMARY KEY,
      ivr_number TEXT,
      permit_type TEXT,
      work_description TEXT,
      address TEXT,
      setup_date DATE,
      under_review_date DATE,
      issue_date DATE,
      final_date DATE,
      status TEXT,
      days_to_issue INTEGER,
      days_in_review INTEGER,
      fetched_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS housing.permit_activities (
      id SERIAL PRIMARY KEY,
      detail_id INTEGER REFERENCES housing.permit_details(detail_id),
      activity_name TEXT,
      activity_type TEXT,
      must_check TEXT,
      activity_status TEXT,
      last_activity_date DATE,
      completed_date DATE,
      goal_date DATE,
      staff_contact TEXT,
      days_from_setup INTEGER
    )
  `;

  let fetched = 0;
  let skipped = 0;
  let errors = 0;

  for (let id = startId; id <= endId; id++) {
    const progress = `[${id - startId + 1}/${endId - startId + 1}]`;

    try {
      const result = await fetchPermit(id);

      if (!result) {
        skipped++;
        console.log(`${progress} ${id} - skipped (no valid permit data)`);
      } else {
        const { metadata, activities, rawHtml } = result;

        // Save raw JSON
        const jsonPath = path.join(DATA_DIR, `${id}.json`);
        fs.writeFileSync(
          jsonPath,
          JSON.stringify({ detail_id: id, metadata, activities }, null, 2)
        );

        // Save to DB
        await saveToDb(id, metadata, activities);

        fetched++;
        console.log(
          `${progress} ${id} - ${metadata.permit_type ?? "unknown type"} | ${activities.length} activities | ${metadata.status ?? "?"}`
        );
      }
    } catch (err) {
      errors++;
      console.error(
        `${progress} ${id} - ERROR: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Polite delay
    if (id < endId) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Fetched: ${fetched}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors:  ${errors}`);
  console.log(`Total:   ${endId - startId + 1}`);

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
