"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Trees,
  ClipboardList,
  Landmark,
  MapPinned,
  ArrowUpRight,
  ArrowRight,
  Building2,
  Gauge,
  Store,
  HeartHandshake,
  Map,
  Vote,
  Network,
  ShieldCheck,
  BookOpen,
  Database,
  FileSearch,
  Mail,
  CalendarClock,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ASK_PORTLAND_URL,
  COUNCIL_URL,
  DOWNTOWN_URL,
  OREGON_GOVERNANCE_URL,
  PARKS_URL,
  PERMITS_URL,
} from "@/lib/site";
import { withSsoHint } from "@/components/SsoLink";
import type { HeaderMember } from "@/lib/member-nav";

type NavItem = {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
  external?: boolean;
};

type Featured = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
  img: { src: string; alt: string; position?: string };
};

type MenuKey = "tools" | "work" | "about";

type MenuDef = {
  key: MenuKey;
  label: string;
  title: string;
  items: NavItem[];
  featured: Featured;
  /** Short mono facts under the item list, e.g. the rules that apply. */
  notes: string[];
};

const PRIMARY = [
  { label: "Dashboards", href: "/dashboard" },
  { label: "Deep-Dives", href: "/deep-dives" },
];

const TOOLS: NavItem[] = [
  { label: "Portland Possible", href: DOWNTOWN_URL, desc: "Every downtown parcel, and what it could become", icon: Map, external: true },
  { label: "Parks Atlas", href: PARKS_URL, desc: "All 316 parks, searchable by what you want to do", icon: Trees, external: true },
  { label: "Oregon Governance Atlas", href: OREGON_GOVERNANCE_URL, desc: "Who controls the next step of every bill", icon: Vote, external: true },
  { label: "City Council", href: COUNCIL_URL, desc: "What Council takes up next, and how to testify", icon: Landmark, external: true },
  { label: "Ask Portland", href: ASK_PORTLAND_URL, desc: "Independent surveys, weighted to the whole city", icon: ClipboardList, external: true },
  { label: "Portland Permits", href: PERMITS_URL, desc: "Zoning, likely permits, fees, and timelines", icon: MapPinned, external: true },
  { label: "Org Chart", href: "/org-chart", desc: "Who runs what at the City, bureau by bureau", icon: Network },
  { label: "Decisions register", href: "/decisions", desc: "Every open decision in the City's portfolio, dated and sourced", icon: CalendarClock },
];

const WORK: NavItem[] = [
  { label: "Commission research or a build", href: "/contact?topic=Commission%20research%20or%20a%20build", desc: "A question, a decision, or a tool, scoped from the record", icon: FileSearch },
  { label: "Property owners & developers", href: "/property", desc: "Screening and decision packets, from $7,500", icon: Building2 },
  { label: "Public institutions", href: "/institutions", desc: "Portfolio intelligence at published prices", icon: Gauge },
  { label: "Small businesses", href: "/business", desc: "Find the money your business qualifies for", icon: Store },
  { label: "Supporters", href: "/donate", desc: "Founding and monthly support for the public program", icon: HeartHandshake },
];

const ABOUT: NavItem[] = [
  { label: "About the Lab", href: "/about", desc: "The idea, the people, and four ways to join", icon: Users },
  { label: "Independence & funding", href: "/independence", desc: "The rules, every contract we hold, where we're not neutral", icon: ShieldCheck },
  { label: "Methodology", href: "/methodology", desc: "How every number gets its source", icon: BookOpen },
  { label: "Open data & API", href: "/open-data", desc: "Download, embed, and build on the data", icon: Database },
  { label: "Public records tracker", href: "/records", desc: "Every request we've filed, and what came back", icon: FileSearch },
  { label: "Contact", href: "/contact", desc: "A note, a correction, or a project", icon: Mail },
];

