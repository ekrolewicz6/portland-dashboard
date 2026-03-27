"use client";

import { useEffect, useState, useMemo } from "react";
import StatGrid from "@/components/charts/StatGrid";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
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
  School,
  MapPin,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────

const ACCENT = "#3d7a5a";

const DISTRICT_COLORS: Record<string, string> = {
  "Portland SD 1J": "#3d7a5a",
  "Parkrose SD 3": "#7c4dba",
  "David Douglas SD 40": "#c05621",
  "Riverdale SD 51J": "#2d7d9a",
  "Reynolds SD 7": "#b85c8a",
  "Centennial SD 28J": "#5a7d3d",
};

const DISTRICT_SHORT: Record<string, string> = {
  "Portland SD 1J": "PPS",
  "Parkrose SD 3": "Parkrose",
  "David Douglas SD 40": "David Douglas",
  "Riverdale SD 51J": "Riverdale",
  "Reynolds SD 7": "Reynolds",
  "Centennial SD 28J": "Centennial",
};

// ── Types ────────────────────────────────────────────────────────────────

interface District {
  name: string;
  short: string;
}

interface EnrollmentYear {
  districtName: string;
  year: string;
  total: number;
}

interface GradeEnrollment {
  districtName: string;
  grade: string;
  count: number;
}

interface Demographic {
  districtName: string;
  group: string;
  count: number;
  pct: number;
}

interface GraduationRate {
  districtName: string;
  year: string;
  rate4yr: number | null;
  rate5yr: number | null;
}

interface TestScore {
  districtName: string;
  year: string;
  subject: string;
  grade: string;
  proficiency: number;
}

interface SchoolEnrollment {
  districtName: string;
  schoolName: string;
  schoolType: string | null;
  enrollmentCurrent: number;
  enrollmentPrior: number;
}

interface ChronicAbsenteeism {
  districtName: string;
  year: string;
  regularAttendersPct: number | null;
  chronicAbsentPct: number | null;
  totalStudents: number | null;
}

interface PerPupilSpending {
  districtName: string;
  year: string;
  totalPerPupil: number | null;
}

interface ClassSizeEntry {
  districtName: string;
  subject: string;
  avgClassSize: number | null;
}

interface EnrollmentForecast {
  current: { year: string; enrollment: number };
  projected: { year: string; enrollment: number };
  source: string;
}

interface EducationDetailData {
  districts: District[];
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

// ── Subcomponents ────────────────────────────────────────────────────────

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
  if (enrollment < 200) return "#dc2626";
  if (enrollment < 250) return "#ea580c";
  if (enrollment < 300) return "#d97706";
  return "#16a34a";
}

