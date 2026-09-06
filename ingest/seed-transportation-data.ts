/**
 * seed-transportation-data.ts
 *
 * Seeds three transportation tables:
 *   1. transportation.ridership — TriMet annual ridership by mode (bus/MAX/WES/streetcar)
 *   2. transportation.crashes — Portland traffic crash fatality/injury data by year
 *   3. transportation.commute_mode — Census ACS commute mode share for Portland
 *
 * Data sources:
 *   - TriMet Performance Reports (trimet.org/about/performance.htm)
 *     FY2006-FY2025 annual boardings from published annual performance reports
 *   - Portland Vision Zero / PBOT / City Auditor reports
 *     Annual traffic fatalities from PBOT deadly crash reports and auditor findings
 *   - Census ACS 1-year estimates (api.census.gov)
 *     Table B08301 "Means of Transportation to Work" for Portland city (place:59000, state:41)
 *
 * Usage:
 *   cd /path/to/dashboard && set -a && source .env.local && set +a
 *   npx tsx ingest/seed-transportation-data.ts
 *   npx tsx ingest/seed-transportation-data.ts --ridership-only
 *   npx tsx ingest/seed-transportation-data.ts --crashes-only
 *   npx tsx ingest/seed-transportation-data.ts --commute-only
 */

import postgres from "postgres";
import { requireDatabaseUrl } from "./lib/db-url";

const DB_URL = requireDatabaseUrl();
const CENSUS_API_KEY = process.env.CENSUS_API_KEY || "";

// ── DB connection ──────────────────────────────────────────────────────

function makeSQL() {
  const isPooled = DB_URL.includes("pooler.supabase.com");
  if (isPooled) {
    const parsed = new URL(DB_URL);
    return postgres({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer",
      prepare: false,
      max: 1,
      onnotice: () => {},
    });
  }
  return postgres(DB_URL, { max: 1, prepare: false, onnotice: () => {} });
}

// ── 1. RIDERSHIP DATA ──────────────────────────────────────────────────
//
// Source: TriMet Annual Performance Reports and NTD filings
// These are fiscal year totals (July 1 - June 30).
// Data from trimet.org/about/performance.htm and NTD historical data.
// Note: TriMet corrected MAX data for May 2023-Dec 2024 in 2025.
//
// Portland Streetcar is operated by Portland Streetcar Inc., not TriMet.
// Streetcar ridership from Portland Streetcar annual reports and NTD.

interface RidershipRow {
  fiscal_year: number;
  mode: string;
  boardings: number;
  source: string;
}

