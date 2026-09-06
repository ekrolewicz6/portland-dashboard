import { randomBytes } from "crypto";
import sql from "@/lib/db-query";
import type { GeoPredicate } from "@/lib/business/geo-eligibility";

/**
 * Business funding finder — data access layer.
 *
 * Members register (or claim) a business, add co-owners, and PCL matches the
 * business against the curated funding_opportunities catalog. PCL prepares
 * applications; the owner reviews and submits. Follows the membership.ts
 * pattern: raw sql via db-query, snake_case row shapes surfaced as-is.
 */

export interface Business {
  id: number;
  slug: string;
  name: string;
  legal_name: string | null;
  entity_type: string | null;
  naics_code: string | null;
  description: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  neighborhood: string | null;
  website: string | null;
  year_founded: number | null;
  employee_count: number | null;
  revenue_band: string | null;
  ownership_attributes: string[] | null;
  certifications: string[] | null;
  mission_tags: string[] | null;
  claimed: boolean;
}

export interface BusinessTeamMember {
  member_id: number;
  role: string;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
}

export interface BusinessInvite {
  id: number;
  business_id: number;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at: string;
}

export interface MatchWithOpportunity {
  id: number;
  business_id: number;
  opportunity_id: number;
  fit_score: number | null;
  fit_rationale: string | null;
  status: string;
  status_note: string | null;
  amount_requested: number | null;
  amount_awarded: number | null;
  application_draft: ApplicationDraft | null;
  opportunity_slug: string;
  opportunity_name: string;
  funder: string;
  level: string;
  category: string;
  amount_min: number | null;
  amount_max: number | null;
  value_type: ValueType;
  unit_label: string | null;
  effort_level: number | null;
  success_probability: string | null;
  deadline: string | null;
  rolling: boolean;
  url: string | null;
  opportunity_description: string | null;
  eligibility: OpportunityEligibility | null;
  verification_status: string;
}

export type ValueType = "one_time" | "recurring_annual" | "per_unit";

export const VALUE_TYPE_LABELS: Record<string, string> = {
  one_time: "One-time",
  recurring_annual: "Recurring / year",
  per_unit: "Per unit",
};

export const EFFORT_LABELS: Record<number, string> = {
  1: "An afternoon",
  2: "A few hours",
  3: "A day's work",
  4: "Multi-week",
  5: "Major application",
};

export interface ApplicationDraft {
  questions: { question: string; answer: string; source?: string }[];
}

export interface OpportunityEligibility {
  /**
   * Structured geographic gate. `label` keeps the human-readable string the
   * old free-text field carried; the flags are what the matcher actually
   * evaluates. See src/lib/business/geo-eligibility.ts.
   */
  geography?: GeoPredicate;
  businessTypes?: string[];
  ownershipAttributes?: string[];
  missionTags?: string[];
  maxEmployees?: number;
  notes?: string;
}

export interface MatchSummary {
  matchCount: number;
  /** One-time money plus the first year of every recurring benefit. */
  firstYearMin: number;
  firstYearMax: number;
  /** The part that repeats every year after — the number that compounds. */
  recurringAnnualMin: number;
  recurringAnnualMax: number;
  /**
   * Probability-weighted midpoints — what a business can realistically expect
   * rather than what it would collect by winning every program at the top of
   * every range. This is the number worth putting in front of an owner; the
   * min–max range is the context around it.
   */
  expectedFirstYear: number;
  expectedRecurring: number;
  /** Five-year free cash flow: first year + four more years of recurring. */
  fiveYearMax: number;
  awardedTotal: number;
  /**
   * Loans kept out of the money-found totals — borrowing capacity is not
   * income, and counting it would inflate the headline dishonestly. Shown
   * separately as available capital.
   */
  capitalAccessMax: number;
  byStatus: Record<string, number>;
}

/** Active pipeline statuses, in display order. */
export const MATCH_STATUSES = [
  "identified",
  "qualified",
  "in_prep",
  "ready_for_review",
  "submitted",
  "awarded",
] as const;

