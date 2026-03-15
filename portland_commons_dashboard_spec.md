# Portland Commons Civic Dashboard — Complete Data Engineering Specification

## Architecture Overview

The dashboard is a story factory organized around seven questions that drive Portland media coverage. Each question has a headline metric (the single number that answers it), trend visualization, and drill-down views. Every data source is specified with its exact access method, automation pathway, and update frequency.

**Stack**: Next.js frontend, PostgreSQL database, Python ETL pipeline (scheduled via cron or Temporal), Mapbox for maps, Recharts or D3 for charts. Hosted on Vercel (frontend) + Railway or Fly.io (backend/DB/ETL workers).

**Design principle**: The dashboard auto-updates with zero human intervention for all automated sources. Human labor is required only for: quarterly ground-truthing walks, annual public records request renewals, Progress Report narrative writing, and knowledge base maintenance.

---

## Data Source Registry

Every data source falls into one of four automation tiers:

- **Tier A — Fully Automated**: API or downloadable feed with no human intervention. ETL worker pulls on schedule.
- **Tier B — Semi-Automated**: Data is published on a government website in a structured format (CSV, Excel, Tableau download) but requires a scraper or periodic manual download that could be scripted.
- **Tier C — Periodic Request**: Data requires a public records request or relationship-based data share. Arrives as a file (CSV, Excel) that gets ingested manually or via a watched folder.
- **Tier D — Manual / Partnership**: Data requires an ongoing subscription, partnership agreement, or physical field work.

---

### Source 1: Portland Police Bureau Crime Data
- **What it provides**: Reported offenses by type, neighborhood, date. Arrests by type, neighborhood, date. Dispatched calls. Police staffing numbers. Use of force. Stolen vehicles.
- **Exact URL**: https://www.portland.gov/police/open-data/reported-crime-data
- **Format**: Tableau dashboard with downloadable CSV. Each year's data is a separate downloadable file, updated monthly (~30 days after month end).
- **Access method**: The "Download Data" tab allows CSV export by year. The underlying data appears to be hosted on Tableau Public, which means it can be accessed via Tableau's CSV export URL or scraped from the published viz.
- **Automation tier**: **B — Semi-Automated**. Write a Python scraper that hits the Tableau download URL monthly. The download URL pattern is stable. Parse the CSV, load into PostgreSQL, deduplicate against existing records.
- **Update frequency**: Monthly (data published ~30 days after month end)
- **Specific fields needed**: Offense type (NIBRS code), offense category (person/property/society), date, neighborhood, block address, case number. For the dashboard: aggregate to monthly counts by neighborhood and offense category.
- **Additional PPB datasets**:
  - Dispatched Calls Dashboard: https://www.portland.gov/police/open-data (includes response times — critical for the "Is Portland safe?" question)
  - Police Staffing Numbers: same portal, updated periodically
  - Business Districts Crime Summary: same portal, updated monthly — specifically relevant for downtown corridor safety narrative
- **Feeds the question**: "Is Portland safe?"

---

### Source 2: Portland Permitting & Development (PP&D) Permit Data
- **What it provides**: Every building permit application — type, valuation, address, submit date, approval date, status, inspections.
- **Exact URL**: City of Portland GIS Open Data Portal: https://gis-pdx.opendata.arcgis.com/
- **Format**: ArcGIS Feature Service (REST API). The permits dataset is published as a hosted feature layer. Can be queried via ArcGIS REST API with spatial and attribute filters.
- **Access method**: ArcGIS REST API query. Example endpoint pattern: `https://gis-pdx.opendata.arcgis.com/datasets/[dataset-id]/FeatureServer/0/query?where=1=1&outFields=*&f=json`
- **Automation tier**: **A — Fully Automated**. Python script using `requests` to query the ArcGIS REST API. Paginate results (API returns max 1000-2000 records per request). Load into PostgreSQL. Run daily or weekly.
- **Update frequency**: Near real-time (ArcGIS feature services update as records are added to the source system). Pull weekly for dashboard.
- **Specific fields needed**: Permit number, permit type (commercial TI, new construction, change of use, residential), project address, valuation, application date, issued date, final date, status (in review, approved, issued, finaled, expired). Calculate: days from application to issuance for each permit. Aggregate: average processing time by permit type, monthly.
- **Derived metric**: "Average permit processing time" = (issued_date - application_date) in calendar days, filtered by permit type and month. This is the metric that measures whether the 90-day guarantee is being met.
- **Feeds the question**: "Is the city government functional?" and "Is housing getting built?"

---

