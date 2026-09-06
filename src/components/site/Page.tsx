import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * The shared kit for the Lab's top-level pages. Every page uses the same
 * moves: an editorial hero with a real artifact beside it, section heads
 * with the lede set to the right, prices as a ledger, rules as numbered
 * lists, and one dark closing band with a single action.
 */

export const SHELL = "mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 3xl:max-w-[1800px]";

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px w-8 bg-[var(--color-ember)]" />
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${
          light ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className={`${SHELL} pb-14 pt-14 sm:pt-20 lg:pb-20`}>
      <div className={`grid grid-cols-1 gap-10 ${aside ? "lg:grid-cols-12 lg:gap-14" : ""}`}>
        <div className={aside ? "lg:col-span-7" : "max-w-4xl"}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="max-w-3xl font-editorial-normal text-[40px] leading-[1.03] text-[var(--color-ink)] animate-fade-up sm:text-[56px] lg:text-[64px]">
            {title}
          </h1>
          <p
            className="mt-7 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-light)] animate-fade-up sm:text-[19px]"
            style={{ animationDelay: "80ms" }}
          >
            {lede}
          </p>
          {actions && (
            <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
              {actions}
            </div>
          )}
        </div>
        {aside && (
          <div className="lg:col-span-5 lg:pt-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

export function PrimaryAction({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]";
  return external ? (
    <a href={href} className={cls}>
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function QuietAction({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-canopy)] hover:underline";
  return external ? (
    <a href={href} className={cls}>
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
        <h2 className={`font-editorial text-[30px] leading-tight sm:text-[40px] ${light ? "text-white" : "text-[var(--color-ink)]"}`}>
          {title}
        </h2>
      </div>
      {lede && (
        <p className={`max-w-md text-[14.5px] leading-relaxed md:text-right ${light ? "text-white/65" : "text-[var(--color-ink-light)]"}`}>
          {lede}
        </p>
      )}
    </div>
  );
}

export type LedgerRow = {
  name: string;
  price: string;
  detail: string;
  components?: { label: string; range: string }[];
};

export function Ledger({ rows }: { rows: LedgerRow[] }) {
  return (
    <div className="divide-y divide-[var(--color-parchment)] border-y border-[var(--color-parchment)]">
      {rows.map((r) => (
        <div key={r.name} className="py-6">
          <div className="flex items-baseline gap-4">
            <h3 className="font-editorial text-[22px] leading-tight text-[var(--color-ink)] sm:text-[24px]">{r.name}</h3>
            <span className="mb-1.5 hidden flex-1 border-b border-dotted border-[var(--color-ink-muted)]/50 sm:block" aria-hidden />
            <span className="ml-auto whitespace-nowrap font-mono text-[16px] font-semibold tabular-nums text-[var(--color-canopy)] sm:ml-0">
              {r.price}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed text-[var(--color-ink-light)]">{r.detail}</p>
          {r.components && (
            <ul className="mt-4 max-w-3xl space-y-1.5 border-l-2 border-[var(--color-parchment)] pl-4">
              {r.components.map((c) => (
                <li key={c.label} className="flex items-baseline gap-3 text-[13.5px]">
                  <span className="text-[var(--color-ink-light)]">{c.label}</span>
                  <span className="mb-1 flex-1 border-b border-dotted border-[var(--color-ink-muted)]/40" aria-hidden />
                  <span className="whitespace-nowrap font-mono tabular-nums text-[var(--color-ink)]">{c.range}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function NumberedList({
  items,
  columns = 2,
  light = false,
}: {
  items: { title: string; body: string; note?: string }[];
  columns?: 1 | 2 | 3 | 4;
  light?: boolean;
}) {
  const cols = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" }[columns];
  return (
    <ol className={`grid grid-cols-1 gap-x-10 gap-y-8 ${cols}`}>
      {items.map((it, i) => (
        <li
          key={it.title}
          className={`flex gap-4 border-t pt-5 ${light ? "border-white/15" : "border-[var(--color-ink)]/20"}`}
        >
          <span className={`w-8 shrink-0 font-mono text-[12px] font-bold ${light ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"}`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className={`font-editorial text-[22px] leading-tight ${light ? "text-white" : "text-[var(--color-ink)]"}`}>{it.title}</h3>
            <p className={`mt-2 text-[14.5px] leading-relaxed ${light ? "text-white/70" : "text-[var(--color-ink-light)]"}`}>{it.body}</p>
            {it.note && (
              <p className={`mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${light ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ember)]"}`}>
                {it.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ArtifactFrame({
  src,
  alt,
  caption,
  href,
  external,
  position = "object-top",
  aspect = "aspect-[16/10]",
}: {
  src: string;
  alt: string;
  caption: string;
  href?: string;
  external?: boolean;
  position?: string;
  aspect?: string;
}) {
  const frame = (
    <div className={`relative ${aspect} overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)]`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className={`object-cover ${position} transition-transform duration-500 ease-out group-hover:scale-[1.02]`} />
      <div className="pointer-events-none absolute left-3 top-3 rounded-sm bg-[var(--color-canopy)]/85 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)] ring-1 ring-white/10 backdrop-blur-sm">
        {caption}
      </div>
    </div>
  );
  if (!href) return frame;
  return external ? (
    <a href={href} className="group block">{frame}</a>
  ) : (
    <Link href={href} className="group block">{frame}</Link>
  );
}

/** A document-shaped artifact: mono header, numbered rows, mono footer. */
export function Document({
  header,
  rows,
  footer,
}: {
  header: { left: string; right?: string };
  rows: { n: string; title: string; body: string }[];
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-white shadow-[0_2px_4px_rgba(15,36,25,0.05),0_24px_48px_-24px_rgba(15,36,25,0.25)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        <span className="text-[var(--color-ember)]">{header.left}</span>
        {header.right && <span>{header.right}</span>}
      </div>
      <ol className="divide-y divide-[var(--color-parchment)]">
        {rows.map((r) => (
          <li key={r.n} className="flex gap-4 px-5 py-4">
            <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-[var(--color-ember)]">{r.n}</span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">{r.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-light)]">{r.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {footer && (
        <div className="border-t border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
          {footer}
        </div>
      )}
    </div>
  );
}

export function ClosingCta({
  eyebrow,
  title,
  body,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
}) {
  const p = primary.external ? (
    <a href={primary.href} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-6 py-3.5 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
      {primary.label}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={primary.href} className="inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-ember)] px-6 py-3.5 text-[15px] font-semibold text-[var(--color-canopy)] transition-colors hover:bg-[var(--color-ember-bright)]">
      {primary.label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
  const s = secondary ? (
    secondary.external ? (
      <a href={secondary.href} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-white hover:underline">
        {secondary.label}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    ) : (
      <Link href={secondary.href} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-white hover:underline">
        {secondary.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    )
  ) : null;
  return (
    <section className="bg-[var(--color-canopy)] noise-overlay">
      <div className={`${SHELL} relative z-10 py-16 sm:py-20`}>
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow light>{eyebrow}</Eyebrow>
            <h2 className="max-w-3xl font-editorial text-[32px] leading-tight text-white sm:text-[44px]">{title}</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/70">{body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-4 lg:justify-end">
            {p}
            {s}
          </div>
        </div>
      </div>
    </section>
  );
}
