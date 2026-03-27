# Portland Civic Dashboard: The Questions That Matter

## What This Document Is

This is a comprehensive specification for a public accountability dashboard that answers one meta-question: **Is Portland getting better or worse, and who is responsible?**

Every metric below is chosen because it connects to a specific policy lever that a specific decision-maker controls. This isn't a data visualization exercise. It's an accountability tool. Every number should make someone in government either proud or uncomfortable.

The dashboard should be legible to a resident with no policy background. No jargon. No acronyms without explanation. Every metric should be accompanied by: what the number means, whether it's moving in the right direction, who controls it, and what the resident can do about it.

---

## 1. Housing: Are We Building Enough?

Housing supply is the single most important variable determining whether Portland is affordable, stable, and growing. Every metric here answers a version of the same question: is the city producing enough homes for the people who want to live here?

### Production

- **Housing units permitted per month** (by type: single-family, duplex/triplex/fourplex, multifamily 5+, ADU). Target: 10,000 units per year. Tracked monthly, reported as a rolling 12-month total.
- **Housing units completed per month** (same type breakdown). Permits tell you what's planned. Completions tell you what's real. The gap between permits and completions reveals construction delays, financing failures, and projects that die in the pipeline.
- **Average time from permit application to permit issuance** (by project type). This is the direct measure of permitting dysfunction. Break it out by residential vs. commercial, by number of units, and by whether the project required discretionary review.
- **Average time from permit issuance to certificate of occupancy.** This captures construction timeline, inspection delays, and any post-permit bureaucratic friction.
- **Number of projects currently in the permitting queue**, with average wait time. This is the backlog. If it's growing, the system is falling behind.
- **Number of housing units lost to demolition per month.** Net supply is what matters. If the city permits 800 units but demolishes 200, the net gain is 600.

### Affordability

- **Median rent by bedroom count** (studio, 1BR, 2BR, 3BR), citywide and by neighborhood cluster. Updated monthly. This is the number that tells ordinary people whether they can afford to live here.
- **Median home sale price**, citywide and by neighborhood cluster. Updated monthly.
- **Rent-to-income ratio at median income.** What percentage of a median Portland household's income goes to rent? The standard threshold is 30%. Above that, households are cost-burdened.
- **Percentage of households that are cost-burdened** (paying more than 30% of income on housing) and **severely cost-burdened** (paying more than 50%). Broken out by renter vs. owner and by income bracket.
- **Number of income-restricted affordable units in the pipeline** (permitted, under construction, completed). Broken out by AMI target (30%, 50%, 60%, 80%).
- **Waitlist length for Section 8 vouchers and public housing.** This is the direct measure of unmet demand for subsidized housing. If the waitlist is years long, the system is failing the people it's designed to serve.
- **Vacancy rate** (rental and ownership). Low vacancy = tight market = upward price pressure. A healthy rental vacancy rate is 5-7%. Below that, landlords have too much power and rents rise.

### Zoning and Land Use

- **Percentage of residentially zoned land that allows multifamily housing by right** (no conditional use, no design review). This is the structural constraint on supply. Track it over time as upzoning proposals advance.
- **Number of land use appeals filed** (to LUBA, to hearings officer, to council). High appeal volume means the system is being used to block or delay housing.
- **Average delay caused by design review** (additional time beyond administrative review for comparable projects). This quantifies the cost of discretionary process.
- **Number of ADU permits issued per month.** A proxy for whether the ADU policy is actually producing units or just sitting on the books.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Permitting speed | City Manager / Permitting Bureau Director | Staffing, process reform, technology |
| Zoning code | City Council + BPS | Code amendments, upzoning |
| Affordable housing funding | City Council + Metro + State | Budget allocation, tax credits, bonds |
| Section 8 / public housing | Home Forward (housing authority) | Federal funding, local priorities |
| SDC waivers | City Council | Fee schedule reform |

---

## 2. Homelessness: Are People Getting Housed?

**Central frame: Flow-through.** The system is over-leveraged in shelter and under-leveraged in housing placement. The March 2026 quarterly joint city-county meeting consensus: "build a system that people can flow through and isn't over-leveraged in any one area." The dashboard should visualize the entire pipeline — inflow into homelessness, movement through the system (shelter, services, outreach), and outflow into permanent housing — and show where the bottlenecks are.

