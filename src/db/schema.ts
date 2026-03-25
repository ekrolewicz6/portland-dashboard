import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  doublePrecision,
  boolean,
} from "drizzle-orm/pg-core";

// ── Safety ──────────────────────────────────────────────────────────────

export const safetyCrimeMonthly = pgTable("safety_crime_monthly", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  category: text("category").notNull(),
  offenseType: text("offense_type").notNull(),
  count: integer("count").notNull(),
  ratePer1000: numeric("rate_per_1000"),
  neighborhood: text("neighborhood"),
});

export const safetyGraffitiMonthly = pgTable("safety_graffiti_monthly", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  count: integer("count").notNull(),
});

export const safetyResponseTimes = pgTable("safety_response_times", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  priority: text("priority").notNull(),
  medianMinutes: numeric("median_minutes"),
});

// ── Housing ─────────────────────────────────────────────────────────────

export const housingPermits = pgTable("housing_permits", {
  id: serial("id").primaryKey(),
  permitNum: text("permit_num").unique().notNull(),
  permitType: text("permit_type"),
  projectAddress: text("project_address"),
  valuation: numeric("valuation"),
  applicationDate: date("application_date"),
  issuedDate: date("issued_date"),
  finalDate: date("final_date"),
  status: text("status"),
  processingDays: integer("processing_days"),
});

export const housingPipelineMonthly = pgTable("housing_pipeline_monthly", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  unitsInPipeline: integer("units_in_pipeline"),
  avgProcessingMonths: numeric("avg_processing_months"),
});

export const housingRents = pgTable("housing_rents", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  zipCode: text("zip_code"),
  zori: numeric("zori"),
});

// ── Business ────────────────────────────────────────────────────────────

export const businessLicenses = pgTable("business_licenses", {
  id: serial("id").primaryKey(),
  businessName: text("business_name"),
  address: text("address"),
  naicsCode: text("naics_code"),
  naicsDescription: text("naics_description"),
  dateAdded: date("date_added"),
  lat: doublePrecision("lat"),
  lon: doublePrecision("lon"),
  zipCode: text("zip_code"),
});

export const businessFormationMonthly = pgTable("business_formation_monthly", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  newRegistrations: integer("new_registrations"),
  cancellations: integer("cancellations"),
  netFormation: integer("net_formation"),
});

// ── Downtown ────────────────────────────────────────────────────────────

export const downtownFootTraffic = pgTable("downtown_foot_traffic", {
  id: serial("id").primaryKey(),
  week: date("week").notNull(),
  pctOf2019: numeric("pct_of_2019"),
  dayOfWeek: text("day_of_week"),
});

export const downtownVacancy = pgTable("downtown_vacancy", {
  id: serial("id").primaryKey(),
  quarter: date("quarter").notNull(),
  officeVacancyPct: numeric("office_vacancy_pct"),
  retailVacancyPct: numeric("retail_vacancy_pct"),
});

// ── Migration ───────────────────────────────────────────────────────────

export const migrationWaterMonthly = pgTable("migration_water_monthly", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  activations: integer("activations"),
  deactivations: integer("deactivations"),
  net: integer("net"),
  zipCode: text("zip_code"),
});

export const migrationCensus = pgTable("migration_census", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  population: integer("population"),
  change: integer("change"),
});

// ── Tax ─────────────────────────────────────────────────────────────────

export const taxComparison = pgTable("tax_comparison", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  incomeLevel: integer("income_level").notNull(),
  effectiveRate: numeric("effective_rate"),
  federal: numeric("federal"),
  state: numeric("state"),
  local: numeric("local"),
  other: numeric("other"),
});

// ── Program ─────────────────────────────────────────────────────────────

export const programPcbSummary = pgTable("program_pcb_summary", {
  id: serial("id").primaryKey(),
  asOf: date("as_of").notNull(),
  totalCertified: integer("total_certified"),
  survivalRate1yr: numeric("survival_rate_1yr"),
  jobsCreated: integer("jobs_created"),
  creditsIssued: numeric("credits_issued"),
});

// ── Dashboard Cache ─────────────────────────────────────────────────────

