# Civic Dashboard Data Source Inventory

This is the canonical app-local data-source inventory for the civic dashboard. It consolidates the old endpoint registry, data-source TODO list, and historical dashboard data-source registry so agents do not maintain parallel data-source docs.

## Operating Rule

- Update this file when a dashboard data source is added, retired, promoted from mock to live, or moved to shared `data/datasets/`.

- Keep product behavior in `../portland-civic-dashboard-spec.md`; keep cross-portfolio strategy in `../../../data/knowledge/portfolio/`.


## Consolidated Endpoint Registry

Crawled 2026-03-15 from gis-pdx.opendata.arcgis.com and portlandmaps.com/arcgis/rest/services/

## Portland Maps ArcGIS REST Server

Base URL: `https://www.portlandmaps.com/arcgis/rest/services/`
Server version: 11.5
Folders: Public, Utilities
Total services: 401 (371 MapServer, 18 FeatureServer, 3 GeocodeServer)

---

### HIGH-VALUE FeatureServers (queryable, daily-updated)

**1. BDS Permits — `Public/BDS_Permit/FeatureServer`**
- Max records per query: 4,000
- Spatial ref: EPSG 3857 (Web Mercator)
- Export formats: SQLite, File GDB, Shapefile, CSV, GeoJSON
- Layers:
  - 1: Commercial Addition or Alteration Permit (Point)
  - 2: Commercial Construction Permit (Point)
  - 3: Commercial Demo Permit (Point)
  - 4: Residential Addition or Alteration Permit (Point)
  - 5: Residential Construction Permit (Point)
  - 6: Residential Demo Permit (Point)
  - 7: Recent Construction Activity (Point)
  - 16: Noise Complaint (Past Year) (Point)
  - 22: All Permits (Point) ← PRIMARY LAYER for dashboard
  - 24: Wireless Site Permit (Polygon)
  - 26: Noise Variance (Past Year) (Point)
- **Dashboard use**: "Is housing getting built?" + "Is the city functional?"

**2. BDS Metrics — `Public/BDS_Metric/FeatureServer`**
- Permit processing time metrics
- **Dashboard use**: 90-day permit guarantee tracking

**3. BDS Property — `Public/BDS_Property/FeatureServer`**
- Layer 0: Property (Polygon)
- Description: "BDS Properties with attributes to support POPS queries. Pre-processed for permitting analysis."
- **Dashboard use**: Vacancy cross-reference, property analysis

**4. BDS Address — `Public/BDS_Address/FeatureServer`**
- Address points for geocoding/matching

**5. BPS Graffiti — `Public/BPS_Graffiti/FeatureServer`**
- Active graffiti reports
- **Dashboard use**: Visible disorder proxy for "Is Portland safe?"

**6. PBOT E-Scooter — `Public/PBOT_EScooter_Pilot/FeatureServer`**
- Scooter usage data

---

### HIGH-VALUE MapServers (pre-rendered, queryable)

**7. Crime — `Public/Crime/MapServer`**
- 78 layers covering Property, Person, and Society crimes
- INCLUDES pre-aggregated grid polygons (no need to aggregate points)
- Property Crimes Group (ID 0):
  - 1: All Property Crime Locations (Point)
  - 2: All Property Crimes Grid (Polygon) ← USE THIS
  - 4/5: Burglary Locations/Grid
  - 7/8: Vandalism Locations/Grid
  - 10/11: Stolen Property Locations/Grid
  - 13/14: Extortion Locations/Grid
  - 16/17: Embezzlement Locations/Grid
  - 19/20: Counterfeiting/Forgery Locations/Grid
  - 22/23: Bribery Locations/Grid
  - 25/26: Fraud Locations/Grid
  - 28/29: Arson Locations/Grid
  - 31/32: Robbery Locations/Grid
  - 34/35: Larceny Locations/Grid
  - 37/38: Motor Vehicle Theft Locations/Grid
- Person Crimes Group (ID 39):
  - 40: All Person Crime Locations (Point)
  - 41: All Person Crimes Grid (Polygon) ← USE THIS
  - 43: Sex Offenses Nonforcible Grid
  - 45: Sex Offenses Grid
  - 47/48: Kidnapping Locations/Grid
  - 50/51: Human Trafficking Locations/Grid
  - 53/54: Homicide Locations/Grid
  - 56/57: Assault Locations/Grid
- Society Crimes Group (ID 58):
  - 59: All Society Crime Locations (Point)
  - 60: All Society Crime Grids (Polygon) ← USE THIS
  - 62/63: Weapon Law Violations Locations/Grid
  - 65/66: Prostitution Locations/Grid
  - 68/69: Pornography Locations/Grid
  - 71/72: Gambling Locations/Grid
  - 74/75: Drug/Narcotic Locations/Grid
  - 77/78: Animal Cruelty Locations/Grid
- **Dashboard use**: "Is Portland safe?" — use grid layers 2, 41, 60 for aggregate rates

**8. Zoning — `Public/Zoning/MapServer`**
- Zoning designations for all parcels
- **Dashboard use**: Base map, Real Estate Portal

**9. Taxlots — `Public/Taxlots/MapServer`**
- Parcel boundaries
- **Dashboard use**: Vacancy database backbone

**10. Boundaries — `Public/Boundaries/MapServer`**
- Neighborhood boundaries, council districts, urban renewal areas
- **Dashboard use**: All geographic drill-downs

**11. Transit — `Public/Transit/MapServer`**
- Transit routes and stops
- **Dashboard use**: "Is downtown coming back?" transit proximity

**12. PBOT Service Requests — `Public/PBOT_Service_Requests/MapServer`**
- Street-level service requests
- **Dashboard use**: Livability/visible conditions

**13. PHB Rental Portfolio — `Public/PHB_Rental_Portfolio/MapServer`**
- Affordable housing portfolio
- **Dashboard use**: "Is housing getting built?"

**14. OMF Short Term Rental Registry — `Public/OMF_Short_Term_Rental_Registry/MapServer`**
- Active short-term rental registrations
- **Dashboard use**: Housing supply analysis

---

### REFERENCE MapServers (less frequent updates)

**15. Basemap_Color_Complete** — `Public/Basemap_Color_Complete/MapServer`
**16. Basemap_Gray_Complete** — `Public/Basemap_Gray_Complete/MapServer`
**17. Basemap_Color_Buildings** — `Public/Basemap_Color_Buildings/MapServer`
**18. Street_Centerlines** — `Public/Street_Centerlines/MapServer`
**19. Elevation** — `Public/Elevation/MapServer`
**20. Elevation_Contour_Lines** — `Public/Elevation_Contour_Lines/MapServer`
**21. Parcel_Dimensions** — `Public/Parcel_Dimensions/MapServer`
**22. Hazard** — `Public/Hazard/MapServer`
**23. Natural_Hazards** — `Public/Natural_Hazards/MapServer`
**24. Transportation_System_Plan** — `Public/Transportation_System_Plan/MapServer`
**25. Transportation** — `Public/Transportation/MapServer`
**26. Park_Details** — `Public/Park_Details/MapServer`
**27. Fire_Integration_Layers** — `Public/Fire_Integration_Layers/MapServer`
**28. Public_Safety_Boundaries** — `Public/Public_Safety_Boundaries/MapServer`
**29. Public_Safety_Places** — `Public/Public_Safety_Places/MapServer`
**30. IDC_Districts** — `Public/IDC_Districts/MapServer` (new council districts)
**31. Capital_Improvement_Projects** — `Public/Capital_Improvement_Projects/MapServer`

### Parks-Related Services
- Parks_Administrative_Boundaries, Parks_Community_Gardens, Parks_Dog_Off_Leash_Areas
- Parks_Natural_Area_Assessments, Parks_Pathways_and_Trails, Parks_Sports_Courts
- Parks_Water_Features, Parks_Parking_Lots, Parks_Street_Tree_Inventory_Active

### BES (Environmental Services)
- BES_Layers, BES_Utilities_Storm_Greenstreets, BES_Surface_Water_Monitoring_Locations

### Geocoding Services
- `Public/Address_Geocoding_PDX/GeocodeServer`
- `Public/Assessor_IDs/GeocodeServer`
- `Public/Centerline_Geocoding_PDX/GeocodeServer`

### Aerial Photos (300+ services, historical record)
- `Public/Aerial_Photos_Summer_YYYY` from 1996 to 2025
- `Public/Aerial_Photos_Winter_YYYY` for 2005, 2012, 2024
- Historical: 1948, 1959, 1960, 1975, 1990

---

## DCAT Catalog Datasets (gis-pdx.opendata.arcgis.com)

30+ datasets with CSV/Shapefile/GeoJSON/KML downloads:

| Dataset | Modified | Update Freq | Relevance |
|---------|----------|-------------|-----------|
| Building Permit Details | 2024-09-12 | Daily | HIGH — permits |
| Buildings (footprints with height) | 2024-09-10 | As needed | HIGH — vacancy |
| Police Districts (PPB) | 2024-09-12 | As needed | HIGH — safety geography |
| Portland City Council Districts | 2024-09-12 | As needed | HIGH — boundaries |
| Neighborhood District Boundaries | 2024-09-12 | As needed | HIGH — all geographic |
| Grocery Stores | 2024-09-12 | Regular | MEDIUM — livability |
| Complete Neighborhoods Scoring | 2024-09-10 | Yearly | MEDIUM — livability |
| BLI Model Development Capacity | 2024-09-12 | As needed | MEDIUM — housing |
| Parks Trails | 2024-09-12 | As needed | LOW — amenities |
| TSP District Boundaries | 2024-09-12 | As needed | LOW — transport planning |
| Adopted Community Plans | 2024-09-12 | Infrequent | LOW — reference |
| Flood Hazard Area | 2024-09-12 | As needed | LOW — hazards |

---

## PPB Open Data (portland.gov/police/open-data)

