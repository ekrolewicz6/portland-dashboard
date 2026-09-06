import { NextRequest, NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "accountability_promises";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const VERIFICATION_STATUSES = [
  "verified",
  "partially_verified",
  "in_progress",
  "unverifiable",
  "contradicted",
] as const;

const CATEGORIES = [
  "homelessness",
  "safety",
  "economy",
  "budget",
  "infrastructure",
] as const;

interface PromiseRow {
  /** Last time the verification cron wrote this row. Drives freshness. */
  updated_at: string | null;
  promise_id: number;
  speaker: string;
  speech: string;
  speech_date: string;
  category: string;
  claim_text: string;
  is_direct_quote: boolean;
  claim_type: string;
  verification_status: string;
  verification_notes: string | null;
  verified_by: string | null;
  metric_target: string | null;
  metric_actual: string | null;
  metric_unit: string | null;
  metric_direction: string | null;
  baseline_value: string | null;
  baseline_date: string | null;
  target_date: string | null;
  data_source_table: string | null;
  data_source_query: string | null;
  data_source_name: string | null;
  data_needed: string | null;
  display_order: number;
}

function toResponse(row: PromiseRow) {
  return {
    promiseId: row.promise_id,
    speaker: row.speaker,
    speech: row.speech,
    speechDate: row.speech_date,
    category: row.category,
    claimText: row.claim_text,
    isDirectQuote: row.is_direct_quote,
    claimType: row.claim_type,
    verificationStatus: row.verification_status,
    verificationNotes: row.verification_notes,
    verifiedBy: row.verified_by,
    metricTarget: row.metric_target,
    metricActual: row.metric_actual,
    metricUnit: row.metric_unit,
    metricDirection: row.metric_direction,
    baselineValue: row.baseline_value,
    baselineDate: row.baseline_date,
    targetDate: row.target_date,
    dataSourceTable: row.data_source_table,
    dataSourceQuery: row.data_source_query,
    dataSourceName: row.data_source_name,
    dataNeeded: row.data_needed,
    displayOrder: row.display_order,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get("category");
  const statusFilter = searchParams.get("status");

  // One cache key, always.
  //
  // The key used to embed the raw filter strings, so every distinct value a
  // caller sent wrote another dashboard_cache row carrying the full payload —
  // an unbounded table, writable by anyone with a query string. Filtering
  // happens in memory below anyway, over a single unfiltered query, so the
  // per-filter keys bought nothing.
  const cacheKey = CACHE_KEY;

  try {
    // The cache holds the unfiltered row set, not a rendered response, so a
    // hit can still serve any filter combination.
    const cached = await getCachedData<{ rows: PromiseRow[] }>(
      cacheKey,
      CACHE_TTL,
    );

    const rows = cached?.rows ?? ((await sql`
      SELECT
        promise_id,
        speaker,
        speech,
        speech_date,
        category,
        claim_text,
        is_direct_quote,
        claim_type,
        verification_status,
        verification_notes,
        verified_by,
        metric_target,
        metric_actual,
        metric_unit,
        metric_direction,
        baseline_value,
        baseline_date,
        target_date,
        data_source_table,
        data_source_query,
        data_source_name,
        data_needed,
        display_order,
        updated_at::text AS updated_at
      FROM accountability.promises
      ORDER BY display_order
    `) as unknown as PromiseRow[]);

    if (!cached) {
      await setCachedData(cacheKey, { rows });
    }

    // Filters are applied after caching, so they never reach the cache key.
    let filtered = rows;
    if (categoryFilter) {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(
        (r) => r.verification_status === statusFilter,
      );
    }

    const promises = filtered.map(toResponse);

    // Summary: counts by verification status
    const summary: Record<string, number> = {};
    for (const status of VERIFICATION_STATUSES) {
      summary[status] = filtered.filter(
        (r) => r.verification_status === status,
      ).length;
    }

    // By category: counts per category
    const byCategory: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      byCategory[cat] = filtered.filter((r) => r.category === cat).length;
    }

    // Freshness is the newest verification this job recorded, not the moment
    // the request was served — those differ by however long the verification
    // cron has been failing.
    const lastVerified = rows
      .map((r) => r.updated_at)
      .filter((d): d is string => typeof d === "string" && d.length > 0)
      .sort()
      .at(-1);

    const payload = {
      promises,
      summary,
      byCategory,
      source: "2026 State of the City Address \u00b7 Mayor Keith Wilson",
      lastUpdated: lastVerified ? lastVerified.slice(0, 10) : null,
      dataStatus: "available" as const,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[accountability/promises] DB query failed:", error);
    return NextResponse.json({
      promises: [],
      summary: {},
      byCategory: {},
      source: "2026 State of the City Address \u00b7 Mayor Keith Wilson",
      lastUpdated: new Date().toISOString().slice(0, 10),
      dataStatus: "unavailable" as const,
    });
  }
}
