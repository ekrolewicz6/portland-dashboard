/**
 * The predictions on record, before the closure.
 *
 * ODOT's forecast is quoted verbatim from its own public notice, with a date
 * and a link. That is the standard every prediction here has to meet.
 *
 * NOTHING ON THE OTHER SIDE MEETS IT, and that is a finding rather than a gap
 * to paper over. No advocacy organisation has made a public prediction about
 * this closure. Freeway-opposition groups' public posture is that the closure
 * is a necessary maintenance activity, not a test of anything, so attributing
 * a forecast to them would misrepresent their position.
 *
 * What we pre-register instead is the reduced-demand hypothesis as it appears
 * in the transportation research literature, attributed to that literature and
 * to nobody else. It is a real, testable claim with a long pedigree, and this
 * closure bears on it. It is not any Portland organisation's stated forecast.
 *
 * The asymmetry is stated on the page too: ODOT is a public agency whose
 * forecast is an official document the public is asked to plan around. A
 * hypothesis from the literature is not the same kind of object, and scoring
 * them as though they were would itself distort.
 */

export type Verdict = "borne-out" | "partly" | "not-borne-out" | "not-testable" | "too-early";

export interface Prediction {
  id: string;
  side: "odot" | "hypothesis";
  who: string;
  role: string;
  /** Verbatim where we have it; null where we are stating a hypothesis instead. */
  quote: string | null;
  /** Our plain-language statement of the testable claim. */
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  publishedOn: string | null;
  retrievedOn: string;
  /** True when this is our formulation of a position, not the speaker's words. */
  isParaphrase: boolean;
  /** The pre-registered rule that decides it. */
  rule: string;
  verdict: Verdict;
}

export const PREDICTIONS: Prediction[] = [
  {
    id: "O2",
    side: "odot",
    who: "Oregon Department of Transportation",
    role: "The agency running the closure",
    quote:
      "Travel times on I-5 near the project site could be two to three times longer than a typical travel day if every driver sticks to their normal travel patterns.",
    claim:
      "Peak travel time on the realistic southbound path will run 2–3× a normal day during the closure.",
    sourceTitle: "ODOT closure notice",
    sourceUrl:
      "https://www.i5rosequarter.org/news/odot-to-close-i-5-southbound-in-the-rose-quarter-in-september-for-up-to-five-weeks-for-structural-repairs/",
    publishedOn: "2026-05-04",
    retrievedOn: "2026-08-13",
    isParaphrase: false,
    rule: "Borne out if peak travel time on the path I-5 approach → I-405 → I-5 south reaches 2.0× the matched baseline on at least 3 of 5 weekdays in week 3. Partly, if 1.5–2.0×.",
    verdict: "too-early",
  },
  {
    id: "O3",
    side: "odot",
    who: "Oregon Department of Transportation",
    role: "The agency running the closure",
    quote:
      "Congestion on I-5 southbound during the morning and afternoon commutes is expected to extend into Vancouver.",
    claim:
      "Southbound queues will reach across the Columbia River into Washington. Unlike the travel-time forecast, this one carries no condition.",
    sourceTitle: "ODOT closure notice",
    sourceUrl:
      "https://www.i5rosequarter.org/news/odot-to-close-i-5-southbound-in-the-rose-quarter-in-september-for-up-to-five-weeks-for-structural-repairs/",
    publishedOn: "2026-05-04",
    retrievedOn: "2026-08-13",
    isParaphrase: false,
    rule: "Borne out if peak speeds at Washington I-5 stations north of the Interstate Bridge fall to 60% of baseline on 3 of 5 weekdays, and the same drop is absent northbound.",
    verdict: "too-early",
  },
  {
    id: "N2",
    side: "hypothesis",
    who: "The reduced-demand hypothesis",
    role: "From the transportation literature",
    quote: null,
    claim:
      "After an initial shock of a few days, traffic redistributes and conditions settle close to normal, because some trips are not made at all. This is the mirror image of induced demand, formalised by Anthony Downs in 1962 and repeatedly observed after unplanned closures elsewhere.",
    sourceTitle: "Downs, The Law of Peak-Hour Expressway Congestion, Traffic Quarterly",
    sourceUrl: "https://trid.trb.org/View/697530",
    publishedOn: "1962",
    retrievedOn: "2026-08-13",
    isParaphrase: true,
    rule: "Borne out if peak travel time on the realistic path is within 1.25× the matched baseline on at least 4 of 5 weekdays in week 3. Partly, if 1.25–1.5×.",
    verdict: "too-early",
  },
  {
    id: "N3",
    side: "hypothesis",
    who: "Reduced demand, the strong form",
    role: "From the transportation literature",
    quote: null,
    claim:
      "Some trips disappear rather than move. This is the claim that actually bears on whether the corridor needs more lanes, and the hardest one to measure, which is why the method below spends most of its effort on it.",
    sourceTitle: "Melo, Graham & Canavan, Effects of Road Investments on Induced Travel Demand",
    sourceUrl: "https://doi.org/10.3141/2297-20",
    publishedOn: "2012",
    retrievedOn: "2026-08-13",
    isParaphrase: true,
    rule: "Demonstrated if southbound volume across the two Columbia River crossings in week 3 falls to 0.95 or less of the matched baseline, and the drop exceeds two standard deviations of normal day-to-day variation. At 0.98 or above, traffic merely diverted.",
    verdict: "too-early",
  },
];

/** Shown wherever a verdict appears. Not a footnote. */
export const TEMPORARY_CAVEAT = {
  heading: "This is a five-week closure, not a freeway removal.",
  body: [
    "People behave differently when they know a disruption ends. For five weeks you can defer a trip, take vacation, work from home, or put up with a longer drive. You do not move house, change jobs, or buy a transit pass, and those are the adjustments that would matter most if these lanes were gone for good.",
    "That cuts both ways, and we do not know which way it cuts harder. A temporary closure can make traffic look like it evaporated when the trips were only postponed. It can equally understate the long-run effect, because the durable changes that drive most reduced demand never get a chance to happen in five weeks.",
    "So this closure can settle whether either side's extreme case is wrong. It cannot settle the $2 billion question. Anyone who tells you it did, in either direction, is selling something.",
  ],
} as const;

/** The standing invitation. */
export const INVITATION = {
  body: "If anyone with a stake here wants a specific, dated prediction scored against this method, send it before September 11 and it goes up alongside the rest.",
  contact: "/contact",
} as const;
