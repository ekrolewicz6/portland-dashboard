/**
 * fetch-trimet-gtfs.ts
 *
 * Downloads TriMet's GTFS static feed, parses routes/stops/trips,
 * inserts into PostgreSQL, and saves JSON snapshots.
 *
 * Usage: npx tsx scripts/fetch-trimet-gtfs.ts
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.resolve(import.meta.dirname ?? ".", "..", "data");
const TMP_DIR = path.resolve(import.meta.dirname ?? ".", "..", "tmp_gtfs");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

// ── Parse CSV/TSV ───────────────────────────────────────────────────────

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").trim().replace(/^"|"$/g, "");
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

// ── Route type mapping ──────────────────────────────────────────────────

function routeTypeName(type: string): string {
  switch (type) {
    case "0": return "Streetcar";
    case "1": return "MAX Light Rail";
    case "2": return "Commuter Rail (WES)";
    case "3": return "Bus";
    case "4": return "Ferry";
    case "7": return "Aerial Tramway";
    default: return "Other";
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== TriMet GTFS Data Fetch ===");
  console.log(`Temp dir: ${TMP_DIR}`);

  // 1. Download GTFS zip
  const zipPath = path.join(TMP_DIR, "gtfs.zip");
  console.log("\n1. Downloading GTFS feed...");
  try {
    execSync(`curl -sL -o "${zipPath}" "http://developer.trimet.org/schedule/gtfs.zip"`, {
      timeout: 60000,
    });
    const stats = fs.statSync(zipPath);
    console.log(`   Downloaded: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  } catch (err: any) {
    console.error(`   Download failed: ${err.message}`);
    console.log("   Trying alternative URL...");
    try {
      execSync(`curl -sL -o "${zipPath}" "https://developer.trimet.org/schedule/gtfs.zip"`, {
        timeout: 60000,
      });
      const stats = fs.statSync(zipPath);
      console.log(`   Downloaded: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
    } catch (err2: any) {
      console.error(`   Alternative also failed: ${err2.message}`);
      throw new Error("Cannot download GTFS feed");
    }
  }

  // 2. Unzip
  console.log("\n2. Extracting...");
  execSync(`cd "${TMP_DIR}" && unzip -o gtfs.zip`, { timeout: 30000 });

  const files = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`   Extracted files: ${files.join(", ")}`);

  // 3. Parse routes.txt
  console.log("\n3. Parsing routes.txt...");
  const routesRaw = fs.readFileSync(path.join(TMP_DIR, "routes.txt"), "utf8");
  const routeRows = parseCSV(routesRaw);
  console.log(`   Total routes: ${routeRows.length}`);

  interface Route {
    route_id: string;
    route_name: string;
    route_type: string;
    route_type_name: string;
    route_color: string;
    route_text_color: string;
    route_url: string;
  }

  const routes: Route[] = routeRows.map((r) => ({
    route_id: r.route_id ?? "",
    route_name: r.route_long_name || r.route_short_name || r.route_id || "",
    route_type: r.route_type ?? "3",
    route_type_name: routeTypeName(r.route_type ?? "3"),
    route_color: r.route_color || "",
    route_text_color: r.route_text_color || "",
    route_url: r.route_url || "",
  }));

  // Count by type
  const byType: Record<string, number> = {};
  for (const r of routes) {
    byType[r.route_type_name] = (byType[r.route_type_name] ?? 0) + 1;
  }
  console.log("   Routes by type:", byType);

  // 4. Parse stops.txt
  console.log("\n4. Parsing stops.txt...");
  const stopsRaw = fs.readFileSync(path.join(TMP_DIR, "stops.txt"), "utf8");
  const stopRows = parseCSV(stopsRaw);
  console.log(`   Total stops: ${stopRows.length}`);

  interface Stop {
    stop_id: string;
    stop_name: string;
    lat: number | null;
    lon: number | null;
    stop_code: string;
    zone_id: string;
    location_type: string;
  }

  const stops: Stop[] = stopRows.map((s) => ({
    stop_id: s.stop_id ?? "",
    stop_name: s.stop_name ?? "",
    lat: s.stop_lat ? parseFloat(s.stop_lat) : null,
    lon: s.stop_lon ? parseFloat(s.stop_lon) : null,
    stop_code: s.stop_code || "",
    zone_id: s.zone_id || "",
    location_type: s.location_type || "0",
  }));

  // 5. Parse trips.txt for daily trip count
  console.log("\n5. Parsing trips.txt...");
  const tripsRaw = fs.readFileSync(path.join(TMP_DIR, "trips.txt"), "utf8");
  const tripRows = parseCSV(tripsRaw);
  console.log(`   Total scheduled trips: ${tripRows.length}`);

  // Count unique service_ids to estimate daily trips
  const serviceIds = new Set(tripRows.map((t) => t.service_id));
  console.log(`   Unique service_ids: ${serviceIds.size}`);

  // Parse calendar.txt to find weekday service IDs
  let weekdayTrips = tripRows.length;
  try {
    const calendarRaw = fs.readFileSync(path.join(TMP_DIR, "calendar.txt"), "utf8");
    const calendarRows = parseCSV(calendarRaw);
    const weekdayServiceIds = new Set(
      calendarRows
        .filter((c) => c.monday === "1" || c.tuesday === "1" || c.wednesday === "1")
        .map((c) => c.service_id)
    );
    weekdayTrips = tripRows.filter((t) => weekdayServiceIds.has(t.service_id)).length;
    console.log(`   Approximate weekday trips: ${weekdayTrips}`);
  } catch {
    console.log("   Could not parse calendar.txt, using total trip count as estimate");
  }

  // Map trips to routes for route_ids on stops
  const tripRouteMap = new Map<string, string>();
  for (const t of tripRows) {
    tripRouteMap.set(t.trip_id, t.route_id);
  }

  // 6. Parse stop_times.txt to link stops to routes
  console.log("\n6. Parsing stop_times.txt (this may take a moment)...");
  const stopTimesRaw = fs.readFileSync(path.join(TMP_DIR, "stop_times.txt"), "utf8");
  const stopTimesLines = stopTimesRaw.split("\n");
  console.log(`   Total stop_time entries: ${stopTimesLines.length - 1}`);

  // Build stop -> route_ids mapping (sampling for speed)
  const stopRoutes = new Map<string, Set<string>>();
  const headers = stopTimesLines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const tripIdIdx = headers.indexOf("trip_id");
  const stopIdIdx = headers.indexOf("stop_id");

  // Sample every 3rd line for speed
  for (let i = 1; i < stopTimesLines.length; i += 3) {
    const parts = stopTimesLines[i].split(",");
    if (parts.length < Math.max(tripIdIdx, stopIdIdx) + 1) continue;
    const tripId = parts[tripIdIdx]?.trim().replace(/"/g, "");
    const stopId = parts[stopIdIdx]?.trim().replace(/"/g, "");
    const routeId = tripRouteMap.get(tripId);
    if (routeId && stopId) {
      if (!stopRoutes.has(stopId)) stopRoutes.set(stopId, new Set());
      stopRoutes.get(stopId)!.add(routeId);
    }
  }

  // Attach route_ids to stops
  const stopsWithRoutes = stops.map((s) => ({
    ...s,
    route_ids: Array.from(stopRoutes.get(s.stop_id) ?? []),
  }));

  // 7. Build summary
  const summary = {
    total_routes: routes.length,
    routes_by_type: byType,
    total_stops: stops.length,
    total_trips: tripRows.length,
    weekday_trips: weekdayTrips,
    stops_with_route_mapping: stopRoutes.size,
    fetched_at: new Date().toISOString(),
  };
  console.log("\n=== Summary ===");
  console.log(JSON.stringify(summary, null, 2));

  // 8. Save JSON
  console.log("\n7. Saving JSON files...");
  fs.writeFileSync(
    path.join(DATA_DIR, "trimet_routes.json"),
    JSON.stringify(routes, null, 2)
  );
  console.log(`   Saved trimet_routes.json (${routes.length} routes)`);

  fs.writeFileSync(
    path.join(DATA_DIR, "trimet_stops.json"),
    JSON.stringify(stopsWithRoutes, null, 2)
  );
  console.log(`   Saved trimet_stops.json (${stopsWithRoutes.length} stops)`);

  fs.writeFileSync(
    path.join(DATA_DIR, "trimet_summary.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log(`   Saved trimet_summary.json`);

  // 9. Insert into PostgreSQL
  console.log("\n8. Inserting into PostgreSQL...");
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  try {
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS downtown`);

    // Routes table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS downtown.trimet_routes (
        route_id        TEXT PRIMARY KEY,
        route_name      TEXT NOT NULL,
        route_type      TEXT NOT NULL,
        route_type_name TEXT,
        route_color     TEXT,
        route_text_color TEXT,
        route_url       TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await sql.unsafe(`TRUNCATE downtown.trimet_routes`);

    for (const r of routes) {
      await sql`
        INSERT INTO downtown.trimet_routes (route_id, route_name, route_type, route_type_name, route_color, route_text_color, route_url)
        VALUES (${r.route_id}, ${r.route_name}, ${r.route_type}, ${r.route_type_name}, ${r.route_color}, ${r.route_text_color}, ${r.route_url})
        ON CONFLICT (route_id) DO NOTHING
      `;
    }
    console.log(`   Inserted ${routes.length} routes into downtown.trimet_routes`);

    // Stops table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS downtown.trimet_stops (
        stop_id         TEXT PRIMARY KEY,
        stop_name       TEXT NOT NULL,
        lat             NUMERIC(10,7),
        lon             NUMERIC(10,7),
        stop_code       TEXT,
        zone_id         TEXT,
        location_type   TEXT,
        route_ids       TEXT[],
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await sql.unsafe(`TRUNCATE downtown.trimet_stops`);

    // Batch insert stops
    let stopCount = 0;
    for (const s of stopsWithRoutes) {
      try {
        await sql`
          INSERT INTO downtown.trimet_stops (stop_id, stop_name, lat, lon, stop_code, zone_id, location_type, route_ids)
          VALUES (${s.stop_id}, ${s.stop_name}, ${s.lat}, ${s.lon}, ${s.stop_code}, ${s.zone_id}, ${s.location_type}, ${s.route_ids})
          ON CONFLICT (stop_id) DO NOTHING
        `;
        stopCount++;
      } catch {
        // skip individual errors
      }
      if (stopCount % 1000 === 0 && stopCount > 0) {
        console.log(`   ... ${stopCount} stops inserted`);
      }
    }
    console.log(`   Inserted ${stopCount} stops into downtown.trimet_stops`);

    // Cache summary for dashboard
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.dashboard_cache (
        question  TEXT PRIMARY KEY,
        data      JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES ('trimet_transit', ${sql.json(summary)}, now())
      ON CONFLICT (question) DO UPDATE SET data = ${sql.json(summary)}, updated_at = now()
    `;
    console.log("   Cached trimet_transit summary");

    // Verify
    const routeCount = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_routes`;
    const stopCountDb = await sql`SELECT count(*)::int as cnt FROM downtown.trimet_stops`;
    console.log(`\n   Verification: ${routeCount[0].cnt} routes, ${stopCountDb[0].cnt} stops in DB`);

    await sql.end();
  } catch (err: any) {
    console.error(`   DB error: ${err.message}`);
    await sql.end();
  }

  // 10. Cleanup
  console.log("\n9. Cleaning up temp files...");
  try {
    fs.rmSync(TMP_DIR, { recursive: true });
    console.log("   Removed temp directory");
  } catch {
    console.log("   Could not remove temp directory");
  }

  console.log("\n=== TriMet GTFS fetch complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
