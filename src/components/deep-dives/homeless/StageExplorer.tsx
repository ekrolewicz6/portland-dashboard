"use client";

import { useState } from "react";
import { ACCOUNTABILITY, CONTINUUM, GAP_SIGNALS, PHASES, STAGE_BARS, STAGE_COSTS, STAGE_MODES, STAGE_ROLES } from "@/lib/homeless/continuum";
import { PLACEMENT_COHORTS } from "@/lib/homeless/data";
import type { CountStatus } from "@/lib/homeless/continuum-types";

/**
 * Pick a stage. The swimlane map is the navigator; the panel below shows
 * everything the page knows about that stage on five tabs: what it is, when
 * it works and how it fails, who does what, who answers and what it costs,
 * and Portland today with the gap. One component replaces six fourteen-row
 * tables.
 */
const STATUS: Record<CountStatus, { label: string; cls: string; dot: string; bg: string }> = {
  known: { label: "Counted", cls: "text-[var(--color-fern)]", dot: "bg-[var(--color-fern)]", bg: "bg-[var(--color-sage-tint)]" },
  partial: { label: "Partly counted", cls: "text-[#a9784f]", dot: "bg-[var(--color-ember)]", bg: "bg-[#f4ebe0]" },
  unknown: { label: "Not counted", cls: "text-[var(--color-clay)]", dot: "bg-[var(--color-clay)]", bg: "bg-[var(--color-clay-tint)]" },
};
const TABS = [
  { id: "what", label: "What it is" },
  { id: "modes", label: "Works / fails" },
  { id: "who", label: "Who does what" },
  { id: "answers", label: "Who answers, what it costs" },
  { id: "today", label: "Portland today, and the gap" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Tile({ k, children, tone = "plain" }: { k: string; children: React.ReactNode; tone?: "plain" | "good" | "bad" | "dark" }) {
  const cls = tone === "good" ? "border-l-[3px] border-[var(--color-fern)] bg-[var(--color-sage-tint)]" : tone === "bad" ? "border-l-[3px] border-[var(--color-clay)] bg-[var(--color-clay-tint)]" : tone === "dark" ? "bg-[var(--color-canopy)] text-white" : "bg-[var(--color-paper-warm)]";
  return (
    <div className={`rounded-sm px-4 py-3 ${cls}`}>
      <p className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] ${tone === "dark" ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ink-muted)]"}`}>{k}</p>
      <div className={`mt-1 text-[13.5px] leading-relaxed ${tone === "dark" ? "text-white/85" : "text-[var(--color-ink)]"}`}>{children}</div>
    </div>
  );
}