| Dataset | URL Path | Format | Dashboard Use |
|---------|----------|--------|---------------|
| Reported Crime Data | /police/open-data/reported-crime-data | Tableau + CSV | PRIMARY safety source |
| Dispatched Calls Dashboard | /police/open-data/police-dispatched-calls | Tableau | 911 response times |
| Business Districts Crime Summary | /police/open-data/business-districts-crime-summary | Tableau | Downtown corridor safety |
| Stolen Vehicle Statistics | /police/open-data/stolen-vehicle-statistics | Tableau | Vehicle theft tracking |
| Shooting Incident Statistics | /police/open-data/shooting-incident-statistics | Tableau | Violent crime |
| Police Staffing Numbers | /police/open-data/ppb-staffing-report | Report | Staffing context |
| Use of Force Dashboard | /police/open-data/ppb-use-force-dashboard | Tableau | Accountability |
| Arrest Statistics | /police/open-data/arrest-statistics | Report | Enforcement activity |
| Bias Crime Statistics | /police/open-data/reported-bias-crime-statistics | Tableau | Hate crime tracking |
| Police Demographics | /police/open-data/ppb-staff-demographics | Tableau | Staffing diversity |
| Stops Data Collection | /police/open-data/stops-data | Report | Equity analysis |
| TPM Report | /police/open-data/tpm-report | Report | Police activity |
| Deadly Force Incidents | /police/open-data/deadly-force-incidents | Report | Accountability |
| Police Overtime | /police/open-data/police-overtime | Tableau | Budget analysis |
| Precinct Demographics | /police/open-data/precinct-demographics | Report | Staffing |
| UAS Call Statistics | /police/open-data/uascalls | Tableau | Drone deployment |

---

## External APIs (not Portland GIS)

| Source | URL | Auth | Format | Update | Dashboard Use |
|--------|-----|------|--------|--------|---------------|
| CivicApps Business Licenses | api.civicapps.org/business-licenses/ | None | JSON | Rolling 12mo | Business formation |
| HUD USPS Vacancy | huduser.gov/portal/datasets/usps.html | None | CSV | Quarterly | Vacancy validation |
| Zillow ZORI | zillow.com/research/data/ | None | CSV | Monthly | Rent tracking |
| Census API | api.census.gov/ | API key | JSON | Annual | Population |
| IRS SOI Migration | irs.gov/statistics/soi-tax-stats-migration-data | None | CSV | Annual (18mo lag) | Migration flows |
| BLS Employment | api.bls.gov/publicAPI/v2/timeseries/data/ | API key (v2) | JSON | Monthly | Jobs |
| TriMet GTFS | developer.trimet.org/ | Free AppID | GTFS/JSON | Real-time | Transit ridership |
| Placer.ai | placer.ai (partnership) | Subscription | API/CSV | Continuous | Foot traffic |
| CoStar | costar.com (subscription) | Subscription | API/CSV | Quarterly | Commercial RE |

---

## Oregon State Open Data (data.oregon.gov)

Crawled 2026-03-15 via Socrata Discovery API. ~300+ datasets total.

### HIGH Relevance — Business Formation & Employment

| Dataset | Socrata ID | API Endpoint | Description | Update Freq |
|---------|-----------|-------------|-------------|-------------|
| **Active Businesses - ALL** | tckn-sxa6 | `data.oregon.gov/resource/tckn-sxa6.json` | All active businesses — principal place of business address, mailing address, entity type, registration date | Weekly |
| **New Businesses Registered Last Month** | esjy-u4fc | `data.oregon.gov/resource/esjy-u4fc.json` | New business registrations with SOS Corporation Division | Monthly |
| **Active Businesses - County Data** | 6g49-bcrm | `data.oregon.gov/resource/6g49-bcrm.json` | Active businesses by county (principal place of business) | Weekly |
| **By City - New Business Registrations Last Month** | sgc6-xdva | `data.oregon.gov/resource/sgc6-xdva.json` (filter view) | New registrations filtered by city | Monthly |
| **Active Nonprofit Corporations** | 8kyv-b2kw | `data.oregon.gov/resource/8kyv-b2kw.json` | Active nonprofits registered with SOS | Weekly |
| **Active Benefit Companies** | baig-8b9x | `data.oregon.gov/resource/baig-8b9x.json` | B-Corps and benefit LLCs | Weekly |
| **Oregon Active Workers' Comp Employer Database** | q9zj-c8r2 | `data.oregon.gov/resource/q9zj-c8r2.json` | All Oregon employers with workers' comp | Ongoing |
| **UCC Filings Entered Last Month** | snfi-f79b | `data.oregon.gov/resource/snfi-f79b.json` | Uniform Commercial Code filings (business lending activity proxy) | Monthly |

### HIGH Relevance — Revenue & Finance

| Dataset | Socrata ID | API Endpoint | Description | Update Freq |
|---------|-----------|-------------|-------------|-------------|
| **Salaries of State Agencies** | 4cmg-5yp4 | `data.oregon.gov/resource/4cmg-5yp4.json` | Multi-year state employee salary data | Annual |
| **Special Public Works Fund** | a9gn-zyub | `data.oregon.gov/resource/a9gn-zyub.json` | Infrastructure loans and grants by fiscal year | Annual |
| **Energy Incentive Program** | ria5-vqsx | `data.oregon.gov/resource/ria5-vqsx.json` | Tax credits for energy/transportation | Annual |

### HIGH Relevance — Education

| Dataset | Socrata ID | API Endpoint | Description | Update Freq |
|---------|-----------|-------------|-------------|-------------|
| **Education Service District Revenue** | acp7-jb3d | `data.oregon.gov/resource/acp7-jb3d.json` | Audited ESD revenues by school year, fund, and source | Annual |

### MEDIUM Relevance — Elections & Civic

| Dataset | Socrata ID | Description |
|---------|-----------|-------------|
| Voter Registration Data | 8h6y-5uec | Registered voters after redistricting |
| Active Trademark Registrations | ny3n-dx3v | Trademark filings (business IP activity) |
| Active Notaries | j2pk-zk6z | Notary registrations |

### Key Socrata API Usage

Query active Portland businesses:
```
https://data.oregon.gov/resource/tckn-sxa6.json?$where=city='PORTLAND'&$limit=50000
```

Query new Portland business registrations last month:
```
https://data.oregon.gov/resource/esjy-u4fc.json?$where=city='PORTLAND'
```

Query by county (Multnomah = county code for filtering):
```
https://data.oregon.gov/resource/6g49-bcrm.json?$where=county='MULTNOMAH'&$limit=50000
```

All Socrata endpoints support:
- `$limit` and `$offset` for pagination
- `$where` for SQL-like filtering
- `$select` for column selection
- `$order` for sorting
- `$group` for aggregation
- Output formats: `.json`, `.csv`, `.geojson`

---

## Multnomah County Data

Portal: `https://data.multco.us/` (Socrata-powered)
Socrata Discovery API: `https://api.us.socrata.com/api/catalog/v1?domains=data.multco.us&limit=100`

**Note:** Socrata catalog API was rate-limited during crawl. The portal is confirmed Socrata-based, meaning all datasets support JSON, CSV, GeoJSON export via `/resource/{dataset-id}.csv` pattern.

### Known High-Value Datasets

| Dataset | Socrata Endpoint Pattern | Format | Update Freq | Relevance | Dashboard Use |
|---------|-------------------------|--------|-------------|-----------|---------------|
| Multnomah County Property Tax Rolls | `data.multco.us/d/{id}` | CSV/JSON/API | Annual | HIGH | Property values, vacancy cross-ref |
| Assessment & Taxation Data | `data.multco.us/d/{id}` | CSV/JSON/API | Annual | HIGH | Tax revenue tracking |
| County Budget Data | `data.multco.us/d/{id}` | CSV/JSON/API | Annual | MEDIUM | Government spending |
| Multnomah County Employee Compensation | `data.multco.us/d/{id}` | CSV/JSON/API | Annual | LOW | Government transparency |
| Library Usage Statistics | `data.multco.us/d/{id}` | CSV/JSON/API | Monthly | LOW | Community engagement proxy |
| Health Department Data | `data.multco.us/d/{id}` | CSV/JSON/API | Varies | MEDIUM | Public health metrics |
| Homeless Population Counts (Point-in-Time) | `data.multco.us/d/{id}` | CSV/JSON/API | Annual (Jan) | HIGH | Homelessness tracking |
| Mental Health / Addiction Services | `data.multco.us/d/{id}` | CSV/JSON/API | Quarterly | MEDIUM | Social services capacity |

**To discover exact dataset IDs:** Query `https://api.us.socrata.com/api/catalog/v1?domains=data.multco.us&limit=100` or browse `https://data.multco.us/d/browse`

---

## Portland Bureau Data

### PBOT (Transportation)

Portal: `https://www.portland.gov/transportation/data`

| Dataset | URL | Format | Update Freq | Relevance | Dashboard Use |
|---------|-----|--------|-------------|-----------|---------------|
| Vision Zero Dashboard | `https://public.tableau.com/app/profile/portland.bureau.of.transportation/viz/VisionZeroDashboard_16179023789280/VisionZeroDashboard` | Tableau (interactive) | Monthly | HIGH | Traffic fatalities/injuries, crash data |
| Vision Zero Crash Data | ODOT official records (18mo lag); PPB crash investigation for interim | CSV via Tableau export | Annual (official), Monthly (PPB) | HIGH | "Is Portland safe?" — traffic deaths by mode |
| Vision Zero Injuries by Severity | Via Vision Zero Dashboard | Tableau export | Annual (2017-2025 available) | HIGH | Injury trends |
| Speed Camera Citations | Via Vision Zero Dashboard | Tableau export | Monthly | MEDIUM | Enforcement activity |
| Pothole Map | `https://www.portland.gov/transportation/data/pothole-map` | Interactive map | Real-time | MEDIUM | City responsiveness, "Is the city functional?" |
| Keep Portland Moving Map (ROW Permits) | `https://www.portland.gov/transportation/permitting/movepdx` | Interactive map | Real-time | MEDIUM | Construction activity tracking |
| Curb Ramps Map | `https://www.portland.gov/transportation/data/curb-ramps` | Interactive map | As needed | LOW | ADA compliance |
| Speed Limits Map | `https://www.portland.gov/transportation/vision-zero/speed-limit` | Interactive map | As needed | LOW | Reference |
| PBOT Equity Matrix | `https://www.portland.gov/transportation/justice/pbot-equity-matrix-0` | Interactive (census tract) | Annual | MEDIUM | Equity analysis |
| E-Scooter & Bike-Share Data | `https://public.ridereport.com/pdx` (redirects from portland.gov) | Ride Report platform | Continuous | MEDIUM | Micromobility usage, downtown activity |
| PBOT Service Requests | `https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Service_Requests/MapServer` | ArcGIS REST/GeoJSON | Daily | HIGH | Street-level conditions, city responsiveness |
| Transportation System Plan | `https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation_System_Plan/MapServer` | ArcGIS REST | As needed | LOW | Planning reference |
| Transportation (routes/infrastructure) | `https://www.portlandmaps.com/arcgis/rest/services/Public/Transportation/MapServer` | ArcGIS REST | As needed | LOW | Reference layer |

