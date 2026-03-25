/**
 * analyze-permits.ts
 *
 * Standalone analytics script that:
 * 1. Connects to PostgreSQL
 * 2. Runs comprehensive analytics on the 34,307 real building permits
 * 3. Prints a formatted report to console
 * 4. Updates dashboard_cache with computed metrics
 *
 * Usage: npx tsx scripts/analyze-permits.ts
 */

import postgres from "postgres";

const DB_URL =
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";

const sql = postgres(DB_URL, {
  max: 5,
  onnotice: () => {},
});

// ── Formatting helpers ──────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtDollars(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function divider(title: string) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(70));
}

function table(rows: { label: string; value: string }[]) {
  const maxLabel = Math.max(...rows.map((r) => r.label.length));
  for (const r of rows) {
    console.log(`  ${r.label.padEnd(maxLabel + 2)} ${r.value}`);
  }
}

// ── Analytics queries ───────────────────────────────────────────────────

async function analyzeOverview() {
  divider("PERMIT DATABASE OVERVIEW");

  const overview = await sql`
    SELECT
      count(*)::int                                       AS total_permits,
      count(*) FILTER (WHERE status = 'issued')::int      AS active_issued,
      count(*) FILTER (WHERE status = 'finaled')::int     AS finaled,
      count(*) FILTER (WHERE status = 'expired')::int     AS expired,
      count(*) FILTER (WHERE status = 'cancelled')::int   AS cancelled,
      count(*) FILTER (WHERE status = 'withdrawn')::int   AS withdrawn,
      count(*) FILTER (WHERE status = 'in_review')::int   AS in_review,
      count(*) FILTER (WHERE status = 'approved')::int    AS approved,
      min(issued_date)::text                              AS earliest_date,
      max(issued_date)::text                              AS latest_date,
      count(DISTINCT neighborhood)::int                   AS neighborhoods_count
    FROM housing.permits
  `;

  const o = overview[0];
  table([
    { label: "Total permits", value: fmt(Number(o.total_permits)) },
    { label: "Active (Issued)", value: fmt(Number(o.active_issued)) },
    { label: "Finaled", value: fmt(Number(o.finaled)) },
    { label: "Expired", value: fmt(Number(o.expired)) },
    { label: "Cancelled", value: fmt(Number(o.cancelled)) },
    { label: "Withdrawn", value: fmt(Number(o.withdrawn)) },
    { label: "In Review", value: fmt(Number(o.in_review)) },
    { label: "Approved", value: fmt(Number(o.approved)) },
    { label: "Date range", value: `${o.earliest_date} to ${o.latest_date}` },
    { label: "Neighborhoods", value: fmt(Number(o.neighborhoods_count)) },
  ]);

  return o;
}

async function analyzeByType() {
  divider("BREAKDOWN BY PERMIT TYPE");

  const byType = await sql`
    SELECT
      permit_type,
      count(*)::int                              AS cnt,
      avg(processing_days)::int                  AS avg_days,
      sum(valuation)::bigint                     AS total_val,
      count(*) FILTER (WHERE status = 'issued')::int AS active
    FROM housing.permits
    GROUP BY permit_type
    ORDER BY cnt DESC
  `;

  console.log(
    "  " +
      "Type".padEnd(35) +
      "Count".padStart(8) +
      "Active".padStart(8) +
      "Avg Days".padStart(10) +
      "Total Value".padStart(15)
  );
  console.log("  " + "-".repeat(76));
  for (const r of byType) {
    const type = String(r.permit_type).slice(0, 34);
    console.log(
      "  " +
        type.padEnd(35) +
        fmt(Number(r.cnt)).padStart(8) +
        fmt(Number(r.active)).padStart(8) +
        (r.avg_days != null ? String(r.avg_days) : "N/A").padStart(10) +
        fmtDollars(Number(r.total_val || 0)).padStart(15)
    );
  }

  return byType;
}

