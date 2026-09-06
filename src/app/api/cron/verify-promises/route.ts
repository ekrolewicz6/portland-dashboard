import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db-query";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Re-verifies mayoral promise claims against live database data.
 * Should run AFTER sync-crime and sync-campsites so it uses fresh data.
 *
 * Updates verification_status, metric_actual, and verification_notes for all
 * auto-verifiable promises in accountability.promises.
 *
 * GROUND RULES for anything added here. A row written by this job is shown to
 * the public as machine-verified against data, so:
 *
 *   1. Every `verification_status` must be DERIVED from the values the query
 *      just returned. Never write a literal verdict. If the data cannot
 *      support a verdict, write "in_progress" and say why in the notes.
 *   2. Every comparison window must be computed at run time, and the notes
 *      must state the window actually used. A window frozen in source drifts
 *      silently out of date while `updated_at` keeps being refreshed.
 *   3. Windows are anchored to the freshest row in the table, not to
 *      CURRENT_DATE. Ingest lags by days; comparing a partial recent window
 *      against a complete prior one manufactures a decline.
 *   4. Permit timeliness is measured by application cohort, never by grouping
 *      on issue date. Grouping by issue date only counts permits that already
 *      finished, which makes recent periods look fast. See KNOWN_ISSUES.md.
 */

type VerificationStatus =
  | "verified"
  | "partially_verified"
  | "contradicted"
  | "in_progress";

interface VerificationResult {
  promiseId: string;
  status: VerificationStatus;
  actual: number | null;
  summary: string;
}

/** Columns of safety.ppb_offenses this job is allowed to filter on. */
const CRIME_FILTER_COLUMNS = ["offense_category", "offense_type"] as const;
type CrimeFilterColumn = (typeof CRIME_FILTER_COLUMNS)[number];

/**
 * Grade a measured percentage change against a claimed one.
 *
 * "verified" requires the same direction AND a magnitude within 50% of the
 * claim; matching direction alone is "partially_verified".
 */
