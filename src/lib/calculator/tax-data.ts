/**
 * Portland tax rates, SDC tables, and sector benefit estimates
 * for the PCB Benefits Calculator.
 */

// ── Portland Local Tax Rates ──────────────────────────────────────

export const TAX_RATES = {
  /** Business License Tax: 2.6% of net income */
  BLT: 0.026,
  /** Multnomah County Business Income Tax: 2.0% of net income */
  MULTCO_BIT: 0.02,
  /** Metro Supportive Housing Services: 1.0% (if gross > $5M) */
  METRO_SHS: 0.01,
  METRO_SHS_THRESHOLD: 5_000_000,
  /** Portland/Multnomah Preschool For All: 1.5% personal (if income > $125K) */
  PFA: 0.015,
  PFA_THRESHOLD: 125_000,
  /** Arts Tax: $35 per person */
  ARTS_TAX: 35,
} as const;

// ── System Development Charges by Use Type (per sq ft) ────────────

export type UseType = "restaurant" | "retail" | "office" | "warehouse" | "healthcare";

export const SDC_RATES: Record<UseType, number> = {
  restaurant: 15,
  retail: 10,
  office: 8,
  warehouse: 5,
  healthcare: 10,
};

// ── Sector Definitions ────────────────────────────────────────────

export type Sector =
  | "restaurant_bar"
  | "retail"
  | "creative"
  | "tech"
  | "maker_manufacturing"
  | "healthcare"
  | "professional_services";

export const SECTOR_LABELS: Record<Sector, string> = {
  restaurant_bar: "Restaurant / Bar",
  retail: "Retail",
  creative: "Creative Studio",
  tech: "Tech Startup",
  maker_manufacturing: "Maker / Manufacturing",
  healthcare: "Healthcare",
  professional_services: "Professional Services",
};

/** Maps each sector to the SDC use type for square-footage calculations. */
export const SECTOR_TO_USE_TYPE: Record<Sector, UseType> = {
  restaurant_bar: "restaurant",
  retail: "retail",
  creative: "office",
  tech: "office",
  maker_manufacturing: "warehouse",
  healthcare: "healthcare",
  professional_services: "office",
};

// ── Network Value Estimates by Sector ─────────────────────────────

export interface SectorBenefits {
  /** Launch sponsorship value range [min, max] */
  launchSponsorship: [number, number];
  /** Monthly market-rate rent per sq ft for free-rent calculation */
  marketRentPerSqFt: number;
  /** Estimated annual referral network revenue */
  referralRevenue: number;
  /** AI concierge value range [min, max] */
  aiConciergeValue: [number, number];
}

export const SECTOR_BENEFITS: Record<Sector, SectorBenefits> = {
  restaurant_bar: {
    launchSponsorship: [10_000, 15_000],
    marketRentPerSqFt: 2.5,
    referralRevenue: 25_000,
    aiConciergeValue: [3_000, 5_000],
  },
  retail: {
    launchSponsorship: [7_500, 12_000],
    marketRentPerSqFt: 2.0,
    referralRevenue: 20_000,
    aiConciergeValue: [2_500, 4_000],
  },
  creative: {
    launchSponsorship: [5_000, 10_000],
    marketRentPerSqFt: 1.8,
    referralRevenue: 15_000,
    aiConciergeValue: [2_000, 4_000],
  },
  tech: {
    launchSponsorship: [8_000, 15_000],
    marketRentPerSqFt: 2.8,
    referralRevenue: 30_000,
    aiConciergeValue: [4_000, 5_000],
  },
  maker_manufacturing: {
    launchSponsorship: [5_000, 10_000],
    marketRentPerSqFt: 1.2,
    referralRevenue: 18_000,
    aiConciergeValue: [2_000, 3_500],
  },
  healthcare: {
    launchSponsorship: [8_000, 12_000],
    marketRentPerSqFt: 2.2,
    referralRevenue: 22_000,
    aiConciergeValue: [3_000, 5_000],
  },
  professional_services: {
    launchSponsorship: [6_000, 12_000],
    marketRentPerSqFt: 2.5,
    referralRevenue: 20_000,
    aiConciergeValue: [3_000, 5_000],
  },
};

/** Monthly per-employee group health insurance savings */
export const GROUP_HEALTH_SAVINGS_PER_EMPLOYEE_MONTHLY = 400;

/** Months of free rent provided by real estate benefit */
export const FREE_RENT_MONTHS = 3;

/** BLT holiday duration in years */
export const BLT_HOLIDAY_YEARS = 2;

/** SDC reduction percentage */
export const SDC_REDUCTION_PCT = 0.5;

/** Estimated permitting time saved in months */
export const PERMITTING_MONTHS_SAVED = 2;
