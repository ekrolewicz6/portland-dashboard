import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

/** Upper bound on one CSV download. Larger payload, so larger budget. */
const FETCH_TIMEOUT_MS = 120_000;

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CSV_BASE =
  "https://public.tableau.com/views/PPBOpenDataDownloads/New_Offense_Data_";

function parseDate(s: string | null): string | null {
  if (!s) return null;
  const parts = s.split("/");
  if (parts.length !== 3) return null;
  const [m, d, y] = parts;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function fetchYearCSV(year: number): Promise<string[][]> {
  const url = `${CSV_BASE}${year}.csv?:showVizHome=no`;
  // The CSV is large, so this is more generous than the ArcGIS timeouts,
  // but it is still bounded: without it a stalled download consumes the
  // whole function budget and the sync reports nothing at all.
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for year ${year}`);
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const rows = lines.slice(1).map(parseCSVRow);
  return rows;
}

interface OffenseRow {
  address: string | null;
  case_number: string;
  council_district: string | null;
  crime_against: string | null;
  custom_crime_against: string | null;
  custom_crime_category: string | null;
  neighborhood: string | null;
  occur_date: string | null;
  occur_time: string | null;
  offense_category: string | null;
  offense_count: number;
  offense_type: string | null;
  lat: number | null;
  lon: number | null;
  x: number | null;
  y: number | null;
  report_date: string | null;
  report_month_year: string | null;
}

function csvToRow(fields: string[]): OffenseRow | null {
  if (fields.length < 18) return null;
  const caseNum = fields[1];
  if (!caseNum) return null;
  return {
    address: fields[0] || null,
    case_number: caseNum,
    council_district: fields[2] || null,
    crime_against: fields[3] || null,
    custom_crime_against: fields[4] || null,
    custom_crime_category: fields[5] || null,
    neighborhood: fields[6] || null,
    occur_date: parseDate(fields[7]),
    occur_time: fields[8] || null,
    offense_category: fields[9] || null,
    offense_count: parseInt(fields[10], 10) || 1,
    offense_type: fields[11] || null,
    lat: fields[12] ? parseFloat(fields[12]) : null,
    lon: fields[13] ? parseFloat(fields[13]) : null,
    x: fields[14] ? parseFloat(fields[14]) : null,
    y: fields[15] ? parseFloat(fields[15]) : null,
    report_date: parseDate(fields[16]),
    report_month_year: fields[17] || null,
  };
}

async function upsertBatch(rows: OffenseRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const result = await sql`
    INSERT INTO safety.ppb_offenses (
      address, case_number, council_district, crime_against,
      custom_crime_against, custom_crime_category, neighborhood,
      occur_date, occur_time, offense_category, offense_count,
      offense_type, lat, lon, x, y, report_date, report_month_year
    )
    SELECT * FROM unnest(
      ${sql.array(rows.map((r) => r.address))}::text[],
      ${sql.array(rows.map((r) => r.case_number))}::text[],
      ${sql.array(rows.map((r) => r.council_district))}::text[],
      ${sql.array(rows.map((r) => r.crime_against))}::text[],
      ${sql.array(rows.map((r) => r.custom_crime_against))}::text[],
      ${sql.array(rows.map((r) => r.custom_crime_category))}::text[],
      ${sql.array(rows.map((r) => r.neighborhood))}::text[],
      ${sql.array(rows.map((r) => r.occur_date))}::date[],
      ${sql.array(rows.map((r) => r.occur_time))}::text[],
      ${sql.array(rows.map((r) => r.offense_category))}::text[],
      ${sql.array(rows.map((r) => r.offense_count))}::int[],
      ${sql.array(rows.map((r) => r.offense_type))}::text[],
      ${sql.array(rows.map((r) => r.lat))}::numeric[],
      ${sql.array(rows.map((r) => r.lon))}::numeric[],
      ${sql.array(rows.map((r) => r.x))}::numeric[],
      ${sql.array(rows.map((r) => r.y))}::numeric[],
      ${sql.array(rows.map((r) => r.report_date))}::date[],
      ${sql.array(rows.map((r) => r.report_month_year))}::text[]
    )
    ON CONFLICT (case_number, offense_type) DO UPDATE SET
      address = EXCLUDED.address,
      occur_date = EXCLUDED.occur_date,
      offense_category = EXCLUDED.offense_category,
      neighborhood = EXCLUDED.neighborhood,
      report_date = EXCLUDED.report_date
    WHERE
      safety.ppb_offenses.occur_date IS DISTINCT FROM EXCLUDED.occur_date
      OR safety.ppb_offenses.offense_category IS DISTINCT FROM EXCLUDED.offense_category
      OR safety.ppb_offenses.neighborhood IS DISTINCT FROM EXCLUDED.neighborhood
  `;
  return result.count;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const currentYear = new Date().getFullYear();
  const yearsToSync = [currentYear - 1, currentYear];

  try {
    const [before] = await sql`SELECT COUNT(*)::int as cnt FROM safety.ppb_offenses`;
    let totalAffected = 0;
    let rowsParsed = 0;
    let batchErrors = 0;

    for (const year of yearsToSync) {
      const csvRows = await fetchYearCSV(year);
      const rows = csvRows.map(csvToRow).filter(Boolean) as OffenseRow[];
      rowsParsed += rows.length;
      console.log(`[sync-crime] ${year}: ${rows.length} rows from CSV`);

      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        try {
          totalAffected += await upsertBatch(batch);
        } catch (err) {
          batchErrors++;
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[sync-crime] batch error ${year}@${i}: ${message}`);
        }
      }
    }

    const [after] = await sql`
      SELECT COUNT(*)::int as cnt, MAX(occur_date)::text as max_date FROM safety.ppb_offenses
    `;

    if (totalAffected > 0) {
      await sql`DELETE FROM public.dashboard_cache WHERE question IN ('safety', 'safety_detail')`;
    }

    // Parsing rows and writing none of them is a failed run — most often a
    // missing unique constraint, which makes every ON CONFLICT batch throw.
    // Reported as 5xx so the scheduler records it rather than showing a
    // healthy run that moved no data.
    const failed = rowsParsed > 0 && totalAffected === 0;

    return NextResponse.json(
      {
        ok: !failed,
        ms: Date.now() - t0,
        yearsSynced: yearsToSync,
        before: before.cnt,
        after: after.cnt,
        netNew: Number(after.cnt) - Number(before.cnt),
        rowsParsed,
        rowsAffected: totalAffected,
        batchErrors,
        latestDate: after.max_date,
      },
      { status: failed ? 500 : 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync-crime] FATAL: ${message}`);
    return NextResponse.json(
      { ok: false, error: message, ms: Date.now() - t0 },
      { status: 500 },
    );
  }
}
