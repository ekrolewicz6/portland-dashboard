import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ballot measures
    const measureRows = await sql`
      SELECT
        measure_number,
        measure_title,
        election_date,
        yes_pct,
        yes_votes,
        no_votes,
        passed,
        annual_revenue_estimate,
        description,
        jurisdiction
      FROM accountability.ballot_measures
      ORDER BY election_date DESC, measure_number
    `;

    const ballotMeasures = measureRows.map((r) => ({
      measureNumber: r.measure_number as string,
      title: r.measure_title as string,
      electionYear: new Date(r.election_date as string).getFullYear(),
      yesPercentage: Number(r.yes_pct),
      noPercentage: Number((100 - Number(r.yes_pct)).toFixed(2)),
      passed: Boolean(r.passed),
      annualRevenueEstimate: Number(r.annual_revenue_estimate),
      description: (r.description as string) ?? "",
      jurisdiction: (r.jurisdiction as string) ?? "",
    }));

    // Elected officials
    const officialRows = await sql`
      SELECT
        name,
        title,
        district,
        term_start,
        term_end,
        email,
        party
      FROM accountability.elected_officials
      ORDER BY title, district NULLS LAST, name
    `;

    const electedOfficials = officialRows.map((r) => ({
      name: r.name as string,
      title: r.title as string,
      district: (r.district as string) ?? null,
      termStart: r.term_start
        ? new Date(r.term_start as string).toISOString().slice(0, 10)
        : null,
      termEnd: r.term_end
        ? new Date(r.term_end as string).toISOString().slice(0, 10)
        : null,
      email: (r.email as string) ?? null,
      party: (r.party as string) ?? null,
    }));

    return NextResponse.json({
      ballotMeasures,
      electedOfficials,
      dataStatus: "live",
    });
  } catch (error) {
    console.error("[accountability/detail] DB query failed:", error);
    return NextResponse.json({
      ballotMeasures: [],
      electedOfficials: [],
      dataStatus: "unavailable",
    });
  }
}