### Source 3: CivicApps Business License API
- **What it provides**: New business license applications — business name, address, NAICS code, date added, latitude/longitude.
- **Exact URL**: http://api.civicapps.org/business-licenses/
- **Format**: JSON REST API. Returns rolling 12 months of new business license data. Supports filtering by NAICS category, date range, and location proximity.
- **Access method**: Direct API call. No authentication required. Pagination via `page` parameter.
- **Automation tier**: **A — Fully Automated**. Python script hits the API weekly, pulls all new records since last pull, loads into PostgreSQL.
- **Update frequency**: The API reflects a rolling 12-month window. Pull weekly.
- **Specific fields needed**: Business name, address, NAICS code (and description), date added, lat/lon, ZIP code. Aggregate: monthly new business registrations, by neighborhood (geocode address to neighborhood using Portland GIS boundary files), by NAICS sector.
- **Limitation**: This API provides new registrations only, not cancellations/closures. For net business formation, you also need cancellation data — see Source 10 (public records request to Revenue Division).
- **Feeds the question**: "Is Portland gaining or losing businesses?"

---

### Source 4: Placer.ai (Foot Traffic Analytics)
- **What it provides**: Foot traffic volume, visitor origin (home ZIP/census tract), dwell time, visit frequency, time-of-day patterns, day-of-week patterns, trade area analysis. Granular to specific locations and corridors.
- **Exact URL**: https://www.placer.ai/solutions/civic (civic product) or data shared via Clean & Safe
- **Access method — Option A (preferred)**: Data sharing agreement with Downtown Portland Clean & Safe (Mark Wells). Clean & Safe is already a Placer.ai civic customer. Negotiate access to their Placer.ai data feed for the Central City, either as raw exports or via Placer.ai's API if Clean & Safe's license permits third-party access. This is the fastest and cheapest path.
- **Access method — Option B**: Direct Portland Commons subscription to Placer.ai's civic product. Cost: likely $2,000-5,000/month depending on geographic scope and data granularity. Provides independent access and the ability to query beyond Clean & Safe's coverage area.
- **Automation tier**: **D — Partnership**. If via Clean & Safe: depends on their export schedule. If direct subscription: Placer.ai provides a dashboard and data export tools; some plans include API access. Automate by scheduling weekly data exports and ingesting via a watched folder or API pull.
- **Update frequency**: Placer.ai data updates continuously (based on mobile device signals). Aggregate weekly for dashboard display. Monthly for Progress Report deep dives.
- **Specific data points for dashboard**:
  - Weekly total visitors to Central City (indexed to 2019 baseline)
  - Hourly distribution (heatmap: hour of day × day of week)
  - Visitor origin breakdown (% downtown residents, % inner neighborhoods, % suburbs, % outside metro)
  - Average dwell time (minutes)
  - Repeat visit rate (% of visitors who visited 2+ times in 30 days)
  - Corridor-level breakdowns for the five target corridors
- **Feeds the question**: "Is downtown coming back to life?"

---

### Source 5: TriMet Developer API (Transit Ridership)
- **What it provides**: Real-time vehicle positions, trip updates, service alerts. Schedule data in GTFS format. Historical ridership data published in annual reports.
- **Exact URL**: https://developer.trimet.org/ (register for free AppID)
- **API endpoints**:
  - GTFS static schedule: http://developer.trimet.org/schedule/gtfs.zip
  - GTFS-realtime Trip Updates: http://developer.trimet.org/ws/V1/TripUpdate?appID={appid}
  - GTFS-realtime Vehicle Positions: http://developer.trimet.org/ws/V1/VehiclePositions?appID={appid}
  - GTFS-realtime Alerts: http://developer.trimet.org/ws/V1/FeedSpecAlerts?appID={appid}
  - GIS shapefiles: https://developer.trimet.org/gis/
- **Access method**: Free AppID registration at developer.trimet.org. No rate limits specified for reasonable use.
- **Automation tier**: **A — Fully Automated** for schedule and real-time data. Historical ridership totals (monthly boardings by line) are published in TriMet's annual Fact Sheet and quarterly performance reports — these are **B — Semi-Automated** (scrape from published PDFs or data tables on trimet.org).
- **What we actually need for the dashboard**: Monthly total boardings by MAX line and key bus routes, compared to 2019 baseline. TriMet publishes this in their performance reports. The real-time API is useful for other applications but the dashboard needs the monthly aggregate.
- **Approach**: Scrape TriMet's published ridership data from their performance reports page (quarterly PDF or web table). Supplement with GTFS-realtime data aggregated to estimate ridership if published data is delayed.
- **Update frequency**: Quarterly (from published reports) or monthly if TriMet provides a data share.
- **Feeds the question**: "Is downtown coming back to life?" (transit as a proxy for activity)

---

