import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function aqiHeadline(aqi: number, category: string): string {
  switch (category) {
    case "Good":
      return `AQI ${aqi} (${category}) — Portland air quality is healthy today`;
    case "Moderate":
      return `AQI ${aqi} (${category}) — Air quality is acceptable but may pose risk for sensitive individuals`;
    case "Unhealthy for Sensitive Groups":
      return `AQI ${aqi} (${category}) — Sensitive groups should reduce outdoor activity`;
    case "Unhealthy":
      return `AQI ${aqi} (${category}) — Everyone may experience health effects`;
    case "Very Unhealthy":
      return `AQI ${aqi} (${category}) — Health alert: significant risk for all`;
    case "Hazardous":
      return `AQI ${aqi} (${category}) — Emergency conditions: avoid outdoor activity`;
    default:
      return `AQI ${aqi} — Portland air quality data`;
  }
}

export async function GET() {
  try {
    // Latest AQI reading
    const latestRows = await sql`
      SELECT date::text AS date, hour, aqi, category, pollutant, reporting_area
      FROM environment.airnow_aqi
      ORDER BY date DESC, hour DESC
      LIMIT 1
    `;

    if (latestRows.length === 0) {
      return NextResponse.json({
        headline: "Environment data not yet available",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [],
        trend: { direction: "flat", percentage: 0, label: "not yet tracked" },
        chartData: [],
        source: "EPA AirNow",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["No AQI data found in the database."],
      });
    }

    const latest = latestRows[0];
    const currentAqi = Number(latest.aqi);
    const category = aqiCategory(currentAqi);

    // 30-day PM2.5 trend (daily average)
    const trendRows = await sql`
      SELECT
        date::text AS date,
        ROUND(AVG(aqi))::int AS avg_aqi
      FROM environment.airnow_aqi
      WHERE pollutant = 'PM2.5'
        AND date >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY date
      ORDER BY date DESC
    `;

    const chartData = trendRows
      .map((r) => ({
        date: String(r.date).slice(5), // MM-DD
        value: Number(r.avg_aqi),
      }))
      .reverse();

    // Compute trend direction
    let trendDirection: "up" | "down" | "flat" = "flat";
    let trendPercentage = 0;
    if (chartData.length >= 2) {
      const first = chartData[0].value;
      const last = chartData[chartData.length - 1].value;
      if (first > 0) {
        trendPercentage = Math.round(((last - first) / first) * 100);
        trendDirection = trendPercentage > 0 ? "up" : trendPercentage < 0 ? "down" : "flat";
      }
    }

    // Insights
    const insights: string[] = [];
    insights.push(
      `Current AQI is ${currentAqi} (${category}) for ${latest.pollutant} in ${latest.reporting_area}.`
    );

    if (chartData.length > 1) {
      const avg7d = Math.round(
        chartData.reduce((s, d) => s + d.value, 0) / chartData.length
      );
      insights.push(
        `7-day average PM2.5 AQI is ${avg7d} — ${avg7d <= 50 ? "consistently healthy air" : avg7d <= 100 ? "generally acceptable" : "elevated levels detected"}.`
      );
    }

    if (currentAqi <= 50) {
      insights.push(
        "Air quality is in the 'Good' range — no health concerns for the general public."
      );
    } else if (currentAqi <= 100) {
      insights.push(
        "Air quality is 'Moderate' — unusually sensitive individuals should consider limiting prolonged outdoor exertion."
      );
    } else {
      insights.push(
        "Air quality is degraded — check AirNow.gov for real-time updates and health guidance."
      );
    }

    return NextResponse.json({
      headline: aqiHeadline(currentAqi, category),
      headlineValue: currentAqi,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "EPA AirNow AQI",
          status: "live",
          provider: "EPA / AirNow",
          action: "Real-time AQI data loaded into environment.airnow_aqi",
        },
        {
          name: "Climate Emergency Workplan (43 Actions)",
          status: "live",
          provider: "Bureau of Planning and Sustainability",
          action: "All 43 CEW actions encoded with status from 2025 progress report",
        },
        {
          name: "GHG Emissions Inventory (1990–2023)",
          status: "live",
          provider: "BPS Climate & Energy Dashboard",
          action: "Multnomah County emissions by sector, annual since 1990",
        },
        {
          name: "PCEF Investment Tracking ($750M)",
          status: "live",
          provider: "Portland Clean Energy Fund",
          action: "Climate Investment Plan allocations and spending by category",
        },
        {
          name: "Bureau Climate Scorecard",
          status: "live",
          provider: "Climate Justice Audit (Feb 2026)",
          action: "13 bureaus tracked with action assignments and performance",
        },
      ],
      trend: {
        direction: trendDirection,
        percentage: Math.abs(trendPercentage),
        label: `${Math.abs(trendPercentage)}% ${trendDirection} over 7 days`,
      },
      chartData,
      source: "EPA AirNow",
      lastUpdated: String(latest.date).slice(0, 10),
      insights,
    });
  } catch (error) {
    console.error("[environment] DB query failed:", error);
    return NextResponse.json({
      headline: "Environment data temporarily unavailable",
      headlineValue: 0,
      dataStatus: "unavailable",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat", percentage: 0, label: "not yet tracked" },
      chartData: [],
      source: "EPA AirNow",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Data temporarily unavailable — check back shortly."],
    });
  }
}
