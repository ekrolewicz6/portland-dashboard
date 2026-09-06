import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Checkout sessions per IP per hour. Nobody donates ten times in an hour. */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const checkoutSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Minimum support amount is $1")
    .max(10000, "Maximum online support amount is $10,000"),
  frequency: z.enum(["monthly", "once"]),
});

/**
 * Origin for Stripe's success and cancel URLs.
 *
 * Prefers the configured value. The request-derived fallback comes from the
 * Host header, which a proxy can forward unchanged from the client, so it is
 * only acceptable in local development — in production a spoofed Host would
 * put an attacker's origin into the URL a donor is returned to after paying.
 */
function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be set in production; refusing to build Stripe redirect URLs from the Host header.",
    );
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  if (!checkRateLimit(`donate-checkout:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe support payments are not fully configured. Add STRIPE_SECRET_KEY on the server.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid support request." },
      { status: 400 },
    );
  }

  const { amount, frequency } = parsed.data;
  const unitAmount = Math.round(amount * 100);
  const baseUrl = getBaseUrl(request);
  const isMonthly = frequency === "monthly";

  // Stripe can fail for reasons outside our control (network, API outage, a
  // declined key). Uncaught, that surfaced as a generic framework 500 with no
  // JSON body, so the donate form had nothing to show the donor.
  let session;
  try {
    session = await stripe.checkout.sessions.create({
    mode: isMonthly ? "subscription" : "payment",
    submit_type: isMonthly ? undefined : "pay",
    billing_address_collection: "auto",
    allow_promotion_codes: false,
    customer_creation: isMonthly ? undefined : "if_required",
    success_url: `${baseUrl}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/donate?canceled=true`,
    metadata: {
      product: "portland_civic_lab_donation",
      frequency,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: isMonthly
              ? "Monthly support for Portland Civic Lab"
              : "One-time support for Portland Civic Lab",
            description:
              "Supports public dashboards, civic measurement, and practical tools for Portland.",
          },
          ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
        },
      },
    ],
    });
  } catch (error) {
    console.error("[donate/checkout] Stripe session creation failed:", error);
    return NextResponse.json(
      { error: "Could not start checkout just now. Please try again in a moment." },
      { status: 502 },
    );
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a Checkout URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
