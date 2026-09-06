import Stripe from "stripe";
import { NextResponse } from "next/server";
import sql from "@/lib/db-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook.
 *
 * Without this, Stripe was the only place that knew a donation had happened:
 * nothing here recorded a completed checkout, a started subscription, or a
 * recurring gift that later failed, so reconciliation was manual and the
 * thank-you page congratulated anyone who visited its URL.
 *
 * Every request is verified against STRIPE_WEBHOOK_SECRET before it is
 * trusted. The raw body is required for that check, which is why this route
 * reads request.text() rather than request.json().
 *
 * Writes are keyed on the checkout session id and are upserts, so Stripe's
 * at-least-once delivery cannot double-count a gift.
 */

/** Events we act on. Everything else is acknowledged and ignored. */
const HANDLED_EVENTS = new Set<string>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "invoice.payment_failed",
]);

function statusForEvent(type: string, session: Stripe.Checkout.Session): string {
  switch (type) {
    case "checkout.session.completed":
      // A completed session is not necessarily a captured payment: delayed
      // methods settle later and arrive as async_payment_succeeded.
      return session.payment_status === "paid" ? "paid" : "pending";
    case "checkout.session.async_payment_succeeded":
      return "paid";
    case "checkout.session.async_payment_failed":
      return "failed";
    case "checkout.session.expired":
      return "expired";
    default:
      return "pending";
  }
}

async function recordSession(
  session: Stripe.Checkout.Session,
  status: string,
): Promise<void> {
  const amountCents = session.amount_total ?? 0;
  const frequency =
    typeof session.metadata?.frequency === "string"
      ? session.metadata.frequency
      : session.mode === "subscription"
        ? "monthly"
        : "once";

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await sql`
    INSERT INTO donations (
      stripe_session_id, stripe_customer_id, stripe_subscription_id,
      stripe_payment_intent_id, amount_cents, currency, frequency, status, email
    ) VALUES (
      ${session.id},
      ${customerId},
      ${subscriptionId},
      ${paymentIntentId},
      ${amountCents},
      ${session.currency ?? "usd"},
      ${frequency},
      ${status},
      ${session.customer_details?.email ?? null}
    )
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      stripe_customer_id       = COALESCE(EXCLUDED.stripe_customer_id, donations.stripe_customer_id),
      stripe_subscription_id   = COALESCE(EXCLUDED.stripe_subscription_id, donations.stripe_subscription_id),
      stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, donations.stripe_payment_intent_id),
      amount_cents             = EXCLUDED.amount_cents,
      status                   = EXCLUDED.status,
      email                    = COALESCE(EXCLUDED.email, donations.email),
      updated_at               = now()
  `;
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  // Fail closed. An unverified webhook endpoint is an open write API for
  // anyone who knows the URL.
  if (!secretKey || !webhookSecret) {
    console.error(
      "[donate/webhook] STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must both be set; rejecting.",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // Do not log the body: it is unverified and attacker-controlled.
    console.error(
      "[donate/webhook] signature verification failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, handled: false });
  }

  try {
    if (event.type === "invoice.payment_failed") {
      // A recurring gift that stopped collecting. Mark the originating
      // subscription's row so it is not still counted as active support.
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
      if (subscriptionId) {
        await sql`
          UPDATE donations
          SET status = 'payment_failed', updated_at = now()
          WHERE stripe_subscription_id = ${subscriptionId}
        `;
      }
    } else {
      const session = event.data.object as Stripe.Checkout.Session;
      await recordSession(session, statusForEvent(event.type, session));
    }
  } catch (error) {
    // Return 5xx so Stripe retries. Acknowledging an event we failed to
    // record would lose the donation from our side permanently.
    console.error(`[donate/webhook] failed to record ${event.type}:`, error);
    return NextResponse.json({ error: "record_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: true });
}