const MENUS: MenuDef[] = [
  {
    key: "tools",
    label: "Tools",
    title: "Civic tools · free, every figure sourced",
    items: TOOLS,
    notes: ["Free", "No account needed", "Every figure linked to its source"],
    featured: {
      eyebrow: "The flagship",
      title: "Portland Possible",
      body: "Every parcel, building, and block downtown, what each could become, and the coordinated moves it would take.",
      cta: "Open the map",
      href: DOWNTOWN_URL,
      external: true,
      img: { src: "/images/home/downtown.jpg", alt: "The downtown parcel map", position: "object-center" },
    },
  },
  {
    key: "work",
    label: "Work with us",
    title: "Work with the Lab · published prices",
    items: WORK,
    notes: ["One side per matter", "Public work competed", "Every contract listed"],
    featured: {
      eyebrow: "Published prices",
      title: "Research, decisions, and builds.",
      body: "Evidence reviews from $5,000, property screening from $7,500, diagnostics from $15,000, and builds priced by the day. If it can be answered from the public record, or built from it, we can probably do it.",
      cta: "See the paid work",
      href: "/#work-with-us",
      img: { src: "/images/home/dashboards-b.jpg", alt: "A performance dashboard", position: "object-left-top" },
    },
  },
  {
    key: "about",
    label: "About",
    title: "About the Lab",
    items: ABOUT,
    notes: ["Founded in Portland, 2026", "A company, not a nonprofit", "Anyone can hire us"],
    featured: {
      eyebrow: "How we're set up",
      title: "How the Lab works",
      body: "A small core, three kinds of work, and whichever specialists, partners, and advisors each project needs, all named in the work.",
      cta: "Meet the people",
      href: "/about",
      img: { src: "/images/home/continuum.jpg", alt: "The homelessness continuum, stage by stage", position: "object-top" },
    },
  },
];

function Wordmark() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="transition-transform duration-300 group-hover:rotate-[8deg]">
        <path d="M14 2L6 8v12l8 6 8-6V8l-8-6z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-sage)]" />
        <path d="M14 6l-4 3v8l4 3 4-3v-8l-4-3z" fill="currentColor" className="text-[var(--color-ember)]" opacity="0.85" />
        <circle cx="14" cy="14" r="2" fill="white" opacity="0.9" />
      </svg>
      <span className="whitespace-nowrap font-editorial-normal text-[17px] leading-none tracking-tight text-white">
        Portland Civic Lab
      </span>
    </Link>
  );
}

const TRIGGER =
  "group relative flex items-center gap-1 whitespace-nowrap py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors";

function NavLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link href={href} className={`${TRIGGER} ${active ? "text-white" : "text-[var(--color-sage)] hover:text-white"}`}>
      {label}
      <span
        className={`absolute -bottom-0.5 left-0 h-px bg-[var(--color-ember)] transition-all duration-300 ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

function MemberBadge({ member, compact = false }: { member: HeaderMember; compact?: boolean }) {
  const href = member.role === "admin" ? "/admin" : "/member";
  const area = member.role === "admin" ? "Admin portal" : "Member area";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] text-white transition-colors hover:border-[var(--color-ember)]/45 hover:bg-white/[0.1] ${
        compact ? "p-2" : "px-2.5 py-1.5"
      }`}
      aria-label={`${area} for ${member.name}`}
    >
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--color-ember)] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-canopy)] ring-1 ring-white/15">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          member.initials
        )}
      </span>
      {!compact && (
        <span className="hidden text-left leading-none lg:block">
          <span className="block max-w-[120px] truncate text-[12px] font-semibold tracking-tight">{member.name}</span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-sage)]">
            {member.role === "admin" ? "Admin" : "Member"}
          </span>
        </span>
      )}
    </Link>
  );
}

function ItemLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const inner = (
    <>
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[var(--color-canopy)]/[0.06] text-[var(--color-canopy)] transition-colors group-hover:bg-[var(--color-ember)]/15 group-hover:text-[var(--color-clay)]">
        <item.icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[13.5px] font-semibold leading-tight text-[var(--color-ink)]">
          {item.label}
          {item.external && (
            <ArrowUpRight className="h-3 w-3 -translate-x-1 text-[var(--color-ink-muted)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          )}
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--color-ink-muted)]">{item.desc}</span>
      </span>
    </>
  );
  const cls = "group flex items-start gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-white";
  return item.external ? (
    <a href={item.href} className={cls} onClick={onNavigate}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={cls} onClick={onNavigate}>
      {inner}
    </Link>
  );
}

function FeaturedCard({ f, onNavigate }: { f: Featured; onNavigate: () => void }) {
  const inner = (
    <>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember-bright)]">{f.eyebrow}</p>
      <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-sm ring-1 ring-white/15">
        <Image
          src={f.img.src}
          alt={f.img.alt}
          fill
          sizes="320px"
          className={`object-cover ${f.img.position ?? "object-top"} transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
        />
      </div>
      <p className="mt-3 font-editorial text-[18px] leading-tight text-white">{f.title}</p>
      <p className="mt-1.5 text-[12.5px] leading-snug text-white/65">{f.body}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
        {f.cta}
        {f.external ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
      </p>
    </>
  );
  const cls = "group block h-full bg-[var(--color-canopy)] p-5";
  return f.external ? (
    <a href={f.href} className={cls} onClick={onNavigate}>
      {inner}
    </a>
  ) : (
    <Link href={f.href} className={cls} onClick={onNavigate}>
      {inner}
    </Link>
  );
}

export default function Header({ member: initialMember = null }: { member?: HeaderMember | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [member, setMember] = useState<HeaderMember | null>(initialMember);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Portland Permits lives on a different domain, so the shared session
  // cookie can't reach it. Signed-in visitors get an sso=1 hint so Permits
  // can silently establish its own session on arrival.
  const menus = member
    ? MENUS.map((m) =>
        m.key === "tools"
          ? { ...m, items: m.items.map((t) => (t.href === PERMITS_URL ? { ...t, href: withSsoHint(t.href) } : t)) }
          : m,
      )
    : MENUS;
  const tools = menus[0].items;

  const open = (key: MenuKey) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 120);
  };
  const close = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(null);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (initialMember) return;
    let cancelled = false;
    fetch("/api/member/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.member) setMember(data.member);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialMember]);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Escape and click-outside
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const active = openMenu ? menus.find((m) => m.key === openMenu) ?? null : null;

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--color-canopy)]/95 text-white backdrop-blur-sm transition-shadow duration-300 ${
        scrolled || openMenu ? "border-b border-white/10 shadow-[0_1px_24px_rgba(0,0,0,0.25)]" : "border-b border-transparent"
      }`}
    >
      <div
        ref={shellRef}
        className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 3xl:max-w-[1800px]"
        onMouseLeave={scheduleClose}
        onMouseEnter={() => {
          if (closeTimer.current) window.clearTimeout(closeTimer.current);
        }}
      >
        <div className="flex h-14 items-center justify-between gap-4">
          <Wordmark />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7" aria-label="Primary">
            {PRIMARY.map((l) => (
              <NavLink key={l.href} label={l.label} href={l.href} active={isActive(l.href)} />
            ))}
            {menus.map((m) => {
              const isOpen = openMenu === m.key;
              const routeActive = m.items.some((i) => !i.external && isActive(i.href));
              return (
                <button
                  key={m.key}
                  type="button"
                  onMouseEnter={() => open(m.key)}
                  onFocus={() => open(m.key)}
                  onClick={() => (isOpen ? close() : open(m.key))}
                  aria-expanded={isOpen}
                  aria-controls="site-megamenu"
                  className={`${TRIGGER} ${isOpen || routeActive ? "text-white" : "text-[var(--color-sage)] hover:text-white"}`}
                >
                  {m.label}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-[var(--color-ember)] transition-all duration-300 ${
                      isOpen || routeActive ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              );
            })}

            <span className="h-4 w-px bg-white/15" />

            <Link
              href="/donate"
              className={`rounded-sm px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                isActive("/donate")
                  ? "bg-white text-[var(--color-canopy)]"
                  : "bg-[var(--color-ember)] text-[var(--color-canopy)] hover:bg-[var(--color-ember-bright)]"
              }`}
            >
              Support
            </Link>
            {member ? (
              <MemberBadge member={member} />
            ) : (
              <Link
                href="/signup"
                prefetch={false}
                className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  isActive("/signup") ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                Join
              </Link>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 xl:hidden">
            {member ? (
              <MemberBadge member={member} compact />
            ) : (
              <Link
                href="/donate"
                className="inline-flex min-h-[44px] items-center rounded-sm bg-[var(--color-ember)] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-canopy)]"
              >
                Support
              </Link>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-[var(--color-sage)] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mega-menu panel: anchored to the page container, never to a trigger */}
        {active && (
          <div id="site-megamenu" className="absolute inset-x-5 top-full z-50 hidden pt-2 sm:inset-x-8 lg:inset-x-12 xl:block">
            <div
              className="overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] text-[var(--color-ink)] shadow-[0_24px_64px_rgba(15,36,25,0.28)] animate-fade-up"
              style={{ animationDuration: "0.16s" }}
            >
              <div className="grid grid-cols-12">
                <div className="col-span-8 p-5 lg:p-6">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ember)]">
                    {active.title}
                  </p>
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {active.items.map((item) => (
                      <li key={item.label}>
                        <ItemLink item={item} onNavigate={close} />
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-[var(--color-parchment)] pt-4">
                    {active.notes.map((n) => (
                      <li key={n} className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember)]" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-4">
                  <FeaturedCard f={active.featured} onNavigate={close} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[var(--color-canopy)] animate-slide-down xl:hidden">
          <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-5 sm:px-8 lg:px-12 3xl:max-w-[1800px]">
            <MobileGroup title="Explore">
              {PRIMARY.map((l) => (
                <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
              ))}
            </MobileGroup>
            <MobileGroup title="Civic tools">
              {tools.map((t) => (
                <MobileLink key={t.label} href={t.href} label={t.label} desc={t.desc} external={t.external} active={!t.external && isActive(t.href)} />
              ))}
            </MobileGroup>
            <MobileGroup title="Work with the Lab">
              {WORK.map((w) => (
                <MobileLink key={w.label} href={w.href} label={w.label} desc={w.desc} active={isActive(w.href)} />
              ))}
            </MobileGroup>
            <MobileGroup title="About">
              {ABOUT.map((a) => (
                <MobileLink key={a.label} href={a.href} label={a.label} active={isActive(a.href)} />
              ))}
            </MobileGroup>
            <MobileGroup title="Connect">
              <MobileLink href="/donate" label="Support the work" active={isActive("/donate")} />
              {member ? (
                <MobileLink
                  href={member.role === "admin" ? "/admin" : "/member"}
                  label={member.name}
                  desc={member.role === "admin" ? "Admin portal" : "Member area"}
                  active={member.role === "admin" ? isActive("/admin") : isActive("/member")}
                />
              ) : (
                <MobileLink href="/signup" label="Join the lab" active={isActive("/signup")} prefetch={false} />
              )}
            </MobileGroup>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ember)]">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  label,
  desc,
  active,
  external,
  prefetch,
}: {
  href: string;
  label: string;
  desc?: string;
  active?: boolean;
  external?: boolean;
  prefetch?: boolean;
}) {
  const cls = `flex items-center justify-between rounded-sm px-3 py-2.5 transition-colors ${
    active ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
  }`;
  const inner = (
    <>
      <span>
        <span className={`block text-[15px] ${active ? "text-white" : "text-[var(--color-sage)]"}`}>{label}</span>
        {desc && <span className="block text-[12px] text-white/45">{desc}</span>}
      </span>
      {external && <ArrowUpRight className="h-4 w-4 text-white/35" />}
    </>
  );
  return external ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} prefetch={prefetch} className={cls}>
      {inner}
    </Link>
  );
}
