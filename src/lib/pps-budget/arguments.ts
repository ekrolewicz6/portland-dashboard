/**
 * The adjudicated arguments rendered on the page, from document.md section 11.
 * Same shape as the venue dive's Debate model. The equity staffing formula is
 * deliberately NOT here: live federal litigation gets a case-file card, not a
 * two-sided debate (see CASE_FILE below).
 */

export interface DebatePoint {
  claim: string;
  body: string;
}
export interface DebateSide {
  label: string;
  points: DebatePoint[];
}
export interface Debate {
  id: string;
  title: string;
  stakes: string;
  a: DebateSide;
  b: DebateSide;
  adjudication: { headline: string; body: string };
}

export const DEBATES: Debate[] = [
  {
    id: "broke-or-hiding",
    title: "Is PPS broke, or hiding money?",
    stakes:
      "Every budget fight in the city runs through this question, and both sides argue it from numbers the other cannot check.",
    a: {
      label: "The union's case",
      points: [
        {
          claim: "The district under-forecasts revenue and over-cries poverty.",
          body: "The teachers union's analysis holds that conservative assumptions manufacture crisis, that 149 central office positions were added from 2019 to 2024, and that reserves held headroom the district would not spend.",
        },
        {
          claim: "Central grew while classrooms shrank.",
          body: "The citizen committee's own reports documented administrator growth and instructional-coach expansion during years when classroom ratios worsened.",
        },
      ],
    },
    b: {
      label: "The district's case",
      points: [
        {
          claim: "The structural deficit is real and external.",
          body: "Enrollment down one student in eight, pension rates moving from about 4 percent toward 23 as side accounts expire, and almost $115 million of one-time federal money gone.",
        },
        {
          claim: "There is no hidden pot, and the reserve that existed was already used for this.",
          body: "Reserves sit at the 5 percent policy floor, roughly $41 million against an $862 million fund, and the pension stabilization reserve is already spent. The district built that cushion deliberately after 2019 and drew it down through the deficit years instead of cutting deeper sooner, which is the main reason Portland was not doing mass layoffs two years ago, and it is the money the union spent those years arguing should be spent faster.",
        },
      ],
    },
    adjudication: {
      headline: "The deficit is real, and the fat-years scrutiny never happened.",
      body: "The reserve arithmetic settles the hidden-pot claim: there is none, and the cushion that did exist was built on purpose and spent buying time. The central-growth claim is directionally supported but unverifiable without position-control records the district has never published, which is why releasing them is one of this project's drafted records requests. An argument that could be settled by one report has instead run for three years on faith.",
    },
  },
  {
    id: "closures-fix-deficit",
    title: "Will closing schools fix the deficit?",
    stakes:
      "Up to 20 schools are on the table, and both the case for and the case against are being oversold.",
    a: {
      label: "The district's case for consolidating",
      points: [
        {
          claim: "The real argument is what a school can offer, not what closing one saves.",
          body: "This is the district's own stated reason, and it is not primarily financial: some things a school offers only exist above a certain enrollment. A full-time counselor instead of two days a week. A librarian. Art, music, and a full elective schedule at middle school. Below a certain size a school cannot reach those thresholds at any budget, so students end up with meaningfully different opportunities depending on which building they were assigned to.",
        },
        {
          claim: "Small schools cost more per student, and that premium buys nothing extra.",
          body: "In this district's own numbers, the fifteen smallest elementaries run about 0.55 support-staff positions per 100 students against 0.39 at the fifteen largest, with essentially the same students-per-teacher ratio. Keeping a small building open is a per-student subsidy, and it is spent holding baseline staffing together rather than on anything a family would notice.",
        },
      ],
    },
    b: {
      label: "The case against closing",
      points: [
        {
          claim: "The savings are overstated and the harm lands unevenly.",
          body: "Teachers move with students; only administration, custodial, and utilities are truly avoidable, roughly $1-2 million net per elementary. Closures have historically landed on Black and brown North and Northeast Portland, and displacement drives families out of the district entirely.",
        },
        {
          claim: "A small neighborhood school is worth something the program argument does not count.",
          body: "Walkability, a school that knows every child by name, and a building families organized their lives around. Ten of the sixteen emptiest schools are Title I, so a list drawn by enrollment alone would again fall hardest on lower-income neighborhoods.",
        },
      ],
    },
    adjudication: {
      headline: "Closures will not fix the budget, and the district is not mainly claiming they will. Judge them on program, not savings.",
      body: "Per-building savings are real and small against a gap of more than $65 million, so anyone selling consolidation as the answer to the deficit is overselling. But that is not the district's central argument, and treating it as the only one makes the case for closing look weaker than it is. The program argument stands on its own: below a certain enrollment a school cannot offer what a larger one can, whatever its budget. One honest complication, from the school-level data: small schools are not starved per student, they are more expensive per student, so the harm is not that those children get less adult attention now. It is that the premium holds baseline staffing together instead of buying program breadth anywhere. The tests that matter, then, are two, not one: publish the savings model before any vote, and publish what students at the receiving schools actually gain, in named programs and positions. A consolidation that cannot show the second is just a closure.",
    },
  },
  {
    id: "strike-broke-budget",
    title: "Did the strike break the budget?",
    stakes:
      "The most politically charged causal claim in Portland, deployed by both sides without the one document that would settle it.",
    a: {
      label: "The settlement did it",
      points: [
        {
          claim: "The costs landed exactly when everything else broke.",
          body: "A press-reported settlement cost near $175 million over three years, roughly $58 million a year against a General Fund then around $830 million, arriving alongside the ESSER expiration and the pension cliff. The district said at settlement it would force deep cuts, and the cuts followed.",
        },
      ],
    },
    b: {
      label: "The deficit predates it",
      points: [
        {
          claim: "The shortfall was visible before anyone walked.",
          body: "The citizen committee warned that one-time money was 'hiding the looming shortfall' six months before the strike. Enrollment revenue loss and pension escalation are each in the same order of magnitude as the settlement.",
        },
      ],
    },
    adjudication: {
      headline: "One of three roughly comparable pressures, stacked on a base that one-time money had been concealing.",
      body: "The record supports both halves and refutes both extremes. Credit where it is due on a point the district took heavy criticism for at the time: its public top-line during the strike, that a settlement on those terms would force deep cuts, is what happened, on roughly the scale it described. The precise decomposition still requires the settlement cost model the district has never published, and the committee that asked for cost information during the negotiation wrote, in its official report, that it did not receive enough to advise. Those are separate failures from the arithmetic, which held up. Publishing that model is a drafted records request.",
    },
  },
  {
    id: "hides-state-money",
    title: "Does PPS hide its state money?",
    stakes: "A recurring public claim that regenerates every budget season.",
    a: {
      label: "The claim",
      points: [
        {
          claim: "State dollars vanish somewhere between Salem and the classroom.",
          body: "The version that circulates: the district books state funding where nobody can find it, making the pleaded poverty a presentation trick.",
        },
      ],
    },
    b: {
      label: "The books",
      points: [
        {
          claim: "It is on the page, labeled.",
          body: "State formula revenue appears as intergovernmental revenue in the General Fund, in every budget book, and local fact-checkers have said so.",
        },
      ],
    },
    adjudication: {
      headline: "False, and the district keeps manufacturing the conditions for it.",
      body: "The claim fails against the books. The kernel worth conceding: an institution that publishes no readable budget summary, the exact artifact the state requested in 2019, leaves a vacuum, and vacuums this simple always get filled. Every year without the one-page budget regenerates the conspiracy that the one-page budget would kill.",
    },
  },
];

/** Live litigation: rendered as a case file, no merits verdict. */
export const CASE_FILE = {
  title: "The equity staffing formula and the federal lawsuit",
  status: "This lawsuit is ongoing. We take no position on who should win. Court details here are current as of August 2026.",
  mechanics:
    "Since at least FY2016-17 PPS has set aside a share of school staffing, once 8 percent, halved to 4 percent for K-8 in 2024-25, for schools serving concentrated poverty and historically underserved students, with race among the qualifying categories.",
  allegation:
    "In October 2025 the Center for Individual Rights sued in federal court, alleging the formula is racially discriminatory (as reported in the press; we have not yet reviewed the court filing itself).",
  fairGame:
    "The empirical question that is fair regardless of the outcome: whether a decade of equity allocation measurably closed the gaps it targeted. The district's own citizen committee asked for that return-on-investment analysis in 2023 and 2024. It has never been produced, and the allocation was halved without it.",
  bottomLine:
    "A district that will not measure its values spending leaves it undefended in both directions: against those who would end it, and against those who halved it without evidence either.",
} as const;
