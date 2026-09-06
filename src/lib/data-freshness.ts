/**
 * Derive an honest "data through" label from a topic's chart data.
 *
 * Dashboard APIs historically reported `lastUpdated: today`, which told
 * users week-old data was fresh. Instead of trusting a timestamp, we read
 * the latest period present in the data itself, preserving the source's
 * granularity (month, quarter, year, school year).
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ParsedPoint {
  /** Comparable ordering key: year * 12 + monthIndex */
  sortKey: number;
  label: string;
}

function plausibleYear(year: number): boolean {
  const now = new Date().getFullYear();
  // Guards against corrupt source dates (e.g. year-2109 permit records).
  return year >= 2000 && year <= now + 1;
}

function parsePoint(raw: string): ParsedPoint | null {
  const s = raw.trim();

  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (!plausibleYear(year) || month < 1 || month > 12) return null;
    return { sortKey: year * 12 + (month - 1), label: `${MONTHS[month - 1]} ${year}` };
  }

  // YYYY-MM
  m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) {
      if (!plausibleYear(year)) return null;
      return { sortKey: year * 12 + (month - 1), label: `${MONTHS[month - 1]} ${year}` };
    }
    // Falls through: "2025-26" style school years match this shape too when
    // the second part is > 12.
  }

  // School year: YYYY-YY (e.g. 2025-26)
  m = s.match(/^(\d{4})-(\d{2})$/);
  if (m && Number(m[2]) > 12) {
    const startYear = Number(m[1]);
    if (!plausibleYear(startYear)) return null;
    // A school year ending in June of startYear+1
    return {
      sortKey: (startYear + 1) * 12 + 5,
      label: `the ${m[1]}–${m[2]} school year`,
    };
  }

  // Quarters: "YYYY QN" or "QN YYYY"
  m = s.match(/^(\d{4})\s+Q([1-4])$/i) ?? s.match(/^Q([1-4])\s+(\d{4})$/i);
  if (m) {
    const [year, quarter] = /^\d{4}/.test(m[1])
      ? [Number(m[1]), Number(m[2])]
      : [Number(m[2]), Number(m[1])];
    if (!plausibleYear(year)) return null;
    return { sortKey: year * 12 + (quarter * 3 - 1), label: `Q${quarter} ${year}` };
  }

  // Bare year
  m = s.match(/^(\d{4})$/);
  if (m) {
    const year = Number(m[1]);
    if (!plausibleYear(year)) return null;
    return { sortKey: year * 12 + 11, label: String(year) };
  }

  return null;
}

/**
 * Returns a human label for the most recent period in the chart data
 * (e.g. "April 2026", "Q3 2025", "the 2025–26 school year"), or null when
 * the dates aren't parseable as time periods.
 */
export function deriveDataAsOf(
  chartData?: { date: string }[] | null
): string | null {
  if (!chartData?.length) return null;
  let best: ParsedPoint | null = null;
  for (const point of chartData) {
    const parsed = parsePoint(point.date);
    if (parsed && (!best || parsed.sortKey > best.sortKey)) best = parsed;
  }
  return best?.label ?? null;
}

/**
 * The most recent period in the chart data as a sortable ISO prefix
 * ("2026-04", or "2026" when only the year is known), or null when the dates
 * are not parseable as periods.
 *
 * Pairs with deriveDataAsOf: that one is for reading, this one is for the API
 * payload, where a machine consumer needs to compare and sort.
 */
export function deriveDataThrough(
  chartData?: { date: string }[] | null
): string | null {
  if (!chartData?.length) return null;
  let best: ParsedPoint | null = null;
  for (const point of chartData) {
    const parsed = parsePoint(point.date);
    if (parsed && (!best || parsed.sortKey > best.sortKey)) best = parsed;
  }
  if (!best) return null;

  const year = Math.floor(best.sortKey / 12);
  const month = (best.sortKey % 12) + 1;
  // A whole-year label carries no month; parsePoint encodes those as January,
  // so only emit a month when the label actually names one.
  const namesMonth = /[A-Za-z]/.test(best.label) && !/^\d{4}$/.test(best.label.trim());
  return namesMonth ? `${year}-${String(month).padStart(2, "0")}` : String(year);
}
