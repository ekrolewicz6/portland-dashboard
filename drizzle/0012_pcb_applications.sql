-- Portland Civic Bank application storage.
--
-- The route previously pushed submissions into a module-level array. On
-- Vercel each Lambda instance holds its own copy and loses it when the
-- instance recycles, so applications acknowledged with "we'll respond within
-- 5 business days" were discarded within minutes. This table gives them
-- somewhere to live.
--
-- Applications contain personal data (owner names, email, phone). Keep access
-- to this table restricted, and treat the retention policy on /privacy as
-- binding.

CREATE TABLE IF NOT EXISTS "pcb_applications" (
  "id" text PRIMARY KEY,
  "submitted_at" timestamptz NOT NULL DEFAULT now(),
  "business_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "entity_type" text NOT NULL,
  "sector" text NOT NULL,
  "num_employees" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "client_ip" text,
  "user_agent" text,
  -- Full validated payload, so adding a question to the form does not require
  -- a migration before submissions can be accepted.
  "payload" jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS "pcb_applications_submitted_at_idx"
  ON "pcb_applications" ("submitted_at" DESC);

CREATE INDEX IF NOT EXISTS "pcb_applications_status_idx"
  ON "pcb_applications" ("status");
