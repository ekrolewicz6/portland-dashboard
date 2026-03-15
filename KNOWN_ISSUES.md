# Portland Commons Dashboard — Known Data Issues & Discrepancies

## Critical: Data Accuracy Rules
1. NEVER show modeled/seeded data as real. Use "Data Needed" callouts instead.
2. Every chart must cite its source and show "Real Data" or "Estimated" badge.
3. The Portland Commons' credibility depends on data accuracy.

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
