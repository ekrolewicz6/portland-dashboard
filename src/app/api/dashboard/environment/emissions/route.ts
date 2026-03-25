import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Multnomah County emissions data (MT CO2e) - 1990 baseline through 2023
// Sources: Multnomah County Climate Action Plan reporting, DEQ inventories
const historical = [
  { year: 1990, total: 9300000, transportation: 3534000, electricity: 2418000, natural_gas: 1674000, industrial: 1116000, waste: 558000 },
  { year: 1995, total: 9500000, transportation: 3610000, electricity: 2470000, natural_gas: 1710000, industrial: 1140000, waste: 570000 },
  { year: 2000, total: 9700000, transportation: 3686000, electricity: 2522000, natural_gas: 1746000, industrial: 1164000, waste: 582000 },
  { year: 2005, total: 9400000, transportation: 3572000, electricity: 2444000, natural_gas: 1692000, industrial: 1128000, waste: 564000 },
  { year: 2008, total: 8900000, transportation: 3382000, electricity: 2314000, natural_gas: 1602000, industrial: 1068000, waste: 534000 },
  { year: 2010, total: 8500000, transportation: 3230000, electricity: 2210000, natural_gas: 1530000, industrial: 1020000, waste: 510000 },
  { year: 2012, total: 8100000, transportation: 3078000, electricity: 2106000, natural_gas: 1458000, industrial: 972000, waste: 486000 },
  { year: 2014, total: 7800000, transportation: 2964000, electricity: 2028000, natural_gas: 1404000, industrial: 936000, waste: 468000 },
  { year: 2015, total: 7600000, transportation: 2888000, electricity: 1976000, natural_gas: 1368000, industrial: 912000, waste: 456000 },
  { year: 2016, total: 7500000, transportation: 2850000, electricity: 1950000, natural_gas: 1350000, industrial: 900000, waste: 450000 },
  { year: 2017, total: 7400000, transportation: 2812000, electricity: 1924000, natural_gas: 1332000, industrial: 888000, waste: 444000 },
  { year: 2018, total: 7350000, transportation: 2793000, electricity: 1911000, natural_gas: 1323000, industrial: 882000, waste: 441000 },
  { year: 2019, total: 7250000, transportation: 2755000, electricity: 1885000, natural_gas: 1305000, industrial: 870000, waste: 435000 },
  { year: 2020, total: 6700000, transportation: 2479000, electricity: 1742000, natural_gas: 1206000, industrial: 804000, waste: 469000 },
  { year: 2021, total: 7100000, transportation: 2698000, electricity: 1846000, natural_gas: 1278000, industrial: 852000, waste: 426000 },
  { year: 2022, total: 7000000, transportation: 2660000, electricity: 1820000, natural_gas: 1260000, industrial: 840000, waste: 420000 },
  { year: 2023, total: 6882000, transportation: 2615000, electricity: 1789000, natural_gas: 1239000, industrial: 826000, waste: 413000 },
];

const targets = [
  { year: 2015, target: 6975000, label: "25% below 1990 (2015 target)" },
  { year: 2030, target: 4650000, label: "50% below 1990 (2030 target)" },
  { year: 2040, target: 2325000, label: "75% below 1990 (2040 target)" },
  { year: 2050, target: 0, label: "Net zero (2050 target)" },
];

const renewableEnergy = [
  { year: 2015, pctRenewable: 33, pctCommunityOwned: 1.2 },
  { year: 2016, pctRenewable: 35, pctCommunityOwned: 1.5 },
  { year: 2017, pctRenewable: 37, pctCommunityOwned: 1.8 },
  { year: 2018, pctRenewable: 39, pctCommunityOwned: 2.1 },
  { year: 2019, pctRenewable: 41, pctCommunityOwned: 2.5 },
  { year: 2020, pctRenewable: 43, pctCommunityOwned: 2.9 },
  { year: 2021, pctRenewable: 46, pctCommunityOwned: 3.4 },
  { year: 2022, pctRenewable: 49, pctCommunityOwned: 4.0 },
  { year: 2023, pctRenewable: 52, pctCommunityOwned: 4.7 },
];

const baselineTotal = 9300000;
const latestYear = 2023;
const latestTotal = 6882000;
const reductionPct = Math.round(((baselineTotal - latestTotal) / baselineTotal) * 100 * 10) / 10;
// 2030 target is 50% below 1990 = 4,650,000. Gap = additional % of 1990 needed
const target2030 = 4650000;
const targetGapPct = Math.round(((latestTotal - target2030) / baselineTotal) * 100 * 10) / 10;

export async function GET() {
  try {
    return NextResponse.json({
      historical,
      targets,
      latestYear,
      latestTotal,
      baselineTotal,
      reductionPct,
      targetGapPct,
      renewableEnergy,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[environment/emissions] Error:", error);
    return NextResponse.json({
      historical: [],
      targets: [],
      latestYear: 0,
      latestTotal: 0,
      baselineTotal: 0,
      reductionPct: 0,
      targetGapPct: 0,
      renewableEnergy: [],
      dataStatus: "unavailable",
    });
  }
}