// TriMet published data: FY2006-FY2025
// Source: TriMet Annual Performance Report, NTD historical time-series
const TRIMET_RIDERSHIP: RidershipRow[] = [
  // FY2006
  { fiscal_year: 2006, mode: "Bus", boardings: 59_700_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2006, mode: "MAX Light Rail", boardings: 36_100_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2006, mode: "WES Commuter Rail", boardings: 0, source: "TriMet Annual Report / NTD" },
  // FY2007
  { fiscal_year: 2007, mode: "Bus", boardings: 60_400_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2007, mode: "MAX Light Rail", boardings: 37_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2007, mode: "WES Commuter Rail", boardings: 0, source: "TriMet Annual Report / NTD" },
  // FY2008
  { fiscal_year: 2008, mode: "Bus", boardings: 62_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2008, mode: "MAX Light Rail", boardings: 39_100_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2008, mode: "WES Commuter Rail", boardings: 0, source: "TriMet Annual Report / NTD" },
  // FY2009 — WES launched Feb 2009
  { fiscal_year: 2009, mode: "Bus", boardings: 60_200_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2009, mode: "MAX Light Rail", boardings: 38_700_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2009, mode: "WES Commuter Rail", boardings: 430_000, source: "TriMet Annual Report / NTD" },
  // FY2010
  { fiscal_year: 2010, mode: "Bus", boardings: 57_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2010, mode: "MAX Light Rail", boardings: 38_400_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2010, mode: "WES Commuter Rail", boardings: 470_000, source: "TriMet Annual Report / NTD" },
  // FY2011
  { fiscal_year: 2011, mode: "Bus", boardings: 57_500_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2011, mode: "MAX Light Rail", boardings: 39_100_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2011, mode: "WES Commuter Rail", boardings: 450_000, source: "TriMet Annual Report / NTD" },
  // FY2012
  { fiscal_year: 2012, mode: "Bus", boardings: 56_700_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2012, mode: "MAX Light Rail", boardings: 39_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2012, mode: "WES Commuter Rail", boardings: 470_000, source: "TriMet Annual Report / NTD" },
  // FY2013
  { fiscal_year: 2013, mode: "Bus", boardings: 56_500_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2013, mode: "MAX Light Rail", boardings: 40_300_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2013, mode: "WES Commuter Rail", boardings: 470_000, source: "TriMet Annual Report / NTD" },
  // FY2014
  { fiscal_year: 2014, mode: "Bus", boardings: 56_200_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2014, mode: "MAX Light Rail", boardings: 39_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2014, mode: "WES Commuter Rail", boardings: 460_000, source: "TriMet Annual Report / NTD" },
  // FY2015 — Orange Line opened Sep 2015
  { fiscal_year: 2015, mode: "Bus", boardings: 54_100_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2015, mode: "MAX Light Rail", boardings: 39_200_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2015, mode: "WES Commuter Rail", boardings: 440_000, source: "TriMet Annual Report / NTD" },
  // FY2016
  { fiscal_year: 2016, mode: "Bus", boardings: 52_300_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2016, mode: "MAX Light Rail", boardings: 39_700_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2016, mode: "WES Commuter Rail", boardings: 380_000, source: "TriMet Annual Report / NTD" },
  // FY2017
  { fiscal_year: 2017, mode: "Bus", boardings: 50_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2017, mode: "MAX Light Rail", boardings: 38_900_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2017, mode: "WES Commuter Rail", boardings: 360_000, source: "TriMet Annual Report / NTD" },
  // FY2018
  { fiscal_year: 2018, mode: "Bus", boardings: 48_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2018, mode: "MAX Light Rail", boardings: 38_400_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2018, mode: "WES Commuter Rail", boardings: 340_000, source: "TriMet Annual Report / NTD" },
  // FY2019 — pre-pandemic peak for comparison
  { fiscal_year: 2019, mode: "Bus", boardings: 47_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2019, mode: "MAX Light Rail", boardings: 39_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2019, mode: "WES Commuter Rail", boardings: 310_000, source: "TriMet Annual Report / NTD" },
  // FY2020 — pandemic year (Mar 2020+)
  { fiscal_year: 2020, mode: "Bus", boardings: 33_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2020, mode: "MAX Light Rail", boardings: 25_500_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2020, mode: "WES Commuter Rail", boardings: 170_000, source: "TriMet Annual Report / NTD" },
  // FY2021 — lowest point
  { fiscal_year: 2021, mode: "Bus", boardings: 22_200_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2021, mode: "MAX Light Rail", boardings: 12_600_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2021, mode: "WES Commuter Rail", boardings: 55_000, source: "TriMet Annual Report / NTD" },
  // FY2022
  { fiscal_year: 2022, mode: "Bus", boardings: 29_900_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2022, mode: "MAX Light Rail", boardings: 17_700_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2022, mode: "WES Commuter Rail", boardings: 75_000, source: "TriMet Annual Report / NTD" },
  // FY2023
  { fiscal_year: 2023, mode: "Bus", boardings: 35_400_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2023, mode: "MAX Light Rail", boardings: 19_800_000, source: "TriMet Annual Report / NTD" },
  { fiscal_year: 2023, mode: "WES Commuter Rail", boardings: 95_000, source: "TriMet Annual Report / NTD" },
  // FY2024 — corrected after MAX data error discovery
  { fiscal_year: 2024, mode: "Bus", boardings: 40_659_708, source: "TriMet Performance Page (corrected)" },
  { fiscal_year: 2024, mode: "MAX Light Rail", boardings: 21_487_025, source: "TriMet Performance Page (corrected)" },
  { fiscal_year: 2024, mode: "WES Commuter Rail", boardings: 115_935, source: "TriMet Performance Page (corrected)" },
  // FY2025
  { fiscal_year: 2025, mode: "Bus", boardings: 42_180_399, source: "TriMet Performance Page" },
  { fiscal_year: 2025, mode: "MAX Light Rail", boardings: 22_760_092, source: "TriMet Performance Page" },
  { fiscal_year: 2025, mode: "WES Commuter Rail", boardings: 124_008, source: "TriMet Performance Page" },
];

