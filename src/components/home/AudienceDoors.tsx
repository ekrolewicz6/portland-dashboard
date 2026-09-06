"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export type Door = {
  key: string;
  pill: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
  img: { src: string; alt: string; position?: string; caption: string };
};

function Action({
  label,
  href,
  external,
  primary,
}: {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
}) {
  const cls = primary
    ? "inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-canopy)] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-canopy-mid)]"
    : "inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-canopy)] hover:underline";
  const icon = external ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;
  if (external || href.startsWith("#")) {
    return (
      <a href={href} className={cls}>
        {label}
        {icon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
      {icon}
    </Link>
  );
}

export default function AudienceDoors({ doors }: { doors: Door[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const door = doors[active];

  return (
    <div>
      {/* Selector */}
      <div
        role="tablist"
        aria-label="Who are you"
        className="flex flex-wrap gap-2"
      >
        {doors.map((d, i) => {
          const selected = i === active;
          return (
            <button
              key={d.key}
              role="tab"
              id={`${id}-tab-${d.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActive((a) => (a + 1) % doors.length);
                if (e.key === "ArrowLeft") setActive((a) => (a - 1 + doors.length) % doors.length);
              }}
              className={`rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                selected
                  ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white"
                  : "border-[var(--color-parchment)] bg-white text-[var(--color-ink)] hover:border-[var(--color-sage)]"
              }`}
            >
              {d.pill}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        key={door.key}
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${door.key}`}
        className="mt-8 grid grid-cols-1 items-center gap-8 rounded-sm border border-[var(--color-parchment)] bg-white p-6 animate-fade-in sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10"
      >
        <div className="lg:col-span-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ember)]">
            {door.eyebrow}
          </p>
          <h3 className="mt-3 max-w-xl font-editorial text-[30px] leading-tight text-[var(--color-ink)] sm:text-[38px]">
            {door.title}
          </h3>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-light)]">{door.body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Action {...door.cta} primary />
            {door.secondary && <Action {...door.secondary} />}
          </div>
        </div>
        <div className="lg:col-span-6">
          {door.cta.external || door.cta.href.startsWith("#") ? (
            <a href={door.cta.href} className="group block">
              <Frame door={door} />
            </a>
          ) : (
            <Link href={door.cta.href} className="group block">
              <Frame door={door} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Frame({ door }: { door: Door }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
      <Image
        src={door.img.src}
        alt={door.img.alt}
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        className={`object-cover ${door.img.position ?? "object-top"} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
      />
      <div className="pointer-events-none absolute left-3 top-3 rounded-sm bg-[var(--color-canopy)]/85 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember-bright)] ring-1 ring-white/10 backdrop-blur-sm">
        {door.img.caption}
      </div>
    </div>
  );
}
