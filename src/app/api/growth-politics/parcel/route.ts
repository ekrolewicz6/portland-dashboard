import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  lookupParcel,
  normalizeHouseholdIncomeBand,
  normalizeRelationship,
  parseCurrencyInput,
  type ParcelLookupResponse,
} from "@/lib/growth-politics/parcel-lookup";

export const dynamic = "force-dynamic";

/**
 * Lookups per IP per minute.
 *
 * One lookup fans out to a geocoder, two ArcGIS queries and a TaxGraph scrape.
 * Without a limit this route is an amplifier: a few requests per second here
 * become a sustained load on PortlandMaps and Multnomah County, arriving from
 * our IP with our name on it.
 */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: Request): Promise<NextResponse<ParcelLookupResponse>> {
  if (!checkRateLimit(`parcel:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { ok: false, error: "Too many lookups. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim() ?? "";
  const assessedValue = parseCurrencyInput(searchParams.get("assessedValue"));
  const monthlyRent = parseCurrencyInput(searchParams.get("monthlyRent"));
  const relationship = normalizeRelationship(searchParams.get("relationship"));
  const householdIncomeBand = normalizeHouseholdIncomeBand(searchParams.get("householdIncomeBand"));

  if (!address) {
    return NextResponse.json({ ok: false, error: "Enter an address first." }, { status: 400 });
  }

  try {
    const lookup = await lookupParcel({ address, assessedValue, relationship, monthlyRent, householdIncomeBand });
    return NextResponse.json({ ok: true, lookup });
  } catch (error) {
    // Upstream messages name the services we call and quote their raw status
    // text. That is useful in logs and noise to the visitor, who can act on
    // exactly one thing: try again.
    console.error("[growth-politics/parcel] lookup failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not look up that address right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}
