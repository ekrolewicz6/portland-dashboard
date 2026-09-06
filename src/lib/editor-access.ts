import "server-only";

import { withAuth } from "@workos-inc/authkit-nextjs";
import { getMemberByWorkOSId } from "@/lib/membership";
import { isWorkOSConfigured } from "@/lib/membership";

/**
 * May the caller see unpublished editorial content?
 *
 * Draft progress reports are working copy: numbers still being checked,
 * wording still being argued over, findings not yet put to the people they
 * name. Publishing is the editorial decision, so anything not yet published
 * is visible only to admins.
 *
 * This is a boolean check rather than a redirect because the callers are API
 * routes serving public content: an anonymous request should get the
 * published list, not a sign-in redirect.
 *
 * Fails closed. Any error — no session, WorkOS unconfigured, database
 * unreachable — yields false.
 */
export async function isEditor(): Promise<boolean> {
  if (!isWorkOSConfigured()) return false;

  try {
    const { user } = await withAuth();
    if (!user) return false;

    const member = await getMemberByWorkOSId(user.id);
    return member?.role === "admin" && member.status === "active";
  } catch {
    return false;
  }
}
