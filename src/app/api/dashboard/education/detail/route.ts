import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

const DISTRICTS = [
  "Portland SD 1J",
  "Parkrose SD 3",
  "David Douglas SD 40",
  "Riverdale SD 51J",
  "Reynolds SD 7",
  "Centennial SD 28J",
] as const;

const DISTRICT_SHORT: Record<string, string> = {
  "Portland SD 1J": "PPS",
  "Parkrose SD 3": "Parkrose",
  "David Douglas SD 40": "David Douglas",
  "Riverdale SD 51J": "Riverdale",
  "Reynolds SD 7": "Reynolds",
  "Centennial SD 28J": "Centennial",
};

export async function GET() {
  try {
    // Enrollment by year per district
    const enrollmentByYear = await sql`
      SELECT district_name, school_year as year, enrollment as total
      FROM education.enrollment
      WHERE grade_level = 'Total'
        AND demographic_group IS NULL
        AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY district_name, school_year ASC
    `;

    // Latest school year
    const latestYearRow = await sql`
      SELECT MAX(school_year) as latest FROM education.enrollment
    `;
    const latestYear = latestYearRow[0]?.latest;

    // Enrollment by grade for latest year per district
    const enrollmentByGrade = await sql`
      SELECT district_name, grade_level as grade, enrollment as count
      FROM education.enrollment
      WHERE school_year = ${latestYear}
        AND demographic_group IS NULL
        AND grade_level != 'Total'
        AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY district_name,
        CASE grade_level
          WHEN 'K' THEN 0
          ELSE grade_level::int
        END
    `;

    // Demographics for latest year per district
    const demographics = await sql`
      SELECT
        district_name,
        demographic_group as group,
        demographic_count as count,
        demographic_pct as pct
      FROM education.enrollment
      WHERE school_year = ${latestYear}
        AND demographic_group IS NOT NULL
        AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY district_name, demographic_count DESC
    `;

    // Graduation rates for all districts
    const graduationRates = await sql`
      SELECT
        district_name,
        school_year as year,
        rate_4yr,
        rate_5yr
      FROM education.graduation_rates
      WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY district_name, school_year ASC
    `;

    // Test scores for all districts
    const testScores = await sql`
      SELECT
        district_name,
        school_year as year,
        subject,
        grade_level as grade,
        proficiency_pct as proficiency
      FROM education.test_scores
      WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY district_name, school_year ASC, subject ASC
    `;

    // School-level enrollment (latest year, sorted by lowest enrollment)
    const schoolEnrollment = await sql`
      SELECT district_name, school_name, school_type, enrollment_current, enrollment_prior
      FROM education.school_enrollment
      WHERE school_year = (SELECT MAX(school_year) FROM education.school_enrollment)
        AND district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
      ORDER BY enrollment_current ASC
    `;

    // PSU Population Research Center published forecast
    const enrollmentForecast = {
      current: { year: "2025-26", enrollment: 42623 },
      projected: { year: "2034-35", enrollment: 37057 },
      source: "PSU Population Research Center",
    };

    // Chronic absenteeism for all districts
    let chronicAbsenteeism: any[] = [];
    try {
      chronicAbsenteeism = await sql`
        SELECT district_name, school_year as year, regular_attenders_pct, chronic_absent_pct, total_students
        FROM education.chronic_absenteeism
        WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
        ORDER BY district_name, school_year
      `;
    } catch (e: any) {
      console.warn("chronic_absenteeism table not available:", e.message);
    }

    // Per-pupil spending for all districts
    let perPupilSpending: any[] = [];
    try {
      perPupilSpending = await sql`
        SELECT district_name, school_year as year, total_per_pupil
        FROM education.per_pupil_spending
        WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
        ORDER BY district_name, school_year
      `;
    } catch (e: any) {
      console.warn("per_pupil_spending table not available:", e.message);
    }

    // Class size for all districts (latest year per district)
    let classSize: any[] = [];
    try {
      classSize = await sql`
        SELECT cs.district_name, cs.subject, cs.avg_class_size
        FROM education.class_size cs
        INNER JOIN (
          SELECT district_name, MAX(school_year) as max_year
          FROM education.class_size
          WHERE district_name IN ('Portland SD 1J', 'Parkrose SD 3', 'David Douglas SD 40', 'Riverdale SD 51J', 'Reynolds SD 7', 'Centennial SD 28J')
          GROUP BY district_name
        ) latest ON cs.district_name = latest.district_name AND cs.school_year = latest.max_year
        ORDER BY cs.district_name, cs.avg_class_size DESC
      `;
    } catch (e: any) {
      console.warn("class_size table not available:", e.message);
    }

    return NextResponse.json({
      districts: DISTRICTS.map((d) => ({
        name: d,
        short: DISTRICT_SHORT[d],
      })),
      enrollmentByYear: enrollmentByYear.map((r: any) => ({
        districtName: r.district_name,
        year: r.year,
        total: Number(r.total),
      })),
      enrollmentByGrade: enrollmentByGrade.map((r: any) => ({
        districtName: r.district_name,
        grade: r.grade === "K" ? "K" : `${r.grade}`,
        count: Number(r.count),
      })),
      demographics: demographics.map((r: any) => ({
        districtName: r.district_name,
        group: r.group,
        count: Number(r.count),
        pct: Number(r.pct),
      })),
      graduationRates: graduationRates.map((r: any) => ({
        districtName: r.district_name,
        year: r.year,
        rate4yr: r.rate_4yr ? Number(r.rate_4yr) : null,
        rate5yr: r.rate_5yr ? Number(r.rate_5yr) : null,
      })),
      testScores: testScores.map((r: any) => ({
        districtName: r.district_name,
        year: r.year,
        subject: r.subject,
        grade: r.grade,
        proficiency: Number(r.proficiency),
      })),
      schoolEnrollment: schoolEnrollment.map((r: any) => ({
        districtName: r.district_name,
        schoolName: r.school_name,
        schoolType: r.school_type,
        enrollmentCurrent: Number(r.enrollment_current),
        enrollmentPrior: Number(r.enrollment_prior),
      })),
      chronicAbsenteeism: chronicAbsenteeism.map((r: any) => ({
        districtName: r.district_name,
        year: r.year,
        regularAttendersPct: r.regular_attenders_pct ? Number(r.regular_attenders_pct) : null,
        chronicAbsentPct: r.chronic_absent_pct ? Number(r.chronic_absent_pct) : null,
        totalStudents: r.total_students ? Number(r.total_students) : null,
      })),
      perPupilSpending: perPupilSpending.map((r: any) => ({
        districtName: r.district_name,
        year: r.year,
        totalPerPupil: r.total_per_pupil ? Number(r.total_per_pupil) : null,
      })),
      classSize: classSize.map((r: any) => ({
        districtName: r.district_name,
        subject: r.subject,
        avgClassSize: r.avg_class_size ? Number(r.avg_class_size) : null,
      })),
      enrollmentForecast,
      latestYear,
      dataStatus: "live",
    });
  } catch (err: any) {
    console.error("Education detail API error:", err.message);
    return NextResponse.json({
      districts: [],
      enrollmentByYear: [],
      enrollmentByGrade: [],
      demographics: [],
      graduationRates: [],
      testScores: [],
      schoolEnrollment: [],
      chronicAbsenteeism: [],
      perPupilSpending: [],
      classSize: [],
      enrollmentForecast: null,
      latestYear: null,
      dataStatus: "error",
    });
  }
}
