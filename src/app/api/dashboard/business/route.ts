import { NextResponse } from "next/server";
import { businessData } from "@/lib/mock-data";
import type { BusinessData, ChartPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * CivicApps Business Licenses API:
 *   http://api.civicapps.org/business-licenses/
 *   No auth required. Paginate via `page` param.
 */

const CIVICAPPS_BASE = "http://api.civicapps.org/business-licenses/";
const TIMEOUT_MS = 10_000;

interface CivicAppsLicense {
  BusinessName?: string;
  BusinessType?: string;
  NAICSCode?: string;
  NAICSDescription?: string;
  Neighborhood?: string;
  LicenseDate?: string; // ISO date string
  Status?: string;
  [key: string]: unknown;
}

interface CivicAppsResponse {
  results: CivicAppsLicense[];
  total?: number;
  page?: number;
  pages?: number;
  error?: string;
}

async function fetchCivicAppsPage(page: number): Promise<CivicAppsResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${CIVICAPPS_BASE}?page=${page}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`CivicApps HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllLicenses(maxPages = 5): Promise<CivicAppsLicense[]> {
  const all: CivicAppsLicense[] = [];
  let page = 1;

  while (page <= maxPages) {
    const data = await fetchCivicAppsPage(page);
    if (data.error || !data.results || data.results.length === 0) break;
    all.push(...data.results);
    if (!data.pages || page >= data.pages) break;
    page++;
  }

  return all;
}

function toYearMonth(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse<BusinessData>> {
  try {
    const licenses = await fetchAllLicenses(5);

    if (licenses.length === 0) {
      // If CivicApps returns no data, fall back to mock
      console.warn("[business] CivicApps returned 0 licenses, using mock data");
      return NextResponse.json(businessData);
    }

    // Monthly new registrations
    const monthlyMap = new Map<string, number>();
    const neighborhoodMap = new Map<string, number>();
    const sectorMap = new Map<string, number>();

    for (const lic of licenses) {
      const month = lic.LicenseDate ? toYearMonth(lic.LicenseDate) : null;
      if (month) {
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
      }

      const hood = lic.Neighborhood ?? "Unknown";
      neighborhoodMap.set(hood, (neighborhoodMap.get(hood) ?? 0) + 1);

      const sector = lic.NAICSDescription ?? lic.BusinessType ?? "Other";
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + 1);
    }

    const sortedMonths = [...monthlyMap.keys()].sort();

    const newRegistrations: ChartPoint[] = sortedMonths.map((date) => ({
      date,
      value: monthlyMap.get(date)!,
      label: "New registrations",
    }));

    const totalNew = licenses.length;

    const result: BusinessData = {
      headline: `${totalNew.toLocaleString()} business licenses from CivicApps`,
      headlineValue: totalNew,
      trend: businessData.trend, // keep mock trend until we compute YoY
      chartData: newRegistrations.map(({ date, value }) => ({ date, value })),
      newRegistrations,
      cancelledRegistrations: businessData.cancelledRegistrations, // not available from CivicApps
      civicAppsLicenses: newRegistrations,
      source: "CivicApps Business Licenses API",
      lastUpdated: new Date().toISOString().slice(0, 10),
      insights: [
        `${totalNew} business licenses retrieved from CivicApps.`,
        `Top neighborhoods: ${[...neighborhoodMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([n, c]) => `${n} (${c})`)
          .join(", ")}.`,
        `Top sectors: ${[...sectorMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([s, c]) => `${s} (${c})`)
          .join(", ")}.`,
        "Cancellation data not available from CivicApps — using mock values.",
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[business] CivicApps query failed, returning mock data:", error);
    return NextResponse.json(businessData);
  }
}
