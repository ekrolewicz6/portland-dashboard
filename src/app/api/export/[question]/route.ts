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
  migration: migrationData,
  business: businessData,
  downtown: downtownData,
  safety: safetyData,
  tax: taxData,
  housing: housingData,
  program: programData,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ question: string }> }
) {
  const { question } = await params;

  if (!isValidQuestion(question)) {
    return NextResponse.json(
      { error: "Invalid question. Valid options: migration, business, downtown, safety, tax, housing, program" },
      { status: 400 }
    );
  }

  const data = dataMap[question];
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
  const filename = `portland-commons-${question}-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
