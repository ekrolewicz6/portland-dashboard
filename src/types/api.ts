// ---------------------------------------------------------------------------
// Portland Civic Lab Dashboard — API Response Types
// ---------------------------------------------------------------------------

import type {
  ChartDataPoint,
  DashboardQuestion,
  HeadlineMetric,
  InsightItem,
  NeighborhoodData,
  QuestionId,
  TaxComparison,
  TimeSeriesData,
  VacancyGeoJSON,
} from "./dashboard";

// ---------------------------------------------------------------------------
// Generic envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiMeta {
  requestId: string;
  timestamp: string; // ISO-8601
  source: string;
  cacheHit: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiError;
  meta: ApiMeta;
}

// ---------------------------------------------------------------------------
// Per-endpoint response payloads
// ---------------------------------------------------------------------------

/** GET /api/dashboard — full overview */
export type DashboardOverviewResponse = ApiResponse<{
  questions: DashboardQuestion[];
  lastUpdated: string;
}>;

/** GET /api/questions/:id — single question detail */
export type QuestionDetailResponse = ApiResponse<DashboardQuestion>;

/** GET /api/questions/:id/metric — headline metric for a question */
export type HeadlineMetricResponse = ApiResponse<HeadlineMetric>;

/** GET /api/questions/:id/chart — time-series chart data */
export type ChartDataResponse = ApiResponse<{
  questionId: QuestionId;
  series: TimeSeriesData[];
}>;

/** GET /api/insights — all insights, optionally filtered */
export type InsightsResponse = ApiResponse<{
  insights: InsightItem[];
  total: number;
}>;

/** GET /api/migration — migration-specific stats */
export type MigrationResponse = ApiResponse<{
  netMigration: number;
  inbound: number;
  outbound: number;
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/business — business-specific stats */
export type BusinessResponse = ApiResponse<{
  newRegistrations: number;
  closures: number;
  netChange: number;
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/downtown — downtown vitality stats */
export type DowntownResponse = ApiResponse<{
  footTraffic: number;
  vacancyRate: number;
  vacancyGeo: VacancyGeoJSON;
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/safety — public safety stats */
export type SafetyResponse = ApiResponse<{
  totalIncidents: number;
  crimeRate: number;
  clearanceRate: number;
  timeSeries: ChartDataPoint[];
  byCategory: Record<string, number>;
}>;

/** GET /api/tax — tax comparison data */
export type TaxResponse = ApiResponse<{
  portlandRate: number;
  comparisons: TaxComparison[];
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/housing — housing stats */
export type HousingResponse = ApiResponse<{
  medianPrice: number;
  inventory: number;
  affordabilityIndex: number;
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/program — city program effectiveness */
export type ProgramResponse = ApiResponse<{
  totalPrograms: number;
  budgetUtilization: number;
  outcomeScore: number;
  timeSeries: ChartDataPoint[];
}>;

/** GET /api/neighborhoods — neighborhood-level data */
export type NeighborhoodsResponse = ApiResponse<{
  neighborhoods: NeighborhoodData[];
}>;
