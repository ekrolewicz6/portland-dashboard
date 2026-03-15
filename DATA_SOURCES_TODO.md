# Portland Commons Dashboard — Data Sources TODO

> Last updated: 2026-03-15 (Census, BLS, FRED data now LIVE)

This document tracks the status of every data source used in the Portland Commons
Dashboard. Each source is tagged with one of:

| Status | Meaning |
|--------|---------|
| **LIVE** | Connected to a live API; data refreshes automatically |
| **LIVE_PARTIAL** | Some metrics use live data, others fall back to mock |
| **MOCK** | All data is fabricated for demonstration purposes |
| **NEEDS_API_KEY** | Free API available; just needs registration and env var |
| **NEEDS_PRR** | Requires a public records request to a government bureau |
| **NEEDS_SUBSCRIPTION** | Requires a paid subscription or data partnership |
| **STATIC** | Computed from published rates; no live feed needed |
| **INTERNAL** | Will come from our own PCB registry once live |
| **OFFLINE** | API permanently down; need alternative |

---

## 1. Migration — "Are people moving to or away from Portland?"

### Water Bureau Activations — `NEEDS_PRR`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — all net-activation data is fabricated |
| **What we need** | Monthly counts of new residential water account activations and deactivations, by ZIP code, from Jan 2020 to present |
| **Who to contact** | Portland Water Bureau, Public Records Request |
| **Email** | PWBCustomerService@portlandoregon.gov |
| **Phone** | 503-823-7770 |
| **Address** | 1120 SW 5th Avenue, Suite 405, Portland, OR 97204 |
| **Estimated fulfillment** | 10-15 business days (simple query of billing system) |
| **Cost** | Free for first 30 minutes of staff time; may charge $35/hr beyond that |
| **Recurring** | Request quarterly updates or ask for an ongoing data-sharing agreement |

**Exact text of public records request:**

> Dear Portland Water Bureau Records Officer,
>
> Pursuant to Oregon's Public Records Law (ORS 192.311-192.478), I am requesting
> the following records:
>
> Monthly aggregate counts of:
> 1. New residential water service account activations
> 2. Residential water service account deactivations/final reads
>
> For the period January 1, 2020 through the most recent available month.
>
> Please provide the data broken down by:
> - Month (YYYY-MM)
> - Service ZIP code (5-digit)
> - Account type (single-family residential vs. multifamily residential)
>
> I am requesting aggregate counts only — no personally identifiable information,
> account numbers, or individual addresses are needed.
>
> I would prefer to receive this data in CSV or Excel format via email.
>
> If there are any fees, please advise me of the estimated cost before proceeding.
>
> Thank you,
> [Your Name]
> [Portland Commons Project]

---

### Census Population Estimates — `LIVE`

| Field | Value |
|-------|-------|
| **Current status** | LIVE — real Census data fetched and loaded into PostgreSQL |
| **API endpoint** | `https://api.census.gov/data/{year}/pep/population` + ACS 5-Year |
| **Geography** | `state:41` (Oregon), `place:59000` (Portland) |
| **Data loaded** | PEP 2019 (654,741) + ACS 5-Year 2017-2022 (630,331 - 650,380) |
| **Database tables** | `migration.census_population`, `public.migration_census` |
| **Fetch script** | `scripts/fetch-census.ts` |
| **API route** | `src/app/api/dashboard/migration/route.ts` (updated to serve real data) |
| **Note** | PEP 2020-2023 endpoints returned 404; ACS 5-Year provides coverage for those years |

---

### IRS Migration Data (SOI Tax Stats) — `NEEDS_DOWNLOAD`

| Field | Value |
|-------|-------|
| **Current status** | NOT IMPLEMENTED — not yet referenced in codebase |
| **What it provides** | County-to-county migration flows based on tax return address changes |
| **Download URL** | https://www.irs.gov/statistics/soi-tax-stats-migration-data |
| **Format** | CSV, released annually with ~2 year lag |
| **Latest available** | 2021-2022 filing year (released late 2024) |
| **Action** | Download CSV, parse Multnomah County inflows/outflows, load into `migration` schema |

---

## 2. Business — "Is Portland gaining or losing businesses?"