async function analyzeResidentialVsCommercial() {
  divider("RESIDENTIAL VS COMMERCIAL BREAKDOWN");

  const breakdown = await sql`
    SELECT
      CASE
        WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%'
          THEN 'Residential'
        WHEN permit_type ILIKE '%commercial%' OR permit_type ILIKE '%facility%'
          THEN 'Commercial/Facility'
        ELSE 'Trade/Other'
      END AS category,
      count(*)::int AS cnt,
      count(*) FILTER (WHERE status = 'issued')::int AS active,
      avg(processing_days)::int AS avg_days,
      sum(valuation)::bigint AS total_val
    FROM housing.permits
    GROUP BY 1
    ORDER BY cnt DESC
  `;

  for (const r of breakdown) {
    table([
      { label: `${r.category}`, value: "" },
      { label: "  Count", value: fmt(Number(r.cnt)) },
      { label: "  Active (Issued)", value: fmt(Number(r.active)) },
      { label: "  Avg processing days", value: r.avg_days != null ? `${r.avg_days} days` : "N/A" },
      { label: "  Total valuation", value: fmtDollars(Number(r.total_val || 0)) },
    ]);
    console.log("");
  }

  return breakdown;
}

async function analyzeConstructionActivity() {
  divider("ACTIVE CONSTRUCTION (Status = Issued)");

  const active = await sql`
    SELECT
      count(*)::int AS total_active,
      sum(valuation)::bigint AS total_val,
      avg(processing_days)::int AS avg_days,
      count(DISTINCT neighborhood)::int AS neighborhoods
    FROM housing.permits
    WHERE status = 'issued'
  `;

  const a = active[0];
  table([
    { label: "Total active permits", value: fmt(Number(a.total_active)) },
    { label: "Total valuation", value: fmtDollars(Number(a.total_val || 0)) },
    { label: "Avg processing days", value: `${a.avg_days ?? "N/A"} days` },
    { label: "Active neighborhoods", value: fmt(Number(a.neighborhoods)) },
  ]);

  // New construction vs renovation
  console.log("\n  New Construction vs Renovation (Active permits):");
  const newVsReno = await sql`
    SELECT
      CASE
        WHEN permit_type_mapped ILIKE '%new%' THEN 'New Construction'
        WHEN permit_type_mapped ILIKE '%addition%' OR permit_type_mapped ILIKE '%alteration%'
          THEN 'Renovation/Alteration'
        WHEN permit_type_mapped ILIKE '%demolition%' THEN 'Demolition'
        ELSE 'Other/Trade'
      END AS work_type,
      count(*)::int AS cnt,
      sum(valuation)::bigint AS total_val
    FROM housing.permits
    WHERE status = 'issued'
    GROUP BY 1
    ORDER BY cnt DESC
  `;

  for (const r of newVsReno) {
    console.log(
      `    ${String(r.work_type).padEnd(30)} ${fmt(Number(r.cnt)).padStart(8)} permits    ${fmtDollars(Number(r.total_val || 0)).padStart(12)}`
    );
  }

  return { active: a, newVsReno };
}

async function analyzeMonthlyTrends() {
  divider("MONTHLY PERMIT ISSUANCE TRENDS");

  const monthly = await sql`
    SELECT
      TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') AS month,
      count(*)::int AS cnt,
      sum(valuation)::bigint AS total_val,
      avg(processing_days)::int AS avg_days
    FROM housing.permits
    WHERE issued_date IS NOT NULL
    GROUP BY date_trunc('month', issued_date)
    ORDER BY date_trunc('month', issued_date)
  `;

  console.log(
    "  " +
      "Month".padEnd(10) +
      "Permits".padStart(10) +
      "Valuation".padStart(14) +
      "Avg Days".padStart(10)
  );
  console.log("  " + "-".repeat(44));

  // Show last 24 months for readability
  const recent = monthly.slice(-24);
  for (const r of recent) {
    console.log(
      "  " +
        String(r.month).padEnd(10) +
        fmt(Number(r.cnt)).padStart(10) +
        fmtDollars(Number(r.total_val || 0)).padStart(14) +
        (r.avg_days != null ? String(r.avg_days) : "N/A").padStart(10)
    );
  }

  if (monthly.length > 24) {
    console.log(`\n  (Showing last 24 of ${monthly.length} months)`);
  }

  return monthly;
}

