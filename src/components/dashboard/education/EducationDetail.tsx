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
  TrendingDown,
  FileText,
  School,
  MapPin,
  AlertTriangle,
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

const DEMO_COLORS = [
  "#c05621", // AI/AN
  "#2d7d9a", // Asian
  "#7c4dba", // NHPI
  "#3d7a5a", // Black
  "#b85c8a", // Hispanic
  "#8b7355", // White
  "#5a7d3d", // Multi-Racial
];

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

interface EnrollmentTrendItem {
  year: string;
  total: number;
}

interface GradeEnrollment {
  districtName: string;
  grade: string;
  count: number;
}

interface GraduationRate {
  districtName: string;
  year: string;
  rate4yr: number | null;
  rate5yr: number | null;
  completers: number | null;
}

interface TestScore {
  districtName: string;
  year: string;
  subject: string;
  grade: string;
  proficiency: number | null;
  participationPct: number | null;
  nTested: number | null;
}

interface AbsenteeismRow {
  year: string;
  districtName: string;
  group: string;
  chronicPct: number | null;
  n: number | null;
}

interface AbsenteeismEquityRow {
  group: string;
  chronicPct: number | null;
  n: number | null;
}

interface DemographicRow {
  districtName: string;
  group: string;
  total: number;
  pct: number;
}

interface StaffingRow {
  year: string;
  districtName: string;
  enrollment: number | null;
  teachersFte: number | null;
  pupilTeacherRatio: number | null;
}

interface HeroStats {
  totalEnrollment: number;
  latestYear: string | null;
  avgGradRate: number | null;
  avgGradRateYear: string | null;
  avgProficiency: number | null;
  avgProficiencyYear: string | null;
}

interface EducationDetailData {
  districts: District[];
  enrollmentByYear: EnrollmentYear[];
  enrollmentTrend: EnrollmentTrendItem[];
  enrollmentByGrade: GradeEnrollment[];
  graduationRates: GraduationRate[];
  testScores: TestScore[];
  absenteeism: AbsenteeismRow[];
  absenteeismEquity: AbsenteeismEquityRow[];
  demographics: DemographicRow[];
  staffing: StaffingRow[];
  heroStats: HeroStats | null;
  topInsights: string[];
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

// ── Helpers ──────────────────────────────────────────────────────────────

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
    // Guarded against unmount, and against a slower earlier request
    // landing after a newer one. Switching topics quickly used to let a
    // stale response overwrite fresher state.
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/dashboard/education/detail", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
        if (d.districts) {
          if (!cancelled) setActiveDistricts(new Set(d.districts.map((dd: District) => dd.name)));
        }
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
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

    const { enrollmentByYear, graduationRates, testScores } = data;
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

    // PPS graduation rate
    const ppsLatestGrad = latestGradByDistrict.get("Portland SD 1J");

    // Test scores: latest year, district-level proficiency by subject
    const testYears = Array.from(new Set(testScores.map((t) => t.year))).sort();
    const latestTestYear = testYears[testYears.length - 1] ?? null;
    const latestTestScores = latestTestYear
      ? testScores.filter((t) => t.year === latestTestYear && t.proficiency !== null)
      : [];

    // District-level proficiency comparison (avg across grades for each subject)
    const testScoreByDistrictSubject = new Map<string, { ela: number | null; math: number | null }>();
    for (const d of allDistricts) {
      const distEla = latestTestScores.filter((t) => t.districtName === d && t.subject === "ELA");
      const distMath = latestTestScores.filter((t) => t.districtName === d && t.subject === "Math");
      const avgEla = distEla.length > 0
        ? Math.round(distEla.reduce((s, t) => s + (t.proficiency ?? 0), 0) / distEla.length * 10) / 10
        : null;
      const avgMath = distMath.length > 0
        ? Math.round(distMath.reduce((s, t) => s + (t.proficiency ?? 0), 0) / distMath.length * 10) / 10
        : null;
      testScoreByDistrictSubject.set(d, { ela: avgEla, math: avgMath });
    }

