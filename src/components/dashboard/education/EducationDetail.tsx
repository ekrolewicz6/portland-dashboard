"use client";

import { useEffect, useState } from "react";
import StatGrid from "@/components/charts/StatGrid";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import TrendChart from "@/components/charts/TrendChart";
import DataNeeded from "@/components/dashboard/DataNeeded";
import NewsContext from "../NewsContext";
import {
  GraduationCap,
  TrendingUp,
  Users,
  BarChart3,
  BookOpen,
  AlertTriangle,
  TrendingDown,
  FileText,
  DollarSign,
  UserX,
} from "lucide-react";

const ACCENT = "#3d7a5a";

interface EnrollmentYear {
  year: string;
  total: number;
}

interface GradeEnrollment {
  grade: string;
  count: number;
}

interface Demographic {
  group: string;
  count: number;
  pct: number;
}

interface GraduationRate {
  year: string;
  rate4yr: number | null;
  rate5yr: number | null;
}

interface TestScore {
  year: string;
  subject: string;
  grade: string;
  proficiency: number;
}

interface SchoolEnrollment {
  schoolName: string;
  schoolType: string | null;
  enrollmentCurrent: number;
  enrollmentPrior: number;
}

interface ChronicAbsenteeism {
  year: string;
  regularAttendersPct: number | null;
  chronicAbsentPct: number | null;
  totalStudents: number | null;
}

interface PerPupilSpending {
  year: string;
  totalPerPupil: number | null;
}

interface ClassSizeEntry {
  subject: string;
  avgClassSize: number | null;
}

interface EnrollmentForecast {
  current: { year: string; enrollment: number };
  projected: { year: string; enrollment: number };
  source: string;
}

interface EducationDetailData {
  enrollmentByYear: EnrollmentYear[];
  enrollmentByGrade: GradeEnrollment[];
  demographics: Demographic[];
  graduationRates: GraduationRate[];
  testScores: TestScore[];
  schoolEnrollment: SchoolEnrollment[];
  chronicAbsenteeism: ChronicAbsenteeism[];
  perPupilSpending: PerPupilSpending[];
  classSize: ClassSizeEntry[];
  enrollmentForecast: EnrollmentForecast | null;
  latestYear: string | null;
  dataStatus: string;
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="w-4 h-4" style={{ color: ACCENT }} />
      <h2 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[var(--color-parchment)]" />
    </div>
  );
}

function enrollmentBarColor(enrollment: number): string {
  if (enrollment < 200) return "#dc2626"; // red
  if (enrollment < 250) return "#ea580c"; // orange
  if (enrollment < 300) return "#d97706"; // amber
  return "#16a34a"; // green
}

function DemographicBar({ group, count, pct, maxPct }: Demographic & { maxPct: number }) {
  const barWidth = maxPct > 0 ? (pct / maxPct) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[180px] sm:w-[220px] text-[13px] text-[var(--color-ink-light)] truncate flex-shrink-0">
        {group}
      </div>
      <div className="flex-1 h-5 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{
            width: `${barWidth}%`,
            backgroundColor: ACCENT,
            opacity: 0.7,
          }}
        />
      </div>
      <div className="w-[90px] text-right text-[13px] font-mono text-[var(--color-ink-light)] flex-shrink-0">
        {count.toLocaleString()} ({pct.toFixed(1)}%)
      </div>
    </div>
  );
}

