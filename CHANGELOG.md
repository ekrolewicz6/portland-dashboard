# Changelog

All notable changes to the Portland Civic Lab Dashboard are documented here.

---

## [2026-06-15] — Homelessness deep-dive

Third Policy Deep-Dive (`/deep-dives/homelessness`): a by-the-numbers,
honest-broker explainer on why Portland's homelessness keeps growing despite
record spending. Built on the founder's existing "homelessness operating
system" research (`~/Code/Active/portland/homeless` + `housing-research/
KEY-IDEAS.md`), whose data spine was already sourced — so the build mostly
ported verified models and ran a focused citation pass for the national/gap
claims.

**Interactive pieces** (`src/lib/homeless/engine.ts`, ported from the founder's
cockpit): a **flow simulator** (stocks-and-flows on the by-name list — close the
~412/month inflow-minus-outflow gap and growth stops before housing anyone new;
sliders for eviction prevention, discharge ban, treatment beds + staffing,
master-leased units); a **cost-of-inaction calculator** ($40k/yr on the street
vs ~$20k housed, with the honest "savings are mostly federal" caveat); a
**triage tool** (the three populations and their matched fixes/costs); and a
**bed-visibility ladder** (licensed → funded → staffed → occupied → open-tonight,
where Oregon only tracks the top two).

**Citation pass corrections** (applied): the $50k street cost is upper-typical,
not a median (central ~$35k–$50k; NAEH $35,578, Economic Roundtable LA −79%,
Utah −91%); PSH ≈ $20,115 and RRH ≈ $8,486/household/yr (NAEH 2025); the SHS tax
has raised ~$1.3B since 2021 with a balance that peaked near $431M unspent (not
$500M+); the treatment-bed gap is ~3,714 (OHA/PCG June 2024); the 90-day
pre-release Medicaid benefit is authorized but paused; HRSN housing doesn't cover
move-in costs. Plus the full sourced data spine (by-name list, PIT, evictions,
Domicile Unknown deaths, OBCC).

Added to the `/deep-dives` index and the homepage band (now three cards).
Verified end-to-end (desktop + mobile): all four interactives produce correct
numbers; typecheck and lint clean.

Follow-up: the "Nobody can see the beds" section now ends with a "We're building
the fix" CTA linking to the live Portland Bed Finder prototype
(portland-bed-finder.vercel.app) — turning the diagnosis into a pointer at the
tool being built to solve it.

---

## [2026-06-15] — Responsive layout for the deep-dives

The deep-dive pages were capped at `max-w-[1080px]` and looked cramped on large
monitors. Introduced a shared layout module (`src/components/deep-dives/shared.tsx`)
with a responsive container (1400 → 1760 at 3xl, matching the rest of the site)
and an editorial **two-column `Section`**: a heading rail on the left and a wide
body column for visuals/calculators on `xl+`, collapsing to a single column
below. Prose stays capped for line-length at any width. Both deep-dive pages
(FPDR, Mass Timber) and the `/deep-dives` index were refactored onto it, and the
heroes gained an "at a glance" aside that uses the width on large screens.
Verified across mobile (stacks, no overflow) and a 1920px monitor (rail 472px +
body 1051px, calculators filling the body column).

---

## [2026-06-15] — Mass Timber deep-dive

Second entry in the **Policy Deep-Dives** section: an interactive explainer on
**mass timber & housing in Oregon** (`/deep-dives/mass-timber`), built from a
founder-supplied briefing (a Google Doc synthesizing adversarially-verified
research and a custom utilization cost model).

**Approach:** the briefing carried certainty labels but no source URLs, and the
ask was for a credibly-cited public page. So a 10-agent citation workflow
re-sourced every load-bearing claim to a primary/credible URL and confirmed the
figures — which **corrected several** before publication: the circulating
"1,223 Portland permits / lowest since 2010" figure was refuted (OPB: ~1,400
total in 2025; "lowest since 2010" applies to multifamily only); the Framework
$6M was not from the 2016 bond; L&G's £279M is a cumulative life-of-business
loss; lumber is ~40% (not 50%+) of CLT cost; Hacienda isn't a formal coalition
member. All corrections are reflected in `src/lib/mass-timber/data.ts`.

**What was built:**
- **Engine** (`src/lib/mass-timber/engine.ts`): three models, all matching the
  briefing's numbers — a factory **utilization cost model** (cost/home = marginal
  + fixed/output; parity ≈265 homes/yr, viable ≈490, −10% at full capacity), a
  **housing-scale model** (5,000 units → ~$1.7B, ~$550M public, 5–8 yrs), and a
  **project-fit scorer** (light-frame wins low-rise; mass timber's edge is
  repetitive mid-rise in high-labor markets).
- **The page**: visuals-first sections — what mass timber is (CLT/glulam/MPP,
  panelized vs modular), an interactive **project-fit tool**, the honest
  myth-vs-reality economics, the interactive **factory-utilization calculator**
  (the "missing math"), a **build-at-scale calculator** with the funding stack,
  the Oregon assets timeline (success stories), the **graveyard** of factory
  failures (Framework, Katerra, Ilke, L&G, Urban Splash), the demand-aggregation
  fix, climate (both sides) and jobs, the verdict, and a fully-sourced methodology.
- **Components** in `src/components/deep-dives/mass-timber/`; added to the
  `/deep-dives` index and the homepage deep-dives band (now two cards).

Verified end-to-end (desktop + mobile): all three calculators produce
report-matching numbers; typecheck and lint clean.

---

## [2026-06-15] — Policy Deep-Dives + FPDR explainer

A new public section, **Policy Deep-Dives** (`/deep-dives`), for in-depth,
plain-language explainers of complex Portland policy issues — visuals-first,
written for a general audience, with interactive tools. Launched with its first
deep-dive: **FPDR**, the city's pay-as-you-go police & fire pension and its
property-tax burden (`/deep-dives/fpdr`).

**Why this exists:** the founder wanted to take a deeply-researched, heavily-
sourced topic (FPDR's $3.9B unfunded liability, the pay-go funding mechanism,
the 2006 reform, the legal barriers, and the reform options) and make it
understandable to anyone with a ~10th-grade reading level — explaining how it
affects them personally and laying out the trade-offs of every possible fix.

### What was built

- **Research first.** A multi-agent workflow produced a verified dossier (figures
  cross-checked against the Milliman June 30 2024 valuation, Multnomah County tax
  certifications, City budget/charter docs), plus a focused pass on beneficiary
  demographics. All headline numbers were adversarially re-sourced.
- **Data + engine** (`src/lib/fpdr/`). `data.ts` holds every figure with an inline
  source; `engine.ts` has two models: a personal-cost calculator (off the verified
  FY2025-26 rate) and an illustrative reform simulator. The simulator is a sound
  funding model — it funds post-transition benefits to a target then draws the
  trust to ~zero — tuned so lifetime savings land on the cited ~¼ (steady) and ~⅓
  (front-loaded) at a 7% return, and correctly collapse to 0% at a 0% return
  (the only real saving from pre-funding is investment returns).
- **The page** (`src/app/(public)/deep-dives/fpdr/`). Visuals-first sections:
  pay-go vs pre-funded explainer, "where the money goes" breakdown, an interactive
  **personal-cost calculator** (home-value slider → your annual FPDR tax), a levy
  growth chart, a **"who gets it"** section (2,014 retirees/survivors, ~$78k avg
  pension, the 95+ surviving spouses, the 27-pay-period spiking) with a police/fire
  toggle, four reasons it's politically stuck, an interactive **reform simulator**
  (strategy + return sliders → "worse before better" curve with break-even
  shading and household-scaled savings), a full reform-options menu with trade-offs,
  and a sourced methodology section.
- **Components** in `src/components/deep-dives/fpdr/`; new "Deep-Dives" header nav
  link and a `/deep-dives` section index.

Verified end-to-end in the browser (desktop + mobile): calculator, simulator
(both strategies, return + home-value sliders), and the who-benefits toggle all
produce correct numbers; typecheck and lint clean.

---

## [2026-06-14] — Portland City Org Chart System

A new feature area: an interactive, fully-sourced map of City of Portland
government — structure, headcount, salary cost, department budgets, and the
full job-classification breakdown — plus dedicated per-bureau analysis pages.
Built iteratively over a single session; each step below was driven by a
specific request or a gap surfaced by the previous step. Read top-to-bottom for
the order it actually happened.

**Why this exists:** the founder wanted to understand budget-per-employee by
department using public salary data. Research showed (a) the data exists but is
PDF-trapped (budget) and PRR-gated (individual names), and (b) Portland
*rebuilt its government* on Jan 1 2025 (charter reform) — so "department" had to
be modeled against the new four-service-area structure, not the old bureaus.

### Build order & rationale

1. **Structure, API, plan** (`faf9e88`). Fanned out parallel research on
   Portland salary/budget/org-structure sources, then built the canonical org
   tree in `src/data/org-structure.ts` (4 service areas under City Administrator
   Raymond C. Lee III, every bureau/office, electeds), a read-only JSON API
   (`/api/org`), the interactive page `/org-chart`, and the sourced build plan
   `docs/org-chart-plan.md`. Adversarial verification caught that the current
   structure is **four** service areas (consolidated Mar 2025), not the six the
   older budget docs still show. *Why:* needed a correct, citable backbone
   before attaching any numbers.

2. **Authorized headcount** (`ed51198`). Parsed the FY2025-26 budget **Table 8**
   for authorized FTE per bureau; attached + rolled up to the citywide
   **7,284**, with a headcount-by-service-area bar. *Why:* the structural chart
   "looked incomplete" — it showed boxes but not the ~7,000-person scale.
   Operating-unit FTE sums to 7,281.31; the 3.00 gap is Special Appropriations
   (a budget construct, excluded) — reconciles exactly to Table 8.

3. **Confirm leaders** (`543b5c2`). A six-group research pass confirmed **26
   bureau leaders** against official portland.gov pages and stripped the
   "Unconfirmed" tags; genuinely empty seats (Public Safety DCA, OCPA director,
   PSR manager) marked **Vacant**; two phantom offices (Performance Office,
   standalone Sustainability) removed as non-existent. *Why:* too many
   Unconfirmed tags; integrity rule is "confirm or flag, never guess."

4. **Deepest layer — classifications × comp plan** (`be9867d`). Parsed the
   budget **FTE Summary** tables (every job class with authorized FTE +
   budgeted $) and joined by **Class ID** to the City's FY2025-26 Compensation
   Plan (salary band + bargaining unit) → `src/data/org-personnel.ts`. ~1,170
   classifications across 31 bureaus; **28/31 reconcile exactly** to Table 8.
   Surfaced as an expandable per-bureau staffing table. *Why:* founder asked to
   go "as deep as you can go" and to wire in the comp plan they provided. This
   is the floor of public data — below it is individual employees (PRR).

5. **Redesign + per-bureau pages** (`c251a24`). Replaced the cramped tree +
   side-panel with a **full-width** tree where bureau names link to dedicated
   **`/org-chart/[bureau]`** pages (31, statically generated): reporting-chain
   breadcrumb, key stats (FTE, salary cost, cost/FTE, operating budget),
   "Where the money goes" department/program budget bars, the full
   classification staffing+pay table, and a pay-distribution chart. The
   department breakdown was extracted from the budget's messy "Bureau Programs"
   pie-chart text by a **31-agent workflow**, with pct recomputed against each
   bureau's operating total → `src/data/org-analysis.ts`. *Why:* the view was
   "too constrained / half the page"; founder wanted per-bureau deep analysis
   and salary cost by department.

6. **Comparison, service-area cost, individual-pay wiring** (`e0122b9`). A
   sortable **"Compare every bureau"** table (salary cost / FTE / cost-per-FTE /
   operating budget / classes), a **salary-cost-by-service-area** bar, and the
   PRR-gated individual-salary layer: schema (`src/data/individual-salaries.ts`),
   loader (`ingest/load-salary-roster.ts`, with bureau mapping + median-based
   name suppression), and a guarded bureau-page section — inert until the roster
   is filed. *Why:* founder said "do all of it" to the offered next steps.

7. **Operating-budget column** (`9678f22`). Added total all-funds operating
   budget next to salary + FTE on every tree node, with the caveat that it
   double-counts internal transfers and is dominated by capital/debt/
   pass-throughs (so it runs far larger than salary). *Why:* founder wanted to
   see total budget alongside salary and headcount.

8. **Inline notes for folded-in nodes** (`ba8c86d`). Leaf nodes with no data of
   their own now show their note inline — fixing the confusing blank
   **Portland Solutions** node (its ~$82M of homelessness programs are folded
   into the Office of the City Administrator line) and surfacing the three
   councilors under each district. *Why:* founder asked why Portland Solutions
   was blank; the answer revealed that the "City Administrator's office" is
   ~86% homeless services.

### Data & reproducibility
- Generators live in `ingest/`: `parse-org-personnel.py` (budget FTE Summary →
  JSON), `build-org-personnel.py` (join comp plan → `org-personnel.ts`),
  `build-org-finance.py` (departments → `org-analysis.ts`),
  `load-salary-roster.ts` (PRR roster → `individual-salaries.ts`).
- Re-run them when a new budget or comp plan drops; the structure file is
  hand-curated reference data with a citation per node.
- PRR draft for the named-salary roster: `docs/prr-drafts/city-employee-salary-roster.md`.

### Data analysis delivered (reference, not code)
Verified against the source budget; framed as *signals*, not verdicts —
budget structure can't prove mismanagement.
- **Big budgets ≠ bloat.** Only ~$777M of the ~$8B all-funds total is base
  salary; the rest is capital, debt, and pass-throughs (Water $2.2B, BES $1.4B,
  BPS's $685M PCEF, BHR's $184M benefits pool, FPDR's $310M pensions run by 21
  staff).
- **Central administration is the fastest-growing, priciest-per-head part** —
  the City Administrator's own office tripled (14→47 FTE); exec/DCA offices top
  cost/FTE. Front-line bureaus (Parks $91k, 911 $95k, Police $109k) are cheapest
  per position.
- **911/BOEC flat at ~170 FTE for three years** against known answer-time
  problems — clearest understaffing signal. Parks cut 41 positions.
- Creative finds: the appointed City Administrator's band ($393k) **doubles the
  elected Mayor** ($175k); **30% of the workforce is non-union**
  ("Non-Represented"); utilities employ more people than Fire; **$252M sits in
  programs labeled "Other."**

---

## [2026-06-11] — Membership, Participation & Civic Infrastructure

Turned the site from a publication into the start of a member-run civic
organization, with the security and CI foundations to support it. (Preceded the
org-chart work above; consolidated here as it predates this changelog's gap.)

### Membership & auth
- Integrated **WorkOS AuthKit** for member sign-in/sign-up (route handlers for
  `/login` + `/signup`, middleware-gated `/member`, `unauthenticatedPaths` for
  optional-session APIs — working around AuthKit's PKCE-cookie-during-render
  restriction). Removed next-auth entirely. `ADMIN_EMAILS` grants the admin role
  on sign-in; member mirror in `src/lib/membership.ts`.

### Participation features
- **Flag-a-number** — report suspect data on any dashboard (`/api/data-flags`,
  Zod + honeypot + rate limit) with an **admin review queue** (`/admin/flags`).
- **Proposals + member voting** (`/proposals`) — propose and upvote dashboard
  topics; member-only POST.
- **Public records tracker** (`/records`) — an Oregon PRR how-to guide plus a
  live tracker of requests the Lab is filing; two ready-to-send PRR letters
  drafted (`docs/prr-drafts/`).
- New public pages: `/volunteer`, `/open-data`, `/privacy`, `/terms`.

### Security hardening
- Removed hardcoded credentials and weak secret fallbacks; fail-secure cron auth
  (`src/lib/cron-auth.ts`); shared rate limiter (`src/lib/rate-limit.ts`) on
  concierge, contact, data-flags, proposals; stopped leaking error messages;
  moved a runtime `CREATE TABLE` into a proper migration.

### Platform
- **GitHub Actions CI**: typecheck → lint → build → Playwright smoke tests.
- **Parks Atlas** featured as a project on the homepage.
- Introspected 177-table DB schema snapshot (`src/db/introspected/`) for typed
  access to ingest-owned tables.
- Homepage/public copy rewritten for users (not builder-spec); CTAs pointed at
  the participation features.
- Full audit + roadmap captured in `docs/AUDIT_AND_ROADMAP.md`.

### Still user-gated
- WorkOS dashboard redirect URI (`/auth/callback`) and optional Sentry DSN.
- Filing the two drafted PRR letters.

---

## [2026-04-19] — Aggressive Data Sourcing & Automation

### New Data (197K+ rows from public sources)
- **ODOT Crash Records**: 59,365 individual crashes (2017-2022, Multnomah County) from ODOT ArcGIS — fatalities INCREASED 58→88 while total crashes dropped
- **ODE Chronic Absenteeism**: 33,251 rows (10 years, 6 districts, 36 demographic groups) — PPS doubled from 17% to 37% post-COVID
- **TriMet Monthly Ridership**: 834 rows (Jan 2002 - Feb 2026) from NTD Socrata — 68.3M boardings in FY2025, 74% of pre-pandemic
- **Census Demographics**: 99 rows (2015-2023) — population, income, poverty, race, age, housing tenure
- **Street Tree Inventory**: 253K trees aggregated to 96 neighborhoods from Portland ArcGIS
- **GHG Emissions**: 78 rows (1990-2023 by sector) — 29% reduction from 1990 baseline
- **Budget Program Offers**: 538 rows (6 service areas, bureau-level detail) from CBO Excel files
- **BOEC 911 Performance**: 13 months of call answering rates (64%→79%), wait times, staffing
- **Downtown Foot Traffic**: 14 rows from Clean & Safe / Placer.ai — recovering to 82% of 2019
- **Office Vacancy**: 11 quarters — peaked at 34.7% (Q4 2024)

### Automated Pipeline
- **Unified periodic refresh cron** (`/api/cron/refresh-data`): single monthly job handles BLS QCEW, TriMet ridership, Zillow rent (monthly), Census demographics (quarterly), ODOT crashes + tree inventory (annual)
- Complete pipeline now: 8 daily/hourly crons + 1 monthly unified cron covering all automatable sources
- Manual sources documented with exact `npx tsx` commands for annual updates

### Source Attribution Links
- Added clickable source links below every chart/table across all 8 detail components (42 total attributions)
- Links go directly to the source data portal (ODE, Census, BLS, ArcGIS, NTD, etc.)

### Pre-Push Verification Hook
- `ingest/verify-api-queries.ts` runs the dashboard API queries against the database
- Catches column mismatches, missing tables, and broken SQL before they reach prod
- Wired as a Claude Code PreToolUse hook on `Bash(git push *)`

  **Correction (September 2026):** this never ran "before every `git push`".
  The committed `.claude/settings.json` hook pointed at one developer's
  absolute path, reached the script only through a gitignored symlink, and its
  matcher did not filter correctly, so on any other machine it fired on
  ordinary commands and blocked them. It has been deleted. The check now lives
  in `.githooks/pre-push`, which each contributor opts into with
  `git config core.hooksPath .githooks`, and which skips cleanly when no
  `DATABASE_URL` is available.

### Data Pipeline Memory
- New memory file `feedback_data_pipelines.md`: rule that every data source MUST be saved as repeatable script + automated refresh
- New memory file `reference_verified_data_sources.md`: complete URL registry for every data source with auth, frequency, script, and DB table
- Updated `feedback_data_integrity.md` with "always exhaust public data sources" rule

---

## [2026-04-18] — Major Data Integration & Promise Tracker

### Promise Tracker (Accountability)
- **New feature**: Portland's Promise Tracker — tracks 27 specific claims from Mayor Wilson's April 2026 State of the City speech against live data
- Auto-verification engine runs daily, cross-referencing claims against PPB crime data, BDS permits, IRP campsite reports, and CBO budget documents
- Verification statuses: 4 Verified, 8 Partially Verified, 7 In Progress, 7 No Data, 1 Discrepancy
- Key finding: Wilson's "$160M deficit" claim is **correct** (CBO CSL report shows $169.3M); our earlier $67.8M figure was the CAL number which CBO itself said was incomplete
- Key finding: "Speeded permitting" claim **contradicted** — avg processing time increased from 12 to 16 days
- Downtown crime claims verified against PPB NIBRS: burglary down 44% (Wilson said 17%), MVT down 47% (Wilson said 29%), shoplifting down 13% (Wilson said 30%)

### New Data Pipelines (all repeatable, cron-enabled)
- **PPB Crime Sync** (`sync-crime.ts` + `/api/cron/sync-crime`): Fetches NIBRS offense CSV from PPB's Tableau Public endpoint — 622K records through March 2026, daily at 5:30 AM
- **IRP Campsite Sync** (`sync-irp-campsites.ts` + `/api/cron/sync-campsites`): Fetches campsite reports from ArcGIS — 149K records, daily at 5:45 AM
- **AirNow AQI Sync** (`/api/cron/sync-aqi`): Fetches O3 and PM2.5 current + forecast from AirNow API — every 3 hours
- **Promise Verification** (`update-promise-statuses.ts` + `/api/cron/verify-promises`): Re-verifies all Wilson claims against fresh data — daily at 6:15 AM

### Education Dashboard — Now Live
- Fetched and seeded Oregon Dept of Education data for all 6 Portland-area districts (PPS, Parkrose, David Douglas, Riverdale, Reynolds, Centennial)
- 630 enrollment rows (5 years), 18 graduation rate rows, 479 test score rows (ELA + Math from ODE XLSX files)
- Rebuilt detail page: enrollment trends, district comparison table, graduation rate charts, ELA vs Math proficiency bars, PPS enrollment decline visualization (45K → 42.6K)

### Quality of Life Dashboard — Now Live
- **Parks**: 318 parks (11,402 acres) from ArcGIS, with park type classification and 972 playground amenities
- **Pavement**: 23,199 street segments with PCI scores — avg PCI 40 (45% rated Poor)
- **Library**: 16 years of Multnomah County Library stats from Oregon State Library Socrata (visits, circulation, programs, branches)
- Rebuilt detail page: parks by type, PCI distribution, worst streets, library trends, program attendance

### Transportation Dashboard — Rebuilt
- **TriMet Ridership**: 20 years (FY2006-FY2025) — 68.3M boardings in FY2025, 74.4% of pre-pandemic peak
- **Vision Zero**: 11 years of crash/fatality data — 69 fatalities in 2023 (peak), 42 in 2024
- **Commute Mode**: 8 years from Census ACS — WFH surged 9.1% → 25.7%, transit fell 13.4% → 6.2%
- Expanded detail component from 328 to 530 lines with ridership trend, fatality breakdown, commute mode charts

### Economy Dashboard — Expanded
- **BLS QCEW**: 26 quarters of Portland MSA employment/wage data (2019-2025) — 97,685 establishments, 1.06M jobs, $1,482/wk avg wage
- **Census Business Formation**: 7 years of CBP data (2016-2022) — Portland #1 among 50 largest metros for new manufacturing firm formation (2.47 per 10K pop)
- New sections: MSA employment trend, business formation ranking callout, annual establishment table

### Safety Dashboard — Enhanced
- Removed hard-coded `occur_date < '2026-02-01'` ceiling — safety data now uses `CURRENT_DATE` dynamically
- **Downtown Safety Scorecard**: Live YoY comparison table for 9 crime categories (burglary, shoplifting, MVT, assault, robbery, drugs, homicide, larceny, vandalism) filtered to Downtown + Old Town/Chinatown + Pearl
- Crime data synced to 622K records through March 2026

### Housing Dashboard — Rent Data Added
- Downloaded and seeded Zillow ZORI rent data: 135 months (Jan 2015 – Mar 2026), $1,103 to $1,780
- Housing API now shows real median rent trend (replaced "Median rent data unavailable" placeholder)

### Fiscal Dashboard — Budget Context
- Added CBO Current Service Level (CSL) deficit context: $169.3M gap (vs $67.8M CAL figure)
- Documented that Wilson's "$160M" is the CSL figure rounded down, not an error

### Homelessness Dashboard — Campsite Data
- Loaded 149K IRP campsite reports (Jan 2025 – Apr 2026) with lat/lon coordinates
- Downtown campsite reports show ~35% decline from peak (Wilson claimed 75%; data starts Jan 2025, his baseline may be earlier)
- PSU statewide homelessness sections already live from prior session

### Platform Features
- **CSV Export**: New `/api/dashboard/[question]/export` route — all 11 categories downloadable as CSV, export button unhidden on detail pages
- **Embed Routes**: New `/embed/[question]` — minimal iframe-embeddable cards with headline value, trend pill, source attribution
- **Source Attribution Audit**: 18 files fixed across all API routes — consistent "Agency · Dataset" middot format everywhere
- **AirNow Forecast**: Environment detail page now shows tomorrow's O3/PM2.5 forecast with "ACTION DAY" badges

### Data Source Registry Update
- Before: 4 LIVE, 1 STATIC, 5 DATA_NEEDED
- After: **4 LIVE** (Safety, Education, Quality, Climate) + **5 LIVE_PARTIAL** (Housing, Transportation, Homelessness, Accountability, Economy) + **1 STATIC** (Fiscal)
- **Zero categories now show "Data needed"** — every section has real data

### Performance & Mobile
- Added caching (getCachedData/setCachedData) to 8 API routes that were missing it
- Fixed 3 mobile overflow issues (downtown scorecard table, promise tracker metric comparison and progress labels)
- No Promise.all violations or N+1 query patterns found

### Daily Cron Pipeline
```
5:00 AM  sync-permits       — BDS ArcGIS permits
5:30 AM  sync-crime         — PPB Tableau CSV offenses
5:45 AM  sync-campsites     — IRP ArcGIS campsite reports
6:00 AM  refresh-matviews   — Housing materialized views
6:15 AM  verify-promises    — Re-verify Wilson's 27 claims
Every 3h sync-aqi           — AirNow O3 + PM2.5
8:00 AM  fetch-auditor-news — Weekly (Mondays only)
```

---

## [2026-04-17] — Permit Pipeline & Data Quality

### Incremental Permit Sync
- New `sync-permits.ts` script and `/api/cron/sync-permits` cron route
- Replaced destructive `seed-real-data.ts` (which TRUNCATED all permits on every run)
- Incremental by OBJECTID + 180-day status refresh window
- Fetches ALL statuses (Application, Under Review, etc.) — old script only kept ISSUED permits
- UPSERT via ON CONFLICT DO UPDATE for status progressions
- Batched inserts with unnest (500/batch) — was one-at-a-time
- Result: 4,470 new permits + 20,592 status updates, data current through April 9

### Data Quality Fixes
- Rejected 130 permits with issued_date before application_date (ArcGIS garbage)
- Nulled 1 future-dated permit (Oct 2026) and 4 extreme outliers (>1000 days)
- Nulled 377 negative processing_days from old backfill timezone bug
- Added `processing_days >= 0` and `issued_date <= CURRENT_DATE` filters to all housing API queries
- Killed the -7,310 day spike on the processingDays chart (single garbage permit from 2004)

### Source Attributions Standardized
- All summary routes now use "Agency · Dataset" format with middot separators
- Housing, safety, economy, quality, accountability routes updated

### UI Fixes
- Null-safe trend pill rendering on detail pages (optional chaining for `data?.trend`)
- Removed perpetual "Coming Soon" geographic placeholder from all detail pages
- Footer text contrast bumped from white/25-40 to white/45-65 for WCAG compliance

---

## [2026-04-16] — PSU Statewide Homelessness Report

### New Data
- Seeded PSU HRAC 2025 Oregon Statewide Homelessness Estimates (6 new tables, 36 counties)
- Racial disparity multipliers: 6.92x AI/AN, 5.47x NHPI, 5.08x Black, 0.89x White
- Shelter bed inventory: Multnomah 4,008 beds vs 10,526 PIT = 38% coverage
- Student homelessness: 2,903 in Multnomah County, 21,122 statewide
- Doubled-up estimates: 3,477 in Multnomah, 21,542 statewide

### New Dashboard Sections
- "Portland in Context" — county comparison table with rates per 1,000
- "Racial Disparities in Homelessness" — disparity multiplier bar chart
- "The Shelter Gap" — bed count vs PIT count stat cards
- "Hidden Homelessness" — doubled-up and student homelessness data

### Other
- Removed adversarial language across the entire site
