# Portland Commons Platform — Complete Product Specification

## Document Purpose

This document is the comprehensive product specification for the Portland Commons Platform — a civic technology system that powers the Portland Commons organization's mission to make Portland the best city in America to build something. It covers every component of the platform, the data sources that feed it, the user types it serves, and the use cases it supports.

This spec should be read as the authoritative reference for all technical and product decisions. Every feature described here connects to a specific civic or economic outcome. Nothing is decorative.

---

## Strategic Context

Portland, Oregon has the highest commercial vacancy rate of any major American city (~34% in the Central Business District), the highest effective marginal tax rate on small businesses in the country, a stalled housing pipeline (656 multifamily units, lowest since 2011), and net job losses (8,800 in 2025) even as the national economy expands. Simultaneously, Portland has extraordinary cultural, natural, and human assets, buildings available at 80-90% discounts from peak values, and a new city government structure with a mayor (Keith Wilson) who is actively seeking public-private revitalization partnerships.

The Portland Commons is a nonprofit civic organization (501(c)(3) with a connected 501(c)(4) for advocacy) that operates entirely outside government to build the infrastructure — data, coalition, network, capital — that enables Portland's economic recovery. The Portland Commons Platform is the technical backbone of this organization.

The platform serves five interconnected functions:
1. **Civic Dashboard** — Makes Portland's performance visible in real time
2. **Portland Commons Business (PCB) Registry** — Manages the certification, benefits, and lifecycle of Portland Commons Businesses
3. **Real Estate Portal** — Matches vacant commercial spaces with PCB businesses
4. **Business Network** — Powers private-to-private exchanges (Launch Sponsors, referrals, supply chain, talent)
5. **AI Business Concierge** — Provides every PCB member with personalized regulatory, tax, and compliance guidance

---

## User Types

### 1. Portland Residents (Public)
- Access the Civic Dashboard to understand city performance
- Browse the PCB Business Directory to find and support local businesses
- Sign up as First Forty volunteers
- View the Portland Progress Report

### 2. Prospective Business Owners (Pre-PCB)
- Learn about the PCB program and benefits
- Estimate their savings using the Benefits Calculator
- Explore available commercial spaces on the Real Estate Portal
- Begin the PCB certification process

### 3. Portland Commons Business Members (PCB — Certified)
- Access full AI Business Concierge
- Manage their business profile in the directory
- Participate in Launch Sponsor matching (as recipient or sponsor)
- Post and respond to Supply Chain and Talent Exchange listings
- Manage referral partnerships
- Track their Commons Credits
- Access the Real Estate Portal with PCB-specific terms
- Receive launch support (First Forty coordination, city promotion)
- Access Founders Fund loan applications
- View their tier status and progress toward next tier

### 4. Landlords / Property Owners
- List available spaces on the Real Estate Portal with PCB-specific terms
- View pipeline of PCB businesses seeking space
- Track occupancy and engagement metrics for their portfolio
- Participate in the Pop-Up Pipeline program
- Earn Commons Credits for PCB-favorable terms

### 5. Portland Commons Staff / Administrators
- Manage PCB certifications and tier advancement
- Coordinate Launch Sponsor matching
- Manage First Forty volunteer roster and deployment
- Produce the Portland Progress Report
- Manage Builders' Table invitations and follow-up tracking
- Monitor dashboard data quality and update schedules
- Administer the Commons Credit ledger

### 6. Policymakers and Media (Read-Only Power Users)
- Access enhanced Civic Dashboard views with exportable data
- View aggregate PCB program metrics (enrollment, survival rates, jobs created)
- Access the Portland Progress Report archive
- View the Builders' Agenda policy document

---

## Component 1: Civic Dashboard

### Purpose
Make Portland's performance legible in real time so that residents, businesses, policymakers, and media can see whether the city is getting better or worse on the metrics that matter. This is the Portland Commons' foundational credibility asset.

### Data Sources and Metrics

#### Tier 1 Metrics (Launch — available from public data, updated monthly or more frequently)

**Permit Processing Time**
- Source: Portland Permitting & Development (PP&D) open data portal
- Metric: Average calendar days from application submission to approval, broken down by permit type (commercial tenant improvement, new construction, change of use, residential)
- Display: Trailing 12-month trend line with comparison to 90-day PCB target
- Update frequency: Monthly

