import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getMemberByWorkOSId } from "@/lib/membership";
import { toHeaderMember } from "@/lib/member-nav";
import {
  canClaimPreparedBusinesses,
  claimBusiness,
  getBusinessesForMember,
  getUnclaimedBusinesses,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Member area | Portland Civic Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MemberPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  const member = await getMemberByWorkOSId(user.id);

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const myBusinesses = member ? await getBusinessesForMember(member.id) : [];
  // Claiming has no self-service undo and hands over a funding pipeline, so a
  // member is only offered profiles prepared for their own address (or any
  // profile, if they are on the onboarding allowlist). getUnclaimedBusinesses
  // applies that scoping; claimBusiness re-checks it before writing.
  const claimable =
    member && myBusinesses.length === 0
      ? await getUnclaimedBusinesses(member.email)
      : [];

  async function handleSignOut() {
    "use server";
    await signOut({ returnTo: "/" });
  }

  async function handleSignOutEverywhere() {
    "use server";
    const { user: u } = await withAuth({ ensureSignedIn: true });
    const { revokeAllSessions } = await import("@/lib/workos-sessions");
    // Revoke every WorkOS session (other Civic Lab apps notice at their next
    // token refresh, within ~5 minutes), then clear this app's session too.
    await revokeAllSessions(u.id).catch(() => 0);
    await signOut({ returnTo: "/" });
  }

  async function handleClaim(formData: FormData) {
    "use server";
    const { user: u } = await withAuth({ ensureSignedIn: true });
    const m = await getMemberByWorkOSId(u.id);
    if (!m || m.status !== "active") redirect("/member");

    const businessId = Number(formData.get("businessId"));
    const slug = String(formData.get("slug") ?? "");
    if (!Number.isFinite(businessId) || !slug) redirect("/member");

    // businessId arrives from the form, so it is not evidence of anything.
    // claimBusiness re-checks that this member is authorized for this
    // particular business before writing.
    const result = await claimBusiness(businessId, m.id, m.email);
    redirect(result.ok ? `/member/business/${slug}` : "/member");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Header member={toHeaderMember(user, member)} />

      <main className="flex-1 max-w-[1400px] 3xl:max-w-[1800px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Member area
          </span>
        </div>

        <h1 className="font-editorial-normal text-[36px] sm:text-[44px] text-[var(--color-ink)] leading-tight">
          Welcome, {displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-[var(--color-ink-light)] leading-relaxed">
          You&apos;re one of the first members of Portland Civic Lab.
          Member features are rolling out in stages — here&apos;s what&apos;s
          coming and how to get involved today.
        </p>

        <section className="mt-10">
          <h2 className="font-editorial text-[26px] text-[var(--color-ink)]">
            Your business
          </h2>

          {myBusinesses.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              {myBusinesses.map((b) => (
                <Link
                  key={b.id}
                  href={`/member/business/${b.slug}`}
                  className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6 hover:border-[var(--color-sage)] transition-colors"
                >
                  <h3 className="font-editorial text-[22px] text-[var(--color-ink)]">
                    {b.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
                    {b.neighborhood ?? b.address_city ?? "Portland"} ·{" "}
                    <span className="capitalize">
                      {b.member_role.replace("_", "-")}
                    </span>
                  </p>
                  <p className="mt-3 text-[14px] font-semibold text-[var(--color-canopy)]">
                    Open funding dashboard →
                  </p>
                </Link>
              ))}
            </div>
          ) : claimable.length > 0 ? (
            <div className="mt-4 space-y-4">
              {claimable.map((b) => (
                <div
                  key={b.id}
                  className="rounded-sm border border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-6"
                >
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                    Is this your business?
                  </span>
                  <h3 className="mt-2 font-editorial text-[24px] text-[var(--color-ink)]">
                    {b.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
                    {[b.address_street, b.neighborhood].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-3 max-w-2xl text-[14px] text-[var(--color-ink-light)] leading-relaxed">
                    Portland Civic Lab has already built a funding profile for
                    this business and matched it against programs it looks
                    eligible for. Claim it to see what we found.
                  </p>
                  <form action={handleClaim} className="mt-4">
                    <input type="hidden" name="businessId" value={b.id} />
                    <input type="hidden" name="slug" value={b.slug} />
                    <button
                      type="submit"
                      className="rounded-sm bg-[var(--color-canopy)] px-5 py-2.5 text-[14px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
                    >
                      Claim this business
                    </button>
                  </form>
                </div>
              ))}
              <p className="text-[13px] text-[var(--color-ink-muted)]">
                Not yours?{" "}
                <Link
                  href="/member/business/new"
                  className="text-[var(--color-canopy)] hover:underline"
                >
                  Register a different business →
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6">
              <p className="max-w-2xl text-[14px] text-[var(--color-ink-light)] leading-relaxed">
                Register your business once and Portland Civic Lab goes looking
                for money on your behalf — grants, tax credits, rebates, and
                subsidies across city, county, state, federal, and private
                sources. We prepare the applications; you review and submit.
              </p>
              <Link
                href="/member/business/new"
                className="mt-4 inline-block rounded-sm bg-[var(--color-canopy)] px-5 py-2.5 text-[14px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
              >
                Register your business
              </Link>
            </div>
          )}
        </section>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6">
            <h2 className="font-editorial text-[22px] text-[var(--color-ink)]">
              Your profile
            </h2>
            <dl className="mt-4 space-y-2 text-[14px] text-[var(--color-ink-light)]">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-muted)]">Email</dt>
                <dd className="truncate">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-muted)]">Role</dt>
                <dd className="capitalize">{member?.role ?? "member"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-muted)]">Member since</dt>
                <dd>
                  {member?.joined_at
                    ? new Date(member.joined_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Today"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6">
            <h2 className="font-editorial text-[22px] text-[var(--color-ink)]">
              Things you can do now
            </h2>
            <ul className="mt-4 space-y-2 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              <li>
                <Link href="/proposals" className="text-[var(--color-canopy)] hover:underline">
                  Propose and vote on dashboard topics →
                </Link>
              </li>
              <li>
                Flag suspect numbers on any{" "}
                <Link href="/dashboard" className="text-[var(--color-canopy)] hover:underline">
                  dashboard
                </Link>
              </li>
              <li>
                Follow our{" "}
                <Link href="/records" className="text-[var(--color-canopy)] hover:underline">
                  public records requests
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="text-[var(--color-canopy)] hover:underline">
                  Volunteer your skills →
                </Link>
              </li>
              {member?.role === "admin" && (
                <li>
                  <Link href="/admin" className="text-[var(--color-canopy)] hover:underline">
                    Open the admin portal →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6">
            <h2 className="font-editorial text-[22px] text-[var(--color-ink)]">
              Get involved now
            </h2>
            <p className="mt-4 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
              See something wrong in the data, or have an idea for what the
              lab should build next? We read every note.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-[14px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              Send a note →
            </Link>
          </div>
        </div>

        {member?.role === "admin" && (
          <p className="mt-8 text-[14px]">
            <Link
              href="/admin"
              className="font-semibold text-[var(--color-canopy)] hover:underline"
            >
              Admin portal →
            </Link>
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-[13px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline transition-colors"
            >
              Sign out
            </button>
          </form>
          <form action={handleSignOutEverywhere}>
            <button
              type="submit"
              className="text-[13px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] underline transition-colors"
              title="Ends your session in every Civic Lab app, on every device. Other apps notice within about five minutes."
            >
              Sign out everywhere
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
