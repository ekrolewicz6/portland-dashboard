/**
 * save-trimet-json.ts — Export TriMet data from DB to JSON files
 */
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const DATA_DIR = path.join(process.cwd(), "data");

async function main() {
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  const routes = await sql`SELECT * FROM downtown.trimet_routes ORDER BY route_id`;
  fs.writeFileSync(path.join(DATA_DIR, "trimet_routes.json"), JSON.stringify(routes, null, 2));
  console.log(`Saved trimet_routes.json (${routes.length} routes)`);

  const stops = await sql`SELECT stop_id, stop_name, lat, lon, stop_code, zone_id, location_type, route_ids FROM downtown.trimet_stops ORDER BY stop_id`;
  fs.writeFileSync(path.join(DATA_DIR, "trimet_stops.json"), JSON.stringify(stops, null, 2));
  console.log(`Saved trimet_stops.json (${stops.length} stops)`);

  const summary = await sql`SELECT data FROM public.dashboard_cache WHERE question = 'trimet_transit'`;
  if (summary.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, "trimet_summary.json"), JSON.stringify(summary[0].data, null, 2));
    console.log("Saved trimet_summary.json");
  }

  await sql.end();
}

main().catch(console.error);
