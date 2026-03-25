import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  Shield,
  Home,
  Users,
  BookOpen,
  Zap,
  Sun,
  Scale,
} from "lucide-react";

/* ─── Dashboard data views ──────────────────────────────────────────── */

const dataViews = [
  {
    icon: Leaf,
    id: "climate",
    question: "Is Portland Meeting Its Climate Commitments?",
    stat: "47",
    statLabel: "CEW actions tracked with bureau accountability",
    accent: "#2d6a4f",
  },
  {
    icon: Home,
    id: "housing",
    question: "Are We Building Enough?",
    stat: "126,798",
    statLabel: "permits processed — 1,707 residential in pipeline",
    accent: "#b85c6a",
  },
  {
    icon: Shield,
    id: "safety",
    question: "Are People Safe?",
    stat: "613K",
    statLabel: "crime records analyzed (2016–2026)",
    accent: "#b85c3a",
  },
  {
    icon: Users,
    id: "homelessness",
    question: "Are People Getting Housed?",
    stat: "10,526",
    statLabel: "people homeless (2025 PIT count)",
    accent: "#8b6c5c",
  },
  {
    icon: Zap,
    id: "economy",
    question: "Can People Make a Living?",
    stat: "38,197",
    statLabel: "businesses · 412K jobs · 4.9% unemployment",
    accent: "#c8956c",
  },
  {
    icon: BookOpen,
    id: "education",
    question: "Are Kids Learning?",
    stat: "42,623",
    statLabel: "PPS students across 102 schools",
    accent: "#3d7a5a",
  },
  {
    icon: Sun,
    id: "quality",
    question: "Does Portland Work as a Place to Live?",
    stat: "317",
    statLabel: "parks across 11,380 acres — avg PCI 44 (Fair)",
    accent: "#6a7f8a",
  },
  {
    icon: Scale,
    id: "accountability",
    question: "Who Promised What?",
    stat: "13",
    statLabel: "elected officials and their commitments",
    accent: "#8a5c6a",
  },
];

const principles = [
  {
    icon: BarChart3,
    title: "Real Data Only",
    description:
      "Every metric is sourced from public records, government APIs, and verified datasets. No projections, no marketing copy.",
  },
  {
    icon: BookOpen,
    title: "Open Methodology",
    description:
      "Open data, open methodology, open books. If we can't show the math, we won't make the claim.",
  },
  {
    icon: Users,
    title: "Built for Portlanders",
    description:
      "Every question on the dashboard is one Portland residents are actually asking. We measure what matters to the people who live here.",
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

        <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-8 animate-fade-up">
              <div className="w-10 h-px bg-[var(--color-ember)]" />
              <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
                Portland civic data, in public
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
              Portland Civic Lab tracks the questions that matter — climate
              commitments, housing production, public safety, fiscal health —
              using real data from public records and government APIs. Updated
              automatically. No spin.
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
                href="/progress-report"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-[14px] font-medium rounded hover:bg-white/8 transition-colors"
              >
                Read the Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom edge gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      </section>

      {/* ── Data Views Grid ── */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[var(--color-ember)]" />
            <span className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
              What We Track
            </span>
            <div className="w-8 h-px bg-[var(--color-ember)]" />
          </div>
          <h2 className="font-editorial-normal text-[36px] sm:text-[48px] text-[var(--color-ink)] leading-tight">
            The questions that drive<br />
            <span className="font-editorial text-[var(--color-canopy)]">
              Portland&apos;s story
            </span>
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-ink-muted)] max-w-lg mx-auto leading-relaxed">
            Each dashboard view is built from live data — automatically updated
            from public records, city APIs, and government data portals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dataViews.map((view, i) => (
            <Link
              key={view.id}
              href={`/dashboard/${view.id}`}
              className="metric-card text-left w-full group animate-fade-up"
              style={{ "--accent-color": view.accent, animationDelay: `${400 + i * 60}ms` } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <h2 className="font-editorial text-[20px] lg:text-[22px] 2xl:text-[24px] text-[var(--color-ink)] leading-snug">
                  {view.question}
                </h2>
                <ArrowRight className="w-5 h-5 text-[var(--color-ink-muted)]/20 group-hover:text-[var(--color-ink-muted)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>

              <p className="text-[42px] lg:text-[48px] 2xl:text-[54px] font-bold text-[var(--color-ink)] tracking-tight leading-none">
                {view.stat}
              </p>
              <p className="text-[15px] lg:text-[16px] text-[var(--color-ink-muted)] mt-3 leading-snug">
                {view.statLabel}
              </p>

              <div className="mt-6 pt-4 border-t border-[var(--color-parchment)] flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] group-hover:text-[var(--color-canopy)] transition-colors">
                  Explore data
                </span>
                <view.icon className="w-5 h-5 text-[var(--color-ink-muted)]/30" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-semibold rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
          >
            Open the Full Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="bg-[var(--color-canopy)] noise-overlay">
        <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
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
            {principles.map((p) => (
              <div key={p.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/15 flex items-center justify-center">
                  <p.icon className="w-5 h-5 text-[var(--color-ember)]" />
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed max-w-xs mx-auto">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-10 sm:p-14 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-ember)]" />
          <h2 className="font-editorial-normal text-[32px] sm:text-[40px] text-[var(--color-ink)] leading-tight">
            Have a question about Portland?
          </h2>
          <p className="text-[15px] text-[var(--color-ink-muted)] mt-4 max-w-lg mx-auto leading-relaxed">
            The Civic Concierge can answer questions about Portland government
            data, permits, zoning, public services, and more — powered by AI
            with real city data behind it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/concierge"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-semibold rounded hover:bg-[var(--color-canopy-mid)] transition-colors"
            >
              Ask the Concierge
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