    // District comparison table data
    const comparisonRows = allDistricts.map((d) => {
      const enrollment = latestByDistrict.get(d);
      const grad = latestGradByDistrict.get(d);
      const scores = testScoreByDistrictSubject.get(d);
      return {
        district: d,
        shortName: shortName(d),
        color: DISTRICT_COLORS[d] ?? ACCENT,
        enrollment: enrollment?.total ?? null,
        gradRate: grad?.rate4yr ?? null,
        elaProficiency: scores?.ela ?? null,
        mathProficiency: scores?.math ?? null,
      };
    }).sort((a, b) => (b.enrollment ?? 0) - (a.enrollment ?? 0));

    // Absenteeism trend data for MultiLineChart
    const absenteeismYears = Array.from(
      new Set((data.absenteeism ?? []).map((a) => a.year))
    ).sort();
    const absenteeismChartData = absenteeismYears.map((year) => {
      const row: Record<string, string | number> = { year };
      for (const d of allDistricts) {
        const match = (data.absenteeism ?? []).find(
          (a) => a.districtName === d && a.year === year
        );
        if (match?.chronicPct !== null && match?.chronicPct !== undefined) {
          row[shortName(d)] = match.chronicPct;
        }
      }
      return row;
    });

    // Absenteeism callout stats
    const ppsAbsenteeism = (data.absenteeism ?? []).filter(
      (a) => a.districtName === "Portland SD 1J"
    );
    const preCovidAbsenteeism = ppsAbsenteeism.filter(
      (a) => a.year <= "2018-19" && a.chronicPct !== null
    );
    const preCovidAvg =
      preCovidAbsenteeism.length > 0
        ? Math.round(
            (preCovidAbsenteeism.reduce((s, a) => s + (a.chronicPct ?? 0), 0) /
              preCovidAbsenteeism.length) *
              10
          ) / 10
        : null;
    const latestAbsenteeism =
      ppsAbsenteeism.length > 0
        ? ppsAbsenteeism[ppsAbsenteeism.length - 1]
        : null;

    // Equity horizontal bar data
    const equityBars = (data.absenteeismEquity ?? [])
      .filter((e) => e.chronicPct !== null && (e.n ?? 0) >= 10)
      .map((e) => ({
        name: e.group,
        value: e.chronicPct!,
        n: e.n ?? 0,
      }));

    // Demographics: pivot to stacked bar chart data (district x race/ethnicity)
    const demographicGroups = Array.from(
      new Set((data.demographics ?? []).map((d) => d.group))
    );
    const demographicsByDistrict = allDistricts.map((d) => {
      const distRows = (data.demographics ?? []).filter(
        (r) => r.districtName === d
      );
      const row: Record<string, string | number> = { district: shortName(d) };
      for (const dr of distRows) {
        row[dr.group] = dr.pct;
      }
      return row;
    });

    // Staffing: latest year per district, and trend data
    const staffingLatest = new Map<string, StaffingRow>();
    for (const d of allDistricts) {
      const distRows = (data.staffing ?? []).filter(
        (s) => s.districtName === d && s.pupilTeacherRatio !== null
      );
      if (distRows.length > 0) {
        staffingLatest.set(d, distRows[distRows.length - 1]);
      }
    }

    const staffingYears = Array.from(
      new Set((data.staffing ?? []).map((s) => s.year))
    ).sort();
    const staffingChartData = staffingYears.map((year) => {
      const row: Record<string, string | number> = { year };
      for (const d of allDistricts) {
        const match = (data.staffing ?? []).find(
          (s) => s.districtName === d && s.year === year
        );
        if (match?.pupilTeacherRatio !== null && match?.pupilTeacherRatio !== undefined) {
          row[shortName(d)] = match.pupilTeacherRatio;
        }
      }
      return row;
    });

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
      ppsLatestGrad,
      comparisonRows,
      years,
      gradYears,
      latestTestYear,
      latestTestScores,
      testScoreByDistrictSubject,
      absenteeismChartData,
      absenteeismYears,
      preCovidAvg,
      latestAbsenteeism,
      equityBars,
      demographicGroups,
      demographicsByDistrict,
      staffingLatest,
      staffingChartData,
      staffingYears,
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
          Run <code className="font-mono">npx tsx ingest/parse-education.ts</code> to load data.
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
    ppsLatestGrad,
    comparisonRows,
    latestTestYear,
    latestTestScores,
    testScoreByDistrictSubject,
    absenteeismChartData,
    preCovidAvg,
    latestAbsenteeism,
    equityBars,
    demographicGroups,
    demographicsByDistrict,
    staffingLatest,
    staffingChartData,
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

