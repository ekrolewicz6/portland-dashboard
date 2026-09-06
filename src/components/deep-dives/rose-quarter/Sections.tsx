import { ALBINA_WAVES, DESIGN_ERAS, CASES, LEGAL_PATTERN, SOURCES } from "@/lib/rose-quarter/data";
import { CASE_FOR, CASE_AGAINST, PRICING_EXCHANGES, LAND_VALUE, NATIONAL_CONTEXT, ARG_SOURCES, type Source } from "@/lib/rose-quarter/arguments";

/** How Albina was destroyed — three waves, with the numbers stated carefully. */
export function AlbinaWaves() {
  return (
    <div className="space-y-4">
      {ALBINA_WAVES.map((w) => (
        <div key={w.years} className="rounded-sm border border-white/15 bg-white/[0.05] p-5 backdrop-blur">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-[13px] font-bold text-[var(--color-ember-bright)]">
              {w.years}
            </span>
            <h3 className="text-[16px] font-semibold text-white">{w.what}</h3>
            <span className="rounded-sm bg-white/10 px-2 py-0.5 font-mono text-[12px] text-white/80">
              {w.toll}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-white/70">{w.detail}</p>
          <a
            href={SOURCES[w.sourceId].url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block font-mono text-[11px] text-white/45 underline decoration-white/20 underline-offset-2 hover:text-white/70"
          >
            {SOURCES[w.sourceId].org}
          </a>
        </div>
      ))}
      <p className="max-w-3xl border-t border-white/15 pt-4 text-[13px] leading-relaxed text-white/55">
        A figure of &ldquo;3,000 families displaced by I-5&rdquo; circulates widely. We do not use
        it: it appears to conflate the roughly 3,000 <em>residents</em> of Lower Albina in 1960 with
        families, and it is not supported by the documented count of homes taken. The real numbers
        are bad enough without inflating them, and inflating them is how a true story gets
        dismissed.
      </p>
    </div>
  );
}

/** The strongest case for, and the strongest case against. */
export function Cases({ side }: { side: "for" | "against" }) {
  const items = side === "for" ? CASE_FOR : CASE_AGAINST;
  const accent = side === "for" ? "#3d7a5a" : "#b85c3a";
  const bg = side === "for" ? "#f1f7f3" : "#fbf4f0";
  return (
    <div className="space-y-4">
      {items.map((a) => (
        <div
          key={a.n}
          className="rounded-sm border p-5 sm:p-6"
          style={{ borderColor: `${accent}40`, backgroundColor: bg }}
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] font-bold" style={{ color: accent }}>
              {a.n}
            </span>
            <h3 className="text-[16px] font-semibold leading-snug text-[var(--color-ink)]">
              {a.claim}
            </h3>
          </div>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            {a.body}
          </p>
          <p className="mt-2 border-l-2 pl-3 text-[13px] leading-relaxed text-[var(--color-ink)]" style={{ borderColor: accent }}>
            {a.evidence}
          </p>
          <ArgCite id={a.sourceId} />
        </div>
      ))}
    </div>
  );
}