### Revenue Division BLT Registrations — `NEEDS_PRR`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — all BLT data is fabricated |
| **What we need** | Monthly counts of new Business License Tax (BLT) registrations and cancellations/expirations, by NAICS sector code, from Jan 2020 to present |
| **Who to contact** | Portland Revenue Division |
| **Phone** | 503-823-5157 (business tax inquiries) |
| **Website** | https://www.portland.gov/revenue |
| **Online portal** | Portland Revenue Online (PRO) — but no public data export |
| **Estimated fulfillment** | 15-20 business days |
| **Cost** | Free for aggregate data |
| **Recurring** | Request quarterly or set up data-sharing MOU |

**Exact text of public records request:**

> Dear Portland Revenue Division Records Officer,
>
> Pursuant to Oregon's Public Records Law (ORS 192.311-192.478), I am requesting
> the following records:
>
> Monthly aggregate counts of:
> 1. New Business License Tax (BLT) registrations
> 2. BLT cancellations, expirations, and closures
>
> For the period January 1, 2020 through the most recent available month.
>
> Please provide the data broken down by:
> - Month (YYYY-MM)
> - 2-digit NAICS sector code (e.g., 72 = Accommodation & Food Services)
> - Business location ZIP code (5-digit)
>
> I am requesting aggregate counts only — no business names, tax IDs, revenue
> figures, or other confidential business information.
>
> I would prefer to receive this data in CSV or Excel format via email.
>
> If there are any fees, please advise me of the estimated cost before proceeding.
>
> Thank you,
> [Your Name]
> [Portland Commons Project]

---

### CivicApps Business Licenses API — `OFFLINE`

| Field | Value |
|-------|-------|
| **Current status** | OFFLINE — both HTTP and HTTPS endpoints return errors |
| **Endpoints tried** | `https://api.civicapps.org/business-licenses/`, `http://api.civicapps.org/business-licenses/` |
| **Alternatives** | 1. File PRR to Revenue Division (above). 2. Check if Portland Maps has a business license ArcGIS layer. 3. Check Oregon Secretary of State business registry. |
| **Code location** | `scripts/seed-real-data.ts` lines 295-375 |

---

## 3. Downtown — "Is downtown Portland coming back to life?"

### Foot Traffic (Placer.ai) — `NEEDS_SUBSCRIPTION`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — fabricated foot traffic % of 2019 baseline |
| **Provider** | Placer.ai |
| **Estimated cost** | $2,000-$5,000/month depending on tier |
| **What it provides** | Anonymized mobile device signals for foot traffic by area, day, time |
| **Alternatives** | 1. Partner with Portland Business Alliance / Clean & Safe District (they may already subscribe). 2. Use TriMet ridership at downtown stops as proxy. 3. Use Portland's PBOT pedestrian counters if available as ArcGIS layer. |
| **Action** | Contact Clean & Safe District (info@portlandalliance.com) to ask if they share Placer.ai data |

### Commercial Vacancy Rate (CoStar) — `NEEDS_SUBSCRIPTION`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — fabricated vacancy percentages |
| **Provider** | CoStar Group |
| **Estimated cost** | $500-$1,500/month for Portland metro market |
| **Alternatives** | 1. Portland Business Alliance quarterly "State of Downtown" reports (free, quarterly). 2. CBRE/JLL quarterly market reports (free summaries). 3. LoopNet/Crexi scraping (terms of service concern). 4. Portland Housing Bureau "State of Housing" reports include some vacancy data. |
| **Free alternative URL** | https://www.portland.gov/phb/data-and-reports (Housing Bureau dashboards) |

### Graffiti Reports — `LIVE`

| Field | Value |
|-------|-------|
| **Status** | LIVE via ArcGIS |
| **Endpoint** | `Public/BPS_Graffiti/FeatureServer/0` |
| **Records** | ~22,000 reports |
| **Used in** | Downtown route as "visible disorder" metric |

---

## 4. Safety — "Is Portland becoming safer?"

### Crime Grid Data — `LIVE`

