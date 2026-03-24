import { NextRequest, NextResponse } from "next/server";
import { isValidQuestion } from "@/lib/questions";
import type { DashboardResponse } from "@/lib/types";
import {
  migrationData,
  businessData,
  downtownData,
  safetyData,
  taxData,
  housingData,
  programData,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const dataMap: Record<string, DashboardResponse> = {
  // New category mappings
  housing: housingData,
  safety: safetyData,
  economy: businessData,
  fiscal: taxData,
  // Legacy mappings
  migration: migrationData,
  business: businessData,
  downtown: downtownData,
  tax: taxData,
  program: programData,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ question: string }> }
) {
  const { question } = await params;

  if (!isValidQuestion(question)) {
    return NextResponse.json(
      { error: `Invalid question. Valid options: ${Object.keys(dataMap).join(", ")}` },
      { status: 400 }
    );
  }

  const data = dataMap[question];
  if (!data) {
    return NextResponse.json(
      { error: "No export data available for this category yet" },
      { status: 404 }
    );
  }

  const chartData = data.chartData;

  // Build CSV
  const rows: string[] = ["date,value"];
  for (const point of chartData) {
    // Escape values that might contain commas
    const date = point.date.includes(",") ? `"${point.date}"` : point.date;
    rows.push(`${date},${point.value}`);
  }
  const csv = rows.join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `portland-civic-${question}-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
