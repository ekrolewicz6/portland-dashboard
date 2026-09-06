import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@workos-inc/authkit-nextjs";
import sql from "@/lib/db-query";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getMemberByWorkOSId, isWorkOSConfigured } from "@/lib/membership";
import { isValidQuestion } from "@/lib/questions";

export const dynamic = "force-dynamic";

// Topics come from the same list the dashboard routes and the flag button
// use. This was a second, hand-maintained copy that had drifted: it omitted
// "environment", so anyone flagging a number on that page was told to
// describe the issue in 10-2000 characters, which they already had.
const FlagSchema = z.object({
  question: z.string().refine(isValidQuestion, "Unknown topic"),
  metric: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  // Honeypot — humans never fill this; checked after parsing so bots get a
  // convincing fake success instead of a validation error.
  website: z.string().max(200).optional().or(z.literal("")),
});

/**
 * Resolve the signed-in member, if any. The middleware runs on this route
 * with auth optional, so withAuth() returns a session when present and
 * null user otherwise.
 */
async function getOptionalMemberId(): Promise<number | null> {
  if (!isWorkOSConfigured()) return null;
  try {
    const { user } = await withAuth();
    if (!user) return null;
    const member = await getMemberByWorkOSId(user.id);
    return member?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`data-flag:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many reports from this connection. Try again later." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = FlagSchema.safeParse(raw);
  if (!parsed.success) {
    // Report the field that actually failed. A single canned message about
    // message length sends people looking in the wrong place when the real
    // problem is the topic or the email address.
    const issue = parsed.error.issues[0];
    const message =
      issue?.path[0] === "question"
        ? "That topic is not one we track."
        : issue?.path[0] === "email"
          ? "That email address does not look valid."
          : "Please describe the issue in 10-2000 characters.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 }
    );
  }

  // Honeypot tripped: pretend success, store nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const memberId = await getOptionalMemberId();
  const { question, metric, message, email } = parsed.data;

  try {
    await sql`
      INSERT INTO data_flags (question, metric, message, reporter_email, member_id)
      VALUES (
        ${question},
        ${metric || null},
        ${message},
        ${email || null},
        ${memberId}
      )
    `;
  } catch (error) {
    console.error("[data-flags] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't save your report right now. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

/**
 * Public, read-only list of recent flags — transparency about what's been
 * reported and what we did about it. Never exposes reporter emails.
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, question, metric, message, status, resolution_note, created_at, resolved_at
      FROM data_flags
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ ok: true, flags: rows });
  } catch (error) {
    console.error("[data-flags] list failed:", error);
    return NextResponse.json({ ok: false, flags: [] }, { status: 500 });
  }
}
