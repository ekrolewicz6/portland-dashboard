/**
 * One-line versions of the continuum's long texts, for a page that shows
 * numbers, bars, and chips by default and keeps paragraphs behind a tap.
 * Every entry mirrors a full string in continuum.ts; the full text stays
 * the source of truth and is reachable from every short line.
 */

export interface StageShort { purpose: string; exists: string; gap: string; doNow: string; metric: string; owner: string }

export const STAGE_SHORT: Record<string, StageShort> = {
  prevention: { purpose: "Keep a household in its home before it ever enters the system.", exists: "The county helped 1,806 people avoid eviction in FY2026, and the state runs a Medicaid rent benefit.", gap: "Nobody measures how fast the money arrives, how many households were first-timers, or whether they were still housed a year later, and the state funded a fifth of what was asked.", doNow: "Pay providers for each household kept housed, and publish how fast the money lands and who is still housed a year on.", metric: "Payment in 5 days; 85% housed at 12 months", owner: "County HSD; the county board" },
  diversion: { purpose: "A real conversation and a small payment, so a person never has to enter a bed or a queue.", exists: "Nothing exists. Every intake runs on its own rules, door by door.", gap: "The largest and cheapest group of people has no stage built for them and no count of how many they are.", doNow: "Fund a flexible cash pool and one front door for adults, and record every diversion attempt and how it turned out.", metric: "Share of first-timers diverted", owner: "Nobody today; the county entry point" },
  "unsheltered-active": { purpose: "Know everyone sleeping outside by name, and give each of them a worker and a next step.", exists: "Street Response, 113 city camp workers, and contracted outreach teams are on the street; the county's ten navigators were cut to zero.", gap: "Contacts are counted but conversions are not, and offers nobody could accept get written down as the person refusing.", doNow: "Bring back the navigators, give every person one named lead, and write the city's offers into the same record as the county's.", metric: "Named lead in 7 days for 90%; yes-to-arrival by hour", owner: "County HSD and the city, one coordinator" },
  "institutional-exit": { purpose: "Find people who are homeless while they are still inside a jail or a hospital, and arrange the next place before they walk out.", exists: "In-reach exists only for people already on supervision; the planned reentry hub is not built.", gap: "Nobody asks about housing at booking or records where people go at release, and the median jail stay is about one day.", doNow: "Ask about living situation at booking, and put in-reach workers inside the jail and the hospitals.", metric: "Arrival within 7 days of release", owner: "Sheriff, courts, hospitals; the public-safety council" },
  "intake-match": { purpose: "Turn a person the system knows into a housing referral with a move-in date.", exists: "Coordinated Access assessed 4,853 people and placed 484 of them in FY2024.", gap: "Nine in ten people who complete an assessment are still waiting, and the county cut the program's budget nearly in half.", doNow: "Restore the $9.3M, publish the queue in days waiting, and record who rejected each referral and why.", metric: "Waiting over 90 days; placed per assessed", owner: "County HSD; Home Forward; the board" },
  "crisis-sobering": { purpose: "Get a person through a crisis somewhere other than an emergency room or a cell, then hand them to the next stage.", exists: "Thirteen sobering stations that only referral partners can open, and Unity's psychiatric emergency room.", gap: "The sobering door refuses anyone who cannot consent, and there is no way in from the street, an emergency room, or the jail.", doNow: "Open the sobering door to walk-ins and to emergency-room and jail referrals, and publish where people go when they leave.", metric: "Arrival within 7 days of exit; admissions by source", owner: "County; Legacy Health (Unity); the city" },
  "withdrawal-management": { purpose: "Supervised withdrawal with medication started, and the next bed already held.", exists: "Hooper admits people for one hour on weekday mornings; the region has 139 withdrawal beds.", gap: "That is a third of the beds the state says are needed, and only 17 of every 100 people recommended for treatment get a bed afterward.", doNow: "Extend intake hours, hold the next bed before discharge, and publish how many beds are open each morning.", metric: "Recommended-to-placed match within 7 days", owner: "Central City Concern; OHA; the county" },
  "residential-treatment": { purpose: "Clinical care that cannot happen at home, with the step down planned from the day of admission.", exists: "The region licenses 639 residential, 311 inpatient, and 127 secure beds.", gap: "That is about a third of what the state says is needed, many licensed beds are not staffed, and there is nowhere to step down to.", doNow: "Staff the beds that are already licensed, and publish how many are staffed and open.", metric: "Ready-to-discharge days; exits by destination", owner: "OHA; care organizations; providers" },
  "medical-respite": { purpose: "A bed with nursing care for someone too sick for a shelter and not sick enough for a hospital.", exists: "One program with 84 beds takes referrals on weekdays; the only step-down motel closed this year.", gap: "Hospitals send housing-insecure patients out under a routine 'self-care' code most of the time, with no protocol and no payer.", doNow: "Replace the step-down beds that closed, and require every hospital to log where each patient actually went.", metric: "Discharges by destination, per hospital", owner: "Hospitals; Central City Concern; the state" },
  "emergency-shelter": { purpose: "A safe place for a short while, with a plan for where the person goes next.", exists: "About 2,965 beds and units remain after this year's cuts, and county sites run 88% full.", gap: "Half of the people who leave shelter go somewhere nobody recorded, one in six reaches housing, and the motels that worked best were closed first.", doNow: "Pay shelters for exits and for exit data rather than for beds, and convert the weakest sites before closing the strong ones.", metric: "Exits to housing per bed; unknown destinations under 10%", owner: "County; city; each operator" },
  "bridge-transition": { purpose: "A staffed, private place to stay between treatment or jail and a lease.", exists: "About 333 beds are known to exist, and there is no inventory.", gap: "This is the biggest hole in the stabilize-first lane, and no agency owns it.", doNow: "Build the registry first, then add bridge beds for people leaving detox and jail.", metric: "Share arriving at a lease", owner: "Nobody today; the county" },
  "rapid-rehousing": { purpose: "A lease in the person's name, a subsidy that steps down over time, and light help along the way.", exists: "The county placed 938 people in FY2026 after an $8.7M mid-year cut.", gap: "Nobody reports whether people are still housed after the subsidy ends.", doNow: "Restore the $8.7M, check on every household at month 25, and move families onto permanent subsidies.", metric: "Retention at 12 and 24 months", owner: "County HSD; the board" },
  "permanent-supportive-housing": { purpose: "A lease with support attached for as long as it is needed, with no treatment required first.", exists: "The region has 6,973 supportive-housing beds and placed 439 people in FY2026.", gap: "Vacancy, program fidelity, and whether the right people get the units are all unpublished, and the federal subsidy is in litigation.", doNow: "Fill the vacant units, fund the ACT teams and a landlord risk fund, and protect the subsidy line.", metric: "Retention 85/80/75; vacancy days", owner: "Providers; Home Forward; the county; HUD" },
  retention: { purpose: "Make sure people who were housed stay housed, and catch trouble before it becomes an eviction.", exists: "Case management sits inside the housing contracts; there is no retention budget and no rate.", gap: "The county counts people as 'sustained' with no denominator, and returns to homelessness have no target.", doNow: "Publish a quarterly table of who is still housed, and fund a team that responds to trouble within 72 hours.", metric: "Returns 20% or less at 6 months", owner: "The placing program; then the county" },
};