### PHB (Housing Bureau)

Portal: `https://www.portland.gov/phb/data-and-reports`

| Dataset | URL | Format | Update Freq | Relevance | Dashboard Use |
|---------|-----|--------|-------------|-----------|---------------|
| PHB Budget Performance Dashboard | `https://public.tableau.com/app/profile/portland.housing.bureau/viz/PortlandHousingBureauBudgetPerformanceMeasureDashboard/PHBPerformanceManagementDashboard` | Tableau | Quarterly | HIGH | Housing bureau effectiveness |
| Eviction Legal Defense Dashboard | `https://public.tableau.com/views/EvictionLegalDefenseDashboard/ELDDashboard` | Tableau | Monthly | HIGH | Eviction trends, tenant protection |
| Permanent Supportive Housing Dashboard | `https://public.tableau.com/app/profile/portland.housing.bureau/viz/HousingBureauPSHDashboard/PSHDashboard` | Tableau | Quarterly | HIGH | Homelessness/housing pipeline |
| COVID Emergency Rent Assistance | `https://public.tableau.com/app/profile/portland.housing.bureau/viz/COVIDEmergencyRentAssistancePrograms/Dashboard1` | Tableau | Historical (ended) | LOW | Reference only |
| State of Housing Report | `https://www.portland.gov/phb/state-of-housing-report` | PDF/Report | Annual | HIGH | Comprehensive housing metrics |
| Income/Rent Limits Calculator | `https://www.portland.gov/phb/income-rent-and-utility-limits` | Web tool | Annual (HUD updates) | MEDIUM | AMI thresholds |
| Affordable Housing Dev Pipeline | `https://www.portland.gov/phb/affordable-housing-development` | Interactive map | Quarterly | HIGH | "Is housing getting built?" |
| Opportunity Mapping | `https://www.portland.gov/phb/opportunity-mapping` | Interactive map | As needed | MEDIUM | Equity/access analysis |
| Consolidated Plan & Action Plan | `https://www.portland.gov/phb/consolidated-plan-portland-gresham-and-multnomah-county` | PDF | Annual | MEDIUM | HUD compliance, spending |
| Housing Production Work Session | `https://www.portland.gov/phb/documents/housing-production-work-session/download` | PDF | One-time (2023) | MEDIUM | Production targets |
| Residential Dev Cost Study | `https://www.portland.gov/phb/documents/residential-development-cost-study-2024/download` | PDF | One-time (2024) | HIGH | Construction cost benchmarks |
| PHB Rental Portfolio (GIS) | `https://www.portlandmaps.com/arcgis/rest/services/Public/PHB_Rental_Portfolio/MapServer` | ArcGIS REST/GeoJSON | Quarterly | HIGH | Affordable housing inventory map |

### Water Bureau

Portal: `https://www.portland.gov/water/`

| Dataset | URL | Format | Update Freq | Relevance | Dashboard Use |
|---------|-----|--------|-------------|-----------|---------------|
| Annual Water Quality Report | `https://www.portland.gov/waterqualityreport` | PDF/Web | Annual | LOW | Infrastructure health |
| Supplemental Water Quality (Nov 2025) | `https://www.portland.gov/water/drinking-water-quality/documents/supplemental-water-quality-data-november-2025/download` | PDF (298 KB) | 3x/year | LOW | Water quality metrics |
| Supplemental Water Quality (Aug 2025) | `https://www.portland.gov/water/drinking-water-quality/documents/supplemental-water-quality-data-august-2025/download` | PDF (299 KB) | 3x/year | LOW | Water quality metrics |
| Supplemental Water Quality (Apr 2025) | `https://www.portland.gov/water/drinking-water-quality/documents/supplemental-water-quality-data-april-2025/download` | PDF (297 KB) | 3x/year | LOW | Water quality metrics |
| Cryptosporidium Monthly Monitoring | `https://www.portland.gov/water/water-quality/test-results` (monthly PDFs) | PDF | Monthly | LOW | Public health |
| Water Quality Test Results Portal | `https://www.portland.gov/water/water-quality/test-results` | Web + PDF | Ongoing | LOW | 200+ contaminant tests |

**Note:** Water Bureau data is primarily PDF-based reports, not machine-readable. System stats: 2,250 mi pipe, 95M gal/day, 193K meters, 15K hydrants.

### Police Bureau (Tableau CSV Downloads)

All PPB open data is accessed through Tableau Public dashboards. CSV export available via "Download Data" tabs.

**Tableau Public Profile:** `https://public.tableau.com/app/profile/portlandpolicebureau`
**Contact:** ppbopendata@police.portlandoregon.gov

| Dataset | Tableau Public URL | Update Freq | Relevance |
|---------|-------------------|-------------|-----------|
| Monthly Reported Crime Statistics | `https://public.tableau.com/app/profile/portlandpolicebureau/viz/MonthlyReportedCrimeStatistics/MonthlyStatistics` | Monthly | HIGH |
| Reported Crime Trend Report | `https://public.tableau.com/app/profile/portlandpolicebureau/viz/ReportedCrimeTrendReport/YTDComparison` | Monthly | HIGH |
| Dispatched Calls for Service | `https://public.tableau.com/app/profile/portlandpolicebureau/viz/DispatchedCallsforService/DispatchedCalls` | Monthly | HIGH |
| Shooting Incident Statistics | `https://public.tableau.com/views/PortlandShootingIncidentStatistics/ShootingIncidentStatistics` | Monthly | HIGH |
| Gun Violence Trends Report | `https://public.tableau.com/app/profile/portlandpolicebureau/viz/GunViolenceTrendsReport/YeartoDateRollingYearStatistics` | Monthly | HIGH |
| Stolen Vehicle Statistics | `https://public.tableau.com/views/MonthlyStolenVehicleStatistics/Dashboard` | Monthly | HIGH |
| Business Districts Crime Summary | `https://public.tableau.com/views/PortlandBusinessDistrictCrime/BusinessDistricts` | Monthly | HIGH |
| Use of Force Audit Report | `https://public.tableau.com/app/profile/portlandpolicebureau/viz/ForceAuditReport/Summary` | Quarterly | MEDIUM |
| Overtime Dashboard | `https://public.tableau.com/views/OvertimeDashboard-public/OTHoursbyMonth` | Monthly | MEDIUM |

**Programmatic CSV export from Tableau Public:**
```
https://public.tableau.com/views/{WorkbookName}/{SheetName}.csv
```

**Alternative crime data:** `https://www.portlandoregon.gov/police/71978` — Monthly Neighborhood Offense Statistics (NIBRS Group A since May 2015)

---

## TriMet Transit Data

Portal: `https://developer.trimet.org/`
Authentication: Free AppID (register at developer.trimet.org)

### GTFS Static Data

| Resource | URL | Format | Update Freq | Relevance |
|----------|-----|--------|-------------|-----------|
| GTFS Schedule Data | `https://developer.trimet.org/schedule/gtfs.zip` | GTFS ZIP | Each service change (~quarterly) | HIGH |
| GTFS-RT Trip Updates | `https://developer.trimet.org/ws/V1/TripUpdate?appID={appid}` | Protocol Buffers | Real-time | MEDIUM |
| GTFS-RT Vehicle Positions | `https://developer.trimet.org/ws/V1/VehiclePosition?appID={appid}` | Protocol Buffers | Real-time | MEDIUM |
| GTFS-RT Service Alerts | `https://developer.trimet.org/ws/V1/FeedMessage?appID={appid}` | Protocol Buffers | Real-time | LOW |

### REST API Web Services

| Service | Endpoint | Format | Description | Relevance |
|---------|----------|--------|-------------|-----------|
| Arrivals V2 | `https://developer.trimet.org/ws/V2/arrivals?locIDs={stop_ids}&appID={appid}` | JSON/XML | Real-time arrival predictions by stop | HIGH |
| Trip Planner | `https://developer.trimet.org/ws/V1/trips/tripplanner?fromPlace={lat,lng}&toPlace={lat,lng}&appID={appid}` | JSON/XML | Route planning | LOW |
| Stops | `https://developer.trimet.org/ws/V1/stops?ll={lat},{lng}&feet={radius}&appID={appid}` | JSON/XML | Stop locations and details | MEDIUM |
| Routes | `https://developer.trimet.org/ws/V1/routeConfig?appID={appid}` | JSON/XML | Route configurations | MEDIUM |
| Detours | `https://developer.trimet.org/ws/V1/detours?appID={appid}` | JSON/XML | Active service detours | LOW |
| Vehicles | `https://developer.trimet.org/ws/v2/vehicles?appID={appid}` | JSON/XML | Vehicle locations | MEDIUM |

### Ridership Data (Historical)

| Resource | URL | Format | Update Freq | Relevance |
|----------|-----|--------|-------------|-----------|
| TriMet Ridership Statistics | `https://trimet.org/about/ridership.htm` | Web/PDF | Quarterly | HIGH |
| Annual Ridership Data | `https://trimet.org/about/pdf/trimetridership.pdf` | PDF | Annual | HIGH |
| NTD Transit Agency Profile | `https://www.transit.dot.gov/ntd/transit-agency-profiles/trimet` | CSV | Annual | HIGH |

**Dashboard use:** "Is downtown coming back?" — ridership trends as foot traffic proxy, route-level recovery

---

## Metro Regional Data

Portal: `https://www.oregonmetro.gov/tools-partners/data-resource-center`
RLIS Discovery: `https://rlisdiscovery.oregonmetro.gov/`
Socrata Discovery: `https://api.us.socrata.com/api/catalog/v1?domains=data.oregonmetro.gov&limit=100`

### RLIS (Regional Land Information System)

RLIS is the primary GIS data repository for the Portland metro region. Subscription-based for full access, many layers freely available.

