/**
 * Comprehensive mock data for all 7 Portland Commons Dashboard questions.
 * All numbers are realistic Portland-area figures for demonstration.
 * Date range: March 2025 – February 2026.
 */

import type {
  MigrationData,
  BusinessData,
  DowntownData,
  SafetyData,
  TaxData,
  HousingData,
  ProgramData,
  VacancyMapData,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function months(startYear = 2025, startMonth = 3, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const m = ((startMonth - 1 + i) % 12) + 1;
    const y = startYear + Math.floor((startMonth - 1 + i) / 12);
    return `${y}-${String(m).padStart(2, "0")}`;
  });
}

function weeks(count = 12) {
  const base = new Date("2025-12-01");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i * 7);
    return d.toISOString().slice(0, 10);
  });
}

const MONTHS = months();

// ─── 1. Migration ───────────────────────────────────────────────────────────

export const migrationData: MigrationData = {
  headline: "+1,240 net water activations in trailing 12 months",
  headlineValue: 1240,
  trend: { direction: "up", percentage: 3.2, label: "vs. prior 12 months" },
  chartData: MONTHS.map((date, i) => ({
    date,
    value: 80 + Math.round(Math.sin(i / 2) * 30 + i * 2),
  })),
  netActivations: MONTHS.map((date, i) => ({
    date,
    value: 80 + Math.round(Math.sin(i / 2) * 30 + i * 2),
    label: "Net water activations",
  })),
  censusPopulation: [
    { date: "2020", value: 652503 },
    { date: "2021", value: 648740 },
    { date: "2022", value: 641162 },
    { date: "2023", value: 635710 },
    { date: "2024", value: 637890 },
    { date: "2025", value: 641300 },
  ],
  source: "Portland Water Bureau / U.S. Census Bureau",
  lastUpdated: "2026-03-01",
  insights: [
    "Net water activations turned positive in Q2 2025 for the first time since 2020.",
    "East Portland ZIP codes 97233 and 97236 account for 38% of new activations.",
    "Census estimates suggest population decline has stabilized since mid-2024.",
    "Activation rate correlates with new multifamily COs issued by BDS.",
  ],
};

// ─── 2. Business Climate ────────────────────────────────────────────────────

export const businessData: BusinessData = {
  headline: "4,810 net new BLT registrations (TTM)",
  headlineValue: 4810,
  trend: { direction: "up", percentage: 7.1, label: "vs. prior 12 months" },
  chartData: MONTHS.map((date, i) => ({
    date,
    value: 380 + Math.round(Math.random() * 60 + i * 3),
  })),
  newRegistrations: MONTHS.map((date, i) => ({
    date,
    value: 520 + Math.round(Math.random() * 80 + i * 4),
    label: "New registrations",
  })),
  cancelledRegistrations: MONTHS.map((date, i) => ({
    date,
    value: 130 + Math.round(Math.random() * 40 - i),
    label: "Cancelled",
  })),
  civicAppsLicenses: MONTHS.map((date, i) => ({
    date,
    value: 42 + Math.round(Math.random() * 15 + i * 2),
    label: "CivicApps licenses",
  })),
  source: "Revenue Division BLT Registry / CivicApps",
  lastUpdated: "2026-03-01",
  insights: [
    "Food & beverage leads new registrations at 18% of total.",
    "Tech-sector CivicApps licenses up 22% YoY, driven by AI startups.",
    "Cancellation rate dropped to 24% from 31% a year ago.",
    "Pearl District and Central Eastside account for 27% of net new registrations.",
  ],
};

// ─── 3. Downtown Vitality ───────────────────────────────────────────────────

const WEEKS = weeks();

