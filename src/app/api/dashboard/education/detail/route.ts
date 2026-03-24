import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Enrollment by year (Total rows, no demographic filter)
    const enrollmentByYear = await sql`
      SELECT school_year as year, enrollment as total
      FROM education.enrollment
      WHERE grade_level = 'Total'
        AND demographic_group IS NULL
      ORDER BY school_year ASC
    `;

    // Latest school year
    const latestYearRow = await sql`
      SELECT MAX(school_year) as latest FROM education.enrollment
    `;
    const latestYear = latestYearRow[0]?.latest;

    // Enrollment by grade for latest year
    const enrollmentByGrade = await sql`
      SELECT grade_level as grade, enrollment as count
      FROM education.enrollment
      WHERE school_year = ${latestYear}
        AND demographic_group IS NULL
        AND grade_level != 'Total'
      ORDER BY
        CASE grade_level
          WHEN 'K' THEN 0
          ELSE grade_level::int
        END
    `;

    // Demographics for latest year
    const demographics = await sql`
      SELECT
        demographic_group as group,
        demographic_count as count,
        demographic_pct as pct
      FROM education.enrollment
      WHERE school_year = ${latestYear}
        AND demographic_group IS NOT NULL
      ORDER BY demographic_count DESC
    `;

    // Graduation rates
    const graduationRates = await sql`
      SELECT
        school_year as year,
        rate_4yr,
        rate_5yr
      FROM education.graduation_rates
      WHERE district_name = 'Portland SD 1J'
      ORDER BY school_year ASC
    `;

    // Test scores
    const testScores = await sql`
      SELECT
        school_year as year,
        subject,
        grade_level as grade,
        proficiency_pct as proficiency
      FROM education.test_scores
      WHERE district_name = 'Portland SD 1J'
      ORDER BY school_year ASC, subject ASC
    `;

    // School-level enrollment (latest year, sorted by lowest enrollment)
    const schoolEnrollment = await sql`
      SELECT school_name, school_type, enrollment_current, enrollment_prior
      FROM education.school_enrollment
      WHERE school_year = (SELECT MAX(school_year) FROM education.school_enrollment)
      ORDER BY enrollment_current ASC
    `;

    // PSU Population Research Center published forecast
    const enrollmentForecast = {
      current: { year: "2025-26", enrollment: 42623 },
      projected: { year: "2034-35", enrollment: 37057 },
      source: "PSU Population Research Center",
    };

    // Chronic absenteeism
    let chronicAbsenteeism: any[] = [];
    try {
      chronicAbsenteeism = await sql`
        SELECT school_year as year, regular_attenders_pct, chronic_absent_pct, total_students
        FROM education.chronic_absenteeism
        WHERE district_name = 'Portland SD 1J'
        ORDER BY school_year
      `;
    } catch (e: any) {
      console.warn("chronic_absenteeism table not available:", e.message);
    }

    // Per-pupil spending
    let perPupilSpending: any[] = [];
    try {
      perPupilSpending = await sql`
        SELECT school_year as year, total_per_pupil
        FROM education.per_pupil_spending
        WHERE district_name = 'Portland SD 1J'
        ORDER BY school_year
      `;
    } catch (e: any) {
      console.warn("per_pupil_spending table not available:", e.message);
    }

    // Class size (latest year, by subject)
    let classSize: any[] = [];
    try {
      classSize = await sql`
        SELECT subject, avg_class_size
        FROM education.class_size
        WHERE district_name = 'Portland SD 1J'
          AND school_year = (SELECT MAX(school_year) FROM education.class_size WHERE district_name = 'Portland SD 1J')
        ORDER BY avg_class_size DESC
      `;
    } catch (e: any) {
      console.warn("class_size table not available:", e.message);
    }

    return NextResponse.json({
      enrollmentByYear: enrollmentByYear.map((r: any) => ({
        year: r.year,
        total: Number(r.total),
      })),
      enrollmentByGrade: enrollmentByGrade.map((r: any) => ({
        grade: r.grade === "K" ? "K" : `${r.grade}`,
        count: Number(r.count),
      })),
      demographics: demographics.map((r: any) => ({
        group: r.group,
        count: Number(r.count),
        pct: Number(r.pct),
      })),
      graduationRates: graduationRates.map((r: any) => ({
        year: r.year,
        rate4yr: r.rate_4yr ? Number(r.rate_4yr) : null,
        rate5yr: r.rate_5yr ? Number(r.rate_5yr) : null,
      })),
      testScores: testScores.map((r: any) => ({
        year: r.year,
        subject: r.subject,
        grade: r.grade,
        proficiency: Number(r.proficiency),
      })),
      schoolEnrollment: schoolEnrollment.map((r: any) => ({
        schoolName: r.school_name,
        schoolType: r.school_type,
        enrollmentCurrent: Number(r.enrollment_current),
        enrollmentPrior: Number(r.enrollment_prior),
      })),
      chronicAbsenteeism: chronicAbsenteeism.map((r: any) => ({
        year: r.year,
        regularAttendersPct: r.regular_attenders_pct ? Number(r.regular_attenders_pct) : null,
        chronicAbsentPct: r.chronic_absent_pct ? Number(r.chronic_absent_pct) : null,
        totalStudents: r.total_students ? Number(r.total_students) : null,
      })),
      perPupilSpending: perPupilSpending.map((r: any) => ({
        year: r.year,
        totalPerPupil: r.total_per_pupil ? Number(r.total_per_pupil) : null,
      })),
      classSize: classSize.map((r: any) => ({
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
