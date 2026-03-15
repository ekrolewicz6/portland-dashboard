/**
 * clear-cache-verify.ts
 *
 * Clears the dashboard cache and verifies all data tables.
 *
 * Usage: npx tsx scripts/clear-cache-verify.ts
 */

import postgres from "postgres";

const DB_URL = "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

async function main() {
  const sql = postgres(DB_URL, { max: 5, onnotice: () => {} });

  console.log("=== Clear Dashboard Cache & Verify Data ===\n");

  // Clear cache so API routes pull fresh data
  console.log("1. Clearing dashboard_cache...");
  await sql`DELETE FROM public.dashboard_cache`;
  console.log("   Cache cleared.\n");

  // Verify all tables
  console.log("2. Data verification:\n");

  const checks = [
    { label: "TriMet Routes", query: "SELECT count(*)::int as cnt FROM downtown.trimet_routes" },
    { label: "TriMet Stops", query: "SELECT count(*)::int as cnt FROM downtown.trimet_stops" },
    { label: "FBI Crime Estimates", query: "SELECT count(*)::int as cnt FROM safety.fbi_crime_estimates" },
    { label: "FHFA HPI", query: "SELECT count(*)::int as cnt FROM housing.fhfa_hpi" },
    { label: "Redfin Market", query: "SELECT count(*)::int as cnt FROM housing.redfin_market" },
    { label: "BLS Employment", query: "SELECT count(*)::int as cnt FROM business.bls_employment" },
    { label: "Building Permits", query: "SELECT count(*)::int as cnt FROM housing.permits" },
    { label: "Crime Monthly", query: "SELECT count(*)::int as cnt FROM safety.crime_monthly" },
    { label: "Graffiti Monthly", query: "SELECT count(*)::int as cnt FROM safety.graffiti_monthly" },
    { label: "Neighborhoods", query: "SELECT count(*)::int as cnt FROM reference.neighborhoods" },
    { label: "Oregon SOS Yearly", query: "SELECT count(*)::int as cnt FROM business.oregon_sos_yearly" },
    { label: "Oregon SOS New Monthly", query: "SELECT count(*)::int as cnt FROM business.oregon_sos_new_monthly" },
    { label: "Census CBP", query: "SELECT count(*)::int as cnt FROM business.census_cbp" },
    { label: "PBOT Requests", query: "SELECT count(*)::int as cnt FROM downtown.pbot_requests" },
    { label: "FRED House Price Index", query: "SELECT count(*)::int as cnt FROM housing.fred_house_price_index" },
    { label: "Housing Rents (Zillow)", query: "SELECT count(*)::int as cnt FROM public.housing_rents" },
  ];

  let total = 0;
  for (const check of checks) {
    try {
      const rows = await sql.unsafe(check.query);
      const cnt = Number(rows[0].cnt);
      total += cnt;
      const status = cnt > 0 ? "OK" : "--";
      console.log(`   [${status}] ${check.label}: ${cnt.toLocaleString()} rows`);
    } catch {
      console.log(`   [!!] ${check.label}: table does not exist`);
    }
  }

  console.log(`\n   Total records across all tables: ${total.toLocaleString()}`);

  // Show sample data from new tables
  console.log("\n3. Sample data from new tables:\n");

  console.log("   TriMet route types:");
  const routeTypes = await sql`
    SELECT route_type_name, count(*)::int as cnt
    FROM downtown.trimet_routes
    GROUP BY route_type_name
    ORDER BY cnt DESC
  `;
  for (const r of routeTypes) console.log(`     ${r.route_type_name}: ${r.cnt} routes`);

  console.log("\n   FBI Crime Estimates (latest 3 years):");
  const fbi = await sql`
    SELECT year, population::bigint, violent_crime::int, property_crime::int
    FROM safety.fbi_crime_estimates
    ORDER BY year DESC
    LIMIT 3
  `;
  for (const r of fbi) console.log(`     ${r.year}: pop ${Number(r.population).toLocaleString()}, violent ${Number(r.violent_crime).toLocaleString()}, property ${Number(r.property_crime).toLocaleString()}`);

  console.log("\n   FHFA HPI (latest 4 quarters):");
  const hpi = await sql`
    SELECT year, quarter, hpi
    FROM housing.fhfa_hpi
    ORDER BY year DESC, quarter DESC
    LIMIT 4
  `;
  for (const r of hpi) console.log(`     Q${r.quarter} ${r.year}: HPI = ${Number(r.hpi).toFixed(2)}`);

  console.log("\n   BLS Unemployment (latest 6 months):");
  const bls = await sql`
    SELECT period_name, year, value
    FROM business.bls_employment
    WHERE series_id = 'LAUMT413890000000003'
      AND period != 'M13'
    ORDER BY year DESC, period DESC
    LIMIT 6
  `;
  for (const r of bls) console.log(`     ${r.period_name} ${r.year}: ${r.value}%`);

  console.log("\n   Redfin Market (latest 3 periods):");
  const redfin = await sql`
    SELECT period_begin, median_sale_price, days_on_market, inventory
    FROM housing.redfin_market
    ORDER BY period_begin DESC
    LIMIT 3
  `;
  for (const r of redfin) console.log(`     ${String(r.period_begin).slice(0, 10)}: $${Number(r.median_sale_price).toLocaleString()}, ${r.days_on_market} DOM, ${r.inventory} inventory`);

  await sql.end();
  console.log("\n=== Verification complete! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
