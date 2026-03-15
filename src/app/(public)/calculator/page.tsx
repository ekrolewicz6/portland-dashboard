"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Calculator, Sparkles } from "lucide-react";
import { SECTOR_LABELS, type Sector } from "@/lib/calculator/tax-data";
import {
  calculateSavings,
  type CalculatorInputs,
  type SavingsReport,
} from "@/lib/calculator/savings-engine";

// ── Types ─────────────────────────────────────────────────────────

interface FormState {
  sector: string;
  squareFootage: string;
  buildoutCost: string;
  year1Revenue: string;
  ownerIncome: string;
  numOwners: string;
  numEmployees: string;
  takingNewSpace: boolean;
}

const INITIAL_FORM: FormState = {
  sector: "",
  squareFootage: "",
  buildoutCost: "",
  year1Revenue: "",
  ownerIncome: "",
  numOwners: "1",
  numEmployees: "",
  takingNewSpace: true,
};

// ── Helpers ───────────────────────────────────────────────────────

const inputClasses =
  "w-full px-4 py-3 bg-white border border-[var(--color-parchment)] rounded-sm text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)] focus:ring-1 focus:ring-[var(--color-canopy)] transition-colors";

const labelClasses =
  "block text-[13px] font-semibold text-[var(--color-ink-light)] uppercase tracking-[0.08em] mb-2";

