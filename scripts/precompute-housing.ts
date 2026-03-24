/**
 * precompute-housing.ts
 *
 * Pre-computes the expensive housing dashboard queries and stores results
 * in dashboard_cache. Run after any data load to keep the cache warm.
 *
 * Usage: npx tsx scripts/precompute-housing.ts
 */

import fs from "node:fs";
import path from "node:path";

// Load .env.local
const envPath = path.resolve(import.meta.dirname ?? ".", "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function warmCache(endpoint: string, cacheKey: string) {
  const start = Date.now();
  console.log(`  Warming ${cacheKey} (${endpoint})...`);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) {
      console.log(`    ERROR: HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const status = data.dataStatus ?? "unknown";
    console.log(`    OK (${elapsed}s, status: ${status})`);
  } catch (err: any) {
    console.log(`    ERROR: ${err.message}`);
  }
}

async function main() {
  console.log("Pre-computing housing dashboard cache...\n");
  console.log(`Base URL: ${BASE_URL}\n`);

  // These are the slow endpoints — each caches its own results
  await warmCache("/api/dashboard/housing/detail", "housing_detail");
  await warmCache("/api/dashboard/housing/journey", "housing_journey");
  await warmCache("/api/dashboard/housing/bottleneck", "housing_bottleneck");
  await warmCache("/api/dashboard/housing", "housing");

  console.log("\nDone. Cache is warm.");
}

main().catch((err) => { console.error(err); process.exit(1); });