export const dashboardCache = pgTable("dashboard_cache", {
  question: text("question").primaryKey(),
  data: jsonb("data"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Insights ────────────────────────────────────────────────────────────

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  question: text("question"),
  text: text("text"),
  severity: text("severity"),
  ruleName: text("rule_name"),
  metricValue: doublePrecision("metric_value"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ── Climate Accountability Platform ─────────────────────────────────

export const climateWorkplanActions = pgTable("climate_workplan_actions", {
  id: serial("id").primaryKey(),
  actionId: text("action_id").notNull().unique(),      // "E-1", "T-3", "F-2", etc.
  title: text("title").notNull(),
  sector: text("sector").notNull(),                    // "electricity"|"buildings"|"transportation"|etc.
  category: text("category").notNull(),               // "decarbonization"|"resilience"
  leadBureaus: text("lead_bureaus").array().notNull(), // ["BPS","PBOT"]
  isDeclarationPriority: boolean("is_declaration_priority").notNull().default(false),
  fiscalYear: text("fiscal_year"),                    // "FY 22-25","TBD","Ongoing",etc.
  resourceGap: text("resource_gap"),                  // "Funded","$","$$","$$$","$$$$","$$$$$","N/A","TBD","+"
  isPcefFunded: boolean("is_pcef_funded").notNull().default(false),
  isMultiBureau: boolean("is_multi_bureau").notNull().default(false),
  status: text("status").notNull().default("ongoing"), // "achieved"|"ongoing"|"delayed"
  description: text("description"),
  externalPartners: text("external_partners"),
  cobenefits: text("cobenefits"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const climateActionStatusHistory = pgTable("climate_action_status_history", {
  id: serial("id").primaryKey(),
  actionId: text("action_id").notNull(),
  status: text("status").notNull(),
  statusDate: date("status_date").notNull(),
  narrative: text("narrative"),
  source: text("source"),
});

export const climateBureauScorecard = pgTable("climate_bureau_scorecard", {
  id: serial("id").primaryKey(),
  bureauCode: text("bureau_code").notNull().unique(),
  bureauName: text("bureau_name").notNull(),
  totalActions: integer("total_actions").notNull().default(0),
  achievedActions: integer("achieved_actions").notNull().default(0),
  ongoingActions: integer("ongoing_actions").notNull().default(0),
  delayedActions: integer("delayed_actions").notNull().default(0),
  crossBureauActions: integer("cross_bureau_actions").notNull().default(0),
  pcefFundingReceived: numeric("pcef_funding_received"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const climateFinanceSources = pgTable("climate_finance_sources", {
  id: serial("id").primaryKey(),
  fiscalYear: text("fiscal_year").notNull(),
  source: text("source").notNull(),         // "PCEF"|"General Fund"|"Federal/State"|"Unfunded"
  allocationAmount: numeric("allocation_amount"),
  actionCount: integer("action_count"),
});

export const pcefAllocations = pgTable("pcef_allocations", {
  id: serial("id").primaryKey(),
  fiscalYear: text("fiscal_year").notNull(),
  recipient: text("recipient").notNull(),
  recipientType: text("recipient_type").notNull(), // "bureau"|"community"
  amount: numeric("amount").notNull(),
  programArea: text("program_area"),
});

export const pcefInterestDiversions = pgTable("pcef_interest_diversions", {
  id: serial("id").primaryKey(),
  fiscalYear: text("fiscal_year").notNull().unique(),
  amountDiverted: numeric("amount_diverted").notNull(),
  destination: text("destination"),
  notes: text("notes"),
});

export const climateEmissionsTrajectory = pgTable("climate_emissions_trajectory", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  isTarget: boolean("is_target").notNull().default(false),
  targetType: text("target_type"),                        // "2030_goal"|"2050_goal"|null
  totalMtco2e: numeric("total_mtco2e"),
  electricityMtco2e: numeric("electricity_mtco2e"),
  buildingsMtco2e: numeric("buildings_mtco2e"),
  transportationMtco2e: numeric("transportation_mtco2e"),
  wasteMtco2e: numeric("waste_mtco2e"),
  industryMtco2e: numeric("industry_mtco2e"),
  otherMtco2e: numeric("other_mtco2e"),
  populationThousands: numeric("population_thousands"),
});

// ── Progress Reports ───────────────────────────────────────────────────

import { boolean as pgBoolean, pgSchema } from "drizzle-orm/pg-core";

export const contentSchema = pgSchema("content");

export const progressReports = contentSchema.table("progress_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issueDate: date("issue_date").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  coverImageUrl: text("cover_image_url"),
  published: pgBoolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportSections = contentSchema.table("report_sections", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .notNull()
    .references(() => progressReports.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  sectionOrder: integer("section_order").notNull(),
  sectionType: text("section_type").default("article"), // article, data-summary, profile, recommendation
  dataQuery: text("data_query"),
  dataSnapshot: jsonb("data_snapshot"),
});