export default function EducationDetail() {
  const [data, setData] = useState<EducationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/education/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-sm bg-[var(--color-parchment)]"
          />
        ))}
      </div>
    );
  }

  if (error || !data || data.dataStatus === "error") {
    return (
      <div className="text-center py-16 text-[var(--color-ink-muted)]">
        <p className="text-sm">Education data temporarily unavailable.</p>
        <p className="text-xs mt-1">
          Run <code className="font-mono">npx tsx scripts/parse-education.ts</code> to load data.
        </p>
      </div>
    );
  }

  const { enrollmentByYear, enrollmentByGrade, demographics, graduationRates, testScores } = data;

  // Compute stats
  const latestEnrollment = enrollmentByYear.length > 0 ? enrollmentByYear[enrollmentByYear.length - 1] : null;
  const priorEnrollment = enrollmentByYear.length > 1 ? enrollmentByYear[enrollmentByYear.length - 2] : null;
  const yoyChange =
    latestEnrollment && priorEnrollment && priorEnrollment.total > 0
      ? ((latestEnrollment.total - priorEnrollment.total) / priorEnrollment.total) * 100
      : undefined;

  const latestGradRate = graduationRates.length > 0 ? graduationRates[graduationRates.length - 1] : null;
  const earliestGradRate = graduationRates.length > 2 ? graduationRates[0] : null;
  const latestTestEla = testScores.find((t) => t.subject === "ELA");
  const latestTestMath = testScores.find((t) => t.subject === "Math");

  const maxDemoPct = demographics.length > 0 ? Math.max(...demographics.map((d) => d.pct)) : 0;

  // Narrative values
  const peakEnrollment = enrollmentByYear.length > 0
    ? enrollmentByYear.reduce((max, d) => d.total > max.total ? d : max, enrollmentByYear[0])
    : null;
  const enrollmentDecline = peakEnrollment && latestEnrollment
    ? peakEnrollment.total - latestEnrollment.total
    : 0;
  const enrollmentDeclinePct = peakEnrollment && latestEnrollment && peakEnrollment.total > 0
    ? ((enrollmentDecline / peakEnrollment.total) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="education" />

      {/* ━━━ 1. NARRATIVE SUMMARY ━━━ */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--color-ember)] flex-shrink-0 mt-1" />
            <h3 className="font-editorial-normal text-[28px] sm:text-[34px] leading-snug text-white">
              Portland Public Schools is losing students
            </h3>
          </div>
          <div className="space-y-3 text-[14px] text-white/70 leading-relaxed">
            <p>
              PPS enrollment peaked at{" "}
              <strong className="text-white">
                {peakEnrollment ? peakEnrollment.total.toLocaleString() : "48,677"}
              </strong>{" "}
              ({peakEnrollment?.year ?? "2018-19"}) and has fallen to{" "}
              <strong className="text-white">
                {latestEnrollment ? latestEnrollment.total.toLocaleString() : "42,623"}
              </strong>{" "}
              ({latestEnrollment?.year ?? "2025-26"}) — down{" "}
              <strong className="text-white">{enrollmentDeclinePct}%</strong> /{" "}
              <strong className="text-white">{enrollmentDecline.toLocaleString()}</strong> students.
              PSU&apos;s Population Research Center projects enrollment will fall to{" "}
              <strong className="text-white">37,057 by 2034-35</strong> — another 13% decline.
            </p>
            <p>
              Academic outcomes remain concerning: only{" "}
              <strong className="text-white">
                {latestTestEla ? `${latestTestEla.proficiency}%` : "44%"}
              </strong>{" "}
              of 3rd graders read at grade level, and{" "}
              <strong className="text-white">
                {latestTestMath ? `${latestTestMath.proficiency}%` : "30%"}
              </strong>{" "}
              of 8th graders are math proficient.
              {latestGradRate?.rate4yr && earliestGradRate?.rate4yr ? (
                <> The graduation rate is improving:{" "}
                  <strong className="text-white">{earliestGradRate.rate4yr}%</strong> to{" "}
                  <strong className="text-white">{latestGradRate.rate4yr}%</strong> over{" "}
                  {graduationRates.filter((g) => g.rate4yr !== null).length} years.</>
              ) : latestGradRate?.rate4yr ? (
                <> The 4-year graduation rate stands at{" "}
                  <strong className="text-white">{latestGradRate.rate4yr}%</strong>.</>
              ) : null}
            </p>
            <p>
              PPS is considering closing up to <strong className="text-white">10 schools</strong> as
              enrollment declines make small campuses financially unsustainable. Schools under 300
              students did not qualify for seismic retrofit prioritization, compounding closure pressure.
            </p>
          </div>
          <p className="text-[11px] text-white/40 mt-4 font-mono">
            Source: Oregon Department of Education enrollment &amp; assessment data · PPS published figures · PSU Population Research Center projections
          </p>
        </div>
      </section>

      {/* ━━━ 2. KEY STATS ━━━ */}
      <section>
        <SectionHeader icon={GraduationCap} title="Education Overview" />
        <StatGrid
          accentColor={ACCENT}
          stats={[
            {
              label: "Total Enrollment",
              value: latestEnrollment?.total ?? 0,
              change: yoyChange,
              changeLabel: priorEnrollment ? `vs ${priorEnrollment.total.toLocaleString()} prior year` : undefined,
            },
            ...(latestGradRate?.rate4yr
              ? [
                  {
                    label: "4-Year Grad Rate",
                    value: `${latestGradRate.rate4yr}%`,
                    changeLabel: latestGradRate.year,
                  },
                ]
              : []),
            ...(latestTestEla
              ? [
                  {
                    label: "3rd Grade ELA Proficiency",
                    value: `${latestTestEla.proficiency}%`,
                    changeLabel: latestTestEla.year,
                  },
                ]
              : []),
            ...(latestTestMath
              ? [
                  {
                    label: "8th Grade Math Proficiency",
                    value: `${latestTestMath.proficiency}%`,
                    changeLabel: latestTestMath.year,
                  },
                ]
              : []),
          ]}
        />
      </section>

      {/* ━━━ 3. ENROLLMENT TREND ━━━ */}
      {enrollmentByYear.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Enrollment Trend" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <TrendChart
              data={enrollmentByYear.map((d) => ({
                date: d.year,
                value: d.total,
              }))}
              color={ACCENT}
              height={260}
              yAxisDomain="auto"
            />
          </div>
        </section>
      )}

      {/* ━━━ 4. SCHOOL CLOSURE RISK ━━━ */}
      {data.schoolEnrollment && data.schoolEnrollment.length > 0 && (() => {
        const regularSchools = data.schoolEnrollment
          .filter((s) => !s.schoolType || s.schoolType === "Regular School" || s.schoolType === "Alternative School" || s.schoolType === "Charter School")
          .slice(0, 15);
        const maxEnrollment = regularSchools.length > 0
          ? Math.max(...regularSchools.map((s) => s.enrollmentCurrent))
          : 1;

        return (
          <section>
            <SectionHeader icon={AlertTriangle} title="School Closure Risk — Enrollment by School" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <div className="mb-4">
                <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">
                  Lowest-Enrolled PPS Schools, {data.latestYear}
                </h3>
                <p className="text-[12px] text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                  PPS is considering closing up to 10 schools. Schools under 300 students did not qualify for seismic retrofit prioritization.
                </p>
              </div>
              <div className="space-y-1.5">
                {regularSchools.map((s) => (
                  <div key={s.schoolName} className="flex items-center gap-3 py-1">
                    <div className="w-[180px] sm:w-[220px] text-[12px] text-[var(--color-ink-light)] truncate flex-shrink-0">
                      {s.schoolName}
                    </div>
                    <div className="flex-1 h-5 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
                      {/* 300-student reference line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-[var(--color-ink-muted)]"
                        style={{ left: `${(300 / maxEnrollment) * 100}%`, opacity: 0.4 }}
                      />
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${(s.enrollmentCurrent / maxEnrollment) * 100}%`,
                          backgroundColor: enrollmentBarColor(s.enrollmentCurrent),
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <div className="w-[50px] text-right text-[12px] font-mono text-[var(--color-ink-light)] flex-shrink-0">
                      {s.enrollmentCurrent.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-parchment)]">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#dc2626" }} />
                  &lt;200
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#ea580c" }} />
                  200-249
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#d97706" }} />
                  250-299
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#16a34a" }} />
                  300+
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)] ml-auto">
                  <div className="w-px h-3 bg-[var(--color-ink-muted)]" style={{ opacity: 0.4 }} />
                  300 seismic threshold
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ━━━ 5. ENROLLMENT FORECAST ━━━ */}
      {data.enrollmentForecast && (
        <section>
          <SectionHeader icon={TrendingDown} title="Enrollment Forecast" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[28px] font-semibold text-[var(--color-ink)] tabular-nums">
                {data.enrollmentForecast.current.enrollment.toLocaleString()}
              </span>
              <span className="text-[18px] text-[var(--color-ink-muted)]">&rarr;</span>
              <span className="text-[28px] font-semibold text-[var(--color-ink)] tabular-nums">
                {data.enrollmentForecast.projected.enrollment.toLocaleString()}
              </span>
              <span className="text-[14px] text-[var(--color-ink-muted)]">
                by {data.enrollmentForecast.projected.year}
              </span>
              <span
                className="text-[14px] font-medium px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: "#dc26261a", color: "#dc2626" }}
              >
                {(
                  ((data.enrollmentForecast.projected.enrollment - data.enrollmentForecast.current.enrollment) /
                    data.enrollmentForecast.current.enrollment) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-2">
              Source: {data.enrollmentForecast.source}
            </p>
          </div>
        </section>
      )}

      {/* ━━━ 6. GRADE-LEVEL ENROLLMENT ━━━ */}
      {enrollmentByGrade.length > 0 && (
        <section>
          <SectionHeader icon={BarChart3} title={`Enrollment by Grade (${data.latestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <ComparisonBarChart
              data={enrollmentByGrade.map((g) => ({
                grade: g.grade === "K" ? "K" : g.grade,
                students: g.count,
              }))}
              xKey="grade"
              bars={[
                { key: "students", label: "Students", color: ACCENT },
              ]}
              height={300}
              showLegend={false}
            />
          </div>
        </section>
      )}

      {/* ━━━ 7. TEST SCORES ━━━ */}
      {testScores.length > 0 ? (
        <section>
          <SectionHeader icon={BookOpen} title="Standardized Test Proficiency" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <ComparisonBarChart
              data={testScores.map((t) => ({
                label: `Grade ${t.grade} ${t.subject}`,
                proficiency: t.proficiency,
              }))}
              xKey="label"
              bars={[
                { key: "proficiency", label: "% Proficient", color: ACCENT },
              ]}
              height={220}
              valueSuffix="%"
              showLegend={false}
            />
          </div>
        </section>
      ) : (
        <DataNeeded
          title="Test Scores"
          description="Standardized assessment results for Portland students. Oregon publishes Smarter Balanced results annually."
          actions={[
            {
              label: "Download ODE assessment data",
              type: "download",
              href: "https://www.oregon.gov/ode/educator-resources/assessment/Pages/Assessment-Group-Reports.aspx",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 8. GRADUATION RATES ━━━ */}
      {graduationRates.length > 0 ? (
        <section>
          <SectionHeader icon={GraduationCap} title="4-Year Graduation Rate" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <TrendChart
              data={graduationRates
                .filter((g) => g.rate4yr !== null)
                .map((g) => ({
                  date: g.year,
                  value: g.rate4yr!,
                }))}
              color={ACCENT}
              height={220}
              valueSuffix="%"
              yAxisDomain="auto"
            />
          </div>
        </section>
      ) : (
        <DataNeeded
          title="Graduation Rates"
          description="Four-year and five-year graduation rates by district. Available from Oregon Department of Education annual reports."
          actions={[
            {
              label: "Download ODE graduation rate data",
              type: "download",
              href: "https://www.oregon.gov/ode/reports-and-data/students/Pages/Cohort-Graduation-Rate.aspx",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 9. CHRONIC ABSENTEEISM ━━━ */}
      {data.chronicAbsenteeism && data.chronicAbsenteeism.length > 0 ? (() => {
        const latest = data.chronicAbsenteeism[data.chronicAbsenteeism.length - 1];
        const absentPct = latest.chronicAbsentPct;
        return (
          <section>
            <SectionHeader icon={UserX} title="Chronic Absenteeism — Are Students Showing Up?" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              {absentPct !== null && (
                <div className="mb-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[28px] font-semibold text-[var(--color-ink)] tabular-nums">
                      {absentPct.toFixed(1)}%
                    </span>
                    <span className="text-[14px] text-[var(--color-ink-muted)]">
                      chronically absent ({latest.year})
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--color-ink-muted)] mt-1">
                    1 in {Math.round(100 / absentPct) > 0 ? Math.round(100 / absentPct) : 3} PPS students misses 10%+ of school days
                  </p>
                </div>
              )}
              {data.chronicAbsenteeism.length > 1 && (
                <TrendChart
                  data={data.chronicAbsenteeism
                    .filter((d) => d.chronicAbsentPct !== null)
                    .map((d) => ({
                      date: d.year,
                      value: d.chronicAbsentPct!,
                    }))}
                  color={ACCENT}
                  height={220}
                  valueSuffix="%"
                  yAxisDomain="auto"
                />
              )}
              <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
                Chronic absenteeism spiked during COVID and hasn&apos;t fully recovered. A student is chronically absent if they miss 10% or more of enrolled days.
              </p>
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Chronic Absenteeism Rate"
          description="Percentage of students missing 10% or more of school days. ODE publishes chronic absenteeism data by district annually in its At-A-Glance profiles."
          actions={[
            {
              label: "View ODE chronic absenteeism data",
              type: "download",
              href: "https://www.oregon.gov/ode/reports-and-data/students/Pages/Chronic-Absenteeism.aspx",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 10. PER-PUPIL SPENDING ━━━ */}
      {data.perPupilSpending && data.perPupilSpending.length > 0 ? (() => {
        const latest = data.perPupilSpending[data.perPupilSpending.length - 1];
        return (
          <section>
            <SectionHeader icon={DollarSign} title="How Much Does Portland Spend Per Student?" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              {latest.totalPerPupil !== null && (
                <div className="mb-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[28px] font-semibold text-[var(--color-ink)] tabular-nums">
                      ${latest.totalPerPupil.toLocaleString()}
                    </span>
                    <span className="text-[14px] text-[var(--color-ink-muted)]">
                      per student ({latest.year})
                    </span>
                  </div>
                </div>
              )}
              {data.perPupilSpending.length > 1 && (
                <TrendChart
                  data={data.perPupilSpending
                    .filter((d) => d.totalPerPupil !== null)
                    .map((d) => ({
                      date: d.year,
                      value: d.totalPerPupil!,
                    }))}
                  color={ACCENT}
                  height={220}
                  valuePrefix="$"
                  yAxisDomain="auto"
                />
              )}
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Per-Pupil Spending"
          description="How much PPS spends per student compared to state and national averages. Available in PPS adopted budget documents and ODE financial reports."
          actions={[
            {
              label: "Download PPS budget documents",
              type: "download",
              href: "https://www.pps.net/Page/2021",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 11. CLASS SIZE ━━━ */}
      {data.classSize && data.classSize.length > 0 ? (() => {
        const maxSize = Math.max(...data.classSize.map((c) => c.avgClassSize ?? 0));
        return (
          <section>
            <SectionHeader icon={Users} title="Average Class Size by Subject" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <div className="space-y-1.5">
                {data.classSize.map((c) => (
                  <div key={c.subject} className="flex items-center gap-3 py-1.5">
                    <div className="w-[180px] sm:w-[220px] text-[13px] text-[var(--color-ink-light)] truncate flex-shrink-0">
                      {c.subject}
                    </div>
                    <div className="flex-1 h-5 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${maxSize > 0 ? ((c.avgClassSize ?? 0) / maxSize) * 100 : 0}%`,
                          backgroundColor: ACCENT,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div className="w-[60px] text-right text-[13px] font-mono text-[var(--color-ink-light)] flex-shrink-0">
                      {c.avgClassSize !== null ? c.avgClassSize.toFixed(1) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Average Class Size"
          description="Average number of students per classroom by grade level. ODE Report Card data includes class size metrics by school and district."
          actions={[
            {
              label: "View ODE Report Card",
              type: "download",
              href: "https://www.ode.state.or.us/data/reportcard/reports.aspx",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 12. DEMOGRAPHICS ━━━ */}
      {demographics.length > 0 && (
        <section>
          <SectionHeader icon={Users} title={`Student Demographics (${data.latestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <div className="space-y-0.5">
              {demographics.map((d) => (
                <DemographicBar key={d.group} {...d} maxPct={maxDemoPct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 13. DATA STILL NEEDED ━━━ */}
      <section className="space-y-4">
        <DataNeeded
          title="Teacher Staffing Ratios"
          description="Student-to-teacher ratios and staffing levels affect classroom quality. PPS budget documents and ODE staffing reports provide this data."
          actions={[
            {
              label: "Download PPS budget documents",
              type: "download",
              href: "https://www.pps.net/Page/2021",
            },
          ]}
          color={ACCENT}
        />
        <DataNeeded
          title="Teacher Retention & Vacancy Rate"
          description="Teacher turnover and unfilled positions impact instruction quality. ODE publishes educator staffing reports, and PPS HR reports contain vacancy data."
          actions={[
            {
              label: "View ODE educator data",
              type: "download",
              href: "https://www.oregon.gov/ode/educator-resources/Pages/default.aspx",
            },
          ]}
          color={ACCENT}
        />
        <DataNeeded
          title="Market Share — PPS vs Charter / Private / Homeschool"
          description="What percentage of Portland school-age children attend PPS versus charter schools, private schools, or are homeschooled. Census data and ODE enrollment reports can help estimate this."
          actions={[
            {
              label: "View ODE enrollment reports",
              type: "download",
              href: "https://www.oregon.gov/ode/reports-and-data/students/Pages/Student-Enrollment-Reports.aspx",
            },
          ]}
          color={ACCENT}
        />
      </section>

      {/* ━━━ 14. METHODOLOGY ━━━ */}
      <section>
        <SectionHeader icon={FileText} title="Methodology" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <div className="space-y-3 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
            <p>
              <strong className="text-[var(--color-ink-light)]">Enrollment data</strong> comes from the
              Oregon Department of Education (ODE) annual enrollment reports, which PPS submits each
              October. Figures reflect October 1 headcount for each school year. Historical data covers
              2016-17 through 2025-26.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Test scores</strong> are Smarter Balanced
              Assessment results published by ODE. Proficiency rates shown are the percentage of students
              meeting or exceeding grade-level standards. These are published values, not estimates.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Graduation rates</strong> use ODE&apos;s
              4-year adjusted cohort graduation rate, the federal standard. This tracks a cohort of
              first-time 9th graders and measures the percentage who graduate within four years, adjusting
              for transfers in and out.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Enrollment forecast</strong> is from
              Portland State University&apos;s Population Research Center, commissioned by PPS for
              long-range planning. Projections are based on demographic models including birth rates,
              migration, and housing development.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">School-level enrollment</strong> for the
              closure risk chart uses ODE&apos;s individual school enrollment data. The 300-student
              threshold reflects PPS&apos;s seismic retrofit prioritization criteria.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