export const PATHWAY_SHORT: Record<string, string> = {
  "economic-shock": "Cash arriving inside the eviction clock does more for this family than a shelter bed would, so the path skips the clinical stages entirely.",
  "vehicle-homeless": "A working household in a vehicle is self-sheltered until it gets towed. Safe parking is the bridge, and Portland has none.",
  families: "A family needs somewhere the same night, then a subsidy that lasts. Time-limited help leaves them roughly where they started.",
  youth: "A young person needs a youth-specific door within a day or two. Only the housing step here has been tested in a trial.",
  "dv-trafficking": "Everything follows the survivor's choice: a confidential place the same day, flexible cash, and records kept out of the shared system.",
  sud: "Survival and medication come first. Detox and treatment are detours along the way, taken when they help.",
  smi: "The shortest tested path runs from the street to a lease with an ACT team, with crisis care as a detour when it is needed.",
  "dual-diagnosis": "One team holds one plan, so nobody gets sent away to fix the other problem first.",
  "medical-fragile": "A worker joins at admission and respite is arranged before discharge, so the hospital door does not open onto the sidewalk.",
  "chronic-stable": "Verify the person, match them within 90 days, and use low-barrier shelter only while the unit comes together.",
  "justice-involved": "The work starts before release, with a bridge bed held and supportive housing a few months out.",
  "service-refusing": "The same small team comes back again and again with an offer that takes the pet, the partner, and the belongings.",
  veterans: "Veterans travel the VA's parallel system: its center, its bridge beds, and a HUD-VASH lease at the end.",
};

export const FIRST_DOOR_SHORT: Record<number, string> = {
  1: "Call 911 or go to any emergency department. Unity takes adults 18 to 70. For a child under 18, the state hotline or an emergency department.",
  2: "Sobering will take an adult who can agree to go, by referral only. Anyone else goes to Unity or an emergency department. Detox opens at 6:45 on weekday mornings.",
  3: "After midnight, call the crisis line at 503-988-4888 or bring the person to Unity. Portland Street Response runs from 6 a.m. to midnight.",
  4: "Families reach 211 and get a call back within 72 hours. Youth aged 16 to 24 can walk into Porch Light from 9 p.m. to 5 a.m. Survivors can call Call to Safety any hour. For a child under 16, call 855-503-7233.",
  5: "There is no diversion door tonight. The closest tools open in the morning.",
  6: "No adult shelter takes walk-ins at night; the city's overnight sites are first come. Veterans can call 1-877-424-3838 any hour.",
};