| Field | Value |
|-------|-------|
| **Status** | LIVE via ArcGIS |
| **Endpoints** | `Public/Crime/MapServer` layers 2 (property), 41 (person), 60 (society) |
| **Records** | ~8,744 grid records |
| **Limitation** | Grid/aggregate data only, not individual incidents. No historical trend for YoY comparison. |

### PPB Crime CSV Downloads — `NEEDS_INVESTIGATION`

| Field | Value |
|-------|-------|
| **Current status** | Not yet integrated |
| **What's available** | PPB publishes dashboards at portland.gov/police/open-data but individual record CSVs may require direct request |
| **Contact** | ppbopendata@police.portlandoregon.gov |
| **Available dashboards** | Crime stats, shooting incidents, bias crimes, stolen vehicles, dispatched calls, arrests, use of force |
| **Action** | Email ppbopendata@police.portlandoregon.gov to ask if raw CSV downloads are available or if they have an API |

### BOEC 911 Response Times — `NEEDS_PRR`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — fabricated response time data |
| **What we need** | Monthly median Priority 1 response times (dispatch to on-scene) |
| **Who to contact** | Bureau of Emergency Communications (BOEC) |
| **Website** | https://www.portland.gov/911 |
| **Estimated fulfillment** | 10-15 business days |

**Exact text of public records request:**

> Dear BOEC Records Officer,
>
> Pursuant to Oregon's Public Records Law (ORS 192.311-192.478), I am requesting
> the following records:
>
> Monthly aggregate statistics for 911 dispatched calls:
> 1. Median response time (dispatch to on-scene) for Priority 1 calls
> 2. Median response time for Priority 2 calls
> 3. Total call volume by priority level
>
> For the period January 1, 2023 through the most recent available month.
>
> Broken down by month (YYYY-MM) and precinct (Central, East, North).
>
> I am requesting aggregate statistics only — no caller information, addresses,
> or individual call records.
>
> CSV or Excel format preferred, via email.
>
> Thank you,
> [Your Name]
> [Portland Commons Project]

---

## 5. Tax — "How does Portland's tax burden compare?"

### Tax Rate Comparison — `STATIC`

| Field | Value |
|-------|-------|
| **Status** | STATIC — computed from published tax rates |
| **Sources** | Lincoln Institute of Land Policy, Oregon DOR, Washington DOR, city budget offices |
| **Code location** | `src/lib/mock-data.ts` (taxData), `src/lib/calculator/tax-data.ts` |
| **Action needed** | Verify rates annually when new fiscal year starts (July 1). No API needed. |

---

## 6. Housing — "Can people afford to live in Portland?"

### Building Permits (BDS) — `LIVE`

| Field | Value |
|-------|-------|
| **Status** | LIVE via ArcGIS |
| **Endpoint** | `Public/BDS_Permit/FeatureServer/22` |
| **Records** | ~77 permits (filtered to 2023+, up to 200K total in system) |
| **Used in** | Housing route for pipeline counts and processing time |

### Zillow ZORI (Observed Rent Index) — `NEEDS_DOWNLOAD`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — fabricated rent values in mock-data.ts |
| **Download URL** | https://www.zillow.com/research/data/ (look for "ZORI" under Rentals) |
| **Direct CSV URL** | `https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv` (metro-level, smoothed) |
| **Format** | CSV with monthly columns, one row per metro |
| **Metro to filter** | "Portland-Vancouver-Hillsboro, OR-WA" |
| **Action** | 1. Download CSV. 2. Filter to Portland metro row. 3. Parse monthly columns into `housing.median_rent` table. 4. Set up monthly cron to re-download. |
| **License** | Free for non-commercial and research use |

### Portland Housing Bureau Reports — `NEEDS_INVESTIGATION`

| Field | Value |
|-------|-------|
| **What's available** | PHB Budget Dashboard (Tableau), Eviction Legal Defense Dashboard, PSH Dashboard, State of Housing report |
| **URL** | https://www.portland.gov/phb/data-and-reports |
| **Potential data** | Affordability metrics, eviction rates, supportive housing counts |
| **Action** | Check if Tableau dashboards have downloadable CSV export |

---

## 7. Program — "Are city programs actually working?"

### PCB Registry Metrics — `INTERNAL`

