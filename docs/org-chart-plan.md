# Portland City Org Chart — Build Plan & Data Sources

**Status:** v1–v3 shipped. `/org-chart` is a full-width navigable tree showing
the reporting chain, authorized FTE, and budgeted salary cost per unit (citywide
$777M / 7,284 FTE). Every bureau links to a **dedicated page** `/org-chart/[id]`
with: reporting chain, key stats (FTE, total salary cost, cost/FTE, operating
budget), a program/department budget breakdown, the full job-classification
staffing+pay table, and a pay distribution. Data layers:
`src/data/org-personnel.ts` (FTE + budgeted cost + pay band + union per job
class, joined Budget FTE Summary × Compensation Plan; 28/31 bureaus reconcile to
Table 8) and `src/data/org-analysis.ts` (per-bureau operating total + program
budget split, extracted from the budget Bureau Programs charts; pct recomputed
against the operating total). Generators in `ingest/`.
**As-of date of the structure:** 2026-06-14.
**Owner:** Portland Civic Lab.

This document is the sourced reference behind the org chart: what it is, where
every fact comes from, the data model, the honesty rules, and the phased plan
for attaching budget, headcount, and individual salaries.

---

## 1. What this is

A complete, source-verified map of City of Portland government under the 2022
charter reform: the Mayor, the 12-member Council, the independently elected
Auditor, the City Administrator, the CFO, and every bureau/office across the
four operating service areas. It is an interactive, explorable tree — search,
filter, drill into any node, and read who runs it, how it's funded, where it
sits, and the official source.

The goal is a structural backbone the city has never published in
machine-readable form, onto which we can later attach money and people:
budget, authorized headcount, and individual salaries.

## 2. Why this is harder than it looks — the 2025 reorganization

Portland blew up its government structure twice in 18 months, so any naïve
"copy the old org chart" approach is wrong:

- **Jan 1, 2025** — charter reform took full effect: executive Mayor (Keith
  Wilson), a professional City Administrator running operations, and a
  12-member Council from 4 geographic districts (ranked-choice). The five-member
  commissioner council was abolished.
- **Mar 31, 2025** — the operating structure consolidated from six/seven
  service areas down to **four**: City Operations, Community & Economic
  Development, Public Safety, Public Works. "Vibrant Communities" was dissolved
  and its bureaus redistributed (e.g. Parks → Public Works; Arts → CED).
- **FY2026-27 "Core Realignment"** — the CFO Office moved *into* the City
  Administrator service area; the City Budget Office, Grants, FPDR, and Special
  Appropriations moved *to* City Operations.
- **Leadership churn** — City Administrator is now **Raymond C. Lee III** (the
  budget PDFs still name "Michael Jordan, interim"); the Public Safety DCA seat
  is **vacant** (May 2026).

Consequence: pre-2025 salary/budget data uses the old commissioner-era bureaus,
and even 2024 vs 2025 service-area totals are not comparable. The data model
therefore tags every node with its service area and records 2025-reorg moves, so
a future time series can be built honestly (compare at the bureau level, never
trend a service area across the reorg boundary).

## 3. Data sources (all cited)

### (a) Org structure — used to build v1
- **Live org chart & leadership:** https://www.portland.gov/hello/org ·
  https://www.portland.gov/hello/city-leadership ·
  https://www.portland.gov/service-areas (PNG chart is "Summer 2025").
- **2025 reorg announcement:**
  https://www.portland.gov/hello/news/2025/3/31/portland-advances-centralized-organizational-structure-enhance-efficiency-and
- **Bureau → service-area mapping (authoritative):** the FY2025-26 / FY2026-27
  Adopted Budget Volume 1 table of contents and service-area summary docs at
  https://www.portland.gov/budget. Each bureau node links to its own
  portland.gov page (see `src/data/org-structure.ts`).
- **Council & Auditor:** https://www.portland.gov/council ·
  https://www.portland.gov/auditor/about

