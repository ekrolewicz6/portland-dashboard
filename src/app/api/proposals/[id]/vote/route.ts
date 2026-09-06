import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import sql from "@/lib/db-query";
import { getMemberByWorkOSId, isWorkOSConfigured } from "@/lib/membership";

export const dynamic = "force-dynamic";

/** Toggle the signed-in member's vote on a proposal. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isWorkOSConfigured()) {
    return NextResponse.json({ ok: false, error: "Sign in to vote." }, { status: 401 });
  }

  let member;
  try {
    const { user } = await withAuth();
    member = user ? await getMemberByWorkOSId(user.id) : null;
  } catch {
    member = null;
  }
  if (!member) {
    return NextResponse.json({ ok: false, error: "Sign in to vote." }, { status: 401 });
  }
  if (member.status !== "active") {
    return NextResponse.json({ ok: false, error: "Account is not active." }, { status: 403 });
  }

  const { id } = await params;
  const proposalId = Number(id);
  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid proposal." }, { status: 400 });
  }

  try {
    // Toggle and count in one transaction. Run as separate statements, a
    // failure between the delete and the insert dropped the member's vote
    // without replacing it, and the count could be read after another
    // member's concurrent vote landed — so the number returned to the
    // browser did not match the toggle it was reporting.
    const { voted, votes } = await sql.begin(async (tx) => {
      const deleted = await tx.unsafe(
        `DELETE FROM proposal_votes
          WHERE proposal_id = $1 AND member_id = $2
        RETURNING proposal_id`,
        [proposalId, member.id],
      );
      const nowVoted = deleted.length === 0;
      if (nowVoted) {
        await tx.unsafe(
          `INSERT INTO proposal_votes (proposal_id, member_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [proposalId, member.id],
        );
      }
      const rows = (await tx.unsafe(
        `SELECT COUNT(*)::int AS votes FROM proposal_votes WHERE proposal_id = $1`,
        [proposalId],
      )) as unknown as { votes: number }[];
      return { voted: nowVoted, votes: rows[0]?.votes ?? 0 };
    });

    return NextResponse.json({ ok: true, voted, votes });
  } catch (error) {
    console.error("[proposals/vote] failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't record your vote right now." },
      { status: 500 }
    );
  }
}