### Source 6: City of Portland GIS Open Data Portal (Property, Zoning, Parcels)
- **What it provides**: Every parcel in Portland with: boundaries, zoning designation, address, owner (from assessor link), building footprints, land use classification.
- **Exact URL**: https://gis-pdx.opendata.arcgis.com/
- **Format**: ArcGIS Feature Services (REST API), also downloadable as shapefiles, GeoJSON, CSV, KML.
- **Key datasets**:
  - Taxlots (parcels): boundaries, tax lot ID, site address, owner
  - Zoning: current zoning designation for every parcel
  - Building footprints: building outlines with square footage
  - Neighborhoods: official neighborhood boundaries
  - Council districts: new 12-district boundaries
  - Urban renewal areas: TIF district boundaries
- **Access method**: ArcGIS REST API or bulk download. All publicly accessible, no authentication required.
- **Automation tier**: **A — Fully Automated**. Download shapefiles/GeoJSON periodically (quarterly is sufficient — these change slowly). Load into PostGIS for spatial queries.
- **Update frequency**: Quarterly refresh is sufficient. Zoning and parcel data changes slowly.
- **Feeds**: Base map layer for all geographic visualizations. Also feeds the vacancy database (join parcels to BLT registration data and permit data to identify likely vacancies).

---

### Source 7: Multnomah County Assessor Data (Property Ownership & Valuation)
- **What it provides**: Every property in Multnomah County with: assessed value, real market value, owner name, owner mailing address, property class (commercial, residential, industrial), building square footage, year built, tax account status.
- **Exact URL**: Data available through Metro RLIS (Regional Land Information System) or direct from Multnomah County Assessment & Taxation.
- **Access method**: 
  - Individual lookups: Portland Maps (portlandmaps.com) — free, no API, would need to scrape
  - Bulk data: File a public records request with Multnomah County Assessment & Taxation for the complete commercial property assessment roll. Specify: all properties with property class Commercial, Industrial, or Mixed Use, including tax lot ID, site address, owner name, owner mailing address, building square footage, year built, assessed value, real market value, property class.
  - Alternative bulk access: Metro RLIS provides taxlot data with assessor attributes as a GIS layer. May require a RLIS data license (free for nonprofits/government, nominal fee for others).
- **Automation tier**: **C — Periodic Request**. Annual public records request for the full assessment roll. Ingest as CSV/Excel into PostgreSQL. Supplement with quarterly spot-checks via Portland Maps for high-priority properties.
- **Update frequency**: Annual (assessment rolls are finalized each fall for the following tax year). Spot-check quarterly for priority properties.
- **Feeds the question**: "Is downtown coming back to life?" (vacancy database), and property owner identification for the Real Estate Portal.

---

### Source 8: Portland Revenue Division — BLT Registration Data
- **What it provides**: Active business license tax registrations by business name and address. This is the key dataset for identifying vacancy — commercial addresses with zero active BLT registrations are likely vacant.
- **Access method**: Public records request to the City of Portland Revenue Division. Request: "A list of all active Portland Business License Tax registrations including business name, business address, NAICS code, and registration status (active/inactive/cancelled), as of [date]."
- **Legal basis**: Oregon Public Records Law, ORS 192.311-192.478. Business name and business address are public record. Individual tax amounts and personal information (SSN, home address) are exempt and should not be requested.
- **Automation tier**: **C — Periodic Request**. File the request quarterly. Expect 2-4 weeks for fulfillment. Ingest the resulting CSV/Excel into PostgreSQL. Compare to prior quarter to identify new registrations (business formations) and cancellations (business closures).
- **Update frequency**: Quarterly.
- **Critical derived metric**: **Net business formation** = new BLT registrations minus BLT cancellations/expirations in the same period. This number does not exist anywhere in Portland's public data. You will be the first to publish it.
- **Vacancy cross-reference**: Join BLT registrations to assessor data (Source 7) by address. Commercial properties with zero active BLT registrations = vacancy candidates. This is the backbone of the proprietary vacancy database.
- **Feeds the question**: "Is Portland gaining or losing businesses?" and "Is downtown coming back to life?" (vacancy)

---

### Source 9: Portland Water Bureau — New Account Activations
- **What it provides**: New residential and commercial water account activations and deactivations by address and date. This is the best real-time proxy for migration — every new water activation is a household or business that just moved in.
- **Access method**: Public records request to the Portland Water Bureau. Request: "Monthly totals of new residential water service activations and deactivations, by ZIP code, for the period [date range]." For commercial: "Monthly totals of new commercial water service activations and deactivations, by ZIP code, for the period [date range]."
- **Automation tier**: **C — Periodic Request**. File quarterly. Ingest results into PostgreSQL.
- **Update frequency**: Quarterly (request) but the underlying data is monthly, so each quarterly request yields three months of data.
- **Why this matters**: Nobody is using this data for migration tracking. Census data is 2 years lagged. IRS data is 1-2 years lagged. USPS change-of-address data is aggregated and delayed. Water account activations are the closest thing to real-time in/out tracking that exists for a city. The first time you publish "Portland net migration by ZIP code, current to last month," every news outlet will pick it up.
- **Feeds the question**: "Is Portland gaining or losing people?"

