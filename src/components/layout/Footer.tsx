import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ASK_PORTLAND_URL,
  COUNCIL_URL,
  DOWNTOWN_URL,
  LEGAL_ENTITY,
  OREGON_GOVERNANCE_URL,
  PARKS_URL,
  PERMITS_URL,
} from "@/lib/site";
import SsoLink from "@/components/SsoLink";

type FooterLink = { label: string; href: string; external?: boolean; sso?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Dashboards", href: "/dashboard" },
      { label: "Deep-Dives", href: "/deep-dives" },
      { label: "Decisions register", href: "/decisions" },
      { label: "Org Chart", href: "/org-chart" },
      { label: "Business Directory", href: "/directory" },
      { label: "Civic Concierge", href: "/concierge" },
    ],
  },
  {
    title: "Civic tools",
    links: [
      { label: "Portland Possible", href: DOWNTOWN_URL, external: true },
      { label: "Parks Atlas", href: PARKS_URL, external: true },
      { label: "Oregon Governance Atlas", href: OREGON_GOVERNANCE_URL, external: true },
      { label: "City Council", href: COUNCIL_URL, external: true },
      { label: "Ask Portland", href: ASK_PORTLAND_URL, external: true },
      { label: "Portland Permits", href: PERMITS_URL, external: true, sso: true },
    ],
  },
  {
    title: "Work with us",
    links: [
      { label: "Property owners & developers", href: "/property" },
      { label: "Public institutions", href: "/institutions" },
      { label: "Small businesses", href: "/business" },
      { label: "Founding support", href: "/donate" },
      { label: "Volunteer", href: "/volunteer" },
      { label: "Propose a topic", href: "/proposals" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About the Lab", href: "/about" },
      { label: "Independence & funding", href: "/independence" },
      { label: "Methodology", href: "/methodology" },
      { label: "Open data & API", href: "/open-data" },
      { label: "Public records tracker", href: "/records" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const cls =
    "group inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors";
  const inner = (
    <>
      {link.label}
      {link.external && (
        <ArrowUpRight className="w-3 h-3 text-white/30 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      )}
    </>
  );
  return (
    <li>
      {link.sso ? (
        <SsoLink href={link.href} className={cls}>
          {inner}
        </SsoLink>
      ) : link.external ? (
        <a href={link.href} className={cls}>
          {inner}
        </a>
      ) : (
        <Link href={link.href} className={cls}>
          {inner}
        </Link>
      )}
    </li>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[var(--color-canopy)] text-white/60 mt-20">
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-ember)]/40 to-transparent" />

      <div className="relative z-10 max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 lg:pr-10">
            <div className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L6 8v12l8 6 8-6V8l-8-6z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-sage)]" />
                <path d="M14 6l-4 3v8l4 3 4-3v-8l-4-3z" fill="currentColor" className="text-[var(--color-ember)]" opacity="0.85" />
                <circle cx="14" cy="14" r="2" fill="white" opacity="0.9" />
              </svg>
              <h3 className="font-editorial-normal text-[22px] text-white leading-none">Portland Civic Lab</h3>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-ember)]/70">Est. 2026</span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/55">
              Free, source-linked tools for understanding Portland, and paid decision work for
              the owners and institutions who run it, at published prices.
            </p>
            <Link
              href="/donate"
              className="mt-6 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/[0.04] px-4 py-2 text-[12px] font-mono uppercase tracking-[0.14em] text-white hover:bg-white/10 transition-colors"
            >
              Support the lab
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-1 lg:col-span-2">
              <h4 className="text-[10px] font-mono font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <FooterLinkItem key={l.label} link={l} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[12px] text-white/45 max-w-2xl">
            &copy; {year} {LEGAL_ENTITY} &middot; Free, public civic tools — independent and not
            affiliated with the City of Portland or any government agency.
          </p>
          <div className="flex items-center gap-5 text-[12px] text-white/45">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Editorial watermark — bleeds off the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -bottom-[0.18em] left-0 right-0 text-center font-editorial italic leading-none text-white/[0.035] whitespace-nowrap"
        style={{ fontSize: "clamp(64px, 14vw, 240px)" }}
      >
        Portland Civic Lab
      </div>
    </footer>
  );
}
