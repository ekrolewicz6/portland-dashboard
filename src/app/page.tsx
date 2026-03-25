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
    title: "Climate Accountability",
    description:
      "All 43 Climate Emergency Workplan actions, bureau performance, PCEF spending, and emissions trajectory vs. 2030 goals.",
    color: "text-green-400",
    bg: "bg-green-900/20",
  },
  {
    icon: Home,
    id: "housing",
    title: "Housing",
    description:
      "Building permits, median rents, home values, and housing completions across Portland.",
    color: "text-rose-400",
    bg: "bg-rose-900/20",
  },
  {
    icon: Shield,
    id: "safety",
    title: "Public Safety",
    description:
      "Crime data, 911 response times, officer staffing, and use-of-force trends.",
    color: "text-amber-400",
    bg: "bg-amber-900/20",
  },
  {
    icon: Users,
    id: "homelessness",
    title: "Homelessness",
    description:
      "Shelter capacity, Point-in-Time counts, permanent supportive housing, and behavioral health services.",
    color: "text-stone-300",
    bg: "bg-stone-800/30",
  },
  {
    icon: Zap,
    id: "economy",
    title: "Economy",
    description:
      "Business registrations, commercial vacancy, employment data, wages by sector, and downtown vitality.",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
  },
  {
    icon: BookOpen,
    id: "education",
    title: "Education",
    description:
      "PPS enrollment, test scores, graduation rates, and teacher staffing ratios.",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20",
  },
  {
    icon: Sun,
    id: "quality",
    title: "Quality of Life",
    description:
      "Park access, library services, street conditions, and 311 service request trends.",
    color: "text-slate-300",
    bg: "bg-slate-800/30",
  },
  {
    icon: Scale,
    id: "accountability",
    title: "Accountability",
    description:
      "Elected officials, ballot measure outcomes, campaign finance, and agency performance metrics.",
    color: "text-pink-400",
    bg: "bg-pink-900/20",
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
            Eight questions that drive<br />
            <span className="font-editorial text-[var(--color-canopy)]">
              Portland&apos;s story
            </span>
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-ink-muted)] max-w-lg mx-auto leading-relaxed">
            Each dashboard view is built from live data — automatically updated
            from public records, city APIs, and government data portals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataViews.map((view) => (
            <Link
              key={view.id}
              href={`/dashboard/${view.id}`}
              className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm p-6 group hover:border-[var(--color-sage)] hover:shadow-[0_8px_32px_rgba(15,36,25,0.06)] transition-all duration-300"
            >
              <div className={`w-9 h-9 rounded-sm ${view.bg} flex items-center justify-center mb-4`}>
                <view.icon className={`w-4.5 h-4.5 ${view.color}`} />
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--color-ink)] mb-2">
                {view.title}
              </h3>
              <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                {view.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[var(--color-canopy)] group-hover:gap-2 transition-all">
                View data <ArrowRight className="w-3 h-3" />
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