### (b) Budget + personnel cost + authorized FTE — for v2
- **FY2025-26 Adopted Budget, Volume 1** (the core source), PDF:
  https://www.portland.gov/budget/documents/fy-2025-26-city-portland-adopted-budget-vol-1-city-summaries-and-bureau-budgets/download
  — per bureau it has a "Summary of Bureau Budget" (Personnel Services $ line +
  object categories) and an "FTE Summary" (authorized positions by
  classification). Citywide rollups: **Table 8** (FTE by bureau, ~7,284 total)
  and **Table 9** (General Fund by bureau).
- **Format reality:** PDF-only. No CSV/Socrata pairs personnel $ with FTE.
  Extraction path: download + `pdftotext -layout`, parse Table 8/Table 9 +
  bureau summaries. The Tableau dashboards
  (https://public.tableau.com/app/profile/portland.city.budget.office) export
  dollar crosstabs by service area/bureau but carry **no FTE**.
- **Independent cross-check:** TSCC budget review (object-category + FTE totals)
  for a parse guardrail.

### (c) Individual salaries — for v3 (PRR in flight)
- **City's own data is aggregate only:** a view-only Power BI "City Employee
  Wage Report" at https://www.portland.gov/bhr/open-data-analytics.
- **Named roster = records request** via the GovQA portal
  (https://portlandor.govqa.us/WEBAPP/_rs/supporthome.aspx). Under Oregon law
  (ORS 192), public-employee name, classification, and pay are disclosable.
  Letter drafted: `docs/prr-drafts/city-employee-salary-roster.md`.
- **Class-level ranges (downloadable now):** Compensation Plans, FY2012-13 →
  FY2025-26, at https://www.portland.gov/bhr/class-comp/comp-plans (salary
  min/max/steps by classification + bargaining unit) — a good v2 placeholder
  before the named roster lands.
- **Elected-official pay (exact, authoritative):**
  https://www.portland.gov/transition/salarycommission/salaries — Mayor
  $175,463, Auditor $168,758, each of 12 Councilmembers $133,207 (eff. Jan 2025).

## 4. What was built (v1)

| File | Role |
|---|---|
| `src/data/org-structure.ts` | Canonical typed `OrgUnit` tree — the single source of truth. Every node carries leader, type, fund model, service area, 2025-reorg note, `unconfirmed` flag, and a source URL. |
| `src/lib/org/queries.ts` | Pure helpers: `flattenTree`, `searchUnits`, `unitPath`, `orgStats`, `reorgMoves`. |
| `src/app/api/org/route.ts` | Public read-only JSON API: `/api/org`, `?format=flat`, `?view=reorg`. |
| `src/components/org/OrgChartExplorer.tsx` | Interactive client: collapsible tree, color-coded by service area, search, fund-model filter, confirmed-only toggle, click-to-detail panel with breadcrumbs + sources. |
| `src/app/(public)/org-chart/page.tsx` | Public page + "how this was built" methodology section. |

Wired into the header nav, the sitemap, and the Playwright smoke suite (page
render, node-selection detail, API shape).

**Design decision — reference data, not a database table.** The structure is
hand-curated, version-controlled TS rather than DB rows because it changes only
a few times a year, every node needs a citable source reviewable in a PR, and it
must render with zero runtime dependencies (no DB round-trip, so it renders
even when the database is unavailable). A DB projection can be added later if SQL querying is
needed (see §6).

## 5. Methodology & honesty rules

- **Sourced node by node.** Every bureau/office links to an official page.
- **Unconfirmed ≠ guessed.** Leaders/placements not verifiable on an official
  page are tagged `unconfirmed` rather than invented (see §7).
- **Reorg moves are flagged**, not silently absorbed, so the chart tells the
  truth about what changed in 2025.
- **Budget-aggregation constructs excluded** from the operating chart (Fund &
  Debt Management; Special Appropriations); IPR omitted as superseded by OCPA.
- **When money attaches (v2+):** never divide total bureau budget by headcount —
  personnel is ~15% of the ~$8.6B all-funds budget; the rest is capital, debt,
  grants, and transfers, and enterprise bureaus (Water, BES) are capital-heavy.
  The honest per-employee figure is **Personnel Services ÷ authorized FTE**,
  computed per bureau, never ranked across funding models. State budgeted-vs-
  actual basis on every figure.

## 6. Data model (future DB projection, optional)

If/when the structure needs to be queried in SQL or joined to budget rows, mirror
the TS tree into Postgres (Drizzle), keeping the TS file as the seed source:

```
org.units(id, slug, name, abbr, type, branch, service_area, leader,
          fund_model, is_operational, unconfirmed, source_url)
org.unit_history(unit_slug, fiscal_year, structure_version, service_area_slug, note)
fiscal.budget_lines(unit_slug, fiscal_year, personnel_services, …object cats…,
          authorized_fte, total_requirements, source_url)      -- v2
hr.employee_pay(fiscal_year, name?, classification, unit_slug,
          regular_gross, overtime, other_earnings, prr_request_id)  -- v3
```

Reconcile `org.units.slug` with the existing `PERFORMANCE_SERVICE_AREAS` slugs
(`src/lib/performance/product-layers.ts`) and `environment.bureaus.abbreviation`
so the org chart, performance dashboard, and fiscal explorer share one key.

## 7. Verification status

Leadership was confirmed against official portland.gov pages in a June 2026 pass
(see `LEADER_CONFIRMATIONS` in `src/data/org-structure.ts`). The `unconfirmed`
tag is now reserved for genuine structural uncertainty and is currently empty;
26 bureau/office leaders are named with sources. Resolved: City Operations DCA =
Tracy Warren (Sara Morrissey left Oct 2025); Communications sits in the City
Operations DCA portfolio; the "Performance Office" and a standalone
"Sustainability" office do **not** exist as units (their functions live in CBO
and BPS) and were removed rather than shown as phantom boxes.

Genuinely open — marked `vacant` in the tree, not guessed:
- **Public Safety DCA** — vacant since May 18, 2026; City Administrator Lee
  overseeing during the national search.
- **OCPA director** — vacant / in active recruitment (June 2026).
- **Portland Street Response manager** — in active recruitment.

Lower-confidence (named, but worth watching): **Parks** (Sonia Schmanski is
interim; official Parks pages are silent) and **Archives** (name from a 2024
hire notice). Also verify the **FY2026-27 Adopted Budget** service-area
summaries once adopted (~June 2026) before treating any dollar figure as final.

## 8. Phasing

- **v1 — shipped.** Structural org chart, fully sourced, interactive, **with
  authorized FTE per unit** (budget Table 8) rolled up to the citywide 7,284 and
  shown as a headcount-by-service-area bar. Answers: who runs X, what's under
  each service area, what moved in the 2025 reorg, how each unit is funded, and
  how many positions it holds.
- **v2 — classification depth + comp plan — shipped.** Parsed the budget Vol 1
  per-bureau FTE Summary tables (job class → authorized FTE + budgeted $) and
  joined them by Class ID to the FY2025-26 Compensation Plan (salary band +
  bargaining unit). Surfaced as an expandable per-bureau staffing table and
  inline tree drill-down; exposed at `/api/org?view=personnel`. Parsers:
  `ingest/parse-org-personnel.py` (budget FTE Summary → JSON) +
  `ingest/build-org-personnel.py` (join comp plan → `org-personnel.ts`);
  regenerate when a new budget/comp plan drops. Still open: object-category $
  composition
  (capital/debt/transfers) per bureau for an honest personnel-cost-per-FTE, and
  the exact elected-official salaries.
- **v3 — individual salaries (PRR-gated, wiring in place).** The schema
  (`src/data/individual-salaries.ts`), the loader
  (`ingest/load-salary-roster.ts`, with bureau mapping + median-based name
  suppression), and the bureau-page rendering (guarded by
  `INDIVIDUAL_SALARIES_AVAILABLE`, currently inert) are all built. To activate:
  file the GovQA records request
  (`docs/prr-drafts/city-employee-salary-roster.md`); when the roster arrives,
  confirm the CSV columns in the loader and run
  `npx tsx ingest/load-salary-roster.ts <file.csv> FY2024-25`. That flips the
  flag and the named roster appears under each bureau.

Also shipped: a citywide **comparison table** (`/org-chart`, sortable by salary
cost / FTE / cost-per-FTE / operating budget / classes) and a **salary-cost-by-
service-area** bar alongside the headcount bar.