| Dataset | Access Method | Format | Update Freq | Relevance | Dashboard Use |
|---------|--------------|--------|-------------|-----------|---------------|
| Taxlots (Regional) | RLIS subscription / ArcGIS REST | Shapefile/GDB/GeoJSON | Quarterly | HIGH | Property analysis across metro |
| Zoning (Regional) | RLIS subscription / ArcGIS REST | Shapefile/GDB | As amended | HIGH | Development potential |
| Urban Growth Boundary (UGB) | Free download via Metro | Shapefile/GeoJSON | As amended | HIGH | Growth boundary tracking |
| Building Footprints (Regional) | RLIS subscription | Shapefile/GDB | Annual | MEDIUM | Building stock analysis |
| Transit Routes & Stops | RLIS / TriMet GTFS | Shapefile/GTFS | Quarterly | MEDIUM | Transit coverage |
| Bike Network | RLIS subscription | Shapefile | Annual | LOW | Active transport |
| Street Centerlines | RLIS subscription | Shapefile | Monthly | MEDIUM | Address matching |
| Aerial Photography | RLIS subscription | GeoTIFF/MrSID | Annual | LOW | Visual reference |
| Natural Areas | Free via Metro | Shapefile | As needed | LOW | Parks/environment |
| Census Geography (Tracts/Blocks) | Free via Metro | Shapefile | Decennial | MEDIUM | Demographic analysis |

### Metro Open Data (Socrata)

| Dataset | Expected Endpoint | Format | Update Freq | Relevance |
|---------|------------------|--------|-------------|-----------|
| Regional Population Estimates | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Annual | HIGH |
| Housing Production Data | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Annual | HIGH |
| Regional Employment Data | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Quarterly | HIGH |
| Urban Growth Report Data | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Every 5 years | MEDIUM |
| Solid Waste/Recycling Data | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Annual | LOW |
| Parks & Natural Areas Visitors | `data.oregonmetro.gov/d/{id}` | CSV/JSON/API | Annual | LOW |

**Note:** Exact Socrata dataset IDs need discovery via catalog API or browsing `data.oregonmetro.gov`.

### Metro GIS REST Services

| Service | URL | Format | Relevance |
|---------|-----|--------|-----------|
| RLIS ArcGIS Server | `https://gis.oregonmetro.gov/arcgis/rest/services/` | ArcGIS REST | HIGH |
| RLIS Discovery Portal | `https://rlisdiscovery.oregonmetro.gov/` | Web catalog | HIGH |
| Metro Maps (public viewer) | `https://gis.oregonmetro.gov/metromap/` | Web map | LOW |

---

## Deep Crawl Notes (2026-03-15)

### Successfully Crawled
- `portland.gov/transportation/data` — full PBOT data inventory
- `portland.gov/phb/data-and-reports` — all Tableau dashboard URLs for housing
- `portland.gov/police/open-data` + 6 sub-pages — all Tableau workbook URLs extracted
- `portland.gov/police/open-data/reported-crime-data` — Tableau URLs for crime dashboards
- `portland.gov/police/open-data/police-dispatched-calls` — dispatch dashboard URL
- `portland.gov/police/open-data/shooting-incident-statistics` — shooting + gun violence URLs
- `portland.gov/police/open-data/stolen-vehicle-statistics` — stolen vehicle dashboard URL
- `portland.gov/police/open-data/business-districts-crime-summary` — business district crime URL
- `portland.gov/police/open-data/ppb-use-force-dashboard` — use of force URL
- `portland.gov/police/open-data/police-overtime` — overtime dashboard URL
- `portland.gov/water/water-quality/test-results` — water quality downloads
- `portland.gov/water/about-portlands-water-system` — system statistics
- `portland.gov/transportation/vision-zero/vision-zero-dashboard` — crash data sources

### Rate-Limited / Needs Follow-Up
- `data.multco.us` — Socrata portal confirmed but catalog not fully enumerated
- `developer.trimet.org/ws_docs.htm` — API docs not fully crawled; endpoints documented from known docs
- `data.oregonmetro.gov` — Socrata catalog not enumerated
- `rlisdiscovery.oregonmetro.gov` — RLIS layer catalog not fully crawled
- `public.tableau.com/app/profile/portlandpolicebureau` — full workbook list not retrieved
- `public.ridereport.com/pdx` — e-scooter/bikeshare portal (redirects from portland.gov)

### Recommended Follow-Up Commands
```bash
# Enumerate Multnomah County Socrata datasets
curl -s "https://api.us.socrata.com/api/catalog/v1?domains=data.multco.us&limit=100" | python3 -m json.tool

# Enumerate Metro Socrata datasets
curl -s "https://api.us.socrata.com/api/catalog/v1?domains=data.oregonmetro.gov&limit=100" | python3 -m json.tool

# Enumerate RLIS GIS layers
curl -s "https://gis.oregonmetro.gov/arcgis/rest/services/?f=json" | python3 -m json.tool

# Get full TriMet API documentation
curl -s "https://developer.trimet.org/ws_docs.htm"
```

---

## ADDITIONAL DATA SOURCES — Compiled 2026-03-15

> **Note:** WebSearch and WebFetch were unavailable during this compilation. All URLs below are based on
> known data sources as of early 2026. URLs should be verified before integration. Sources marked with
> `[VERIFY URL]` especially need confirmation.

---

### 1. Portland City Bureau Data (NOT already listed above)

#### Portland Parks & Recreation
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| PP&R Annual Report / Dashboard | `https://www.portland.gov/parks/data` | Park usage, program enrollment, facility utilization, maintenance backlogs | Free | Web/PDF | MEDIUM — livability, public amenity health |
| Parks System Development Charges | `https://www.portland.gov/parks/sdc` | SDC collections by year, park investment pipeline | Free | PDF reports | MEDIUM — growth/investment indicator |
| Community Gardens Waitlist Data | `https://www.portland.gov/parks/community-gardens` | Waitlist length, garden utilization | Free | Web | LOW — community engagement proxy |
| Urban Forestry Tree Inventory | `https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Street_Tree_Inventory_Active/MapServer` | Street tree locations, species, condition | Free | ArcGIS REST | LOW — environmental quality |
| Parks Capital Improvement Program | `https://www.portland.gov/parks/budget` | Capital project spending, deferred maintenance | Free | PDF/budget docs | MEDIUM — infrastructure investment |

#### Portland Fire & Rescue
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| PF&R Annual Report | `https://www.portland.gov/fire/annual-report` | Response times, call volumes, fire incidents, EMS data | Free | PDF | HIGH — "Is the city functional?" response times |
| PF&R Response Time Data | `https://www.portland.gov/fire/data` [VERIFY URL] | Average response times by station/district | Free | PDF/Web | HIGH — public safety responsiveness |
| NFIRS (National Fire Incident Reporting) | `https://www.usfa.fema.gov/nfirs/` | Fire incident data reported by PF&R to federal system | Free | Bulk download | MEDIUM — fire incident trends |
| Portland BOEC (911 Center) | `https://www.portland.gov/911/data` [VERIFY URL] | 911 call volumes, answer times, dispatch times | Free | Web/reports | HIGH — emergency response health |

#### Portland Bureau of Environmental Services (BES)
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| BES Watershed Health Reports | `https://www.portland.gov/bes/watershed-health` | Water quality monitoring, watershed condition | Free | PDF/Web | LOW — environmental quality |
| BES Stormwater Management Data | `https://www.portlandmaps.com/arcgis/rest/services/Public/BES_Utilities_Storm_Greenstreets/MapServer` | Green infrastructure locations, stormwater facilities | Free | ArcGIS REST | LOW — infrastructure |
| BES Surface Water Monitoring | `https://www.portlandmaps.com/arcgis/rest/services/Public/BES_Surface_Water_Monitoring_Locations/MapServer` | Water quality sampling sites and results | Free | ArcGIS REST | LOW — environmental health |
| Combined Sewer Overflow (CSO) Reports | `https://www.portland.gov/bes/cso` [VERIFY URL] | CSO event frequency, Big Pipe project outcomes | Free | PDF | LOW — infrastructure success story |

#### Portland Bureau of Planning & Sustainability (BPS)
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| Portland Climate Action Plan Dashboard | `https://www.portland.gov/bps/climate-action/climate-action-plan-dashboard` [VERIFY URL] | GHG emissions, energy use, climate metrics | Free | Web/Tableau | MEDIUM — sustainability metrics |
| Buildable Lands Inventory (BLI) | `https://gis-pdx.opendata.arcgis.com/` (BLI Model Development Capacity) | Developable land capacity by zone | Free | GeoJSON/CSV | HIGH — housing supply pipeline |
| Portland Eco-Districts Data | `https://www.portland.gov/bps/ecodistricts` [VERIFY URL] | Neighborhood sustainability metrics | Free | Web | LOW |
| Gentrification/Displacement Risk Maps | `https://www.portland.gov/bps/planning/adap` [VERIFY URL] | Displacement risk by census tract | Free | Web/GIS | MEDIUM — equity, demographic shifts |
| Portland Comprehensive Plan Data | `https://www.portland.gov/bps/comp-plan` | Growth scenarios, land use designations | Free | PDF/GIS | MEDIUM — planning context |

#### City Budget & Finance
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| City of Portland Budget Documents | `https://www.portland.gov/cbo/budget` | Annual budget by bureau, revenue sources, tax receipts | Free | PDF | HIGH — fiscal health |
| Portland Arts Tax Revenue | `https://www.portland.gov/revenue/arts-tax` | Arts tax collections, compliance rates | Free | Web/reports | MEDIUM — revenue indicator, population proxy |
| Portland Business License Tax Revenue | `https://www.portland.gov/revenue/business-tax` | Business tax filings, revenue by category | Free | PDF/annual reports | HIGH — business activity |
| Supportive Housing Services (SHS) Tax Revenue | `https://www.portland.gov/revenue/shs-tax` [VERIFY URL] | Metro SHS tax collections for homeless services | Free | Web/reports | HIGH — homelessness funding |
| Portland Clean Energy Fund (PCEF) | `https://www.portland.gov/bps/cleanenergy` | PCEF surcharge revenue, grants awarded | Free | Web/reports | MEDIUM — climate investment |
| City Auditor Reports | `https://www.portland.gov/auditor/audit-reports` | Performance audits of city bureaus | Free | PDF | MEDIUM — government effectiveness |
| Portland Revenue Division Data | `https://www.portland.gov/revenue/data` [VERIFY URL] | Tax collection data, compliance stats | Free | PDF/Web | HIGH — fiscal health |

#### PDX Reporter / 311 Service Requests
| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| PDX Reporter (Portland 311) | `https://pdxreporter.org/` | Graffiti, abandoned vehicles, potholes, illegal camping, dumping | Free | App/Web (reports are public) | HIGH — livability, visible disorder |
| PDX Reporter Data Feed | Via PBOT Service Requests MapServer (already listed) + possibly Socrata | Geocoded service requests with status | Free | ArcGIS REST / API | HIGH — city responsiveness metrics |

