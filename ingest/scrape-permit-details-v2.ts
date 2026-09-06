/**
 * scrape-permit-details-v2.ts
 *
 * Two-phase pipeline:
 *   Phase 1 (--fetch):  Fetch HTML from Portland Maps, save to data/permit-html/
 *   Phase 2 (--parse):  Parse saved HTML files and insert into DB
 *
 * This ensures we never lose fetched data — HTML is saved first, parsing is separate.
 * Both phases are idempotent: re-running skips already-fetched/already-parsed records.
 *
 * Usage:
 *   npx tsx ingest/scrape-permit-details-v2.ts --fetch          # fetch HTML
 *   npx tsx ingest/scrape-permit-details-v2.ts --parse          # parse + insert
 *   npx tsx ingest/scrape-permit-details-v2.ts --fetch --parse  # both
 *   npx tsx ingest/scrape-permit-details-v2.ts --fetch --parse --start-id 5242709 --end-id 5259708
 */

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

// Load .env.local for DATABASE_URL
const envPath = path.resolve(import.meta.dirname ?? ".", "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const DB_URL = requireDatabaseUrl();
console.log(`DB: ${DB_URL.includes("supabase") ? "Supabase" : "Local"} (${DB_URL.substring(0, 40)}...)`);
const isPooled = DB_URL.includes("pooler.supabase.com");
const API_KEY = process.env.PORTLAND_MAPS_API_KEY || "7D700138A0EA40349E799EA216BF82F9";
const REFERER = "https://www.portlandmaps.com/advanced/?action=permits";

const HTML_DIR = path.resolve("data/permit-html");
const CSV_PATH = path.resolve("data/Permit-Search-Results.csv");
const CONCURRENT = parseInt(process.env.PERMIT_DETAIL_CONCURRENT || "5", 10);
const DELAY_MS = parseInt(process.env.PERMIT_DETAIL_DELAY_MS || "200", 10);

const args = process.argv.slice(2);
const doFetch = args.includes("--fetch");
const doParse = args.includes("--parse");
const limitArg = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1], 10) : Infinity;
const startIdArg = args.includes("--start-id") ? parseInt(args[args.indexOf("--start-id") + 1], 10) : null;
const endIdArg = args.includes("--end-id") ? parseInt(args[args.indexOf("--end-id") + 1], 10) : null;

if (!doFetch && !doParse) {
  console.error("Usage: --fetch, --parse, or both");
  process.exit(1);
}

// ── CSV Parser ──

