/**
 * One-line versions of the continuum's long texts, for a page that shows
 * numbers, bars, and chips by default and keeps paragraphs behind a tap.
 * Every entry mirrors a full string in continuum.ts; the full text stays
 * the source of truth and is reachable from every short line.
 */

export interface StageShort { purpose: string; exists: string; gap: string; doNow: string; metric: string; owner: string }

export const STAGE_SHORT: Record<string, StageShort> = {
  prevention: { purpose: "Keep the household housed before it enters the system.", exists: "1,806 people helped in FY2026; a Medicaid rent benefit statewide.", gap: "No speed, first-time, or 12-month measure; the state funded a fifth of the ask.", doNow: "Pay per household kept housed; publish speed and 12-month stability.", metric: "Payment in 5 days; 85% housed at 12 months", owner: "County HSD; the county board" },
  diversion: { purpose: "A conversation and a small payment so no one enters a bed or a queue.", exists: "Nothing. Intake runs door by door.", gap: "No stage and no count for the largest, cheapest cohort.", doNow: "Fund a cash pool and one adult entry point; record every attempt.", metric: "Share of first-timers diverted", owner: "Nobody today; the county entry point" },
  "unsheltered-active": { purpose: "Know everyone outside by name; give each a lead and a next step.", exists: "Street Response, 113 camp workers, contracted outreach; navigators cut to zero.", gap: "Contacts counted, conversions not; unusable offers coded as refusals.", doNow: "Restore navigators; one named lead per person; write city offers into the shared row.", metric: "Named lead in 7 days for 90%; yes-to-arrival by hour", owner: "County HSD and the city, one coordinator" },
  "institutional-exit": { purpose: "Find people inside jail and hospital; arrange the next place before the door opens.", exists: "In-reach for people on supervision only; a reentry hub unbuilt.", gap: "No housing question at booking, no release destination; median stay one day.", doNow: "Ask living situation at booking; in-reach staff inside jail and hospitals.", metric: "Arrival within 7 days of release", owner: "Sheriff, courts, hospitals; the public-safety council" },
  "intake-match": { purpose: "Turn a known person into a referral and a move-in date.", exists: "Coordinated Access: 484 placed of 4,853 assessed (FY2024).", gap: "Nine in ten wait; funding cut from $9.3M to $4.7M.", doNow: "Restore $9.3M; publish the queue in days; code every rejection.", metric: "Waiting over 90 days; placed per assessed", owner: "County HSD; Home Forward; the board" },
  "crisis-sobering": { purpose: "Resolve a crisis somewhere other than an ED or a cell, then hand off.", exists: "13 sobering stations, referral-only; Unity's emergency room.", gap: "The door refuses anyone who cannot consent; no walk-in, ED, or jail path.", doNow: "Open the door to walk-in, ED, and jail referrals; publish dispositions.", metric: "Arrival within 7 days of exit; admissions by source", owner: "County; Legacy Health (Unity); the city" },
  "withdrawal-management": { purpose: "Supervised withdrawal with medication, and the next bed held.", exists: "Hooper, one intake hour on weekday mornings; 139 beds region-wide.", gap: "A third of the beds needed; 17% of those recommended for treatment get placed.", doNow: "Extend intake hours; hold the next bed; publish open beds.", metric: "Recommended-to-placed match within 7 days", owner: "Central City Concern; OHA; the county" },
  "residential-treatment": { purpose: "Clinical care that cannot happen in housing, with step-down planned.", exists: "639 residential, 311 inpatient, 127 secure beds, licensed.", gap: "A third of need; licensed beds nobody can place into; no step-down.", doNow: "Staff the licensed beds; publish staffed versus licensed.", metric: "Ready-to-discharge days; exits by destination", owner: "OHA; care organizations; providers" },
  "medical-respite": { purpose: "A bed with clinical oversight for people too sick for shelter.", exists: "84 beds, weekday referrals; the step-down motel closed.", gap: "Discharges coded self-care 73% of the time; no protocol, no payer.", doNow: "Replace the step-down capacity; a hospital destination log.", metric: "Discharges by destination, per hospital", owner: "Hospitals; Central City Concern; the state" },
  "emergency-shelter": { purpose: "Short-term safety with a documented exit plan.", exists: "About 2,965 beds and units after the cuts; county sites 88% full.", gap: "Half of exits go nowhere recorded; 16% reach housing; motels closed first.", doNow: "Pay for exits and exit data, not beds; convert poor performers first.", metric: "Exits to housing per bed; unknown destinations under 10%", owner: "County; city; each operator" },
  "bridge-transition": { purpose: "A staffed, non-congregate place between treatment or jail and a lease.", exists: "About 333 known beds; no inventory.", gap: "The largest hole in the stabilize-first lane; nobody owns it.", doNow: "A registry first; then bridge beds for detox and jail exits.", metric: "Share arriving at a lease", owner: "Nobody today; the county" },
  "rapid-rehousing": { purpose: "A lease plus a stepping-down subsidy and light help.", exists: "938 placed in FY2026 after an $8.7M cut.", gap: "Retention after the subsidy ends is unreported.", doNow: "Restore the $8.7M; check month 25; convert families to permanent subsidies.", metric: "Retention at 12 and 24 months", owner: "County HSD; the board" },
  "permanent-supportive-housing": { purpose: "A lease with services attached, no treatment precondition.", exists: "6,973 beds tri-county; 439 newly placed in FY2026.", gap: "Vacancy, fidelity, and acuity match unpublished; the federal grant in litigation.", doNow: "Fill vacancies; fund ACT teams and a risk fund; protect the subsidy line.", metric: "Retention 85/80/75; vacancy days", owner: "Providers; Home Forward; the county; HUD" },
  retention: { purpose: "Verify people stay housed; catch trouble before eviction.", exists: "Case management inside contracts; no retention line.", gap: "Sustained counts with no denominator; returns have no target.", doNow: "A quarterly cohort table; a 72-hour tenancy-response team.", metric: "Returns 20% or less at 6 months", owner: "The placing program; then the county" },
};