async function analyzeProcessingTime() {
  divider("PROCESSING TIME ANALYSIS");

  const processing = await sql`
    SELECT
      permit_type,
      count(*)::int AS cnt,
      avg(processing_days)::int AS avg_days,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS median_days,
      min(processing_days)::int AS min_days,
      max(processing_days)::int AS max_days,
      count(*) FILTER (WHERE processing_days <= 90)::int AS under_90
    FROM housing.permits
    WHERE processing_days IS NOT NULL AND processing_days >= 0
    GROUP BY permit_type
    ORDER BY cnt DESC
  `;

  console.log(
    "  " +
      "Type".padEnd(32) +
      "Count".padStart(7) +
      "Avg".padStart(6) +
      "Med".padStart(6) +
      "Min".padStart(6) +
      "Max".padStart(6) +
      "<=90d".padStart(7) +
      "%".padStart(5)
  );
  console.log("  " + "-".repeat(73));
  for (const r of processing) {
    const pct = Number(r.cnt) > 0 ? Math.round((Number(r.under_90) / Number(r.cnt)) * 100) : 0;
    console.log(
      "  " +
        String(r.permit_type).slice(0, 31).padEnd(32) +
        fmt(Number(r.cnt)).padStart(7) +
        String(r.avg_days ?? "").padStart(6) +
        String(r.median_days ?? "").padStart(6) +
        String(r.min_days ?? "").padStart(6) +
        String(r.max_days ?? "").padStart(6) +
        fmt(Number(r.under_90)).padStart(7) +
        `${pct}%`.padStart(5)
    );
  }

  // Overall 90-day guarantee metric
  const overall = await sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE processing_days <= 90)::int AS under_90,
      avg(processing_days)::int AS avg_days
    FROM housing.permits
    WHERE processing_days IS NOT NULL AND processing_days >= 0
  `;
  const o = overall[0];
  const pct90 = Number(o.total) > 0
    ? Math.round((Number(o.under_90) / Number(o.total)) * 100)
    : 0;

  console.log(`\n  90-DAY PROCESSING GUARANTEE:`);
  console.log(`    ${fmt(Number(o.under_90))} of ${fmt(Number(o.total))} permits (${pct90}%) processed within 90 days`);
  console.log(`    Overall average: ${o.avg_days} days`);

  return { processing, overall: o, pct90 };
}

async function analyzeValuationByYear() {
  divider("TOTAL CONSTRUCTION VALUATION BY YEAR");

  const yearly = await sql`
    SELECT
      EXTRACT(YEAR FROM issued_date)::int AS year,
      count(*)::int AS permits,
      sum(valuation)::bigint AS total_val,
      avg(valuation)::bigint AS avg_val
    FROM housing.permits
    WHERE issued_date IS NOT NULL AND valuation IS NOT NULL AND valuation > 0
    GROUP BY EXTRACT(YEAR FROM issued_date)
    ORDER BY year
  `;

  console.log(
    "  " +
      "Year".padEnd(8) +
      "Permits".padStart(10) +
      "Total Value".padStart(16) +
      "Avg Value".padStart(14)
  );
  console.log("  " + "-".repeat(48));
  for (const r of yearly) {
    console.log(
      "  " +
        String(r.year).padEnd(8) +
        fmt(Number(r.permits)).padStart(10) +
        fmtDollars(Number(r.total_val || 0)).padStart(16) +
        fmtDollars(Number(r.avg_val || 0)).padStart(14)
    );
  }

  return yearly;
}

async function analyzeTopNeighborhoods() {
  divider("TOP 20 NEIGHBORHOODS BY PERMIT ACTIVITY");

  const neighborhoods = await sql`
    SELECT
      COALESCE(neighborhood, 'Unknown') AS neighborhood,
      count(*)::int AS cnt,
      count(*) FILTER (WHERE status = 'issued')::int AS active,
      sum(valuation)::bigint AS total_val,
      avg(processing_days)::int AS avg_days
    FROM housing.permits
    GROUP BY neighborhood
    ORDER BY cnt DESC
    LIMIT 20
  `;

  console.log(
    "  " +
      "Neighborhood".padEnd(30) +
      "Total".padStart(8) +
      "Active".padStart(8) +
      "Value".padStart(14) +
      "Avg Days".padStart(10)
  );
  console.log("  " + "-".repeat(70));
  for (const r of neighborhoods) {
    console.log(
      "  " +
        String(r.neighborhood).slice(0, 29).padEnd(30) +
        fmt(Number(r.cnt)).padStart(8) +
        fmt(Number(r.active)).padStart(8) +
        fmtDollars(Number(r.total_val || 0)).padStart(14) +
        (r.avg_days != null ? String(r.avg_days) : "N/A").padStart(10)
    );
  }

  return neighborhoods;
}

async function analyzeVacancyCrossReference() {
  divider("VACANCY CROSS-REFERENCE: NEIGHBORHOODS WITH DECLINING PERMIT ACTIVITY");

  // Year-over-year permit activity by neighborhood
  const yoyActivity = await sql`
    WITH yearly AS (
      SELECT
        COALESCE(neighborhood, 'Unknown') AS neighborhood,
        EXTRACT(YEAR FROM issued_date)::int AS year,
        count(*)::int AS permits
      FROM housing.permits
      WHERE issued_date IS NOT NULL
      GROUP BY neighborhood, EXTRACT(YEAR FROM issued_date)
    ),
    yoy AS (
      SELECT
        a.neighborhood,
        a.year AS current_year,
        a.permits AS current_permits,
        b.permits AS prior_permits,
        CASE WHEN b.permits > 0
          THEN ROUND(((a.permits - b.permits)::numeric / b.permits) * 100, 1)
          ELSE NULL
        END AS yoy_change_pct
      FROM yearly a
      LEFT JOIN yearly b ON a.neighborhood = b.neighborhood AND a.year = b.year + 1
      WHERE a.year = (SELECT MAX(EXTRACT(YEAR FROM issued_date))::int FROM housing.permits)
    )
    SELECT * FROM yoy
    WHERE prior_permits IS NOT NULL AND prior_permits > 5
    ORDER BY yoy_change_pct ASC NULLS LAST
    LIMIT 20
  `;

  console.log(
    "  " +
      "Neighborhood".padEnd(30) +
      "Prior Yr".padStart(10) +
      "Current".padStart(10) +
      "YoY Change".padStart(12)
  );
  console.log("  " + "-".repeat(62));

  const declining: Array<Record<string, unknown>> = [];
  for (const r of yoyActivity) {
    const pct = r.yoy_change_pct != null ? `${r.yoy_change_pct}%` : "N/A";
    const marker = Number(r.yoy_change_pct) < -20 ? " *** DECLINING" : "";
    console.log(
      "  " +
        String(r.neighborhood).slice(0, 29).padEnd(30) +
        fmt(Number(r.prior_permits)).padStart(10) +
        fmt(Number(r.current_permits)).padStart(10) +
        pct.padStart(12) +
        marker
    );
    if (Number(r.yoy_change_pct) < 0) {
      declining.push(r);
    }
  }

  // Properties with no permit activity since 2022 (potentially stale)
  console.log("\n  POTENTIALLY STALE PROPERTIES (no permits since 2022):");
  const stale = await sql`
    SELECT
      COALESCE(p.neighborhood, 'Unknown') AS neighborhood,
      count(DISTINCT p.project_address)::int AS stale_addresses,
      max(p.issued_date)::text AS last_permit_date
    FROM housing.permits p
    WHERE p.permit_type IN ('Commercial Building', 'Facility')
    GROUP BY p.neighborhood
    HAVING max(p.issued_date) < '2022-01-01'
    ORDER BY stale_addresses DESC
    LIMIT 15
  `;

  if (stale.length > 0) {
    for (const r of stale) {
      console.log(
        `    ${String(r.neighborhood).padEnd(30)} ${fmt(Number(r.stale_addresses))} addresses (last: ${r.last_permit_date})`
      );
    }
  } else {
    console.log("    No commercial properties with permits only before 2022 found.");
    console.log("    (Our dataset starts at 2023, so this is expected.)");
  }

  // Cross-reference with downtown vacancy
  console.log("\n  DOWNTOWN VACANCY TREND (from public.downtown_vacancy):");
  const vacancy = await sql`
    SELECT
      quarter::text,
      office_vacancy_pct,
      retail_vacancy_pct
    FROM public.downtown_vacancy
    ORDER BY quarter DESC
    LIMIT 8
  `;

  console.log(
    "  " +
      "Quarter".padEnd(14) +
      "Office %".padStart(10) +
      "Retail %".padStart(10)
  );
  console.log("  " + "-".repeat(34));
  for (const r of vacancy) {
    const qDate = new Date(String(r.quarter));
    const qLabel = `Q${Math.ceil((qDate.getMonth() + 1) / 3)} ${qDate.getFullYear()}`;
    console.log(
      "  " +
        qLabel.padEnd(14) +
        String(Number(r.office_vacancy_pct).toFixed(1)).padStart(10) +
        String(Number(r.retail_vacancy_pct).toFixed(1)).padStart(10)
    );
  }

  return { declining, stale, vacancy };
}

// ── Cache update ────────────────────────────────────────────────────────

async function updateDashboardCache() {
  divider("UPDATING DASHBOARD CACHE");

  // 1. Construction activity metrics
  const constructionMetrics = await sql`
    SELECT
      count(*) FILTER (WHERE status = 'issued')::int AS active_construction,
      count(*) FILTER (WHERE status = 'finaled')::int AS completed,
      count(*)::int AS total_permits,
      sum(valuation) FILTER (WHERE status = 'issued')::bigint AS active_valuation,
      avg(processing_days) FILTER (WHERE processing_days IS NOT NULL AND processing_days >= 0)::int AS avg_processing_days,
      count(*) FILTER (WHERE processing_days IS NOT NULL AND processing_days >= 0 AND processing_days <= 90)::int AS under_90_days,
      count(*) FILTER (WHERE processing_days IS NOT NULL AND processing_days >= 0)::int AS with_processing_data
    FROM housing.permits
  `;

  // 2. Residential vs commercial breakdown
  const breakdown = await sql`
    SELECT
      CASE
        WHEN permit_type ILIKE '%residential%' OR permit_type ILIKE '%1 & 2 family%'
          THEN 'residential'
        WHEN permit_type ILIKE '%commercial%'
          THEN 'commercial'
        WHEN permit_type ILIKE '%facility%'
          THEN 'facility'
        ELSE 'trade'
      END AS category,
      count(*)::int AS cnt,
      count(*) FILTER (WHERE status = 'issued')::int AS active,
      sum(valuation)::bigint AS total_val,
      avg(processing_days)::int AS avg_days
    FROM housing.permits
    GROUP BY 1
    ORDER BY cnt DESC
  `;

  // 3. Monthly issuance trends (full range)
  const monthlyTrends = await sql`
    SELECT
      TO_CHAR(date_trunc('month', issued_date), 'YYYY-MM') AS month,
      count(*)::int AS cnt,
      sum(valuation)::bigint AS total_val
    FROM housing.permits
    WHERE issued_date IS NOT NULL
    GROUP BY date_trunc('month', issued_date)
    ORDER BY date_trunc('month', issued_date)
  `;

  // 4. Processing time by type
  const processingByType = await sql`
    SELECT
      permit_type,
      count(*)::int AS cnt,
      avg(processing_days)::int AS avg_days,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY processing_days)::int AS median_days,
      count(*) FILTER (WHERE processing_days <= 90)::int AS under_90
    FROM housing.permits
    WHERE processing_days IS NOT NULL AND processing_days >= 0
    GROUP BY permit_type
    ORDER BY cnt DESC
  `;

  // 5. Valuation by year
  const valuationByYear = await sql`
    SELECT
      EXTRACT(YEAR FROM issued_date)::int AS year,
      count(*)::int AS permits,
      sum(valuation)::bigint AS total_val
    FROM housing.permits
    WHERE issued_date IS NOT NULL AND valuation > 0
    GROUP BY EXTRACT(YEAR FROM issued_date)
    ORDER BY year
  `;

  // 6. Top neighborhoods
  const topNeighborhoods = await sql`
    SELECT
      COALESCE(neighborhood, 'Unknown') AS neighborhood,
      count(*)::int AS cnt,
      count(*) FILTER (WHERE status = 'issued')::int AS active,
      sum(valuation)::bigint AS total_val
    FROM housing.permits
    GROUP BY neighborhood
    ORDER BY cnt DESC
    LIMIT 20
  `;

  const cm = constructionMetrics[0];
  const pct90 = Number(cm.with_processing_data) > 0
    ? Math.round((Number(cm.under_90_days) / Number(cm.with_processing_data)) * 100)
    : 0;

  const constructionCache = {
    summary: {
      active_construction: Number(cm.active_construction),
      completed: Number(cm.completed),
      total_permits: Number(cm.total_permits),
      active_valuation: Number(cm.active_valuation || 0),
      avg_processing_days: Number(cm.avg_processing_days || 0),
      pct_under_90_days: pct90,
    },
    breakdown: breakdown.map((r) => ({
      category: r.category,
      count: Number(r.cnt),
      active: Number(r.active),
      total_valuation: Number(r.total_val || 0),
      avg_processing_days: Number(r.avg_days || 0),
    })),
    monthly_trends: monthlyTrends.map((r) => ({
      month: r.month,
      permits: Number(r.cnt),
      valuation: Number(r.total_val || 0),
    })),
    processing_by_type: processingByType.map((r) => ({
      type: r.permit_type,
      count: Number(r.cnt),
      avg_days: Number(r.avg_days || 0),
      median_days: Number(r.median_days || 0),
      under_90: Number(r.under_90),
    })),
    valuation_by_year: valuationByYear.map((r) => ({
      year: Number(r.year),
      permits: Number(r.permits),
      total_valuation: Number(r.total_val || 0),
    })),
    top_neighborhoods: topNeighborhoods.map((r) => ({
      neighborhood: r.neighborhood,
      total: Number(r.cnt),
      active: Number(r.active),
      valuation: Number(r.total_val || 0),
    })),
    computed_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO public.dashboard_cache (question, data, updated_at)
    VALUES ('construction_activity', ${sql.json(constructionCache)}, now())
    ON CONFLICT (question)
    DO UPDATE SET data = ${sql.json(constructionCache)}, updated_at = now()
  `;
  console.log("  Cached: construction_activity");

  // 7. Vacancy analysis — neighborhoods with declining activity
  const vacancyAnalysis = await sql`
    WITH yearly AS (
      SELECT
        COALESCE(neighborhood, 'Unknown') AS neighborhood,
        EXTRACT(YEAR FROM issued_date)::int AS year,
        count(*)::int AS permits,
        sum(valuation)::bigint AS total_val
      FROM housing.permits
      WHERE issued_date IS NOT NULL
      GROUP BY neighborhood, EXTRACT(YEAR FROM issued_date)
    ),
    latest_year AS (
      SELECT MAX(EXTRACT(YEAR FROM issued_date))::int AS yr FROM housing.permits
    ),
    yoy AS (
      SELECT
        a.neighborhood,
        a.year AS current_year,
        a.permits AS current_permits,
        a.total_val AS current_val,
        b.permits AS prior_permits,
        b.total_val AS prior_val,
        CASE WHEN b.permits > 0
          THEN ROUND(((a.permits - b.permits)::numeric / b.permits) * 100, 1)
          ELSE NULL
        END AS yoy_change_pct
      FROM yearly a
      CROSS JOIN latest_year ly
      LEFT JOIN yearly b ON a.neighborhood = b.neighborhood AND a.year = b.year + 1
      WHERE a.year = ly.yr AND b.permits IS NOT NULL AND b.permits > 3
    )
    SELECT * FROM yoy
    ORDER BY yoy_change_pct ASC NULLS LAST
  `;

  // Cross-reference with downtown vacancy data
  const vacancyTrend = await sql`
    SELECT
      quarter::text,
      office_vacancy_pct,
      retail_vacancy_pct
    FROM public.downtown_vacancy
    ORDER BY quarter
  `;

  const vacancyCache = {
    neighborhoods_declining: vacancyAnalysis
      .filter((r) => Number(r.yoy_change_pct) < 0)
      .map((r) => ({
        neighborhood: r.neighborhood,
        current_year: Number(r.current_year),
        current_permits: Number(r.current_permits),
        prior_permits: Number(r.prior_permits),
        yoy_change_pct: Number(r.yoy_change_pct),
        current_valuation: Number(r.current_val || 0),
      })),
    neighborhoods_growing: vacancyAnalysis
      .filter((r) => Number(r.yoy_change_pct) > 0)
      .map((r) => ({
        neighborhood: r.neighborhood,
        current_year: Number(r.current_year),
        current_permits: Number(r.current_permits),
        prior_permits: Number(r.prior_permits),
        yoy_change_pct: Number(r.yoy_change_pct),
      })),
    downtown_vacancy_trend: vacancyTrend.map((r) => ({
      quarter: r.quarter,
      office_pct: Number(r.office_vacancy_pct),
      retail_pct: Number(r.retail_vacancy_pct),
    })),
    computed_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO public.dashboard_cache (question, data, updated_at)
    VALUES ('vacancy_analysis', ${sql.json(vacancyCache)}, now())
    ON CONFLICT (question)
    DO UPDATE SET data = ${sql.json(vacancyCache)}, updated_at = now()
  `;
  console.log("  Cached: vacancy_analysis");

  // 8. Update housing_permits cache with enhanced data
  const enhancedPermitCache = {
    ...constructionCache.summary,
    breakdown: constructionCache.breakdown,
    monthly_trends: constructionCache.monthly_trends,
    top_neighborhoods: constructionCache.top_neighborhoods,
    valuation_by_year: constructionCache.valuation_by_year,
    processing_by_type: constructionCache.processing_by_type,
    computed_at: new Date().toISOString(),
  };

  await sql`
    INSERT INTO public.dashboard_cache (question, data, updated_at)
    VALUES ('housing_permits', ${sql.json(enhancedPermitCache)}, now())
    ON CONFLICT (question)
    DO UPDATE SET data = ${sql.json(enhancedPermitCache)}, updated_at = now()
  `;
  console.log("  Cached: housing_permits (enhanced)");

  console.log("\n  All cache entries updated successfully.");
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Portland Civic Lab Dashboard — Permit Analysis Report");
  console.log("====================================================");
  console.log(`Generated: ${new Date().toISOString()}\n`);

  try {
    await analyzeOverview();
    await analyzeByType();
    await analyzeResidentialVsCommercial();
    await analyzeConstructionActivity();
    await analyzeMonthlyTrends();
    await analyzeProcessingTime();
    await analyzeValuationByYear();
    await analyzeTopNeighborhoods();
    await analyzeVacancyCrossReference();
    await updateDashboardCache();

    divider("REPORT COMPLETE");
    console.log("  All analytics computed and cached in public.dashboard_cache");
    console.log("  Cache keys: construction_activity, vacancy_analysis, housing_permits");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\nError during analysis:", msg);
    if (err instanceof Error) console.error(err.stack);
    throw err;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
