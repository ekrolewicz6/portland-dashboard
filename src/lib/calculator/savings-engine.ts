/**
 * PCB Benefits Calculator — Savings Engine
 *
 * Computes estimated first-year value of Portland Commons Business certification.
 */

import {
  TAX_RATES,
  SDC_RATES,
  SECTOR_TO_USE_TYPE,
  SECTOR_BENEFITS,
  GROUP_HEALTH_SAVINGS_PER_EMPLOYEE_MONTHLY,
  FREE_RENT_MONTHS,
  BLT_HOLIDAY_YEARS,
  SDC_REDUCTION_PCT,
  PERMITTING_MONTHS_SAVED,
  type Sector,
} from "./tax-data";

// ── Input / Output Types ──────────────────────────────────────────

export interface CalculatorInputs {
  sector: Sector;
  squareFootage: number;
  buildoutCost: number;
  year1Revenue: number;
  ownerIncome: number;
  numOwners: number;
  numEmployees: number;
  takingNewSpace: boolean;
}

export interface HardSavings {
  bltHoliday: number;
  sdcReduction: number;
  permittingTimeSavings: number;
  total: number;
}

export interface NetworkValue {
  launchSponsorship: number;
  realEstateBenefit: number;
  referralNetworkRevenue: number;
  groupHealthSavings: number;
  aiConciergeValue: number;
  total: number;
}

export interface SavingsReport {
  hardSavings: HardSavings;
  networkValue: NetworkValue;
  grandTotal: number;
}

// ── Calculator ────────────────────────────────────────────────────

export function calculateSavings(inputs: CalculatorInputs): SavingsReport {
  const {
    sector,
    squareFootage,
    year1Revenue,
    ownerIncome,
    numOwners,
    numEmployees,
    takingNewSpace,
  } = inputs;

  const sectorBenefits = SECTOR_BENEFITS[sector];
  const useType = SECTOR_TO_USE_TYPE[sector];

  // ── Hard Savings ──

  // BLT holiday: 2 years of 2.6% of net income (using owner income as proxy)
  const estimatedNetIncome = ownerIncome * numOwners;
  const bltHoliday = BLT_HOLIDAY_YEARS * TAX_RATES.BLT * estimatedNetIncome;

  // SDC reduction: 50% of SDC based on use type and square footage (only if taking new space)
  const fullSDC = (SDC_RATES[useType] ?? SDC_RATES.office) * squareFootage;
  const sdcReduction = takingNewSpace ? SDC_REDUCTION_PCT * fullSDC : 0;

  // Permitting time savings: months saved * monthly rent
  const monthlyRent = sectorBenefits.marketRentPerSqFt * squareFootage;
  const permittingTimeSavings = takingNewSpace
    ? PERMITTING_MONTHS_SAVED * monthlyRent
    : 0;

  const hardTotal = bltHoliday + sdcReduction + permittingTimeSavings;

  // ── Network Value ──

  // Launch sponsorship: midpoint of sector range
  const [sponsorMin, sponsorMax] = sectorBenefits.launchSponsorship;
  const launchSponsorship = Math.round((sponsorMin + sponsorMax) / 2);

  // Real estate benefit: 3 months free rent at market rate
  const realEstateBenefit = takingNewSpace
    ? FREE_RENT_MONTHS * monthlyRent
    : 0;

  // Referral network revenue: sector estimate, scaled by revenue
  const revenueScale = Math.min(year1Revenue / 500_000, 2);
  const referralNetworkRevenue = Math.round(
    sectorBenefits.referralRevenue * Math.max(revenueScale, 0.5)
  );

  // Group health insurance savings
  const groupHealthSavings =
    numEmployees * GROUP_HEALTH_SAVINGS_PER_EMPLOYEE_MONTHLY * 12;

  // AI concierge value: midpoint
  const [aiMin, aiMax] = sectorBenefits.aiConciergeValue;
  const aiConciergeValue = Math.round((aiMin + aiMax) / 2);

  const networkTotal =
    launchSponsorship +
    realEstateBenefit +
    referralNetworkRevenue +
    groupHealthSavings +
    aiConciergeValue;

  return {
    hardSavings: {
      bltHoliday: Math.round(bltHoliday),
      sdcReduction: Math.round(sdcReduction),
      permittingTimeSavings: Math.round(permittingTimeSavings),
      total: Math.round(hardTotal),
    },
    networkValue: {
      launchSponsorship,
      realEstateBenefit: Math.round(realEstateBenefit),
      referralNetworkRevenue,
      groupHealthSavings,
      aiConciergeValue,
      total: Math.round(networkTotal),
    },
    grandTotal: Math.round(hardTotal + networkTotal),
  };
}