export const MATCH_STATUS_LABELS: Record<string, string> = {
  identified: "Identified",
  qualified: "Qualified",
  in_prep: "In prep",
  ready_for_review: "Ready for review",
  submitted: "Submitted",
  awarded: "Awarded",
  declined: "Declined",
  dismissed: "Dismissed",
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Businesses ──────────────────────────────────────────────────────────

export interface NewBusinessInput {
  name: string;
  legalName?: string | null;
  entityType?: string | null;
  naicsCode?: string | null;
  description?: string | null;
  addressStreet?: string | null;
  addressZip?: string | null;
  neighborhood?: string | null;
  website?: string | null;
  yearFounded?: number | null;
  employeeCount?: number | null;
  revenueBand?: string | null;
  ownershipAttributes?: string[];
  missionTags?: string[];
}

/** Create a business and attach the creating member as owner. */
export async function createBusiness(
  input: NewBusinessInput,
  memberId: number
): Promise<Business> {
  const base = slugify(input.name);
  // Suffix on collision so two "Riverside Cafe"s can both register.
  const existing = (await sql`
    SELECT slug FROM businesses WHERE slug LIKE ${base + "%"}
  `) as unknown as { slug: string }[];
  const taken = new Set(existing.map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;

  const rows = (await sql`
    INSERT INTO businesses (
      slug, name, legal_name, entity_type, naics_code, description,
      address_street, address_zip, neighborhood, website, year_founded,
      employee_count, revenue_band, ownership_attributes, mission_tags, claimed
    ) VALUES (
      ${slug}, ${input.name}, ${input.legalName ?? null}, ${input.entityType ?? null},
      ${input.naicsCode ?? null}, ${input.description ?? null},
      ${input.addressStreet ?? null}, ${input.addressZip ?? null},
      ${input.neighborhood ?? null}, ${input.website ?? null},
      ${input.yearFounded ?? null}, ${input.employeeCount ?? null},
      ${input.revenueBand ?? null},
      ${sql.json(input.ownershipAttributes ?? [])},
      ${sql.json(input.missionTags ?? [])},
      true
    )
    RETURNING *
  `) as unknown as Business[];

  await sql`
    INSERT INTO business_members (business_id, member_id, role, title)
    VALUES (${rows[0].id}, ${memberId}, 'owner', 'Owner')
    ON CONFLICT DO NOTHING
  `;

  // Search the catalog immediately — an owner who just filled out a profile
  // should never land on an empty dashboard. Imported lazily to keep the
  // matcher out of modules that only read businesses.
  const { generateMatchesForBusiness } = await import("@/lib/funding/match");
  await generateMatchesForBusiness(rows[0].id);

  return rows[0];
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const rows = (await sql`
    SELECT * FROM businesses WHERE slug = ${slug} LIMIT 1
  `) as unknown as Business[];
  return rows[0] ?? null;
}

/** Businesses the member belongs to, with their role on each. */
export async function getBusinessesForMember(
  memberId: number
): Promise<(Business & { member_role: string })[]> {
  return (await sql`
    SELECT b.*, bm.role AS member_role
    FROM businesses b
    JOIN business_members bm ON bm.business_id = b.id
    WHERE bm.member_id = ${memberId}
    ORDER BY b.name
  `) as unknown as (Business & { member_role: string })[];
}

export async function isBusinessMember(
  businessId: number,
  memberId: number
): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM business_members
    WHERE business_id = ${businessId} AND member_id = ${memberId}
    LIMIT 1
  `;
  return rows.length > 0;
}

/** Why a claim was refused, for the caller to render. */
export type ClaimRefusal = "already_claimed" | "not_authorized" | "not_found";

export type ClaimResult =
  | { ok: true }
  | { ok: false; reason: ClaimRefusal };

/**
 * May this email claim this business?
 *
 * Two ways to qualify: the address Civic Lab recorded as the owner's during
 * outreach (businesses.claim_email), or the environment-level allowlist used
 * while onboarding someone whose sign-in address we did not know in advance.
 * Both comparisons are case-insensitive.
 */
function emailMayClaim(email: string, claimEmail: string | null): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  if (claimEmail && claimEmail.trim().toLowerCase() === normalized) return true;
  return canClaimPreparedBusinesses(normalized);
}

/**
 * Claim a pre-seeded (unclaimed) business: mark it claimed and attach the
 * claiming member as owner.
 *
 * Authorization is enforced HERE rather than in the pages, because there are
 * two entry points (the member page card and the direct /claim/[slug] link)
 * and a check in only one of them is not a check. Claiming is irreversible
 * without an admin, it hands over the business's funding pipeline, and slugs
 * are derived from business names — so an unauthorized member who guesses a
 * slug must not be able to take a business over.
 *
 * The read and both writes run in one transaction so two simultaneous claims
 * cannot both succeed.
 */
export async function claimBusiness(
  businessId: number,
  memberId: number,
  memberEmail: string
): Promise<ClaimResult> {
  // tx.unsafe with bound parameters rather than tagged templates: postgres.js
  // builds TransactionSql with Omit<Sql, ...>, which drops the template call
  // signature, so `tx`...`` does not typecheck. Values are still parameterized.
  return sql.begin(async (tx) => {
    const rows = (await tx.unsafe(
      `SELECT id, claimed, claim_email FROM businesses WHERE id = $1 FOR UPDATE`,
      [businessId],
    )) as unknown as { id: number; claimed: boolean; claim_email: string | null }[];

    const business = rows[0];
    if (!business) return { ok: false as const, reason: "not_found" as const };
    if (business.claimed) return { ok: false as const, reason: "already_claimed" as const };
    if (!emailMayClaim(memberEmail, business.claim_email)) {
      return { ok: false as const, reason: "not_authorized" as const };
    }

    await tx.unsafe(
      `UPDATE businesses
          SET claimed = true,
              claimed_by_member_id = $1,
              claimed_at = now(),
              updated_at = now()
        WHERE id = $2`,
      [memberId, businessId],
    );
    await tx.unsafe(
      `INSERT INTO business_members (business_id, member_id, role, title)
       VALUES ($1, $2, 'owner', 'Owner')
       ON CONFLICT DO NOTHING`,
      [businessId, memberId],
    );
    return { ok: true as const };
  });
}

/**
 * Whether this member could claim this specific business, for deciding what
 * to show before they press the button. Never a substitute for the check
 * inside claimBusiness.
 */
export async function canMemberClaimBusiness(
  businessId: number,
  memberEmail: string
): Promise<boolean> {
  const rows = (await sql`
    SELECT claimed, claim_email FROM businesses WHERE id = ${businessId} LIMIT 1
  `) as unknown as { claimed: boolean; claim_email: string | null }[];
  const business = rows[0];
  if (!business || business.claimed) return false;
  return emailMayClaim(memberEmail, business.claim_email);
}

/**
 * Whether this member should be offered pre-researched businesses to claim.
 *
 * Claiming attaches a member as owner and has no self-service undo, so the
 * "is this your business?" card is shown only to invited owners rather than
 * every signed-in member. Comma-separated env var, same shape as ADMIN_EMAILS
 * in src/lib/membership.ts. Unset means nobody sees claim cards — the safe
 * default. The direct claim link (/member/business/claim/[slug]) still works
 * for an owner whose sign-in email we didn't know in advance.
 */
export function canClaimPreparedBusinesses(email: string): boolean {
  return (process.env.BUSINESS_CLAIM_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

/**
 * Unclaimed businesses this member is actually allowed to claim, shown on the
 * member page.
 *
 * Scoped by email rather than returning every unclaimed row: a member being on
 * the onboarding allowlist is not a reason to show them somebody else's
 * researched business, and each card carries a one-press claim button.
 */
export async function getUnclaimedBusinesses(
  memberEmail: string
): Promise<Business[]> {
  const normalized = memberEmail.trim().toLowerCase();
  if (!normalized) return [];

  // The env allowlist is a blunt onboarding tool; when a member is on it they
  // may claim any unclaimed profile, which is the behaviour it exists for.
  // Otherwise they see only profiles prepared for their own address.
  if (canClaimPreparedBusinesses(normalized)) {
    return (await sql`
      SELECT * FROM businesses WHERE claimed = false ORDER BY name LIMIT 20
    `) as unknown as Business[];
  }

  return (await sql`
    SELECT * FROM businesses
    WHERE claimed = false
      AND lower(claim_email) = ${normalized}
    ORDER BY name LIMIT 20
  `) as unknown as Business[];
}

export async function getBusinessTeam(
  businessId: number
): Promise<BusinessTeamMember[]> {
  return (await sql`
    SELECT bm.member_id, bm.role, bm.title,
           m.first_name, m.last_name, m.email, m.avatar_url
    FROM business_members bm
    JOIN members m ON m.id = bm.member_id
    WHERE bm.business_id = ${businessId}
    ORDER BY bm.created_at
  `) as unknown as BusinessTeamMember[];
}

// ── Invites ─────────────────────────────────────────────────────────────

const INVITE_TTL_DAYS = 14;

export async function createInvite(
  businessId: number,
  email: string,
  role: string,
  invitedByMemberId: number
): Promise<BusinessInvite> {
  const token = randomBytes(24).toString("base64url");
  const rows = (await sql`
    INSERT INTO business_invites (business_id, email, role, token, invited_by_member_id, expires_at)
    VALUES (
      ${businessId}, ${email.toLowerCase()}, ${role}, ${token},
      ${invitedByMemberId}, now() + ${INVITE_TTL_DAYS} * interval '1 day'
    )
    RETURNING *
  `) as unknown as BusinessInvite[];
  return rows[0];
}

export async function getPendingInvites(
  businessId: number
): Promise<BusinessInvite[]> {
  return (await sql`
    SELECT * FROM business_invites
    WHERE business_id = ${businessId} AND status = 'pending'
    ORDER BY created_at DESC
  `) as unknown as BusinessInvite[];
}

export interface InviteWithBusiness extends BusinessInvite {
  business_slug: string;
  business_name: string;
}

export async function getInviteByToken(
  token: string
): Promise<InviteWithBusiness | null> {
  const rows = (await sql`
    SELECT i.*, b.slug AS business_slug, b.name AS business_name
    FROM business_invites i
    JOIN businesses b ON b.id = i.business_id
    WHERE i.token = ${token}
      AND i.status = 'pending'
      AND (i.expires_at IS NULL OR i.expires_at > now())
    LIMIT 1
  `) as unknown as InviteWithBusiness[];
  return rows[0] ?? null;
}

/**
 * Accept an invite: attach the signed-in member and consume the token.
 *
 * The invite is bound to the address it was sent to. Without that check the
 * token alone confers co-ownership, so anyone who saw the link — a forwarded
 * mail, a shared inbox, a leaked referrer — could join the business instead
 * of the person who was invited. Returns null when the token is unknown,
 * expired, or addressed to someone else; the caller cannot distinguish these,
 * which is deliberate.
 */
export async function acceptInvite(
  token: string,
  memberId: number,
  memberEmail: string
): Promise<InviteWithBusiness | null> {
  const invite = await getInviteByToken(token);
  if (!invite) return null;

  const invitedTo = invite.email.trim().toLowerCase();
  if (!invitedTo || invitedTo !== memberEmail.trim().toLowerCase()) return null;

  await sql`
    INSERT INTO business_members (business_id, member_id, role, title)
    VALUES (${invite.business_id}, ${memberId}, ${invite.role},
            ${invite.role === "co_owner" ? "Co-owner" : null})
    ON CONFLICT DO NOTHING
  `;
  await sql`
    UPDATE business_invites SET status = 'accepted', accepted_at = now()
    WHERE id = ${invite.id}
  `;
  return invite;
}

// ── Opportunity matches ─────────────────────────────────────────────────

const MATCH_SELECT = `
  SELECT
    om.id, om.business_id, om.opportunity_id, om.fit_score, om.fit_rationale,
    om.status, om.status_note, om.amount_requested, om.amount_awarded,
    om.application_draft,
    fo.slug AS opportunity_slug, fo.name AS opportunity_name, fo.funder,
    fo.level, fo.category, fo.amount_min, fo.amount_max,
    fo.value_type, fo.unit_label, fo.effort_level, fo.success_probability,
    fo.deadline, fo.rolling, fo.url, fo.description AS opportunity_description,
    fo.eligibility, fo.verification_status
  FROM opportunity_matches om
  JOIN funding_opportunities fo ON fo.id = om.opportunity_id
`;

export async function getMatchesForBusiness(
  businessId: number
): Promise<MatchWithOpportunity[]> {
  return (await sql`
    ${sql.unsafe(MATCH_SELECT)}
    WHERE om.business_id = ${businessId}
      AND om.status NOT IN ('dismissed')
    ORDER BY om.fit_score DESC NULLS LAST, fo.deadline ASC NULLS LAST
  `) as unknown as MatchWithOpportunity[];
}

export async function getMatchById(
  businessId: number,
  matchId: number
): Promise<MatchWithOpportunity | null> {
  const rows = (await sql`
    ${sql.unsafe(MATCH_SELECT)}
    WHERE om.business_id = ${businessId} AND om.id = ${matchId}
    LIMIT 1
  `) as unknown as MatchWithOpportunity[];
  return rows[0] ?? null;
}

export async function updateMatchStatus(
  businessId: number,
  matchId: number,
  status: string,
  note?: string | null
): Promise<boolean> {
  const rows = await sql`
    UPDATE opportunity_matches
    SET status = ${status}, status_note = ${note ?? null}, updated_at = now()
    WHERE id = ${matchId} AND business_id = ${businessId}
    RETURNING id
  `;
  return rows.length > 0;
}

/**
 * Headline numbers for the dashboard.
 *
 * The Benefits Navigator ranks by free cash flow, so recurring money is kept
 * separate from one-time money: a $500/month saving beats a $2k grant over any
 * horizon that matters. per_unit benefits (e.g. $2,400 per eligible hire) are
 * counted once at their low end — claiming a multiple would require knowing
 * the business's hiring plans, and inflated numbers are the fastest way to
 * lose an owner's trust.
 */
export function summarizeMatches(matches: MatchWithOpportunity[]): MatchSummary {
  const active = matches.filter(
    (m) => m.status !== "declined" && m.status !== "dismissed"
  );
  const byStatus: Record<string, number> = {};
  let oneTimeMin = 0;
  let oneTimeMax = 0;
  let recurringAnnualMin = 0;
  let recurringAnnualMax = 0;
  let awardedTotal = 0;
  let capitalAccessMax = 0;
  let expectedOneTime = 0;
  let expectedRecurring = 0;

  for (const m of active) {
    byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
    if (m.status === "awarded") {
      awardedTotal += m.amount_awarded ?? 0;
      continue;
    }
    const min = m.amount_min ?? 0;
    const max = m.amount_max ?? m.amount_min ?? 0;
    if (m.category === "loan") {
      capitalAccessMax += max;
      continue;
    }
    const expected = ((min + max) / 2) * probabilityWeight(m.success_probability);
    if (m.value_type === "recurring_annual") {
      recurringAnnualMin += min;
      recurringAnnualMax += max;
      expectedRecurring += expected;
    } else {
      oneTimeMin += min;
      oneTimeMax += max;
      expectedOneTime += expected;
    }
  }

  const firstYearMin = oneTimeMin + recurringAnnualMin;
  const firstYearMax = oneTimeMax + recurringAnnualMax;
  return {
    matchCount: active.length,
    firstYearMin,
    firstYearMax,
    recurringAnnualMin,
    recurringAnnualMax,
    expectedFirstYear: Math.round(expectedOneTime + expectedRecurring),
    expectedRecurring: Math.round(expectedRecurring),
    fiveYearMax: firstYearMax + recurringAnnualMax * 4,
    awardedTotal,
    capitalAccessMax,
    byStatus,
  };
}

function probabilityWeight(probability: string | null): number {
  if (probability === "high") return 1;
  if (probability === "low") return 0.4;
  return 0.7;
}

/**
 * Priority ordering: value weighted by likelihood, discounted by effort.
 * A high-probability, low-effort $5k recurring rebate should outrank a
 * long-shot $50k grant that takes a month to assemble. Recurring benefits
 * are scored on five-year value.
 */
export function priorityScore(m: MatchWithOpportunity): number {
  const amount = m.amount_max ?? m.amount_min ?? 0;
  const horizonValue = m.value_type === "recurring_annual" ? amount * 5 : amount;
  const effort = m.effort_level ?? 3;
  return (horizonValue * probabilityWeight(m.success_probability)) / effort;
}

export function sortByPriority(
  matches: MatchWithOpportunity[]
): MatchWithOpportunity[] {
  return [...matches].sort((a, b) => {
    const diff = priorityScore(b) - priorityScore(a);
    if (diff !== 0) return diff;
    return (b.fit_score ?? 0) - (a.fit_score ?? 0);
  });
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatAmountRange(
  min: number | null,
  max: number | null
): string {
  if (min != null && max != null && min !== max)
    return `${formatUsd(min)}–${formatUsd(max)}`;
  if (max != null) return `Up to ${formatUsd(max)}`;
  if (min != null) return formatUsd(min);
  return "Varies";
}