export const downtownData: DowntownData = {
  headline: "Foot traffic at 74% of 2019 baseline",
  headlineValue: 74,
  trend: { direction: "up", percentage: 8.5, label: "vs. same period last year" },
  chartData: WEEKS.map((date, i) => ({
    date,
    value: 68 + Math.round(Math.sin(i / 3) * 4 + i * 0.5),
  })),
  footTraffic: WEEKS.map((date, i) => ({
    date,
    value: 68 + Math.round(Math.sin(i / 3) * 4 + i * 0.5),
    label: "% of 2019 baseline",
  })),
  vacancyRate: MONTHS.map((date, i) => ({
    date,
    value: parseFloat((22.4 - i * 0.3).toFixed(1)),
    label: "Office vacancy %",
  })),
  dwellTime: WEEKS.map((date, i) => ({
    date,
    value: 38 + Math.round(Math.random() * 8 + i * 0.3),
    label: "Avg dwell (min)",
  })),
  source: "Placer.ai / CoStar / Portland Business Alliance",
  lastUpdated: "2026-03-07",
  insights: [
    "Saturday foot traffic has recovered to 89% of 2019, outpacing weekdays at 68%.",
    "Pioneer Courthouse Square area shows strongest recovery at 82% of baseline.",
    "Office vacancy rate peaked at 22.4% in March 2025, now trending down to 19.1%.",
    "Average dwell time is 42 minutes, up from 35 minutes a year ago.",
  ],
};

// ─── 4. Public Safety ───────────────────────────────────────────────────────

export const safetyData: SafetyData = {
  headline: "911 Priority 1 response: 7.2 min median",
  headlineValue: 7.2,
  trend: { direction: "down", percentage: 11.0, label: "faster vs. 12 months ago" },
  chartData: MONTHS.map((date, i) => ({
    date,
    value: parseFloat((8.1 - i * 0.08).toFixed(1)),
  })),
  crimeByCategory: [
    { category: "Property Crime", count: 28410, change: -6.2 },
    { category: "Person Crime", count: 8730, change: -3.8 },
    { category: "Vehicle Theft", count: 7120, change: -14.5 },
    { category: "Vandalism", count: 5640, change: -2.1 },
    { category: "Burglary", count: 3890, change: -8.7 },
    { category: "Assault", count: 3210, change: -1.4 },
    { category: "Robbery", count: 1480, change: -5.9 },
    { category: "Arson", count: 310, change: -18.3 },
  ],
  responseTime: MONTHS.map((date, i) => ({
    date,
    value: parseFloat((8.1 - i * 0.08).toFixed(1)),
    label: "Median P1 response (min)",
  })),
  source: "Portland Police Bureau / BOEC 911",
  lastUpdated: "2026-03-01",
  insights: [
    "Vehicle theft is down 14.5% YoY following the catalytic converter task force expansion.",
    "Priority 1 median response improved from 8.1 to 7.2 minutes over 12 months.",
    "Central Precinct saw the largest crime reduction at -9.3% overall.",
    "Staffing levels at 808 sworn officers, up from 789 a year ago.",
  ],
};

// ─── 5. Tax Competitiveness ─────────────────────────────────────────────────

