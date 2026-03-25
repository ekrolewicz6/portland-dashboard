/**
 * fetch-all-qol.ts
 *
 * Orchestrator: runs all quality-of-life data fetch/seed scripts.
 *
 * Cadence guide:
 *   - Daily: fetch-airnow.ts (air quality)
 *   - Monthly: fetch-trimet-ridership.ts (transit + bike infrastructure)
 *   - Annually: fetch-census-qol.ts (rent burden, education, income — after ACS release in ~December)
 *   - Quarterly: seed-quality-extras.ts (cultural institutions, tree canopy, broadband)
 *   - Quarterly: fetch-parks.ts (parks + amenities)
 *   - Weekly: fetch-pbot-pavement.ts (pavement condition)
 *
 * Usage: npx tsx scripts/fetch-all-qol.ts [--skip-airnow] [--skip-census] [--skip-trimet] [--skip-seed] [--skip-parks] [--skip-pavement]
 */

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const skip = new Set(args.filter(a => a.startsWith('--skip-')).map(a => a.replace('--skip-', '')));

interface ScriptRun {
  name: string;
  script: string;
  skipFlag: string;
  cadence: string;
}

const scripts: ScriptRun[] = [
  { name: "AirNow AQI", script: "scripts/fetch-airnow.ts", skipFlag: "airnow", cadence: "daily" },
  { name: "Census QoL (rent, education, income)", script: "scripts/fetch-census-qol.ts", skipFlag: "census", cadence: "annually" },
  { name: "TriMet Ridership + Bike/Trails", script: "scripts/fetch-trimet-ridership.ts", skipFlag: "trimet", cadence: "monthly" },
  { name: "QoL Static Data (cultural, canopy, broadband)", script: "scripts/seed-quality-extras.ts", skipFlag: "seed", cadence: "quarterly" },
  { name: "Parks & Amenities", script: "scripts/fetch-parks.ts", skipFlag: "parks", cadence: "quarterly" },
  { name: "PBOT Pavement Condition", script: "scripts/fetch-pbot-pavement.ts", skipFlag: "pavement", cadence: "weekly" },
];

async function main() {
  console.log("Portland Dashboard — Quality of Life Data Fetch");
  console.log("================================================");
  console.log(`Running at: ${new Date().toISOString()}`);
  console.log("");

  const results: { name: string; status: string; duration: number }[] = [];

  for (const s of scripts) {
    if (skip.has(s.skipFlag)) {
      console.log(`\n⏭ SKIPPING: ${s.name} (--skip-${s.skipFlag})`);
      results.push({ name: s.name, status: "skipped", duration: 0 });
      continue;
    }

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Running: ${s.name} (cadence: ${s.cadence})`);
    console.log(`${"=".repeat(50)}`);

    const start = Date.now();
    try {
      execSync(`npx tsx ${s.script}`, {
        stdio: "inherit",
        timeout: 120000, // 2 min per script
        env: { ...process.env },
      });
      const duration = (Date.now() - start) / 1000;
      results.push({ name: s.name, status: "success", duration });
      console.log(`\n✓ ${s.name} completed in ${duration.toFixed(1)}s`);
    } catch (err: any) {
      const duration = (Date.now() - start) / 1000;
      results.push({ name: s.name, status: "failed", duration });
      console.error(`\n✗ ${s.name} failed after ${duration.toFixed(1)}s: ${err.message}`);
    }
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(50)}`);
  for (const r of results) {
    const icon = r.status === "success" ? "✓" : r.status === "skipped" ? "⏭" : "✗";
    console.log(`  ${icon} ${r.name}: ${r.status}${r.duration > 0 ? ` (${r.duration.toFixed(1)}s)` : ""}`);
  }

  const failed = results.filter(r => r.status === "failed").length;
  if (failed > 0) {
    console.log(`\n${failed} script(s) failed. Check output above.`);
    process.exit(1);
  }

  console.log("\nAll QoL data scripts completed successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
