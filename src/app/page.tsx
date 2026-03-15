import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  FileText,
  Shield,
  Users,
} from "lucide-react";

/* ─── Static data for the landing page ─────────────────────────────── */

const stats = [
  { value: "347", label: "Certified Businesses" },
  { value: "1,240", label: "Jobs Created" },
  { value: "89%", label: "1-Year Survival Rate" },
  { value: "$3.2K", label: "Avg Commons Credit" },
];

const pillars = [
  {
    icon: BarChart3,
    title: "Civic Dashboard",
    description:
      "Seven questions that drive Portland's story, answered with real data. Updated automatically from public records and government APIs.",
    href: "/dashboard",
    cta: "View the dashboard",
  },
  {
    icon: Shield,
    title: "PCB Certification",
    description:
      "Portland Commons Business certification signals quality, community commitment, and fair business practices to Portland residents.",
    href: "/apply",
    cta: "Apply for certification",
  },
  {
    icon: Calculator,
    title: "Benefits Calculator",
    description:
      "See exactly how much you could save with Commons Credits, tax incentives, and the collective buying power of the network.",
    href: "/calculator",
    cta: "Calculate your benefits",
  },
];

const values = [
  {
    icon: Users,
    title: "Community First",
    description:
      "Every decision is measured by its impact on the people who live, work, and build in Portland.",
  },
  {
    icon: Building2,
    title: "Radical Transparency",
    description:
      "Open data, open methodology, open books. If we can't show the math, we won't make the claim.",
  },
  {
    icon: FileText,
    title: "Earned Trust",
    description:
      "The PCB seal means something because it's hard to get. Standards without enforcement are just suggestions.",
  },
];

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ── Hero ── */}
      <section className="relative bg-[var(--color-canopy)] overflow-hidden noise-overlay">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--color-canopy-light)] rounded-full blur-[200px] opacity-30 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-ember)] rounded-full blur-[180px] opacity-[0.07] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-8 animate-fade-up">
              <div className="w-10 h-px bg-[var(--color-ember)]" />
              <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
                A civic infrastructure for Portland
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="font-editorial-normal text-[48px] sm:text-[64px] lg:text-[80px] text-white leading-[1.02] tracking-tight animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Portland deserves
              <br />
              <span className="font-editorial text-[var(--color-ember-bright)]">
                better answers.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="mt-6 text-[17px] sm:text-[19px] text-white/55 leading-relaxed max-w-xl animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Portland Commons is a member-owned organization building the data
              infrastructure, business network, and civic tools Portland needs
              to thrive. We measure what matters, certify businesses that care,
              and make the numbers public.
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded hover:bg-[var(--color-ember-bright)] transition-colors"
              >
                Explore the Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-[14px] font-medium rounded hover:bg-white/8 transition-colors"
              >
                Apply for PCB Certification
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom edge gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-20 -mt-8">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div
            className="bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm px-8 py-6 animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[var(--color-parchment)]">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center px-4">
                  <p className="text-[32px] sm:text-[36px] font-bold text-[var(--color-canopy)] tracking-tight font-mono">
                    {stat.value}
                  </p>
                  <p className="text-[12px] text-[var(--color-ink-muted)] uppercase tracking-[0.1em] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
              What We Build
            </span>
            <div className="w-8 h-px bg-[var(--color-ember)]" />
          </div>
          <h2 className="font-editorial-normal text-[36px] sm:text-[48px] text-[var(--color-ink)] leading-tight">
            Three pillars of a<br />
            <span className="font-editorial text-[var(--color-canopy)]">
              stronger Portland
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-8 group hover:border-[var(--color-sage)] hover:shadow-[0_8px_32px_rgba(15,36,25,0.06)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-sm bg-[var(--color-canopy)] flex items-center justify-center mb-5">
                <pillar.icon className="w-5 h-5 text-[var(--color-ember)]" />
              </div>
              <h3 className="text-[20px] font-semibold text-[var(--color-ink)] mb-3">
                {pillar.title}
              </h3>
              <p className="text-[14px] text-[var(--color-ink-muted)] leading-relaxed mb-6">
                {pillar.description}
              </p>
              <Link
                href={pillar.href}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-canopy)] hover:text-[var(--color-fern)] transition-colors group-hover:gap-2.5"
              >
                {pillar.cta}
                <ArrowRight className="w-3.5 h-3.5 transition-all" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
              Our Principles
            </span>
            <h2 className="font-editorial-normal text-[36px] sm:text-[44px] text-white leading-tight mt-3">
              Built on trust,{" "}
              <span className="font-editorial text-[var(--color-ember-bright)]">
                verified by data
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/15 flex items-center justify-center">
                  <value.icon className="w-5 h-5 text-[var(--color-ember)]" />
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed max-w-xs mx-auto">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-ember)]" />
          <h2 className="font-editorial-normal text-[32px] sm:text-[40px] text-[var(--color-ink)] leading-tight">
            Ready to join the Commons?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-muted)] mt-4 max-w-lg mx-auto leading-relaxed">
            Whether you&apos;re a business owner, landlord, or resident who
            believes Portland can do better — there&apos;s a place for you here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-semibold rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
            >
              Apply for Certification
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3 border border-[var(--color-parchment)] text-[var(--color-ink)] text-[14px] font-medium rounded hover:bg-[var(--color-paper)] transition-colors"
            >
              Explore the Data
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