export const taxData: TaxData = {
  headline: "Portland's 12.4% effective rate is 2nd highest among 10 comparable Western cities — only San Francisco is higher",
  headlineValue: "12.4%",
  trend: { direction: "flat", percentage: 0, label: "no rate changes this fiscal year" },
  chartData: [
    { date: "Portland", value: 100 },
    { date: "Seattle", value: 92 },
    { date: "Vancouver WA", value: 71 },
    { date: "Beaverton", value: 78 },
    { date: "Lake Oswego", value: 85 },
  ],
  jurisdictions: [
    {
      name: "Portland",
      propertyTaxRate: 1.05,
      incomeTaxRate: "1.5% city + 9.9% state",
      salesTaxRate: 0,
      bizLicenseFee: "2.6% net income",
      transitTax: 0.7937,
      artsEducationTax: 35,
      effectiveRate: 12.8,
    },
    {
      name: "Vancouver, WA",
      propertyTaxRate: 1.12,
      incomeTaxRate: "7% cap gains only",
      salesTaxRate: 8.6,
      bizLicenseFee: "$110 flat",
      transitTax: 0,
      artsEducationTax: 0,
      effectiveRate: 8.4,
    },
    {
      name: "Beaverton",
      propertyTaxRate: 0.98,
      incomeTaxRate: "9.9% state only",
      salesTaxRate: 0,
      bizLicenseFee: "$100 flat",
      transitTax: 0.7937,
      artsEducationTax: 0,
      effectiveRate: 10.2,
    },
    {
      name: "Lake Oswego",
      propertyTaxRate: 1.18,
      incomeTaxRate: "9.9% state only",
      salesTaxRate: 0,
      bizLicenseFee: "$150 flat",
      transitTax: 0.7937,
      artsEducationTax: 0,
      effectiveRate: 11.1,
    },
    {
      name: "Seattle",
      propertyTaxRate: 1.03,
      incomeTaxRate: "7% cap gains only",
      salesTaxRate: 10.25,
      bizLicenseFee: "0.415% gross",
      transitTax: 0,
      artsEducationTax: 0,
      effectiveRate: 13.1,
    },
  ],
  source: "Lincoln Institute / OR DOR / WA DOR / City budget offices",
  lastUpdated: "2026-01-15",
  insights: [
    "Portland has the HIGHEST local income tax burden (2.5%) of any comparable Western city — BLT 2.6%, MultCo BIT 2.0%, Metro SHS 1.0%, MultCo PFA 1.5%.",
    "At $200K income, a Portland resident pays $24,800 in total taxes — $5,000 of that is local taxes that don't exist in most other cities.",
    "Only San Francisco (13.1%) has a higher effective rate than Portland (12.4%), driven by California's 9.3% state income tax.",
    "No-income-tax states (TX, WA, NV) have effective rates of 6.4-7.3% — a $12,000-$18,000 annual difference from Portland at $200K income.",
    "Comparison includes: San Francisco, Portland, Bend, Denver, Salt Lake City, Boise, Seattle, Vancouver WA, Austin, and Reno.",
  ],
};

// ─── 6. Housing ─────────────────────────────────────────────────────────────

export const housingData: HousingData = {
  headline: "2,340 units in active permit pipeline",
  headlineValue: 2340,
  trend: { direction: "up", percentage: 18.4, label: "vs. prior 12 months" },
  chartData: MONTHS.map((date, i) => ({
    date,
    value: 170 + Math.round(i * 8 + Math.random() * 30),
  })),
  permitPipeline: MONTHS.map((date, i) => ({
    date,
    value: 170 + Math.round(i * 8 + Math.random() * 30),
    label: "Units permitted",
  })),
  processingDays: MONTHS.map((date, i) => ({
    date,
    value: Math.round(128 - i * 3 + Math.random() * 10),
    label: "Median days to permit",
  })),
  medianRent: MONTHS.map((date, i) => ({
    date,
    value: Math.round(1620 + i * 12 + Math.random() * 30),
    label: "Median 1BR rent ($)",
  })),
  source: "BDS PermitsNow / Zillow ZORI / HUD",
  lastUpdated: "2026-03-01",
  insights: [
    "Permit processing time dropped from 128 to 95 median days after BDS reform.",
    "73% of new permits are multifamily (5+ units), concentrated in East Portland and Gateway.",
    "Median 1BR rent rose to $1,755, a 3.8% YoY increase — below national average of 4.2%.",
    "ADU permits jumped 41% after the city waived SDCs for units under 800 sq ft.",
  ],
};

// ─── 7. Portland Commons Business Program ───────────────────────────────────

export const programData: ProgramData = {
  headline: "312 PCB-certified businesses, 89% survival rate",
  headlineValue: 312,
  trend: { direction: "up", percentage: 24.6, label: "vs. program launch" },
  chartData: MONTHS.map((date, i) => ({
    date,
    value: 220 + Math.round(i * 8 + Math.random() * 5),
  })),
  certifiedBusinesses: MONTHS.map((date, i) => ({
    date,
    value: 220 + Math.round(i * 8 + Math.random() * 5),
    label: "Cumulative certified",
  })),
  survivalRate: MONTHS.map((date, i) => ({
    date,
    value: parseFloat((86 + i * 0.25 + Math.random() * 0.5).toFixed(1)),
    label: "2-year survival %",
  })),
  jobsCreated: MONTHS.map((date, i) => ({
    date,
    value: 45 + Math.round(i * 4 + Math.random() * 10),
    label: "Jobs created (monthly)",
  })),
  source: "Portland Commons Program Office",
  lastUpdated: "2026-03-01",
  insights: [
    "89% two-year survival rate vs. 78% citywide average for new businesses.",
    "PCB businesses have created 1,840 jobs since program launch.",
    "Food & beverage and professional services are the top certified categories.",
    "East Portland and Cully neighborhoods represent 34% of certified businesses.",
  ],
};

