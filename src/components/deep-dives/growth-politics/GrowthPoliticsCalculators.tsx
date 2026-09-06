"use client";

import { useId, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULTS,
  annualTax,
  buyerScarcityScenario,
  fmtMoney,
  fmtPct,
  projectFeasibility,
  reformRevenue,
  scarcityScenario,
  taxBasisScenario,
} from "@/lib/growth-politics/engine";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  tone = "light",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  display: string;
  tone?: "light" | "dark";
}) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const labelClass = tone === "dark" ? "text-white/60" : "text-[var(--color-ink-light)]";
  const valueClass = tone === "dark" ? "text-[var(--color-ember-bright)]" : "text-[var(--color-canopy)]";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${labelClass}`}>
          {label}
        </span>
        <span aria-live="polite" className={`font-mono text-[17px] font-bold tabular-nums ${valueClass}`}>
          {display}
        </span>
      </div>
      <input
        type="range"
        id={reactId}
        aria-labelledby={labelId}
        aria-valuetext={display}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-[var(--color-ember)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      />
    </div>
  );
}

function NumberCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-y border-[var(--color-parchment)] bg-white p-4 sm:rounded-sm sm:border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-[24px] font-bold leading-none tabular-nums text-[var(--color-ink)]">
        {value}
      </p>
      {note ? <p className="mt-2 text-[12px] leading-snug text-[var(--color-ink-light)]">{note}</p> : null}
    </div>
  );
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: { name?: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] px-3 py-2 shadow-lg">
      <p className="font-mono text-[12px] font-semibold text-[var(--color-ink)]">{label}</p>
      {payload.map((item) => (
        <p key={`${item.name}-${item.payload?.name}`} className="font-mono text-[12px] text-[var(--color-ink-light)]">
          {item.name}: {fmtMoney(Number(item.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

function shortTaxBarLabel(value: string): string {
  if (value.startsWith("Older")) return "Older";
  if (value.startsWith("New")) return "New";
  if (value.startsWith("Minimum")) return "Floor";
  if (value.startsWith("Full")) return "Full";
  return value;
}

export function Measure50Calculator() {
  const [rmv, setRmv] = useState<number>(DEFAULTS.medianHomeValue);
  const [legacyRatio, setLegacyRatio] = useState<number>(0.35);
  const [corridorRatio, setCorridorRatio] = useState<number>(0.5);

  const result = useMemo(
    () => taxBasisScenario({ rmv, legacyRatio, corridorRatio }),
    [rmv, legacyRatio, corridorRatio],
  );

  const keyComparison = [
    {
      label: "Older capped-tax home",
      value: result.legacyTax,
      note: `Taxed as if ${fmtPct(legacyRatio, 0)} of the market value counts.`,
      fill: "#b85c3a",
    },
    {
      label: "New or heavily changed home",
      value: result.cprTax,
      note: `Taxed using the county's ${fmtPct(DEFAULTS.residentialCpr)} new-home ratio.`,
      fill: "#4a7f9e",
    },
  ];

  return (
    <div className="-mx-4 overflow-hidden border-y border-[var(--color-parchment)] bg-white sm:mx-0 sm:rounded-sm sm:border">
      <div className="grid xl:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 sm:p-7 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
            Property-tax comparison
          </p>
          <h3 className="mt-2 font-editorial text-[30px] leading-tight text-[var(--color-ink)]">
            Same home value, different tax bill.
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            This shows how two homes worth the same amount can owe different yearly property taxes.
            The difference matters because it can save one owner money, raise costs for newer homes,
            and shift pressure onto renters, buyers, and public budgets. The policy slider below is a
            one-way minimum floor: it raises parcels below the floor but does not cut taxes for parcels
            already above it.
          </p>

          <div className="-mx-4 mt-5 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              In this example
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-light)]">
              An older capped-tax home owes about{" "}
              <strong className="font-mono text-[var(--color-ink)]">{fmtMoney(result.legacyTax)}</strong>{" "}
              a year. A new or heavily changed home at the same market value owes about{" "}
              <strong className="font-mono text-[var(--color-ink)]">{fmtMoney(result.cprTax)}</strong>.
            </p>
            <p className="mt-3 rounded-sm bg-[var(--color-paper-warm)] p-3 text-[14px] leading-relaxed text-[var(--color-ink)]">
              Difference: <strong className="font-mono">{fmtMoney(result.annualAdvantageVsCpr)}</strong> per year.
              If you own the lower-tax home, that is savings. If you are buying, renting, or funding city services,
              that gap can show up somewhere else.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <Slider
              label="Real market value"
              value={rmv}
              min={250_000}
              max={1_800_000}
              step={25_000}
              onChange={setRmv}
              display={fmtMoney(rmv)}
            />
            <Slider
              label="Taxed share of market value"
              value={legacyRatio}
              min={0.18}
              max={0.65}
              step={0.01}
              onChange={setLegacyRatio}
              display={fmtPct(legacyRatio, 0)}
            />
            <Slider
              label="Policy example: minimum taxed share"
              value={corridorRatio}
              min={0.4}
              max={0.7}
              step={0.01}
              onChange={setCorridorRatio}
              display={fmtPct(corridorRatio, 0)}
            />
          </div>
        </div>

        <div className="p-4 sm:p-7">
          <div className="-mx-4 border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 sm:mx-0 sm:rounded-sm sm:border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
              What the bars mean
            </p>
            <h4 className="mt-2 font-editorial text-[25px] leading-tight text-[var(--color-ink)]">
              Each bar is the estimated yearly property tax on the same {fmtMoney(rmv)} home.
            </h4>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
              The shorter the bar, the lower the yearly tax bill. The first two bars are the key comparison:
              an older capped-tax home versus a new or heavily changed home.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {keyComparison.map((item) => (
              <div key={item.label} className="border-y border-[var(--color-parchment)] bg-white p-4 sm:rounded-sm sm:border">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-3 w-3 rounded-[2px]" style={{ backgroundColor: item.fill }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 font-mono text-[25px] font-bold leading-none text-[var(--color-ink)]">
                      {fmtMoney(item.value)}
                    </p>
                    <p className="mt-2 text-[12px] leading-snug text-[var(--color-ink-muted)]">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            role="img"
            aria-label={`Bar chart of modeled yearly property tax on the same ${fmtMoney(rmv)} home at four taxed-value levels: older capped home ${fmtMoney(result.legacyTax)}, newer home ${fmtMoney(result.cprTax)}, a minimum-floor scenario, and full value.`}
            className="mt-6 h-[200px] sm:h-[240px] md:h-[260px] lg:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.bars} margin={{ top: 18, right: 8, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tickFormatter={shortTaxBarLabel}
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }}
                  tickLine={false}
                  axisLine={{ stroke: "#ebe5da" }}
                />
                <YAxis
                  tickFormatter={(v: number) => fmtMoney(v)}
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }}
                  tickLine={false}
                  axisLine={false}
                  width={68}
                />
                <Tooltip content={<MoneyTooltip />} />
                <Bar dataKey="value" name="Annual tax" radius={[5, 5, 0, 0]} maxBarSize={88}>
                  {result.bars.map((bar) => (
                    <Cell key={bar.name} fill={bar.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <NumberCard
              label="Why owners care"
              value={fmtMoney(result.annualAdvantageVsCpr)}
              note="Modeled yearly savings for the older capped-tax home versus the new-home comparison."
            />
            <NumberCard
              label="Why buyers care"
              value={fmtMoney(result.capitalizedAdvantageVsCpr)}
              note="Rough estimate of how a lower yearly bill can get priced into a sale."
            />
            <NumberCard
              label="Why policy matters"
              value={fmtMoney(result.annualIncreaseToCorridor)}
              note="Modeled yearly increase if the property is below the minimum floor; $0 if already above it."
            />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            This is a formula model, not an exact property-tax estimate. Actual bills depend on location,
            bonds, exemptions, and county assessment details.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScarcityTransferCalculator() {
  const [monthlyRent, setMonthlyRent] = useState<number>(DEFAULTS.medianRent);
  const [premium, setPremium] = useState<number>(0.1);
  const [households, setHouseholds] = useState<number>(DEFAULTS.renterHouseholds);

  const result = useMemo(
    () => scarcityScenario({ monthlyRent, scarcityPremium: premium, households }),
    [monthlyRent, premium, households],
  );

  const buyer = useMemo(
    () => buyerScarcityScenario({ homeValue: DEFAULTS.medianHomeValue, scarcityPremium: premium }),
    [premium],
  );

  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-7">
      <div className="grid gap-7 xl:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
            Housing shortage calculator
          </p>
          <h3 className="mt-2 font-editorial text-[30px] leading-tight text-[var(--color-ink)]">
            How much extra are you paying for the shortage?
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            When there are not enough homes, renters bid against each other for whatever exists. Set your own
            rent and a shortage markup to see what that tight market costs your household every year — money
            that never shows up as a tax or a fee.
          </p>
          <div className="mt-6 space-y-5">
            <Slider
              label="Median monthly rent"
              value={monthlyRent}
              min={900}
              max={3_200}
              step={25}
              onChange={setMonthlyRent}
              display={fmtMoney(monthlyRent)}
            />
            <Slider
              label="Shortage markup"
              value={premium}
              min={0.02}
              max={0.3}
              step={0.01}
              onChange={setPremium}
              display={fmtPct(premium, 0)}
            />
            <Slider
              label="Renter households"
              value={households}
              min={50_000}
              max={180_000}
              step={1_000}
              onChange={setHouseholds}
              display={households.toLocaleString()}
            />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <NumberCard label="What your household pays" value={fmtMoney(result.perHousehold)} note="Extra rent per year, at your rent and markup." />
            <NumberCard label="Across all renters" value={fmtMoney(result.aggregate)} note="Every renter household, added up." />
            <NumberCard label="What a buyer pays" value={fmtMoney(buyer.annual)} note="Extra mortgage per year on a median home." />
          </div>
          <div className="-mx-4 mt-6 border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 sm:mx-0 sm:rounded-sm sm:border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
              Citywide total across all renters
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-light)]">
              The three cards above are one household. This chart is the citywide total — every renter household
              added up, which is far larger and would dwarf the per-household number on a shared axis.
            </p>
          </div>
          <div
            role="img"
            aria-label={`Bar chart of the citywide yearly renter cost of the housing shortage at four markup levels, from 5% to 20%. At the current ${fmtPct(premium, 0)} markup it is about ${fmtMoney(result.aggregate)} per year.`}
            className="mt-4 h-[200px] sm:h-[240px] md:h-[260px] lg:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.rows} margin={{ top: 18, right: 10, left: 8, bottom: 12 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" vertical={false} />
                <XAxis dataKey="premium" tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={{ stroke: "#ebe5da" }} />
                <YAxis tickFormatter={(v: number) => fmtMoney(v)} tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={74} />
                <Tooltip content={<MoneyTooltip />} />
                <Bar dataKey="aggregate" name="Citywide yearly renter cost" fill="#1a3a2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectFeasibilityCalculator() {
  const [delayMonths, setDelayMonths] = useState<number>(6);
  const [sdcPerUnit, setSdcPerUnit] = useState<number>(20_000);
  const [annualTaxPerUnit, setAnnualTaxPerUnit] = useState<number>(4_500);
  const [ihGap, setIhGap] = useState<number>(90_000);

  const result = useMemo(
    () =>
      projectFeasibility({
        projectCost: 30_000_000,
        units: 100,
        carryRate: 0.1,
        delayMonths,
        sdcPerUnit,
        ihAnnualGap: ihGap,
        yieldRate: 0.06,
        annualTaxPerUnit,
      }),
    [annualTaxPerUnit, delayMonths, ihGap, sdcPerUnit],
  );

  const addedRent = result.monthlyThresholdTotal;
  const verdict =
    addedRent > 250
      ? {
          label: "Likely does not get built",
          tone: "border-[#df9b86] bg-[#fff7f2] text-[#8c3d25]",
          text: `This project would need about ${fmtMoney(addedRent)} more rent per home every month just to cover these costs. Above roughly $250 per home each month, more than a tenth of a typical Portland rent, many projects simply stall.`,
        }
      : addedRent > 150
        ? {
            label: "Right on the edge",
            tone: "border-[#d6a15f] bg-[#fff8ea] text-[#80511b]",
            text: `About ${fmtMoney(addedRent)} more rent per home every month is where projects start to pencil out, or not, depending on the market.`,
          }
        : {
            label: "More likely to pencil",
            tone: "border-[var(--color-sage)] bg-[#f3fbf5] text-[var(--color-canopy)]",
            text: `At about ${fmtMoney(addedRent)} more rent per home each month, these costs are small enough that the project is more likely to get built.`,
          };

  return (
    <div className="-mx-4 overflow-hidden border-y border-[var(--color-parchment)] bg-white sm:mx-0 sm:rounded-sm sm:border">
      <div className="grid xl:grid-cols-[0.82fr_1.18fr]">
        <div className="bg-[var(--color-canopy)] p-4 text-white sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
            New-apartment cost calculator
          </p>
          <h3 className="mt-2 font-editorial text-[30px] leading-tight">
            What costs get loaded onto the next apartment?
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">
            Baseline: 100-unit, $30M project, 10% annual interest/carrying cost, and a 6% needed return.
            Move the levers to see how delay, fees, affordable-unit costs, and taxes raise the rent a project needs.
          </p>
          <div className="mt-6 space-y-5">
            <Slider tone="dark" label="Delay months" value={delayMonths} min={0} max={18} step={1} onChange={setDelayMonths} display={`${delayMonths} mo.`} />
            <Slider tone="dark" label="Development fees / unit" value={sdcPerUnit} min={0} max={50_000} step={1_000} onChange={setSdcPerUnit} display={fmtMoney(sdcPerUnit)} />
            <Slider tone="dark" label="Annual tax / unit" value={annualTaxPerUnit} min={0} max={8_000} step={250} onChange={setAnnualTaxPerUnit} display={fmtMoney(annualTaxPerUnit)} />
            <Slider tone="dark" label="Affordable-unit funding gap" value={ihGap} min={0} max={160_000} step={5_000} onChange={setIhGap} display={fmtMoney(ihGap)} />
          </div>
        </div>
        <div className="p-4 sm:p-7">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <NumberCard label="Delay cost" value={fmtMoney(result.delayCost)} note="Interest/carrying cost while waiting." />
            <NumberCard label="One-time burden / unit" value={fmtMoney(result.oneTimeCostPerUnit)} />
            <NumberCard label="Added rent / home / mo." value={fmtMoney(result.monthlyThresholdTotal)} note="Per home, each month, to cover the modeled costs." />
          </div>
          <div className={`mt-4 rounded-sm border p-4 ${verdict.tone}`}>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">Does it pencil?</p>
            <p className="mt-1 text-[18px] font-bold leading-tight">{verdict.label}</p>
            <p className="mt-2 text-[13px] leading-relaxed opacity-80">{verdict.text}</p>
          </div>
          <div
            role="img"
            aria-label="Bar chart of the per-home cost stack on a new apartment: delay cost, city building fees (SDC), and the affordable-unit funding gap."
            className="mt-6 h-[200px] sm:h-[240px] md:h-[260px] lg:h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.stack} margin={{ top: 18, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#ebe5da" vertical={false} />
                <XAxis dataKey="name" tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={{ stroke: "#ebe5da" }} />
                <YAxis tickFormatter={(v: number) => fmtMoney(v)} tick={{ fontFamily: "var(--font-mono)", fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={74} />
                <Tooltip content={<MoneyTooltip />} />
                <Bar dataKey="value" name="Cost per unit" radius={[5, 5, 0, 0]} maxBarSize={110}>
                  {result.stack.map((bar) => <Cell key={bar.name} fill={bar.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReformLeverSimulator() {
  const [additionalAv, setAdditionalAv] = useState<number>(10_000_000_000);
  const result = useMemo(() => reformRevenue(additionalAv), [additionalAv]);

  const find = (name: string) => result.allocation.find((item) => item.name === name)?.value ?? 0;
  const homesPerYear = Math.round((find("Affordable housing") + find("Homes on public land")) / 250_000);
  const ownersHelped = Math.round(find("Help for owners who can't pay") / 2_000);
  const rentersHelped = Math.round(find("Renter stability fund") / 2_000);
  const outcomes = [
    { value: homesPerYear.toLocaleString(), label: "affordable homes funded per year" },
    { value: ownersHelped.toLocaleString(), label: "lower-income owners helped to stay" },
    { value: rentersHelped.toLocaleString(), label: "renters stabilized per year" },
  ];

  return (
    <div className="-mx-4 border-y border-[var(--color-parchment)] bg-white p-4 sm:mx-0 sm:rounded-sm sm:border sm:p-7">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-7 items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
            Tax reform funding simulator
          </p>
          <h3 className="mt-2 font-editorial text-[30px] leading-tight text-[var(--color-ink)]">
            What could a fairer tax base pay for?
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-light)]">
            This shows rough yearly public dollars if reform makes more property value count for taxes.
            It does not account for every legal limit, district rule, bond, or budget restriction.
          </p>
          <div className="mt-6">
            <Slider
              label="Additional property value counted for taxes"
              value={additionalAv}
              min={1_000_000_000}
              max={20_000_000_000}
              step={500_000_000}
              onChange={setAdditionalAv}
              display={fmtMoney(additionalAv, 1)}
            />
          </div>
          <div className="mt-5">
            <NumberCard label="Rough yearly public dollars" value={fmtMoney(result.annual, 1)} note="Additional taxable value / 1,000 × tax rate." />
          </div>
          <div className="-mx-4 mt-4 border-y border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-4 sm:mx-0 sm:rounded-sm sm:border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ember)]">
              What that could buy in a year
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {outcomes.map((outcome) => (
                <div key={outcome.label}>
                  <p className="font-mono text-[22px] font-bold tabular-nums text-[var(--color-canopy)]">~{outcome.value}</p>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-light)]">{outcome.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-ink-muted)]">
              Rough illustration: affordable homes at about $250k of gap funding each, household help at about $2k each.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-center">
          <div
            role="img"
            aria-label={`Donut chart allocating the modeled ${fmtMoney(result.annual, 1)} of new yearly revenue across infrastructure, renter stability, affordable housing, faster permits, hardship help for owners, and homes on public land.`}
            className="h-[240px] sm:h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={result.allocation} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={2}>
                  {result.allocation.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<MoneyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {result.allocation.map((item) => (
              <div key={item.name} className="flex items-start gap-3 rounded-sm border border-[var(--color-parchment)] bg-[var(--color-paper-warm)] p-3">
                <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-[2px]" style={{ backgroundColor: item.fill }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-semibold leading-tight text-[var(--color-ink)]">{item.name}</p>
                    <p className="font-mono text-[13px] font-bold tabular-nums text-[var(--color-canopy)]">
                      {fmtMoney(item.value, 1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyTaxMiniChart() {
  const value = DEFAULTS.medianHomeValue;
  const older = Math.round(annualTax(value, 0.35));
  const newer = Math.round(annualTax(value, DEFAULTS.residentialCpr));
  const gap = newer - older;
  const max = Math.max(older, newer);
  const houses = [
    { label: "Older home", sub: "taxed on a fraction of its value", tax: older, fill: "#c8956c" },
    { label: "Newer home next door", sub: "taxed near today's full value", tax: newer, fill: "#7fa88e" },
  ];

  return (
    <div className="rounded-sm border border-white/12 bg-white/[0.05] p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
          Same market value
        </p>
        <p className="font-mono text-[16px] font-bold text-white">{fmtMoney(value)}</p>
      </div>

      <div className="mt-4 space-y-4">
        {houses.map((house) => (
          <div key={house.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-semibold text-white">{house.label}</p>
              <p className="font-mono text-[18px] font-bold tabular-nums text-white">
                {fmtMoney(house.tax)}
                <span className="ml-1 text-[11px] font-normal text-white/50">/yr tax</span>
              </p>
            </div>
            <p className="text-[11px] leading-snug text-white/45">{house.sub}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${(house.tax / max) * 100}%`, backgroundColor: house.fill }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-sm border border-[var(--color-ember)]/40 bg-[var(--color-ember)]/10 p-3">
        <p className="text-[13px] leading-relaxed text-white/85">
          The older home pays{" "}
          <span className="font-mono font-bold text-[var(--color-ember-bright)]">{fmtMoney(gap)}</span> less every
          year for the same house, and that discount passes to whoever buys it next.
        </p>
      </div>
    </div>
  );
}
