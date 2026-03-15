/**
 * ArcGIS REST API helper for querying Portland Maps FeatureServer / MapServer layers.
 *
 * Base URL: https://www.portlandmaps.com/arcgis/rest/services/
 *
 * Handles pagination (max 4000 records per request), timeouts, and error handling.
 */

const BASE_URL = "https://www.portlandmaps.com/arcgis/rest/services/";
const MAX_RECORD_COUNT = 4000;
const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArcGISFeature<T = Record<string, unknown>> {
  attributes: T;
  geometry?: Record<string, unknown>;
}

export interface ArcGISQueryResponse<T = Record<string, unknown>> {
  features: ArcGISFeature<T>[];
  exceededTransferLimit?: boolean;
  error?: { code: number; message: string; details?: string[] };
}

export interface ArcGISQueryParams {
  where?: string;
  outFields?: string;
  returnGeometry?: boolean;
  resultRecordCount?: number;
  resultOffset?: number;
  orderByFields?: string;
  outStatistics?: string;
  groupByFieldsForStatistics?: string;
  f?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(baseUrl: string, params: ArcGISQueryParams): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Query an ArcGIS FeatureServer layer with automatic pagination.
 *
 * @param serviceUrl  Full URL to the layer query endpoint
 *                    e.g. `https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22/query`
 * @param params      ArcGIS query parameters (where, outFields, etc.)
 * @returns           Array of feature attributes
 */
export async function queryFeatureLayer<T = Record<string, unknown>>(
  serviceUrl: string,
  params: ArcGISQueryParams = {},
): Promise<T[]> {
  const defaults: ArcGISQueryParams = {
    where: "1=1",
    outFields: "*",
    returnGeometry: false,
    resultRecordCount: MAX_RECORD_COUNT,
    f: "json",
  };

  const mergedParams = { ...defaults, ...params };
  const allAttributes: T[] = [];
  let offset = mergedParams.resultOffset ?? 0;

  for (;;) {
    const queryUrl = buildUrl(serviceUrl, { ...mergedParams, resultOffset: offset });
    const res = await fetchWithTimeout(queryUrl);

    if (!res.ok) {
      throw new Error(`ArcGIS request failed: ${res.status} ${res.statusText}`);
    }

    const data: ArcGISQueryResponse<T> = await res.json();

    if (data.error) {
      throw new Error(`ArcGIS error ${data.error.code}: ${data.error.message}`);
    }

    if (data.features && data.features.length > 0) {
      for (const feature of data.features) {
        allAttributes.push(feature.attributes);
      }
    }

    // If we got fewer than the requested count, or exceededTransferLimit is false, we're done
    if (
      !data.exceededTransferLimit ||
      !data.features ||
      data.features.length < (mergedParams.resultRecordCount ?? MAX_RECORD_COUNT)
    ) {
      break;
    }

    offset += data.features.length;
  }

  return allAttributes;
}

/**
 * Query a specific layer in an ArcGIS MapServer.
 *
 * @param servicePath  Relative path from BASE_URL, e.g. "Public/Crime/MapServer"
 * @param layerId      The layer index within the MapServer
 * @param params       ArcGIS query parameters
 * @returns            Array of feature attributes
 */
export async function queryMapServer<T = Record<string, unknown>>(
  servicePath: string,
  layerId: number,
  params: ArcGISQueryParams = {},
): Promise<T[]> {
  const url = `${BASE_URL}${servicePath}/${layerId}/query`;
  return queryFeatureLayer<T>(url, params);
}

/**
 * Query an ArcGIS FeatureServer layer by relative service path.
 *
 * @param servicePath  Relative path from BASE_URL, e.g. "Public/BDS_Permit/FeatureServer/22"
 * @param params       ArcGIS query parameters
 * @returns            Array of feature attributes
 */
export async function queryFeatureService<T = Record<string, unknown>>(
  servicePath: string,
  params: ArcGISQueryParams = {},
): Promise<T[]> {
  const url = `${BASE_URL}${servicePath}/query`;
  return queryFeatureLayer<T>(url, params);
}
