import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Shared auth check for /api/cron/* routes.
 *
 * Fail-secure: if CRON_SECRET is not configured, every request is rejected.
 * (Previously these routes were wide open whenever the secret was unset,
 * which let anyone trigger expensive syncs or tamper with data.)
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when
 * the CRON_SECRET environment variable is set on the project.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(
      "[cron-auth] CRON_SECRET is not set — rejecting request. Configure it in the environment to enable cron routes."
    );
    return false;
  }
  return timingSafeEquals(
    request.headers.get("authorization") ?? "",
    `Bearer ${secret}`
  );
}

/**
 * Constant-time string comparison.
 *
 * `===` on secrets returns as soon as two bytes differ, so how long the
 * comparison takes leaks how much of the prefix was right. The effect is small
 * and hard to exploit across a network, but comparing in constant time costs
 * nothing and removes the question.
 *
 * Lengths are compared through the same path: hashing first gives both inputs
 * a fixed width, so a mismatched length cannot short-circuit either.
 */
function timingSafeEquals(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(digestA, digestB);
}