export const LADDER_SHORT: Record<number, string> = {
  1: "Someone impaired tonight is being deferred rather than refusing, and the law already names where they can go.",
  2: "Most refusals are of a poor offer, so record what was wrong with it and then fix it.",
  3: "The same few workers come back with a real offer.",
  4: "A clinician can tell refusal apart from psychosis or withdrawal, and a hold only helps if a bed waits at the other end.",
  5: "Write down what the person turned down and why, and leave the phrase service-refusing out of it.",
  6: "Enforcement only after a documented, usable offer, with belongings stored.",
  7: "Publish the declines by offer and by hour, alongside the headline count.",
};

export const POLICE_SHORT: string[] = [
  "Two statutes are the whole of their authority: a person incapacitated in public, or a danger to themselves or others.",
  "They can open three doors tonight: sobering for someone who can agree to go, Unity, or an emergency department. A shelter bed or a housing assessment is beyond what anyone can reach at 2 a.m.",
  "Their record is the dispatch disposition, matched to the receiving door each month. Entering it in the housing system belongs to the site that took the person, and a warrant stays out of the shared record.",
  "Camping enforcement is a daytime step that comes after a usable offer; it is not how most people meet the system.",
  "If police are needed at any later stage, a step has already failed, and the count records it that way.",
];

export const OFF_SHORT: string[] = [
  "Know who is outside, by name, and give each person one worker who owns their case.",
  "Offer the right first door for the person in front of you, not the bed that happens to be open.",
  "Make the offer real: a place that takes the pet, the partner, and the belongings, with a ride there and a bed held.",
  "Hold the next place before the person leaves this one; that is where people are lost.",
  "For the sickest few, stabilize first, for hours or weeks, then a lease with a team behind it.",
  "Enforce last, on the record, with the person's worker present.",
];

export const HF_SHORT: Record<string, string> = {
  "Serious mental illness with long or repeated homelessness": "Offer the lease now with an ACT team behind it; in the trial, people were housed in 73 days instead of 220.",
  "Co-occurring mental illness and substance use": "Housing with no prerequisites and one integrated team, so nobody is told to fix the other problem first.",
  "Frequent jail users": "Reach the person before release, hold a bridge bed, and get them into supportive housing within a few months.",
  "Young adults 18–24 with mental illness": "An immediate lease with case management works; youth-specific tailoring has never been tested.",
  "Families with children": "It works when the subsidy is permanent; time-limited help leaves families no better off.",
  "Any program calling itself Housing First": "Only when it is the real thing: a normal lease, no readiness test, and enough staff for ten people each.",
  "The highest-acuity few in a scarce market": "It takes master leasing, a fund for damage and vacancy, a rapid-response team, and a cap on how many at once.",
  "As a treatment for substance use": "It keeps people housed and out of emergency rooms, but it does not change drug use on its own; medication does.",
  "Someone who cannot plan tonight": "Stabilize first, for hours or weeks, then make the offer from that bed; the system can hold the lease if signing is in doubt.",
  "Someone too sick for a shelter": "Medical respite first, arranged before the hospital lets them go.",
  "Time-limited rapid rehousing as a Housing First substitute": "The subsidy runs out before income recovers; if nobody checks at month 25, the failure stays invisible.",
  "Compulsory treatment as the route in": "A court order with no bed and no team behind it produces a discharge, not a recovery.",
  "A region with no units": "It is a rule for placing people, not a plan for building; where there are no units, the constraint is supply.",
};

export const LANE_SHORT: Record<string, { who: string; firstDoor: string }> = {
  lane1: { who: "Losing housing is the whole problem here. This person could hold a lease tomorrow.", firstDoor: "Cash and a conversation, before anyone offers a bed." },
  lane2: { who: "This person does well with steady support and struggles without it. The lane is assigned at the first handoff.", firstDoor: "A unit, with intensive case management from the first day." },
  lane3: { who: "Across repeated contacts this person cannot make a plan, and turns up often in crisis.", firstDoor: "Stabilization first, with the next place held and a worker who follows them." },
};

export const RULES_SHORT: string[] = [
  "A person is counted where they physically are, and a place on a waiting list never adds to the headcount.",
  "Nobody has left a stage until the place receiving them writes down that they arrived.",
  "Sobering, detox, treatment, or respite may come first for some people, but none of them is the price of a lease.",
  "Every exit from an institution carries a named worker, a next place already held, and a handoff within seven days.",
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