---

### 2. Multnomah County Data (NOT already listed above)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **Multnomah County Assessment & Taxation** | `https://multcoproptax.com/` | Property values, tax statements, assessed values by parcel | Free | Web lookup / bulk via data.multco.us | HIGH — property value trends, tax base |
| **Multnomah County DA Case Data** | `https://www.mcda.us/` [VERIFY URL] | Prosecution rates, case outcomes, diversion programs | Free | Annual reports (PDF) | HIGH — criminal justice pipeline, "Is Portland safe?" |
| **Multnomah County Circuit Court** | `https://www.courts.oregon.gov/courts/multnomah` | Case filings, dispositions (evictions, criminal, civil) | Free | Oregon eCourt / OJIN lookup | HIGH — eviction trends, civil/criminal caseload |
| **Joint Office of Homeless Services (JOHS)** | `https://www.multco.us/johs` | Shelter capacity, placements, homeless services data | Free | Web/PDF reports | HIGH — homelessness services tracking |
| **JOHS System Performance Dashboard** | `https://public.tableau.com/` (JOHS profile) [VERIFY URL] | HMIS data: entries/exits from homelessness, length of time homeless | Free | Tableau | HIGH — homelessness outcomes |
| **Point-in-Time Count** | `https://www.multco.us/johs/point-time-counts` [VERIFY URL] | Biennial unsheltered/sheltered count (HUD-mandated) | Free | PDF/Web | HIGH — headline homelessness number |
| **Multnomah County Health Department** | `https://www.multco.us/health` | Communicable disease data, vital statistics, environmental health | Free | Web/PDF | MEDIUM — public health |
| **Community Health Assessment (CHA)** | `https://www.multco.us/health/community-health-data` [VERIFY URL] | County-wide health indicators, social determinants | Free | PDF/interactive | MEDIUM — health equity |
| **Multnomah County Library Data** | `https://multcolib.org/about/statistics` [VERIFY URL] | Circulation, visits, program attendance, card registrations | Free | Web/annual report | LOW — community engagement proxy |
| **Multnomah County Elections** | `https://www.multco.us/elections` | Voter registration, turnout, ballot measure results | Free | Web/PDF | MEDIUM — civic engagement |
| **SHS (Supportive Housing Services) Dashboard** | `https://www.multco.us/multnomah-county-supportive-housing-services` [VERIFY URL] | Spending, placements, shelter beds from Metro SHS tax | Free | Tableau/Web | HIGH — homelessness spending and outcomes |
| **Multnomah County Budget** | `https://www.multco.us/budget` | County spending by department, revenue sources | Free | PDF | MEDIUM — fiscal health |

---

### 3. Real Estate & Commercial Data (Free/Public Sources)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **CBRE Quarterly Market Reports** | `https://www.cbre.com/insights/figures/portland-office-figures` | Office vacancy, absorption, asking rents for Portland MSA | Free | PDF download (quarterly) | HIGH — "Is downtown coming back?" commercial health |
| **Colliers Quarterly Reports** | `https://www.colliers.com/en-us/research/portland` | Office, industrial, retail vacancy and rents | Free | PDF download (quarterly) | HIGH — commercial real estate health |
| **Cushman & Wakefield MarketBeat** | `https://www.cushmanwakefield.com/en/united-states/insights/us-marketbeats/portland-marketbeat` | Office, industrial, multifamily metrics | Free | PDF download (quarterly) | HIGH — commercial vacancy, rents |
| **JLL Research** | `https://www.us.jll.com/en/trends-and-insights/research/office-market-statistics` | Office market stats including Portland | Free | PDF/interactive | HIGH — office market health |
| **Kidder Mathews Reports** | `https://kidder.com/market-research/` | Portland office, industrial, retail, multifamily reports | Free | PDF (quarterly) | HIGH — local brokerage with deep Portland data |
| **NAI Elliott Reports** | `https://www.naielliott.com/research/` [VERIFY URL] | Portland commercial RE reports | Free | PDF | MEDIUM — local market perspective |
| **FRED (Federal Reserve Economic Data)** | `https://fred.stlouisfed.org/tags/series?t=portland` | Housing price index, employment, GDP, CPI for Portland MSA | Free | API + CSV | HIGH — economic indicators |
| **Redfin Data Center** | `https://www.redfin.com/news/data-center/` | Home prices, inventory, days on market by metro/zip/neighborhood | Free | CSV download (weekly/monthly) | HIGH — residential real estate health |
| **Realtor.com Research** | `https://www.realtor.com/research/data/` | Inventory, median listing price, days on market | Free | CSV download (monthly) | HIGH — housing market |
| **FHFA House Price Index** | `https://www.fhfa.gov/data/hpi` | House Price Index for Portland MSA | Free | CSV/API | HIGH — home price trends |
| **CoreLogic (limited free data)** | `https://www.corelogic.com/intelligence/` | Home price insights, foreclosure data (some free reports) | Free (reports) / Paid (raw data) | PDF/Web | MEDIUM — foreclosure trends |
| **ATTOM Data (limited free)** | `https://www.attomdata.com/` | Foreclosure filings, home equity, property tax data | Free (reports) / Paid ($) | PDF/API | MEDIUM — distressed property trends |

---

### 4. Economic Data (NOT already listed)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **FRED - Portland MSA Series** | `https://fred.stlouisfed.org/categories/30280` | GDP, employment, unemployment, CPI, housing starts for Portland-Vancouver-Hillsboro MSA | Free | API (`api.stlouisfed.org/fred/`) + CSV | HIGH — comprehensive economic indicators |
| **Oregon Office of Economic Analysis** | `https://www.oregon.gov/das/OEA` | State economist forecasts, revenue forecasts, economic/demographic projections | Free | PDF/Web | HIGH — state economic outlook, Portland-relevant |
| **Oregon Employment Department - QualityInfo** | `https://www.qualityinfo.org/` | Employment, wages, industry data by county/MSA; QCEW data | Free | Web/CSV download | HIGH — local labor market |
| **Oregon Employment Dept - Local Area Unemployment** | `https://www.qualityinfo.org/data` | Monthly unemployment rate for Portland MSA, Multnomah County | Free | CSV/Web | HIGH — jobs indicator |
| **Prosper Portland** | `https://prosperportland.us/data-reports/` [VERIFY URL] | Urban renewal area data, TIF revenues, business loans, economic development spending | Free | PDF/Web | HIGH — downtown/neighborhood investment |
| **Prosper Portland Annual Report** | `https://prosperportland.us/annual-report/` [VERIFY URL] | Economic development outcomes, business starts, loan portfolio | Free | PDF/Web | HIGH — "Is Portland open for business?" |
| **Portland Business Alliance** | `https://portlandalliance.com/` | Downtown Portland economic reports, clean & safe district data | Free (some) / Membership | PDF/Web | HIGH — downtown health indicators |
| **Portland Business Alliance Clean & Safe** | `https://downtownportland.org/` [VERIFY URL] | Downtown foot traffic counts, safety incidents, cleanliness metrics | Free | PDF/quarterly reports | HIGH — "Is downtown coming back?" |
| **Travel Portland** | `https://www.travelportland.com/industry/research/` [VERIFY URL] | Tourism data: hotel occupancy, visitor spending, convention bookings | Free | PDF | HIGH — tourism recovery indicator |
| **Portland Region Visitor Statistics** | Via Travel Portland / Dean Runyan Associates | Annual visitor volume, spending by category | Free | PDF | HIGH — economic vitality |
| **Smith Travel Research (STR) - Free Summaries** | Via Travel Portland or PBA reports | Hotel occupancy, ADR, RevPAR for Portland market | Free (summaries) / Paid (raw) | PDF | HIGH — hotel market health |
| **BEA Regional GDP** | `https://www.bea.gov/data/gdp/gdp-metropolitan-area` | GDP for Portland-Vancouver-Hillsboro MSA | Free | CSV/API | HIGH — overall economic output |
| **BEA Personal Income** | `https://www.bea.gov/data/income-saving/personal-income-county-metro-and-other-areas` | Per capita personal income for Portland MSA | Free | CSV/API | HIGH — income trends |
| **Small Business Administration (SBA) Loans** | `https://data.sba.gov/` | SBA loan approvals by zip code (7(a), 504, PPP) | Free | CSV/API (Socrata) | MEDIUM — small business health |
| **FDIC Summary of Deposits** | `https://www.fdic.gov/analysis/quarterly-banking-profile/fdic-quarterly/` | Bank branch deposits by county/city | Free | CSV | MEDIUM — financial health proxy |
| **Oregon Liquor & Cannabis Commission (OLCC)** | `https://www.oregon.gov/olcc/marijuana/pages/marijuana-market-data.aspx` | Cannabis sales data by county/city | Free | CSV/PDF | MEDIUM — tax revenue, retail activity |
| **Port of Portland** | `https://www.portofportland.com/Trade-Statistics` | Cargo volumes, air passenger counts (PDX airport) | Free | PDF/Web | HIGH — economic/recovery indicator |
| **PDX Airport Passenger Statistics** | `https://www.portofportland.com/Aviation-Statistics` [VERIFY URL] | Monthly passenger enplanements, airline market share | Free | PDF | HIGH — "Is Portland coming back?" travel proxy |

---

