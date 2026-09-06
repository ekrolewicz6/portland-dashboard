-- Donation records.
--
-- Stripe was the only record that a donation happened: there was no webhook,
-- so nothing on this side knew a payment had succeeded, a subscription had
-- started, or a recurring gift had later failed. That makes reconciliation
-- manual and makes "how much did we raise" unanswerable without logging into
-- Stripe.
--
-- Rows are written by the Stripe webhook, never by the browser. The checkout
-- session id is the natural key, so a redelivered webhook event updates the
-- existing row instead of double-counting the gift.
--
-- Deliberately minimal on personal data: Stripe holds the payment details and
-- the billing address. This table keeps the email needed to answer "did my
-- donation go through" and nothing else.

CREATE TABLE IF NOT EXISTS "donations" (
  "id" bigserial PRIMARY KEY,
  "stripe_session_id" text NOT NULL UNIQUE,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "stripe_payment_intent_id" text,
  "amount_cents" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'usd',
  "frequency" text NOT NULL,
  "status" text NOT NULL,
  "email" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "donations_created_at_idx"
  ON "donations" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "donations_status_idx"
  ON "donations" ("status");

CREATE INDEX IF NOT EXISTS "donations_subscription_idx"
  ON "donations" ("stripe_subscription_id")
  WHERE "stripe_subscription_id" IS NOT NULL;
