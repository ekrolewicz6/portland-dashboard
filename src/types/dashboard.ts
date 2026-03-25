// ---------------------------------------------------------------------------
// Portland Civic Lab Dashboard — Core Type Definitions
// ---------------------------------------------------------------------------

/** Traffic-light indicator for headline metrics */
export type TrafficLight = "green" | "yellow" | "red";

/** Direction a trend is heading */
export type TrendDirection = "up" | "down" | "flat";

/** Severity level for insight items */
export type InsightSeverity = "info" | "warning" | "critical" | "positive";

/** Question category identifiers */
export type QuestionId =
  | "housing"
  | "homelessness"
  | "safety"
  | "transportation"
  | "education"
  | "fiscal"
  | "economy"
  | "environment"
  | "quality"
  | "accountability"
  | "climate"
  // Legacy IDs — kept for API route compatibility
  | "migration"
  | "business"
  | "downtown"
  | "tax"
  | "program";

// ---------------------------------------------------------------------------
// Chart & Time-Series
// ---------------------------------------------------------------------------

export interface ChartDataPoint {
  date: string; // ISO-8601 date string
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  id: string;
  name: string;
  unit: string;
  points: ChartDataPoint[];
}

// ---------------------------------------------------------------------------
// Headline Metric
// ---------------------------------------------------------------------------

export interface HeadlineMetric {
  value: number | string;
  unit: string;
  label: string;
  trendDirection: TrendDirection;
  trendPercentage: number;
  trafficLight: TrafficLight;
}

// ---------------------------------------------------------------------------
// Dashboard Question (top-level entity)
// ---------------------------------------------------------------------------

export interface DashboardQuestion {
  id: QuestionId;
  title: string;
  headlineMetric: HeadlineMetric;
  trend: TrendDirection;
  chartData: ChartDataPoint[];
  source: string;
  lastUpdated: string; // ISO-8601 date
  insights: InsightItem[];
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export interface InsightItem {
  id: string;
  text: string;
  severity: InsightSeverity;
  date: string; // ISO-8601 date
  question: QuestionId;
}

// ---------------------------------------------------------------------------
// Tax Comparison
// ---------------------------------------------------------------------------

export interface TaxBreakdownItem {
  name: string;
  amount: number;
  percentage: number;
}

export interface TaxComparison {
  city: string;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
}

// ---------------------------------------------------------------------------
// Vacancy / GeoJSON
// ---------------------------------------------------------------------------

export interface VacancyProperties {
  id: string;
  address: string;
  vacancyRate: number;
  squareFeet: number;
  type: string;
  neighborhood: string;
}

export interface VacancyFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  };
  properties: VacancyProperties;
}

export interface VacancyGeoJSON {
  type: "FeatureCollection";
  features: VacancyFeature[];
}

// ---------------------------------------------------------------------------
// Neighborhood
// ---------------------------------------------------------------------------

export interface NeighborhoodData {
  id: string;
  name: string;
  population: number;
  medianIncome: number;
  crimeRate: number;
  vacancyRate: number;
  coordinates: [longitude: number, latitude: number];
}
