import { DOORS_HOURS } from "@/lib/homeless/continuum";
import SourceLinks from "./SourceLinks";

const KIND: Record<string, { label: string; cls: string }> = {
  "walk-in": { label: "Walk in or drop off", cls: "bg-[var(--color-fern)]" },
  referral: { label: "Referral only", cls: "bg-[repeating-linear-gradient(135deg,var(--color-ember)_0_5px,#f4ebe0_5px_9px)]" },
  phone: { label: "By phone", cls: "bg-[var(--color-river)]" },
  none: { label: "No night intake", cls: "" },
  unpublished: { label: "Hours unpublished", cls: "" },
};
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
const fmt = (h: number) => (h === 0 || h === 24 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`);

/** Which doors are open at what hour on a weeknight, and who can open them. The 2 a.m. line is the test. */
export default function DoorsOpen() {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Which doors are open, hour by hour, on a weeknight</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
          {Object.entries(KIND).map(([k, v]) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-5 rounded-[2px] ${v.cls || "border border-dashed border-[var(--color-ink-muted)]"}`} />{v.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="px-5 py-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-y-2 md:grid-cols-[260px_minmax(0,1fr)] md:gap-x-5 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <div className="hidden md:block" />
          <div className="relative hidden h-5 md:block">
            {HOURS.map((h) => (
              <span key={h} className="absolute -translate-x-1/2 font-mono text-[10px] text-[var(--color-ink-muted)]" style={{ left: `${(h / 24) * 100}%` }}>{fmt(h)}</span>
            ))}
            <span className="absolute -translate-x-1/2 font-mono text-[10px] font-bold text-[var(--color-clay)]" style={{ left: `${(2 / 24) * 100}%`, top: 12 }}>2 a.m.</span>
          </div>
          <div className="hidden xl:block" />
          {DOORS_HOURS.map((d) => {
            const k = KIND[d.kind];
            return (
              <div key={d.door} className="contents">
                <div className="pt-1">
                  <p className="text-[13.5px] font-semibold leading-snug text-[var(--color-canopy)]">{d.door}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">{k.label}{d.days ? ` · ${d.days}` : ""}</p>
                </div>
                <div className="relative h-7 rounded-sm bg-[var(--color-paper-warm)]">
                  <span className="absolute inset-y-0 w-px bg-[var(--color-clay)]" style={{ left: `${(2 / 24) * 100}%` }} aria-hidden />
                  {d.segments.map(([a, b]) => (
                    <span key={`${a}-${b}`} className={`absolute inset-y-1 rounded-[2px] ${k.cls}`} style={{ left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%` }} />
                  ))}
                  {d.segments.length === 0 ? <span className="absolute inset-y-1 left-0 right-0 rounded-[2px] border border-dashed border-[var(--color-ink-muted)]/60" /> : null}
                </div>
                <div className="pb-2 md:col-start-2 xl:col-start-3 xl:pb-0 xl:pt-1"><p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]">{d.note}</p><SourceLinks ids={d.src} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
        At 2 a.m. a single adult who can walk and agree has one sobering door that only twelve partners can open, one hospital, one psychiatric emergency room, and a first-come city bed. A family, a person under 16, or a person in withdrawal has an emergency department. Everything else opens in the morning.
      </p>
    </div>
  );
}
