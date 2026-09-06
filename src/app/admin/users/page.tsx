import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { requireAdmin } from "@/lib/admin";
import sql from "@/lib/db-query";
import { toHeaderMember } from "@/lib/member-nav";

export const metadata: Metadata = {
  title: "User management | Portland Civic Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type MemberRole = "member" | "admin";
type MemberStatus = "active" | "suspended";

interface MemberAdminRow {
  id: number;
  workos_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  last_seen_at: string;
  proposal_count: number;
  vote_count: number;
  flag_count: number;
}

const ROLE_OPTIONS: MemberRole[] = ["member", "admin"];
const STATUS_OPTIONS: MemberStatus[] = ["active", "suspended"];

function displayName(member: MemberAdminRow): string {
  return [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function updateMemberAccess(formData: FormData) {
  "use server";

  const { member: actor } = await requireAdmin();
  const memberId = Number(formData.get("memberId"));
  const role = String(formData.get("role"));
  const status = String(formData.get("status"));

  if (
    !Number.isInteger(memberId) ||
    !ROLE_OPTIONS.includes(role as MemberRole) ||
    !STATUS_OPTIONS.includes(status as MemberStatus)
  ) {
    redirect("/admin/users?error=invalid");
  }

  // Read, check and write in one transaction, locking the admin rows.
  //
  // Run as separate statements, two admins demoting each other at the same
  // moment both saw a count of 2, both passed the guard, and the account was
  // left with no active admin and no way back in short of a database edit.
  // SELECT ... FOR UPDATE makes the second transaction wait and re-read.
  const outcome = await sql.begin(async (tx) => {
    const targets = (await tx.unsafe(
      `SELECT id, role, status, email FROM members WHERE id = $1 LIMIT 1 FOR UPDATE`,
      [memberId],
    )) as unknown as Pick<MemberAdminRow, "id" | "role" | "status" | "email">[];
    const target = targets[0];
    if (!target) return "missing" as const;

    const wouldRemoveActiveAdmin =
      target.role === "admin" &&
      target.status === "active" &&
      (role !== "admin" || status !== "active");

    if (wouldRemoveActiveAdmin) {
      const rows = (await tx.unsafe(
        `SELECT COUNT(*)::int AS count FROM members
          WHERE role = 'admin' AND status = 'active'
          FOR UPDATE`,
      )) as unknown as { count: number }[];
      if (Number(rows[0]?.count ?? 0) <= 1) return "last-admin" as const;
    }

    await tx.unsafe(
      `UPDATE members SET role = $1, status = $2 WHERE id = $3`,
      [role, status, memberId],
    );
    return "ok" as const;
  });

  if (outcome === "missing") redirect("/admin/users?error=missing");
  if (outcome === "last-admin") redirect("/admin/users?error=last-admin");

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/member");

  const selfChanged = actor.id === memberId && (role !== "admin" || status !== "active");
  redirect(selfChanged ? "/member" : "/admin/users?updated=1");
}

function Notice({ type }: { type?: string }) {
  if (!type) return null;

  const messages: Record<string, { tone: string; text: string }> = {
    invalid: {
      tone: "border-red-200 bg-red-50 text-red-800",
      text: "That update could not be applied because the submitted role or status was invalid.",
    },
    missing: {
      tone: "border-red-200 bg-red-50 text-red-800",
      text: "That member no longer exists.",
    },
    "last-admin": {
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      text: "At least one active admin must remain. Add another admin before demoting or suspending the last one.",
    },
    updated: {
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
      text: "Member access updated.",
    },
  };

  const message = messages[type];
  if (!message) return null;

  return (
    <div className={`mt-6 rounded-sm border px-4 py-3 text-[13px] ${message.tone}`}>
      {message.text}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; updated?: string }>;
}) {
  const { user, member } = await requireAdmin();
  const params = searchParams ? await searchParams : {};
  const noticeType = params.updated ? "updated" : params.error;

  const members = (await sql`
    SELECT
      m.id,
      m.workos_user_id,
      m.email,
      m.first_name,
      m.last_name,
      m.role,
      m.status,
      m.joined_at,
      m.last_seen_at,
      COALESCE(p.proposal_count, 0)::int AS proposal_count,
      COALESCE(v.vote_count, 0)::int AS vote_count,
      COALESCE(f.flag_count, 0)::int AS flag_count
    FROM members m
    LEFT JOIN (
      SELECT member_id, COUNT(*)::int AS proposal_count
      FROM topic_proposals
      GROUP BY member_id
    ) p ON p.member_id = m.id
    LEFT JOIN (
      SELECT member_id, COUNT(*)::int AS vote_count
      FROM proposal_votes
      GROUP BY member_id
    ) v ON v.member_id = m.id
    LEFT JOIN (
      SELECT member_id, COUNT(*)::int AS flag_count
      FROM data_flags
      WHERE member_id IS NOT NULL
      GROUP BY member_id
    ) f ON f.member_id = m.id
    ORDER BY
      (m.role = 'admin' AND m.status = 'active') DESC,
      m.last_seen_at DESC,
      m.joined_at DESC
  `) as unknown as MemberAdminRow[];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Header member={toHeaderMember(user, member)} />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Admin · Users
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-editorial-normal text-[36px] sm:text-[48px] text-[var(--color-ink)] leading-tight">
              User management
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] text-[var(--color-ink-light)] leading-relaxed">
              These are the WorkOS accounts mirrored into the Civic Lab
              members table. Use this page to change member/admin access and
              suspend accounts that should not participate.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex w-fit items-center rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-4 py-2 text-[13px] font-semibold text-[var(--color-canopy)] hover:bg-white transition-colors"
          >
            Admin overview
          </Link>
        </div>

        <Notice type={noticeType} />

        <div className="mt-8 overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-parchment)]">
              <thead className="bg-[var(--color-paper-warm)]">
                <tr>
                  {["Member", "Access", "Activity", "Dates", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-parchment)]">
                {members.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[14px] text-[var(--color-ink)]">
                        {displayName(row)}
                      </p>
                      <p className="mt-1 max-w-[260px] truncate font-mono text-[11px] text-[var(--color-ink-muted)]">
                        {row.email}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                        ID {row.id}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-2 py-1 text-[11px] font-semibold capitalize text-[var(--color-ink)]">
                          {row.role}
                        </span>
                        <span
                          className={`rounded-sm border px-2 py-1 text-[11px] font-semibold capitalize ${
                            row.status === "active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-stone-200 bg-stone-100 text-stone-600"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[var(--color-ink-light)]">
                      <p>{row.proposal_count} proposals</p>
                      <p>{row.vote_count} votes</p>
                      <p>{row.flag_count} flags</p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[var(--color-ink-light)]">
                      <p>Joined {formatDate(row.joined_at)}</p>
                      <p>Seen {formatDate(row.last_seen_at)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form action={updateMemberAccess} className="flex min-w-[260px] flex-wrap items-center gap-2">
                        <input type="hidden" name="memberId" value={row.id} />
                        <label className="sr-only" htmlFor={`role-${row.id}`}>
                          Role for {row.email}
                        </label>
                        <select
                          id={`role-${row.id}`}
                          name="role"
                          defaultValue={row.role}
                          className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-2 py-1.5 text-[12px] text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <label className="sr-only" htmlFor={`status-${row.id}`}>
                          Status for {row.email}
                        </label>
                        <select
                          id={`status-${row.id}`}
                          name="status"
                          defaultValue={row.status}
                          className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper)] px-2 py-1.5 text-[12px] text-[var(--color-ink)] outline-none focus:border-[var(--color-sage)]"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-sm bg-[var(--color-canopy)] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-light)]"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[var(--color-ink-muted)]">
                      No mirrored members yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          <code>ADMIN_EMAILS</code> still acts as an emergency bootstrap for configured
          accounts, but member/admin role changes are now preserved in the
          database on future sign-ins.
        </p>
      </main>

      <Footer />
    </div>
  );
}