  // Combined enrollment trend for TrendChart
  const combinedTrendData = (data.enrollmentTrend ?? []).map((t) => ({
    date: t.year,
    value: t.total,
  }));

  // Proficiency comparison bar chart data
  const proficiencyBarData = allDistricts
    .filter((d) => activeDistricts.has(d))
    .map((d) => {
      const scores = testScoreByDistrictSubject.get(d);
      return {
        district: shortName(d),
        ELA: scores?.ela ?? 0,
        Math: scores?.math ?? 0,
      };
    })
    .filter((d) => d.ELA > 0 || d.Math > 0);

  return (
    <div className="space-y-10">
      {/* News Context */}
      <NewsContext category="education" />

      {/* 1. NARRATIVE SUMMARY */}
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
            {ppsPeak && ppsLatest && ppsDecline > 0 && (
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
              {data.heroStats?.avgProficiency && (
                <>
                  Academic outcomes vary widely: average proficiency across all districts is{" "}
                  <strong className="text-white">{data.heroStats.avgProficiency}%</strong>.{" "}
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
          <p className="mt-4 text-[12px] font-mono text-white/40 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/Pages/Enrollment-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-white/60">Oregon Dept of Education &middot; Report Cards</a>
          </p>
        </div>
      </section>

      {/* Top Insights */}
      {data.topInsights && data.topInsights.length > 0 && (
        <section>
          <SectionHeader icon={TrendingDown} title="Key Findings" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <ul className="space-y-2">
              {data.topInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--color-ink-light)] leading-relaxed">
                  <span className="text-[var(--color-ink-muted)] mt-0.5 flex-shrink-0">&#8226;</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* DISTRICT FILTER */}
      <section>
        <SectionHeader icon={School} title="Filter Districts" />
        <DistrictToggle
          districts={data.districts}
          activeDistricts={activeDistricts}
          onToggle={toggleDistrict}
        />
      </section>

      {/* 2. KEY STATS */}
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
            ...(data.heroStats?.avgGradRate
              ? [
                  {
                    label: "Avg 4-Year Grad Rate",
                    value: `${data.heroStats.avgGradRate}%`,
                    changeLabel: data.heroStats.avgGradRateYear ?? "",
                  },
                ]
              : []),
          ]}
        />
      </section>

      {/* 3. COMBINED ENROLLMENT TREND */}
      {combinedTrendData.length > 0 && (
        <section>
          <SectionHeader icon={TrendingUp} title="Total Enrollment — All 6 Districts" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <TrendChart
              data={combinedTrendData}
              color={ACCENT}
              height={280}
              yAxisDomain="auto"
            />
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/Pages/Enrollment-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Report Cards</a>
          </p>
        </section>
      )}

      {/* 4. ENROLLMENT TREND BY DISTRICT (multi-line) */}
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
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/Pages/Enrollment-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Report Cards</a>
          </p>
        </section>
      )}

      {/* 5. DISTRICT COMPARISON TABLE */}
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
                      ELA Prof.
                    </th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Math Prof.
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
                          {r.enrollment !== null ? r.enrollment.toLocaleString() : "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.gradRate !== null ? `${r.gradRate}%` : "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.elaProficiency !== null ? `${r.elaProficiency}%` : "\u2014"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {r.mathProficiency !== null ? `${r.mathProficiency}%` : "\u2014"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 6. GRADUATION RATES (multi-district) */}
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
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/Pages/Enrollment-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Report Cards</a>
          </p>
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

      {/* 7. TEST SCORE PROFICIENCY BY DISTRICT */}
      {proficiencyBarData.length > 0 ? (
        <section>
          <SectionHeader icon={BookOpen} title={`Test Proficiency by District (${latestTestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <ComparisonBarChart
              data={proficiencyBarData}
              xKey="district"
              bars={[
                { key: "ELA", label: "ELA Proficiency %", color: ACCENT },
                { key: "Math", label: "Math Proficiency %", color: "#7c4dba" },
              ]}
              height={300}
              valueSuffix="%"
            />
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
              Percentage of students meeting or exceeding grade-level standards on the
              Smarter Balanced Assessment. Averaged across all tested grade levels.
            </p>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/educator-resources/assessment/Pages/Assessment-Group-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Assessment Reports</a>
          </p>
        </section>
      ) : (
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

      {/* 8. DETAILED TEST SCORES TABLE */}
      {latestTestScores.length > 0 && (
        <section>
          <SectionHeader icon={BookOpen} title={`Test Scores by Grade — All Districts (${latestTestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      District
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Subject
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Grade
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Proficiency
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Tested
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {latestTestScores
                    .filter((t) => activeDistricts.has(t.districtName))
                    .slice(0, 50)
                    .map((t, i) => (
                      <tr
                        key={`${t.districtName}-${t.subject}-${t.grade}-${i}`}
                        className="border-b border-[var(--color-parchment)]/60 last:border-b-0"
                      >
                        <td className="px-4 py-2 text-[var(--color-ink-light)]">
                          {shortName(t.districtName)}
                        </td>
                        <td className="px-4 py-2 text-[var(--color-ink-light)]">
                          {t.subject}
                        </td>
                        <td className="px-4 py-2 text-[var(--color-ink-light)]">
                          {t.grade}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {t.proficiency !== null ? `${t.proficiency}%` : "\u2014"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                          {t.nTested !== null ? t.nTested.toLocaleString() : "\u2014"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 9. GRADE-LEVEL ENROLLMENT (PPS) */}
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

      {/* 10. CHRONIC ABSENTEEISM CRISIS */}
      {absenteeismChartData.length > 0 && activeDistrictLines.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Chronic Absenteeism Crisis" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {preCovidAvg !== null && latestAbsenteeism !== null && latestAbsenteeism.chronicPct !== null && (
              <div className="flex flex-wrap gap-4 mb-5">
                <div className="bg-[var(--color-parchment)]/50 rounded-sm px-4 py-3 flex-1 min-w-[160px]">
                  <div className="text-[11px] text-[var(--color-ink-muted)] uppercase tracking-wide mb-1">
                    Pre-COVID avg (PPS)
                  </div>
                  <div className="text-[22px] font-editorial-normal text-[var(--color-ink)]">
                    {preCovidAvg}%
                  </div>
                </div>
                <div className="flex items-center text-[var(--color-ink-muted)] text-lg px-2">
                  &rarr;
                </div>
                <div className="bg-[#b85c3a]/10 border border-[#b85c3a]/20 rounded-sm px-4 py-3 flex-1 min-w-[160px]">
                  <div className="text-[11px] text-[#b85c3a] uppercase tracking-wide mb-1">
                    {latestAbsenteeism.year} (PPS)
                  </div>
                  <div className="text-[22px] font-editorial-normal text-[#b85c3a]">
                    {latestAbsenteeism.chronicPct}%
                  </div>
                </div>
              </div>
            )}
            <MultiLineChart
              data={absenteeismChartData}
              lines={activeDistrictLines}
              xKey="year"
              height={300}
              valueSuffix="%"
            />
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
              Students attending 90% or fewer of enrolled days are chronically absent.
              The COVID-19 pandemic nearly doubled chronic absenteeism rates across all
              Portland districts, and recovery has been slow. Gap years (2019-20, 2020-21) reflect
              disrupted reporting during remote learning.
            </p>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/pages/attendance-and-absenteeism.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Attendance Reports</a>
          </p>
        </section>
      )}

      {/* 11. WHO'S MISSING SCHOOL — Equity Breakdown */}
      {equityBars.length > 0 && (
        <section>
          <SectionHeader icon={Users} title="Who's Missing School?" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6">
            <p className="text-[13px] text-[var(--color-ink-light)] mb-5 leading-relaxed">
              Chronic absenteeism rates by student group in PPS (
              {(data.absenteeism ?? []).length > 0
                ? (data.absenteeism ?? [])[(data.absenteeism ?? []).length - 1]?.year
                : ""}
              ). Students experiencing homelessness, American Indian/Alaska Native students,
              and Native Hawaiian/Pacific Islander students face the widest gaps.
            </p>
            <div className="space-y-2.5">
              {equityBars.map((item, i) => {
                const maxVal = equityBars[0]?.value ?? 1;
                const pct = Math.round((item.value / maxVal) * 100);
                const isHigh = item.value >= 50;
                const barColor = isHigh ? "#b85c3a" : ACCENT;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--color-ink-light)] w-[200px] text-right flex-shrink-0 truncate">
                      {item.name}
                    </span>
                    <div className="flex-1 h-7 bg-[var(--color-parchment)]/50 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: barColor,
                          opacity: 0.65 + 0.35 * (1 - i / equityBars.length),
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-mono font-semibold w-[50px] text-right tabular-nums"
                      style={{ color: isHigh ? "#b85c3a" : "var(--color-ink)" }}>
                      {item.value}%
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] w-[65px] text-right tabular-nums font-mono">
                      n={item.n.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
              Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/pages/attendance-and-absenteeism.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Attendance Reports</a>. Groups with fewer than 10 students excluded.
            </p>
          </div>
        </section>
      )}

      {/* 12. STUDENT DEMOGRAPHICS */}
      {demographicsByDistrict.length > 0 && demographicGroups.length > 0 && (
        <section>
          <SectionHeader icon={Users} title={`Student Demographics by District (${data.latestYear})`} />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            <ComparisonBarChart
              data={demographicsByDistrict.filter((d) =>
                activeDistricts.has(
                  Object.entries(DISTRICT_SHORT).find(
                    ([, v]) => v === d.district
                  )?.[0] ?? ""
                )
              )}
              xKey="district"
              bars={demographicGroups.map((group, i) => ({
                key: group,
                label: group,
                color: DEMO_COLORS[i % DEMO_COLORS.length],
                stackId: "demo",
              }))}
              height={340}
              valueSuffix="%"
            />
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
              Race/ethnicity as a percentage of total enrollment. East Portland districts
              (David Douglas, Reynolds, Centennial, Parkrose) serve significantly more diverse
              student populations than PPS or Riverdale.
            </p>
          </div>
          {/* Demographics detail table */}
          <div className="mt-4 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      District
                    </th>
                    {demographicGroups.map((g) => (
                      <th key={g} className="text-right px-3 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                        {g.replace("American Indian/Alaska Native", "AI/AN")
                          .replace("Native Hawaiian/Pacific Islander", "NH/PI")
                          .replace("Black/African American", "Black")
                          .replace("Hispanic/Latino", "Hispanic")
                          .replace("Multi-Racial", "Multi")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allDistricts
                    .filter((d) => activeDistricts.has(d))
                    .map((d) => {
                      const distDemo = (data.demographics ?? []).filter(
                        (r) => r.districtName === d
                      );
                      return (
                        <tr
                          key={d}
                          className="border-b border-[var(--color-parchment)]/60 last:border-b-0"
                        >
                          <td className="px-4 py-2 font-medium text-[var(--color-ink)]">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: DISTRICT_COLORS[d] ?? ACCENT }}
                              />
                              {shortName(d)}
                            </div>
                          </td>
                          {demographicGroups.map((g) => {
                            const match = distDemo.find((r) => r.group === g);
                            return (
                              <td
                                key={g}
                                className="px-3 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums"
                              >
                                {match ? `${match.pct}%` : "\u2014"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://www.oregon.gov/ode/reports-and-data/students/Pages/Student-Enrollment-Reports.aspx" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">Oregon Dept of Education &middot; Fall Membership Reports</a>
          </p>
        </section>
      )}

      {/* 13. TEACHER STAFFING */}
      {(data.staffing ?? []).length > 0 && (
        <section>
          <SectionHeader icon={School} title="Pupil-Teacher Ratio by District" />
          <div className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-5">
            {staffingChartData.length > 1 && (
              <MultiLineChart
                data={staffingChartData}
                lines={activeDistrictLines}
                xKey="year"
                height={300}
                valueSuffix=":1"
              />
            )}
            {staffingChartData.length <= 1 && (
              <ComparisonBarChart
                data={allDistricts
                  .filter((d) => activeDistricts.has(d))
                  .map((d) => {
                    const s = staffingLatest.get(d);
                    return {
                      district: shortName(d),
                      "Pupil-Teacher Ratio": s?.pupilTeacherRatio ?? 0,
                    };
                  })
                  .filter((d) => d["Pupil-Teacher Ratio"] > 0)}
                xKey="district"
                bars={[
                  { key: "Pupil-Teacher Ratio", label: "Students per Teacher", color: ACCENT },
                ]}
                height={300}
                valueSuffix=":1"
                showLegend={false}
              />
            )}
            <p className="text-[12px] text-[var(--color-ink-muted)] mt-3 leading-relaxed">
              The pupil-teacher ratio measures the number of students per full-time
              equivalent (FTE) teacher. Lower ratios generally indicate smaller class sizes,
              though actual class sizes may vary. Riverdale consistently has the lowest ratio,
              reflecting its small, well-resourced district.
            </p>
          </div>
          {/* Staffing detail table */}
          <div className="mt-4 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-parchment)]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      District
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Year
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Enrollment
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      Teachers (FTE)
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.12em]">
                      PTR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allDistricts
                    .filter((d) => activeDistricts.has(d))
                    .map((d) => {
                      const s = staffingLatest.get(d);
                      if (!s) return null;
                      return (
                        <tr
                          key={d}
                          className="border-b border-[var(--color-parchment)]/60 last:border-b-0"
                        >
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: DISTRICT_COLORS[d] ?? ACCENT }}
                              />
                              <span className="font-medium text-[var(--color-ink)]">
                                {shortName(d)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                            {s.year}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                            {s.enrollment?.toLocaleString() ?? "\u2014"}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                            {s.teachersFte?.toLocaleString() ?? "\u2014"}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-[var(--color-ink-light)] tabular-nums">
                            {s.pupilTeacherRatio !== null ? `${s.pupilTeacherRatio}:1` : "\u2014"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-2 text-[12px] font-mono text-[var(--color-ink-muted)]/60 tracking-wider">
            Source: <a href="https://nces.ed.gov/ccd/districtsearch/" target="_blank" rel="noopener" className="underline hover:text-[var(--color-ink-muted)]">NCES Common Core of Data via Urban Institute Education Data API</a>
          </p>
        </section>
      )}

      {/* 13. METHODOLOGY */}
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
              October 1 headcount for each school year.
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
              meeting or exceeding grade-level standards.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Chronic absenteeism</strong> uses ODE&apos;s
              Regular Attenders reports (2014-15 through 2024-25). A student is chronically absent if they
              attend 90% or fewer of their enrolled days. Data for 2019-20 and 2020-21 is not published
              due to COVID-19 disruptions. Rates from 2020-21 onward are not directly comparable to prior
              years per ODE guidance. Groups with fewer than 10 students are suppressed for privacy.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Student demographics</strong> come from
              ODE Fall Membership XLSX files, which report race/ethnicity counts and percentages for
              each district. Percentages shown are computed from headcounts to ensure accuracy.
            </p>
            <p>
              <strong className="text-[var(--color-ink-light)]">Teacher staffing</strong> data comes from
              the National Center for Education Statistics (NCES) Common Core of Data via the Urban
              Institute Education Data API. Pupil-teacher ratios reflect total enrollment divided by
              full-time equivalent (FTE) classroom teachers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
