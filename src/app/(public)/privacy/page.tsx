import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Portland Civic Lab handles your information: what we collect, why, and what we never do with it.",
  alternates: { canonical: "https://www.portlandciviclab.org/privacy" },
};

const EFFECTIVE_DATE = "June 10, 2026";

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--color-paper)]">
      <section className="mx-auto max-w-[900px] px-5 py-14 sm:px-8 sm:py-18">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[var(--color-ember)]" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Privacy
          </span>
        </div>
        <h1 className="font-editorial-normal text-[40px] sm:text-[48px] text-[var(--color-ink)] leading-[1.08] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-ink-muted)]">
          Effective {EFFECTIVE_DATE} · Operated by Portland Civic Lab LLC
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-[var(--color-ink-light)]">
          <section>
            <h2 className="font-editorial text-[24px] text-[var(--color-ink)] mb-3">
              The short version
            </h2>
            <p>
              We exist to make public data usable, not to collect data about
              you. We gather the minimum needed to run the site: an account if
              you choose to become a member, your message if you contact us,
              and basic anonymous usage statistics. We never sell your
              information, and we never share it except as needed to operate
              the services described below.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-[24px] text-[var(--color-ink)] mb-3">
              What we collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-[var(--color-ink)]">Member accounts.</strong>{" "}
                If you sign up, we store your name, email address, and profile
                photo (if provided) along with your membership activity.
                Sign-in is handled by WorkOS, our authentication provider.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Contact form.</strong>{" "}
                Your name, email, and message, used only to read and respond
                to your note.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Usage analytics.</strong>{" "}
                We use Google Analytics to understand which pages are useful.
                This involves cookies and anonymous usage data; we don&apos;t
                connect it to your identity.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Civic concierge.</strong>{" "}
                Messages you type into the AI concierge are sent to Anthropic
                (the AI provider) to generate a response. Don&apos;t put
                sensitive personal information in chat messages.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-[24px] text-[var(--color-ink)] mb-3">
              What we never do
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sell or rent your personal information — to anyone, ever.</li>
              <li>Use your email for anything other than replying to you or membership communications you&apos;ve opted into.</li>
              <li>Publish anything you submit privately without your permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-editorial text-[24px] text-[var(--color-ink)] mb-3">
              Your choices
            </h2>
            <p>
              You can browse everything on this site without an account. To
              see, correct, or delete the information we hold about you —
              including deleting your member account entirely — send a note
              through the <Link href="/contact" className="text-[var(--color-canopy)] underline">contact form</Link> and
              we&apos;ll take care of it.
            </p>
          </section>

          <section>
            <h2 className="font-editorial text-[24px] text-[var(--color-ink)] mb-3">
              Who we are
            </h2>
            <p>
              This site is operated by Portland Civic Lab LLC, a for-profit
              company in Portland, Oregon that builds free, public civic tools
              and does paid decision work for property owners, public
              institutions, and other clients. We&apos;re independent and not
              affiliated with the City of Portland. We&apos;ll update this policy as the project grows;
              material changes will be noted on this page with a new effective
              date.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