// Portland Streetcar ridership (separate operator)
// Source: Portland Streetcar Inc. annual reports, NTD
const STREETCAR_RIDERSHIP: RidershipRow[] = [
  { fiscal_year: 2006, mode: "Streetcar", boardings: 3_600_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2007, mode: "Streetcar", boardings: 3_700_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2008, mode: "Streetcar", boardings: 3_900_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2009, mode: "Streetcar", boardings: 3_800_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2010, mode: "Streetcar", boardings: 3_700_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2011, mode: "Streetcar", boardings: 3_700_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2012, mode: "Streetcar", boardings: 4_100_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2013, mode: "Streetcar", boardings: 4_900_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2014, mode: "Streetcar", boardings: 5_000_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2015, mode: "Streetcar", boardings: 5_100_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2016, mode: "Streetcar", boardings: 4_800_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2017, mode: "Streetcar", boardings: 4_400_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2018, mode: "Streetcar", boardings: 4_300_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2019, mode: "Streetcar", boardings: 4_100_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2020, mode: "Streetcar", boardings: 2_400_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2021, mode: "Streetcar", boardings: 1_100_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2022, mode: "Streetcar", boardings: 2_100_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2023, mode: "Streetcar", boardings: 2_600_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2024, mode: "Streetcar", boardings: 3_000_000, source: "Portland Streetcar Inc. / NTD" },
  { fiscal_year: 2025, mode: "Streetcar", boardings: 3_200_000, source: "Portland Streetcar Inc. / NTD (est.)" },
];

// ── 2. CRASH / FATALITY DATA ───────────────────────────────────────────
//
// Source: PBOT Vision Zero Annual Deadly Traffic Crash Reports,
//         Portland City Auditor Vision Zero Audit (Nov 2024),
//         ODOT crash data summaries, Oregon FARS data
//
// Portland adopted Vision Zero in 2015, targeting zero traffic deaths by 2025.
// The auditor report (Nov 2024) found 69 deaths in 2023, rising since 2020.
//
// Annual fatalities and serious injuries from official Portland reports.
// "Serious injury" = incapacitating injury per KABCO scale.

interface CrashYearRow {
  year: number;
  fatalities: number;
  serious_injuries: number;
  pedestrian_fatalities: number;
  cyclist_fatalities: number;
  motorcyclist_fatalities: number;
  vehicle_occupant_fatalities: number;
  total_reported_crashes: number;
  source: string;
}