function gradeAgainstClaim(
  measured: number | null,
  claimed: number,
): VerificationStatus {
  if (measured === null) return "in_progress";
  if (Math.sign(measured) !== Math.sign(claimed)) return "contradicted";
  return Math.abs(measured - claimed) <= Math.abs(claimed) * 0.5
    ? "verified"
    : "partially_verified";
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const results: VerificationResult[] = [];

  async function record(
    promiseId: string,
    status: VerificationStatus,
    actual: number | null,
    notes: string,
    verifiedBy: string,
  ) {
    results.push({ promiseId, status, actual, summary: notes });
    await sql`
      UPDATE accountability.promises SET
        verification_status = ${status},
        metric_actual = ${actual},
        verification_notes = ${notes},
        verified_by = ${verifiedBy},
        updated_at = NOW()
      WHERE promise_id = ${promiseId}
    `;
  }

  try {
    // ── Downtown crime claims ──────────────────────────────────────────
    //
    // Year-to-date this year vs the identical calendar window last year. The
    // window ends at the freshest offense date in the table rather than today,
    // so an ingest lag cannot masquerade as a drop in crime.
    async function verifyCrime(
      promiseId: string,
      filterCol: CrimeFilterColumn,
      filterVal: string,
      claimed: number,
      label: string,
    ) {
      if (!CRIME_FILTER_COLUMNS.includes(filterCol)) {
        throw new Error(`refusing to filter on unexpected column ${filterCol}`);
      }
      // filterCol is constrained to the literal union above, so this
      // interpolation cannot carry caller-supplied text; filterVal is bound.
      const rows = await sql.unsafe(
        `
        WITH bounds AS (
          SELECT MAX(occur_date) AS as_of FROM safety.ppb_offenses
        )
        SELECT
          b.as_of::text                                        AS as_of,
          date_trunc('year', b.as_of)::date::text              AS window_start,
          COUNT(*) FILTER (
            WHERE o.occur_date >= date_trunc('year', b.as_of)
              AND o.occur_date <= b.as_of
          )::int                                               AS current,
          COUNT(*) FILTER (
            WHERE o.occur_date >= date_trunc('year', b.as_of) - INTERVAL '1 year'
              AND o.occur_date <= b.as_of - INTERVAL '1 year'
          )::int                                               AS prior
        FROM safety.ppb_offenses o
        CROSS JOIN bounds b
        WHERE o.${filterCol} = $1
          AND o.neighborhood IN ('Downtown', 'Old Town/Chinatown', 'Pearl')
        GROUP BY b.as_of
      `,
        [filterVal],
      );

      const r = rows[0];
      const prior = r ? Number(r.prior) : 0;
      const current = r ? Number(r.current) : 0;
      const pct =
        r && prior > 0
          ? Math.round(((current - prior) / prior) * 1000) / 10
          : null;

      const status = gradeAgainstClaim(pct, claimed);
      const notes =
        pct !== null
          ? `PPB NIBRS: downtown ${label} ${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% ` +
            `year to date (${r.window_start} to ${r.as_of}: ${current}, same window prior year: ${prior}). ` +
            `Wilson claimed ${claimed > 0 ? "+" : ""}${claimed}%.`
          : `Insufficient data: no downtown ${label} offenses recorded in the prior-year comparison window, so no rate can be computed.`;

      await record(promiseId, status, pct, notes, "auto:safety.ppb_offenses");
    }

    // S3: Break-ins (Burglary) down 17%
    await verifyCrime("WILSON-SOTC-2026-S3", "offense_category", "Burglary", -17, "burglary (break-ins)");

    // S4: Shoplifting down 30%
    await verifyCrime("WILSON-SOTC-2026-S4", "offense_type", "Shoplifting", -30, "shoplifting");

    // S5: Stolen cars down 29%
    await verifyCrime("WILSON-SOTC-2026-S5", "offense_category", "Motor Vehicle Theft", -29, "motor vehicle theft");

    // S6: Burglary down 51%
    await verifyCrime("WILSON-SOTC-2026-S6", "offense_category", "Burglary", -51, "burglary");

    // ── Homicide trend (S7: sustained decline) ───────────────────────
    //
    // Only complete calendar years are graded: the year containing the freshest
    // offense date is partial, and counting it as a full year would show a
    // decline every January. "Sustained" means the last two year-over-year
    // steps were both non-increasing, not merely that the latest year is
    // below the peak.
    const homicides = (await sql`
      WITH bounds AS (
        SELECT EXTRACT(YEAR FROM MAX(occur_date))::int AS partial_year
        FROM safety.ppb_offenses
      )
      SELECT EXTRACT(YEAR FROM occur_date)::int AS yr, COUNT(*)::int AS cnt
      FROM safety.ppb_offenses, bounds
      WHERE offense_category = 'Homicide Offenses'
        AND EXTRACT(YEAR FROM occur_date) >= 2019
        AND EXTRACT(YEAR FROM occur_date) < bounds.partial_year
      GROUP BY 1 ORDER BY 1
    `) as unknown as { yr: number; cnt: number }[];

    if (homicides.length < 3) {
      await record(
        "WILSON-SOTC-2026-S7",
        "in_progress",
        null,
        `Insufficient data: ${homicides.length} complete year(s) of homicide counts available; at least 3 are needed to judge a sustained trend.`,
        "auto:safety.ppb_offenses",
      );
    } else {
      const counts = homicides.map((r) => Number(r.cnt));
      const series = homicides.map((r) => `${r.yr}: ${r.cnt}`).join(", ");
      const peak = Math.max(...counts);
      const peakYear = homicides[counts.indexOf(peak)].yr;
      const latest = counts[counts.length - 1];
      const latestYear = homicides[homicides.length - 1].yr;
      const lastTwoSteps = [
        counts[counts.length - 1] - counts[counts.length - 2],
        counts[counts.length - 2] - counts[counts.length - 3],
      ];
      const sustained = lastTwoSteps.every((step) => step <= 0);
      const belowPeak = latest < peak;
      const changeFromPeak =
        peak > 0 ? Math.round(((latest - peak) / peak) * 1000) / 10 : null;

      let status: VerificationStatus;
      let verdict: string;
      if (!belowPeak) {
        status = "contradicted";
        verdict = `${latestYear} is at or above the ${peakYear} peak, so there is no decline to sustain.`;
      } else if (sustained) {
        status = "verified";
        verdict = `${latestYear} is below the ${peakYear} peak and each of the last two years fell, which is a sustained decline.`;
      } else {
        status = "partially_verified";
        verdict = `${latestYear} is below the ${peakYear} peak, but the last two years did not both fall, so the decline is not yet sustained.`;
      }

      await record(
        "WILSON-SOTC-2026-S7",
        status,
        changeFromPeak,
        `PPB NIBRS homicides, complete years only (${series}). Peak ${peak} in ${peakYear}; ${latestYear}: ${latest}. ${verdict}`,
        "auto:safety.ppb_offenses",
      );
    }

    // ── IRP campsite trend (H3: 75% decline) ─────────────────────────
    //
    // Both sides of the comparison are anchored to the freshest incident date,
    // and the recent window is a trailing 30 days ending there, so it is
    // measured the same way as the monthly peak it is compared against.
    const [irp] = (await sql`
      WITH bounds AS (
        SELECT MAX(incident_date) AS as_of
        FROM homelessness.irp_campsite_reports
      ),
      downtown AS (
        SELECT r.incident_date
        FROM homelessness.irp_campsite_reports r
        WHERE NOT r.is_duplicate
          AND r.lat BETWEEN 45.509 AND 45.535
          AND r.lon BETWEEN -122.685 AND -122.670
      ),
      monthly AS (
        SELECT COUNT(*)::int AS cnt
        FROM downtown, bounds
        WHERE incident_date >= '2025-01-01'
          AND incident_date < date_trunc('month', bounds.as_of)
        GROUP BY date_trunc('month', incident_date)
      )
      SELECT
        (SELECT as_of::text FROM bounds)                    AS as_of,
        (SELECT MAX(cnt) FROM monthly)                      AS peak,
        (SELECT COUNT(*) FROM monthly)::int                 AS months_observed,
        (
          SELECT COUNT(*)::int FROM downtown, bounds
          WHERE incident_date > bounds.as_of - INTERVAL '30 days'
            AND incident_date <= bounds.as_of
        )                                                   AS recent
    `) as unknown as {
      as_of: string | null;
      peak: number | null;
      months_observed: number;
      recent: number;
    }[];

    const irpPeak = irp?.peak !== null && irp?.peak !== undefined ? Number(irp.peak) : 0;
    const irpRecent = Number(irp?.recent ?? 0);
    // At least three complete months are needed before "peak" means anything.
    const irpDecline =
      irpPeak > 0 && Number(irp?.months_observed ?? 0) >= 3
        ? Math.round(((irpRecent - irpPeak) / irpPeak) * 100)
        : null;

    const h3Status = gradeAgainstClaim(irpDecline, -75);
    const h3Notes =
      irpDecline !== null
        ? `IRP downtown campsite reports: peak ${irpPeak} in a complete month, ` +
          `${irpRecent} in the 30 days ending ${irp.as_of} — a ${irpDecline}% change. ` +
          `Wilson claimed -75%. Caveat: IRP data begins Jan 2025, so this peak may be later ` +
          `and lower than the baseline the claim was measured against.`
        : `Insufficient data: fewer than 3 complete months of downtown IRP campsite reports, so no peak-to-recent change can be computed.`;

    await record(
      "WILSON-SOTC-2026-H3",
      h3Status,
      irpDecline,
      h3Notes,
      "auto:homelessness.irp_campsite_reports",
    );

    // ── Permit processing (E4: speeded permitting) ───────────────────
    //
    // Measured by APPLICATION cohort, not issue date. Each cohort is closed at
    // least 90 days before the freshest application in the table, so every
    // permit in it has had the full 90 days to be issued and the two shares
    // are directly comparable. Grouping by issue date instead would count only
    // permits that already finished and would show an improvement even if
    // nothing changed. See KNOWN_ISSUES.md, "Permit Processing Times".
    const [permits] = (await sql`
      WITH bounds AS (
        SELECT MAX(application_date) AS as_of FROM housing.permits
      ),
      cohort AS (
        SELECT
          p.application_date,
          (p.issued_date IS NOT NULL
            AND p.issued_date - p.application_date <= 90) AS issued_within_90
        FROM housing.permits p, bounds b
        WHERE p.application_date IS NOT NULL
          AND p.application_date <= b.as_of - INTERVAL '90 days'
          AND (p.issued_date IS NULL OR p.issued_date >= p.application_date)
      )
      SELECT
        (SELECT as_of::text FROM bounds)                                   AS as_of,
        COUNT(*) FILTER (
          WHERE application_date >= '2023-01-01' AND application_date < '2024-01-01'
        )::int                                                             AS baseline_n,
        COUNT(*) FILTER (
          WHERE application_date >= '2023-01-01' AND application_date < '2024-01-01'
            AND issued_within_90
        )::int                                                             AS baseline_hit,
        COUNT(*) FILTER (
          WHERE application_date >= (SELECT as_of FROM bounds) - INTERVAL '15 months'
        )::int                                                             AS recent_n,
        COUNT(*) FILTER (
          WHERE application_date >= (SELECT as_of FROM bounds) - INTERVAL '15 months'
            AND issued_within_90
        )::int                                                             AS recent_hit
      FROM cohort
    `) as unknown as {
      as_of: string | null;
      baseline_n: number;
      baseline_hit: number;
      recent_n: number;
      recent_hit: number;
    }[];

    const MIN_COHORT = 30;
    const baselineN = Number(permits?.baseline_n ?? 0);
    const recentN = Number(permits?.recent_n ?? 0);

    if (baselineN < MIN_COHORT || recentN < MIN_COHORT) {
      await record(
        "WILSON-SOTC-2026-E4",
        "in_progress",
        null,
        `Insufficient data: application cohorts too small to compare ` +
          `(2023 baseline: ${baselineN} permits, recent 15 months: ${recentN}; ` +
          `at least ${MIN_COHORT} each are needed).`,
        "auto:housing.permits",
      );
    } else {
      const baselinePct =
        Math.round((Number(permits.baseline_hit) / baselineN) * 1000) / 10;
      const recentPct =
        Math.round((Number(permits.recent_hit) / recentN) * 1000) / 10;
      const deltaPts = Math.round((recentPct - baselinePct) * 10) / 10;

      // A swing of under 2 percentage points is treated as no measurable
      // change rather than a win in either direction.
      let e4Status: VerificationStatus;
      let e4Verdict: string;
      if (deltaPts >= 2) {
        e4Status = "verified";
        e4Verdict = "A larger share of applications now clears 90 days, so permitting has sped up.";
      } else if (deltaPts <= -2) {
        e4Status = "contradicted";
        e4Verdict = "A smaller share of applications now clears 90 days, contradicting the claim.";
      } else {
        e4Status = "partially_verified";
        e4Verdict = "The two cohorts are within 2 percentage points, so no measurable change either way.";
      }

      await record(
        "WILSON-SOTC-2026-E4",
        e4Status,
        deltaPts,
        `BDS permits issued within 90 days of application, by application cohort: ` +
          `${baselinePct}% of ${baselineN} permits applied for in 2023, versus ` +
          `${recentPct}% of ${recentN} applied for in the 15 months ending ` +
          `${permits.as_of} (cohorts closed 90 days before that date). ${e4Verdict}`,
        "auto:housing.permits",
      );
    }

    // ── Clear caches ─────────────────────────────────────────────────
    await sql`
      DELETE FROM public.dashboard_cache
      WHERE question LIKE 'accountability%'
    `;

    // ── Summary ──────────────────────────────────────────────────────
    const summary = await sql`
      SELECT verification_status, COUNT(*)::int AS cnt
      FROM accountability.promises GROUP BY 1 ORDER BY cnt DESC
    `;

    const inconclusive = results.filter((r) => r.status === "in_progress").length;
    console.log(
      `[verify-promises] Updated ${results.length} claims ` +
        `(${inconclusive} inconclusive) in ${Date.now() - t0}ms`,
    );

    return NextResponse.json({
      ok: true,
      ms: Date.now() - t0,
      updated: results.length,
      inconclusive,
      results,
      summary: Object.fromEntries(summary.map((r) => [r.verification_status, r.cnt])),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[verify-promises] FATAL: ${message}`);
    return NextResponse.json(
      { ok: false, error: message, ms: Date.now() - t0 },
      { status: 500 },
    );
  }
}