---

### Source 10: HUD USPS Vacancy Data
- **What it provides**: Residential and commercial vacancy rates by census tract, derived from USPS mail carrier observations.
- **Exact URL**: https://www.huduser.gov/portal/datasets/usps.html
- **Format**: CSV download, updated quarterly.
- **Access method**: Direct download from HUD website. No authentication required.
- **Automation tier**: **A — Fully Automated**. Python script downloads the latest CSV quarterly (check for new file each month), parses for Multnomah County census tracts, loads into PostgreSQL.
- **Update frequency**: Quarterly.
- **Limitation**: Census tract level only — cannot identify individual vacant properties. Used as a validation/context layer for the proprietary vacancy database, not as a primary source.
- **Feeds the question**: "Is downtown coming back to life?" (vacancy validation)

---

### Source 11: CoStar (Commercial Real Estate Analytics)
- **What it provides**: Comprehensive commercial property inventory — vacancy rates, asking rents, absorption, lease comparables, transaction history, property details, owner contacts. Coverage ~85% of Portland commercial inventory by square footage.
- **Access method**: Paid subscription. CoStar's platform provides a web interface and data export tools. Some plans include API access (CoStar Connect API). Pricing: ~$500-1,500/month depending on market coverage and feature tier.
- **Automation tier**: **D — Partnership/Subscription**. If API access is included: automated quarterly pulls. If export-only: manual quarterly export of key datasets (vacancy by submarket, absorption, rents) ingested into PostgreSQL.
- **Update frequency**: CoStar updates continuously. Pull quarterly aggregates for dashboard.
- **Specific data for dashboard**:
  - Office vacancy rate: CBD, metro, by building class (A/B/C)
  - Retail vacancy rate: by submarket
  - Average asking rent: by property type and submarket
  - Net absorption: quarterly square feet leased minus vacated
  - Sublease availability: total sublease square footage (leading indicator of future direct vacancy)
- **Feeds the question**: "Is downtown coming back to life?" and housing/conversion tracking

---

### Source 12: LoopNet / Crexi / CommercialCafe (Active Listings)
- **What it provides**: Currently marketed commercial spaces for lease — address, square footage, asking rent, property type, broker contact.
- **Exact URLs**: 
  - LoopNet: https://www.loopnet.com/search/commercial-real-estate/portland-or/for-lease/
  - Crexi: https://www.crexi.com/lease/oregon/portland
  - CommercialCafe: https://www.commercialcafe.com/commercial-real-estate/us/or/portland/
- **Access method**: Web scraping. These sites don't offer public APIs. Use a headless browser (Playwright/Puppeteer) to paginate through search results and extract: address, square footage, asking rent, property type, listing date, broker.
- **Legal note**: Check terms of service. LoopNet ToS may restrict scraping. CommercialCafe and Crexi may be more permissive. Alternatively, use the data from CoStar (Source 11) which includes listing data and is obtained through a legitimate subscription.
- **Automation tier**: **B — Semi-Automated** (scraping, subject to ToS compliance) or **D** (via CoStar subscription).
- **Update frequency**: Weekly scrape or monthly via CoStar.
- **Feeds**: Real Estate Portal "listed vacancy" layer, and the distinction between listed vs. hidden vacancy in the proprietary database.

---

