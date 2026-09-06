import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { resolveMemberFromWorkOS } from "@/lib/membership";

/**
 * Server-to-server account resolution for other Portland Civic Lab apps
 * (Council, Permits, …). Given a WorkOS identity the calling app just
 * authenticated, returns the canonical opaque account id — creating or
 * relinking the member if needed — so every app converges on one account
 * per person and no app ever sees a sequential member id.
 *
 * Auth: per-app HMAC over `${app}.${timestamp}.${rawBody}` with a shared
 * secret from CIVICLAB_INTERNAL_APP_SECRETS (JSON: {"council":"…", …}).
 * Timestamps older than 5 minutes are rejected. Never browser-callable:
 * no CORS headers are emitted and secrets never leave the servers.
 *
 * Response deliberately excludes email, names, and app roles — apps already
 * know the identity they sent, and authorization stays app-local.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_CLOCK_SKEW_SECONDS = 300;

function appSecret(app: string): string | null {
  try {
    const secrets = JSON.parse(process.env.CIVICLAB_INTERNAL_APP_SECRETS ?? "{}") as Record<
      string,
      string
    >;
    const secret = secrets[app];
    return typeof secret === "string" && secret.length >= 32 ? secret : null;
  } catch {
    return null;
  }
}

function validSignature(secret: string, app: string, timestamp: string, rawBody: string, provided: string): boolean {
  const expected = createHmac("sha256", secret)
    .update(`${app}.${timestamp}.${rawBody}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const app = request.headers.get("x-civiclab-app") ?? "";
  const timestamp = request.headers.get("x-civiclab-timestamp") ?? "";
  const signature = request.headers.get("x-civiclab-signature") ?? "";
  const rawBody = await request.text();

  const secret = appSecret(app);
  const ts = Number(timestamp);
  const fresh =
    Number.isFinite(ts) && Math.abs(Date.now() / 1000 - ts) <= MAX_CLOCK_SKEW_SECONDS;

  if (!secret || !fresh || !signature || !validSignature(secret, app, timestamp, rawBody, signature)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    workosUserId?: string;
    email?: string;
    emailVerified?: boolean;
    firstName?: string | null;
    lastName?: string | null;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.workosUserId !== "string" ||
    !body.workosUserId ||
    typeof body.email !== "string" ||
    !body.email.includes("@") ||
    // Required, not optional. This flag decides whether an existing account
    // may be relinked to a new identity by email alone, so a caller must
    // state what its identity provider actually attested rather than leaving
    // it out and getting the permissive path by default.
    typeof body.emailVerified !== "boolean"
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const member = await resolveMemberFromWorkOS({
      id: body.workosUserId,
      email: body.email,
      emailVerified: body.emailVerified,
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
    });

    return NextResponse.json({
      accountPublicId: member.account_public_id,
      status: member.status,
      platformRole: member.role === "admin" ? "platform_admin" : "member",
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[internal/accounts/resolve] app=${app} failed:`, error);
    return NextResponse.json({ error: "resolve_failed" }, { status: 500 });
  }
}