### 5. Safety & Livability (NOT already listed)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **FBI UCR / NIBRS Data** | `https://crime-data-explorer.fr.cloud.gov/` | FBI Crime Data Explorer — Portland PD reported crime (national comparison) | Free | API + CSV | HIGH — national benchmarking of crime |
| **Oregon Criminal Justice Commission** | `https://www.oregon.gov/cjc/data` [VERIFY URL] | State criminal justice data, recidivism, prison population | Free | Web/PDF | MEDIUM — criminal justice outcomes |
| **Oregon Judicial Department** | `https://www.courts.oregon.gov/about/Pages/reports-measures.aspx` | Court caseload data: filings, dispositions, clearance rates | Free | PDF | MEDIUM — justice system capacity |
| **OregonLive / Oregonian Crime Data** | Various | Investigative data projects on Portland crime | Free | Web | LOW — media analysis |
| **Mapping Police Violence** | `https://mappingpoliceviolence.org/` | Police use of force incidents (includes Portland) | Free | CSV | LOW — accountability |
| **Vera Institute — Incarceration Trends** | `https://trends.vera.org/` | Jail/prison population for Multnomah County | Free | CSV/interactive | MEDIUM — justice system |
| **Eviction Lab (Princeton)** | `https://evictionlab.org/` | Eviction filings and rates for Portland/Multnomah County | Free | CSV/API | HIGH — housing stability |
| **HUD Continuum of Care (CoC) Data** | `https://www.hudexchange.info/programs/coc/` | Point-in-Time counts, Housing Inventory Count, system performance | Free | CSV/Excel | HIGH — official homelessness data |
| **HUD Annual Homeless Assessment Report** | `https://www.huduser.gov/portal/sites/default/files/pdf/AHAR-data.html` [VERIFY URL] | National/CoC-level homelessness data | Free | Excel | HIGH — homelessness trends |
| **HMIS Data (via JOHS)** | `https://www.multco.us/johs` | Homeless Management Information System entries, exits, demographics | Free (aggregated) | Web/Tableau | HIGH — homelessness flow data |
| **National Neighborhood Indicators Partnership** | `https://www.neighborhoodindicators.org/` | Cross-city neighborhood health indicators | Free | Web | LOW — benchmarking |
| **Portland Insights (City Auditor Surveys)** | `https://www.portland.gov/auditor/community-survey` [VERIFY URL] | Resident satisfaction surveys: safety, livability, services | Free | PDF/Web | HIGH — subjective quality of life |

---

### 6. Education Data

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **Portland Public Schools (PPS) Enrollment** | `https://www.pps.net/Page/2037` [VERIFY URL] | Annual enrollment by school, grade, demographics | Free | PDF/Excel | HIGH — population indicator, family retention |
| **PPS Budget Documents** | `https://www.pps.net/budget` [VERIFY URL] | School district budget, revenue, staffing | Free | PDF | MEDIUM — public investment |
| **Oregon Dept of Education (ODE) Data** | `https://www.oregon.gov/ode/reports-and-data` | School enrollment, graduation rates, test scores, demographics (all Oregon districts) | Free | CSV/Excel download | HIGH — education outcomes |
| **ODE School Report Cards** | `https://www.ode.state.or.us/data/reportcard/` [VERIFY URL] | Individual school performance metrics | Free | Web/CSV | MEDIUM — school quality |
| **National Center for Education Statistics (NCES)** | `https://nces.ed.gov/ccd/schoolsearch/` | Enrollment, demographics, free/reduced lunch for all PPS schools | Free | CSV/API | HIGH — school demographics, poverty proxy |
| **IPEDS (Higher Ed Enrollment)** | `https://nces.ed.gov/ipeds/` | Enrollment at PSU, UP, Reed, Lewis & Clark, PCC, OHSU | Free | CSV/API | MEDIUM — higher ed enrollment trends |
| **PSU Enrollment Data** | `https://www.pdx.edu/institutional-research/enrollment-data` [VERIFY URL] | PSU enrollment trends, retention, demographics | Free | Web/PDF | MEDIUM — anchor institution health |
| **PCC Enrollment Data** | `https://www.pcc.edu/institutional-effectiveness/` [VERIFY URL] | Portland Community College enrollment, completion | Free | Web/PDF | MEDIUM — workforce development |

---

### 7. Health & Demographics

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **Oregon Health Authority (OHA) Data** | `https://www.oregon.gov/oha/PH/DISEASESCONDITIONS/Pages/index.aspx` | Communicable disease, vital statistics, substance abuse, overdose data | Free | Web/PDF/CSV | HIGH — public health, overdose crisis |
| **OHA Oregon Drug Overdose Dashboard** | `https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/SUBSTANCEUSE/Pages/index.aspx` [VERIFY URL] | Overdose deaths, naloxone distribution, Measure 110 data | Free | Tableau/Web | HIGH — drug crisis indicator |
| **County Health Rankings** | `https://www.countyhealthrankings.org/explore-health-rankings/oregon/multnomah` | Health outcomes, health behaviors, clinical care, social/economic factors | Free | CSV/Excel | HIGH — comprehensive health benchmarking |
| **Oregon Vital Statistics** | `https://www.oregon.gov/oha/PH/BIRTHDEATHCERTIFICATES/VITALSTATISTICS/Pages/index.aspx` | Births, deaths, cause of death, life expectancy by county | Free | PDF/tables | MEDIUM — demographic trends |
| **CDC WONDER** | `https://wonder.cdc.gov/` | Mortality data (including drug overdose) by county | Free | Web query tool | MEDIUM — mortality comparison |
| **CDC PLACES** | `https://www.cdc.gov/places/` | Health estimates at census tract level for Portland | Free | CSV/API/GIS | HIGH — neighborhood-level health data |
| **SAMHSA Treatment Locator** | `https://findtreatment.gov/` | Substance abuse treatment facility data | Free | API/CSV | LOW — treatment capacity |
| **Oregon PDMP (Prescription Drug Monitoring)** | `https://www.oregon.gov/oha/PH/PREVENTIONWELLNESS/SAFELIVING/PDMP/Pages/index.aspx` | Prescription opioid dispensing data by county | Free (aggregate reports) | PDF | MEDIUM — opioid crisis tracking |
| **PSU Population Research Center** | `https://www.pdx.edu/population-research/` | Annual population estimates for Oregon cities/counties (official state estimates) | Free | PDF/Excel | HIGH — gold standard Portland population estimates |
| **PSU Population Forecasts** | `https://www.pdx.edu/population-research/population-forecasts` [VERIFY URL] | Long-range population forecasts by county | Free | PDF/Excel | HIGH — growth trajectory |

---

### 8. Transportation (NOT already listed)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **PBOT Bike Counts (Eco-Counter)** | `https://www.portland.gov/transportation/bicycles/bike-count-data` [VERIFY URL] | Automated bicycle counter data from key bridges and paths | Free | CSV/Web | HIGH — active transportation trends |
| **PBOT Eco-Visio / Eco-Counter Portal** | `https://www.eco-visio.net/` (Portland instance) [VERIFY URL] | Real-time and historical bike/ped counter data | Free | Web (may need login) | HIGH — foot/bike traffic proxy |
| **ODOT TransGIS** | `https://gis.odot.state.or.us/transgis/` | Traffic volumes (AADT), crash data, highway data for Portland area | Free | GIS/Web | HIGH — traffic volume trends |
| **ODOT Crash Data System** | `https://www.oregon.gov/odot/Data/Pages/Crash.aspx` | All reported traffic crashes in Oregon including Portland | Free | CSV/Web query | HIGH — "Is Portland safe?" traffic safety |
| **ODOT Traffic Counting Program** | `https://www.oregon.gov/odot/Data/Pages/Traffic-Counting.aspx` | Continuous and short-duration traffic counts on state highways | Free | CSV/Web | MEDIUM — traffic volume trends |
| **ODOT TransInfo** | `https://www.oregon.gov/odot/Data/Pages/index.aspx` | Comprehensive transportation data portal (crashes, traffic, bridges) | Free | Various | MEDIUM — reference |
| **National Transit Database (NTD) - TriMet** | `https://www.transit.dot.gov/ntd/data-product/monthly-module-adjusted-data-release` | Monthly ridership for all TriMet modes (bus, MAX, WES, streetcar) | Free | Excel/CSV | HIGH — transit recovery tracking |
| **Portland Streetcar Data** | `https://portlandstreetcar.org/about/ridership` [VERIFY URL] | Streetcar ridership by line and stop | Free | Web/PDF | MEDIUM — downtown activity proxy |
| **Biketown (Lyft) Ridership** | `https://www.biketownpdx.com/system-data` [VERIFY URL] | Bike-share trip data (origin/destination, duration) | Free | CSV | MEDIUM — micro-mobility |
| **PBOT Parking Data** | `https://www.portland.gov/transportation/parking/data` [VERIFY URL] | Meter revenue, occupancy, citation data | Free | Web/PDF | MEDIUM — downtown activity proxy |
| **Waze for Cities (CCP)** | `https://www.waze.com/ccp` | Traffic jams, incidents, road closures (if Portland participates) | Free (partner cities) | API/dashboard | MEDIUM — real-time traffic conditions |
| **Replica (StreetLight Data)** | `https://www.replicahq.com/` | Trip modeling, origin-destination data from mobile/GPS | Subscription ($$$) | API/dashboard | HIGH — comprehensive mobility data |

---

### 9. Private / Subscription Data Sources

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **Placer.ai** | `https://www.placer.ai/` | Foot traffic to any POI, visitor demographics, trade areas, cross-shopping | $1,000-$5,000+/mo (varies by tier) | Dashboard + API | HIGH — downtown foot traffic, retail health |
| **CoStar** | `https://www.costar.com/` | Commercial RE: vacancy, rents, absorption, cap rates, tenant data | ~$500-$2,000+/mo per market | Dashboard + API | HIGH — commercial vacancy, office market |
| **SafeGraph (now Dewey)** | `https://www.deweydata.io/` (via Dewey) or `https://www.safegraph.com/` | POI foot traffic, spend data, mobility patterns | $1,000-$10,000+/mo | API + bulk download | HIGH — foot traffic alternative to Placer |
| **Advan Research** | `https://www.advanresearch.com/` | Foot traffic from mobile device data, daily granularity | Subscription (custom pricing) | API + CSV | HIGH — foot traffic |
| **Gravy Analytics** | `https://gravyanalytics.com/` | Location intelligence, foot traffic, audience insights | Subscription (custom) | API | MEDIUM — foot traffic |
| **Unacast** | `https://www.unacast.com/` | Foot traffic, migration patterns, cross-visitation | Subscription (custom) | API + dashboard | MEDIUM — foot traffic + migration |
| **Near Intelligence** | `https://near.com/` | People movement data, audience intelligence | Subscription (custom) | API + dashboard | MEDIUM — mobility patterns |
| **Orbital Insight** | `https://orbitalinsight.com/` | Satellite imagery analytics: parking lot fill rates, construction activity | Subscription ($$$) | API + dashboard | MEDIUM — alternative vacancy/activity indicator |
| **Spectus (formerly Cuebiq)** | `https://spectus.ai/` | Privacy-first mobility data, foot traffic | Subscription + academic program | API | MEDIUM — foot traffic |
| **Precisely** | `https://www.precisely.com/` | Address data, demographics, foot traffic, POI data | Subscription (custom) | API | LOW — enrichment data |
| **Lightcast (formerly Emsi/Burning Glass)** | `https://lightcast.io/` | Labor market data: job postings, skills demand, talent supply for Portland MSA | Subscription ($10K+/yr) | Dashboard + API | HIGH — labor market health |
| **Revelio Labs** | `https://www.reveliolabs.com/` | Workforce intelligence: hiring, attrition, remote work trends by company/metro | Subscription (custom) | API + dashboard | MEDIUM — workforce trends |
| **Crunchbase** | `https://www.crunchbase.com/` | Startup funding, company data for Portland tech ecosystem | Free (limited) / $29-$49/mo (Pro) | API + CSV | MEDIUM — tech ecosystem health |
| **PitchBook** | `https://pitchbook.com/` | VC/PE investment data for Portland companies | Subscription ($$$) | Dashboard | MEDIUM — investment flows |
| **Yelp Fusion API** | `https://www.yelp.com/developers` | Business listings, reviews, ratings, open/closed status | Free (5,000 calls/day) | API | MEDIUM — business churn, sentiment |
| **Google Maps Platform — Places API** | `https://developers.google.com/maps/documentation/places/web-service` | Business listings, ratings, popular times, open/closed | $0.017-0.032/call | API | MEDIUM — business activity |

