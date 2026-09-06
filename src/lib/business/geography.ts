import "server-only";

import tifData from "@/data/business/tif-districts.json";
import districtData from "@/data/business/business-districts.json";

/**
 * Address → the grant-eligibility geography a business owner cannot look up.
 *
 * Portland's highest-value small-business programmes are gated on invisible
 * boundaries. Sitting inside a tax-increment district decides access to
 * matching grants worth up to $75,000. Whether your business district
 * association is a Venture Portland member decides whether district grant money
 * can reach your block at all. Nobody knows which side of those lines they are
 * on, and the lines appear on no map a shop owner would think to consult.
 *
 * Two design decisions worth keeping:
 *
 * 1. Polygons are committed, not queried. The City's open-data ArcGIS endpoint
 *    is bimodal — 0.2s responses interleaved with 60-second waits ending in
 *    503. Only the geocoder is fast and dependable, so that is the only live
 *    call. See ingest/business/fetch-boundaries.ts.
 *
 * 2. Unresolved is a distinct outcome from not-eligible. A layer we could not
 *    check must never quietly read as satisfied — that is exactly how a
 *    plausible benefits list ends up telling a café it might collect $75,000
 *    from a programme its address rules out.
 */

const GEOCODE_URL =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Address_Geocoding_PDX/GeocodeServer/findAddressCandidates";
const TIGER_TRACT_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/6/query";

const GEOCODE_TIMEOUT_MS = 8_000;
const TRACT_TIMEOUT_MS = 6_000;
/** Below this the geocoder is guessing, and a wrong parcel answers the wrong question. */
const MIN_GEOCODE_SCORE = 80;

export interface BusinessDistrict {
  name: string;
  /** Venture Portland grants flow through member associations, not businesses. */
  venturePortlandMember: boolean;
  website: string | null;
}

export interface BusinessGeography {
  resolvedAt: string;
  matchedAddress: string | null;
  location: { lon: number; lat: number } | null;
  inPortland: boolean;
  tifDistrict: string | null;
  businessDistricts: BusinessDistrict[];
  censusTract: string | null;
  /** Layers we could not determine, in plain language. Never treat as satisfied. */
  unresolved: string[];
  /** Why the whole lookup failed, when it did. */
  error: string | null;
}

export const BOUNDARY_PROVENANCE = {
  tif: { label: tifData.label, retrieved: tifData.retrieved, source: tifData.source, count: tifData.features.length },
  districts: {
    label: districtData.label,
    retrieved: districtData.retrieved,
    source: districtData.source,
    count: districtData.features.length,
  },
} as const;

function failed(error: string): BusinessGeography {
  return {
    resolvedAt: new Date().toISOString(),
    matchedAddress: null,
    location: null,
    inPortland: false,
    tifDistrict: null,
    businessDistricts: [],
    censusTract: null,
    unresolved: ["tax increment district", "business district", "census tract"],
    error,
  };
}

// ── point in polygon ────────────────────────────────────────────────

type Ring = number[][];

/**
 * Ray casting. Rings are [outer, ...holes] per GeoJSON, so a point inside a
 * hole is outside the polygon, which matters here because several districts
 * are genuinely doughnut-shaped around excluded parcels.
 */
function inRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(lon: number, lat: number, rings: Ring[]): boolean {
  if (!rings.length || !inRing(lon, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (inRing(lon, lat, rings[i])) return false; // in a hole
  }
  return true;
}

interface StoredFeature {
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

function containing(features: StoredFeature[], lon: number, lat: number): StoredFeature[] {
  return features.filter((f) => {
    const g = f.geometry;
    if (!g) return false;
    if (g.type === "Polygon") return inPolygon(lon, lat, g.coordinates as Ring[]);
    if (g.type === "MultiPolygon") {
      return (g.coordinates as Ring[][]).some((poly) => inPolygon(lon, lat, poly));
    }
    return false;
  });
}

// ── lookup ──────────────────────────────────────────────────────────

interface GeocodeCandidate {
  address?: string;
  score?: number;
  location?: { x: number; y: number };
}

async function geocode(address: string): Promise<GeocodeCandidate | null> {
  const url = new URL(GEOCODE_URL);
  Object.entries({
    Address: address,
    f: "json",
    outFields: "*",
    maxLocations: "1",
    outSR: "4326",
  }).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`geocoder returned ${res.status}`);
  const data = (await res.json()) as { candidates?: GeocodeCandidate[] };
  const c = data.candidates?.[0];
  if (!c?.location || (c.score ?? 0) < MIN_GEOCODE_SCORE) return null;
  return c;
}

async function censusTract(lon: number, lat: number): Promise<string | null> {
  const url = new URL(TIGER_TRACT_URL);
  Object.entries({
    geometry: JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "4326",
    outFields: "GEOID",
    returnGeometry: "false",
    f: "json",
  }).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TRACT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`tract service returned ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{ attributes?: { GEOID?: unknown } }>;
    error?: unknown;
  };
  if (data.error) throw new Error("tract query error");
  const geoid = data.features?.[0]?.attributes?.GEOID;
  return typeof geoid === "string" && geoid.trim() ? geoid.trim() : null;
}

/**
 * Cheap sanity check before spending a network round trip. The geocoder does
 * not fail fast on nonsense, it holds the connection until the timeout, so
 * without this, a typo costs the user eight seconds of blank screen.
 */
function looksLikeStreetAddress(s: string): boolean {
  return /\d/.test(s) && /[a-z]{2,}/i.test(s) && s.length >= 6;
}

export async function resolveBusinessGeography(address: string): Promise<BusinessGeography> {
  const trimmed = address.trim();
  if (!trimmed) return failed("No address provided.");
  if (!looksLikeStreetAddress(trimmed)) {
    return failed("That doesn't look like a street address. Try something like 1755 SW Jefferson St.");
  }

  let candidate: GeocodeCandidate | null;
  try {
    candidate = await geocode(trimmed);
  } catch {
    return failed("The city address service did not respond. Try again in a moment.");
  }
  if (!candidate?.location) {
    return failed(
      "We could not match that to a Portland address. Check the spelling, or try without the suite number.",
    );
  }

  const lon = candidate.location.x;
  const lat = candidate.location.y;
  const unresolved: string[] = [];

  const tifHits = containing(tifData.features as StoredFeature[], lon, lat);
  const districtHits = containing(districtData.features as StoredFeature[], lon, lat);

  let tract: string | null = null;
  try {
    tract = await censusTract(lon, lat);
  } catch {
    unresolved.push("census tract");
  }

  return {
    resolvedAt: new Date().toISOString(),
    matchedAddress: typeof candidate.address === "string" ? candidate.address : trimmed,
    location: { lon, lat },
    // The geocoder only covers Portland, so a confident match implies the city.
    inPortland: true,
    tifDistrict: (tifHits[0]?.properties.name as string | undefined) ?? null,
    businessDistricts: districtHits.map((f) => ({
      name: String(f.properties.name),
      venturePortlandMember: Boolean(f.properties.member),
      website: (f.properties.website as string | null) ?? null,
    })),
    censusTract: tract,
    unresolved,
    error: null,
  };
}
