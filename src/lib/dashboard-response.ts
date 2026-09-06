import { deriveDataThrough } from "@/lib/data-freshness";

/**
 * Stamp a dashboard payload with honest freshness fields.
 *
 * Two different questions get two different answers, because conflating them
 * is how a chart whose newest point is eight months old ends up labelled with
 * today's date:
 *
 *   generatedAt — when this response was computed. Always now.
 *   dataThrough — the newest period actually present in chartData, or null
 *                 when the dates are not parseable as periods.
 *
 * `lastUpdated` is left alone. It predates both fields and consumers read it,
 * so it stays as the response-generation date it has always been; UI that
 * wants freshness reads dataThrough (or deriveDataAsOf, for a human label).
 */
export function withFreshness<T extends { chartData?: { date: string }[] }>(
  payload: T,
): T & { generatedAt: string; dataThrough: string | null } {
  return {
    ...payload,
    generatedAt: new Date().toISOString().slice(0, 10),
    dataThrough: deriveDataThrough(payload.chartData),
  };
}