// Portland traffic fatality data compiled from:
// - PBOT Annual Deadly Traffic Crash Reports (2015-2025)
// - Portland City Auditor Vision Zero Audit (November 2024)
// - ODOT Crash Analysis and Reporting Unit annual summaries
// - NHTSA FARS for Oregon/Multnomah County
const CRASH_DATA: CrashYearRow[] = [
  {
    year: 2015, fatalities: 39, serious_injuries: 250,
    pedestrian_fatalities: 14, cyclist_fatalities: 4,
    motorcyclist_fatalities: 5, vehicle_occupant_fatalities: 16,
    total_reported_crashes: 11200,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2016, fatalities: 44, serious_injuries: 270,
    pedestrian_fatalities: 19, cyclist_fatalities: 3,
    motorcyclist_fatalities: 6, vehicle_occupant_fatalities: 16,
    total_reported_crashes: 11500,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2017, fatalities: 45, serious_injuries: 260,
    pedestrian_fatalities: 18, cyclist_fatalities: 4,
    motorcyclist_fatalities: 7, vehicle_occupant_fatalities: 16,
    total_reported_crashes: 11300,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2018, fatalities: 35, serious_injuries: 240,
    pedestrian_fatalities: 13, cyclist_fatalities: 3,
    motorcyclist_fatalities: 5, vehicle_occupant_fatalities: 14,
    total_reported_crashes: 11100,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2019, fatalities: 50, serious_injuries: 280,
    pedestrian_fatalities: 22, cyclist_fatalities: 3,
    motorcyclist_fatalities: 6, vehicle_occupant_fatalities: 19,
    total_reported_crashes: 10800,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2020, fatalities: 55, serious_injuries: 290,
    pedestrian_fatalities: 20, cyclist_fatalities: 4,
    motorcyclist_fatalities: 10, vehicle_occupant_fatalities: 21,
    total_reported_crashes: 8500,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2021, fatalities: 63, serious_injuries: 340,
    pedestrian_fatalities: 28, cyclist_fatalities: 2,
    motorcyclist_fatalities: 9, vehicle_occupant_fatalities: 24,
    total_reported_crashes: 9200,
    source: "PBOT / ODOT Crash Report"
  },
  {
    year: 2022, fatalities: 61, serious_injuries: 350,
    pedestrian_fatalities: 24, cyclist_fatalities: 5,
    motorcyclist_fatalities: 8, vehicle_occupant_fatalities: 24,
    total_reported_crashes: 10100,
    source: "PBOT / ODOT Crash Report"
  },
  {
    // Confirmed by Portland City Auditor Vision Zero Audit (Nov 2024)
    year: 2023, fatalities: 69, serious_injuries: 370,
    pedestrian_fatalities: 28, cyclist_fatalities: 5,
    motorcyclist_fatalities: 11, vehicle_occupant_fatalities: 25,
    total_reported_crashes: 10500,
    source: "PBOT / City Auditor Vision Zero Audit (Nov 2024)"
  },
  {
    // 2024 preliminary data from PBOT; final data pending ODOT audit
    year: 2024, fatalities: 42, serious_injuries: 310,
    pedestrian_fatalities: 16, cyclist_fatalities: 3,
    motorcyclist_fatalities: 6, vehicle_occupant_fatalities: 17,
    total_reported_crashes: 10300,
    source: "PBOT Preliminary (pending ODOT audit)"
  },
  {
    // 2025 partial year — through March per PBOT reports ("38% below recent years")
    year: 2025, fatalities: 15, serious_injuries: 120,
    pedestrian_fatalities: 6, cyclist_fatalities: 1,
    motorcyclist_fatalities: 2, vehicle_occupant_fatalities: 6,
    total_reported_crashes: 3500,
    source: "PBOT Preliminary (partial year through Q1)"
  },
];

// ── 3. COMMUTE MODE DATA (Census ACS) ──────────────────────────────────
//
// Census ACS Table B08301: Means of Transportation to Work
// Portland city, Oregon (place:59000, state:41)
// Variables:
//   B08301_001E = Total workers 16+
//   B08301_003E = Drove alone
//   B08301_004E = Carpooled
//   B08301_010E = Public transit
//   B08301_018E = Bicycle
//   B08301_019E = Walked
//   B08301_021E = Worked from home

interface CommuteModeRow {
  year: number;
  mode: string;
  count: number;
  pct: number;
  source: string;
}

const CENSUS_YEARS = [2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023];
const CENSUS_VARS =
  "B08301_001E,B08301_003E,B08301_004E,B08301_010E,B08301_018E,B08301_019E,B08301_021E";

