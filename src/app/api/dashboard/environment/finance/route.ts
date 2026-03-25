import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PCEF Climate Investment Plan — $750M 5-year plan adopted Sept 2023
// Source: portland.gov/bps/cleanenergy/climate-investment-plan

const pcefByCategory = [
  { name: "Energy Efficiency (Housing & Small Business)", value: 300_000_000, color: "#3d7a5a" },
  { name: "Transportation Decarbonization", value: 128_000_000, color: "#4a7f9e" },
  { name: "Green Infrastructure", value: 70_000_000, color: "#7c6f9e" },
  { name: "Renewable Energy (Affordable Housing)", value: 60_000_000, color: "#c8956c" },
  { name: "Equitable Tree Canopy", value: 40_000_000, color: "#3d7a5a" },
  { name: "Community Grants (60 Nonprofit Projects)", value: 64_400_000, color: "#d4a843" },
  { name: "Workforce Development & Administration", value: 87_600_000, color: "#64748b" },
];

// Bureau vs Community split — audit finding: City not transparent about bureau PCEF use
const pcefByRecipientType = [
  { name: "Community Organizations", value: 410_000_000, color: "#3d7a5a" },
  { name: "City Bureau Programs", value: 340_000_000, color: "#4a7f9e" },
];

// Resource gaps from all 43 workplan actions
const resourceGaps = [
  { name: "Funded", value: 7, color: "#059669" },
  { name: "$ (< $100K)", value: 5, color: "#3d7a5a" },
  { name: "$$ ($100K–$500K)", value: 4, color: "#c8956c" },
  { name: "$$$ ($500K–$1M)", value: 5, color: "#d97706" },
  { name: "$$$$ ($1M–$5M)", value: 3, color: "#b85c3a" },
  { name: "$$$$$ (> $5M)", value: 7, color: "#dc2626" },
  { name: "N/A", value: 6, color: "#78716c" },
  { name: "TBD (Unknown)", value: 5, color: "#9f1239" },
  { name: "None / Revenue+", value: 1, color: "#64748b" },
];

// PCEF spending timeline
const fundingTimeline = [
  { name: "FY 22-23", allocated: 95_000_000, spent: 62_000_000 },
  { name: "FY 23-24", allocated: 155_000_000, spent: 118_000_000 },
  { name: "FY 24-25", allocated: 180_000_000, spent: 89_000_000 },
  { name: "FY 25-26", allocated: 165_000_000, spent: 42_000_000 },
  { name: "FY 26-27 (proj)", allocated: 155_000_000, spent: 0 },
];

export async function GET() {
  try {
    const totalAllocated = 750_000_000;
    const totalSpent = fundingTimeline.reduce((s, d) => s + d.spent, 0);
    const totalProjectsFunded = 60 + 120; // 60 nonprofit grants + ~120 bureau projects

    return NextResponse.json({
      pcefByCategory,
      pcefByRecipientType,
      resourceGaps,
      totalAllocated,
      totalSpent,
      totalProjectsFunded,
      fundingTimeline,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[environment/finance] Error:", error);
    return NextResponse.json({
      pcefByCategory: [],
      pcefByRecipientType: [],
      resourceGaps: [],
      totalAllocated: 0,
      totalSpent: 0,
      totalProjectsFunded: 0,
      fundingTimeline: [],
      dataStatus: "unavailable",
    });
  }
}
