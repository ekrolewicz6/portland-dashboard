import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@workos-inc/authkit-nextjs";
import sql from "@/lib/db-query";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getMemberByWorkOSId, isWorkOSConfigured, type Member } from "@/lib/membership";

export const dynamic = "force-dynamic";

const ProposalSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(2000),
});

async function getSignedInMember(): Promise<Member | null> {
  if (!isWorkOSConfigured()) return null;
  try {
    const { user } = await withAuth();
    if (!user) return null;
    return await getMemberByWorkOSId(user.id);
  } catch {
    return null;
  }
}

/**
 * Public list of proposals with vote counts, most-supported first.
 * Includes whether the current member (if signed in) has voted.
 */
export async function GET() {
  const member = await getSignedInMember();
  try {
    const rows = await sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.status,
        p.created_at,
        COALESCE(m.first_name, 'A member') AS proposer,
        COUNT(v.member_id)::int AS votes,
        COALESCE(BOOL_OR(v.member_id = ${member?.id ?? -1}), false) AS voted
      FROM topic_proposals p
      JOIN members m ON m.id = p.member_id
      LEFT JOIN proposal_votes v ON v.proposal_id = p.id
      GROUP BY p.id, m.first_name
      ORDER BY COUNT(v.member_id) DESC, p.created_at DESC
      LIMIT 200
    `;
    return NextResponse.json({
      ok: true,
      signedIn: Boolean(member),
      proposals: rows,
    });
  } catch (error) {
    console.error("[proposals] list failed:", error);
    return NextResponse.json({ ok: false, proposals: [] }, { status: 500 });
  }
}

/** Members propose new topics. */
export async function POST(request: NextRequest) {
  const member = await getSignedInMember();
  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Sign in to propose a topic." },
      { status: 401 }
    );
  }
  if (member.status !== "active") {
    return NextResponse.json({ ok: false, error: "Account is not active." }, { status: 403 });
  }

  const ip = getClientIp(request);
  if (
    !checkRateLimit(`proposal:${member.id}`, 3, 24 * 60 * 60 * 1000) ||
    !checkRateLimit(`proposal-ip:${ip}`, 10, 24 * 60 * 60 * 1000)
  ) {
    return NextResponse.json(
      { ok: false, error: "Proposal limit reached for today." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = ProposalSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Title needs 5-120 characters; description 20-2000." },
      { status: 400 }
    );
  }

  try {
    const [row] = await sql`
      INSERT INTO topic_proposals (title, description, member_id)
      VALUES (${parsed.data.title}, ${parsed.data.description}, ${member.id})
      RETURNING id
    `;
    // Proposing implies supporting it.
    await sql`
      INSERT INTO proposal_votes (proposal_id, member_id)
      VALUES (${row.id as number}, ${member.id})
      ON CONFLICT DO NOTHING
    `;
    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    console.error("[proposals] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't save your proposal right now." },
      { status: 500 }
    );
  }
}