| Field | Value |
|-------|-------|
| **Current status** | MOCK — fabricated program metrics |
| **Future source** | Portland Commons Business (PCB) registry database |
| **Action** | Will be live once PCB application system is operational |
| **Metrics** | Certified business count, survival rate, jobs created, credit utilization |

---

## 8. Supporting Data Sources (Not Yet Integrated)

### BLS Employment Data — `LIVE`

| Field | Value |
|-------|-------|
| **Current status** | LIVE — 1,918 data points fetched via BLS v1 API (no key) |
| **What it provides** | Monthly employment by sector + unemployment rate for Portland MSA |
| **API endpoint** | `https://api.bls.gov/publicAPI/v1/timeseries/data/` |
| **Series loaded** | 16 series: Total Nonfarm, Total Private, all industry sectors, unemployment rate, employment level, US reference |
| **Date range** | 2016-2025 (120 monthly data points per series) |
| **Database table** | `business.bls_employment_series` |
| **Fetch script** | `scripts/fetch-bls.ts` |
| **API route** | `src/app/api/dashboard/business/route.ts` (updated with BLS insights) |
| **Note** | Area code 38900 works for Portland-Vancouver-Hillsboro MSA. v1 API has 25 req/day limit. |

### FRED Economic Data — `LIVE`

| Field | Value |
|-------|-------|
| **Current status** | LIVE — 441 data points fetched via FRED CSV download (no key) |
| **What it provides** | Oregon population, Portland MSA House Price Index, active listings count |
| **Download URLs** | `https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES_ID}` |
| **Series loaded** | ORPOP (126 rows, 1900-2025), ATNHPIUS38900Q (199 rows, 1976-2025), ACTLISCOU38900 (116 rows, 2016-2026) |
| **Database tables** | `public.fred_series`, `housing.fred_house_price_index` |
| **Fetch script** | `scripts/fetch-fred.ts` |
| **API route** | `src/app/api/dashboard/housing/route.ts` (updated with HPI + listings data) |
| **Note** | MEDLISFPRI38900, LAUMT413890000000003, MEHOINUSOR672N returned 404 via CSV endpoint |

---

### TriMet Ridership — `NEEDS_API_KEY`

| Field | Value |
|-------|-------|
| **Current status** | NOT IMPLEMENTED |
| **What it provides** | Transit ridership data for Portland metro (proxy for downtown activity) |
| **Registration URL** | https://developer.trimet.org/ |
| **Steps** | 1. Create account on developer.trimet.org. 2. Request an AppID. 3. Set `TRIMET_APP_ID` env var. |
| **Env var** | `TRIMET_APP_ID` |
| **Useful for** | Downtown vitality (foot traffic proxy), migration (commute patterns) |

### Census ACS (American Community Survey) — `NEEDS_API_KEY`

| Field | Value |
|-------|-------|
| **Current status** | NOT IMPLEMENTED |
| **What it provides** | Detailed demographics: median income, housing costs, commute patterns |
| **API endpoint** | `https://api.census.gov/data/{year}/acs/acs5` |
| **Same key as** | Census PEP above — same `CENSUS_API_KEY` |

### PBOT Pedestrian/Bike Counters — `NEEDS_INVESTIGATION`

| Field | Value |
|-------|-------|
| **Current status** | NOT IMPLEMENTED |
| **Potential** | Portland has automated pedestrian/bike counters on bridges and key corridors |
| **Check** | Look for PBOT counter data on Portland Maps ArcGIS |
| **Useful for** | Downtown vitality, alternative to Placer.ai |

### Oregon Secretary of State Business Registry — `NEEDS_INVESTIGATION`

| Field | Value |
|-------|-------|
| **Current status** | NOT IMPLEMENTED |
| **URL** | https://sos.oregon.gov/business/pages/find.aspx |
| **What it provides** | Business entity filings (LLC, Corp formations/dissolutions) |
| **Potential** | Alternative to Revenue Division BLT data for business formation trends |
| **Limitation** | Statewide data; would need to filter to Portland addresses |

---

## Priority Action Items

### Immediate (this week)

