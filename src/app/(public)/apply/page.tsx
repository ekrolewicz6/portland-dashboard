"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

interface BusinessInfo {
  businessName: string;
  address: string;
  entityType: string;
  ownerNames: string;
  email: string;
  phone: string;
  numEmployees: string;
  pctOregonResidents: string;
  description: string;
  sector: string;
  yearFounded: string;
}

interface Eligibility {
  headquarteredInPortland: boolean;
  fewerThan500Employees: boolean;
  oregonResidentEmployees: boolean;
  majorityOwnedByNaturalPersons: boolean;
  newOrGrowing: boolean;
  threeYearCommitment: boolean;
}

const INITIAL_INFO: BusinessInfo = {
  businessName: "",
  address: "",
  entityType: "",
  ownerNames: "",
  email: "",
  phone: "",
  numEmployees: "",
  pctOregonResidents: "",
  description: "",
  sector: "",
  yearFounded: "",
};

const INITIAL_ELIGIBILITY: Eligibility = {
  headquarteredInPortland: false,
  fewerThan500Employees: false,
  oregonResidentEmployees: false,
  majorityOwnedByNaturalPersons: false,
  newOrGrowing: false,
  threeYearCommitment: false,
};

const ENTITY_TYPES = [
  { value: "llc", label: "LLC" },
  { value: "corp", label: "Corporation" },
  { value: "s_corp", label: "S Corporation" },
  { value: "sole_prop", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "nonprofit", label: "Nonprofit" },
];

