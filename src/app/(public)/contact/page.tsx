import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Portland Civic Lab — flag a data error, request a dashboard, ask about the permitting tools, or suggest a project.",
  alternates: { canonical: "https://www.portlandciviclab.org/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[]; project?: string | string[] }>;
}) {
  const params = await searchParams;
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const rawProject = Array.isArray(params.project) ? params.project[0] : params.project;
  const project = rawProject?.trim().slice(0, 120);
  const defaultMessage = project
    ? `I'd like to work on ${project}.\n\nWhat I can do (research, data, code, design, records requests, a professional skill):\n\nHow much time I have:\n`
    : undefined;
  return (
    <div className="bg-[var(--color-paper)]">
      <section className="relative overflow-hidden bg-[var(--color-canopy)] noise-overlay">
        <div className="absolute right-0 top-0 h-[420px] w-[520px] translate-x-1/4 -translate-y-1/3 rounded-full bg-[var(--color-canopy-light)] opacity-25 blur-[150px]" />
        <div className="mx-auto max-w-[1400px] 3xl:max-w-[1800px] px-5 py-14 sm:px-8 sm:py-18 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-ember)]/85">
              <span>Contact</span>
              <div className="h-px w-8 bg-[var(--color-ember)]/60" />
              <span>We read every message</span>
            </div>
            <h1 className="mt-6 font-editorial-normal text-[42px] leading-[1.02] tracking-tight text-white sm:text-[56px]">
              Get in touch
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/70 sm:text-[18px]">
              Spot a number that looks wrong? Want a dashboard for something
              we&apos;re not tracking yet? Have a question about the permitting
              tools, or a project we should team up on? Send a note and
              we&apos;ll get back to you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] 3xl:max-w-[1800px] grid-cols-1 gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <ContactForm defaultTopic={topic} defaultMessage={defaultMessage} />
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[var(--color-canopy)]/8 text-[var(--color-canopy)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-editorial text-[28px] leading-tight text-[var(--color-ink)]">
                What happens next
              </h2>
              <div className="mt-5 space-y-4 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
                <p>
                  Your message comes straight to the Portland Civic Lab team. We
                  read every note that comes in.
                </p>
                <p>
                  If you&apos;ve flagged a data error, we&apos;ll look into it
                  and fix it. If you&apos;ve asked something that needs a reply,
                  we&apos;ll use your email to get back to you — and nothing
                  else.
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-6">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                Useful context
              </div>
              <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
                  <span>Include the dashboard URL if you are flagging data.</span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
                  <span>
                    For permitting questions, describe the property or workflow
                    problem rather than sending private documents.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
                  <span>
                    For a property screening, give the address or the list, the
                    decision you are making, and when you need to make it.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
                  <span>
                    For institutional work, name the decision, who owns it, and
                    the process your organization buys through.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
                  <span>
                    For partnership requests, note the decision, audience, and
                    timeline you are working against.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