export const PATHWAY_SHORT: Record<string, string> = {
  "economic-shock": "Cash inside the eviction clock beats shelter; the clinical stages are skipped on purpose.",
  "vehicle-homeless": "Self-sheltered until towed; safe parking is the bridge, and Portland has none.",
  families: "Same-day non-congregate placement, then a permanent subsidy; rapid rehousing alone fails.",
  youth: "Youth-only doors, never the adult queue; only the housing step is trial-backed.",
  "dv-trafficking": "Survivor choice: confidential placement, flexible cash, records kept out of the shared system.",
  sud: "Medication and survival first; detox and treatment are detours, never the ticket.",
  smi: "Street to lease with an ACT team; crisis care as a detour, not a prerequisite.",
  "dual-diagnosis": "One team, one plan; nobody is told to fix the other thing first.",
  "medical-fragile": "Worker attached at admission; respite before discharge; never to the street.",
  "chronic-stable": "Verify, match within 90 days, hold in low-barrier shelter, then supportive housing.",
  "justice-involved": "Reach in before release; a held bridge bed; supportive housing within months.",
  "service-refusing": "The same small team, repeatedly, with an offer that takes the pet and the partner.",
  veterans: "The VA's parallel system: its center, its bridge beds, a HUD-VASH lease.",
};

export const FIRST_DOOR_SHORT: Record<number, string> = {
  1: "911 or any ED. Unity for adults 18–70. Under 18: the state hotline or an ED.",
  2: "Sobering only if they can consent (referral-only). Otherwise Unity or an ED. Detox opens 6:45 a.m. weekdays.",
  3: "After midnight: crisis line 503-988-4888 or Unity. Street Response 6 a.m. to midnight.",
  4: "Families: 211, callback in 72 hours. Youth 16–24: Porch Light, 9 p.m.–5 a.m. Survivors: Call to Safety 24/7. Under 16: 855-503-7233.",
  5: "No diversion door exists tonight.",
  6: "No adult shelter intake at night; city overnight sites first-come. Veterans: 1-877-424-3838.",
};