const SECTORS = [
  { value: "restaurant_bar", label: "Restaurant / Bar" },
  { value: "retail", label: "Retail" },
  { value: "creative", label: "Creative" },
  { value: "tech", label: "Tech" },
  { value: "maker_manufacturing", label: "Maker / Manufacturing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const ELIGIBILITY_ITEMS: { key: keyof Eligibility; label: string }[] = [
  {
    key: "headquarteredInPortland",
    label:
      "Our business is headquartered in Portland with a physical commercial presence.",
  },
  {
    key: "fewerThan500Employees",
    label: "We have fewer than 500 employees.",
  },
  {
    key: "oregonResidentEmployees",
    label: "At least 60% of our employees are Oregon residents.",
  },
  {
    key: "majorityOwnedByNaturalPersons",
    label: "Our business is majority owned by natural person(s).",
  },
  {
    key: "newOrGrowing",
    label:
      "We have been in operation fewer than 5 years OR are adding 3+ net new Portland jobs this year.",
  },
  {
    key: "threeYearCommitment",
    label: "We commit to maintaining a Portland presence for at least 3 years.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────

const inputClasses =
  "w-full px-4 py-3 bg-white border border-[var(--color-parchment)] rounded-sm text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)] focus:ring-1 focus:ring-[var(--color-canopy)] transition-colors";

const labelClasses =
  "block text-[13px] font-semibold text-[var(--color-ink-light)] uppercase tracking-[0.08em] mb-2";

const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center]`;

// ── Component ─────────────────────────────────────────────────────

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState<BusinessInfo>(INITIAL_INFO);
  const [eligibility, setEligibility] =
    useState<Eligibility>(INITIAL_ELIGIBILITY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    applicationId?: string;
    message?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const updateInfo = (key: keyof BusinessInfo, value: string) =>
    setInfo((prev) => ({ ...prev, [key]: value }));

  const toggleEligibility = (key: keyof Eligibility) =>
    setEligibility((prev) => ({ ...prev, [key]: !prev[key] }));

  const allEligible = Object.values(eligibility).every(Boolean);

  const step1Valid =
    info.businessName &&
    info.address &&
    info.entityType &&
    info.ownerNames &&
    info.email &&
    info.phone &&
    info.numEmployees &&
    info.pctOregonResidents &&
    info.description &&
    info.sector &&
    info.yearFounded;

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        ...info,
        numEmployees: parseInt(info.numEmployees, 10),
        pctOregonResidents: parseFloat(info.pctOregonResidents),
        eligibility,
      };
      const res = await fetch("/api/pcb/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setErrors(data.errors || {});
      }
    } catch {
      setErrors({ _form: ["Something went wrong. Please try again."] });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──
  if (result?.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <div className="max-w-lg text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-[var(--color-canopy)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-ember)]" />
          </div>
          <h1 className="font-editorial-normal text-3xl sm:text-4xl text-[var(--color-canopy)] mb-4">
            Application Received
          </h1>
          <p className="text-[var(--color-ink-light)] text-[15px] leading-relaxed mb-3">
            Your application ID is{" "}
            <span className="font-mono text-[var(--color-canopy)] font-semibold">
              {result.applicationId}
            </span>
          </p>
          <div className="metric-card text-left mt-8" style={{ cursor: "default" }}>
            <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-4">
              What Happens Next
            </h3>
            <ol className="text-[14px] text-[var(--color-ink-light)] leading-relaxed space-y-3 list-decimal list-inside">
              <li>Our team reviews your application within 5 business days.</li>
              <li>
                We may reach out for additional documentation or a brief call.
              </li>
              <li>
                Upon approval, you receive your PCB certification and immediate
                access to all benefits.
              </li>
              <li>
                Your dedicated concierge will schedule an onboarding session.
              </li>
            </ol>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/calculator"
              className="px-6 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded-sm hover:bg-[var(--color-ember-bright)] transition-colors"
            >
              Estimate Your Benefits
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-[var(--color-parchment)] text-[var(--color-ink-light)] text-[14px] font-medium rounded-sm hover:border-[var(--color-sage)] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Steps ──
  return (
    <div className="bg-[var(--color-paper-warm)] min-h-[80vh]">
      {/* Hero */}
      <section className="bg-[var(--color-canopy)] text-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.2em] mb-4">
            Portland Commons Business
          </p>
          <h1 className="font-editorial-normal text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-4">
            Apply for Portland Commons Certification
          </h1>
          <p className="text-white/60 text-[15px] max-w-xl mx-auto leading-relaxed">
            Join Portland&apos;s network of certified local businesses. Access
            tax benefits, real estate, launch sponsorships, and more.
          </p>
        </div>
      </section>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 -mt-5">
        <div className="bg-white border border-[var(--color-parchment)] rounded-sm p-4 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors ${
                  s === step
                    ? "bg-[var(--color-canopy)] text-white"
                    : s < step
                      ? "bg-[var(--color-ember)] text-[var(--color-canopy)]"
                      : "bg-[var(--color-parchment)] text-[var(--color-ink-muted)]"
                }`}
              >
                {s < step ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  s
                )}
              </div>
              <span className="hidden sm:inline text-[13px] font-medium text-[var(--color-ink-light)]">
                {s === 1
                  ? "Business Info"
                  : s === 2
                    ? "Eligibility"
                    : "Review & Submit"}
              </span>
              {s < 3 && (
                <div className="hidden sm:block w-12 h-px bg-[var(--color-parchment)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        {/* ── Step 1: Business Info ── */}
        {step === 1 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h2 className="font-editorial-normal text-2xl text-[var(--color-canopy)] mb-1">
                Business Information
              </h2>
              <p className="text-[14px] text-[var(--color-ink-muted)]">
                Tell us about your business.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Business Name</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="e.g. Canopy Coffee Co."
                  value={info.businessName}
                  onChange={(e) => updateInfo("businessName", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>Business Address</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="123 SW Main St, Portland, OR 97204"
                  value={info.address}
                  onChange={(e) => updateInfo("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Entity Type</label>
                  <select
                    className={selectClasses}
                    value={info.entityType}
                    onChange={(e) => updateInfo("entityType", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {ENTITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Sector</label>
                  <select
                    className={selectClasses}
                    value={info.sector}
                    onChange={(e) => updateInfo("sector", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Owner Name(s)</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Jane Doe, John Smith"
                  value={info.ownerNames}
                  onChange={(e) => updateInfo("ownerNames", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Email</label>
                  <input
                    type="email"
                    className={inputClasses}
                    placeholder="you@business.com"
                    value={info.email}
                    onChange={(e) => updateInfo("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Phone</label>
                  <input
                    type="tel"
                    className={inputClasses}
                    placeholder="(503) 555-0100"
                    value={info.phone}
                    onChange={(e) => updateInfo("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Number of Employees</label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="12"
                    min="0"
                    value={info.numEmployees}
                    onChange={(e) => updateInfo("numEmployees", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    % Oregon-Resident Employees
                  </label>
                  <input
                    type="number"
                    className={inputClasses}
                    placeholder="85"
                    min="0"
                    max="100"
                    value={info.pctOregonResidents}
                    onChange={(e) =>
                      updateInfo("pctOregonResidents", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  Year Founded / Planned Opening
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="2024 or March 2025"
                  value={info.yearFounded}
                  onChange={(e) => updateInfo("yearFounded", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClasses}>Business Description</label>
                <textarea
                  className={`${inputClasses} min-h-[100px] resize-y`}
                  placeholder="What does your business do? Who do you serve?"
                  value={info.description}
                  onChange={(e) => updateInfo("description", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-semibold rounded-sm hover:bg-[var(--color-canopy-mid)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Eligibility ── */}
        {step === 2 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h2 className="font-editorial-normal text-2xl text-[var(--color-canopy)] mb-1">
                Eligibility Confirmation
              </h2>
              <p className="text-[14px] text-[var(--color-ink-muted)]">
                Confirm that your business meets the following criteria.
              </p>
            </div>

            <div className="space-y-4">
              {ELIGIBILITY_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-4 p-4 rounded-sm border cursor-pointer transition-all ${
                    eligibility[item.key]
                      ? "border-[var(--color-canopy)] bg-[var(--color-canopy)]/[0.03]"
                      : "border-[var(--color-parchment)] bg-white hover:border-[var(--color-sage)]"
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                        eligibility[item.key]
                          ? "bg-[var(--color-canopy)] border-[var(--color-canopy)]"
                          : "border-[var(--color-parchment)]"
                      }`}
                    >
                      {eligibility[item.key] && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] text-[var(--color-ink)] leading-relaxed">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={eligibility[item.key]}
                    onChange={() => toggleEligibility(item.key)}
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-3 text-[14px] font-medium text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                disabled={!allEligible}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--color-canopy)] text-white text-[14px] font-semibold rounded-sm hover:bg-[var(--color-canopy-mid)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="animate-fade-up space-y-8">
            <div>
              <h2 className="font-editorial-normal text-2xl text-[var(--color-canopy)] mb-1">
                Review Your Application
              </h2>
              <p className="text-[14px] text-[var(--color-ink-muted)]">
                Please verify the information below, then submit.
              </p>
            </div>

            {/* Summary */}
            <div className="metric-card space-y-5" style={{ cursor: "default" }}>
              <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em]">
                Business Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[14px]">
                {[
                  ["Business Name", info.businessName],
                  ["Address", info.address],
                  [
                    "Entity Type",
                    ENTITY_TYPES.find((t) => t.value === info.entityType)
                      ?.label || info.entityType,
                  ],
                  [
                    "Sector",
                    SECTORS.find((s) => s.value === info.sector)?.label ||
                      info.sector,
                  ],
                  ["Owner(s)", info.ownerNames],
                  ["Email", info.email],
                  ["Phone", info.phone],
                  ["Employees", info.numEmployees],
                  ["% Oregon Residents", `${info.pctOregonResidents}%`],
                  ["Founded", info.yearFounded],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[var(--color-ink-muted)] text-[12px] uppercase tracking-[0.08em] font-semibold">
                      {label}
                    </dt>
                    <dd className="text-[var(--color-ink)] mt-0.5">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-[var(--color-ink-muted)] text-[12px] uppercase tracking-[0.08em] font-semibold">
                    Description
                  </dt>
                  <dd className="text-[var(--color-ink)] mt-0.5">
                    {info.description}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="metric-card" style={{ cursor: "default" }}>
              <h3 className="text-[11px] font-semibold text-[var(--color-ember)] uppercase tracking-[0.15em] mb-3">
                Eligibility Confirmed
              </h3>
              <ul className="space-y-2">
                {ELIGIBILITY_ITEMS.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 text-[14px] text-[var(--color-ink-light)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-fern)] shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {errors._form && (
              <p className="text-[14px] text-[var(--color-clay)] font-medium">
                {errors._form[0]}
              </p>
            )}
            {Object.keys(errors).length > 0 && !errors._form && (
              <p className="text-[14px] text-[var(--color-clay)] font-medium">
                Please fix the errors above and try again.
              </p>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-3 text-[14px] font-medium text-[var(--color-ink-light)] hover:text-[var(--color-ink)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--color-ember)] text-[var(--color-canopy)] text-[14px] font-semibold rounded-sm hover:bg-[var(--color-ember-bright)] transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
