-- Per-business claim authorization.
--
-- Claiming a pre-researched business attaches the claimer as owner, exposes
-- that business's funding pipeline to them, and has no self-service undo.
-- Authorization previously rested on the claim URL being unguessable, but
-- slugs are derived from business names, so any signed-in member could
-- enumerate them and claim a business they have nothing to do with.
--
-- claim_email records the address Civic Lab verified as the owner's during
-- outreach. A claim succeeds only when the claiming member's verified sign-in
-- email matches it (or the address is listed in BUSINESS_CLAIM_EMAILS, the
-- environment-level allowlist used while onboarding).
--
-- claimed_by_member_id / claimed_at record who claimed and when, so a
-- mistaken claim can be traced and reversed by an admin.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS claim_email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS claimed_by_member_id INTEGER;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Case-insensitive lookups: the guard compares lower(claim_email).
CREATE INDEX IF NOT EXISTS idx_businesses_claim_email
  ON businesses (lower(claim_email))
  WHERE claim_email IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'businesses_claimed_by_member_id_fkey'
      AND table_name = 'businesses'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_claimed_by_member_id_fkey
      FOREIGN KEY (claimed_by_member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;
