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
