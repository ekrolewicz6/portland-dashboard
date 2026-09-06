import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank you — Portland Civic Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PaymentState = "paid" | "pending" | "unknown";

/**
 * Confirm the checkout session with Stripe before thanking anyone.
 *
 * The session id arrives in the query string, so on its own it is a claim,
 * not evidence — this page used to say "Support received" to anyone who
 * opened its URL. Asking Stripe turns the claim into a fact. A lookup failure
 * is reported as unknown rather than as success, because the donor's receipt
 * from Stripe is the authority either way.
 */
async function resolvePaymentState(sessionId: string | undefined): Promise<PaymentState> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!sessionId || !secretKey) return "unknown";

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") return "paid";
    if (session.payment_status === "unpaid" && session.status === "open") return "pending";
    return session.status === "complete" ? "pending" : "unknown";
  } catch {
    return "unknown";
  }
}

export default async function DonateThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const state = await resolvePaymentState(sessionId);

  const heading =
    state === "paid"
      ? "Thank you for backing the work."
      : state === "pending"
        ? "Thank you — your payment is still settling."
        : "Thanks for stopping by the support page.";

  const eyebrow =
    state === "paid"
      ? "Support received"
      : state === "pending"
        ? "Payment processing"
        : "Support";

  const body =
    state === "paid"
      ? "Your support helps keep Portland Civic Lab useful, independent, and current. Stripe will send the payment receipt to the email used at checkout."
      : state === "pending"
        ? "Some payment methods take a little while to clear. Stripe will email a receipt to the address used at checkout once it does; nothing more is needed from you."
        : "We could not confirm a completed payment for this visit. If you have just donated, your Stripe receipt is the authoritative confirmation — check the email used at checkout. If something looks wrong, get in touch and we will sort it out.";

  return (
    <main className="bg-[var(--color-paper)]">
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{
            backgroundColor:
              state === "paid" ? "var(--color-canopy)" : "var(--color-ink-muted)",
          }}
        >
          {state === "paid" ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : (
            <Clock className="h-8 w-8" />
          )}
        </div>
        <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-editorial text-[48px] leading-none text-[var(--color-ink)] sm:text-[72px]">
          {heading}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)]">
          {body}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white"
          >
            Explore the dashboards
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--color-parchment)] bg-white px-5 py-3 text-[15px] font-semibold text-[var(--color-ink)]"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