export const LADDER_SHORT: Record<number, string> = {
  1: "Impaired tonight is a deferral, not a decline; the law names the doors for the incapacitated.",
  2: "Most refusals are of a bad offer: code the reason against the offer, then fix the offer.",
  3: "The same few workers come back with a real offer.",
  4: "A clinician tells refusal from psychosis or withdrawal; a hold needs a bed at the other end.",
  5: "Never 'service-refusing'; declines live on the offer, not the person.",
  6: "Enforcement only after a documented, usable offer, with belongings stored.",
  7: "Publish the declines by offer and hour beside the headline.",
};

export const POLICE_SHORT: string[] = [
  "Two statutes are their whole authority: incapacitated in public, or a danger to self or others.",
  "Three doors tonight: sobering (if consenting), Unity, an emergency department. Not shelter, not housing.",
  "Their record is a dispatch disposition, matched monthly. Never HMIS, never a warrant in a shared row.",
  "Camping enforcement is a day-unit step after a usable offer, not the model contact.",
  "Police at any later stage means a step failed, and it is counted that way.",
];

export const OFF_SHORT: string[] = [
  "Know who is outside, with a named lead.",
  "The right first door for the person, not the open bed.",
  "A real offer: pet, partner, belongings, a ride, a held bed.",
  "Hold the next place before they leave this one.",
  "Highest acuity: stabilize for hours to weeks, then a lease with a team.",
  "Enforcement last, on the record, with the lead present.",
];

export const HF_SHORT: Record<string, string> = {
  "Serious mental illness with long or repeated homelessness": "Lease now, ACT team for high need; housed in 73 days versus 220.",
  "Co-occurring mental illness and substance use": "Housing without prerequisites, one integrated team.",
  "Frequent jail users": "Reach in, a held bridge bed, supportive housing within months.",
  "Young adults 18–24 with mental illness": "An immediate lease with case management; youth tailoring untested.",
  "Families with children": "Works with a permanent subsidy, not a time-limited one.",
  "Any program calling itself Housing First": "Only at fidelity: a real lease, no readiness test, staffed at one to ten.",
  "The highest-acuity few in a scarce market": "Master leasing, a risk fund, a response team, capped volume.",
  "As a treatment for substance use": "Keeps people housed; does not change use. Add medication.",
  "Someone who cannot plan tonight": "Stabilize first, hours to weeks; offer from the bed; the system holds the lease.",
  "Someone too sick for a shelter": "Respite first, arranged before discharge.",
  "Time-limited rapid rehousing as a Housing First substitute": "The subsidy ends before income recovers; track month 25.",
  "Compulsory treatment as the route in": "An order without a bed and a team is a discharge.",
  "A region with no units": "A placement rule, not a plan; the constraint is supply.",
};

export const LANE_SHORT: Record<string, { who: string; firstDoor: string }> = {
  lane1: { who: "Housing loss is the problem; can hold a lease tomorrow.", firstDoor: "Cash and a conversation before any bed." },
  lane2: { who: "Succeeds with support, fails without; assigned at handoff.", firstDoor: "A unit plus intensive case management from day one." },
  lane3: { who: "Cannot plan across repeated contacts; frequent crisis contact.", firstDoor: "Stabilization first, the next place held, a lead who follows." },
};

export const RULES_SHORT: string[] = [
  "Counted where they physically are; queues never add to a headcount.",
  "Nobody has left until the receiving site writes the arrival.",
  "Sobering, detox, treatment, respite come first for some; none is the ticket to a lease.",
  "Every exit carries a named lead, a held next place, a handoff within 7 days.",
];

export const FAIL_SHORT: Record<number, string> = {
  1: "The weekly table turns the stage red beside its owner.",
  2: "The owner says what changes, by when, and which number moves.",
  3: "Part of the payment waits until the missing rows exist.",
  4: "Slots, beds, and subsidies move to whoever hits the number.",
  5: "The contract or the role moves, and the board says why.",
};

export const ENFORCER_SHORT: Record<string, string> = {
  "The county board": "SHS dollars and every county contract",
  "The city council": "Street Response, city shelters, the city-county agreement",
  "The SHS Regional Policy and Oversight Committee": "The regional table and shared standards",
  "The Sheriff and the circuit court": "The booking question and the release notice",
  "The Oregon Health Authority, the coordinated care organizations, and the Legislature": "Licensing, payment, the benefits still under study",
  "The public": "The weekly table",
};