// ─── 10. Vacancy Map GeoJSON ────────────────────────────────────────────────

export const vacancyMapData: VacancyMapData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6784, 45.5189] },
      properties: {
        address: "701 SW 6th Ave",
        type: "office",
        sqft: 48000,
        vacantSince: "2024-06-01",
        askingRent: 28.5,
        neighborhood: "Downtown",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6815, 45.5231] },
      properties: {
        address: "888 SW 5th Ave (Pioneer Place)",
        type: "retail",
        sqft: 12400,
        vacantSince: "2023-11-15",
        askingRent: 35.0,
        neighborhood: "Downtown",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6703, 45.5267] },
      properties: {
        address: "1201 NW Naito Pkwy",
        type: "office",
        sqft: 22000,
        vacantSince: "2025-01-10",
        askingRent: 24.0,
        neighborhood: "Pearl District",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6609, 45.5225] },
      properties: {
        address: "123 NE Grand Ave",
        type: "mixed-use",
        sqft: 8500,
        vacantSince: "2025-04-20",
        askingRent: 22.0,
        neighborhood: "Central Eastside",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6561, 45.5193] },
      properties: {
        address: "615 SE Morrison St",
        type: "retail",
        sqft: 3200,
        vacantSince: "2025-08-01",
        askingRent: 18.5,
        neighborhood: "Buckman",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6838, 45.5302] },
      properties: {
        address: "1455 NW Irving St",
        type: "retail",
        sqft: 5800,
        vacantSince: "2024-03-01",
        askingRent: 32.0,
        neighborhood: "Pearl District",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6762, 45.5156] },
      properties: {
        address: "200 SW Market St",
        type: "office",
        sqft: 64000,
        vacantSince: "2024-09-15",
        askingRent: 26.0,
        neighborhood: "Downtown",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6492, 45.5231] },
      properties: {
        address: "1020 SE Water Ave",
        type: "industrial",
        sqft: 15000,
        vacantSince: "2025-02-28",
        askingRent: 14.0,
        neighborhood: "Central Eastside",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6876, 45.5211] },
      properties: {
        address: "310 SW 4th Ave",
        type: "retail",
        sqft: 4100,
        vacantSince: "2024-12-01",
        askingRent: null,
        neighborhood: "Old Town",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6795, 45.5274] },
      properties: {
        address: "525 NW 12th Ave",
        type: "mixed-use",
        sqft: 11200,
        vacantSince: "2025-06-15",
        askingRent: 29.0,
        neighborhood: "Pearl District",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6531, 45.5188] },
      properties: {
        address: "820 SE Belmont St",
        type: "retail",
        sqft: 2600,
        vacantSince: "2025-09-10",
        askingRent: 20.0,
        neighborhood: "Buckman",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.6744, 45.5138] },
      properties: {
        address: "55 SW Yamhill St",
        type: "office",
        sqft: 36000,
        vacantSince: "2024-07-01",
        askingRent: 22.5,
        neighborhood: "Downtown",
      },
    },
  ],
  summary: {
    totalVacant: 12,
    byType: { office: 4, retail: 5, "mixed-use": 2, industrial: 1 },
    byNeighborhood: {
      Downtown: 4,
      "Pearl District": 3,
      "Central Eastside": 2,
      Buckman: 2,
      "Old Town": 1,
    },
  },
  lastUpdated: "2026-03-07",
  source: "CoStar / LoopNet / Portland BPS",
};
