import { NextResponse } from "next/server";
import { withFreshness } from "@/lib/dashboard-response";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "education";

// Single round-trip query using json_build_object to avoid pooler deadlocks.
const COMBINED_QUERY = `
  SELECT json_build_object(
    'enrollment_latest', (
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT school_year, SUM(enrollment)::int AS enrollment
        FROM education.enrollment
        WHERE grade_level = 'Total'
          AND demographic_group IS NULL
          AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
        GROUP BY school_year
        ORDER BY school_year DESC
        LIMIT 2
      ) t
    ),
    'enrollment_trend', (
      SELECT COALESCE(json_agg(t ORDER BY t.school_year), '[]'::json) FROM (
        SELECT school_year, SUM(enrollment)::int AS enrollment
        FROM education.enrollment
        WHERE grade_level = 'Total'
          AND demographic_group IS NULL
          AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
        GROUP BY school_year
      ) t
    ),
    'avg_grad_rate', (
      SELECT row_to_json(t) FROM (
        SELECT school_year, ROUND(AVG(rate_4yr)::numeric, 1) AS avg_rate
        FROM education.graduation_rates
        WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
          AND rate_4yr IS NOT NULL
        GROUP BY school_year
        ORDER BY school_year DESC
        LIMIT 1
      ) t
    ),
    'avg_proficiency', (
      SELECT row_to_json(t) FROM (
        SELECT school_year,
          ROUND(AVG(proficiency_pct)::numeric, 1) AS avg_proficiency
        FROM education.test_scores
        WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
          AND proficiency_pct IS NOT NULL
        GROUP BY school_year
        ORDER BY school_year DESC
        LIMIT 1
      ) t
    )
  ) AS payload
`;

export async function GET() {
  try {
    // Check cache first
    const cached = await getCachedData<Record<string, unknown>>(CACHE_KEY);
    if (cached) return NextResponse.json(withFreshness(cached));

    const result = await sql.unsafe(COMBINED_QUERY);
    const payload = (result[0]?.payload ?? {}) as Record<string, unknown>;

    const enrollmentLatest = (payload.enrollment_latest as { school_year: string; enrollment: number }[]) ?? [];
    const enrollmentTrend = (payload.enrollment_trend as { school_year: string; enrollment: number }[]) ?? [];
    const avgGradRate = payload.avg_grad_rate as { school_year: string; avg_rate: number } | null;
    const avgProficiency = payload.avg_proficiency as { school_year: string; avg_proficiency: number } | null;

    if (enrollmentLatest.length === 0) {
      return NextResponse.json(withFreshness({
        headline: "Education data not yet available",
        headlineValue: 0,
        dataStatus: "unavailable",
        dataAvailable: false,
        dataSources: [
          {
            name: "Portland-area Enrollment Data (6 districts)",
            status: "needed",
            provider: "Oregon Department of Education",
            action: "Run: npx tsx ingest/parse-education.ts",
          },
        ],
        trend: { direction: "flat", percentage: 0, label: "not yet tracked" },
        chartData: [],
        source: "Oregon Department of Education · Enrollment · Assessment · Graduation",
        lastUpdated: new Date().toISOString().slice(0, 10),
        insights: ["Run parse-education.ts to load ODE enrollment data"],
      }));
    }

    const latest = enrollmentLatest[0];
    const prior = enrollmentLatest.length > 1 ? enrollmentLatest[1] : null;

    const totalEnrollment = Number(latest.enrollment);
    const priorEnrollment = prior ? Number(prior.enrollment) : null;
    const yoyChange =
      priorEnrollment && priorEnrollment > 0
        ? ((totalEnrollment - priorEnrollment) / priorEnrollment) * 100
        : 0;

    const direction = yoyChange > 0 ? "up" : yoyChange < 0 ? "down" : "flat";
    const absChange = Math.abs(yoyChange);

    const chartData = enrollmentTrend.map((r) => ({
      date: r.school_year,
      value: Number(r.enrollment),
    }));

    // Build insights from real data
    const insights: string[] = [];
    insights.push(
      `${totalEnrollment.toLocaleString()} students across 6 Portland-area districts (${latest.school_year})`
    );
    if (priorEnrollment) {
      insights.push(
        `${direction === "down" ? "Declined" : "Grew"} ${absChange.toFixed(1)}% from ${priorEnrollment.toLocaleString()} (${prior!.school_year})`
      );
    }
    if (avgGradRate) {
      insights.push(`Average 4-year graduation rate: ${avgGradRate.avg_rate}% (${avgGradRate.school_year})`);
    }
    if (avgProficiency) {
      insights.push(`Average proficiency rate: ${avgProficiency.avg_proficiency}% (${avgProficiency.school_year})`);
    }

    const headline = `${totalEnrollment.toLocaleString()} Portland-area students — ${direction} ${absChange.toFixed(1)}% from last year`;

    const responseData = {
      headline,
      headlineValue: totalEnrollment,
      dataStatus: "live",
      dataAvailable: true,
      dataSources: [
        {
          name: "ODE Enrollment Data (6 Portland-area districts)",
          status: "connected",
          provider: "Oregon Department of Education",
          action: "XLSX files parsed locally",
        },
        {
          name: "ODE Graduation Rates",
          status: "connected",
          provider: "Oregon Department of Education",
          action: "Published ODE values",
        },
        {
          name: "ODE Test Scores",
          status: "connected",
          provider: "Oregon Department of Education",
          action: "Smarter Balanced Assessment data",
        },
      ],
      trend: {
        direction,
        percentage: Math.round(absChange * 10) / 10,
        label: `vs ${prior?.school_year ?? "prior year"}`,
      },
      chartData,
      source: "Oregon Department of Education · Enrollment · Assessment · Graduation",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights,
    };

    await setCachedData(CACHE_KEY, responseData);
    return NextResponse.json(withFreshness(responseData));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Education API error:", message);
    // "unavailable", not "error": the caller's question is whether there is
    // anything to show, and the answer is no. Every other topic route uses
    // that value, the dashboard hub and the cache layer both key on it, and
    // a distinct value here only meant the same condition rendered
    // differently depending on which topic you were reading. The cause is
    // logged above, where it is actionable.
    return NextResponse.json(withFreshness({
      headline: "Education data temporarily unavailable",
      headlineValue: null,
      dataStatus: "unavailable",
      dataAvailable: false,
      dataSources: [],
      trend: { direction: "flat", percentage: 0, label: "error" },
      chartData: [],
      source: "Oregon Department of Education · Enrollment · Assessment · Graduation",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: ["Education data is not available right now."],
    }));
  }
}
