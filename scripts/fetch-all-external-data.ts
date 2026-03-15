/**
 * fetch-all-external-data.ts
 *
 * Master script that orchestrates fetching from all external data sources.
 * Runs each fetcher as a child process, logs everything.
 *
 * Usage: npx tsx scripts/fetch-all-external-data.ts
 */

import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const SCRIPTS_DIR = path.resolve(import.meta.dirname ?? ".");
const LOG_DIR = path.resolve(SCRIPTS_DIR, "..", "data", "logs");

fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

interface FetchResult {
  script: string;
  success: boolean;
  duration: number;
  error?: string;
}

async function runScript(scriptName: string): Promise<FetchResult> {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const logFile = path.join(LOG_DIR, `${scriptName.replace(".ts", "")}_${timestamp}.log`);
  const start = Date.now();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${scriptName}`);
  console.log(`${"=".repeat(60)}`);

  try {
    const output = execSync(`npx tsx "${scriptPath}"`, {
      cwd: path.resolve(SCRIPTS_DIR, ".."),
      timeout: 300000, // 5 minutes per script
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const duration = Date.now() - start;
    console.log(output);

    fs.writeFileSync(logFile, output);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`   Log: ${logFile}`);

    return { script: scriptName, success: true, duration };
  } catch (err: any) {
    const duration = Date.now() - start;
    const errorOutput = (err.stdout ?? "") + "\n" + (err.stderr ?? "") + "\n" + (err.message ?? "");
    console.error(`   FAILED after ${(duration / 1000).toFixed(1)}s`);
    console.error(`   Error: ${err.message?.slice(0, 200)}`);
    console.log(err.stdout ?? "");

    fs.writeFileSync(logFile, errorOutput);

    return { script: scriptName, success: false, duration, error: err.message?.slice(0, 200) };
  }
}

async function main() {
  console.log("Portland Dashboard — External Data Fetch");
  console.log("=========================================");
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Log directory: ${LOG_DIR}`);

  const scripts = [
    "fetch-trimet-gtfs.ts",
    "fetch-fbi-crime.ts",
    "fetch-housing-data.ts",
    "fetch-oregon-employment.ts",
  ];

  const results: FetchResult[] = [];

  for (const script of scripts) {
    const result = await runScript(script);
    results.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  for (const r of results) {
    const status = r.success ? "OK" : "FAILED";
    console.log(`  [${status}] ${r.script} (${(r.duration / 1000).toFixed(1)}s)${r.error ? ` — ${r.error.slice(0, 100)}` : ""}`);
  }

  console.log(`\n  ${succeeded.length}/${results.length} succeeded, ${failed.length} failed`);
  console.log(`  Total time: ${(results.reduce((s, r) => s + r.duration, 0) / 1000).toFixed(1)}s`);

  // Save results summary
  const summaryPath = path.join(LOG_DIR, `fetch_summary_${timestamp}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    succeeded: succeeded.length,
    failed: failed.length,
  }, null, 2));
  console.log(`  Summary: ${summaryPath}`);

  console.log("\n=========================================");
  console.log("External data fetch complete!");

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
