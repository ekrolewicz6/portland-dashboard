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