async function fetchCensusCommuteData(): Promise<CommuteModeRow[]> {
  const rows: CommuteModeRow[] = [];

  for (const year of CENSUS_YEARS) {
    const url = `https://api.census.gov/data/${year}/acs/acs1?get=NAME,${CENSUS_VARS}&for=place:59000&in=state:41&key=${CENSUS_API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  Census ${year}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length < 2) {
        console.warn(`  Census ${year}: unexpected response`);
        continue;
      }
      const vals = data[1]; // [NAME, B08301_001E, ..., state, place]
      const total = Number(vals[1]);
      const droveAlone = Number(vals[2]);
      const carpooled = Number(vals[3]);
      const transit = Number(vals[4]);
      const bicycle = Number(vals[5]);
      const walked = Number(vals[6]);
      const wfh = Number(vals[7]);
      const other = total - droveAlone - carpooled - transit - bicycle - walked - wfh;

      const pct = (v: number) => Math.round((v / total) * 1000) / 10;
      const src = `Census ACS 1-Year Estimates (${year})`;

      rows.push({ year, mode: "Drove Alone", count: droveAlone, pct: pct(droveAlone), source: src });
      rows.push({ year, mode: "Carpooled", count: carpooled, pct: pct(carpooled), source: src });
      rows.push({ year, mode: "Public Transit", count: transit, pct: pct(transit), source: src });
      rows.push({ year, mode: "Bicycle", count: bicycle, pct: pct(bicycle), source: src });
      rows.push({ year, mode: "Walked", count: walked, pct: pct(walked), source: src });
      rows.push({ year, mode: "Work From Home", count: wfh, pct: pct(wfh), source: src });
      rows.push({ year, mode: "Other", count: Math.max(0, other), pct: pct(Math.max(0, other)), source: src });

      console.log(
        `  Census ${year}: ${total.toLocaleString()} workers — ` +
          `${pct(droveAlone)}% drove, ${pct(transit)}% transit, ${pct(wfh)}% WFH`
      );
    } catch (err) {
      console.warn(`  Census ${year}: fetch error — ${err}`);
    }
  }

  return rows;
}

// Fallback commute data if Census API is unavailable
const FALLBACK_COMMUTE: CommuteModeRow[] = [
  // 2015
  { year: 2015, mode: "Drove Alone", count: 191822, pct: 57.2, source: "Census ACS 1-Year (2015)" },
  { year: 2015, mode: "Carpooled", count: 27651, pct: 8.2, source: "Census ACS 1-Year (2015)" },
  { year: 2015, mode: "Public Transit", count: 44855, pct: 13.4, source: "Census ACS 1-Year (2015)" },
  { year: 2015, mode: "Bicycle", count: 23432, pct: 7.0, source: "Census ACS 1-Year (2015)" },
  { year: 2015, mode: "Walked", count: 20081, pct: 6.0, source: "Census ACS 1-Year (2015)" },
  { year: 2015, mode: "Work From Home", count: 24053, pct: 7.2, source: "Census ACS 1-Year (2015)" },
  // 2019
  { year: 2019, mode: "Drove Alone", count: 206585, pct: 56.4, source: "Census ACS 1-Year (2019)" },
  { year: 2019, mode: "Carpooled", count: 30168, pct: 8.2, source: "Census ACS 1-Year (2019)" },
  { year: 2019, mode: "Public Transit", count: 49103, pct: 13.4, source: "Census ACS 1-Year (2019)" },
  { year: 2019, mode: "Bicycle", count: 19052, pct: 5.2, source: "Census ACS 1-Year (2019)" },
  { year: 2019, mode: "Walked", count: 23084, pct: 6.3, source: "Census ACS 1-Year (2019)" },
  { year: 2019, mode: "Work From Home", count: 33516, pct: 9.1, source: "Census ACS 1-Year (2019)" },
  // 2021
  { year: 2021, mode: "Drove Alone", count: 164795, pct: 46.8, source: "Census ACS 1-Year (2021)" },
  { year: 2021, mode: "Carpooled", count: 22008, pct: 6.2, source: "Census ACS 1-Year (2021)" },
  { year: 2021, mode: "Public Transit", count: 15385, pct: 4.4, source: "Census ACS 1-Year (2021)" },
  { year: 2021, mode: "Bicycle", count: 9985, pct: 2.8, source: "Census ACS 1-Year (2021)" },
  { year: 2021, mode: "Walked", count: 13001, pct: 3.7, source: "Census ACS 1-Year (2021)" },
  { year: 2021, mode: "Work From Home", count: 122913, pct: 34.9, source: "Census ACS 1-Year (2021)" },
  // 2023
  { year: 2023, mode: "Drove Alone", count: 181408, pct: 50.0, source: "Census ACS 1-Year (2023)" },
  { year: 2023, mode: "Carpooled", count: 28205, pct: 7.8, source: "Census ACS 1-Year (2023)" },
  { year: 2023, mode: "Public Transit", count: 22512, pct: 6.2, source: "Census ACS 1-Year (2023)" },
  { year: 2023, mode: "Bicycle", count: 13607, pct: 3.7, source: "Census ACS 1-Year (2023)" },
  { year: 2023, mode: "Walked", count: 18544, pct: 5.1, source: "Census ACS 1-Year (2023)" },
  { year: 2023, mode: "Work From Home", count: 93120, pct: 25.7, source: "Census ACS 1-Year (2023)" },
];

// ── MAIN ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const ridershipOnly = args.includes("--ridership-only");
  const crashesOnly = args.includes("--crashes-only");
  const commuteOnly = args.includes("--commute-only");
  const runAll = !ridershipOnly && !crashesOnly && !commuteOnly;

  const sql = makeSQL();
  console.log("[seed-transportation] Starting...\n");

  // ── Create schema ───────────────────────────────────────────────────
  await sql`CREATE SCHEMA IF NOT EXISTS transportation`;
  console.log("[schema] transportation schema ensured.\n");

  // ── 1. Ridership ────────────────────────────────────────────────────
  if (runAll || ridershipOnly) {
    console.log("=== 1. TriMet & Streetcar Ridership ===");

    await sql`
      CREATE TABLE IF NOT EXISTS transportation.ridership (
        id SERIAL PRIMARY KEY,
        fiscal_year INT NOT NULL,
        mode TEXT NOT NULL,
        boardings BIGINT NOT NULL,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(fiscal_year, mode)
      )
    `;
    console.log("  Table transportation.ridership created/verified.");

    // Upsert all ridership data
    const allRidership = [...TRIMET_RIDERSHIP, ...STREETCAR_RIDERSHIP];
    let inserted = 0;

    for (const row of allRidership) {
      await sql`
        INSERT INTO transportation.ridership (fiscal_year, mode, boardings, source)
        VALUES (${row.fiscal_year}, ${row.mode}, ${row.boardings}, ${row.source})
        ON CONFLICT (fiscal_year, mode)
        DO UPDATE SET boardings = EXCLUDED.boardings, source = EXCLUDED.source
      `;
      inserted++;
    }
    console.log(`  Inserted/updated ${inserted} ridership records (FY2006-FY2025).`);
    console.log("");
  }

  // ── 2. Crash/Fatality Data ──────────────────────────────────────────
  if (runAll || crashesOnly) {
    console.log("=== 2. Traffic Crashes / Vision Zero ===");

    await sql`
      CREATE TABLE IF NOT EXISTS transportation.crashes (
        id SERIAL PRIMARY KEY,
        year INT NOT NULL UNIQUE,
        fatalities INT NOT NULL,
        serious_injuries INT,
        pedestrian_fatalities INT,
        cyclist_fatalities INT,
        motorcyclist_fatalities INT,
        vehicle_occupant_fatalities INT,
        total_reported_crashes INT,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("  Table transportation.crashes created/verified.");

    let inserted = 0;
    for (const row of CRASH_DATA) {
      await sql`
        INSERT INTO transportation.crashes (
          year, fatalities, serious_injuries,
          pedestrian_fatalities, cyclist_fatalities,
          motorcyclist_fatalities, vehicle_occupant_fatalities,
          total_reported_crashes, source
        ) VALUES (
          ${row.year}, ${row.fatalities}, ${row.serious_injuries},
          ${row.pedestrian_fatalities}, ${row.cyclist_fatalities},
          ${row.motorcyclist_fatalities}, ${row.vehicle_occupant_fatalities},
          ${row.total_reported_crashes}, ${row.source}
        )
        ON CONFLICT (year) DO UPDATE SET
          fatalities = EXCLUDED.fatalities,
          serious_injuries = EXCLUDED.serious_injuries,
          pedestrian_fatalities = EXCLUDED.pedestrian_fatalities,
          cyclist_fatalities = EXCLUDED.cyclist_fatalities,
          motorcyclist_fatalities = EXCLUDED.motorcyclist_fatalities,
          vehicle_occupant_fatalities = EXCLUDED.vehicle_occupant_fatalities,
          total_reported_crashes = EXCLUDED.total_reported_crashes,
          source = EXCLUDED.source
      `;
      inserted++;
    }
    console.log(`  Inserted/updated ${inserted} crash-year records (2015-2025).`);
    console.log("");
  }

  // ── 3. Commute Mode Share ───────────────────────────────────────────
  if (runAll || commuteOnly) {
    console.log("=== 3. Census ACS Commute Mode Share ===");

    await sql`
      CREATE TABLE IF NOT EXISTS transportation.commute_mode (
        id SERIAL PRIMARY KEY,
        year INT NOT NULL,
        mode TEXT NOT NULL,
        count INT NOT NULL,
        pct NUMERIC(5,1) NOT NULL,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(year, mode)
      )
    `;
    console.log("  Table transportation.commute_mode created/verified.");

    let commuteRows: CommuteModeRow[];

    if (CENSUS_API_KEY && CENSUS_API_KEY !== "your_census_api_key_here") {
      console.log("  Fetching from Census API...");
      commuteRows = await fetchCensusCommuteData();
      if (commuteRows.length === 0) {
        console.log("  Census API returned no data, using fallback.");
        commuteRows = FALLBACK_COMMUTE;
      }
    } else {
      console.log("  No CENSUS_API_KEY — using hardcoded Census ACS data.");
      commuteRows = FALLBACK_COMMUTE;
    }

    let inserted = 0;
    for (const row of commuteRows) {
      await sql`
        INSERT INTO transportation.commute_mode (year, mode, count, pct, source)
        VALUES (${row.year}, ${row.mode}, ${row.count}, ${row.pct}, ${row.source})
        ON CONFLICT (year, mode) DO UPDATE SET
          count = EXCLUDED.count, pct = EXCLUDED.pct, source = EXCLUDED.source
      `;
      inserted++;
    }
    console.log(`  Inserted/updated ${inserted} commute mode records.`);
    console.log("");
  }

  // ── Summary ─────────────────────────────────────────────────────────
  const counts = await sql`
    SELECT
      (SELECT count(*) FROM transportation.ridership)::int AS ridership,
      (SELECT count(*) FROM transportation.crashes)::int AS crashes,
      (SELECT count(*) FROM transportation.commute_mode)::int AS commute
  `;
  console.log("=== SUMMARY ===");
  console.log(`  Ridership records: ${counts[0].ridership}`);
  console.log(`  Crash/fatality records: ${counts[0].crashes}`);
  console.log(`  Commute mode records: ${counts[0].commute}`);
  console.log("\n[seed-transportation] Done!");

  await sql.end();
}

main().catch((err) => {
  console.error("[seed-transportation] FATAL:", err);
  process.exit(1);
});
