---
name: Portland Open Data Endpoints
description: Complete inventory of all verified Portland GIS services, datasets, and open data endpoints with layer details, update frequencies, and dashboard relevance
type: reference
---

# Portland Open Data — Complete Endpoint Registry

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