export default function StageExplorer() {
  const [sel, setSel] = useState("unsheltered-active");
  const [tab, setTab] = useState<Tab>("what");
  const idx = CONTINUUM.findIndex((s) => s.id === sel);
  const s = CONTINUUM[idx];
  const phase = PHASES.find((p) => p.key === s.phase);
  const st = STATUS[s.count.status];
  const modes = STAGE_MODES.find((m) => m.stageId === sel);
  const role = STAGE_ROLES.find((r) => r.stageId === sel);
  const acc = ACCOUNTABILITY.find((a) => a.stageId === sel);
  const cost = STAGE_COSTS.find((c) => c.stageId === sel);
  const gap = GAP_SIGNALS.find((g) => g.stageId === sel);
  const bars = STAGE_BARS[sel] ?? [];
  const cohortName = new Map(PLACEMENT_COHORTS.map((c) => [c.id, c.cohort]));
  let n = 0;

  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
      {/* navigator */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-parchment)] px-5 pt-4 pb-3 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">Pick a stage</p>
        <p className="font-mono text-[11px] text-[var(--color-ink-muted)]">six phases, fourteen stages, in order · dot = whether anyone can count who is there today</p>
      </div>
      <ol className="divide-y divide-[var(--color-parchment)] border-b border-[var(--color-parchment)]">
        {PHASES.map((p) => {
          const stages = CONTINUUM.filter((x) => x.phase === p.key);
          const span = 12 / stages.length;
          return (
            <li key={p.key} className="grid gap-3 px-5 py-3 sm:px-6 xl:grid-cols-[150px_minmax(0,1fr)] xl:gap-5">
              <div className="flex items-center gap-2 xl:block">
                <span className="block h-1 w-8 rounded-full xl:mb-1.5" style={{ backgroundColor: p.color }} aria-hidden />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: p.color }}>{p.label}</p>
                <p className="hidden text-[12px] text-[var(--color-ink-muted)] xl:block">{p.sub}</p>
              </div>
              <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-12">
                {stages.map((x) => {
                  n += 1;
                  const on = x.id === sel;
                  const xs = STATUS[x.count.status];
                  return (
                    <li key={x.id} className="xl:[grid-column:span_var(--span)]" style={{ ["--span" as string]: span }}>
                      <button
                        type="button"
                        onClick={() => setSel(x.id)}
                        aria-pressed={on}
                        className={`flex min-h-[64px] w-full items-start gap-2 rounded-sm border px-3 py-2.5 text-left transition-colors ${on ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-[var(--color-paper-warm)] hover:border-[var(--color-sage)]"}`}
                      >
                        <span className={`font-mono text-[11px] font-bold ${on ? "text-[var(--color-ember-bright)]" : "text-[var(--color-ink-muted)]"}`}>{String(n).padStart(2, "0")}</span>
                        <span className={`flex-1 text-[13px] font-semibold leading-snug ${on ? "text-white" : "text-[var(--color-canopy)]"}`}>{x.name}</span>
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${xs.dot}`} aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>

      {/* panel */}
      <div className="px-5 py-5 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: phase?.color }}>{String(idx + 1).padStart(2, "0")} · {phase?.label} · {phase?.sub}</p>
            <h3 className="mt-1 font-editorial-normal text-[28px] leading-tight text-[var(--color-canopy)] sm:text-[32px]">{s.name}</h3>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--color-ink-light)]">{s.purpose}</p>
            <p className="mt-2 text-[12.5px] text-[var(--color-ink-muted)]"><span className="font-mono text-[9.5px] uppercase tracking-[0.12em]">Clock · </span>{s.duration}</p>
          </div>
          <div className="space-y-3">
            <div className={`rounded-sm px-4 py-3 ${st.bg}`}>
              <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${st.cls}`}>{st.label} · Portland today</p>
              <p className="mt-0.5 text-[17px] font-semibold leading-snug text-[var(--color-ink)] tabular-nums">{s.count.portlandToday}</p>
            </div>
            {bars.map((b) => {
              const pct = Math.max(0, Math.min(100, (b.value / b.of) * 100));
              return (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between gap-3 text-[12px]">
                    <span className="text-[var(--color-ink-light)]">{b.label}</span>
                    <span className="shrink-0 font-mono tabular-nums text-[var(--color-ink)]">{b.unit === "$M" ? `$${b.value}M of $${b.of}M` : `${b.value.toLocaleString()} of ${b.of.toLocaleString()}`}{b.note ? <span className="text-[var(--color-clay)]"> · {b.note}</span> : null}</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-sm bg-[var(--color-parchment)]">
                    <div className="h-full rounded-sm bg-[var(--color-fern)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 border-b border-[var(--color-parchment)] pb-3" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`min-h-[36px] rounded-sm border px-3 text-[12.5px] font-medium transition-colors ${tab === t.id ? "border-[var(--color-canopy)] bg-[var(--color-canopy)] text-white" : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "what" ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Tile k="Enter when">{s.entry}</Tile>
                <Tile k="Leave when">{s.exit}</Tile>
                <Tile k="Capacity is measured in">{s.capacityUnit}</Tile>
              </div>
              <div className="rounded-sm bg-[var(--color-paper-warm)] px-4 py-3">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Who passes through</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.cohorts.map((c) => <span key={c} className="rounded-full border border-[var(--color-parchment)] bg-white px-2.5 py-0.5 text-[12px] text-[var(--color-ink-light)]">{cohortName.get(c) ?? c}</span>)}
                </div>
              </div>
            </div>
          ) : null}
          {tab === "modes" && modes ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Tile k="When it works" tone="good"><ul className="space-y-1.5">{modes.success.map((x) => <li key={x}>{x}</li>)}</ul></Tile>
              <Tile k="How it fails" tone="bad"><ul className="space-y-1.5">{modes.failure.map((x) => <li key={x}>{x}</li>)}</ul></Tile>
            </div>
          ) : null}
          {tab === "who" && role ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Tile k="Who leads">{role.lead}</Tile>
              <Tile k="Also in the room">{role.inRoom}</Tile>
              <Tile k="Police" tone={role.police.startsWith("None") ? "plain" : "bad"}>{role.police}</Tile>
              <Tile k="Who writes the handoff">{role.handoff}</Tile>
            </div>
          ) : null}
          {tab === "answers" && acc && cost ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Tile k="Who answers for it" tone={acc.owner.startsWith("Nobody") ? "bad" : "plain"}>{acc.owner}</Tile>
                <Tile k="How they are held to it">{acc.mechanism}</Tile>
                <Tile k="The number, and its target" tone="good">{acc.measure}</Tile>
                <Tile k="If they miss">{acc.ifFails}</Tile>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Tile k="Spent or in place today">{cost.today}</Tile>
                <Tile k="The unit cost we know" tone={/unpublished/i.test(cost.unit) ? "bad" : "plain"}>{cost.unit}</Tile>
                <Tile k="Needed now" tone="dark">{cost.now}</Tile>
                <Tile k="Later">{cost.future}</Tile>
              </div>
            </div>
          ) : null}
          {tab === "today" && gap ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Tile k="What exists">{s.exists}</Tile>
                <Tile k="The documented gap" tone="bad">{s.gap}</Tile>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Tile k="The signal in the counts">{gap.signal}</Tile>
                <Tile k="What it usually means">{gap.likelyGap}</Tile>
                <Tile k="Portland's reading today" tone="bad">{gap.portlandReading}</Tile>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Tile k="How to count it">{s.count.what}</Tile>
                <Tile k="Where the numbers come from">{s.count.source}</Tile>
                <Tile k="How often">{s.count.cadence}</Tile>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
