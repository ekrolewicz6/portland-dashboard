import sql from "@/lib/db-query";

/**
 * Membership layer on top of WorkOS AuthKit.
 *
 * WorkOS owns identity (sign-in, sessions, email verification); the local
 * `members` table owns everything the Civic Lab knows about a member beyond
 * identity: role, status, neighborhood, interests, participation.
 *
 * `members.account_public_id` is the opaque UUID other Civic Lab apps see —
 * sequential member ids never leave this app. `account_identities` records
 * every WorkOS user id ever linked to a member, so consolidating apps from
 * other WorkOS environments (or a re-created WorkOS user with the same
 * verified email) never produces a duplicate account.
 */

/** Whether WorkOS AuthKit is configured in this environment. */
export function isWorkOSConfigured(): boolean {
  return Boolean(
    process.env.WORKOS_API_KEY &&
      process.env.WORKOS_CLIENT_ID &&
      process.env.WORKOS_COOKIE_PASSWORD
  );
}

export interface WorkOSUserLike {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  emailVerified?: boolean;
}

export interface Member {
  id: number;
  account_public_id: string;
  workos_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  neighborhood: string | null;
  interests: string[] | null;
  joined_at: string;
}

/** Emails granted the admin role on sign-in (comma-separated env var). */
function isAdminEmail(email: string): boolean {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

function isUniqueViolationOnEmail(error: unknown): boolean {
  const e = error as { code?: string; constraint_name?: string; constraint?: string };
  const constraint = e?.constraint_name ?? e?.constraint ?? "";
  return e?.code === "23505" && constraint === "members_email_key";
}

/**
 * Create or refresh the local member row for a WorkOS identity, and return it.
 *
 * Keyed on the WorkOS user id. If a *different* WorkOS user id arrives with a
 * verified email that already belongs to a member (a re-created WorkOS user,
 * or an app migrating in from another WorkOS environment), the existing member
 * is relinked to the new identity instead of failing — WorkOS verified the
 * email, and both identities live in Civic Lab's own user pool. Every linked
 * identity is recorded in `account_identities`.
 *
 * ADMIN_EMAILS is a bootstrap/promotion fallback; day-to-day roles are owned
 * by the members table so admins can promote other members without that role
 * being overwritten on sign-in.
 */
export async function resolveMemberFromWorkOS(user: WorkOSUserLike): Promise<Member> {
  const role = isAdminEmail(user.email) ? "admin" : "member";
  let identitySource = "primary";

  try {
    await sql`
      INSERT INTO members (workos_user_id, email, first_name, last_name, avatar_url, role)
      VALUES (
        ${user.id},
        ${user.email},
        ${user.firstName ?? null},
        ${user.lastName ?? null},
        ${user.profilePictureUrl ?? null},
        ${role}
      )
      ON CONFLICT (workos_user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        role = CASE
          WHEN members.role = 'admin' THEN members.role
          WHEN EXCLUDED.role = 'admin' THEN 'admin'
          ELSE members.role
        END,
        last_seen_at = now()
    `;
  } catch (error) {
    // A new WorkOS user id carrying an email that already belongs to a member.
    // Relinking hands the existing account — including an admin role — to the
    // new identity, so it requires a positive attestation that the address is
    // verified. An absent flag is not an attestation: a caller that simply
    // omits the field must not be able to take over an account by claiming
    // its email.
    if (!isUniqueViolationOnEmail(error) || user.emailVerified !== true) {
      throw error;
    }
    await sql`
      UPDATE members SET
        workos_user_id = ${user.id},
        first_name = COALESCE(${user.firstName ?? null}, first_name),
        last_name = COALESCE(${user.lastName ?? null}, last_name),
        avatar_url = COALESCE(${user.profilePictureUrl ?? null}, avatar_url),
        last_seen_at = now()
      WHERE email = ${user.email}
    `;
    identitySource = "email_relink";
  }

  // Record the identity → account link (idempotent).
  await sql`
    INSERT INTO account_identities (member_id, workos_user_id, source)
    SELECT id, ${user.id}, ${identitySource} FROM members
    WHERE workos_user_id = ${user.id}
    ON CONFLICT (workos_user_id) DO NOTHING
  `;

  const member = await getMemberByWorkOSId(user.id);
  if (!member) {
    throw new Error("member row missing after resolve");
  }
  return member;
}

/**
 * Back-compat wrapper for the auth callback: resolve and discard the row.
 */
export async function upsertMemberFromWorkOS(user: WorkOSUserLike): Promise<void> {
  await resolveMemberFromWorkOS(user);
}

/** Look up the local member row for a WorkOS user id. */
export async function getMemberByWorkOSId(workosUserId: string): Promise<Member | null> {
  const rows = (await sql`
    SELECT * FROM members WHERE workos_user_id = ${workosUserId} LIMIT 1
  `) as unknown as Member[];
  return rows[0] ?? null;
}