function DemographicBar({
  group,
  count,
  pct,
  maxPct,
  color,
}: {
  group: string;
  count: number;
  pct: number;
  maxPct: number;
  color?: string;
}) {
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
            backgroundColor: color ?? ACCENT,
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

function DistrictToggle({
  districts,
  activeDistricts,
  onToggle,
}: {
  districts: District[];
  activeDistricts: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {districts.map((d) => {
        const active = activeDistricts.has(d.name);
        const color = DISTRICT_COLORS[d.name] ?? ACCENT;
        return (
          <button
            key={d.name}
            onClick={() => onToggle(d.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium transition-all duration-200 border cursor-pointer"
            style={{
              backgroundColor: active ? `${color}14` : "transparent",
              borderColor: active ? color : "var(--color-parchment)",
              color: active ? color : "var(--color-ink-muted)",
              opacity: active ? 1 : 0.55,
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 transition-opacity duration-200"
              style={{
                backgroundColor: color,
                opacity: active ? 1 : 0.3,
              }}
            />
            {d.short}
          </button>
        );
      })}
    </div>
  );
}

// ── Helper: group data by district ───────────────────────────────────────

function groupByDistrict<T extends { districtName: string }>(
  items: T[],
  activeDistricts: Set<string>,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    if (!activeDistricts.has(item.districtName)) continue;
    const arr = map.get(item.districtName) || [];
    arr.push(item);
    map.set(item.districtName, arr);
  }
  return map;
}

function shortName(dist: string): string {
  return DISTRICT_SHORT[dist] ?? dist;
}

// ── Main Component ───────────────────────────────────────────────────────

export default function EducationDetail() {
  const [data, setData] = useState<EducationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDistricts, setActiveDistricts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard/education/detail")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        // Initialize all districts as active
        if (d.districts) {
          setActiveDistricts(new Set(d.districts.map((dd: District) => dd.name)));
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const toggleDistrict = (name: string) => {
    setActiveDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size > 1) next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // ── Derived data ──────────────────────────────────────────────────────

  const derived = useMemo(() => {
    if (!data) return null;

    const { enrollmentByYear, graduationRates, demographics, chronicAbsenteeism, perPupilSpending } = data;
    const allDistricts = data.districts?.map((d) => d.name) ?? [];

    // Latest enrollment per district
    const latestByDistrict = new Map<string, EnrollmentYear>();
    const priorByDistrict = new Map<string, EnrollmentYear>();
    for (const d of allDistricts) {
      const distRows = enrollmentByYear.filter((e) => e.districtName === d);
      if (distRows.length > 0) latestByDistrict.set(d, distRows[distRows.length - 1]);
      if (distRows.length > 1) priorByDistrict.set(d, distRows[distRows.length - 2]);
    }

    // Total enrollment across all districts
    const latestYear = data.latestYear;
    const totalEnrollment = Array.from(latestByDistrict.values())
      .filter((e) => e.year === latestYear)
      .reduce((sum, e) => sum + e.total, 0);
    const totalPriorEnrollment = Array.from(priorByDistrict.values())
      .reduce((sum, e) => sum + e.total, 0);

    // Largest and smallest district
    const sorted = Array.from(latestByDistrict.entries())
      .filter(([, e]) => e.year === latestYear)
      .sort(([, a], [, b]) => b.total - a.total);
    const largest = sorted[0];
    const smallest = sorted[sorted.length - 1];

    // Enrollment trend data for MultiLineChart — pivot years as rows, districts as columns
    const years = Array.from(new Set(enrollmentByYear.map((e) => e.year))).sort();
    const enrollmentChartData = years.map((year) => {
      const row: Record<string, string | number> = { year };
      for (const d of allDistricts) {
        const match = enrollmentByYear.find((e) => e.districtName === d && e.year === year);
        if (match) row[shortName(d)] = match.total;
      }
      return row;
    });

    // Graduation rates: latest per district
    const latestGradByDistrict = new Map<string, GraduationRate>();
    for (const d of allDistricts) {
      const distRows = graduationRates.filter((g) => g.districtName === d && g.rate4yr !== null);
      if (distRows.length > 0) latestGradByDistrict.set(d, distRows[distRows.length - 1]);
    }

    // Graduation rate chart data — years as rows, districts as columns
    const gradYears = Array.from(new Set(graduationRates.filter((g) => g.rate4yr !== null).map((g) => g.year))).sort();
    const gradChartData = gradYears.map((year) => {
      const row: Record<string, string | number> = { year };
      for (const d of allDistricts) {
        const match = graduationRates.find((g) => g.districtName === d && g.year === year && g.rate4yr !== null);
        if (match) row[shortName(d)] = match.rate4yr!;
      }
      return row;
    });

    // PPS enrollment peak and decline
    const ppsEnrollment = enrollmentByYear.filter((e) => e.districtName === "Portland SD 1J");
    const ppsPeak = ppsEnrollment.length > 0
      ? ppsEnrollment.reduce((max, d) => d.total > max.total ? d : max, ppsEnrollment[0])
      : null;
    const ppsLatest = ppsEnrollment.length > 0 ? ppsEnrollment[ppsEnrollment.length - 1] : null;
    const ppsDecline = ppsPeak && ppsLatest ? ppsPeak.total - ppsLatest.total : 0;
    const ppsDeclinePct = ppsPeak && ppsLatest && ppsPeak.total > 0
      ? ((ppsDecline / ppsPeak.total) * 100).toFixed(1)
      : "0";

    // PPS demographics (largest district)
    const ppsDemographics = demographics.filter((d) => d.districtName === "Portland SD 1J");
    const ppsMaxDemoPct = ppsDemographics.length > 0 ? Math.max(...ppsDemographics.map((d) => d.pct)) : 0;

    // PPS test scores
    const ppsTestScores = data.testScores.filter((t) => t.districtName === "Portland SD 1J");
    const latestTestEla = ppsTestScores.find((t) => t.subject === "ELA");
    const latestTestMath = ppsTestScores.find((t) => t.subject === "Math");

    // PPS graduation rate
    const ppsLatestGrad = latestGradByDistrict.get("Portland SD 1J");

    // Chronic absenteeism chart — latest year comparison bar chart
    const absYears = Array.from(new Set(chronicAbsenteeism.map((a) => a.year))).sort();
    const absLatestYear = absYears[absYears.length - 1];
    const absLatest = chronicAbsenteeism.filter((a) => a.year === absLatestYear);

    // Per-pupil spending — latest year comparison
    const spendYears = Array.from(new Set(perPupilSpending.map((s) => s.year))).sort();
    const spendLatestYear = spendYears[spendYears.length - 1];
    const spendLatest = perPupilSpending.filter((s) => s.year === spendLatestYear);

    // District comparison table data
    const comparisonRows = allDistricts.map((d) => {
      const enrollment = latestByDistrict.get(d);
      const grad = latestGradByDistrict.get(d);
      const spend = spendLatest.find((s) => s.districtName === d);
      const absent = absLatest.find((a) => a.districtName === d);
      return {
        district: d,
        shortName: shortName(d),
        color: DISTRICT_COLORS[d] ?? ACCENT,
        enrollment: enrollment?.total ?? null,
        gradRate: grad?.rate4yr ?? null,
        spending: spend?.totalPerPupil ?? null,
        absenteeism: absent?.chronicAbsentPct ?? null,
      };
    }).sort((a, b) => (b.enrollment ?? 0) - (a.enrollment ?? 0));

    return {
      allDistricts,
      latestByDistrict,
      totalEnrollment,
      totalPriorEnrollment,
      largest,
      smallest,
      enrollmentChartData,
      gradChartData,
      latestGradByDistrict,
      ppsPeak,
      ppsLatest,
      ppsDecline,
      ppsDeclinePct,
      ppsDemographics,
      ppsMaxDemoPct,
      ppsTestScores,
      latestTestEla,
      latestTestMath,
      ppsLatestGrad,
      absLatestYear,
      absLatest,
      spendLatestYear,
      spendLatest,
      comparisonRows,
      years,
      gradYears,
    };
  }, [data]);

  // ── Loading / Error states ────────────────────────────────────────────

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

  if (error || !data || data.dataStatus === "error" || !derived) {
    return (
      <div className="text-center py-16 text-[var(--color-ink-muted)]">
        <p className="text-sm">Education data temporarily unavailable.</p>
        <p className="text-xs mt-1">
          Run <code className="font-mono">npx tsx scripts/parse-education.ts</code> to load data.
        </p>
      </div>
    );
  }

  const {
    allDistricts,
    totalEnrollment,
    totalPriorEnrollment,
    largest,
    smallest,
    enrollmentChartData,
    gradChartData,
    ppsPeak,
    ppsLatest,
    ppsDecline,
    ppsDeclinePct,
    ppsDemographics,
    ppsMaxDemoPct,
    latestTestEla,
    latestTestMath,
    ppsLatestGrad,
    absLatestYear,
    absLatest,
    spendLatestYear,
    spendLatest,
    comparisonRows,
  } = derived;

  const yoyChange =
    totalEnrollment && totalPriorEnrollment && totalPriorEnrollment > 0
      ? ((totalEnrollment - totalPriorEnrollment) / totalPriorEnrollment) * 100
      : undefined;

  // Active district lines for charts
  const activeDistrictLines = allDistricts
    .filter((d) => activeDistricts.has(d))
    .map((d) => ({
      key: shortName(d),
      label: shortName(d),
      color: DISTRICT_COLORS[d] ?? ACCENT,
    }));

  // PPS school enrollment data
  const ppsSchools = data.schoolEnrollment
    .filter((s) => s.districtName === "Portland SD 1J")
    .filter(
      (s) =>
        !s.schoolType ||
        s.schoolType === "Regular School" ||
        s.schoolType === "Alternative School" ||
        s.schoolType === "Charter School",
    )
    .slice(0, 15);
  const maxSchoolEnrollment = ppsSchools.length > 0
    ? Math.max(...ppsSchools.map((s) => s.enrollmentCurrent))
    : 1;

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="education" />

      {/* ━━━ 1. NARRATIVE SUMMARY ━━━ */}
      <section>
        <div className="bg-[var(--color-canopy)] rounded-sm p-6 text-white/90">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-6 h-6 text-[var(--color-ember)] flex-shrink-0 mt-1" />
            <h3 className="font-editorial-normal text-[28px] sm:text-[34px] leading-snug text-white">
              Six school districts serve Portland students
            </h3>
          </div>
          <div className="space-y-3 text-[14px] text-white/70 leading-relaxed">
            <p>
              Portland is not one school district. <strong className="text-white">Six districts</strong> serve
              students within city limits: PPS (the largest), David Douglas, Reynolds, Centennial,
              Parkrose, and Riverdale. Together they enroll{" "}
              <strong className="text-white">{totalEnrollment.toLocaleString()}</strong> students
              ({data.latestYear}), with vastly different demographics and outcomes.
            </p>
            {ppsPeak && ppsLatest && (
              <p>
                PPS, serving most of the city, peaked at{" "}
                <strong className="text-white">{ppsPeak.total.toLocaleString()}</strong> ({ppsPeak.year})
                and has fallen to{" "}
                <strong className="text-white">{ppsLatest.total.toLocaleString()}</strong> ({ppsLatest.year})
                — down <strong className="text-white">{ppsDeclinePct}%</strong> /{" "}
                <strong className="text-white">{ppsDecline.toLocaleString()}</strong> students.
                Meanwhile, east Portland districts like David Douglas and Centennial have seen
                different enrollment patterns driven by immigration and housing shifts.
              </p>
            )}
            <p>
              {latestTestEla && (
                <>
                  Academic outcomes vary widely: only{" "}
                  <strong className="text-white">{latestTestEla.proficiency}%</strong> of PPS 3rd graders
                  read at grade level.{" "}
                </>
              )}
              {ppsLatestGrad?.rate4yr && (
                <>
                  The PPS 4-year graduation rate stands at{" "}
                  <strong className="text-white">{ppsLatestGrad.rate4yr}%</strong>.{" "}
                </>
              )}
              Riverdale, a small affluent district, and east Portland districts serving
              predominantly immigrant communities face entirely different challenges.
            </p>
          </div>
          <p className="text-[11px] text-white/40 mt-4 font-mono">
            Source: Oregon Department of Education enrollment, assessment &amp; graduation data
          </p>
        </div>
      </section>

      {/* ━━━ DISTRICT FILTER ━━━ */}
      <section>
        <SectionHeader icon={School} title="Filter Districts" />
        <DistrictToggle
          districts={data.districts}
          activeDistricts={activeDistricts}
          onToggle={toggleDistrict}
        />
      </section>

      {/* ━━━ 2. KEY STATS ━━━ */}
      <section>
        <SectionHeader icon={GraduationCap} title="Education Overview" />
        <StatGrid
          accentColor={ACCENT}
          stats={[
            {
              label: "Total Enrollment (6 Districts)",
              value: totalEnrollment,
              change: yoyChange,
              changeLabel: "vs prior year",
            },
            ...(largest
              ? [
                  {
                    label: "Largest District",
                    value: largest[1].total.toLocaleString(),
                    changeLabel: shortName(largest[0]),
                  },
                ]
              : []),
            ...(smallest
              ? [
                  {
                    label: "Smallest District",
                    value: smallest[1].total.toLocaleString(),
                    changeLabel: shortName(smallest[0]),
                  },
                ]
              : []),
            ...(ppsLatestGrad?.rate4yr
              ? [
                  {
                    label: "PPS 4-Year Grad Rate",
                    value: `${ppsLatestGrad.rate4yr}%`,
                    changeLabel: ppsLatestGrad.year,
                  },
                ]
              : []),
          ]}
        />
      </section>

      {/* ━━━ 3. ENROLLMENT TREND (multi-district) ━━━ */}
      {enrollmentChartData.length > 0 && activeDistrictLines.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Enrollment Trend by District" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <MultiLineChart
              data={enrollmentChartData}
              lines={activeDistrictLines}
              xKey="year"
              height={320}
            />
          </div>
        </section>
      )}

      {/* ━━━ 4. DISTRICT COMPARISON TABLE ━━━ */}
      {comparisonRows.length > 0 && (
        <section>
          <SectionHeader icon={BarChart3} title={`District Comparison (${data.latestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      District
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Enrollment
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Grad Rate
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      $/Student
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Absent %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows
                    .filter((r) => activeDistricts.has(r.district))
                    .map((r) => (
                      <tr
                        key={r.district}
                        className="border-b border-[var(--color-parchment)]/60 last:border-b-0 hover:bg-[var(--color-parchment)]/20 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: r.color }}
                            />
                            <span className="font-medium text-[var(--color-ink)]">
                              {r.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.enrollment !== null ? r.enrollment.toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.gradRate !== null ? `${r.gradRate}%` : "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.spending !== null ? `$${r.spending.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.absenteeism !== null ? `${r.absenteeism.toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 5. GRADUATION RATES (multi-district) ━━━ */}
      {gradChartData.length > 0 && activeDistrictLines.length > 0 ? (
        <section>
          <SectionHeader icon={GraduationCap} title="4-Year Graduation Rate by District" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <MultiLineChart
              data={gradChartData}
              lines={activeDistrictLines}
              xKey="year"
              height={280}
              valueSuffix="%"
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

      {/* ━━━ 6. CHRONIC ABSENTEEISM COMPARISON ━━━ */}
      {absLatest && absLatest.length > 0 ? (() => {
        const barData = absLatest
          .filter((a) => a.chronicAbsentPct !== null && activeDistricts.has(a.districtName))
          .map((a) => ({
            district: shortName(a.districtName),
            absent: a.chronicAbsentPct!,
          }))
          .sort((a, b) => b.absent - a.absent);

        if (barData.length === 0) return null;

        return (
          <section>
            <SectionHeader icon={UserX} title={`Chronic Absenteeism by District (${absLatestYear})`} />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <ComparisonBarChart
                data={barData}
                xKey="district"
                bars={[{ key: "absent", label: "% Chronically Absent", color: "#b85c3a" }]}
                height={260}
                valueSuffix="%"
                showLegend={false}
              />
              <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
                A student is chronically absent if they miss 10% or more of enrolled school days.
              </p>
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Chronic Absenteeism Rate"
          description="Percentage of students missing 10%+ of school days by district."
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

      {/* ━━━ 7. PER-PUPIL SPENDING COMPARISON ━━━ */}
      {spendLatest && spendLatest.length > 0 ? (() => {
        const barData = spendLatest
          .filter((s) => s.totalPerPupil !== null && activeDistricts.has(s.districtName))
          .map((s) => ({
            district: shortName(s.districtName),
            spending: s.totalPerPupil!,
          }))
          .sort((a, b) => b.spending - a.spending);

        if (barData.length === 0) return null;

        return (
          <section>
            <SectionHeader icon={DollarSign} title={`Per-Pupil Spending by District (${spendLatestYear})`} />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <ComparisonBarChart
                data={barData}
                xKey="district"
                bars={[{ key: "spending", label: "Per-Pupil Spending", color: ACCENT }]}
                height={260}
                valuePrefix="$"
                showLegend={false}
              />
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Per-Pupil Spending"
          description="How much each Portland-area district spends per student."
          actions={[
            {
              label: "Download ODE spending data",
              type: "download",
              href: "https://www.oregon.gov/ode/schools-and-districts/FiscalTransparency/Pages/default.aspx",
            },
          ]}
          color={ACCENT}
        />
      )}

      {/* ━━━ 8. GRADE-LEVEL ENROLLMENT (PPS) ━━━ */}
      {(() => {
        const ppsGrades = data.enrollmentByGrade.filter(
          (g) => g.districtName === "Portland SD 1J",
        );
        if (ppsGrades.length === 0 || !activeDistricts.has("Portland SD 1J")) return null;
        return (
          <section>
            <SectionHeader icon={BarChart3} title={`PPS Enrollment by Grade (${data.latestYear})`} />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <ComparisonBarChart
                data={ppsGrades.map((g) => ({
                  grade: g.grade === "K" ? "K" : g.grade,
                  students: g.count,
                }))}
                xKey="grade"
                bars={[{ key: "students", label: "Students", color: ACCENT }]}
                height={300}
                showLegend={false}
              />
            </div>
          </section>
        );
      })()}

      {/* ━━━ 9. TEST SCORES (PPS) ━━━ */}
      {data.testScores.length > 0 ? (() => {
        const ppsScores = data.testScores.filter((t) => t.districtName === "Portland SD 1J");
        if (ppsScores.length === 0) return null;
        return (
          <section>
            <SectionHeader icon={BookOpen} title="PPS Standardized Test Proficiency" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <ComparisonBarChart
                data={ppsScores.map((t) => ({
                  label: `Grade ${t.grade} ${t.subject}`,
                  proficiency: t.proficiency,
                }))}
                xKey="label"
                bars={[{ key: "proficiency", label: "% Proficient", color: ACCENT }]}
                height={220}
                valueSuffix="%"
                showLegend={false}
              />
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Test Scores"
          description="Standardized assessment results for Portland students."
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

      {/* ━━━ 10. SCHOOL CLOSURE RISK (PPS) ━━━ */}
      {ppsSchools.length > 0 && activeDistricts.has("Portland SD 1J") && (
        <section>
          <SectionHeader icon={AlertTriangle} title="PPS School Closure Risk — Enrollment by School" />
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
              {ppsSchools.map((s) => (
                <div key={s.schoolName} className="flex items-center gap-3 py-1">
                  <div className="w-[180px] sm:w-[220px] text-[12px] text-[var(--color-ink-light)] truncate flex-shrink-0">
                    {s.schoolName}
                  </div>
                  <div className="flex-1 h-5 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 w-px bg-[var(--color-ink-muted)]"
                      style={{ left: `${(300 / maxSchoolEnrollment) * 100}%`, opacity: 0.4 }}
                    />
                    <div
                      className="h-full rounded-sm transition-all duration-700"
                      style={{
                        width: `${(s.enrollmentCurrent / maxSchoolEnrollment) * 100}%`,
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
      )}

      {/* ━━━ 11. ENROLLMENT FORECAST (PPS) ━━━ */}
      {data.enrollmentForecast && activeDistricts.has("Portland SD 1J") && (
        <section>
          <SectionHeader icon={TrendingDown} title="PPS Enrollment Forecast" />
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

      {/* ━━━ 12. CLASS SIZE ━━━ */}
      {data.classSize && data.classSize.length > 0 ? (() => {
        const activeClassSize = data.classSize.filter(
          (c) => activeDistricts.has(c.districtName) && c.avgClassSize !== null,
        );
        if (activeClassSize.length === 0) return null;

        // Group by subject, show each district's class size
        const subjects = Array.from(new Set(activeClassSize.map((c) => c.subject)));
        const classSizeBarData = subjects.map((subject) => {
          const row: Record<string, string | number> = { subject };
          for (const d of allDistricts) {
            if (!activeDistricts.has(d)) continue;
            const match = activeClassSize.find((c) => c.districtName === d && c.subject === subject);
            if (match && match.avgClassSize !== null) row[shortName(d)] = match.avgClassSize;
          }
          return row;
        });

        const classSizeBars = allDistricts
          .filter((d) => activeDistricts.has(d))
          .filter((d) => activeClassSize.some((c) => c.districtName === d))
          .map((d) => ({
            key: shortName(d),
            label: shortName(d),
            color: DISTRICT_COLORS[d] ?? ACCENT,
          }));

        return (
          <section>
            <SectionHeader icon={Users} title="Average Class Size by Subject" />
            <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
              <ComparisonBarChart
                data={classSizeBarData}
                xKey="subject"
                bars={classSizeBars}
                height={300}
              />
            </div>
          </section>
        );
      })() : (
        <DataNeeded
          title="Average Class Size"
          description="Average number of students per classroom by grade level."
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

      {/* ━━━ 13. PPS DEMOGRAPHICS ━━━ */}
      {ppsDemographics.length > 0 && activeDistricts.has("Portland SD 1J") && (
        <section>
          <SectionHeader icon={Users} title={`PPS Student Demographics (${data.latestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <p className="text-[12px] text-[var(--color-ink-muted)] mb-4 leading-relaxed">
              Portland Public Schools is the largest of the 6 districts. East Portland districts
              (David Douglas, Centennial, Parkrose) serve significantly more diverse student bodies
              with higher proportions of English language learners.
            </p>
            <div className="space-y-0.5">
              {ppsDemographics.map((d) => (
                <DemographicBar
                  key={d.group}
                  group={d.group}
                  count={d.count}
                  pct={d.pct}
                  maxPct={ppsMaxDemoPct}
                  color={ACCENT}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 14. DATA STILL NEEDED ━━━ */}
      <section className="space-y-4">
        <DataNeeded
          title="Teacher Staffing Ratios"
          description="Student-to-teacher ratios across Portland-area districts."
          actions={[
            {
              label: "Download ODE staffing reports",
              type: "download",
              href: "https://www.oregon.gov/ode/educator-resources/Pages/default.aspx",
            },
          ]}
          color={ACCENT}
        />
        <DataNeeded
          title="Teacher Retention & Vacancy Rate"
          description="Teacher turnover and unfilled positions by district."
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
          title="Market Share — Public vs Charter / Private / Homeschool"
          description="What percentage of Portland school-age children attend public districts versus alternatives."
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

      {/* ━━━ 15. METHODOLOGY ━━━ */}
      <section>
        <SectionHeader icon={FileText} title="Methodology" />
        <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
          <div className="space-y-3 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
            <p>
              <strong className="text-[var(--color-ink-light)]">Coverage</strong>: This dashboard
              tracks all six school districts that serve students within Portland city limits: Portland
              SD 1J (PPS), Parkrose SD 3, David Douglas SD 40, Riverdale SD 51J, Reynolds SD 7, and
              Centennial SD 28J. Some districts (Reynolds, Centennial) extend beyond Portland into
              other jurisdictions.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Enrollment data</strong> comes from
              the Oregon Department of Education (ODE) annual enrollment reports. Figures reflect
              October 1 headcount for each school year. Historical data covers 2016-17 through 2025-26.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Graduation rates</strong> use ODE&apos;s
              4-year adjusted cohort graduation rate, the federal standard. This tracks a cohort of
              first-time 9th graders and measures the percentage who graduate within four years,
              adjusting for transfers in and out.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Test scores</strong> are Smarter Balanced
              Assessment results published by ODE. Proficiency rates shown are the percentage of students
              meeting or exceeding grade-level standards. Currently shown for PPS only.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Enrollment forecast</strong> is from
              Portland State University&apos;s Population Research Center, commissioned by PPS for
              long-range planning. Applies to PPS only.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">School closure risk</strong> uses
              ODE&apos;s individual school enrollment data for PPS. The 300-student threshold reflects
              PPS&apos;s seismic retrofit prioritization criteria.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