---

### 10. Academic & Research

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **PSU Population Research Center** | `https://www.pdx.edu/population-research/` | Official Oregon population estimates (certified annually), housing unit estimates | Free | PDF/Excel | HIGH — authoritative population data |
| **PSU Northwest Economic Research Center (NERC)** | `https://www.pdx.edu/nerc/` [VERIFY URL] | Regional economic analysis, housing studies, economic impact studies | Free | PDF/Web | HIGH — local economic research |
| **PSU Homelessness Research & Action Collaborative** | `https://www.pdx.edu/homelessness/` | Homelessness research, policy analysis | Free | PDF/Web | HIGH — evidence-based homelessness analysis |
| **PSU Institute of Portland Metropolitan Studies** | `https://www.pdx.edu/ims/` [VERIFY URL] | Regional livability research, civic engagement studies | Free | PDF/Web | MEDIUM — civic health research |
| **UO Oregon Economic Forum** | `https://www.uoregon.edu/oregon-economic-forum` [VERIFY URL] | State economist Tim Duy's economic analysis and forecasts | Free | Web/PDF | HIGH — authoritative economic outlook |
| **UO Institute for Policy Research & Engagement** | `https://ipre.uoregon.edu/` [VERIFY URL] | Community development research, housing studies | Free | PDF | MEDIUM — policy research |
| **ECONorthwest** | `https://econw.com/` | Portland-area economic consulting: housing needs analyses, fiscal impact studies | Free (published reports) | PDF | HIGH — frequent Portland policy research |
| **Brookings Institution — Metro Monitor** | `https://www.brookings.edu/interactives/metro-monitor/` [VERIFY URL] | Portland MSA economic performance vs. peer metros | Free | Web/interactive | HIGH — national benchmarking |
| **Urban Institute** | `https://www.urban.org/` | Housing, poverty, criminal justice data/research relevant to Portland | Free | Web/PDF | MEDIUM — policy research |
| **National League of Cities** | `https://www.nlc.org/resource/` | City fiscal health data, comparative city metrics | Free | PDF/Web | LOW — benchmarking |
| **ICMA (International City/County Management)** | `https://icma.org/survey-research` | City performance benchmarking data | Membership | Web | LOW — benchmarking |

---

### 11. Federal Data Sources (Portland MSA-Specific)

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **FRED - Portland-Specific Series** | See key series IDs below | Dozens of Portland MSA economic time series | Free | API (`api.stlouisfed.org/fred/series/observations?series_id=XXX&api_key=YYY`) | HIGH |
| **BEA Regional Accounts** | `https://apps.bea.gov/regional/` | GDP, personal income, employment by MSA | Free | API + CSV | HIGH |
| **HUD Fair Market Rents** | `https://www.huduser.gov/portal/datasets/fmr.html` | Fair Market Rents for Portland MSA by bedroom count | Free | CSV/API | HIGH — housing affordability |
| **HUD Income Limits** | `https://www.huduser.gov/portal/datasets/il.html` | Area Median Income for Portland MSA | Free | CSV/API | HIGH — affordability thresholds |
| **USPS Change of Address (COA) Data** | Via HUD USPS Vacancy dataset (already listed) | Move-in/move-out by zip code | Free | CSV | Already listed |
| **EPA Environmental Data** | `https://www.epa.gov/enviro/` | Air quality, Superfund sites, toxic releases for Portland area | Free | API/CSV | LOW — environmental quality |
| **AirNow API** | `https://www.airnow.gov/` and `https://docs.airnowapi.org/` | Real-time and historical air quality (AQI) for Portland | Free | API | MEDIUM — livability (smoke season) |
| **USDA Food Access Research Atlas** | `https://www.ers.usda.gov/data-products/food-access-research-atlas/` | Food desert/food access data at census tract level | Free | CSV/GIS | MEDIUM — equity, livability |
| **FEMA National Risk Index** | `https://hazards.fema.gov/nri/` | Natural hazard risk scores by census tract | Free | CSV/GIS | LOW — risk context |

#### Key FRED Series IDs for Portland MSA

```
ORPDX URN  — Unemployment Rate, Portland-Vancouver-Hillsboro MSA
ENFIRE38900 — Total Nonfarm Employment, Portland MSA
PORS — All Employees: Total Nonfarm in Portland MSA (may differ)
ATNHPIUS38900Q — All-Transactions House Price Index, Portland MSA
MEDLISPRIPERSQUFEE38900 — Median Listing Price Per Sq Ft, Portland MSA
MEDDAYONMAR38900 — Median Days on Market, Portland MSA
NEWLISCOU38900 — New Listing Count, Portland MSA
ACTLISCOU38900 — Active Listing Count, Portland MSA
LXXRSA38900 — Existing Home Sales, Portland MSA
RGMP38900 — Real GDP: Portland MSA
PCPI41 — Per Capita Personal Income: Oregon
ORPCPI — Per Capita Personal Income: Portland MSA (if available)
住BPPRIVSA41 — Building Permits (Private Housing), Oregon
```

**Note:** Exact series IDs should be verified at `https://fred.stlouisfed.org/tags/series?t=portland`. FRED has 100+ series tagged "portland".

---

### 12. Additional Niche / Emerging Sources

| Source | URL | Data Provided | Cost | Access | Relevance |
|--------|-----|---------------|------|--------|-----------|
| **OpenStreetMap (Overpass API)** | `https://overpass-turbo.eu/` | Building footprints, POIs, business listings, infrastructure | Free | API | MEDIUM — business/POI enumeration |
| **Google Environmental Insights Explorer** | `https://insights.sustainability.google/` | Transportation emissions, building emissions, solar potential for Portland | Free | Web | LOW — sustainability |
| **Opportunity Atlas (Census)** | `https://www.opportunityatlas.org/` | Upward mobility, income outcomes by childhood neighborhood | Free | Web/CSV | MEDIUM — equity, neighborhood outcomes |
| **PolicyMap** | `https://www.policymap.com/` | Aggregated demographic, economic, housing, health data at census tract level | Subscription (~$5K/yr) / Free for some orgs | Web/API | MEDIUM — comprehensive tract-level data |
| **Social Explorer** | `https://www.socialexplorer.com/` | Census data visualization and download, historical demographics | Free (limited) / $100+/yr | Web/API | MEDIUM — historical demographic trends |
| **Data Commons (Google)** | `https://datacommons.org/place/geoId/4159000` | Aggregated public data for Portland: demographics, economics, health, education | Free | API + Web | MEDIUM — convenient aggregation |
| **National Equity Atlas** | `https://nationalequityatlas.org/` | Racial equity indicators for Portland MSA | Free | Web/interactive | MEDIUM — equity metrics |
| **Measure 110 Data (Oregon)** | `https://www.oregon.gov/oha/hsd/amh/pages/measure110.aspx` [VERIFY URL] | Drug decriminalization data: citations, treatment referrals, funding | Free | PDF/Web | HIGH — Portland drug policy outcomes |
| **Oregon Secretary of State Audits** | `https://sos.oregon.gov/audits/Pages/default.aspx` | State audits of Oregon agencies, sometimes Portland-specific | Free | PDF | LOW — government performance |
| **Oregon Transparency Website** | `https://www.oregon.gov/transparency` | State spending, contracts, employee compensation | Free | Web/download | LOW — state spending context |

---

### 13. Recommended Priority Actions

**Immediate (can automate now, high value):**
1. **FRED API** — Pull all Portland MSA series (GDP, employment, housing prices, building permits). No auth barrier.
2. **CBRE/Colliers/Cushman** — Download latest quarterly office/industrial/retail PDFs. Manual but high value.
3. **ODOT Crash Data** — Download Portland-area crash data for traffic safety metrics.
4. **ODE School Enrollment** — Download PPS enrollment trends (CSV available).
5. **County Health Rankings** — Download Multnomah County health data (CSV).
6. **Redfin Data Center** — Download Portland metro housing data (weekly CSVs, no auth).
7. **FBI Crime Data Explorer API** — Pull Portland PD data for national crime benchmarking.
8. **NTD Monthly Ridership** — Download TriMet monthly ridership (Excel from FTA).
9. **PSU Population Research Center** — Get latest certified population estimates.
10. **BEA Regional GDP** — Pull Portland MSA GDP via API.

**Medium-term (requires manual download or partnerships):**
1. **Multnomah County Socrata** — Enumerate all datasets via catalog API (run curl command in Deep Crawl Notes).
2. **JOHS/Point-in-Time** — Get latest homeless count data.
3. **Port of Portland** — Airport passenger data.
4. **Eviction Lab** — Portland eviction data.
5. **HUD CoC** — Continuum of Care homelessness data.

**Evaluate for subscription:**
1. **Placer.ai** — Best foot traffic data; ~$1-5K/mo. Worth a trial for downtown recovery question.
2. **CoStar** — Gold standard commercial RE; ~$500-2K/mo. May be redundant with free brokerage reports.
3. **Lightcast** — Best labor market data; expensive but valuable.

---

## Current Data Status (Updated 2026-03-15 3:00 AM)

### REAL DATA IN DATABASE (32 tables)