### Source 13: Oregon Secretary of State — Business Filings
- **What it provides**: All business entity registrations in Oregon — LLC formations, corporation filings, DBA registrations, with entity name, registered agent, filing date, status (active/inactive/dissolved).
- **Exact URL**: https://sos.oregon.gov/business/Pages/find.aspx (search interface); bulk data may be available via public records request.
- **Access method**: Individual searches via the SOS website. For bulk data: file a public records request with the Oregon Secretary of State, Corporation Division, for all business entity filings with a registered address in Multnomah County for the period [date range], including entity name, entity type, filing date, status, registered agent address.
- **Alternative**: The Oregon Blue Book and SOS data portal (https://data.oregon.gov/) may have datasets with business filing information.
- **Automation tier**: **B/C**. If bulk download is available on data.oregon.gov: semi-automated scraper. If only via public records request: periodic request (quarterly).
- **Update frequency**: Quarterly.
- **Feeds the question**: "Is Portland gaining or losing businesses?" (supplements BLT data with entity-level formation data)

---

### Source 14: Oregon Employment Department — Labor Market Data
- **What it provides**: Employment by industry and county. Unemployment rate. Wages. Job postings.
- **Exact URL**: https://www.qualityinfo.org/ (Oregon's labor market information portal)
- **Format**: Interactive data tools with downloadable CSV/Excel tables. Data available at county and MSA level.
- **Access method**: Download from QualityInfo.org. Navigate to the "Current Employment Statistics" or "Quarterly Census of Employment and Wages" datasets. Filter for Multnomah County / Portland MSA.
- **Automation tier**: **B — Semi-Automated**. Write a scraper that hits the QualityInfo download pages monthly. Alternatively, use the BLS API (https://api.bls.gov/publicAPI/v2/timeseries/data/) with Portland MSA series IDs for employment and unemployment data.
- **BLS API details**: Free, requires registration for v2 API key. Endpoint: `https://api.bls.gov/publicAPI/v2/timeseries/data/`. Series IDs for Portland MSA are published at https://www.bls.gov/eag/eag.or_portland.htm. The API returns monthly data in JSON format.
- **Update frequency**: Monthly (employment data ~6 weeks lag). Quarterly (QCEW, ~6 months lag).
- **Feeds the question**: "Is Portland gaining or losing people?" (jobs as migration driver) and general economic health.

---

### Source 15: US Census / American Community Survey
- **What it provides**: Population, demographics, income, migration, housing, commuting patterns. Definitive but slow.
- **Exact URL**: https://data.census.gov/ and Census API: https://api.census.gov/
- **Access method**: Census API is free, requires API key (register at https://api.census.gov/data/key_signup.html). Query by geography (Multnomah County, Portland city, census tract).
- **Key datasets**:
  - Population Estimates Program (PEP): Annual county population estimates. Series: `pep/population`
  - American Community Survey 1-Year (ACS1): Income, demographics, housing, commuting. Available for Portland city and county. Updated annually.
  - ACS 5-Year (ACS5): More granular (census tract level) but 5-year rolling average.
  - County-to-County Migration Flows: Annual migration data showing where Portland residents moved from/to.
- **Automation tier**: **A — Fully Automated**. Python `census` library or direct API calls. Schedule annual pull when new data is released (typically September for PEP, December for ACS).
- **Update frequency**: Annual.
- **Feeds the question**: "Is Portland gaining or losing people?" (definitive baseline, supplemented by real-time water bureau proxy)

---

### Source 16: IRS Statistics of Income — Migration Data
- **What it provides**: County-to-county migration flows based on tax return address changes. Number of returns (households) and total adjusted gross income migrating in and out.
- **Exact URL**: https://www.irs.gov/statistics/soi-tax-stats-migration-data
- **Format**: CSV downloadable files, organized by year.
- **Access method**: Direct download. No authentication required.
- **Automation tier**: **A — Fully Automated**. Download annually when new data is published (typically ~18 months lag). Parse for Multnomah County inflows and outflows.
- **Update frequency**: Annual (with 18-month lag).
- **Key derived metric**: Net AGI migration — total adjusted gross income moving into Multnomah County minus total AGI moving out. This tells you not just whether people are leaving, but whether the people leaving are wealthier or poorer than the people arriving. If Portland is losing high-income households to Clark County, that's a very specific story about the tax burden.
- **Feeds the question**: "Is Portland gaining or losing people?" and "Is the tax burden driving people away?"

---

### Source 17: PDX Reporter / 311 Data
- **What it provides**: Citizen reports of graffiti, illegal dumping, abandoned vehicles, potholes, streetlight outages, encampments, and other livability issues.
- **Exact URL**: https://pdxreporter.org/ — data may be accessible through the city's open data portal or via public records request.
- **Format**: Check if published on gis-pdx.opendata.arcgis.com as a feature service. If not, file a public records request for all PDX Reporter submissions for the past 12 months including: report type, address/location, date submitted, date resolved, resolution status.
- **Automation tier**: **A or C** depending on whether it's on the open data portal. If ArcGIS feature service: fully automated API pull. If public records request: periodic request.
- **Update frequency**: Weekly if automated, quarterly if request-based.
- **Feeds the question**: "Is Portland safe?" (visible disorder index — aggregate reports by type and neighborhood as a proxy for street-level conditions)

---

### Source 18: Apartments.com / Zillow / Redfin (Rental Market Data)
- **What it provides**: Median asking rents by neighborhood, rental inventory, vacancy.
- **Access method**: 
  - Zillow publishes the Zillow Observed Rent Index (ZORI) as a free downloadable CSV at https://www.zillow.com/research/data/. Data at ZIP code and metro level. Monthly updates.
  - Apartments.com/CoStar publishes metro-level rent reports quarterly.
  - Redfin publishes rental data at https://www.redfin.com/news/data-center/.
- **Automation tier**: **A — Fully Automated**. Download Zillow ZORI CSV monthly (direct URL, no authentication). Supplement with CoStar data from Source 11.
- **Update frequency**: Monthly (Zillow), quarterly (CoStar/Apartments.com).
- **Feeds the question**: "Is housing getting built?" (affordability tracking)

---

### Source 19: Portland Housing Bureau — Affordable Housing Data
- **What it provides**: Affordable housing inventory, units in pipeline, SDC exemption program data, construction excise tax collections.
- **Exact URL**: https://www.portland.gov/phb (various reports and datasets)
- **Access method**: Published reports on PHB website. Some data available through the city's open data portal. For pipeline data: may need a public records request or relationship with PHB staff.
- **Automation tier**: **B/C**. Scrape published reports quarterly. File annual public records request for detailed pipeline data.
- **Update frequency**: Quarterly.
- **Feeds the question**: "Is housing getting built?"

---

### Source 20: Portland Commons Internal Data (PCB Registry)
- **What it provides**: All program metrics — certifications, survival tracking, Commons Credits, Launch Sponsors, Real Estate Portal matches, Founders Fund loans.
- **Access method**: Direct database query — this is your own data.
- **Automation tier**: **A — Fully Automated**. Dashboard reads directly from the PCB registry database.
- **Update frequency**: Real-time.
- **Feeds the question**: "Is the Portland Commons working?"

---

## ETL Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SCHEDULER (Cron/Temporal)              │
│                                                          │
│  Daily:   PPB crime downloads, PP&D permit API pulls     │
│  Weekly:  CivicApps API, LoopNet scrape, Placer.ai pull  │
│           PDX Reporter, TriMet ridership                 │
│  Monthly: Zillow ZORI download, BLS API pull,            │
│           Water Bureau ingest (from quarterly file)       │
│  Quarterly: CoStar export ingest, HUD USPS download,     │
│           BLT registration ingest (from PRR file),       │
│           Assessor data refresh, SOS filings ingest       │
│  Annual:  Census API pull, IRS migration download,       │
│           ACS data pull                                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              ETL WORKERS (Python)                         │
│                                                          │
│  Each source has a dedicated worker script that:         │
│  1. Fetches raw data (API call, file download, scrape)   │
│  2. Validates schema (expected columns, data types)      │
│  3. Transforms (geocode, aggregate, calculate derived    │
│     metrics, join to reference tables)                   │
│  4. Loads into PostgreSQL staging table                  │
│  5. Runs quality checks (null counts, range validation,  │
│     row count comparison to prior period)                │
│  6. Promotes from staging to production table            │
│  7. Logs success/failure to monitoring table             │
│                                                          │
│  On failure: Sends alert (email/Slack) to admin.         │
│  Dashboard continues showing last-good data with         │
│  "Last updated: [date]" indicator.                       │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                         │
│                                                          │
│  Schema organized by question:                           │
│                                                          │
│  migration.*     — water activations, census, IRS        │
│  business.*      — BLT registrations, CivicApps, SOS    │
│  downtown.*      — Placer foot traffic, vacancy, CoStar  │
│  safety.*        — PPB crime, dispatched calls, PDX Rptr │
│  tax.*           — comparative rate tables, BLT revenue  │
│  housing.*       — permits (residential), Zillow, PHB    │
│  program.*       — PCB registry, credits, matches        │
│  reference.*     — neighborhoods, parcels, zoning, GIS   │
│                                                          │
│  PostGIS extension enabled for spatial queries.          │
│  Materialized views for dashboard-ready aggregates       │
│  (refreshed after each ETL run).                         │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              API LAYER (Next.js API routes or FastAPI)    │
│                                                          │
│  /api/dashboard/migration     — headline + trends        │
│  /api/dashboard/business      — headline + trends        │
│  /api/dashboard/downtown      — headline + trends        │
│  /api/dashboard/safety        — headline + trends        │
│  /api/dashboard/tax           — comparison table          │
│  /api/dashboard/housing       — headline + trends        │
│  /api/dashboard/program       — PCB metrics              │
│  /api/dashboard/vacancy-map   — GeoJSON vacancy layer    │
│  /api/export/{question}/{format} — CSV/JSON export       │
│                                                          │
│  Public API (no auth for read-only aggregate data).      │
│  Rate limited (100 req/min per IP).                      │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                           │
│                                                          │
│  Seven question tabs, each with:                         │
│  • Headline metric (big number + traffic light + trend)  │
│  • Primary chart (12-month trend)                        │
│  • Drill-down views (by neighborhood, sector, time)     │
│  • "Story" callout (auto-generated insight, e.g.        │
│    "Saturday foot traffic is now 94% of 2019 — the      │
│     highest recovery of any day of the week")            │
│  • Source citation and last-updated date                 │
│  • Export button (CSV)                                   │
│  • Embed button (iframe snippet for journalists)         │
│                                                          │
│  Mapbox map as secondary navigation — click any          │
│  neighborhood to see all metrics for that area.          │
└─────────────────────────────────────────────────────────┘
```

---

## Automation Summary: What Runs Without Humans

| Frequency | Sources | Human Labor Required |
|-----------|---------|---------------------|
| Daily | PP&D permits (ArcGIS API) | None |
| Weekly | CivicApps business licenses, Placer.ai (if API), PPB crime data, PDX Reporter | None |
| Monthly | Zillow ZORI, BLS employment API, TriMet ridership | None |
| Quarterly | HUD USPS vacancy, CoStar export (manual download + ingest), BLT registration data (PRR fulfillment + ingest), Water Bureau data (PRR fulfillment + ingest), Assessor data, SOS filings | ~4 hours: file/renew 3 public records requests, ingest 3-4 CSV files, run CoStar export |
| Annually | Census API, IRS migration data, ACS | None (automated download) |
| As needed | Ground-truthing priority corridors | ~8 hours per corridor per quarter (walk + photograph + log) |

**Total ongoing human labor**: approximately 4-6 hours per quarter for public records request management and manual data ingestion, plus 8-16 hours per quarter for ground-truthing (which can be delegated to volunteers or Portland Commons staff). Everything else runs on autopilot.

---

## The Seven Headlines — What Appears on the Home Screen

When a journalist, resident, or policymaker visits the dashboard, they see seven boxes, each showing:

```
┌─────────────────────────────────────────┐
│  IS PORTLAND GAINING OR LOSING PEOPLE?  │
│                                         │
│  Net Migration: +127 households         │
│  (this month)          ▲ improving      │
│  ████████████░░░ 12-month trend         │
│                                         │
│  Source: Portland Water Bureau           │
│  Last updated: March 1, 2026            │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS PORTLAND GAINING OR LOSING          │
│  BUSINESSES?                            │
│                                         │
│  Net Business Formation: +83            │
│  (this month)          ▲ improving      │
│  ████████░░░░░░░ 12-month trend         │
│                                         │
│  Source: Portland Revenue Division       │
│  Last updated: March 1, 2026            │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS DOWNTOWN COMING BACK?               │
│                                         │
│  Foot Traffic: 86% of 2019    ▲ +5.5%  │
│  Ground Floors: 73% occupied            │
│  ████████████░░░ 12-month trend         │
│                                         │
│  Source: Placer.ai via Clean & Safe     │
│  Last updated: March 7, 2026            │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS PORTLAND SAFE?                      │
│                                         │
│  Property Crime: 4.2 per 1,000  ▼ -8%  │
│  911 Response: 8.4 min (Priority 1)    │
│  ████████████░░░ 12-month trend         │
│                                         │
│  Source: Portland Police Bureau          │
│  Last updated: February 28, 2026        │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS THE TAX BURDEN COMPETITIVE?         │
│                                         │
│  Effective rate at $200K: 12.4%         │
│  (vs. Vancouver WA: 7.1%)              │
│  [Full comparison table →]              │
│                                         │
│  Source: Portland Commons analysis       │
│  Last updated: January 2026             │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS HOUSING GETTING BUILT?              │
│                                         │
│  Pipeline: 824 units                    │
│  (target: 10,000/year)     ▲ +168      │
│  Avg permit time: 14.2 months          │
│  ████░░░░░░░░░░░ 12-month trend         │
│                                         │
│  Source: PP&D permit data               │
│  Last updated: March 10, 2026           │
│  [Details →]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IS THE PORTLAND COMMONS WORKING?       │
│                                         │
│  PCB Businesses: 347 certified          │
│  1-Year Survival: 89%  (natl avg: 80%) │
│  Jobs Created: 1,240                    │
│                                         │
│  Source: Portland Commons Registry       │
│  Last updated: real-time                │
│  [Details →]                            │
└─────────────────────────────────────────┘
```

Each box is a link to a full detail page with historical trends, geographic breakdowns, methodology notes, and export/embed options.

---

## Story Detection: Auto-Generated Insights

The dashboard should include a simple rules-based system that detects noteworthy changes and generates human-readable insight callouts. These appear on the dashboard and in a weekly "Portland Pulse" email digest.

Examples of detection rules:

- **Metric crosses a threshold**: "Downtown foot traffic has exceeded 90% of 2019 levels for the first time since the pandemic."
- **Trend reversal**: "After 18 months of decline, net business formation turned positive in [month]."
- **Geographic outlier**: "The Central Eastside saw a 22% increase in foot traffic this month — the largest of any corridor."
- **Comparison milestone**: "Portland's office vacancy rate dropped below 30% for the first time since Q2 2024."
- **Program milestone**: "The 500th Portland Commons Business was certified this week."
- **Anomaly**: "Property crime in Old Town spiked 40% this month compared to the 12-month average."

These are generated by comparing the latest data point to: the prior month, the prior year, the 12-month average, peer cities (where comparable data exists), and predefined targets (90-day permit guarantee, 2019 baseline, etc.).

The insight engine is not AI — it's a set of SQL queries and Python rules that check for threshold crossings, trend reversals, and outliers each time new data is loaded. The output is a plain-English sentence stored in a `insights` table and surfaced on the dashboard and in the email digest.

This is the "story factory" mechanism — every week, the system automatically identifies the three or four most noteworthy data points and writes the headline. A journalist subscribed to the Portland Pulse digest gets a weekly email that says, in effect, "here are this week's stories, with the data to back them up." They click through to the dashboard, see the chart, and write the article. You never have to pitch a story. The stories pitch themselves.

---

## Build Order (Dashboard Only)

### Week 1-2: Infrastructure
- Set up PostgreSQL with PostGIS, Next.js project, deployment pipeline
- Load reference data: Portland neighborhood boundaries, council districts, zoning (from GIS portal — Source 6)
- Build the ETL framework: scheduler, worker template, monitoring/alerting

### Week 3-4: First Three Headlines
- **PPB crime data** (Source 1): Build scraper, load historical data, build "Is Portland Safe?" headline + trend chart
- **PP&D permit data** (Source 2): Connect to ArcGIS API, load historical permits, calculate processing times, build "Is Housing Getting Built?" headline (permit time metric)
- **CivicApps business licenses** (Source 3): Connect to API, load 12-month history, build "Is Portland Gaining/Losing Businesses?" headline (new registrations only — net formation comes later with BLT data)

### Week 5-6: Core Data + Map
- File public records requests: BLT registrations (Source 8), Water Bureau activations (Source 9)
- Build Mapbox base map with neighborhood boundaries
- Build neighborhood drill-down: click any neighborhood to see crime, permits, business formation for that area
- Deploy public beta of dashboard with three headlines

### Week 7-8: Downtown + Migration
- Onboard Placer.ai data (Source 4): either via Clean & Safe data share or direct subscription. Build "Is Downtown Coming Back?" headline with foot traffic trend, time-of-day heatmap, visitor origin breakdown.
- Ingest Water Bureau data (when PRR is fulfilled). Build "Is Portland Gaining/Losing People?" headline with net migration proxy.
- Build the "ground-floor activation" metric view for priority corridors (initially from visual ground-truthing data + CoStar/listing platform data)

### Week 9-10: Tax + Vacancy + Housing
- Build tax comparison calculator (Source: own analysis using published rates). Build "Is the Tax Burden Competitive?" headline with comparison table.
- Ingest BLT registration data (when PRR is fulfilled). Calculate net business formation (new minus cancelled). Update "Businesses" headline to show net. Cross-reference BLT to assessor data for vacancy candidates.
- Connect CoStar data (Source 11). Build vacancy metrics by submarket and building class.
- Ingest Zillow ZORI (Source 18). Build rent affordability tracking.
- Integrate PP&D residential permit data for housing pipeline tracking.

### Week 11-12: Polish + Launch
- Build insight detection engine (story factory rules)
- Build Portland Pulse weekly email digest
- Build embed widgets for each headline metric
- Build CSV export for all datasets
- Design and polish frontend (this must be beautiful — it's the organization's credibility)
- Full public launch with media outreach

### Ongoing (Post-Launch)
- Monthly: TriMet ridership integration, BLS employment data integration
- Quarterly: Refresh assessor data, HUD USPS data, ground-truthing walks
- Annually: Census/ACS population data, IRS migration data
- As PCB program launches: Add "Is Portland Commons Working?" headline with program metrics

---

## Cost Estimate

| Item | One-Time | Monthly |
|------|----------|---------|
| Vercel hosting (Pro) | — | $20 |
| Railway/Fly.io (PostgreSQL + workers) | — | $50-100 |
| Mapbox (50K map loads/mo free, then $0.50/1K) | — | $0-50 |
| CoStar subscription | — | $500-1,500 |
| Placer.ai civic subscription (if not via Clean & Safe) | — | $2,000-5,000 |
| Domain + email | — | $20 |
| Public records request costs (Oregon law allows "actual cost" fees) | $200-500/yr | — |
| **Total without Placer.ai direct sub** | **~$500** | **~$600-1,700** |
| **Total with Placer.ai direct sub** | **~$500** | **~$2,600-6,700** |

The dashboard can launch and operate credibly without CoStar or Placer.ai by relying on free public data sources and the Colliers/CBRE published quarterly reports. CoStar and Placer add depth and granularity that make the dashboard truly authoritative, but the core story factory works without them. Start with the free sources, add the paid sources as revenue (membership dues, grants) allows.

Your own engineering time is the primary cost. At 20-30 hours per week for the first 12 weeks, plus 5-10 hours per week ongoing maintenance, the dashboard is a one-person build with your skill set.
