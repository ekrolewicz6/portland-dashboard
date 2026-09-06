# Portland Civic Lab — Known Data Issues & Discrepancies

## Critical: Data Accuracy Rules
1. NEVER show modeled/seeded data as real. Use "Data Needed" callouts instead.
2. Every chart must cite its source and show "Real Data" or "Estimated" badge.
3. Portland Civic Lab's credibility depends on data accuracy.

## Data-integrity rules now enforced in code

These four were each broken in production and fixed. They are written into
`src/app/api/cron/verify-promises/route.ts` and repeated here so they are not
re-broken. CONTRIBUTING.md carries the same list.

1. **Verdicts are derived, never written.** Anything published as
   machine-verified — a `verification_status`, a pass/fail label — must be
   computed from the values the job just queried. If the data cannot support a
   verdict, write `in_progress` and say why in the notes.
2. **Comparison windows are computed at run time, anchored to the freshest
   row, not to the clock.** A window frozen in source drifts out of date while
   `updated_at` keeps refreshing. Ingest lags by days, so comparing a partial
   recent window against a complete prior one manufactures a decline.
3. **Permit timeliness is measured by application cohort, never by grouping on
   issue date.** See "Permit Processing Times" below. Cohorts are closed a
   fixed interval before the freshest application in the table.
4. **A route with no data reports `dataStatus: "unavailable"`.** It never
   substitutes a remembered figure, and the cache layer refuses to store or
   serve an `unavailable`/`error` payload.

## ArcGIS BDS_Permit FeatureServer
- **ISSUED dates have garbage values**: Many permits have epochs pointing to year 2109+. Filter with `epoch < 2027 epoch`.
- **Only 2023+ data available**: Historical permits (pre-2023) are not exposed through the bulk API. Use the Portland Maps detail API scraper for individual older permits.
- **INTAKECOMPLETEDATE barely populated**: Only 2 records since 2025 — unreliable for recent application dates.
- **OBJECTID ≠ chronological order**: Don't use OBJECTID ranges to infer dates.

## Crime Data
- **Grid layers count CELLS, not crimes**: SUM the crime count attributes. Don't COUNT grid polygons.
- **Current snapshot only**: No historical monthly trends from ArcGIS. Need PPB CSV downloads from Tableau Public.

## Permit Processing Times
- **Survivorship bias**: Grouping by ISSUED date is misleading. Group by APPLICATION date (cohort view) instead.
- **Inspection phase is the bottleneck**: Electrical inspections delay 27% of permits (72 avg days). Not the review phase.

## Tax Comparison
- **Rates, not dollars**: The stacked bar chart must show rate percentages (5.9% federal + 3.6% state + 2.5% local), NOT dollar amounts ($48K + $17K + $9K) — dollars make all cities look the same since federal dominates.
- **SF has no local income tax**: High rate is from CA state tax. Portland has the highest LOCAL tax burden.

## Oregon SOS Business Data
- 362K "active" includes ALL entity types (LLCs, corps, nonprofits, foreign entities, assumed names).
- Registration date ≠ business founding date.

## CivicApps API
- **Permanently offline**. Use Oregon SOS Socrata API as replacement.

## Chart Rendering
- Recharts vertical BarChart: Y-axis labels don't render. Use HTML horizontal bars.
- Recharts uses absolute pixel font sizes (not rem). Currently set to 14-16px.
- Tailwind CSS v4: Custom classes must be in `@layer components {}`. Browser cache aggressively caches CSS.