const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]`;

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Savings Line Item ─────────────────────────────────────────────

function SavingsRow({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[var(--color-parchment)] last:border-b-0">
      <div className="flex-1 pr-4">
        <p className="text-[14px] text-[var(--color-ink)] font-medium">
          {label}
        </p>
        {description && (
          <p className="text-[12px] text-[var(--color-ink-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <span className="font-mono text-[15px] text-[var(--color-canopy)] font-semibold tabular-nums whitespace-nowrap">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function SubtotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between pt-3 mt-1">
      <span className="text-[13px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.06em]">
        {label}
      </span>
      <span className="font-mono text-[16px] text-[var(--color-canopy)] font-bold tabular-nums">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [report, setReport] = useState<SavingsReport | null>(null);

  const updateForm = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const formValid =
    form.sector &&
    form.squareFootage &&
    form.buildoutCost &&
    form.year1Revenue &&
    form.ownerIncome &&
    form.numOwners &&
    form.numEmployees;

  const handleCalculate = () => {
    const inputs: CalculatorInputs = {
      sector: form.sector as Sector,
      squareFootage: parseFloat(form.squareFootage) || 0,
      buildoutCost: parseFloat(form.buildoutCost) || 0,
      year1Revenue: parseFloat(form.year1Revenue) || 0,
      ownerIncome: parseFloat(form.ownerIncome) || 0,
      numOwners: parseInt(form.numOwners, 10) || 1,
      numEmployees: parseInt(form.numEmployees, 10) || 0,
      takingNewSpace: form.takingNewSpace,
    };
    setReport(calculateSavings(inputs));
  };

  const handleReset = () => {
    setReport(null);
  };

  return (
    <div className="bg-[var(--color-paper-warm)] min-h-[80vh]">
      {/* Hero */}
      <section className="bg-[var(--color-canopy)] text-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em] mb-4">
            PCB Benefits Calculator
          </p>
          <h1 className="font-editorial-normal text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-4">
            What Is Certification Worth to Your Business?
          </h1>
          <p className="text-white/60 text-[15px] max-w-xl mx-auto leading-relaxed">
            Estimate the total first-year value of Portland Commons Business
            certification — from tax savings to network benefits.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        {/* ── Input Form ── */}
        {!report && (
          <div className="animate-fade-up space-y-8">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-[var(--color-ember)]" />
              <h2 className="font-editorial-normal text-2xl text-[var(--color-canopy)]">
                Your Business Details
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Business Type</label>
                <select
                  className={selectClasses}
                  value={form.sector}
                  onChange={(e) => updateForm("sector", e.target.value)}
                >
                  <option value="">Select your sector...</option>
                  {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>
                    Estimated Square Footage
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="2,000"
                    min="0"
                    value={form.squareFootage}
                    onChange={(e) =>
                      updateForm("squareFootage", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    Estimated Buildout Cost ($)
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="150,000"
                    min="0"
                    value={form.buildoutCost}
                    onChange={(e) => updateForm("buildoutCost", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>
                    Estimated Year 1 Revenue ($)
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="500,000"
                    min="0"
                    value={form.year1Revenue}
                    onChange={(e) => updateForm("year1Revenue", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    Estimated Owner Income ($)
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="80,000"
                    min="0"
                    value={form.ownerIncome}
                    onChange={(e) => updateForm("ownerIncome", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>
                    Number of Founders / Owners
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="1"
                    min="1"
                    value={form.numOwners}
                    onChange={(e) => updateForm("numOwners", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    Number of Planned Employees
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="8"
                    min="0"
                    value={form.numEmployees}
                    onChange={(e) => updateForm("numEmployees", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Taking New Space?</label>
                <div className="flex gap-4">
                  {[
                    { value: true, label: "Yes — new or relocated space" },
                    { value: false, label: "No — existing space" },
                  ].map(({ value, label }) => (
                    <label
                      key={String(value)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm border cursor-pointer transition-all text-[14px] font-medium ${
                        form.takingNewSpace === value
                          ? "border-[var(--color-canopy)] bg-[var(--color-canopy)]/[0.03] text-[var(--color-canopy)]"
                          : "border-[var(--color-parchment)] bg-white text-[var(--color-ink-light)] hover:border-[var(--color-sage)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="takingNewSpace"
                        className="sr-only"
                        checked={form.takingNewSpace === value}
                        onChange={() => updateForm("takingNewSpace", value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!formValid}
                onClick={handleCalculate}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded-sm hover:bg-[var(--color-ember-bright)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Calculate My Savings
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {report && (
          <div className="animate-fade-up space-y-8">
            {/* Grand Total */}
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[var(--color-ember)]" />
                <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em]">
                  First-Year Value of PCB Certification
                </p>
              </div>
              <p className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-canopy)] tabular-nums tracking-tight">
                {formatCurrency(report.grandTotal)}
              </p>
              <p className="text-[14px] text-[var(--color-ink-muted)] mt-3">
                Estimated total value combining city incentives and network
                benefits
              </p>
            </div>

            {/* Hard Savings */}
            <div className="metric-card" style={{ cursor: "default" }}>
              <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-1">
                Hard Savings
              </h3>
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                Direct city incentives and tax relief
              </p>

              <SavingsRow
                label="Business License Tax Holiday"
                value={report.hardSavings.bltHoliday}
                description="2 years at 2.6% of net income"
              />
              <SavingsRow
                label="SDC Reduction"
                value={report.hardSavings.sdcReduction}
                description="50% reduction in System Development Charges"
              />
              <SavingsRow
                label="Permitting Time Savings"
                value={report.hardSavings.permittingTimeSavings}
                description="Estimated rent saved during expedited permitting"
              />
              <SubtotalRow
                label="Total Hard Savings"
                value={report.hardSavings.total}
              />
            </div>

            {/* Network Value */}
            <div className="metric-card" style={{ cursor: "default" }}>
              <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-1">
                Network Value
              </h3>
              <p className="text-[13px] text-[var(--color-ink-muted)] mb-4">
                Private-to-private benefits through the Commons network
              </p>

              <SavingsRow
                label="Launch Sponsorship"
                value={report.networkValue.launchSponsorship}
                description="Marketing and launch support from network partners"
              />
              <SavingsRow
                label="Real Estate Benefit"
                value={report.networkValue.realEstateBenefit}
                description="3 months free rent at area market rate"
              />
              <SavingsRow
                label="Referral Network Revenue"
                value={report.networkValue.referralNetworkRevenue}
                description="Estimated revenue from inter-network referrals"
              />
              <SavingsRow
                label="Group Health Insurance Savings"
                value={report.networkValue.groupHealthSavings}
                description={`${form.numEmployees} employees at $400/mo savings`}
              />
              <SavingsRow
                label="AI Concierge Value"
                value={report.networkValue.aiConciergeValue}
                description="Consultant hours saved through AI business advisor"
              />
              <SubtotalRow
                label="Total Network Value"
                value={report.networkValue.total}
              />
            </div>

            {/* CTA */}
            <div className="text-center pt-4 pb-8 space-y-4">
              <p className="font-editorial-normal text-xl text-[var(--color-canopy)]">
                Ready to claim these benefits?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded-sm hover:bg-[var(--color-ember-bright)] transition-colors"
                >
                  Apply for PCB Certification
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-parchment)] text-[var(--color-ink-light)] text-[14px] font-medium rounded-sm hover:border-[var(--color-sage)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Recalculate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