function loadIVRNumbers(): number[] {
  if (startIdArg !== null || endIdArg !== null) {
    if (!startIdArg || !endIdArg || startIdArg > endIdArg) {
      throw new Error("Range mode requires --start-id N --end-id N with start <= end");
    }
    const ids: number[] = [];
    for (let id = startIdArg; id <= endIdArg; id++) ids.push(id);
    return ids;
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const ivrIdx = header.indexOf("IVR_NUMBER");
  if (ivrIdx < 0) throw new Error("CSV missing IVR_NUMBER");

  const ids: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].match(/(".*?"|[^",]+)/g)?.map((f) => f.replace(/^"|"$/g, "").trim()) ?? [];
    const ivr = parseInt(fields[ivrIdx], 10);
    if (!isNaN(ivr)) ids.push(ivr);
  }
  return ids;
}

// ── Phase 1: Fetch ──

async function fetchHTML(detailId: number, retries = 2): Promise<string | null> {
  const url = `https://www.portlandmaps.com/api/detail.cfm?format=html&detail_type=permit&sections=*&expand=1&expand_tables=1&detail_id=${detailId}&property_id=null&api_key=${API_KEY}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Referer: REFERER },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (attempt < retries) { await new Promise((r) => setTimeout(r, 2000)); continue; }
        return null;
      }
      const text = await res.text();
      if (text.length < 500 || text.includes("An error has occurred")) return null;
      return text;
    } catch {
      if (attempt < retries) { await new Promise((r) => setTimeout(r, 2000)); continue; }
      return null;
    }
  }
  return null;
}

async function runFetch() {
  fs.mkdirSync(HTML_DIR, { recursive: true });

  const allIds = loadIVRNumbers();
  console.log(`${startIdArg !== null ? "Range" : "CSV"}: ${allIds.length} permits`);

  // Skip already-fetched
  const existing = new Set(
    fs.readdirSync(HTML_DIR).filter((f) => f.endsWith(".html")).map((f) => parseInt(f.replace(".html", ""), 10))
  );
  const toFetch = allIds.filter((id) => !existing.has(id)).slice(0, limitArg);
  console.log(`Already fetched: ${existing.size}, To fetch: ${toFetch.length}\n`);

  let fetched = 0, errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < toFetch.length; i += CONCURRENT) {
    const batch = toFetch.slice(i, i + CONCURRENT);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const html = await fetchHTML(id);
        if (html) {
          fs.writeFileSync(path.join(HTML_DIR, `${id}.html`), html);
          return true;
        }
        return false;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) fetched++;
      else errors++;
    }

    const done = i + batch.length;
    if (done % 100 === 0 || done >= toFetch.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = fetched / Math.max(elapsed, 1);
      const remaining = (toFetch.length - done) / Math.max(rate, 0.1);
      console.log(`  Fetch: ${done}/${toFetch.length} (${fetched} saved, ${errors} errors) — ${rate.toFixed(1)}/s, ~${Math.round(remaining / 60)}m left`);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\nFetch complete: ${fetched} saved, ${errors} errors`);
  console.log(`Total HTML files: ${existing.size + fetched}`);
}

// ── Phase 2: Parse + Insert ──

function parseDate(s: string | null | undefined): string | null {
  if (!s || !s.trim()) return null;
  const clean = s.trim().split(" ")[0];
  const parts = clean.split("/");
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return clean.slice(0, 10);
  return null;
}

function extractText(html: string, after: string): string | null {
  const idx = html.indexOf(after);
  if (idx < 0) return null;
  const rest = html.slice(idx + after.length);
  const match = rest.match(/<(?:dd|td)[^>]*>([\s\S]*?)<\/(?:dd|td)>/i);
  if (!match) return null;
  return match[1].replace(/<[^>]+>/g, "").trim() || null;
}

interface Activity {
  activity_name: string;
  activity_type: string;
  must_check: string;
  activity_status: string;
  last_activity_date: string | null;
  goal_date: string | null;
  completed_date: string | null;
  staff_contact: string | null;
}

function parsePermit(html: string, detailId: number) {
  const setup = parseDate(extractText(html, "Set Up Date") ?? extractText(html, "Setup Date"));
  const underReview = parseDate(extractText(html, "Under Review Date"));
  const issue = parseDate(extractText(html, "Issue Date"));
  const final = parseDate(extractText(html, "Final Date"));
  const status = extractText(html, "Status");

  const activities: Activity[] = [];
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi);
  if (tbodyMatch) {
    for (const tbody of tbodyMatch) {
      const rows = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) ?? [];
      for (const row of rows) {
        const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? []).map((c) =>
          c.replace(/<[^>]+>/g, "").trim()
        );
        if (cells.length >= 5) {
          activities.push({
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

  return {
    detail_id: detailId,
    ivr_number: extractText(html, "IVR Number"),
    permit_type: extractText(html, "Permit/Case Type") ?? extractText(html, "Permit Type"),
    work_description: extractText(html, "Work/Case Description") ?? extractText(html, "Work Description"),
    setup_date: setup,
    under_review_date: underReview,
    issue_date: issue,
    final_date: final,
    status,
    days_to_issue: setup && issue ? Math.round((new Date(issue).getTime() - new Date(setup).getTime()) / 86400000) : null,
    days_in_review: underReview && issue ? Math.round((new Date(issue).getTime() - new Date(underReview).getTime()) / 86400000) : null,
    activities,
  };
}

async function runParse() {
  const sql = postgres(DB_URL, { max: 3, ...(isPooled ? { prepare: false } : {}), onnotice: () => {} });

  const files = fs.readdirSync(HTML_DIR).filter((f) => f.endsWith(".html"));
  console.log(`HTML files to parse: ${files.length}`);

  // Check which are already in DB
  const existingRows = await sql`SELECT detail_id FROM housing.permit_details`;
  const existingIds = new Set(existingRows.map((r) => Number(r.detail_id)));
  const toParse = files
    .filter((f) => {
      const id = parseInt(f, 10);
      if (startIdArg !== null && endIdArg !== null) return id >= startIdArg && id <= endIdArg;
      return !existingIds.has(id);
    })
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .slice(0, limitArg);
  console.log(`Already in DB: ${existingIds.size}, To parse: ${toParse.length}\n`);

  let parsed = 0, errors = 0, totalActivities = 0;
  const startTime = Date.now();
  const FILE_BATCH_SIZE = 500;
  const ACTIVITY_BATCH_SIZE = 2000;

  for (let i = 0; i < toParse.length; i += FILE_BATCH_SIZE) {
    const batch = toParse.slice(i, i + FILE_BATCH_SIZE);
    const detailRows: Array<{
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
      days_to_issue: number | null;
      days_in_review: number | null;
    }> = [];
    const activityRows: Array<{
      detail_id: number;
      activity_name: string;
      activity_type: string;
      must_check: string;
      activity_status: string;
      last_activity_date: string | null;
      completed_date: string | null;
      goal_date: string | null;
      staff_contact: string | null;
      days_from_setup: number | null;
    }> = [];

    for (const file of batch) {
      const detailId = parseInt(file, 10);
      try {
        const html = fs.readFileSync(path.join(HTML_DIR, file), "utf-8");
        const permit = parsePermit(html, detailId);

        if (!permit.setup_date && !permit.status) {
          errors++;
          continue;
        }

        detailRows.push({
          detail_id: permit.detail_id,
          ivr_number: permit.ivr_number,
          permit_type: permit.permit_type,
          work_description: permit.work_description,
          address: null,
          setup_date: permit.setup_date,
          under_review_date: permit.under_review_date,
          issue_date: permit.issue_date,
          final_date: permit.final_date,
          status: permit.status,
          days_to_issue: permit.days_to_issue,
          days_in_review: permit.days_in_review,
        });

        for (const act of permit.activities) {
          const daysFromSetup = permit.setup_date && act.completed_date
            ? Math.round((new Date(act.completed_date).getTime() - new Date(permit.setup_date).getTime()) / 86400000)
            : null;
          activityRows.push({
            detail_id: detailId,
            activity_name: act.activity_name,
            activity_type: act.activity_type,
            must_check: act.must_check,
            activity_status: act.activity_status,
            last_activity_date: act.last_activity_date,
            completed_date: act.completed_date,
            goal_date: act.goal_date,
            staff_contact: act.staff_contact,
            days_from_setup: daysFromSetup,
          });
        }
      } catch {
        errors++;
      }
    }

    if (detailRows.length > 0) {
      await sql`
        INSERT INTO housing.permit_details
        ${sql(
          detailRows,
          "detail_id",
          "ivr_number",
          "permit_type",
          "work_description",
          "address",
          "setup_date",
          "under_review_date",
          "issue_date",
          "final_date",
          "status",
          "days_to_issue",
          "days_in_review"
        )}
        ON CONFLICT (detail_id) DO UPDATE SET
          ivr_number = EXCLUDED.ivr_number,
          permit_type = EXCLUDED.permit_type,
          work_description = EXCLUDED.work_description,
          setup_date = EXCLUDED.setup_date,
          under_review_date = EXCLUDED.under_review_date,
          issue_date = EXCLUDED.issue_date,
          status = EXCLUDED.status,
          final_date = EXCLUDED.final_date,
          days_to_issue = EXCLUDED.days_to_issue,
          days_in_review = EXCLUDED.days_in_review
      `;

      const ids = detailRows.map((row) => row.detail_id);
      await sql.unsafe(`DELETE FROM housing.permit_activities WHERE detail_id IN (${ids.join(",")})`);

      for (let j = 0; j < activityRows.length; j += ACTIVITY_BATCH_SIZE) {
        const activityBatch = activityRows.slice(j, j + ACTIVITY_BATCH_SIZE);
        if (activityBatch.length === 0) continue;
        await sql`
          INSERT INTO housing.permit_activities
          ${sql(
            activityBatch,
            "detail_id",
            "activity_name",
            "activity_type",
            "must_check",
            "activity_status",
            "last_activity_date",
            "completed_date",
            "goal_date",
            "staff_contact",
            "days_from_setup"
          )}
        `;
      }
      parsed += detailRows.length;
      totalActivities += activityRows.length;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = parsed / Math.max(elapsed, 1);
    console.log(`  Parse: ${Math.min(i + FILE_BATCH_SIZE, toParse.length)}/${toParse.length} (${parsed} ok, ${errors} err, ${totalActivities} activities) — ${rate.toFixed(1)}/s`);
  }

  const finalDetails = await sql`SELECT count(*)::int as cnt FROM housing.permit_details`;
  const finalActs = await sql`SELECT count(*)::int as cnt FROM housing.permit_activities`;
  console.log(`\nParse complete: ${parsed} inserted, ${errors} errors, ${totalActivities} activities`);
  console.log(`DB totals: ${finalDetails[0].cnt} details, ${finalActs[0].cnt} activities`);

  await sql`
    DELETE FROM public.dashboard_cache
    WHERE question IN ('housing', 'housing_detail', 'housing_journey', 'housing_bottleneck')
  `;
  console.log("Cleared housing dashboard caches");

  await sql.end();
}

// ── Main ──

async function main() {
  console.log("Portland Permits — Two-Phase Detail Scraper");
  console.log("============================================\n");

  if (doFetch) {
    console.log("=== Phase 1: Fetch HTML ===\n");
    await runFetch();
    console.log("");
  }

  if (doParse) {
    console.log("=== Phase 2: Parse + Insert ===\n");
    await runParse();
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