/** How the design mutated across three eras — the clearest evidence of who has leverage. */
export function DesignEvolution() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--color-canopy)]">
            {["", "2012", "2017", "2022–24"].map((h) => (
              <th key={h} className="p-3 text-left font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([
            ["Cost", "cost"],
            ["Flint Avenue", "flint"],
            ["The cover", "covers"],
            ["Ramps", "ramps"],
          ] as const).map(([label, key]) => (
            <tr key={key} className="border-b border-[var(--color-parchment)]">
              <td className="p-3 align-top text-[13px] font-semibold text-[var(--color-ink)]">{label}</td>
              {DESIGN_ERAS.map((e) => (
                <td key={e.year} className="p-3 align-top text-[13px] leading-snug text-[var(--color-ink-light)]">
                  {e[key]}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-3 align-top text-[13px] font-semibold text-[var(--color-ink)]">What moved it</td>
            {DESIGN_ERAS.map((e) => (
              <td key={e.year} className="p-3 align-top text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
                {e.note}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
        Read the bottom row across and you can see who actually has leverage here. Flint Avenue came
        back when Albina Vision Trust withdrew from the project. The flyover appeared after the
        Trail Blazers filed a twenty-page objection. Neither change came from the environmental
        review.
      </p>
    </div>
  );
}

/** The two lawsuits, and what each outcome would actually trigger. */
export function LegalFight() {
  return (
    <div className="space-y-5">
      {CASES.map((c) => (
        <div key={c.id} className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">{c.court}</h3>
            <span className="font-mono text-[12px] text-[var(--color-ink-muted)]">Filed {c.filed}</span>
          </div>
          <p className="mt-1 text-[12.5px] text-[var(--color-ink-muted)]">{c.plaintiffs}</p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            {c.claim}
          </p>
          <div className="mt-3 rounded-sm bg-[var(--color-paper-warm)] p-3">
            <p className="text-[13px] leading-relaxed text-[var(--color-ink)]">
              <strong>If they win:</strong> {c.ifTheyWin}
            </p>
          </div>
          <p
            className={`mt-3 text-[12.5px] leading-relaxed ${
              c.statusIsUncertain
                ? "border-l-2 border-[var(--color-ember)] pl-3 text-[var(--color-ink-light)]"
                : "text-[var(--color-ink-muted)]"
            }`}
          >
            <strong className="text-[var(--color-ink)]">Status:</strong> {c.status}
            {c.statusIsUncertain && (
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-wide text-[var(--color-ember)]">
                we could not verify this further — see method
              </span>
            )}
          </p>
        </div>
      ))}
      <div className="rounded-sm border-l-2 border-[var(--color-canopy)] bg-[var(--color-paper-warm)] p-5">
        <p className="max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink)]">
          <strong>{LEGAL_PATTERN}</strong> Which tells you what the strategy is. On a project whose
          cost compounds every year, delay is not a consolation prize — it is the most effective
          weapon available, and both sides know it.
        </p>
      </div>
    </div>
  );
}

/** The "roads pay for themselves" intuition, tested. */
export function PricingExchanges() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Num k={`${NATIONAL_CONTEXT.costRecoveryPct}%`} t="of US road spending is covered by drivers" d={`Down from ${NATIONAL_CONTEXT.costRecoveryPeakPct}% at its peak. The rest comes from general taxes everyone pays.`} />
        <Num k={`$${NATIONAL_CONTEXT.subsidyPerVehicleYear}+`} t="subsidy per vehicle, per year" d="A lower-bound estimate — it excludes parking, crash and pollution costs." />
        <Num k={`${NATIONAL_CONTEXT.returnsThen}% → ${NATIONAL_CONTEXT.returnsNow}%`} t="returns on highway investment" d="From the Interstate's first decade to its last measured one. Urban expansions now sit at the bottom of that range." />
      </div>
      <div className="overflow-x-auto rounded-sm border border-[var(--color-parchment)] bg-white">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)]">
              {["The argument", "The counterargument", "What would be better"].map((h) => (
                <th key={h} className="p-3 text-left font-mono text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_EXCHANGES.map((e) => (
              <tr key={e.argument} className="border-b border-[var(--color-parchment)] last:border-0">
                <td className="p-3 align-top text-[13px] leading-snug text-[var(--color-ink)]">{e.argument}</td>
                <td className="p-3 align-top text-[13px] leading-snug text-[var(--color-ink-light)]">{e.counter}</td>
                <td className="p-3 align-top text-[13px] leading-snug text-[var(--color-fern)]">{e.optimal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-[var(--color-ink-muted)]">
        Framework adapted from{" "}
        <a href={ARG_SOURCES.litman2026.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--color-parchment)] underline-offset-2 hover:decoration-[var(--color-river)]">
          Todd Litman, Roadway Costs, User Revenues and Cost Recovery Trends, April 2026
        </a>
        .
      </p>
    </div>
  );
}

/** What the land is worth if you take the freeway out instead. */
export function LandValue() {
  const d = LAND_VALUE.dallas;
  const r = LAND_VALUE.rochester;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">{d.project}</h3>
        <p className="mt-1 text-[12.5px] text-[var(--color-ink-muted)]">{d.note}</p>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {[
            [`${d.acres}`, "acres freed"],
            [`$${(d.developmentPotential / 1e9).toFixed(0)}B`, "development potential"],
            [`$${(d.annualPropertyTax / 1e6).toFixed(0)}M`, "annual property tax"],
            [`${(d.housingUnits / 1000).toFixed(0)}K`, "housing units"],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="font-mono text-[22px] font-bold tabular-nums text-[var(--color-canopy)]">{v}</dd>
              <dt className="text-[12px] text-[var(--color-ink-muted)]">{l}</dt>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-sm border-2 border-[var(--color-fern)]/30 bg-[#f1f7f3] p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold text-[var(--color-ink)]">{r.project}</h3>
        <p className="mt-1 text-[12.5px] text-[var(--color-ink-muted)]">{r.note}</p>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {[
            [`$${(r.cost / 1e6).toFixed(0)}M`, "cost to remove"],
            [`$${(r.developmentInduced / 1e6).toFixed(0)}M`, "development that followed"],
            [`+${r.walkingIncrease}%`, "walking"],
            [`+${r.bikingIncrease}%`, "cycling"],
          ].map(([v, l]) => (
            <div key={l}>
              <dd className="font-mono text-[22px] font-bold tabular-nums text-[var(--color-fern)]">{v}</dd>
              <dt className="text-[12px] text-[var(--color-ink-muted)]">{l}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-[var(--color-fern)]/20 pt-3 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
          A ten-to-one return, and the traffic did not gridlock. That is the precedent removal
          advocates point to, though Rochester removed a lightly-used downtown loop, not a stretch
          of the west coast&apos;s primary freight route, and the difference is real.
        </p>
      </div>
    </div>
  );
}

function ArgCite({ id }: { id: keyof typeof ARG_SOURCES }) {
  const s: Source = ARG_SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block font-mono text-[11px] text-[var(--color-ink-muted)] underline decoration-[var(--color-parchment)] underline-offset-2 hover:decoration-[var(--color-river)]"
    >
      {s.org}
      {s.year ? `, ${s.year}` : ""}
    </a>
  );
}

function Num({ k, t, d }: { k: string; t: string; d: string }) {
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-4">
      <p className="font-mono text-[22px] font-bold leading-none tabular-nums text-[var(--color-canopy)]">{k}</p>
      <p className="mt-1.5 text-[13px] font-semibold text-[var(--color-ink)]">{t}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-light)]">{d}</p>
    </div>
  );
}
