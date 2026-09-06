import { DOORS, FUNDING, PAYERS, PAYER_EVIDENCE, SOURCES, type Payer } from "@/lib/homeless/data";

/**
 * The three panels that follow the cost-of-inaction calculator:
 *   1. who pays for the street today, and who can actually be made to fund the fix
 *   2. what happened where the payer who saved was made to pay
 *   3. the four doors to federal dollars, each with the date it closes
 * Distilled from research/homelessness-funding. Server component.
 */

const LEVER: Record<Payer["lever"], { label: string; cls: string }> = {
  obligated: { label: "Required to reinvest", cls: "bg-[var(--color-sage-tint)] text-[var(--color-fern)] border-[var(--color-fern)]/30" },
  willing: { label: "Has co-invested", cls: "bg-[var(--color-sage-tint)] text-[var(--color-fern)] border-[var(--color-fern)]/30" },
  conditional: { label: "Only if capacity closes", cls: "bg-[var(--color-clay-tint)] text-[var(--color-clay)] border-[var(--color-clay)]/30" },
  none: { label: "No local mechanism", cls: "bg-[var(--color-paper-warm)] text-[var(--color-ink-muted)] border-[var(--color-parchment)]" },
};

const DURABILITY: Record<string, string> = {
  "most durable": "text-[var(--color-fern)]",
  durable: "text-[var(--color-fern)]",
  "time-limited": "text-[var(--color-clay)]",
  "least controllable": "text-[var(--color-clay)]",
};

function Eyebrow({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ember)]">{children}</p>
      {right ? <p className="font-mono text-[11px] tabular-nums text-[var(--color-ink-muted)]">{right}</p> : null}
    </div>
  );
}

function Split({ label, fed }: { label: string; fed: number }) {
  const f = Math.round(fed * 100);
  const c = 100 - f;
  return (
    <div>
      <p className="mb-1 text-[11.5px] text-[var(--color-ink-muted)]">{label}</p>
      <div className="flex h-7 gap-[2px] overflow-hidden rounded-sm" role="img" aria-label={`${f} cents federal, ${c} cents CCO`}>
        <div className="flex items-center px-2 font-mono text-[11px] font-semibold text-white" style={{ width: `${f}%`, backgroundColor: "var(--color-river-deep)" }}>{f}¢ federal</div>
        <div className="flex flex-1 items-center px-2 font-mono text-[11px] font-semibold text-white" style={{ backgroundColor: "var(--color-fern)" }}>{c >= 20 ? `${c}¢ CCO` : null}</div>
      </div>
      <p className="mt-1 font-mono text-[10.5px] tabular-nums text-[var(--color-ink-muted)]">
        <span className="text-[var(--color-river-deep)]">■</span> {f}¢ federal · <span className="text-[var(--color-fern)]">■</span> {c}¢ kept by the CCO
      </p>
    </div>
  );
}

export default function WhoPays() {
  return (
    <div className="space-y-5">
      {/* Panel 1: who pays today */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="border-b border-[var(--color-parchment)] px-5 pt-5 pb-4 sm:px-6">
          <Eyebrow right="Oregon FY2027 match rates">Panel 1 · Who pays for the street today</Eyebrow>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            The saving is real. The question is who holds it, and whether that payer can be made to fund the fix. Of every dollar of avoided Oregon Health Plan cost:
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Split label="Regular Medicaid members" fed={FUNDING.fmapRegular} />
            <Split label="Expansion adults (the group work requirements target)" fed={FUNDING.fmapExpansion} />
          </div>
        </div>
        <ol className="grid gap-[1px] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-5">
          {PAYERS.map((p) => {
            const lv = LEVER[p.lever];
            return (
              <li key={p.id} className="flex flex-col bg-white px-4 py-4">
                <p className="text-[14.5px] font-semibold leading-tight text-[var(--color-ink)]">{p.name}</p>
                <span className={`mt-1.5 inline-block self-start rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] ${lv.cls}`}>{lv.label}</span>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Pays for</p>
                <p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]">{p.pays}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Captures when someone is housed</p>
                <p className="text-[12.5px] leading-snug text-[var(--color-ink-light)]">{p.captures}</p>
                <p className="mt-3 border-t border-[var(--color-parchment)] pt-2 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{p.leverNote}</p>
              </li>
            );
          })}
        </ol>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-light)] sm:px-6">
          <strong>So the honest local case is not &ldquo;housing pays for itself.&rdquo;</strong> It is that the largest saving lands on payers who are obligated or willing to reinvest it, and the local job is to make them.
        </p>
      </div>

      {/* Panel 2: where the payer who saved was made to pay */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white p-5 sm:p-6">
        <Eyebrow>Panel 2 · Where the payer who saved was made to pay</Eyebrow>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PAYER_EVIDENCE.map((e) => {
            const s = SOURCES[e.source];
            return (
              <div key={e.place} className={`border-t-[3px] pt-3 ${e.cautionary ? "border-[var(--color-clay)]" : "border-[var(--color-fern)]"}`}>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{e.place}</p>
                <p className={`mt-1.5 font-mono text-[26px] font-bold leading-none tabular-nums ${e.cautionary ? "text-[var(--color-clay)]" : "text-[var(--color-canopy)]"}`}>{e.figure}</p>
                <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">{e.unit}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-[var(--color-ink-light)]">{e.what}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]">{s.org}</a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel 3: the four doors */}
      <div className="rounded-sm border border-[var(--color-parchment)] bg-white">
        <div className="border-b border-[var(--color-parchment)] px-5 pt-5 pb-4 sm:px-6">
          <Eyebrow right={`waiver ends ${FUNDING.waiverEnds} · work rules ${FUNDING.workRequirementsStart}`}>Panel 3 · Four doors to federal dollars, and when each closes</Eyebrow>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            Ranked by how long they stay open. Local dollars should buy what federal dollars legally cannot: rent past month six, capital, shelter, outreach.
          </p>
        </div>
        <ol className="grid gap-[1px] bg-[var(--color-parchment)] md:grid-cols-2 xl:grid-cols-4">
          {DOORS.map((d) => {
            const s = SOURCES[d.source];
            return (
              <li key={d.n} className="flex flex-col bg-white px-4 py-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[20px] font-bold leading-none text-[var(--color-ember)]">{d.n}</span>
                  <p className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] ${DURABILITY[d.durability]}`}>{d.durability}</p>
                </div>
                <h4 className="mt-2 text-[15px] font-semibold leading-tight text-[var(--color-canopy)]">{d.title}</h4>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--color-ink-light)]">{d.body}</p>
                <p className="mt-3 border-t border-[var(--color-parchment)] pt-2 text-[12px] leading-snug text-[var(--color-ink-muted)]">{d.deadline}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block text-[11px] text-[var(--color-river-deep)] underline decoration-[var(--color-river)]/40 underline-offset-2 hover:decoration-[var(--color-river)]">{s.org}</a>
              </li>
            );
          })}
        </ol>
        <p className="border-t border-[var(--color-parchment)] px-5 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)] sm:px-6">
          Every door narrowed in 2025–26: CMS rescinded its housing-benefit guidance in March 2025, and Oregon expects {FUNDING.ohpCoverageLoss[0].toLocaleString()}–{FUNDING.ohpCoverageLoss[1].toLocaleString()} people to lose OHP once work requirements start. A person who loses OHP loses every door above.
        </p>
      </div>
    </div>
  );
}
