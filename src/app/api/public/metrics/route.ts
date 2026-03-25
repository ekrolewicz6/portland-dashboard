import { NextResponse } from "next/server";
import {
  migrationData,
  businessData,
  downtownData,
  safetyData,
  taxData,
  housingData,
  programData,
} from "@/lib/mock-data";
import type { DashboardResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const allQuestions: { id: string; data: DashboardResponse }[] = [
  { id: "migration", data: migrationData },
  { id: "business", data: businessData },
  { id: "downtown", data: downtownData },
  { id: "safety", data: safetyData },
  { id: "tax", data: taxData },
  { id: "housing", data: housingData },
  { id: "program", data: programData },
];

const questionLabels: Record<string, string> = {
  migration: "Is Portland gaining or losing people?",
  business: "Is Portland gaining or losing businesses?",
  downtown: "Is downtown coming back?",
  safety: "Is Portland safe?",
  tax: "Is the tax burden competitive?",
  housing: "Is housing getting built?",
  program: "Is the Portland Civic Lab working?",
};

export async function GET() {
  const questions = allQuestions.map(({ id, data }) => ({
    id,
    question: questionLabels[id],
    headline: data.headline,
    trend: {
      direction: data.trend.direction,
      percentage: data.trend.percentage,
      label: data.trend.label,
    },
    lastUpdated: data.lastUpdated,
    source: data.source,
  }));

  return NextResponse.json(
    { questions },
    {
      headers: {
        "X-RateLimit-Limit": "100",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
