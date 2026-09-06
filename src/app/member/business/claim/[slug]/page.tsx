import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toHeaderMember } from "@/lib/member-nav";
import { getMemberByWorkOSId } from "@/lib/membership";
import {
  canMemberClaimBusiness,
  claimBusiness,
  formatUsd,
  getBusinessBySlug,
  getMatchesForBusiness,
  isBusinessMember,
  summarizeMatches,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Claim your business | Portland Civic Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Direct claim link for a business PCL researched in advance.
 *
 * Deliberate navigation rather than something offered to every member — see
 * canClaimPreparedBusinesses in src/lib/business.ts for why claiming isn't
 * advertised broadly.
 */
export default async function ClaimBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user } = await withAuth({ ensureSignedIn: true });
  const member = await getMemberByWorkOSId(user.id);
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  // Already on the team, or someone else got here first.
  if (member && (await isBusinessMember(business.id, member.id))) {
    redirect(`/member/business/${business.slug}`);
  }

  // Slugs are derived from business names, so reaching this URL proves
  // nothing. Only a member this business was actually prepared for sees its
  // researched funding pipeline, and only they are offered the claim button.
  const mayClaim =
    member !== null &&
    member.status === "active" &&
    (await canMemberClaimBusiness(business.id, member.email));

  const matches =
    !business.claimed && mayClaim ? await getMatchesForBusiness(business.id) : [];
  const summary = summarizeMatches(matches);

  async function handleClaim() {
    "use server";
    const { user: u } = await withAuth({ ensureSignedIn: true });
    const m = await getMemberByWorkOSId(u.id);
    if (!m || m.status !== "active") redirect("/member");
    if (!business) redirect("/member");

    // claimBusiness re-checks authorization and claim state inside one
    // transaction; the page-level check above only decides what to render.
    const result = await claimBusiness(business.id, m.id, m.email);
    redirect(result.ok ? `/member/business/${business.slug}` : "/member");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Header member={toHeaderMember(user, member)} />

      <main className="flex-1 max-w-[760px] mx-auto w-full px-5 sm:px-8 py-16 sm:py-24">
        {business.claimed ? (
          <>
            <h1 className="font-editorial-normal text-[34px] text-[var(--color-ink)] leading-tight">
              {business.name} has already been claimed
            </h1>
            <p className="mt-4 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
              Someone on the team claimed this profile already. If that
              wasn&apos;t you and it should have been, get in touch and
              we&apos;ll sort it out.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block text-[14px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              Contact Portland Civic Lab →
            </Link>
          </>
        ) : !mayClaim ? (
          <>
            <h1 className="font-editorial-normal text-[34px] text-[var(--color-ink)] leading-tight">
              This profile isn&apos;t open for you to claim
            </h1>
            <p className="mt-4 text-[15px] text-[var(--color-ink-light)] leading-relaxed">
              Claiming a business makes you its owner on Portland Civic Lab and
              opens its funding pipeline, so we only open it to the address we
              have on file for the owner. You are signed in as {user.email}. If
              this is your business, get in touch and we&apos;ll open the claim
              to the address you use here.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block text-[14px] font-semibold text-[var(--color-canopy)] hover:underline"
            >
              Contact Portland Civic Lab →
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[var(--color-ember)]" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                Is this your business?
              </span>
            </div>

            <h1 className="font-editorial-normal text-[36px] sm:text-[42px] text-[var(--color-ink)] leading-tight">
              {business.name}
            </h1>
            <p className="mt-2 text-[14px] text-[var(--color-ink-muted)]">
              {[business.address_street, business.neighborhood]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <p className="mt-6 text-[16px] text-[var(--color-ink-light)] leading-relaxed">
              Portland Civic Lab has already built a funding profile for this
              business and searched city, county, state, federal, and private
              programs against it.
            </p>

            {summary.matchCount > 0 && (
              <div className="mt-7 rounded-sm border border-[var(--color-ember)] bg-[var(--color-paper-warm)] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                  Waiting for you
                </p>
                <p className="mt-3 font-editorial-normal text-[40px] leading-none text-[var(--color-ink)]">
                  {formatUsd(summary.expectedFirstYear)}
                </p>
                <p className="mt-2 text-[14px] text-[var(--color-ink-light)] leading-relaxed">
                  in realistic first-year funding across {summary.matchCount}{" "}
                  programs you look eligible for — including{" "}
                  {formatUsd(summary.expectedRecurring)} that repeats every
                  year.
                </p>
              </div>
            )}

            <form action={handleClaim} className="mt-8">
              <button
                type="submit"
                className="rounded-sm bg-[var(--color-canopy)] px-6 py-3 text-[15px] font-semibold text-[var(--color-paper)] hover:bg-[var(--color-canopy-light)] transition-colors"
              >
                This is my business — claim it
              </button>
            </form>
            <p className="mt-4 text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
              Claiming as {user.email}. You&apos;ll be able to add co-owners,
              correct anything we got wrong, and see every program we found.
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