**Downtown Foot Traffic (Rich)**
- Source: Placer.ai location analytics platform, accessed via Downtown Portland Clean & Safe (who uses Placer.ai's civic product — relationship with Mark Wells, Executive Director). Explore direct Portland Commons Placer.ai civic subscription for independent access.
- Metrics (Placer provides all of the following):
  - **Volume**: Weekly and daily foot traffic counts across the Central City, by block and corridor, indexed to 2019 baseline (2019 = 100)
  - **Time-of-day pattern**: Hourly traffic distribution — shows whether activity is commuter-driven (9 AM / 5 PM peaks) vs. resident/visitor-driven (evening and weekend peaks). Critical for proving the "seven-day district" thesis.
  - **Day-of-week pattern**: Weekday vs. weekend traffic split, with trend over time. If Saturday is recovering faster than Tuesday, that validates the residential/cultural strategy over the office-return strategy.
  - **Visitor origin**: Where foot traffic comes from (home ZIP / census tract). Shows mix of downtown residents, inner-neighborhood visitors, suburban visitors, and tourists. Tracks whether the residential conversion strategy is increasing resident-origin traffic over time.
  - **Dwell time**: Average time spent in area. Proxy for economic engagement — 3 minutes = passing through, 45 minutes = ate lunch, 2+ hours = shopped and explored.
  - **Visit frequency**: Repeat visit rate. Shows whether downtown is building a regular customer base or relying on one-time visitors.
  - **Trade area**: For specific blocks or corridors, shows the geographic draw radius. Used to evaluate Launch program effectiveness and referral network reach.
- Display: Primary view shows weekly volume trend indexed to 2019. Drill-down views show time-of-day heatmap, day-of-week comparison, origin map, and dwell time distribution. Each corridor targeted for the pop-up pipeline gets its own sub-dashboard.
- Update frequency: Weekly (Placer updates continuously; aggregate weekly for dashboard display)
- Integration with Real Estate Portal: Location-specific Placer data (foot traffic volume, time-of-day pattern, visitor origin) displayed on individual space listings so prospective PCB tenants can evaluate locations with data normally available only to large retail chains.
- Integration with Benefits Calculator: Location-specific foot traffic data feeds into revenue estimates for customer-facing businesses evaluating specific neighborhoods.

**New Business Formation**
- Source: City of Portland Revenue Division (public records request for new BLT registrations); Oregon Secretary of State business filings
- Metric: Monthly new business license applications in Portland, trailing 12-month total, broken down by neighborhood
- Display: Monthly trend, neighborhood heat map, comparison to prior years
- Update frequency: Monthly

**Commercial Vacancy Rate**
- Source: CoStar subscription (primary); supplemented by Colliers/CBRE quarterly reports (free); Portland Commons vacancy database (proprietary, built from assessor + BLT cross-reference)
- Metric: Office vacancy rate (CBD, metro), retail vacancy rate, industrial vacancy rate; broken down by submarket and building class
- Display: Quarterly trend line; interactive map showing vacancy by block (once proprietary database is built)
- Update frequency: Quarterly (CoStar), with monthly supplemental updates from proprietary data

**Property Crime**
- Source: Portland Police Bureau open data
- Metric: Reported property crimes per 1,000 residents per month, broken down by type (burglary, theft, vandalism, vehicle theft) and by neighborhood
- Display: Monthly trend by neighborhood, heat map, comparison to 2019 baseline
- Update frequency: Monthly

#### Tier 2 Metrics (Months 3-6 — requires additional data acquisition)

**Housing Pipeline**
- Source: PP&D permit data (new residential permits issued); Portland Housing Bureau data
- Metric: Multifamily units in pipeline (permitted, under construction, completed), trailing 12-month total
- Display: Monthly trend; map of active construction projects
- Update frequency: Monthly

**Transit Ridership**
- Source: TriMet developer API (publicly available)
- Metric: Monthly boardings by MAX line and key bus routes; comparison to 2019 baseline
- Display: Monthly trend by line; ridership heat map by stop
- Update frequency: Monthly

**School Enrollment**
- Source: Portland Public Schools enrollment data (published annually; monthly attendance data may require data sharing agreement)
- Metric: Total PPS enrollment, enrollment by school, trend over 5 years
- Display: Annual trend; school-level map
- Update frequency: Annually (with monthly attendance supplement if available)

**Office-to-Residential Conversion Pipeline**
- Source: PP&D permit data (change of use permits from commercial to residential)
- Metric: Number of conversion projects permitted, under construction, and completed; total units in pipeline
- Display: Project-level map with status indicators
- Update frequency: Monthly

**Tax Revenue Trends**
- Source: City of Portland budget documents; Revenue Division annual reports; public records requests for BLT collection data by quarter
- Metric: BLT collections (quarterly trend), property tax collections, comparison to forecast
- Display: Quarterly trend with budget forecast overlay
- Update frequency: Quarterly

#### Tier 3 Metrics (Months 6-12 — requires partnerships or advanced data work)

**Portland Commons Program Metrics**
- Source: Internal PCB registry data
- Metric: Total PCB certifications, PCB survival rate vs. non-PCB, jobs at PCB businesses, Commons Credits issued, Launch Sponsor matches completed, Founders Fund loans disbursed, Real Estate Portal matches
- Display: Program dashboard with key KPIs; comparison of PCB survival rate to national average
- Update frequency: Monthly

**Vacancy Database (Proprietary)**
- Source: Multnomah County Assessor data + BLT registration cross-reference + PP&D permit activity + LoopNet/Crexi/CommercialCafe listings + Clean & Safe occupancy data + ground-truthing
- Metric: Total vacant commercial spaces by address, with vacancy probability score; vacant square footage by block, corridor, and neighborhood; duration of vacancy; owner identification
- Display: Interactive map, color-coded by vacancy concentration; drill-down to block level showing individual spaces
- Update frequency: Monthly (automated data pulls) with quarterly ground-truthing of priority corridors

### Dashboard Technical Requirements

- **Frontend**: Web application, mobile-responsive, fast-loading. React or Next.js.
- **Data pipeline**: Automated ETL that pulls from public APIs and data portals on schedule (daily/weekly/monthly depending on source). Python-based, running on a lightweight backend or serverless functions.
- **Visualization**: Clean, beautiful, instantly legible charts and maps. Use a charting library (Recharts, D3, or Plotly) and mapping library (Mapbox or Leaflet with Portland GIS data).
- **Embeddable**: Every metric should have an embeddable widget that journalists and bloggers can drop into articles.
- **Exportable**: Every dataset should be downloadable as CSV for researchers and policymakers.
- **Public API**: Expose key metrics through a simple REST API so other civic tools can build on the data.
- **No login required** for the public dashboard. Enhanced views (exportable data, historical downloads) may require free registration.

### Dashboard Design Principles

- The dashboard should feel like a Bloomberg terminal for civic data — information-dense but not cluttered, professional, trustworthy.
- Default view shows the 5-7 most important metrics on a single screen. Each metric shows: current value, trend direction (up/down arrow), comparison to baseline (2019 or program target), and a sparkline showing 12-month trend.
- Clicking any metric expands to a full detail view with historical data, geographic breakdown, and methodology notes.
- Color coding: Green = improving / on track. Yellow = flat / watch. Red = declining / off track.
- Every data point should cite its source and last-updated date.

---

## Component 2: Portland Commons Business (PCB) Registry

### Purpose
Manage the full lifecycle of Portland Commons Business certification — from application through tier advancement — and serve as the system of record for the entire PCB program.

### Certification Flow

**Step 1: Application**
Prospective business completes online application with:
- Business name, address, entity type
- Owner name(s) and contact information
- Number of employees and % Oregon residents
- Business description and sector classification
- Year founded / planned opening date
- Confirmation of eligibility criteria:
  - Headquartered in Portland with physical commercial presence
  - Fewer than 500 employees
  - At least 60% Oregon-resident employees
  - Majority owned by natural person(s)
  - In operation fewer than 5 years OR adding 3+ net new Portland jobs this year
  - Commits to 3-year Portland presence

**Step 2: Verification**
Portland Commons staff verifies:
- Active Oregon Secretary of State business registration
- Portland business address exists (cross-reference assessor data)
- BLT registration active or in process
- Owner identity (basic check — not a background check, just confirming the person exists and is who they say)

Verification should take no more than 5 business days. Automated checks where possible (SOS registration lookup, address validation).

**Step 3: Certification**
Business receives PCB certification with:
- Unique PCB member ID
- Digital certificate and physical window sticker
- Access to all Tier 1 benefits
- Profile created in Business Directory
- Assigned to a Launch Cohort (monthly cohorts of new PCBs who go through launch support together)

### Tier System

**Tier 1: Portland Commons Business**
- Requirements: Meet basic certification criteria
- Benefits: AI Concierge access, network membership, directory listing, Launch program eligibility, Real Estate Portal access with PCB terms, group insurance eligibility, 90-day permitting guarantee (city partnership), BLT holiday (city partnership)

**Tier 2: Portland Roots Business**
- Requirements: 3+ years continuous Portland operation, 80%+ Oregon-resident employees, 10,000+ Commons Credits, participation in at least one community program (from qualifying menu: mentorship, apprenticeship, school partnership, neighborhood association, Launch Sponsor for at least one new business)
- Additional benefits: Founders Fund loan eligibility, SDC reduction (city partnership), PCEF matching grants, priority access to city-owned commercial spaces, featured placement in directory

**Tier 3: Portland Anchor Business**
- Requirements: 7+ years continuous operation, 10+ employees, 50,000+ Commons Credits, demonstrated sustained community investment
- Additional benefits: Permanent BLT rate reduction (city partnership), property tax abatement on owned commercial property (city partnership), seat on Portland Commons Advisory Board, featured in Portland Progress Report, "Portland Anchor" designation and branding

### Registry Data Model

Each PCB record contains:
- Business profile (name, address, sector, description, photos, website, social links)
- Owner information (name, contact, bio)
- Certification date and tier status
- Commons Credit balance and transaction history
- Launch Sponsor relationships (given and received)
- Referral partnerships (active)
- Supply Chain and Talent Exchange listings (active)
- Real Estate Portal activity (spaces viewed, applied for, leased)
- Founders Fund loan status (if applicable)
- 90-day check-in data
- Annual renewal status
- Survival tracking (is the business still operating? Date of last activity confirmation)

---

## Component 3: Real Estate Portal

### Purpose
Create the definitive marketplace for Portland commercial space that serves PCB businesses, replacing the fragmented, broker-dominated system with a direct, transparent, PCB-optimized platform.

### Space Listings

Each listing contains:
- Address and unit/suite number
- Square footage
- Space type (ground-floor retail, upper-floor office/studio, industrial/maker, flex)
- Current condition (move-in ready, needs TI, shell)
- Asking rent (per square foot per year)
- PCB terms available (e.g., "3 months free on 3-year lease," "graduated rent: 50%/75%/100%")
- Pop-Up Pipeline availability (yes/no — is this space available for 90-day no-rent pop-ups?)
- Photos (interior and exterior)
- Building amenities (elevator, ADA access, parking, transit proximity, bike storage)
- Owner/landlord name and contact (or property management company)
- Zoning (pulled from Portland Maps GIS data)
- Vacancy duration (how long has it been empty — calculated from BLT registration data and CoStar)
- Neighborhood context (what other PCB businesses are nearby, foot traffic data from dashboard)
- Walk Score / Transit Score (pulled from Walk Score API)

### Search and Discovery

Users can search and filter by:
- Neighborhood / corridor
- Space type
- Square footage range
- Rent range
- PCB terms available (filter for spaces with pop-up availability, free rent period, graduated rent)
- Move-in readiness
- Proximity to transit
- Proximity to other PCB businesses

Map-based search shows all available spaces with color coding:
- Green: PCB-participating landlord with active PCB terms
- Yellow: Listed space without PCB-specific terms
- Gray: Suspected vacancy from proprietary database (not yet listed by landlord)

The gray dots are the key innovation — they show landlords and prospective tenants where the hidden inventory is, even if the landlord hasn't listed it. For prospective tenants, it says "there might be a space here — contact us and we'll reach out to the landlord." For landlords, it says "we know your space is empty — list it with us and get access to the PCB tenant pipeline."

### Pop-Up Pipeline

A dedicated section of the Real Estate Portal manages the 90-day pop-up program:
- Landlords flag specific spaces as pop-up-eligible
- Businesses apply for pop-up slots (simple application: who are you, what would you do in this space, when can you start?)
- Portland Commons staff matches applicants to spaces based on fit (use type, size, location, landlord preferences)
- Standard license agreement (not a lease) generated automatically from templates
- Launch program triggered automatically when a pop-up is approved (First Forty notification, city promo request, neighborhood welcome coordination)
- 90-day countdown with check-in milestones (30 days, 60 days, 90 days)
- At 90 days: conversion prompt — business and landlord both receive a structured offer to convert to a standard lease at PCB terms

### Vacancy Database Backend

The proprietary vacancy database feeds the portal's "gray dot" suspected vacancy layer:

Data assembly pipeline:
1. **Base layer**: Multnomah County Assessor commercial property data (every commercial parcel — address, owner, sq ft, zoning, assessed value). Updated annually from county data extract.
2. **Occupancy signal**: BLT registration data cross-referenced by address. Properties with zero active BLT registrations flagged as "likely vacant." Updated quarterly via public records request.
3. **Activity signal**: PP&D permit data. Properties with no permit activity in 24+ months flagged as "stale." Updated monthly from open data portal.
4. **Market signal**: Active listings from LoopNet, Crexi, CommercialCafe, and direct landlord submissions. Updated weekly via scraping or API where available.
5. **Validation layer**: USPS vacancy data (census tract level, quarterly from HUD), Clean & Safe occupancy data (downtown, from relationship with Mark Wells), ground-truthing data (priority corridors, quarterly from staff/volunteer walks).

Each property gets a **vacancy probability score** (0-100) based on the convergence of signals:
- No BLT registration + no permits in 24 months + listed on platforms = 95+ (almost certainly vacant)
- No BLT registration + no permits in 24 months + NOT listed = 80-90 (likely vacant, hidden inventory)
- Active BLT registration + recent permits = 5-10 (almost certainly occupied)
- Intermediate combinations scored proportionally

The vacancy database also powers the dashboard's vacancy metrics and the Portland Progress Report's analysis.

---

## Component 4: Business Network

### Purpose
Power the private-to-private economic exchanges that generate more value for PCB businesses than the public incentive package — Launch Sponsorships, referrals, supply chain, talent exchange, and the Commons Credit system.

### Launch Sponsor Matching

When a new PCB business is certified, the system:
1. Identifies 10-15 established PCB businesses that are complementary (not competitive) based on sector, location, and stated offerings
2. Sends match suggestions to both the new business and the potential sponsors
3. Each potential sponsor sees: the new business's profile, their planned opening date and location, and what the new business needs (categorized: food/beverage supply, design/branding, professional services, equipment/fixtures, marketing, other)
4. Sponsors who are interested indicate what they'd offer (free-form description + estimated value)
5. Portland Commons staff reviews and facilitates introductions
6. When a sponsorship is confirmed, both parties record the commitment in the system (what's being provided, estimated value, timeline)
7. Upon delivery, both parties confirm completion. Commons Credits are issued to the sponsor based on the confirmed value.

### Referral Network

PCB businesses can create referral partnerships:
1. Business A selects up to 5 PCB businesses to feature in their "Portland Commons Recommends" display
2. The system generates: a physical card design (printable, for in-store display), a digital widget (for website embedding), and QR codes for each recommended business
3. When a customer scans a QR code or clicks a referral link, the referral is tracked
4. Both the referring and referred businesses see referral analytics: clicks, visits, estimated revenue driven
5. Referral activity contributes to Commons Credit accumulation

### Supply Chain Board

A marketplace where PCB members post needs and other members respond:
- Categories: Food & Beverage Supply, Packaging & Shipping, Professional Services (legal, accounting, bookkeeping), Technology (web, software, IT support), Marketing & Design, Cleaning & Maintenance, Equipment & Furniture, Construction & Trades, Other
- Each posting includes: what's needed, approximate budget, timeline, and whether the poster is open to barter/exchange
- Responses are visible only to the poster (not a public bidding system — this is a community, not a procurement platform)
- Completed transactions are logged with value for Commons Credit tracking

### Talent Exchange

Similar to Supply Chain Board but for short-term professional services:
- A PCB business posts a need: "Menu redesign, 15 hours, budget $2,000"
- Other PCB businesses or their employees can respond with qualifications and availability
- Transactions can be paid (at market or discounted rates) or exchanged for reciprocal services
- All completed exchanges logged for Commons Credit tracking

### Commons Credit System

A public ledger tracking the economic value each PCB member contributes to the network:

- Credits are earned by: Launch Sponsorship (1 credit per $1 of value provided), referral partnerships (credits based on tracked referral volume), supply chain transactions with other PCBs (credits based on transaction value), talent exchange (credits based on service value), landlord PCB terms (credits for rent concessions), First Forty volunteer visits (flat credit per verified visit), mentorship (flat credit per hour logged)
- Credits are NOT currency — they cannot be spent, transferred, or cashed out
- Credits are publicly visible on every PCB member's profile
- Credits are required for tier advancement: 10,000 for Tier 2, 50,000 for Tier 3
- A leaderboard shows the highest-credit PCB businesses (monthly, annual, all-time)
- Credits provide reputational signal: when a PCB business searches the supply chain board or talent exchange, results can be sorted by credit balance (higher credits = more trusted community member)

### Business Directory

The public-facing directory of all PCB businesses:
- Searchable by: sector, neighborhood, tier, name
- Each listing shows: business name, description, photos, location (with map), website, social links, tier badge, Commons Credit balance, Launch Sponsors (who sponsored them), referral partners, and a "support this business" prompt for Portland residents
- Directory is SEO-optimized so individual business profiles rank in Google searches
- Directory powers the "Portland Commons Recommends" widgets embedded on member websites

### First Forty Volunteer System

- Portland residents sign up as First Forty volunteers with: name, email, neighborhood, dietary preferences (for restaurant visits), interests (for targeted matching)
- When a new customer-facing PCB business opens, the system notifies matched volunteers: "A new [type] just opened at [address]. Can you visit this week?"
- Volunteers confirm visits and leave a brief check-in (date, amount spent, one-sentence impression)
- Volunteers earn recognition (not credits — they're not businesses) through a separate volunteer leaderboard
- Target: 200+ active volunteers by end of Year 1

---

## Component 5: AI Business Concierge

### Purpose
Provide every PCB member with an always-available, AI-powered assistant that handles regulatory navigation, tax compliance, permit guidance, and business resource discovery — eliminating the need for expensive consultants and preventing the compliance surprises that kill small businesses.

### Knowledge Base

The concierge is built on a large language model (Anthropic Claude API) with a retrieval-augmented generation (RAG) system drawing from:

- **Portland Municipal Code** — Title 33 (Zoning), business licensing requirements, sign code, noise ordinance, sidewalk use regulations
- **Portland BLT filing requirements** — rates, thresholds, quarterly estimated payment rules, exemptions, forms, deadlines
- **Multnomah County BIT** — rates, thresholds, filing requirements
- **Metro SHS Tax** — personal and business components, thresholds, filing requirements
- **Multnomah County PFA Tax** — rates, thresholds, 2027 rate increase, filing requirements
- **Portland Arts Tax** — requirements, exemptions
- **Oregon state taxes** — Corporate Activity Tax, income tax, payroll taxes, Paid Leave Oregon
- **PP&D permit requirements** — by project type (commercial tenant improvement, change of use, food establishment, sign permit, etc.), required documents, fee schedules, SDC rates by use type, inspection requirements
- **Multnomah County Health Department** — food establishment licensing, plan review requirements, inspection criteria
- **OLCC** — liquor license types, application process, renewal
- **Oregon Employment Department** — employer registration, unemployment insurance, workers' compensation
- **Federal requirements** — EIN application, ADA compliance basics, OSHA basics
- **Portland Commons program information** — PCB benefits by tier, Founders Fund eligibility, Launch Sponsor program, Real Estate Portal, supply chain and talent exchange

### Core Use Cases

**"I want to open a restaurant in Portland. What do I need?"**
The concierge generates a complete, sequenced checklist: form your business entity, get an EIN, register with Oregon SOS, register for Portland BLT, apply for PCB certification, find a space on the Real Estate Portal, hire an architect, submit plans to Multnomah County Health for kitchen review, submit to PP&D for building permit + plumbing + mechanical + electrical, apply for OLCC liquor license (if applicable), get Multnomah County food service license, schedule inspections, get certificate of occupancy, open. Each step includes: estimated time, estimated cost, links to forms, and common mistakes to avoid.

**"My quarterly estimated tax payment — how much do I owe and where do I pay?"**
Based on the business's profile data (sector, estimated revenue, owner income if provided), the concierge calculates estimated quarterly liability for: Portland BLT, Multnomah County BIT, Metro SHS (personal and business), MultCo PFA (personal), and Oregon estimated income tax. It generates a calendar reminder for each deadline and provides direct links to Portland Revenue Online (pro.portland.gov) for payment.

**"I got a letter from the Revenue Division saying I owe penalties. What do I do?"**
The concierge explains the quarterly estimated payment requirements (many business owners don't know these exist), walks the user through how to check their account on Portland Revenue Online, explains the penalty calculation, and provides contact information for the Revenue Division. If the penalty is for a tax the user didn't know about (extremely common with SHS and PFA), the concierge explains the tax, confirms whether the user is subject to it based on their income, and walks them through retroactive filing.

**"I need a building permit for a tenant improvement. What forms do I need and how long will it take?"**
Based on the project description (space type, square footage, scope of work), the concierge identifies: which permits are required (building, plumbing, mechanical, electrical, sign), which additional approvals are needed (Multnomah County Health for food establishments, planning/zoning review if change of use), estimated fees (calculated from PP&D fee schedule based on project valuation), estimated SDCs (calculated from use type and square footage), and the 90-day PCB guarantee timeline. It generates a pre-filled permit application where possible.

**"What tax credits or incentive programs am I eligible for?"**
Based on the business profile, the concierge identifies: PCB benefits by tier, PCEF grant eligibility, SBA loan programs, Prosper Portland programs, Oregon Business Development Fund programs, federal programs (SBA 7(a), SBA Microloan, Community Advantage), and any sector-specific incentives (e.g., Oregon's mass timber incentives for construction, film production incentives for creative businesses).

**"I want to hire my first employee. What do I need to do?"**
The concierge generates the employer setup checklist: register with Oregon Employment Department for unemployment insurance, set up workers' compensation coverage, register for Paid Leave Oregon withholding, understand Portland minimum wage ($15.95/hr), understand Oregon sick leave requirements, understand Oregon predictive scheduling rules (if applicable — food service and retail), set up payroll withholding for federal, state, Metro SHS, and MultCo PFA. Recommends payroll service providers from the PCB supply chain network.

### Concierge Technical Architecture

- **Model**: Anthropic Claude API (claude-sonnet-4-20250514 for cost efficiency, claude-opus-4-6-20250620 for complex queries)
- **RAG system**: Vector database (Pinecone or Weaviate) containing chunked, embedded versions of all knowledge base documents. On each query, relevant chunks are retrieved and included in the prompt context.
- **User context**: Each PCB member's business profile data is included in the system prompt so the concierge can give personalized answers (e.g., calculating tax liability based on their specific income, identifying permits needed for their specific space)
- **Conversation history**: Maintained per user session so follow-up questions work naturally
- **Handoff to human**: When the concierge can't answer confidently (e.g., unusual zoning situation, complex tax question), it says so clearly and provides the specific human contact at the relevant bureau, with context that the user can relay so they don't start from scratch
- **Knowledge base updates**: The RAG knowledge base must be updated whenever Portland's municipal code, tax rates, fee schedules, or permit requirements change. Establish a quarterly review process. Fee schedules typically change July 1 each year. Tax rates change with voter-approved measures.
- **Audit trail**: All concierge conversations are logged (with user consent) for quality improvement and to identify common questions that should be addressed in the knowledge base or in Portland Commons advocacy

### Concierge Interaction Patterns

- **Chat interface** embedded in the PCB member dashboard (primary interaction mode)
- **Proactive notifications**: The concierge can send push notifications or emails based on the business's profile and calendar: "Your Q2 estimated tax payment is due in 14 days. Based on your YTD revenue, your estimated liability is $X for BLT, $Y for MultCo BIT, $Z for SHS. [Pay now] [Calculate exact amount]"
- **Document generation**: The concierge can generate pre-filled forms, tax worksheets, and compliance checklists as downloadable PDFs
- **Integration with Real Estate Portal**: When a PCB member is considering a specific space, the concierge can estimate: total permit costs for their intended use in that space, SDCs, timeline, and any zoning issues

---

## Component 6: Portland Progress Report (CMS)

### Purpose
A quarterly publication — the city's unofficial performance review — that combines dashboard data with narrative analysis, business profiles, and policy recommendations.

### Content Structure (each issue)
1. **Dashboard Summary**: Key metrics with trend analysis (2-3 pages)
2. **Deep Dive**: One topic explored in depth with original analysis (3-5 pages). Examples: "The Tax Threshold Problem," "Where Are Portland's Hidden Vacancies," "The First-Year Restaurant Survival Crisis"
3. **Business Profiles**: 3-5 PCB businesses profiled — their story, their challenges, their experience with the Commons (2-3 pages)
4. **Builders' Table Update**: What commitments were made at the last dinner, which were kept, what's on the agenda for next time (1 page)
5. **Policy Recommendation**: One specific, actionable policy proposal with full analysis (2-3 pages)
6. **Program Metrics**: PCB enrollment, survival rates, Commons Credits issued, spaces filled, loans disbursed (1 page)

### CMS Requirements
- Simple content management for the editor (initially Edan) to draft, format, and publish issues
- Beautiful web rendering (long-form, magazine-quality layout with charts, photos, pull quotes)
- PDF export for printing and email distribution
- Email distribution to subscriber list (all PCB members, all Builders' Table participants, media list, policymaker list)
- Archive of all past issues, searchable
- Individual articles shareable via URL for social media

---

## Component 7: Benefits Calculator

### Purpose
Allow any prospective Portland business owner to estimate the total value of PCB certification for their specific situation — making the business case for starting a business in Portland concrete and personal.

### Inputs
- Business type (restaurant/bar, retail, creative studio, tech startup, maker/manufacturing, health care, professional services, other)
- Estimated square footage
- Estimated buildout cost
- Estimated Year 1 revenue
- Estimated owner income
- Number of founders/owners
- Number of planned employees
- Whether taking a new space (SDCs apply) or occupying existing space with no change of use (SDCs may not apply)

### Outputs

The calculator generates a personalized savings report showing:

**Hard Savings (city incentives)**
- BLT holiday value (2 years)
- SDC reduction (50%, calculated by use type and square footage)
- Permitting time savings (estimated months saved × monthly rent)
- Total hard savings

**Network Value (private-to-private)**
- Estimated Launch Sponsorship value (based on sector averages from program data)
- Estimated real estate benefit (3 months free rent at area market rate)
- Estimated referral network revenue (based on sector and location)
- Estimated supply chain savings
- Estimated group health insurance savings (number of people × $400/month)
- AI concierge value (estimated consultant hours saved)
- Total network value

**Grand Total: First-Year Value of PCB Certification**

The calculator output should be downloadable as a PDF, shareable as a URL, and should include a clear CTA: "Ready to start? Apply for PCB certification."

The calculator also serves as a data collection tool — every calculator session (with consent) feeds into the Portland Commons' understanding of prospective business demand by sector, size, and location.

---

## Component 8: Builders' Table Tracker

### Purpose
Manage the invitation, agenda, commitments, and accountability tracking for the quarterly Builders' Table dinners.

### Features
- **Guest list management**: Invite tracking, RSVP status, attendance history, rotation schedule
- **Agenda builder**: For each dinner, structured agenda with: dashboard data presentation, discussion topics, commitment requests
- **Commitment tracker**: After each dinner, record specific commitments made by each participant (e.g., "Jordan Menashe commits to listing 5 vacant spaces on the Real Estate Portal by Q2," "Greg Goodman commits to offering pop-up terms on 3 ground-floor spaces by March")
- **Follow-up log**: Track whether commitments were met, partially met, or unmet. This data feeds into the Progress Report's Builders' Table Update section.
- **Relationship notes**: CRM-style notes on each participant (last conversation, interests, concerns, potential contributions)

This is an internal tool — not public-facing. But the accountability data (commitments made vs. kept) is published in the Progress Report.

---

## Data Architecture Summary

### External Data Sources (Public/Purchased)
| Source | Data | Access Method | Update Frequency |
|--------|------|---------------|-----------------|
| Multnomah County Assessor | Commercial property inventory | Annual data extract / public records request | Annual |
| Portland Revenue Division | BLT registrations by address | Public records request | Quarterly |
| PP&D Open Data | Permits, inspections, processing times | API / bulk download | Monthly |
| Portland Police Bureau | Crime statistics | Open data portal | Monthly |
| Clean & Safe / Placer.ai | Foot traffic (volume, origin, dwell time, time-of-day, visit frequency, trade area) | Relationship (Mark Wells) or direct Placer.ai civic subscription | Weekly (continuous from Placer) |
| TriMet | Transit ridership | Developer API | Monthly |
| CoStar | Commercial real estate inventory, vacancy, rents | Paid subscription | Quarterly |
| LoopNet/Crexi/CommercialCafe | Active commercial listings | Scraping / manual | Weekly |
| HUD USPS Vacancy | Vacancy rates by census tract | Public download | Quarterly |
| Oregon SOS | Business filings | Public search / bulk download | Monthly |
| Oregon Employment Department | Job data by county | Public reports | Quarterly |
| US Census / ACS | Demographics, income, migration | Public download | Annual |
| Portland Maps GIS | Zoning, parcel boundaries, addresses | Public API (RLIS) | Ongoing |

### Internal Data (Generated by Platform)
| Data | Source | Purpose |
|------|--------|---------|
| PCB registry | Certification applications | Program management, survival tracking, metrics |
| Commons Credit ledger | All network transactions | Tier advancement, reputation, program metrics |
| Concierge conversations | AI chat logs | Knowledge base improvement, common question identification |
| Real Estate Portal activity | User searches, applications, matches | Market intelligence, landlord pipeline metrics |
| Launch Sponsor matches | Matching system | Network value measurement, sponsor ROI |
| Referral tracking | QR codes, referral links | Network value measurement, referral revenue attribution |
| First Forty visits | Volunteer check-ins | Launch program effectiveness, volunteer engagement |
| Benefits Calculator sessions | User inputs | Demand analysis by sector, size, location |
| 90-day check-in data | Structured conversations | Business health monitoring, obstacle identification, policy feedback |
| Progress Report analytics | Email opens, web traffic | Audience engagement, content optimization |

---

## Build Sequence

### Phase 1: Foundation (Months 1-3)
Build in this order:
1. **Civic Dashboard (Tier 1 metrics)** — 5 metrics, public-facing. This is the credibility asset. Ship it fast.
2. **PCB Certification Flow** — Application, verification, basic profile. Minimal viable registry.
3. **Business Directory** — Public listing of certified PCBs with profiles.
4. **Benefits Calculator** — Standalone tool, embeddable, shareable. Primary recruitment tool.
5. **Organization website** — portlandcommons.org with mission statement, dashboard embed, calculator, and PCB application.

### Phase 2: Network (Months 3-6)
6. **Real Estate Portal (basic)** — Landlord listing interface, PCB search and filter, pop-up pipeline management. Initially populated from CoStar data + direct landlord submissions.
7. **AI Business Concierge (v1)** — RAG system with Portland regulatory knowledge base. Chat interface in PCB member dashboard. Start with tax and permitting guidance — the two highest-value use cases.
8. **Launch Sponsor Matching** — Matching interface, commitment tracking, Commons Credit issuance.
9. **First Forty Volunteer System** — Signup, notification, check-in tracking.
10. **Commons Credit Ledger** — Backend tracking of all credit-earning activities. Public display on business profiles.
11. **Civic Dashboard (Tier 2 metrics)** — Housing pipeline, transit, school enrollment, conversion pipeline.

### Phase 3: Flywheel (Months 6-12)
12. **Supply Chain Board** — Posting, responding, transaction logging.
13. **Talent Exchange** — Similar to supply chain but for professional services.
14. **Referral Network** — Partnership creation, QR code generation, tracking, analytics.
15. **Real Estate Portal (advanced)** — Proprietary vacancy database integration, gray-dot suspected vacancy layer, block-level vacancy map.
16. **AI Concierge (v2)** — Proactive notifications (tax deadlines, permit renewals), document generation (pre-filled forms, tax worksheets), integration with Real Estate Portal (estimate costs for specific spaces).
17. **Civic Dashboard (Tier 3 metrics)** — Full vacancy database, PCB program metrics, tax revenue impact tracking.
18. **Progress Report CMS** — Full publishing system with email distribution.
19. **Builders' Table Tracker** — CRM and accountability system.

### Phase 4: Scale (Months 12-24)
20. **Founders Fund Integration** — Loan application flow within the PCB dashboard, portfolio tracking, impact metrics.
21. **Tier Advancement Automation** — Automatic calculation of tier eligibility based on years, credits, and community participation.
22. **Advanced Analytics** — PCB survival rate tracking (comparison to national averages by sector), economic impact modeling (jobs created, tax revenue generated, vacancy filled), network value quantification (total value of private-to-private exchanges).
23. **Public API** — Open API for civic researchers, journalists, and other civic tech tools to access dashboard data and aggregate PCB program metrics.
24. **Mobile App** — Native mobile experience for PCB members (concierge, directory, referral QR codes, notifications).

---

## Success Metrics

### Dashboard Adoption
- Monthly unique visitors: 5,000 by Month 6, 20,000 by Month 12
- Media citations: 10 per quarter by Month 6
- Embedded widgets on external sites: 50 by Month 12

### PCB Program
- Certifications: 500 by Month 6, 1,500 by Month 12, 4,000 by Month 24
- 1-year survival rate of PCB businesses: 88% (vs. ~80% national average)
- 3-year survival rate: 73% (vs. ~62% national average)
- Commons Credits issued: 5 million by Month 12 (= $5 million in network value exchanged)

### Real Estate Portal
- Listed spaces: 200 by Month 6, 500 by Month 12
- Matches (business placed in space): 50 by Month 6, 200 by Month 12
- Pop-up to permanent conversion rate: 30%+

### AI Concierge
- Monthly active users: 300 by Month 6, 1,000 by Month 12
- Average queries per user per month: 4
- User satisfaction: 4.5+ out of 5
- Tax penalty prevention (estimated from concierge-guided filings): 200+ per year

### Economic Impact (by Month 24)
- Additional surviving businesses (vs. national average): 400+
- Additional jobs attributable to program: 2,000+
- Commercial vacancy filled through portal: 500,000+ sq ft
- Estimated tax revenue generated: $15+ million (cumulative, all jurisdictions)
- Net fiscal return on city incentives: 2.0x+

---

## Technical Principles

- **Ship fast, iterate always.** The Civic Dashboard ships in Month 1 with 5 metrics. It gets better every month. Perfection is the enemy of impact.
- **Public by default.** Dashboard data, directory listings, program metrics — all public unless there's a specific reason for privacy. Transparency is the organization's core value and its source of power.
- **Beautiful matters.** Every interface the public sees should be designed with the same care as a great magazine. Civic technology has historically been ugly and forgettable. The Portland Commons should be beautiful and memorable. Design is not decoration. It's credibility.
- **Data provenance is sacred.** Every number on the dashboard cites its source and last-updated date. Every claim in the Progress Report is backed by data. The moment the Portland Commons publishes an inaccurate number, it loses the credibility that makes everything else work.
- **The AI concierge is only as good as its knowledge base.** Invest heavily in knowledge base quality and currency. A concierge that gives wrong tax advice is worse than no concierge at all. Build in confidence scoring — the concierge should say "I'm not sure about this, here's who to call" rather than guessing.
- **Privacy by design.** Business profiles are public (they opted in). Individual financial data (revenue, tax payments, loan details) is private. Concierge conversations are logged for quality improvement but are not shared. The vacancy database identifies properties, not individuals. Commons Credits are public (they're a reputation system). Builders' Table notes are internal.
- **Accessible.** The platform must meet WCAG 2.1 AA accessibility standards. Portland's population includes people with disabilities, people with limited English proficiency, and people with varying levels of digital literacy. The concierge should be usable by someone who has never filed a business tax return.

---

## Appendix: Portland Tax Quick Reference (for Concierge Knowledge Base)

| Tax | Rate | Threshold | Jurisdiction | Filed With |
|-----|------|-----------|-------------|------------|
| Portland Business License Tax | 2.6% of net income | $100 minimum | City of Portland | City Revenue Division |
| Multnomah County Business Income Tax | 2.0% of net income | (same as BLT) | Multnomah County | City Revenue Division |
| Metro Supportive Housing Services (Business) | 1.0% of net income | Gross receipts > $5M | Metro (3-county) | City Revenue Division |
| Metro Supportive Housing Services (Personal) | 1.0% | $125K single / $200K joint | Metro (3-county) | City Revenue Division |
| Multnomah County Preschool for All (Personal) | 1.5% + additional 1.5% above $250K/$400K | $125K single / $200K joint | Multnomah County | City Revenue Division |
| Portland Arts Tax | $35/person/year | Above federal poverty level | City of Portland | City Revenue Division |
| Oregon Corporate Activity Tax | 0.57% of commercial activity above $1M | $1M gross receipts | State of Oregon | Oregon Dept of Revenue |
| Oregon Income Tax | 4.75% - 9.9% progressive | Various brackets | State of Oregon | Oregon Dept of Revenue |
| Paid Leave Oregon | 1% of wages (employer + employee) | All employers | State of Oregon | Oregon Employment Dept |

PFA rate increases by 0.8% in 2027.
Metro SHS threshold increases to $150K single / $250K joint beginning tax year 2026.
Quarterly estimated payments required if liability exceeds $1,000 ($5,000 for Metro beginning 2026).

---

*This specification is a living document. It will be updated as the Portland Commons organization evolves, as city policies change, and as the platform matures.*
