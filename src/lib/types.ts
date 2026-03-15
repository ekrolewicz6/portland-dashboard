/** Shared types for the Portland Commons Dashboard API */

export interface TrendInfo {
  direction: "up" | "down" | "flat";
  percentage: number;
  label: string;
}

export interface ChartPoint {
  date: string;
  value: number;
  label?: string;
}

export interface DashboardResponse {
  headline: string;
  headlineValue: number | string;
  trend: TrendInfo;
  chartData: ChartPoint[];
  source: string;
  lastUpdated: string;
  insights: string[];
}

export interface MigrationData extends DashboardResponse {
  netActivations: ChartPoint[];
  censusPopulation: ChartPoint[];
}

export interface BusinessData extends DashboardResponse {
  newRegistrations: ChartPoint[];
  cancelledRegistrations: ChartPoint[];
  civicAppsLicenses: ChartPoint[];
}

export interface DowntownData extends DashboardResponse {
  footTraffic: ChartPoint[];
  vacancyRate: ChartPoint[];
  dwellTime: ChartPoint[];
}

export interface SafetyData extends DashboardResponse {
  crimeByCategory: { category: string; count: number; change: number }[];
  responseTime: ChartPoint[];
}

export interface TaxJurisdiction {
  name: string;
  propertyTaxRate: number;
  incomeTaxRate: number | string;
  salesTaxRate: number;
  bizLicenseFee: number | string;
  transitTax: number;
  artsEducationTax: number;
  effectiveRate: number;
}

export interface TaxData extends DashboardResponse {
  jurisdictions: TaxJurisdiction[];
}

export interface HousingData extends DashboardResponse {
  permitPipeline: ChartPoint[];
  processingDays: ChartPoint[];
  medianRent: ChartPoint[];
}

export interface ProgramData extends DashboardResponse {
  certifiedBusinesses: ChartPoint[];
  survivalRate: ChartPoint[];
  jobsCreated: ChartPoint[];
}

export interface VacancyFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    address: string;
    type: "retail" | "office" | "industrial" | "mixed-use";
    sqft: number;
    vacantSince: string;
    askingRent: number | null;
    neighborhood: string;
  };
}

export interface VacancyMapData {
  type: "FeatureCollection";
  features: VacancyFeature[];
  summary: {
    totalVacant: number;
    byType: Record<string, number>;
    byNeighborhood: Record<string, number>;
  };
  lastUpdated: string;
  source: string;
}
