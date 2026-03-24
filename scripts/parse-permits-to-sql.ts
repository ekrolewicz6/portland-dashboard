/**
 * parse-permits-to-sql.ts
 *
 * Parses all HTML files in data/permit-html/ into two SQL files:
 *   - data/permit_details.sql (COPY format)
 *   - data/permit_activities.sql (COPY format)
 *
 * Then you can bulk-load via:
 *   psql $SUPABASE_URL -f data/permit_details.sql
 *   psql $SUPABASE_URL -f data/permit_activities.sql
 *
 * Usage: npx tsx scripts/parse-permits-to-sql.ts
 */

import fs from "node:fs";
import path from "node:path";

const HTML_DIR = path.resolve("data/permit-html");

function parseDate(s: string | null | undefined): string | null {
  if (!s || !s.trim()) return null;
  const clean = s.trim().split(" ")[0];
  const parts = clean.split("/");
  if (parts.length === 3) {
    const [m, d, y] = parts;
    const result = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    if (result.length !== 10) return null;
    return result;
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

function escapeSQL(s: string | null): string {
  if (s === null) return "\\N";
  return s.replace(/\\/g, "\\\\").replace(/\t/g, " ").replace(/\n/g, " ").replace(/\r/g, "");
}

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return null;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

async function main() {
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith(".html"));
  console.log(`Parsing ${files.length} HTML files...`);

  const detailsOut = fs.createWriteStream("data/permit_details_import.tsv");
  const activitiesOut = fs.createWriteStream("data/permit_activities_import.tsv");

  let parsed = 0;
  let errors = 0;
  let totalActivities = 0;

  for (const file of files) {
    const detailId = parseInt(file, 10);
    if (isNaN(detailId)) continue;

    try {
      const html = fs.readFileSync(path.join(HTML_DIR, file), "utf-8");
      if (html.length < 500 || html.includes("An error has occurred")) {
        errors++;
        continue;
      }

      const setup = parseDate(extractText(html, "Set Up Date") ?? extractText(html, "Setup Date"));
      const underReview = parseDate(extractText(html, "Under Review Date"));
      const issue = parseDate(extractText(html, "Issue Date"));
      const final_date = parseDate(extractText(html, "Final Date"));
      const status = extractText(html, "Status");
      const ivr = extractText(html, "IVR Number");
      const permitType = extractText(html, "Permit/Case Type") ?? extractText(html, "Permit Type");
      const description = extractText(html, "Work/Case Description") ?? extractText(html, "Work Description");

      if (!setup && !status && !ivr) {
        errors++;
        continue;
      }

      const daysToIssue = daysBetween(setup, issue);
      const daysInReview = daysBetween(underReview, issue);

      // TSV: detail_id, ivr_number, permit_type, work_description, address, setup_date, under_review_date, issue_date, final_date, status, days_to_issue, days_in_review
      detailsOut.write([
        detailId,
        escapeSQL(ivr),
        escapeSQL(permitType),
        escapeSQL(description?.slice(0, 500) ?? null),
        "\\N", // address
        setup ?? "\\N",
        underReview ?? "\\N",
        issue ?? "\\N",
        final_date ?? "\\N",
        escapeSQL(status),
        daysToIssue ?? "\\N",
        daysInReview ?? "\\N",
      ].join("\t") + "\n");

      // Parse activities
      const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi);
      if (tbodyMatch) {
        for (const tbody of tbodyMatch) {
          const rows = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) ?? [];
          for (const row of rows) {
            const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? []).map(c =>
              c.replace(/<[^>]+>/g, "").trim()
            );
            if (cells.length >= 5) {
              const completedDate = parseDate(cells[6]);
              const daysFromSetup = daysBetween(setup, completedDate);

              activitiesOut.write([
                detailId,
                escapeSQL(cells[0] || null),  // activity_name
                escapeSQL(cells[1] || null),  // activity_type
                escapeSQL(cells[2] || null),  // must_check
                escapeSQL(cells[3] || null),  // activity_status
                parseDate(cells[4]) ?? "\\N", // last_activity_date
                completedDate ?? "\\N",       // completed_date
                parseDate(cells[5]) ?? "\\N", // goal_date
                escapeSQL(cells[7] || null),  // staff_contact
                daysFromSetup ?? "\\N",       // days_from_setup
              ].join("\t") + "\n");
              totalActivities++;
            }
          }
        }
      }

      parsed++;
      if (parsed % 5000 === 0) {
        console.log(`  ${parsed}/${files.length} parsed, ${totalActivities} activities, ${errors} errors`);
      }
    } catch {
      errors++;
    }
  }

  detailsOut.end();
  activitiesOut.end();

  console.log(`\nDone. ${parsed} permits, ${totalActivities} activities, ${errors} errors`);
  console.log(`Files:`);
  console.log(`  data/permit_details_import.tsv`);
  console.log(`  data/permit_activities_import.tsv`);
  console.log(`\nTo load into Supabase:`);
  console.log(`  1. Delete existing data: DELETE FROM housing.permit_activities; DELETE FROM housing.permit_details;`);
  console.log(`  2. Load details: \\copy housing.permit_details(detail_id,ivr_number,permit_type,work_description,address,setup_date,under_review_date,issue_date,final_date,status,days_to_issue,days_in_review) FROM 'data/permit_details_import.tsv'`);
  console.log(`  3. Load activities: \\copy housing.permit_activities(detail_id,activity_name,activity_type,must_check,activity_status,last_activity_date,completed_date,goal_date,staff_contact,days_from_setup) FROM 'data/permit_activities_import.tsv'`);
}

main().catch(err => { console.error(err); process.exit(1); });
