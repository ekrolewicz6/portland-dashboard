import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BadgeCheck, Eye, Repeat2, ShieldCheck } from "lucide-react";
import DonationForm from "@/components/donate/DonationForm";
import { DOWNTOWN_URL, OREGON_GOVERNANCE_URL, PARKS_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support the work — Portland Civic Lab",
  description:
    "Back Portland Civic Lab. Eight free, source-linked civic tools, kept free by the people who use them. Monthly or one-time through Stripe, or founding support that funds one named program for a year. Contributions aren't tax-deductible.",
  alternates: { canonical: "https://www.portlandciviclab.org/donate" },
};

const PROOF = [
  { v: "8", k: "free public tools" },
  { v: "316", k: "parks mapped" },
  { v: "5,275", k: "downtown parcels" },
  { v: "13", k: "deep-dives, every figure sourced" },
];

const MOSAIC = [
  { src: "/images/home/downtown.jpg", alt: "Downtown parcel map", label: "Portland Possible", href: DOWNTOWN_URL, external: true },
  { src: "/images/home/parks-b.jpg", alt: "Parks Atlas", label: "Parks Atlas", href: PARKS_URL, external: true, position: "object-top" },
  { src: "/images/home/continuum.jpg", alt: "The homelessness continuum, stage by stage", label: "The continuum", href: "/deep-dives/continuum", position: "object-top" },
  { src: "/images/home/oregon.jpg", alt: "Oregon Governance Atlas", label: "Oregon Atlas", href: OREGON_GOVERNANCE_URL, external: true, position: "object-top" },
];

const PROGRAMS = [
  {
    n: "01",
    title: "The homelessness continuum",
    line: "Every figure checked again each quarter with the people at the door.",
    href: "/deep-dives/continuum",
    img: { src: "/images/home/continuum.jpg", alt: "The homelessness continuum page, showing where the system breaks stage by stage", position: "object-top" },
  },
  {
    n: "02",
    title: "The Parks Atlas",
    line: "All 316 parks, with records reconciled and events kept current through the year.",
    href: PARKS_URL,
    external: true,
    img: { src: "/images/home/parks-b.jpg", alt: "The Parks Atlas map of Portland", position: "object-top" },
  },
  {
    n: "03",
    title: "The next deep-dives",
    line: "Six weeks of sourced research on whatever question readers propose next.",
    href: "/deep-dives",
    img: { src: "/images/home/pps-b.jpg", alt: "The PPS budget deep-dive", position: "object-top" },
  },
];

const RECEIVE = [
  "Named on the program page and the work",
  "A quarterly two-page update",
  "An annual public account of what it produced",
  "No say over what the work concludes",
];

const TRUST = [
  { icon: ShieldCheck, text: "Stripe Checkout. We never see your card." },
  { icon: Repeat2, text: "Monthly support cancels anytime." },
  { icon: Eye, text: "Every sponsored program is listed on the Independence page." },
  { icon: BadgeCheck, text: "Sponsors pay for the question, not the answer." },
];

export default function DonatePage() {
  return (
    <div className="bg-[var(--color-paper)]">
      {/* ── Hero: the ask, the proof, the form ── */}
      <section className="relative overflow-hidden bg-[var(--color-canopy)] noise-overlay text-white">
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-start gap-x-12 gap-y-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:px-12 3xl:max-w-[1800px]">
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ember)]">
              <span>Support the lab</span>
              <span className="h-px w-8 bg-[var(--color-ember)]/60" />
              <span>Free tools, kept free</span>
            </div>
            <h1 className="mt-5 max-w-3xl font-editorial-normal text-[40px] leading-[1.02] tracking-tight sm:text-[52px] lg:text-[60px]">
              Keep Portland&apos;s numbers checkable.
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">
              Eight free civic tools, with every figure linked to its source. Support keeps them
              free and current, and pays for whatever we build next.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/12 pt-6 sm:grid-cols-4">
              {PROOF.map((s) => (
                <div key={s.k}>
                  <dd className="font-mono text-[26px] font-bold tabular-nums leading-none text-white">{s.v}</dd>
                  <dt className="mt-2 text-[12.5px] leading-snug text-white/60">{s.k}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <DonationForm />
          </div>

          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <div className="grid grid-cols-2 gap-3">
              {MOSAIC.map((m) => {
                const inner = (
                  <>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm ring-1 ring-white/15">
                      <Image
                        src={m.src}
                        alt={m.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        className={`object-cover ${m.position ?? "object-center"} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
                      />
                    </div>
                    <span className="mt-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 group-hover:text-white">
                      {m.label}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </>
                );
                return m.external ? (
                  <a key={m.label} href={m.href} className="group block">{inner}</a>
                ) : (
                  <Link key={m.label} href={m.href} className="group block">{inner}</Link>
                );
              })}
            </div>

            <p className="mt-6 max-w-2xl text-[13.5px] leading-relaxed text-white/55">
              We set the Lab up as a company rather than a nonprofit so the free tools could run
              on our own earnings instead of grant cycles. The downside is that support
              isn&apos;t tax-deductible.
            </p>
          </div>
        </div>
      </section>

      {/* ── Founding support: one program, one year, your name on it ── */}
      <section className="border-b border-[var(--color-parchment)]">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 3xl:max-w-[1800px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--color-ember)]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
                  Founding support · $10,000 to $25,000 a year
                </span>
              </div>
              <h2 className="font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[40px]">
                Fund one program for a year, and be named on it.
              </h2>
            </div>
            <Link
              href="/contact?topic=Founding%20support"
              className="inline-flex items-center justify-center gap-2 self-start rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)] md:self-auto"
            >
              Talk about founding support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROGRAMS.map((p) => {
              const inner = (
                <>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white">
                    <Image
                      src={p.img.src}
                      alt={p.img.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={`object-cover ${p.img.position} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
                    />
                  </div>
                  <div className="mt-4 flex items-start gap-3">
                    <span className="mt-1 font-mono text-[12px] font-bold text-[var(--color-ember)]">{p.n}</span>
                    <div>
                      <h3 className="font-editorial text-[22px] leading-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-canopy)]">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{p.line}</p>
                    </div>
                  </div>
                </>
              );
              return p.external ? (
                <a key={p.n} href={p.href} className="group block">{inner}</a>
              ) : (
                <Link key={p.n} href={p.href} className="group block">{inner}</Link>
              );
            })}
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RECEIVE.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2.5 rounded-sm border border-[var(--color-parchment)] bg-white px-4 py-3 text-[14px] leading-snug text-[var(--color-ink)]"
              >
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-canopy)]" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12 3xl:max-w-[1800px]">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.text} className="flex items-start gap-3 text-[14px] leading-snug text-[var(--color-ink-light)]">
              <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-ember)]" />
              {t.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