| Source | Table | Rows | Status |
|--------|-------|------|--------|
| Portland ArcGIS BDS_Permit | housing.permits | 34,307 | LIVE |
| Portland ArcGIS Crime MapServer | safety.crime_monthly | 369 | LIVE (snapshot) |
| Portland ArcGIS BPS_Graffiti | safety.graffiti_monthly | 1 | LIVE (22K reports) |
| Portland ArcGIS Boundaries | reference.neighborhoods | 120 | LIVE |
| Oregon SOS (data.oregon.gov) | business.oregon_sos_* | 5,191 | LIVE |
| BLS Employment API | business.bls_employment* | 2,254 | LIVE |
| Census CBP | business.census_cbp | 59 | LIVE |
| Zillow ZORI (CSV) | public.housing_rents | 133 | LIVE |
| FRED House Prices | housing.fred_house_price_index + public | 243 | LIVE |
| FHFA HPI | housing.fhfa_hpi | 36 | LIVE |
| Redfin Market | housing.redfin_market | 21 | LIVE |
| FBI Crime (state-level) | safety.fbi_crime_estimates | 7 | LIVE |
| Census Population | migration.census_population | 7 | LIVE |
| TriMet GTFS | downtown.trimet_routes + stops | 6,488 | LIVE |
| Tax Analysis | public.tax_comparison | 15 | STATIC |
| PBOT Requests | downtown.pbot_requests | 2 | LIVE |

### STILL NEEDS DATA

| Source | What's Missing | How to Get It | Priority |
|--------|---------------|---------------|----------|
| PPB Crime CSVs | Nothing blocking headline/detail dashboard; keep monthly sync active | Tableau Public CSV download | HIGH |
| BOEC 911 Response | Dispatch-to-on-scene medians still needed; call-answering trend is loaded from Director's Reports | Public records request to Bureau of Emergency Communications | HIGH |
| Water Bureau Activations | Monthly water account activations/deactivations by ZIP | Public records request (template in DATA_SOURCES_TODO.md) | HIGH |
| Revenue Division BLT | Business license tax registrations | Public records request (template in DATA_SOURCES_TODO.md) | HIGH |
| Placer.ai Foot Traffic | Downtown foot traffic, dwell time, visitor origin | Partnership with Clean & Safe or subscription ($2-5K/mo) | MEDIUM |
| CoStar Vacancy | Commercial vacancy by submarket | Subscription ($500-1.5K/mo) or use free CBRE/Colliers quarterly PDFs | MEDIUM |
| Multnomah County Assessor | Property ownership and valuation | Annual public records request | MEDIUM |
| TriMet Ridership | Monthly boardings by line | Published in quarterly performance reports (scrape or request) | LOW |
| School Enrollment | PPS enrollment by school | Published annually by Oregon Dept of Education | LOW |


---

## Portland Maps Detail API (CONFIRMED WORKING 2026-03-15)

### API Key
`7D700138A0EA40349E799EA216BF82F9` (found in public portlandmaps.com JavaScript)

### Required Headers
```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
Referer: https://www.portlandmaps.com/detail/permit/{detail_id}/
```

### Permit Detail (WORKING — 35KB+ response)
```
GET https://www.portlandmaps.com/api/detail.cfm?format=html&detail_type=permit&sections=*&expand=1&expand_tables=1&detail_id={id}&api_key={key}
```
Returns: IVR number, permit type, address, setup/review/issue/final dates, status, work description, AND full activity log with 30-124 review steps per permit (activity name, type, must_check, status, dates, staff contact with phone number).

### Property Detail (WORKING — 9KB response)
```
GET https://www.portlandmaps.com/api/detail.cfm?format=html&detail_type=property&detail_id={property_id}&api_key={key}
```
Returns: Owner name, owner address, building area (sq ft), description (OFFICE/RESIDENTIAL/etc), year built, neighborhood, zoning, jurisdiction, council district, elevation, related accounts.

### Key Fields for Bottleneck Analysis
The activity log shows exactly WHERE each permit gets stuck:
- Planning and Zoning Review (often the slowest — 192 days in sample)
- Structural Review
- Life Safety Review
- Fire Plan Review
- Erosion Control
- Transportation SDC Review
- Pre-Issuance Check
- Corrections Received (multiple rounds = delays)

### Permit ID Range
detail_id is sequential integer. IDs ~5166000-5200000 = permits from mid-2025 to early 2026.
Roughly 8,000-10,000 IDs per month across all permit types.

### Rate Limiting
Use 1-second delay between requests. No documented rate limit, but be polite — this is public civic infrastructure.

---

## BOEC 911 Director's Reports (CONFIRMED 2026-05-22)

**URL**: https://www.portland.gov/911/documents/
**Format**: Monthly PDF reports
**Update**: Published ~2-3 weeks after month end
**Contains**: 911 call answering performance, avg wait times, staffing levels,
  dispatch workload by discipline, call volume by city/council district

Key metrics extracted from the April 2026 report, posted May 7, 2026:
- 75% of 911 calls answered within 15 seconds in March 2026 (NENA target: 90%)
- 78% of 911 calls answered within 20 seconds in March 2026 (NENA target: 95%)
- 14 second average wait-to-answer time in March 2026
- 44,333 911 calls in March 2026, caller-disconnected calls included
- 91 senior dispatchers and 12 vacancies as of April 1, 2026

Must be manually downloaded and parsed monthly — no API.


## Consolidated Data Source TODO

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
| **Fetch script** | `ingest/fetch-census.ts` |
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
| **Code location** | `ingest/seed-real-data.ts` lines 295-375 |

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

### PPB Crime CSV Downloads — `LIVE`

| Field | Value |
|-------|-------|
| **Current status** | Integrated into `safety.ppb_offenses`; latest validation found 627,213 rows through April 30, 2026 |
| **What's available** | PPB publishes Tableau Public CSVs for yearly NIBRS offense records |
| **Contact** | ppbopendata@police.portlandoregon.gov |
| **Available dashboards** | Crime stats, shooting incidents, bias crimes, stolen vehicles, dispatched calls, arrests, use of force |
| **Action** | Keep `ingest/sync-crime.ts` scheduled; re-fetch current and prior year for late-arriving reports |

### BOEC 911 Response Times — `LIVE_PARTIAL`

| Field | Value |
|-------|-------|
| **Current status** | BOEC Director's Report answer-time trend loaded through March 2026 |
| **What we need** | Monthly median Priority 1 response times from dispatch to on-scene; the Director's Report covers answer-time, not full emergency response time |
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

## 5. Tax / Local Fiscal Burden — "What do Portlanders pay, and what do they get?"

### Lincoln FiSC Local Fiscal Basket — `STATIC`

| Field | Value |
|-------|-------|
| **Status** | STATIC — 2023 FiSC workbook loaded and transformed |
| **Sources** | [Lincoln Institute of Land Policy FiSC full dataset, 2023 update](https://www.lincolninst.edu/app/uploads/2026/01/FiSC-Full-Dataset-2023-Update.xlsx) |
| **Canonical dataset** | The FiSC workbook itself, downloaded from the source URL above. There is no `data/datasets/` tree in this repo; keep the workbook in `runtime-data/`. |
| **App snapshot** | `src/data/fisc-tax-burden-2023.json` (full extract) and `src/data/tax-burden.ts` (the comparison the dashboard renders, with provenance and a `TAX_BURDEN_VERIFIED_AT` date) |
| **Code location** | `src/components/dashboard/tax/TaxDetail.tsx`, `src/data/tax-burden.ts`. The route reports this as reference data with a `verifiedAt` date, not as live data. |
| **Methodology** | Uses FiSC totals across city, county, independent school district, and special district governments. Values are real per-capita dollars in 2022 dollars. The dashboard compares Portland against the 150 largest FiSC central cities by 2023 population. |
| **Action needed** | Refresh when Lincoln publishes the next FiSC update. Add household-income normalization if a reliable income-normalized methodology is available. |

### Income Tax Calculator — `STATIC`

| Field | Value |
|-------|-------|
| **Status** | STATIC — computed from published tax rates |
| **Sources** | IRS, Oregon DOR, Washington DOR, other state tax agencies, city budget offices |
| **Code location** | `src/app/api/dashboard/tax/detail/route.ts`, `src/lib/calculator/tax-data.ts` |
| **Action needed** | Verify rates annually when new fiscal year starts (July 1). Keep labeled as income-tax-only; it excludes sales taxes, property taxes, charges, utility revenue, and business-tax incidence. |

---

## 6. Housing — "Can people afford to live in Portland?"

### Building Permits (BDS) — `LIVE`

| Field | Value |
|-------|-------|
| **Status** | LIVE via ArcGIS |
| **Endpoint** | `Public/BDS_Permit/FeatureServer/22` |
| **Records** | ~77 permits (filtered to 2023+, up to 200K total in system) |
| **Used in** | Housing route for pipeline counts and processing time |

### Zillow ZORI (Observed Rent Index) — `LIVE`

| Field | Value |
|-------|-------|
| **Current status** | AUTOMATED — `/api/cron/refresh-data` downloads the direct CSV below and writes the Portland metro row to `public.housing_rents` (`zip_code = 'metro'`) inside a transaction. Scheduled monthly (`0 7 3 * *`) and weekly for the Zillow scope alone (`?scope=zillow`, `20 7 * * 4`). The former fabricated-rent fallback (`src/lib/mock-data.ts`) is deleted; with no rows the housing route reports `dataStatus: "unavailable"`. |
| **Download URL** | https://www.zillow.com/research/data/ (look for "ZORI" under Rentals) |
| **Direct CSV URL** | `https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv` (metro-level, smoothed) |
| **Format** | CSV with monthly columns, one row per metro |
| **Metro to filter** | "Portland-Vancouver-Hillsboro, OR-WA" |
| **Action** | None outstanding. The steps below are what the cron does: download the CSV, filter to the Portland metro row, parse the monthly columns, replace the `zip_code = 'metro'` rows in `public.housing_rents`. |
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
| **Fetch script** | `ingest/fetch-bls.ts` |
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
| **Fetch script** | `ingest/fetch-fred.ts` |
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
   - Script: `npx tsx ingest/fetch-census.ts`
   - 7 years of population data (2017-2022 ACS, 2019 PEP)

2. [ ] **Download Zillow ZORI CSV** — free, takes 10 minutes
   - URL: https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv
   - Parse and load Portland metro row into database

3. [x] **BLS employment data** — DONE, fetched 1,918 data points via v1 API (no key needed)
   - Script: `npx tsx ingest/fetch-bls.ts`
   - 16 series covering all Portland MSA employment sectors (2016-2025)

3b. [x] **FRED economic data** — DONE, fetched 441 data points via CSV download
   - Script: `npx tsx ingest/fetch-fred.ts`
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


## Historical Dashboard Spec Data Source Registry

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
