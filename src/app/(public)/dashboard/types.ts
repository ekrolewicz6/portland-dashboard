export interface ApiResponse {
  headline: string;
  headlineValue: number | string;
  trend: { direction: "up" | "down" | "flat"; percentage: number; label: string };
  chartData: { date: string; value: number }[];
  source: string;
  lastUpdated: string;
  insights: string[];
  dataStatus: string;
  dataAvailable?: boolean;
  dataSources?: { name: string; status: string; provider: string; action?: string }[];
}

export interface QuestionData {
  id: string;
  question: string;
  color: string;
  apiData: ApiResponse | null;
}