1. [x] **Census population data** — DONE, fetched via PEP + ACS 5-Year without key
   - Script: `npx tsx scripts/fetch-census.ts`
   - 7 years of population data (2017-2022 ACS, 2019 PEP)

2. [ ] **Download Zillow ZORI CSV** — free, takes 10 minutes
   - URL: https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv
   - Parse and load Portland metro row into database

3. [x] **BLS employment data** — DONE, fetched 1,918 data points via v1 API (no key needed)
   - Script: `npx tsx scripts/fetch-bls.ts`
   - 16 series covering all Portland MSA employment sectors (2016-2025)

3b. [x] **FRED economic data** — DONE, fetched 441 data points via CSV download
   - Script: `npx tsx scripts/fetch-fred.ts`
   - Oregon population, Portland HPI, active listings (some series 404'd)

4. [ ] **Register for TriMet AppID** — takes 5 minutes
   - URL: https://developer.trimet.org/
   - Set `TRIMET_APP_ID` in `.env.local`

### Short-term (this month)

5. [ ] **File PRR: Water Bureau** — net water activations for migration proxy
6. [ ] **File PRR: Revenue Division** — BLT registrations for business formation
7. [ ] **Email PPB Open Data** — ask about CSV downloads for crime incident data
   - ppbopendata@police.portlandoregon.gov
8. [ ] **Download IRS SOI migration data** — county-level migration flows
   - https://www.irs.gov/statistics/soi-tax-stats-migration-data

### Medium-term (next quarter)

9. [ ] **File PRR: BOEC** — 911 response time aggregates
10. [ ] **Contact Clean & Safe District** — ask about Placer.ai data sharing
    - info@portlandalliance.com
11. [ ] **Investigate PHB Tableau dashboards** — check for CSV export
12. [ ] **Check PBOT pedestrian counters** — look for ArcGIS layer
13. [ ] **Investigate Oregon SOS business registry** — alternative business data

### Long-term (if budget allows)

14. [ ] **Placer.ai subscription** — $2K-$5K/mo for foot traffic data
15. [ ] **CoStar subscription** — $500-$1.5K/mo for vacancy data
16. [ ] **Negotiate data-sharing MOUs** — Water Bureau, Revenue Division for ongoing feeds

---

## Summary Table

| Question | Data Source | Status | Blocker |
|----------|-----------|--------|---------|
| Migration | Water Bureau activations | `NEEDS_PRR` | File public records request |
| Migration | Census population | `LIVE` | 7 years of PEP + ACS data loaded |
| Migration | IRS SOI migration | `NEEDS_DOWNLOAD` | Download CSV from irs.gov |
| Business | Revenue Div BLT | `NEEDS_PRR` | File public records request |
| Business | CivicApps API | `OFFLINE` | API permanently down |
| Downtown | Placer.ai foot traffic | `NEEDS_SUBSCRIPTION` | $2K-$5K/mo or partner with PBA |
| Downtown | CoStar vacancy | `NEEDS_SUBSCRIPTION` | $500-$1.5K/mo or use free reports |
| Downtown | Graffiti reports | `LIVE` | -- |
| Safety | Crime grid data | `LIVE` | -- |
| Safety | PPB crime CSVs | `NEEDS_INVESTIGATION` | Email ppbopendata@ |
| Safety | BOEC 911 response | `NEEDS_PRR` | File public records request |
| Tax | Published tax rates | `STATIC` | Update annually |
| Housing | BDS permits | `LIVE` | -- |
| Housing | Zillow ZORI rents | `NEEDS_DOWNLOAD` | Download free CSV |
| Housing | PHB dashboards | `NEEDS_INVESTIGATION` | Check Tableau exports |
| Program | PCB registry | `INTERNAL` | Awaiting PCB system launch |
| Supporting | BLS employment | `LIVE` | 1,918 data points, 16 series |
| Supporting | FRED economic data | `LIVE` | 441 data points, HPI + listings |
| Supporting | TriMet ridership | `NEEDS_API_KEY` | Register at trimet.org |
| Supporting | PBOT ped counters | `NEEDS_INVESTIGATION` | Check ArcGIS layers |
| Reference | Neighborhoods | `LIVE` | -- |
| Reference | PBOT requests | `LIVE` | -- |