### Q1: What Is Driving the Inflow?

Evictions are the single biggest inflow driver that people underestimate. January 2026 had the highest number of evictions in Oregon history. The primary data source is Dr. Lisa Bates' "Evicted in Oregon" project at HRAC (PSU).

- **Eviction filings and completions by month**, statewide and Portland metro, from the HRAC Evicted in Oregon dataset. Show trend over time, by geography, and correlate with entries into the homelessness system (by-name list new entries).
- **Hospital discharges to homelessness** — people discharged from hospitals with no housing plan. The mayor has raised this as a policy issue ("sending people back across the river").
- **Loss of income/benefits** — Social Security not keeping pace with rent. Track the gap between SSI/SSDI payments and median studio rent.
- **The definitional gap** — HRAC's ~2017 regional prevalence study estimated 20,000–30,000 people experience homelessness for at least one night per year, including doubled-up populations the federal PIT definition excludes. Show the federal PIT count and the local/expanded estimate side by side so the public can see the gap.

### Q2: Where Is the System Over-Leveraged and Under-Leveraged?

This is the core rebalancing question. HSD has put forward a list of where they want to see shelter reduced. Shelter is "where the biggest investments are, where the most money is."

- **Spending by intervention type** — shelter, rapid rehousing, PSH, outreach, transitional housing. Map spending against outcomes for each.
- **People entering each intervention type** and **people exiting to permanent housing** from each. What's the housing placement rate per intervention?
- **Cost per successful housing placement** by intervention type. This is the efficiency metric.
- **System balance visualization** — a pipeline/funnel showing where people are in the system (unsheltered → outreach → shelter → transitional → permanent housing) and where the bottlenecks are.

Data sources: HSD data dashboard (may only have Q2), HMIS (all county-funded providers must use it), Metro regional reporting on SHS-funded interventions ("closest thing we have to a regional story of what interventions work and what don't work").

### Q3: Why Are 1,863 Affordable Housing Units Sitting Empty?

Units are set at 60% and 80% AMI but people can't afford even those levels. There's never been proper investment in 0–30% AMI units. Social Security doesn't keep pace with rent. Background checks and lack of rental history block people even when affordability isn't the issue. Landlord guarantee programs exist but aren't deep enough.

