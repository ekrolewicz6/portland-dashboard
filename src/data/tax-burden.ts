/**
 * Local tax and fiscal burden comparison — Portland vs. peer jurisdictions.
 *
 * PROVENANCE. Every figure here is transcribed from a published source; none
 * of it is modeled, estimated, or generated. This file lives in src/data/
 * (verified reference data) rather than a mock/fixture module precisely so
 * that provenance is unambiguous.
 *
 *   - Per-capita revenue and the peer-city ranking come from the Lincoln
 *     Institute of Land Policy Fiscally Standardized Cities (FiSC) database,
 *     2023 update. Values are real per-capita dollars in 2022 dollars.
 *     See src/data/fisc-tax-burden-2023.json for the full extract and the
 *     workbook URL it was taken from.
 *   - Jurisdiction rates are published statutory rates from the Oregon
 *     Department of Revenue, the IRS, and the equivalent Washington state
 *     agencies, read in May 2026.
 *
 * TAX_BURDEN_VERIFIED_AT records when a human last re-read the underlying
 * sources. Update it whenever you touch a number in this file.
 */

import type { TaxData } from "@/lib/types";

/** Date a human last re-verified every figure below against its source. */
export const TAX_BURDEN_VERIFIED_AT = "2026-05-06";

export const TAX_BURDEN_SOURCE =
  "Lincoln Institute FiSC 2023 · OR DOR · IRS · state tax agencies";

export const TAX_BURDEN: TaxData = {
  headline: "7,223 local own-source + utility dollars per resident in FiSC 2023, ranking Portland 24th of the 150 largest cities",
  headlineValue: "$7.2K",
  trend: { direction: "up", percentage: 44.0, label: "real per-capita increase since 2013" },
  chartData: [
    { date: "San Francisco", value: 17023 },
    { date: "Seattle", value: 10822 },
    { date: "Denver", value: 10952 },
    { date: "Portland", value: 7223 },
    { date: "Austin", value: 7942 },
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
  source: "Lincoln Institute FiSC 2023 · OR DOR · IRS · state tax agencies",
  lastUpdated: "2026-05-06",
  insights: [
    "Income-tax-only comparisons are incomplete: FiSC shows Portland collects $7,223 per resident in local own-source plus utility revenue, ranking 24th of the 150 largest FiSC cities.",
    "Taxes are the high-burden piece: Portland's FiSC tax revenue is $4,970 per resident, ranking 7th of 150, while charges plus utility revenue rank 61st of 150.",
    "Portland's broad local fiscal basket rose 44% in real per-capita terms from 2013 to 2023; local taxes rose 62% over the same period.",
    "FiSC revenue includes money collected from residents and businesses by city, county, school, and special districts. It is not a household tax bill.",
    "The W-2 income-tax calculator remains useful, but it should be read as a narrow scenario alongside the full local fiscal basket.",
  ],
};
