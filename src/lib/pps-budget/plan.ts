/**
 * The Movable Dollar Plan — the page's action layer, transcribed from
 * research/pps-budget/recommendations.md (the version that survived the
 * seven-persona red team and the final hostile judge).
 */

export const RED_TEAM = {
  personas: [
    "District CFO",
    "Union research director",
    "N/NE Portland equity advocate",
    "Anti-closure parent organizer",
    "Construction bond veteran",
    "Board general counsel",
    "Retired deputy superintendent",
  ],
  objections: 58,
  fatal: 18,
  note: "Each decision is printed with the strongest objection we could construct against it, and the answer. Where an objection exposed a real weakness, the decision you are reading already absorbed it.",
} as const;

export interface PlanDecision {
  id: string;
  title: string;
  motion: string;
  cost: string;
  authority: string;
  objection: { from: string; text: string };
  answer: string;
  status: "changed" | "defended";
}

export const PLAN_DECISIONS: PlanDecision[] = [
  {
    id: "D0",
    title: "Reconcile the plan with the board's own governance model",
    motion:
      "Amend governance policy to expressly reserve fiscal transparency, budget development, capital oversight, the contract portfolio, and enrollment and attendance goals as board-level matters.",
    cost: "One policy amendment",
    authority: "The board owns its own governance policies",
    objection: {
      from: "a veteran school administrator",
      text: "Half these motions are operational directives from a board whose governance model forbids exactly that. The two-word veto is 'operational matter.'",
    },
    answer:
      "Correct, which is why this is Decision 0, first in time. A board cannot govern outcomes while blind to money; the framework itself assumes functioning financial reporting, which this district does not have.",
    status: "changed",
  },
  {
    id: "D1",
    title: "Publish the books, at the speed the books can bear",
    motion:
      "Make the interim reports PPS already publishes decision-grade: fund 2-3 finance analysts first, exempt from every savings target; add seasonal comparators, a revision log, and a public forecast-accuracy scorecard to the existing quarterly and monthly reports; reconcile every material forecast change in public session; publish the one-page budget and the trend table in every book; publish the strike-settlement cost model.",
    cost: "2-3 positions, under half a percent of the deficit",
    authority: "Board policy; none of it touches a contract or statute",
    objection: {
      from: "a skeptical budget director",
      text: "You are ordering monthly financials from an office that just failed its annual close: six significant deficiencies and a Local Budget Law violation, with staff turnover named as the cause, after 96 central-office positions were cut. Every early error becomes next month's 'they lied' story.",
    },
    answer:
      "Which is why the decision funds capacity first and asks for decision quality, not publication volume. The reports already exist; the FY2025-26 series was public while the year-end forecast swung from $41M to $18M and back, and nothing forced a reconciliation. Two analysts and a scorecard cost less than one mid-year scramble.",
    status: "changed",
  },
  {
    id: "D2",
    title: "Give the citizen reviewers a real seat",
    motion:
      "Staged CBRC access written into the budget calendar itself: assumptions in January, detail as modules land, a guaranteed review window. The board's written item-by-item response published no later than the adoption meeting, with any failure explained in public session. TSCC asked to witness compliance.",
    cost: "Calendar discipline",
    authority: "The board created the CBRC; the board sets its terms",
    objection: {
      from: "a skeptical budget director",
      text: "Nine days exists because the state revenue forecast lands in May and adoption is bracketed at June 30. Four weeks earlier means four weeks staler.",
    },
    answer:
      "Accepted: staged access replaces the flat earlier deadline, so the committee gets real time without reviewing stale numbers. What we kept: nine working days for $2.8 billion, three years running, is a choice, and the committee's own reports say so.",
    status: "changed",
  },
  {
    id: "D3",
    title: "Hold the board to honest construction numbers",
    motion:
      "No ballot figure below the validated estimate range without a public line-item reconciliation. Rebaseline the 2025 bond program publicly within six months. Repair the Bond Accountability Committee and route its existing reports to the full board. Publish estimates-at-completion as ranges decomposed against a construction index. Ratify the $60M Center for Black Student Excellence as a floor with a scope decision by June 2027.",
    cost: "Validation fees, a rounding error against $1.83B",
    authority: "Board policy over the Office of School Modernization",
    objection: {
      from: "a construction industry veteran",
      text: "Validation theater. Independent estimates existed at every ballot, in 2017 and again in 2025, and leadership set the public number below them anyway, with no documented rationale, in the auditors' own words. You are asking for a second thermometer while the patient sets the reading.",
    },
    answer:
      "The single most important objection in the set, and the reason the rule binds the board rather than adding validators: adopting a number below the validated range requires a public, recorded, line-item explanation. That targets the actual failure mode of 2017, 2020, and 2025, which was never missing information.",
    status: "changed",
  },
  {
    id: "D4",
    title: "Move real dollars toward students, on a metric that cannot be gamed",
    motion:
      "Commission the peer benchmarking study and let it set the target. Measure 'dollars reaching schools and students' (instruction plus direct student supports) on a frozen, auditor-certified crosswalk. Start with an honest verified list, likely $2-5M, routed highest-need schools first. Apply the same rollback teeth to central administration lines as to anything touching a classroom.",
    cost: "Negative, but small at first",
    authority: "Board budget authority; the superintendent returns executable plans",
    objection: {
      from: "a skeptical budget director",
      text: "Every 'redirect money to classrooms' plan founders the same way: grant-funded positions free no discretionary dollar, contract spikes turn out to be one-time moving and legal costs, and the marquee purchases, counselors and librarians, are support functions under Oregon's chart of accounts, so a naive instructional-share target punishes buying the very things you want.",
    },
    answer:
      "All true, which is why this decision is built the way it is: the target waits for the study, the metric counts student supports on the right side of the line on a frozen auditor-certified crosswalk, and the starting list is only what survives line-by-line verification. Slower and true beats fast and fake. And overload pay is deliberately not on the menu: the contract itself calls it a penalty for understaffing, so it serves here as the leading indicator, never a funding source.",
    status: "changed",
  },
  {
    id: "D5",
    title: "The footprint correction: one decision, phased execution, promises sized to audited savings",
    motion:
      "Criteria adopted in public before any list, with historic under-investment as a counterweight and a cap on concentration in any one cluster. The savings model independently validated to the same standard as bond estimates, published for a 45-day review with per-school hearings. A racial-equity impact analysis under the board's own 2011 policy. Phased effective dates, no school before 2028-29. Savings split 70% to the deficit, 30% escrowed to named positions in receiving schools first, with a tripwire: future phases suspend if escrowed positions go unfunded.",
    cost: "Transition budget named before the vote; net savings likely $1-2M per elementary",
    authority: "The board's alone",
    objection: {
      from: "a parent fighting closures",
      text: "'Bind by resolution' binds no one. This district's record includes a 10 percent reserve policy pinned at 5, a pension reserve spent in one year, and a promise to the state of a right-sizing process by 2020-21 that is still 'planning' in 2026. You are asking my community to trade its school for the good faith of an institution your own research proves cannot be taken on faith.",
    },
    answer:
      "We could not fully answer this, and the plan says so in writing: a future board can un-vote anything. What replaced the promise: a dedicated fund, restricted appropriations, a public tracking table, an annual CBRC compliance review, and the tripwire. Breach is now visible, priced, and consequence-bearing. That is the strongest enforcement available to a school board, and communities deserve that sentence plainly.",
    status: "changed",
  },
  {
    id: "D6",
    title: "Run enrollment as the long game it actually is",
    motion:
      "An enrollment function missioned on kindergarten capture rate, disaggregated by race and cluster, targets set on closing the gaps, with the methodology produced outside the office that is graded on it. An intergovernmental agreement with Multnomah County on Preschool for All transitions. Exit interviews offered to every departing family, published in aggregate. Librarians and arts protected universally; TAG protected only paired with universal screening and demographic reporting.",
    cost: "Low single-digit millions, scored as an investment",
    authority: "Board and superintendent; the county agreement is negotiated, not assumed",
    objection: {
      from: "a skeptical budget director",
      text: "Enrollment recovery pays nothing for years. Oregon funds the higher of this year's or last year's count, and PPS is already paid on the prior year, so a recovered kindergartner adds zero formula revenue until recovery outruns the annual decline of roughly 800 students. Why fund an office now for money that arrives in 2030?",
    },
    answer:
      "Because the payback clock only starts when the work does. The math: near-zero marginal revenue in years one and two, then compounding for a decade as recovered cohorts prop up every future count. A recovered kindergartner is thirteen years of enrollment. This is the strongest long play the district has, and it is priced here as an investment, never a budget patch.",
    status: "changed",
  },
  {
    id: "D7",
    title: "Attendance: the cheapest outcome win, done so communities will accept it",
    motion:
      "A board goal on chronic absenteeism (above 36 percent, ten points over the national average) with quarterly reporting by school and by race, an annual coding audit, and a firewall: attendance never becomes a closure criterion. Supports specified as social workers, family-engagement staff, and community organizations, with an explicit no-law-enforcement-referral commitment. Calendar coherence pursued in successor bargaining, priced honestly, because the fragmented weeks are bargained preparation time.",
    cost: "Small, from Decision 4's verified tranche",
    authority: "Goal and reporting now; calendar at the table",
    objection: {
      from: "a union negotiator",
      text: "The calendar is not the board's to rebuild. The contract fixes the work year, requires our consent for aggregate changes, and those 'fragmented' days are the planning and development time we bargained because preparation is instruction. A unilateral resolution is an unfair labor practice charge waiting to be filed.",
    },
    answer:
      "Accepted in full. The PAT agreement runs through June 30, 2027, so the calendar becomes a priced objective for the next contract cycle, designed with the union as co-author, with time to cost it properly. The union's own members hate fragmented weeks too; a deal exists. Meanwhile the goal, the reporting, and the supports need nobody's consent and start now.",
    status: "changed",
  },
  {
    id: "D8",
    title: "Go to Salem with the right asks in the right venues",
    motion:
      "The adequacy case as the umbrella, three quantified asks inside it: raise the 11 percent special-education funding cap jointly with the appropriation, in coalition with the largest districts. Pursue a constitutional referral exempting voter-approved local option levies from Measure 5 compression, with a statutory backfill as the near-term win. State assumption of PERS rate shocks above a threshold. Plus: marginal Salem dollars flow through the equity allocation first, and the 2029 levy renewal becomes a named workstream in 2028.",
    cost: "Focus",
    authority: "The board speaks; the legislature and, for compression, the voters dispose",
    objection: {
      from: "a school-law attorney",
      text: "Measure 5 compression is in the Oregon Constitution. No bill fixes it, and a board that walks into Salem demanding a statutory fix to a constitutional provision forfeits exactly the credibility this decision was designed to buy.",
    },
    answer:
      "Accepted: the ask is now a joint resolution and a statewide campaign with the coalition of compression-losing districts, priced at two to three biennia, with the backfill bill as the achievable near-term metric. The $53.4M leak did not change; the vehicle did.",
    status: "changed",
  },
  {
    id: "D9",
    title: "Equity reporting built into every decision",
    motion:
      "Every metric this plan creates is reported disaggregated by race and school poverty band, on the same schedule as the aggregate. Every implementing resolution carries the equity analysis the board's 2011 policy contemplates. The equity allocation, halved in 2024-25 without the return-on-investment analysis the citizen committee twice requested, gets that analysis before any further change in either direction.",
    cost: "Reporting configuration. The cheapest decision in the plan",
    authority: "Board reporting standards",
    objection: {
      from: "a longtime N/NE Portland advocate",
      text: "Eight decisions and your board's own Racial Educational Equity Policy is never named. Per-student arithmetic that never asks which students is how this district has always hurt mine.",
    },
    answer:
      "Accepted without qualification. This decision exists because of that sentence, and the plan keeps it in print: every metric, disaggregated, on the same schedule as the aggregate, so the arithmetic can never again forget to ask.",
    status: "changed",
  },
];

export const RECONCILIATION_RULE =
  "In a year of cuts, closing the deficit comes first. The one exception: the small spending, analysts, scorecards, published models, that lets the public verify everything else.";