- **Total available affordable units by AMI level** (0-30%, 30-50%, 50-60%, 60-80%, 80%+)
- **Vacancy rates by AMI level** — which AMI bands have the most empty units?
- **The affordability gap** — what residents at various income levels can actually pay vs. what units at each AMI level require
- **Cost of buying down rents** to fill empty units (Mitch Green's work)
- **KATU vs Home Forward discrepancy** — KATU reported 1,863 empty units (7.5% of ~25,000) in December 2025; Home Forward reports 900 but is disputing its own numbers. Surface both transparently.

### Q4: Which Shelters and Interventions Are Most Effective?

Commissioner Singleton has been working on this question — she put out a memo or had a work session examining which shelters were most effective at housing placement.

- **Per-shelter outcomes**: how many people entered, how many exited to permanent housing, median length of stay, cost per successful placement.
- **Per-intervention-type outcomes**: same metrics aggregated by intervention (congregate shelter, non-congregate, safe rest village, rapid rehousing, PSH, transitional).
- **Provider-level transparency** that currently doesn't exist publicly.

Data sources: Singleton's shelter effectiveness memo/work session (Quinn locating), HSD internal data (Quinn connecting with contacts), HMIS system.

### Q5: What's the Behavioral Health and Addiction Crossover?

Health Share (manages Medicaid locally) just completed a study with HSD examining how many people on the by-name list are also enrolled Health Share members, what services they're getting, and where the crossovers are. They found correlation around high-utilizer users.

- **Of people on the by-name list**: how many are enrolled in Medicaid, how many have behavioral health diagnoses, how many have addiction diagnoses
- **Services being received across systems** — what's the overlap between homelessness services and behavioral health services?
- **The misinformation counter** — the Trump administration claimed "75% of your people are mentally ill and have drug addiction." The Health Share data can show what the actual percentages are.
- **Overdose trends** among homeless population (existing data from Medical Examiner)

Data sources: Health Share / HSD crossover study (may not be public yet — Quinn checking), HMIS, County Health Department.

### Q6: What's the Outreach Coverage?

The county reorganized outreach into geographic sectors with different agencies responsible for each, plus "free agent" culturally specific and mental health orgs that cross sectors. They're using Survey 123 (Esri) to capture contact frequency. The mayor's office has its own outreach workers focused on "public space management" (camp sweeps) collecting data separately.

- **Unique individuals contacted by any outreach worker**
- **How many contacted individuals are in the by-name list**
- **How many are receiving services**
- **How many are in the housing placement pipeline**

**Data gap flag:** Quinn was clear this is the least developed data area. Probably only one quarter of Survey 123 data exists and may not be published yet. Flag this honestly rather than pretending data exists that doesn't.

### Q7: Where Are People Going When They Leave?

The mayor's out-of-state relocation program (bus/plane tickets) raises the question "do they come back?" The next PIT count will also be distorted by overnight-only shelters inflating the shelter number and camping enforcement pushing people out of countable locations.

- **Exits from the system by destination** — permanent housing, out-of-state relocation, return to streets, institutional (jail, hospital), unknown
- **Return rates** for people relocated out of state
- **PIT count methodology caveats** — how enforcement and shelter policy changes distort the count

Data sources: HMIS exit records, mayor's office outreach data.

### Q8: What's the Regional Picture?

Metro is the convener and funder. The new Regional Policy Oversight Committee (RPAC) starting April 2026 will be the new governing body for regional coordination. Metro hosted summer 2025 case study meetings comparing Houston, San Antonio, and Canadian cities — those are available online.

- **Three-county comparison** — Multnomah, Washington, Clackamas on key metrics
- **SHS money by county** — how much each receives and how they're spending it
- **Metro regional data vs individual county reporting** — where do the numbers disagree?
- **National comparison** — Houston and San Antonio models (from Metro PMC case studies)

### Addiction and Behavioral Health (retained from original spec)

- **Number of publicly funded addiction treatment slots available** (inpatient, outpatient, MAT).
- **Average wait time for addiction treatment intake.** If it's more than 24 hours, the system is designed to fail.
- **Number of people receiving medication-assisted treatment (MAT)** (buprenorphine, methadone, naltrexone).
- **Overdose deaths per month** (total and by substance, among homeless population and countywide).
- **Naloxone (Narcan) administrations per month** (by EMS, by bystander).
- **Number of publicly funded psychiatric beds available vs. occupied.**
- **Average wait time in emergency departments for psychiatric placement.**
- **Behavioral health workforce: number of licensed providers accepting new patients.**

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Shelter capacity & balance | HSD (county) + Metro | Budget, contracting, shelter reduction plan |
| PSH and rapid rehousing | Metro (SHS tax) + Home Forward | Funding allocation, unit production |
| Eviction prevention | State Legislature + County | Tenant protections, rental assistance |
| Affordable housing vacancies | Home Forward + OHCS + landlords | Rent buydowns, subsidy depth, barrier removal |
| Treatment capacity | Multnomah County + OHA (state) | Medicaid, provider contracts |
| Overdose response | County Health Department + State | Naloxone distribution, MAT access |
| Behavioral health workforce | State Legislature + OHA | Licensing, reimbursement rates, loan forgiveness |
| Outreach coordination | HSD + Mayor's office | Sector assignments, data sharing |
| Regional coordination | Metro RPAC (starting April 2026) | SHS allocation, cross-county standards |

### Key Data Sources

| Source | What It Provides | Status |
|--------|-----------------|--------|
| HRAC / PSU (Dr. Marisa Zapata) | PIT methodology, prevalence estimates, eviction data (Dr. Lisa Bates) | Public |
| HSD data dashboard | Outreach contacts, system flow, shelter data | Partial (may only have Q2) |
| HMIS | Individual-level entries, exits, destinations for all county-funded providers | Internal; new replacement under development |
| Metro regional reporting | SHS spending, intervention outcomes by county | Public |
| Health Share / HSD crossover study | Medicaid enrollment, behavioral health overlap with by-name list | May not be public (Quinn checking) |
| Singleton shelter effectiveness memo | Per-shelter housing placement rates | Quinn locating |
| Home Forward | Housing authority vacancy data | Public but disputed (900 units) |
| KATU / media | 1,863 empty affordable units, Dec 2025 | Published |
| Metro RPAC meetings | Regional governance decisions | Public, starting April 2026 |
| Metro PMC case studies (summer 2025) | Houston, San Antonio, Canadian city comparisons | Online (video) |
| Survey 123 (Esri) | Outreach contact frequency by geographic sector | ~1 quarter, may not be published |

---

## 3. Public Safety: Are People Safe?

Safety isn't just a crime statistic. It's response time, it's presence, it's whether people feel safe enough to use public space.

### Crime

- **Violent crime rate per 100,000 residents** (homicide, assault, robbery, sexual assault). Monthly, with 12-month rolling average.
- **Property crime rate per 100,000 residents** (burglary, theft, motor vehicle theft, arson). Monthly, with 12-month rolling average.
- **Gun violence incidents per month** (shootings, regardless of whether someone dies). Homicide is a lagging indicator. Shootings capture the broader violence picture.
- **Hate crimes reported per month.**
- **Domestic violence calls per month.**
- **Crime by neighborhood.** Citywide averages obscure the reality that crime is concentrated in specific areas. Map it.

### Police Capacity and Response

- **PPB sworn officer headcount vs. authorized strength.** The gap between these two numbers is the staffing crisis.
- **Average 911 response time for priority 1 calls** (imminent danger to life). The standard is under 5 minutes. What's the actual number?
- **Average 911 response time for priority 2 and 3 calls.** These are the calls where response has degraded most severely.
- **Percentage of 911 calls that receive no response or are closed without dispatch.** This is the invisible failure — calls that go into a void.
- **Number of calls diverted to Portland Street Response** (behavioral health team) and outcomes of those calls. This measures whether the alternative response model is working and scaling.
- **Officer retention rate** (annual). How many officers are leaving, and is it improving?
- **Recruitment pipeline: applications received, offers made, officers hired per quarter.**
- **Use of force incidents per month.** Tracked by type (firearm, taser, physical) and by whether the use was found justified by oversight review.
- **Civilian complaints filed and sustained per quarter.** Tracks accountability.
- **Community Police Oversight Board actions** (investigations opened, completed, discipline recommended and imposed).

### Fire and EMS

- **Average EMS response time for cardiac and stroke calls.** Minutes save lives. This should be under 8 minutes.
- **Fire response time for structure fires.**
- **EMS call volume trends** (total and by type). Rising behavioral health-related EMS calls indicate the mental health system is failing.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Officer staffing | Mayor + City Manager + City Council (budget) | Recruitment, pay, working conditions |
| Response times | PPB Chief / City Manager | Deployment, staffing allocation |
| Portland Street Response | City Council (budget) + bureau leadership | Expansion funding, staffing |
| Oversight | Community Police Oversight Board | Investigation authority, discipline |
| Violence intervention | City Council (budget) + program directors | Funding, program design |

---

## 4. Transportation: Can You Get Around?

The question is whether Portland's transportation system serves people who depend on it, not just people who choose it.

### Transit

- **TriMet ridership by mode** (bus, MAX, WES, streetcar). Monthly, with pre-pandemic comparison. Ridership is the fundamental measure of whether transit is useful.
- **On-time performance by line.** A bus that's scheduled every 15 minutes but actually arrives every 25 minutes is a 25-minute-frequency bus. On-time performance is the real frequency.
- **Average headway (wait time) on the 20 highest-ridership bus lines.** These are the lines that matter most to the most people.
- **Service hours operated per month** (total and by mode). This is the raw measure of how much transit service exists.
- **Fare revenue vs. operating cost** (farebox recovery ratio). Not because transit should be profitable — it shouldn't — but because this ratio drives political arguments about funding.
- **Safety incidents on transit** (assaults, harassment, drug use, other). Reported per million boardings to normalize for ridership.
- **Rider satisfaction survey results** (TriMet conducts these periodically). Subjective, but important.
- **Percentage of Portland residents within a quarter mile of 15-minute-or-better transit service.** This is the access metric. It tells you whether transit is a realistic option for most people.

### Roads and Active Transportation

- **Traffic fatalities and serious injuries per month** (total, pedestrian, cyclist). Portland has a Vision Zero goal. Track whether it's real.
- **Miles of protected bike lanes built per year.** Track cumulative total and gap to plan.
- **Sidewalk condition complaints filed and resolved.** ADA compliance and basic walkability.
- **Pothole reports filed and average time to repair.** A proxy for basic infrastructure maintenance.
- **Bridge condition ratings** (Portland has many aging bridges; seismic vulnerability is a real risk).
- **Average commute time by mode** (drive alone, carpool, transit, bike, walk, remote). How are people actually getting to work, and is it getting better or worse?

### Congestion and Climate

- **Vehicle miles traveled (VMT) per capita.** Declining VMT means people are driving less, which means the transportation system is offering real alternatives.
- **Transportation-sector carbon emissions.** Portland has climate targets. Is transportation pulling its weight?
- **Mode share** (percentage of trips by car, transit, bike, walk). The shift from car to everything else is the structural measure of transportation system health.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Transit service levels | TriMet Board (governor-appointed) + TriMet GM | Service planning, budget |
| Transit funding | State Legislature + Metro | Payroll tax rate, new revenue authority |
| Bike/ped infrastructure | PBOT Director + City Council (budget) | Capital budget, project prioritization |
| Traffic safety | PBOT + City Council | Speed limits, enforcement, design standards |
| Congestion pricing | ODOT + State Legislature | Tolling authority, pricing structure |

---

## 5. Education: Are Kids Learning and Are Families Staying?

Families leave Portland when schools don't work. Schools don't work when families leave. Breaking this cycle requires tracking outcomes, not just inputs.

### Enrollment and Demographics

- **PPS total enrollment and year-over-year change.** Declining enrollment is the canary in the coal mine.
- **Enrollment by school** (to identify which schools are losing students and why).
- **Percentage of school-age children in the district attending PPS vs. charter, private, or homeschool.** The exodus to non-PPS options is a revealed preference about quality.
- **Student demographics** (race, income/free-reduced lunch eligibility, English language learner status). Track whether PPS is serving all of Portland's children or only some.

### Academic Outcomes

- **Third-grade reading proficiency rate.** The single most predictive early indicator of long-term academic success. If kids can't read by third grade, the system is failing them.
- **Eighth-grade math proficiency rate.** The gateway to high school math, which is the gateway to college readiness.
- **High school graduation rate** (4-year and 5-year). Broken out by race, income, and school.
- **Chronic absenteeism rate** (percentage of students missing 10% or more of school days). This spiked during and after the pandemic and hasn't recovered in many districts. It's a proxy for disengagement.
- **College enrollment rate within 12 months of graduation.** Not because college is the only path, but because it measures whether PPS is preparing students who want college to get there.
- **CTE program enrollment and completion.** Are career and technical pathways available and are students using them?

### Resources and Operations

- **Per-pupil spending** (total and by school). Compared to state and national averages.
- **Teacher vacancy rate by school.** Schools in lower-income neighborhoods often have more vacancies. Track the disparity.
- **Average class size by grade level and school.**
- **Teacher retention rate** (annual, by school). Schools with high turnover can't build culture or consistency.
- **Average teacher salary vs. cost of living** (can a PPS teacher afford to live in Portland on their salary?).
- **School building condition** (deferred maintenance backlog, seismic readiness). Portland's school buildings are aging and many are seismically vulnerable.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Curriculum, staffing, budgets | PPS School Board + Superintendent | District policy, budget |
| Teacher pay | PPS Board (negotiated with union) | Contract negotiations |
| State funding level | State Legislature + Governor | State School Fund allocation |
| CTE programs | PPS + PCC + state | Funding, program development |
| Building condition | PPS Board + voters (bonds) | Capital bonds, maintenance budget |

---

## 6. Fiscal Health: Is the City Solvent and Spending Wisely?

Residents need to know whether their tax dollars are producing results. This section tracks the financial health of the city and the efficiency of its spending.

### Revenue

- **Total city general fund revenue, year-over-year.** Is the tax base growing, flat, or declining?
- **Revenue by source** (income tax, property tax, fees, intergovernmental transfers). How dependent is the city on volatile sources?
- **Revenue per capita compared to peer cities** (Seattle, Denver, Minneapolis, Austin). Is Portland taxing enough to fund its ambitions?
- **Effective tax rate for a median-income household** (combining all local taxes: city, county, Metro, state). What's the actual total burden?
- **Business tax revenue and number of business tax filers.** Is the business base growing or shrinking?

### Spending

- **General fund spending by bureau, year-over-year.** Where is the money going, and how is the allocation changing?
- **Spending per capita on key services** (police, fire, parks, transportation, housing) compared to peer cities.
- **Capital project completion rate: percentage of budgeted capital projects completed on time and on budget.** This is the direct measure of whether the city can execute on its own plans.
- **Overtime spending by bureau** (especially PPB and Fire). Overtime is a proxy for understaffing and a massive cost driver.
- **Consultant and contractor spending as a percentage of total budget.** High contractor spending can indicate a government that's outsourced its own capacity.

### Debt and Obligations

- **Total outstanding general obligation and revenue bond debt.**
- **Debt service as a percentage of general fund revenue.** How much of the budget is already committed before a dollar is spent on services?
- **Pension funding ratio** (PERS). Oregon's pension system is a statewide issue, but the city's unfunded liability is a major long-term fiscal risk.
- **PERS contribution as a percentage of payroll.** This is money that goes to retirees rather than to current services. Track it because it crowds out everything else.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| City budget | City Council + City Manager | Annual budget process |
| Tax rates (city) | City Council (some require voter approval) | Rate-setting, ballot referrals |
| Tax rates (county/Metro) | County Commission / Metro Council | Separate budget processes |
| State funding / PERS | State Legislature + Governor | State budget, PERS reform |
| Capital project execution | City Manager + bureau directors | Project management, procurement |

---

## 7. Economy: Can People Make a Living Here?

A city that's unaffordable for working people is a city that's dying from the inside. These metrics track whether Portland's economy works for everyone or only for the top.

### Jobs and Wages

- **Unemployment rate** (metro area, monthly).
- **Median household income** (annual, with inflation adjustment). Is real income growing?
- **Median wage by sector** (tech, healthcare, manufacturing, retail, food service, construction). Are the jobs being created jobs you can live on?
- **Job growth by sector** (monthly, seasonally adjusted). Which parts of the economy are expanding and which are contracting?
- **Number of jobs paying above the self-sufficiency standard** (the income needed for a household to meet basic needs without assistance, which in Portland is significantly higher than minimum wage).

### Business Environment

- **New business registrations per month.**
- **Business closures per month** (especially in the central city).
- **Commercial vacancy rate by district** (downtown, inner east, outer east, industrial). High vacancy is a blight and a revenue problem.
- **Average time to obtain a business license.** Another permitting/bureaucracy measure.
- **Small business loan volume** (SBA and local CDFI lending). Is capital available for small businesses?

### Central City Vitality

- **Downtown pedestrian counts** (automated counters at key intersections). Are people coming downtown?
- **Downtown retail sales tax proxy** (Oregon doesn't have sales tax, but business income or employee count can serve as a proxy for economic activity).
- **Office occupancy rate** (percentage of leased office space that's actually occupied). Remote work has structurally changed this. Track it.
- **Hotel occupancy rate and convention bookings.** Tourism and events are a significant downtown revenue driver.
- **Number of ground-floor commercial vacancies on key corridors** (Broadway, Morrison, Burnside, MLK, Hawthorne, Division, Alberta). This is the street-level vitality measure.

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Business licensing speed | City Manager + Revenue Division | Process reform |
| Commercial vacancy | City Council (vacancy tax policy) | Tax incentives/penalties |
| Downtown vitality | Prosper Portland + City Council | Economic development strategy |
| Workforce development | State (WorkSource Oregon) + PCC | Training programs, funding |
| Office-to-residential conversion | City Council + BPS (zoning) | Zoning changes, incentives |

---

## 8. Environment and Climate: Are We Meeting Our Own Goals?

Portland set ambitious climate targets. This section asks whether any of them are being met.

### Emissions

- **Total greenhouse gas emissions** (citywide, annual). Portland's target is net zero by 2050. Where are we on the trajectory?
- **Emissions by sector** (transportation, buildings, industry, waste). Which sectors are making progress and which aren't?
- **Per capita emissions** (to account for population growth).
- **Renewable energy share of electricity supply.**

### Built Environment

- **Percentage of new construction that is all-electric.** This should be approaching 100% under current policy.
- **Number of buildings subject to building performance standards and percentage in compliance.**
- **Energy use intensity of commercial building stock** (average BTU per square foot). Declining = progress.

### Natural Environment

- **Urban tree canopy coverage** (percentage, by neighborhood). Cross-reference with heat vulnerability maps.
- **Air quality index exceedance days** (days where AQI exceeds "good" threshold). Wildfire smoke has made this a growing concern.
- **Impervious surface area** (total and as percentage of city area). Measures stormwater risk and heat island effect.
- **Waste diversion rate** (percentage of waste diverted from landfill through recycling and composting).

### Climate Resilience

- **Number of cooling centers and their capacity vs. peak heat demand.** The 2021 heat dome killed people. Is the city prepared for the next one?
- **Households in the floodplain** (especially as climate models update flood risk).
- **Seismic retrofit progress on critical infrastructure** (bridges, schools, hospitals, water system).

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Building electrification | City Council (code) + BPS | Building code amendments |
| Transportation emissions | PBOT + TriMet + ODOT | Mode shift, EV infrastructure |
| Tree canopy | Urban Forestry (Parks) + BDS (code) | Planting programs, development requirements |
| Climate planning | BPS + City Council | Climate action plan implementation |
| Air quality | DEQ (state) + federal (EPA) | Regulation, wildfire management |

---

## 9. Quality of Life: Does Portland Work as a Place to Live?

These are the metrics that don't fit neatly into policy categories but that residents experience directly every day.

### Parks and Public Space

- **Park acreage per 1,000 residents** (by neighborhood). East Portland has far less park access than inner Portland.
- **Parks maintenance backlog** (deferred maintenance in dollars).
- **Community center and pool hours of operation** (compared to pre-pandemic levels). Many facilities cut hours and haven't restored them.
- **Library hours and circulation.** Libraries are social infrastructure. Are they open?

### Infrastructure

- **Percentage of streets in fair or better condition** (pavement condition index).
- **Water and sewer main breaks per month.** Aging infrastructure.
- **Boil water notices issued.** A proxy for water system reliability.
- **Broadband access** (percentage of households with access to high-speed internet, by neighborhood).

### Civic Participation

- **Voter turnout in most recent city election** (overall and by district). The new district system makes this trackable at a granular level.
- **Voter turnout in county, Metro, and special district elections.**
- **Public comment participation** (number of unique individuals providing testimony at council, county, Metro hearings). Is civic engagement broad or narrow?
- **Number of neighborhood association members as a percentage of district population.** How representative are the organizations that claim to speak for neighborhoods?

### Who Controls These Numbers

| Metric | Decision-Maker | Lever |
|--------|---------------|-------|
| Parks funding | City Council (budget) + Metro (bonds) | Budget allocation |
| Library hours | Multnomah County (libraries are county-run) | County budget |
| Street maintenance | PBOT + City Council (budget) | Capital and maintenance budgets |
| Water/sewer | Portland Water Bureau + BES | Capital investment, rate-setting |

---

## 10. The Accountability Layer: Who Promised What?

This section doesn't track metrics. It tracks commitments. Every elected official, every agency director, every ballot measure made promises. The dashboard should track whether those promises are being kept.

### Elected Official Scorecards

For each elected official (mayor, city council members by district, county commissioners, Metro councilors, state legislators representing Portland):

- **Campaign commitments** (what they said they'd do when running for office).
- **Votes cast** on key issues tracked by the dashboard.
- **Budget priorities** (what they funded and what they cut).
- **Constituent responsiveness** (average response time to constituent inquiries, if measurable; otherwise, qualitative assessment from users of the platform).

### Ballot Measure Tracking

Portland voters have approved multiple ballot measures with specific promises. Track each one:

- **Measure name and year passed.**
- **Revenue collected to date.**
- **Spending to date, by category.**
- **Promised outcomes vs. actual outcomes.**
- **Administrative overhead as a percentage of total spending.**

This applies to: Metro Supportive Housing Services measure, Multnomah County Preschool for All, Portland Clean Energy Fund, Portland Arts Tax, and any future measures.

### Agency Performance

For each major bureau and agency:

- **Strategic plan goals vs. actual performance.**
- **Budget vs. actual spending** (underspending is as much a red flag as overspending — it means money allocated for services isn't being deployed).
- **Staff vacancy rate.** A bureau with 20% vacancies isn't delivering at full capacity regardless of its budget.
- **Audit findings** (from the City Auditor, County Auditor, or Secretary of State). Are recommendations being implemented?

---

## How to Read This Dashboard

The dashboard should have three layers:

**Layer 1: The Headline.** A single screen showing the 10-15 most important numbers with green/yellow/red indicators for direction of travel. A resident should be able to glance at this screen and know whether Portland is on track. This is the screen that goes viral, that gets screenshot and shared, that council members see in their mentions.

**Layer 2: The Issue Deep Dive.** Click into any headline metric and get the full context: trend over time, breakdown by neighborhood or demographic, comparison to peer cities, who controls it, and what actions are available.

**Layer 3: The Action.** From any metric, the resident can take action. "Housing permits are down 15% year-over-year. The permitting bureau is understaffed. City Council controls the budget. Contact your council member to fund full permitting staff." One click to send.

This three-layer structure — headline, context, action — is what turns a dashboard from information into infrastructure. Information without action is trivia. Action without information is noise. The combination is power.

---

## Data Sources

| Category | Primary Sources |
|----------|----------------|
| Housing | BDS/Permitting Bureau (permits), Census ACS (demographics, cost burden), RMLS (sale prices), CoStar or Apartment List (rents), Home Forward (vouchers) |
| Homelessness | JOHS (shelter data, PIT count), Multnomah County (behavioral health), OHA (treatment data), ME's office (overdose deaths) |
| Public Safety | PPB (crime data, response times, staffing), BOEC (911 data), Portland Street Response (call data), CPOB (oversight data) |
| Transportation | TriMet (ridership, on-time performance), PBOT (traffic counts, bike counts, crash data), ODOT (VMT, mode share) |
| Education | PPS (enrollment, outcomes, staffing), ODE (state testing, graduation rates) |
| Fiscal | City budget office (revenue, spending), PERS (pension data), City Auditor (audits) |
| Economy | BLS (employment, wages), Census (income), Prosper Portland (business data), CoStar (commercial vacancy) |
| Environment | BPS (emissions inventory), DEQ (air quality), Urban Forestry (canopy), Metro (waste diversion) |
| Civic | Elections office (turnout), city records (public testimony), GASB reports |

Many of these sources publish data on different schedules (monthly, quarterly, annually, biannually). The dashboard should clearly indicate the recency of each metric and flag when data is stale.

---

## A Note on What This Dashboard Is Not

This is not a neutral data portal. Portland already has data portals. They sit unused because raw data without narrative is meaningless to a resident trying to figure out whether their city is working.

This dashboard takes positions. It says: permitting should be faster. There should be more housing. Response times should be lower. Treatment should be available on demand. Every number is presented in the context of a direction — are we going the right way or the wrong way? — and a responsible party — who can change this?

That editorial layer is what makes it useful. And it's what makes it powerful. A politician can ignore a dataset. A politician cannot ignore a dashboard that tells 50,000 residents, in plain language, that their bureau is failing and here's the phone number to call about it.

That's the point. Not data for data's sake. Data as accountability. Data as leverage. Data as the infrastructure of self-governance.
