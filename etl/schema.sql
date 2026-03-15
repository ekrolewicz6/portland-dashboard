-- =============================================================================
-- Portland Commons Civic Dashboard — PostgreSQL Schema
-- =============================================================================
--
-- Database schema organized around seven civic questions:
--   1. Is Portland gaining or losing people?       (migration.*)
--   2. Is Portland gaining or losing businesses?   (business.*)
--   3. Is downtown coming back to life?            (downtown.*)
--   4. Is Portland safe?                           (safety.*)
--   5. Is the tax burden competitive?              (tax.*)
--   6. Is housing getting built?                   (housing.*)
--   7. Is the Portland Commons working?            (program.*)
--
-- Plus reference data (reference.*), auto-generated insights, and ETL logging.
--
-- Requires: PostgreSQL 14+, PostGIS 3+
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- trigram index support for text search
CREATE EXTENSION IF NOT EXISTS btree_gist;       -- exclusion constraint support

-- =============================================================================
-- SCHEMAS
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS migration;
COMMENT ON SCHEMA migration IS 'People movement: water activations, Census, IRS migration flows';

CREATE SCHEMA IF NOT EXISTS business;
COMMENT ON SCHEMA business IS 'Business formation: BLT registrations, CivicApps licenses, SOS filings';

CREATE SCHEMA IF NOT EXISTS downtown;
COMMENT ON SCHEMA downtown IS 'Downtown vitality: Placer foot traffic, vacancy, CoStar CRE data';

CREATE SCHEMA IF NOT EXISTS safety;
COMMENT ON SCHEMA safety IS 'Public safety: PPB crime, dispatched calls, PDX Reporter';

CREATE SCHEMA IF NOT EXISTS tax;
COMMENT ON SCHEMA tax IS 'Tax burden: comparative rate tables across jurisdictions';

CREATE SCHEMA IF NOT EXISTS housing;
COMMENT ON SCHEMA housing IS 'Housing supply: permits, Zillow rents, PHB affordable housing';

CREATE SCHEMA IF NOT EXISTS program;
COMMENT ON SCHEMA program IS 'Portland Commons program: PCB registry, credits, matches';

CREATE SCHEMA IF NOT EXISTS reference;
COMMENT ON SCHEMA reference IS 'GIS boundaries, neighborhoods, parcels, zoning';

-- =============================================================================
-- REFERENCE SCHEMA — shared lookup and GIS data
-- =============================================================================

CREATE TABLE reference.neighborhoods (
    neighborhood_id   SERIAL PRIMARY KEY,
    name              TEXT NOT NULL UNIQUE,
    coalition         TEXT,                            -- neighborhood coalition name
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    area_sq_miles     NUMERIC(8,3),
    population_est    INTEGER,                         -- latest Census estimate
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.neighborhoods IS 'Official Portland neighborhood boundaries (Source 6)';
CREATE INDEX idx_neighborhoods_geom ON reference.neighborhoods USING GIST (geom);
CREATE INDEX idx_neighborhoods_name ON reference.neighborhoods USING btree (name);

CREATE TABLE reference.council_districts (
    district_id       SERIAL PRIMARY KEY,
    district_number   SMALLINT NOT NULL UNIQUE,
    council_member    TEXT,
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.council_districts IS 'Portland 12-district council boundaries';
CREATE INDEX idx_council_districts_geom ON reference.council_districts USING GIST (geom);

CREATE TABLE reference.urban_renewal_areas (
    ura_id            SERIAL PRIMARY KEY,
    name              TEXT NOT NULL UNIQUE,
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.urban_renewal_areas IS 'TIF district boundaries';
CREATE INDEX idx_ura_geom ON reference.urban_renewal_areas USING GIST (geom);

CREATE TABLE reference.zoning (
    zoning_id         SERIAL PRIMARY KEY,
    zone_code         TEXT NOT NULL,
    zone_description  TEXT,
    zone_category     TEXT,                            -- residential, commercial, industrial, mixed
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    effective_date    DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.zoning IS 'Current zoning designations for all parcels (Source 6)';
CREATE INDEX idx_zoning_geom ON reference.zoning USING GIST (geom);
CREATE INDEX idx_zoning_code ON reference.zoning USING btree (zone_code);

CREATE TABLE reference.parcels (
    parcel_id         SERIAL PRIMARY KEY,
    taxlot_id         TEXT NOT NULL UNIQUE,             -- county tax lot identifier
    site_address      TEXT,
    owner_name        TEXT,
    owner_address     TEXT,
    property_class    TEXT,                             -- commercial, residential, industrial, mixed
    assessed_value    NUMERIC(14,2),
    real_market_value NUMERIC(14,2),
    building_sqft     INTEGER,
    year_built        SMALLINT,
    land_use          TEXT,
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    zone_code         TEXT,
    data_year         SMALLINT NOT NULL,                -- assessment year
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.parcels IS 'Taxlot/parcel data with assessor attributes (Sources 6, 7)';
CREATE INDEX idx_parcels_geom ON reference.parcels USING GIST (geom);
CREATE INDEX idx_parcels_taxlot ON reference.parcels USING btree (taxlot_id);
CREATE INDEX idx_parcels_address ON reference.parcels USING btree (site_address);
CREATE INDEX idx_parcels_property_class ON reference.parcels USING btree (property_class);
CREATE INDEX idx_parcels_neighborhood ON reference.parcels USING btree (neighborhood_id);

CREATE TABLE reference.building_footprints (
    footprint_id      SERIAL PRIMARY KEY,
    taxlot_id         TEXT REFERENCES reference.parcels(taxlot_id),
    sqft              INTEGER,
    geom              GEOMETRY(Polygon, 4326) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.building_footprints IS 'Building outlines with square footage (Source 6)';
CREATE INDEX idx_building_footprints_geom ON reference.building_footprints USING GIST (geom);

CREATE TABLE reference.census_tracts (
    tract_id          SERIAL PRIMARY KEY,
    geoid             TEXT NOT NULL UNIQUE,             -- full FIPS code e.g. 41051001100
    tract_number      TEXT NOT NULL,
    county_fips       TEXT NOT NULL DEFAULT '41051',    -- Multnomah County
    geom              GEOMETRY(MultiPolygon, 4326) NOT NULL,
    population_est    INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.census_tracts IS 'Census tract boundaries for spatial joins and HUD data';
CREATE INDEX idx_census_tracts_geom ON reference.census_tracts USING GIST (geom);
CREATE INDEX idx_census_tracts_geoid ON reference.census_tracts USING btree (geoid);

CREATE TABLE reference.zip_codes (
    zip_id            SERIAL PRIMARY KEY,
    zip_code          TEXT NOT NULL UNIQUE,
    geom              GEOMETRY(MultiPolygon, 4326),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE reference.zip_codes IS 'ZIP code boundaries for aggregation';
CREATE INDEX idx_zip_codes_geom ON reference.zip_codes USING GIST (geom);

-- =============================================================================
-- MIGRATION SCHEMA — "Is Portland gaining or losing people?"
-- =============================================================================

CREATE TABLE migration.water_activations (
    activation_id     BIGSERIAL PRIMARY KEY,
    zip_code          TEXT NOT NULL,
    month             DATE NOT NULL,                   -- first of month
    account_type      TEXT NOT NULL CHECK (account_type IN ('residential', 'commercial')),
    activations       INTEGER NOT NULL DEFAULT 0,
    deactivations     INTEGER NOT NULL DEFAULT 0,
    net_change        INTEGER GENERATED ALWAYS AS (activations - deactivations) STORED,
    source_file       TEXT,                            -- PRR file reference
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (zip_code, month, account_type)
);
COMMENT ON TABLE migration.water_activations IS 'Monthly water service activations/deactivations by ZIP — real-time migration proxy (Source 9)';
CREATE INDEX idx_water_activations_month ON migration.water_activations USING btree (month);
CREATE INDEX idx_water_activations_zip ON migration.water_activations USING btree (zip_code);

CREATE TABLE migration.census_population (
    pop_id            SERIAL PRIMARY KEY,
    geography         TEXT NOT NULL,                   -- 'multnomah_county', 'portland_city', etc.
    geoid             TEXT,                            -- FIPS code
    year              SMALLINT NOT NULL,
    population        INTEGER NOT NULL,
    source_program    TEXT NOT NULL CHECK (source_program IN ('pep', 'acs1', 'acs5', 'decennial')),
    margin_of_error   INTEGER,                         -- MOE for ACS estimates
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (geography, year, source_program)
);
COMMENT ON TABLE migration.census_population IS 'Annual population estimates from Census PEP and ACS (Source 15)';

CREATE TABLE migration.census_demographics (
    demo_id           SERIAL PRIMARY KEY,
    geoid             TEXT NOT NULL,
    year              SMALLINT NOT NULL,
    source_program    TEXT NOT NULL CHECK (source_program IN ('acs1', 'acs5')),
    median_income     NUMERIC(10,2),
    median_rent       NUMERIC(8,2),
    poverty_rate      NUMERIC(5,2),
    homeownership_rate NUMERIC(5,2),
    commute_drive_pct NUMERIC(5,2),
    commute_transit_pct NUMERIC(5,2),
    commute_wfh_pct   NUMERIC(5,2),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (geoid, year, source_program)
);
COMMENT ON TABLE migration.census_demographics IS 'ACS demographic, income, and commuting data (Source 15)';

CREATE TABLE migration.irs_migration (
    irs_id            SERIAL PRIMARY KEY,
    tax_year          SMALLINT NOT NULL,
    direction         TEXT NOT NULL CHECK (direction IN ('inflow', 'outflow')),
    other_county_fips TEXT NOT NULL,                   -- origin/destination county
    other_county_name TEXT,
    other_state_fips  TEXT,
    other_state_name  TEXT,
    returns           INTEGER NOT NULL,                -- number of tax returns (proxy for households)
    exemptions        INTEGER,                         -- proxy for individuals
    agi_thousands     NUMERIC(14,2),                   -- adjusted gross income in $1000s
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tax_year, direction, other_county_fips)
);
COMMENT ON TABLE migration.irs_migration IS 'County-to-county migration flows from IRS SOI data (Source 16). AGI enables income-weighted migration analysis.';
CREATE INDEX idx_irs_migration_year ON migration.irs_migration USING btree (tax_year);
CREATE INDEX idx_irs_migration_direction ON migration.irs_migration USING btree (direction);

CREATE TABLE migration.employment (
    emp_id            SERIAL PRIMARY KEY,
    area_code         TEXT NOT NULL,                   -- BLS area code (Portland MSA)
    area_name         TEXT NOT NULL DEFAULT 'Portland-Vancouver-Hillsboro',
    month             DATE NOT NULL,
    series_id         TEXT NOT NULL,                   -- BLS series identifier
    metric            TEXT NOT NULL,                   -- 'total_employment', 'unemployment_rate', etc.
    value             NUMERIC(12,2) NOT NULL,
    seasonal_adj      BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (area_code, month, series_id)
);
COMMENT ON TABLE migration.employment IS 'BLS CES/LAUS employment and unemployment data for Portland MSA (Source 14)';
CREATE INDEX idx_employment_month ON migration.employment USING btree (month);

-- =============================================================================
-- BUSINESS SCHEMA — "Is Portland gaining or losing businesses?"
-- =============================================================================

CREATE TABLE business.blt_registrations (
    blt_id            BIGSERIAL PRIMARY KEY,
    business_name     TEXT NOT NULL,
    business_address  TEXT,
    naics_code        TEXT,
    naics_description TEXT,
    registration_status TEXT NOT NULL CHECK (registration_status IN ('active', 'inactive', 'cancelled', 'expired')),
    status_date       DATE,                            -- date of current status
    snapshot_date     DATE NOT NULL,                   -- date of PRR data file
    geom              GEOMETRY(Point, 4326),            -- geocoded location
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    zip_code          TEXT,
    source_file       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE business.blt_registrations IS 'Portland Business License Tax registrations from Revenue Division PRR (Source 8). Key input for net formation and vacancy cross-reference.';
CREATE INDEX idx_blt_address ON business.blt_registrations USING btree (business_address);
CREATE INDEX idx_blt_status ON business.blt_registrations USING btree (registration_status);
CREATE INDEX idx_blt_snapshot ON business.blt_registrations USING btree (snapshot_date);
CREATE INDEX idx_blt_naics ON business.blt_registrations USING btree (naics_code);
CREATE INDEX idx_blt_geom ON business.blt_registrations USING GIST (geom);
CREATE INDEX idx_blt_neighborhood ON business.blt_registrations USING btree (neighborhood_id);
CREATE INDEX idx_blt_name_trgm ON business.blt_registrations USING GIN (business_name gin_trgm_ops);

CREATE TABLE business.civicapps_licenses (
    license_id        BIGSERIAL PRIMARY KEY,
    business_name     TEXT NOT NULL,
    address           TEXT,
    naics_code        TEXT,
    naics_description TEXT,
    date_added        DATE NOT NULL,
    latitude          NUMERIC(10,7),
    longitude         NUMERIC(10,7),
    geom              GEOMETRY(Point, 4326),
    zip_code          TEXT,
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    api_id            TEXT UNIQUE,                      -- dedupe key from CivicApps
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE business.civicapps_licenses IS 'New business license registrations from CivicApps API — rolling 12-month window (Source 3)';
CREATE INDEX idx_civicapps_date ON business.civicapps_licenses USING btree (date_added);
CREATE INDEX idx_civicapps_naics ON business.civicapps_licenses USING btree (naics_code);
CREATE INDEX idx_civicapps_geom ON business.civicapps_licenses USING GIST (geom);
CREATE INDEX idx_civicapps_neighborhood ON business.civicapps_licenses USING btree (neighborhood_id);

CREATE TABLE business.sos_filings (
    filing_id         BIGSERIAL PRIMARY KEY,
    entity_name       TEXT NOT NULL,
    entity_type       TEXT NOT NULL,                    -- LLC, corporation, DBA, etc.
    filing_date       DATE NOT NULL,
    status            TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'dissolved', 'suspended', 'other')),
    registered_agent  TEXT,
    agent_address     TEXT,
    county            TEXT DEFAULT 'Multnomah',
    registry_number   TEXT UNIQUE,                     -- SOS registry number
    source_file       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE business.sos_filings IS 'Oregon SOS business entity filings for Multnomah County (Source 13)';
CREATE INDEX idx_sos_filing_date ON business.sos_filings USING btree (filing_date);
CREATE INDEX idx_sos_status ON business.sos_filings USING btree (status);
CREATE INDEX idx_sos_entity_type ON business.sos_filings USING btree (entity_type);

CREATE TABLE business.net_formation_monthly (
    formation_id      SERIAL PRIMARY KEY,
    month             DATE NOT NULL,                   -- first of month
    new_registrations INTEGER NOT NULL DEFAULT 0,
    cancellations     INTEGER NOT NULL DEFAULT 0,
    net_formation     INTEGER GENERATED ALWAYS AS (new_registrations - cancellations) STORED,
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    naics_sector      TEXT,                            -- 2-digit NAICS sector
    source            TEXT NOT NULL DEFAULT 'blt',     -- blt, civicapps, sos
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (month, neighborhood_id, naics_sector, source)
);
COMMENT ON TABLE business.net_formation_monthly IS 'Pre-computed monthly net business formation. Primary headline metric.';
CREATE INDEX idx_net_formation_month ON business.net_formation_monthly USING btree (month);

-- =============================================================================
-- DOWNTOWN SCHEMA — "Is downtown coming back to life?"
-- =============================================================================

CREATE TABLE downtown.placer_foot_traffic (
    traffic_id        BIGSERIAL PRIMARY KEY,
    location_name     TEXT NOT NULL,                    -- corridor or POI name
    location_type     TEXT NOT NULL CHECK (location_type IN ('corridor', 'poi', 'central_city')),
    week_start        DATE NOT NULL,                   -- Monday of the week
    total_visitors    INTEGER NOT NULL,
    baseline_2019     INTEGER,                         -- same-week 2019 visitors
    recovery_pct      NUMERIC(6,2),                    -- visitors / baseline_2019 * 100
    avg_dwell_minutes NUMERIC(6,1),
    repeat_visit_rate NUMERIC(5,2),                    -- % visitors returning within 30d
    pct_residents     NUMERIC(5,2),                    -- % from downtown ZIP codes
    pct_inner_neighborhoods NUMERIC(5,2),
    pct_suburbs       NUMERIC(5,2),
    pct_outside_metro NUMERIC(5,2),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (location_name, week_start)
);
COMMENT ON TABLE downtown.placer_foot_traffic IS 'Weekly foot traffic from Placer.ai via Clean & Safe or direct subscription (Source 4)';
CREATE INDEX idx_placer_week ON downtown.placer_foot_traffic USING btree (week_start);
CREATE INDEX idx_placer_location ON downtown.placer_foot_traffic USING btree (location_name);

CREATE TABLE downtown.placer_hourly_pattern (
    pattern_id        BIGSERIAL PRIMARY KEY,
    location_name     TEXT NOT NULL,
    week_start        DATE NOT NULL,
    day_of_week       SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
    hour_of_day       SMALLINT NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
    visitor_index     NUMERIC(6,2) NOT NULL,           -- normalized to weekly peak = 100
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (location_name, week_start, day_of_week, hour_of_day)
);
COMMENT ON TABLE downtown.placer_hourly_pattern IS 'Hour-of-day x day-of-week visitor heatmap data from Placer.ai';
CREATE INDEX idx_placer_hourly_week ON downtown.placer_hourly_pattern USING btree (week_start);

CREATE TABLE downtown.vacancy_properties (
    vacancy_id        BIGSERIAL PRIMARY KEY,
    taxlot_id         TEXT REFERENCES reference.parcels(taxlot_id),
    site_address      TEXT NOT NULL,
    property_type     TEXT NOT NULL CHECK (property_type IN ('office', 'retail', 'industrial', 'mixed', 'other')),
    building_sqft     INTEGER,
    vacancy_status    TEXT NOT NULL CHECK (vacancy_status IN ('vacant', 'partially_vacant', 'occupied', 'unknown')),
    vacancy_source    TEXT NOT NULL,                    -- 'blt_crossref', 'costar', 'ground_truth', 'listing', 'hud_usps'
    listed_for_lease  BOOLEAN DEFAULT false,
    asking_rent_psf   NUMERIC(8,2),                    -- per sq ft annual
    broker_name       TEXT,
    last_verified     DATE NOT NULL,
    geom              GEOMETRY(Point, 4326),
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE downtown.vacancy_properties IS 'Proprietary vacancy database: BLT cross-reference + CoStar + ground truth + listings (Sources 8,11,12)';
CREATE INDEX idx_vacancy_geom ON downtown.vacancy_properties USING GIST (geom);
CREATE INDEX idx_vacancy_status ON downtown.vacancy_properties USING btree (vacancy_status);
CREATE INDEX idx_vacancy_type ON downtown.vacancy_properties USING btree (property_type);
CREATE INDEX idx_vacancy_neighborhood ON downtown.vacancy_properties USING btree (neighborhood_id);
CREATE INDEX idx_vacancy_address ON downtown.vacancy_properties USING btree (site_address);

CREATE TABLE downtown.costar_market (
    costar_id         SERIAL PRIMARY KEY,
    submarket         TEXT NOT NULL,
    property_type     TEXT NOT NULL CHECK (property_type IN ('office', 'retail', 'industrial', 'multifamily')),
    building_class    TEXT CHECK (building_class IN ('A', 'B', 'C', NULL)),
    quarter           DATE NOT NULL,                   -- first day of quarter
    vacancy_rate_pct  NUMERIC(5,2),
    asking_rent_psf   NUMERIC(8,2),
    net_absorption_sf INTEGER,                         -- sq ft leased minus vacated
    sublease_avail_sf INTEGER,                         -- leading indicator
    inventory_sf      INTEGER,                         -- total market inventory
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (submarket, property_type, building_class, quarter)
);
COMMENT ON TABLE downtown.costar_market IS 'Quarterly CRE market metrics from CoStar by submarket and property type (Source 11)';
CREATE INDEX idx_costar_quarter ON downtown.costar_market USING btree (quarter);
CREATE INDEX idx_costar_submarket ON downtown.costar_market USING btree (submarket);

CREATE TABLE downtown.hud_usps_vacancy (
    hud_id            SERIAL PRIMARY KEY,
    geoid             TEXT NOT NULL,                    -- census tract FIPS
    quarter           DATE NOT NULL,                   -- first day of quarter
    total_addresses   INTEGER,
    residential_vacant INTEGER,
    commercial_vacant  INTEGER,
    residential_vacancy_pct NUMERIC(5,2),
    commercial_vacancy_pct  NUMERIC(5,2),
    no_stat_addresses INTEGER,                         -- addresses where carrier cannot determine
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (geoid, quarter)
);
COMMENT ON TABLE downtown.hud_usps_vacancy IS 'HUD/USPS residential and commercial vacancy by census tract (Source 10). Validation layer for proprietary vacancy DB.';
CREATE INDEX idx_hud_quarter ON downtown.hud_usps_vacancy USING btree (quarter);
CREATE INDEX idx_hud_geoid ON downtown.hud_usps_vacancy USING btree (geoid);

CREATE TABLE downtown.trimet_ridership (
    ridership_id      SERIAL PRIMARY KEY,
    route_name        TEXT NOT NULL,                    -- MAX Blue, Line 72, etc.
    route_type        TEXT NOT NULL CHECK (route_type IN ('max', 'bus', 'streetcar', 'wes')),
    month             DATE NOT NULL,
    total_boardings   INTEGER NOT NULL,
    baseline_2019     INTEGER,
    recovery_pct      NUMERIC(6,2),
    source            TEXT NOT NULL DEFAULT 'trimet_report',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (route_name, month)
);
COMMENT ON TABLE downtown.trimet_ridership IS 'Monthly transit ridership by line from TriMet performance reports (Source 5)';
CREATE INDEX idx_trimet_month ON downtown.trimet_ridership USING btree (month);

CREATE TABLE downtown.ground_truth_observations (
    obs_id            BIGSERIAL PRIMARY KEY,
    corridor_name     TEXT NOT NULL,
    address           TEXT NOT NULL,
    observation_date  DATE NOT NULL,
    observer          TEXT,
    ground_floor_use  TEXT CHECK (ground_floor_use IN ('open_business', 'closed_business', 'vacant', 'construction', 'residential', 'office', 'other')),
    business_name     TEXT,
    business_type     TEXT,
    condition_notes   TEXT,
    photo_url         TEXT,
    geom              GEOMETRY(Point, 4326),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE downtown.ground_truth_observations IS 'Manual ground-truthing walk observations for priority corridors';
CREATE INDEX idx_ground_truth_corridor ON downtown.ground_truth_observations USING btree (corridor_name);
CREATE INDEX idx_ground_truth_date ON downtown.ground_truth_observations USING btree (observation_date);
CREATE INDEX idx_ground_truth_geom ON downtown.ground_truth_observations USING GIST (geom);

-- =============================================================================
-- SAFETY SCHEMA — "Is Portland safe?"
-- =============================================================================

CREATE TABLE safety.ppb_offenses (
    offense_id        BIGSERIAL PRIMARY KEY,
    case_number       TEXT NOT NULL,
    offense_type      TEXT NOT NULL,                    -- NIBRS offense type
    nibrs_code        TEXT,
    offense_category  TEXT NOT NULL CHECK (offense_category IN ('person', 'property', 'society', 'other')),
    offense_date      DATE NOT NULL,
    report_date       DATE,
    block_address     TEXT,
    neighborhood_name TEXT,
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    geom              GEOMETRY(Point, 4326),
    data_year         SMALLINT NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (case_number, nibrs_code)
);
COMMENT ON TABLE safety.ppb_offenses IS 'PPB reported offenses by type, neighborhood, and date (Source 1)';
CREATE INDEX idx_ppb_offenses_date ON safety.ppb_offenses USING btree (offense_date);
CREATE INDEX idx_ppb_offenses_category ON safety.ppb_offenses USING btree (offense_category);
CREATE INDEX idx_ppb_offenses_type ON safety.ppb_offenses USING btree (offense_type);
CREATE INDEX idx_ppb_offenses_neighborhood ON safety.ppb_offenses USING btree (neighborhood_id);
CREATE INDEX idx_ppb_offenses_geom ON safety.ppb_offenses USING GIST (geom);
CREATE INDEX idx_ppb_offenses_year ON safety.ppb_offenses USING btree (data_year);

CREATE TABLE safety.ppb_dispatched_calls (
    call_id           BIGSERIAL PRIMARY KEY,
    call_number       TEXT NOT NULL,
    call_type         TEXT NOT NULL,
    priority          SMALLINT CHECK (priority BETWEEN 1 AND 4),
    dispatch_time     TIMESTAMPTZ NOT NULL,
    arrival_time      TIMESTAMPTZ,
    close_time        TIMESTAMPTZ,
    response_seconds  INTEGER,                         -- arrival - dispatch
    block_address     TEXT,
    neighborhood_name TEXT,
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    geom              GEOMETRY(Point, 4326),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (call_number)
);
COMMENT ON TABLE safety.ppb_dispatched_calls IS 'PPB dispatched calls with response times — critical for safety headline (Source 1)';
CREATE INDEX idx_dispatch_time ON safety.ppb_dispatched_calls USING btree (dispatch_time);
CREATE INDEX idx_dispatch_priority ON safety.ppb_dispatched_calls USING btree (priority);
CREATE INDEX idx_dispatch_neighborhood ON safety.ppb_dispatched_calls USING btree (neighborhood_id);
CREATE INDEX idx_dispatch_geom ON safety.ppb_dispatched_calls USING GIST (geom);
CREATE INDEX idx_dispatch_type ON safety.ppb_dispatched_calls USING btree (call_type);

CREATE TABLE safety.ppb_staffing (
    staffing_id       SERIAL PRIMARY KEY,
    report_date       DATE NOT NULL UNIQUE,
    sworn_authorized  INTEGER,                         -- budgeted positions
    sworn_actual      INTEGER,                         -- filled positions
    vacancy_count     INTEGER GENERATED ALWAYS AS (sworn_authorized - sworn_actual) STORED,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE safety.ppb_staffing IS 'PPB sworn officer staffing levels over time';

CREATE TABLE safety.pdx_reporter (
    report_id         BIGSERIAL PRIMARY KEY,
    report_type       TEXT NOT NULL,                    -- graffiti, illegal_dumping, abandoned_vehicle, etc.
    report_category   TEXT,                            -- livability, infrastructure, safety
    address           TEXT,
    geom              GEOMETRY(Point, 4326),
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    date_submitted    TIMESTAMPTZ NOT NULL,
    date_resolved     TIMESTAMPTZ,
    resolution_status TEXT CHECK (resolution_status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
    resolution_days   INTEGER,
    source_id         TEXT UNIQUE,                     -- dedupe key from source system
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE safety.pdx_reporter IS 'PDX Reporter / 311 citizen reports of livability issues (Source 17)';
CREATE INDEX idx_pdx_reporter_date ON safety.pdx_reporter USING btree (date_submitted);
CREATE INDEX idx_pdx_reporter_type ON safety.pdx_reporter USING btree (report_type);
CREATE INDEX idx_pdx_reporter_neighborhood ON safety.pdx_reporter USING btree (neighborhood_id);
CREATE INDEX idx_pdx_reporter_geom ON safety.pdx_reporter USING GIST (geom);
CREATE INDEX idx_pdx_reporter_status ON safety.pdx_reporter USING btree (resolution_status);

-- =============================================================================
-- TAX SCHEMA — "Is the tax burden competitive?"
-- =============================================================================

CREATE TABLE tax.jurisdictions (
    jurisdiction_id   SERIAL PRIMARY KEY,
    name              TEXT NOT NULL UNIQUE,             -- 'Portland, OR', 'Vancouver, WA', etc.
    state             TEXT NOT NULL,
    is_peer           BOOLEAN NOT NULL DEFAULT false,   -- peer comparison city
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tax.jurisdictions IS 'Jurisdictions for tax burden comparison';

CREATE TABLE tax.rate_components (
    component_id      SERIAL PRIMARY KEY,
    jurisdiction_id   INTEGER NOT NULL REFERENCES tax.jurisdictions(jurisdiction_id),
    tax_year          SMALLINT NOT NULL,
    component_name    TEXT NOT NULL,                    -- 'federal_income', 'state_income', 'city_arts', 'metro_shs', 'property', etc.
    rate_pct          NUMERIC(8,4),                     -- percentage rate
    flat_amount       NUMERIC(10,2),                    -- flat dollar amount (e.g., arts tax)
    income_floor      NUMERIC(12,2),                    -- income threshold where rate applies
    income_ceiling    NUMERIC(12,2),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (jurisdiction_id, tax_year, component_name)
);
COMMENT ON TABLE tax.rate_components IS 'Individual tax components by jurisdiction and year. Used to compute effective rates.';
CREATE INDEX idx_rate_components_jurisdiction ON tax.rate_components USING btree (jurisdiction_id);

CREATE TABLE tax.effective_rates (
    rate_id           SERIAL PRIMARY KEY,
    jurisdiction_id   INTEGER NOT NULL REFERENCES tax.jurisdictions(jurisdiction_id),
    tax_year          SMALLINT NOT NULL,
    income_level      NUMERIC(12,2) NOT NULL,          -- e.g., 75000, 150000, 200000, 500000
    effective_rate_pct NUMERIC(6,3) NOT NULL,           -- total effective tax rate
    total_tax_amount  NUMERIC(12,2) NOT NULL,
    methodology_note  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (jurisdiction_id, tax_year, income_level)
);
COMMENT ON TABLE tax.effective_rates IS 'Pre-computed effective tax rates at standard income levels for dashboard comparison table';
CREATE INDEX idx_effective_rates_year ON tax.effective_rates USING btree (tax_year);

-- =============================================================================
-- HOUSING SCHEMA — "Is housing getting built?"
-- =============================================================================

CREATE TABLE housing.permits (
    permit_id         BIGSERIAL PRIMARY KEY,
    permit_number     TEXT NOT NULL UNIQUE,
    permit_type       TEXT NOT NULL,                    -- new_construction, commercial_ti, change_of_use, residential, demolition
    permit_subtype    TEXT,
    project_address   TEXT,
    description       TEXT,
    valuation         NUMERIC(14,2),
    units_proposed    INTEGER,                         -- residential units if applicable
    application_date  DATE,
    issued_date       DATE,
    final_date        DATE,
    expired_date      DATE,
    status            TEXT NOT NULL CHECK (status IN ('in_review', 'approved', 'issued', 'finaled', 'expired', 'cancelled', 'withdrawn')),
    processing_days   INTEGER,                         -- issued_date - application_date
    geom              GEOMETRY(Point, 4326),
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    zip_code          TEXT,
    arcgis_object_id  BIGINT,                          -- dedupe key from ArcGIS
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE housing.permits IS 'Building permits from PP&D via ArcGIS REST API (Source 2). Processing time is the key metric for 90-day guarantee tracking.';
CREATE INDEX idx_permits_type ON housing.permits USING btree (permit_type);
CREATE INDEX idx_permits_status ON housing.permits USING btree (status);
CREATE INDEX idx_permits_app_date ON housing.permits USING btree (application_date);
CREATE INDEX idx_permits_issued_date ON housing.permits USING btree (issued_date);
CREATE INDEX idx_permits_geom ON housing.permits USING GIST (geom);
CREATE INDEX idx_permits_neighborhood ON housing.permits USING btree (neighborhood_id);
CREATE INDEX idx_permits_processing ON housing.permits USING btree (processing_days) WHERE processing_days IS NOT NULL;

CREATE TABLE housing.zillow_rents (
    rent_id           SERIAL PRIMARY KEY,
    region_name       TEXT NOT NULL,                    -- ZIP code, neighborhood, or metro name
    region_type       TEXT NOT NULL CHECK (region_type IN ('zip', 'city', 'metro', 'neighborhood')),
    month             DATE NOT NULL,
    zori_value        NUMERIC(8,2) NOT NULL,           -- Zillow Observed Rent Index
    mom_change_pct    NUMERIC(6,2),                    -- month-over-month change
    yoy_change_pct    NUMERIC(6,2),                    -- year-over-year change
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (region_name, region_type, month)
);
COMMENT ON TABLE housing.zillow_rents IS 'Zillow Observed Rent Index (ZORI) by ZIP/metro, monthly (Source 18)';
CREATE INDEX idx_zillow_month ON housing.zillow_rents USING btree (month);
CREATE INDEX idx_zillow_region ON housing.zillow_rents USING btree (region_name);

CREATE TABLE housing.phb_affordable (
    phb_id            SERIAL PRIMARY KEY,
    project_name      TEXT NOT NULL,
    address           TEXT,
    total_units       INTEGER,
    affordable_units  INTEGER,
    ami_level         TEXT,                            -- '30% AMI', '60% AMI', etc.
    status            TEXT NOT NULL CHECK (status IN ('pipeline', 'under_construction', 'completed', 'operating')),
    funding_source    TEXT,                            -- SDC exemption, CET, LIHTC, etc.
    completion_date   DATE,
    geom              GEOMETRY(Point, 4326),
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    data_quarter      DATE,                            -- reporting quarter
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE housing.phb_affordable IS 'PHB affordable housing inventory and pipeline (Source 19)';
CREATE INDEX idx_phb_status ON housing.phb_affordable USING btree (status);
CREATE INDEX idx_phb_geom ON housing.phb_affordable USING GIST (geom);

CREATE TABLE housing.permit_processing_monthly (
    processing_id     SERIAL PRIMARY KEY,
    month             DATE NOT NULL,
    permit_type       TEXT NOT NULL,
    permits_issued    INTEGER NOT NULL DEFAULT 0,
    avg_processing_days NUMERIC(6,1),
    median_processing_days NUMERIC(6,1),
    p90_processing_days NUMERIC(6,1),                  -- 90th percentile
    pct_within_90_days NUMERIC(5,2),                   -- % meeting the guarantee
    total_valuation   NUMERIC(16,2),
    total_units       INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (month, permit_type)
);
COMMENT ON TABLE housing.permit_processing_monthly IS 'Pre-computed monthly permit processing statistics for dashboard headline';
CREATE INDEX idx_permit_processing_month ON housing.permit_processing_monthly USING btree (month);

-- =============================================================================
-- PROGRAM SCHEMA — "Is the Portland Commons working?"
-- =============================================================================

CREATE TABLE program.pcb_businesses (
    pcb_id            SERIAL PRIMARY KEY,
    business_name     TEXT NOT NULL,
    owner_name        TEXT,
    address           TEXT,
    naics_code        TEXT,
    industry_sector   TEXT,
    certification_date DATE NOT NULL,
    certification_status TEXT NOT NULL CHECK (certification_status IN ('active', 'graduated', 'suspended', 'expired')),
    employees_at_cert INTEGER,
    employees_current INTEGER,
    annual_revenue_band TEXT,                          -- '<100K', '100K-500K', '500K-1M', '>1M'
    geom              GEOMETRY(Point, 4326),
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE program.pcb_businesses IS 'Portland Commons Business registry — all certified businesses';
CREATE INDEX idx_pcb_status ON program.pcb_businesses USING btree (certification_status);
CREATE INDEX idx_pcb_cert_date ON program.pcb_businesses USING btree (certification_date);
CREATE INDEX idx_pcb_geom ON program.pcb_businesses USING GIST (geom);

CREATE TABLE program.pcb_survival (
    survival_id       SERIAL PRIMARY KEY,
    pcb_id            INTEGER NOT NULL REFERENCES program.pcb_businesses(pcb_id),
    check_date        DATE NOT NULL,
    months_since_cert INTEGER NOT NULL,
    is_operating      BOOLEAN NOT NULL,
    employees         INTEGER,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pcb_id, check_date)
);
COMMENT ON TABLE program.pcb_survival IS 'Periodic survival checks for certified PCB businesses';
CREATE INDEX idx_survival_pcb ON program.pcb_survival USING btree (pcb_id);

CREATE TABLE program.commons_credits (
    credit_id         SERIAL PRIMARY KEY,
    pcb_id            INTEGER NOT NULL REFERENCES program.pcb_businesses(pcb_id),
    credit_type       TEXT NOT NULL,                    -- 'launch_sponsor', 'founders_fund', 'real_estate_match', etc.
    amount            NUMERIC(12,2),
    issued_date       DATE NOT NULL,
    status            TEXT NOT NULL CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    sponsor_name      TEXT,                            -- for launch sponsor credits
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE program.commons_credits IS 'Commons Credits issued to PCB businesses';
CREATE INDEX idx_credits_pcb ON program.commons_credits USING btree (pcb_id);
CREATE INDEX idx_credits_type ON program.commons_credits USING btree (credit_type);
CREATE INDEX idx_credits_date ON program.commons_credits USING btree (issued_date);

CREATE TABLE program.real_estate_matches (
    match_id          SERIAL PRIMARY KEY,
    pcb_id            INTEGER NOT NULL REFERENCES program.pcb_businesses(pcb_id),
    vacancy_id        BIGINT REFERENCES downtown.vacancy_properties(vacancy_id),
    property_address  TEXT NOT NULL,
    match_date        DATE NOT NULL,
    match_status      TEXT NOT NULL CHECK (match_status IN ('proposed', 'touring', 'negotiating', 'signed', 'declined', 'expired')),
    lease_sqft        INTEGER,
    lease_rate_psf    NUMERIC(8,2),
    lease_term_months INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE program.real_estate_matches IS 'Real Estate Portal matches — PCB businesses matched to vacant spaces';
CREATE INDEX idx_matches_pcb ON program.real_estate_matches USING btree (pcb_id);
CREATE INDEX idx_matches_status ON program.real_estate_matches USING btree (match_status);

CREATE TABLE program.founders_fund_loans (
    loan_id           SERIAL PRIMARY KEY,
    pcb_id            INTEGER NOT NULL REFERENCES program.pcb_businesses(pcb_id),
    amount            NUMERIC(12,2) NOT NULL,
    interest_rate_pct NUMERIC(4,2),
    term_months       INTEGER,
    origination_date  DATE NOT NULL,
    status            TEXT NOT NULL CHECK (status IN ('active', 'current', 'delinquent', 'paid_off', 'defaulted', 'written_off')),
    balance_remaining NUMERIC(12,2),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE program.founders_fund_loans IS 'Founders Fund micro-loans to PCB businesses';
CREATE INDEX idx_loans_pcb ON program.founders_fund_loans USING btree (pcb_id);
CREATE INDEX idx_loans_status ON program.founders_fund_loans USING btree (status);

-- =============================================================================
-- INSIGHTS TABLE — auto-generated story detection
-- =============================================================================

CREATE TABLE public.insights (
    insight_id        BIGSERIAL PRIMARY KEY,
    question_slug     TEXT NOT NULL,                    -- migration, business, downtown, safety, tax, housing, program
    insight_type      TEXT NOT NULL CHECK (insight_type IN (
        'threshold_crossing', 'trend_reversal', 'geographic_outlier',
        'comparison_milestone', 'program_milestone', 'anomaly', 'yoy_change'
    )),
    headline          TEXT NOT NULL,                    -- human-readable insight sentence
    detail            TEXT,                            -- supporting context
    metric_name       TEXT NOT NULL,                   -- which metric triggered it
    metric_value      NUMERIC,
    comparison_value  NUMERIC,                         -- prior month, baseline, etc.
    comparison_label  TEXT,                            -- 'prior_month', '2019_baseline', '12mo_avg', etc.
    severity          TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')) DEFAULT 'medium',
    neighborhood_id   INTEGER REFERENCES reference.neighborhoods(neighborhood_id),
    generated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    published         BOOLEAN NOT NULL DEFAULT false,  -- included in Portland Pulse digest
    published_at      TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,                     -- optional auto-expiration
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.insights IS 'Auto-generated story insights from the rules-based detection engine. Surfaces on dashboard and in Portland Pulse email digest.';
CREATE INDEX idx_insights_question ON public.insights USING btree (question_slug);
CREATE INDEX idx_insights_type ON public.insights USING btree (insight_type);
CREATE INDEX idx_insights_generated ON public.insights USING btree (generated_at DESC);
CREATE INDEX idx_insights_published ON public.insights USING btree (published) WHERE published = false;
CREATE INDEX idx_insights_severity ON public.insights USING btree (severity);

-- =============================================================================
-- ETL MONITORING
-- =============================================================================

CREATE TABLE public.etl_log (
    log_id            BIGSERIAL PRIMARY KEY,
    source_name       TEXT NOT NULL,                    -- e.g., 'ppb_crime', 'civicapps', 'zillow_zori'
    worker_name       TEXT NOT NULL,                    -- Python worker script name
    run_id            UUID NOT NULL DEFAULT gen_random_uuid(),
    status            TEXT NOT NULL CHECK (status IN ('started', 'success', 'warning', 'failure')),
    started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at       TIMESTAMPTZ,
    duration_seconds  NUMERIC(10,2),
    rows_fetched      INTEGER,
    rows_inserted     INTEGER,
    rows_updated      INTEGER,
    rows_rejected     INTEGER,
    error_message     TEXT,
    error_detail      TEXT,                            -- stack trace or detail
    metadata          JSONB,                           -- flexible bag for source-specific info
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.etl_log IS 'ETL pipeline run log for monitoring, alerting, and "last updated" timestamps on dashboard';
CREATE INDEX idx_etl_log_source ON public.etl_log USING btree (source_name);
CREATE INDEX idx_etl_log_status ON public.etl_log USING btree (status);
CREATE INDEX idx_etl_log_started ON public.etl_log USING btree (started_at DESC);
CREATE INDEX idx_etl_log_run ON public.etl_log USING btree (run_id);

CREATE TABLE public.etl_source_config (
    config_id         SERIAL PRIMARY KEY,
    source_name       TEXT NOT NULL UNIQUE,
    schema_name       TEXT NOT NULL,
    automation_tier   TEXT NOT NULL CHECK (automation_tier IN ('A', 'B', 'C', 'D')),
    schedule          TEXT NOT NULL,                    -- cron expression or description
    expected_frequency TEXT NOT NULL,                   -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
    staleness_threshold_hours INTEGER NOT NULL DEFAULT 168, -- alert if no success in this many hours
    api_url           TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.etl_source_config IS 'Configuration and scheduling metadata for each ETL data source';

-- Seed source configs matching the spec
INSERT INTO public.etl_source_config (source_name, schema_name, automation_tier, schedule, expected_frequency, staleness_threshold_hours, notes) VALUES
    ('ppb_crime',           'safety',    'B', '0 6 1 * *',    'monthly',   840,  'PPB Tableau CSV download, ~30-day lag'),
    ('ppb_dispatched',      'safety',    'B', '0 6 * * 1',    'weekly',    336,  'PPB dispatched calls dashboard'),
    ('ppb_staffing',        'safety',    'B', '0 6 1 * *',    'monthly',   840,  'PPB staffing numbers'),
    ('pdx_reporter',        'safety',    'A', '0 7 * * 1',    'weekly',    336,  'PDX Reporter / 311 data'),
    ('ppd_permits',         'housing',   'A', '0 5 * * *',    'daily',     48,   'PP&D permits via ArcGIS REST API'),
    ('civicapps_licenses',  'business',  'A', '0 6 * * 1',    'weekly',    336,  'CivicApps business license API'),
    ('blt_registrations',   'business',  'C', 'manual',       'quarterly', 2880, 'Revenue Division PRR fulfillment'),
    ('sos_filings',         'business',  'B', '0 6 1 1,4,7,10 *', 'quarterly', 2880, 'Oregon SOS business filings'),
    ('water_activations',   'migration', 'C', 'manual',       'quarterly', 2880, 'Water Bureau PRR fulfillment'),
    ('census_population',   'migration', 'A', '0 6 15 9 *',   'annual',    8760, 'Census PEP annual pull'),
    ('census_demographics', 'migration', 'A', '0 6 15 12 *',  'annual',    8760, 'ACS annual pull'),
    ('irs_migration',       'migration', 'A', '0 6 1 6 *',    'annual',    8760, 'IRS SOI migration CSV download'),
    ('bls_employment',      'migration', 'A', '0 6 7 * *',    'monthly',   840,  'BLS API — Portland MSA employment'),
    ('placer_foot_traffic', 'downtown',  'D', '0 6 * * 1',    'weekly',    336,  'Placer.ai via Clean & Safe or direct'),
    ('costar_market',       'downtown',  'D', '0 6 1 1,4,7,10 *', 'quarterly', 2880, 'CoStar quarterly export'),
    ('hud_usps_vacancy',    'downtown',  'A', '0 6 15 1,4,7,10 *', 'quarterly', 2880, 'HUD USPS vacancy CSV download'),
    ('trimet_ridership',    'downtown',  'B', '0 6 1 1,4,7,10 *', 'quarterly', 2880, 'TriMet performance report scrape'),
    ('zillow_rents',        'housing',   'A', '0 6 15 * *',   'monthly',   840,  'Zillow ZORI CSV download'),
    ('phb_affordable',      'housing',   'B', '0 6 1 1,4,7,10 *', 'quarterly', 2880, 'PHB affordable housing reports');

-- =============================================================================
-- MATERIALIZED VIEWS — dashboard-ready aggregates
-- =============================================================================

-- Migration headline: net water activations (all ZIPs, residential) by month
CREATE MATERIALIZED VIEW public.mv_migration_headline AS
SELECT
    w.month,
    SUM(w.activations)    AS total_activations,
    SUM(w.deactivations)  AS total_deactivations,
    SUM(w.net_change)     AS net_migration,
    LAG(SUM(w.net_change)) OVER (ORDER BY w.month) AS prior_month_net,
    SUM(SUM(w.net_change)) OVER (ORDER BY w.month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) AS rolling_12mo_net
FROM migration.water_activations w
WHERE w.account_type = 'residential'
GROUP BY w.month
ORDER BY w.month;
COMMENT ON MATERIALIZED VIEW public.mv_migration_headline IS 'Monthly net migration from water activations — dashboard headline';
CREATE UNIQUE INDEX idx_mv_migration_month ON public.mv_migration_headline (month);

-- Business headline: monthly net formation across all sources
CREATE MATERIALIZED VIEW public.mv_business_headline AS
SELECT
    nf.month,
    SUM(nf.new_registrations) AS total_new,
    SUM(nf.cancellations)     AS total_cancelled,
    SUM(nf.net_formation)     AS net_formation,
    LAG(SUM(nf.net_formation)) OVER (ORDER BY nf.month) AS prior_month_net,
    SUM(SUM(nf.net_formation)) OVER (ORDER BY nf.month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) AS rolling_12mo_net
FROM business.net_formation_monthly nf
GROUP BY nf.month
ORDER BY nf.month;
COMMENT ON MATERIALIZED VIEW public.mv_business_headline IS 'Monthly net business formation — dashboard headline';
CREATE UNIQUE INDEX idx_mv_business_month ON public.mv_business_headline (month);

-- Business by neighborhood: monthly new registrations by neighborhood
CREATE MATERIALIZED VIEW public.mv_business_by_neighborhood AS
SELECT
    nf.month,
    n.name AS neighborhood_name,
    nf.neighborhood_id,
    SUM(nf.new_registrations) AS new_registrations,
    SUM(nf.cancellations)     AS cancellations,
    SUM(nf.net_formation)     AS net_formation
FROM business.net_formation_monthly nf
LEFT JOIN reference.neighborhoods n ON n.neighborhood_id = nf.neighborhood_id
WHERE nf.neighborhood_id IS NOT NULL
GROUP BY nf.month, n.name, nf.neighborhood_id
ORDER BY nf.month, n.name;
COMMENT ON MATERIALIZED VIEW public.mv_business_by_neighborhood IS 'Net business formation by neighborhood — drill-down view';
CREATE UNIQUE INDEX idx_mv_biz_neighborhood ON public.mv_business_by_neighborhood (month, neighborhood_id);

-- Downtown headline: weekly Central City foot traffic recovery
CREATE MATERIALIZED VIEW public.mv_downtown_headline AS
SELECT
    ft.week_start,
    ft.total_visitors,
    ft.baseline_2019,
    ft.recovery_pct,
    ft.avg_dwell_minutes,
    ft.repeat_visit_rate,
    LAG(ft.recovery_pct) OVER (ORDER BY ft.week_start) AS prior_week_recovery
FROM downtown.placer_foot_traffic ft
WHERE ft.location_type = 'central_city'
ORDER BY ft.week_start;
COMMENT ON MATERIALIZED VIEW public.mv_downtown_headline IS 'Weekly Central City foot traffic recovery — dashboard headline';
CREATE UNIQUE INDEX idx_mv_downtown_week ON public.mv_downtown_headline (week_start);

-- Downtown vacancy summary: current vacancy by property type
CREATE MATERIALIZED VIEW public.mv_downtown_vacancy_summary AS
SELECT
    vp.property_type,
    COUNT(*) FILTER (WHERE vp.vacancy_status = 'vacant')            AS vacant_count,
    COUNT(*) FILTER (WHERE vp.vacancy_status = 'partially_vacant')  AS partially_vacant_count,
    COUNT(*) FILTER (WHERE vp.vacancy_status = 'occupied')          AS occupied_count,
    COUNT(*)                                                        AS total_properties,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE vp.vacancy_status IN ('vacant', 'partially_vacant')) / NULLIF(COUNT(*), 0),
        1
    ) AS vacancy_rate_pct,
    SUM(vp.building_sqft) FILTER (WHERE vp.vacancy_status = 'vacant') AS vacant_sqft,
    SUM(vp.building_sqft) AS total_sqft,
    COUNT(*) FILTER (WHERE vp.listed_for_lease) AS listed_count,
    COUNT(*) FILTER (WHERE vp.vacancy_status = 'vacant' AND NOT vp.listed_for_lease) AS hidden_vacancy_count
FROM downtown.vacancy_properties vp
GROUP BY vp.property_type;
COMMENT ON MATERIALIZED VIEW public.mv_downtown_vacancy_summary IS 'Vacancy counts and rates by property type — includes hidden vacancy metric';
CREATE UNIQUE INDEX idx_mv_vacancy_type ON public.mv_downtown_vacancy_summary (property_type);

-- Safety headline: monthly crime per 1,000 residents + response time
CREATE MATERIALIZED VIEW public.mv_safety_headline AS
SELECT
    DATE_TRUNC('month', o.offense_date)::DATE AS month,
    o.offense_category,
    COUNT(*) AS offense_count,
    LAG(COUNT(*)) OVER (PARTITION BY o.offense_category ORDER BY DATE_TRUNC('month', o.offense_date)) AS prior_month_count,
    COUNT(*) - LAG(COUNT(*)) OVER (PARTITION BY o.offense_category ORDER BY DATE_TRUNC('month', o.offense_date)) AS mom_change
FROM safety.ppb_offenses o
GROUP BY DATE_TRUNC('month', o.offense_date)::DATE, o.offense_category
ORDER BY month, o.offense_category;
COMMENT ON MATERIALIZED VIEW public.mv_safety_headline IS 'Monthly crime counts by category with MoM change — dashboard headline';
CREATE UNIQUE INDEX idx_mv_safety_month ON public.mv_safety_headline (month, offense_category);

-- Safety: monthly average response time by priority
CREATE MATERIALIZED VIEW public.mv_safety_response_time AS
SELECT
    DATE_TRUNC('month', dc.dispatch_time)::DATE AS month,
    dc.priority,
    COUNT(*) AS call_count,
    ROUND(AVG(dc.response_seconds) / 60.0, 1) AS avg_response_minutes,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dc.response_seconds) / 60.0 AS median_response_minutes,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY dc.response_seconds) / 60.0 AS p90_response_minutes
FROM safety.ppb_dispatched_calls dc
WHERE dc.response_seconds IS NOT NULL AND dc.response_seconds > 0
GROUP BY DATE_TRUNC('month', dc.dispatch_time)::DATE, dc.priority
ORDER BY month, dc.priority;
COMMENT ON MATERIALIZED VIEW public.mv_safety_response_time IS 'Monthly 911 response time stats by priority level';
CREATE UNIQUE INDEX idx_mv_response_month ON public.mv_safety_response_time (month, priority);

-- Safety by neighborhood: monthly offenses per neighborhood
CREATE MATERIALIZED VIEW public.mv_safety_by_neighborhood AS
SELECT
    DATE_TRUNC('month', o.offense_date)::DATE AS month,
    n.name AS neighborhood_name,
    o.neighborhood_id,
    o.offense_category,
    COUNT(*) AS offense_count
FROM safety.ppb_offenses o
JOIN reference.neighborhoods n ON n.neighborhood_id = o.neighborhood_id
GROUP BY DATE_TRUNC('month', o.offense_date)::DATE, n.name, o.neighborhood_id, o.offense_category
ORDER BY month, n.name;
COMMENT ON MATERIALIZED VIEW public.mv_safety_by_neighborhood IS 'Monthly crime by neighborhood and category — drill-down view';
CREATE UNIQUE INDEX idx_mv_safety_neighborhood ON public.mv_safety_by_neighborhood (month, neighborhood_id, offense_category);

-- Housing headline: monthly permit processing + pipeline
CREATE MATERIALIZED VIEW public.mv_housing_headline AS
SELECT
    pp.month,
    SUM(pp.permits_issued) AS total_permits_issued,
    ROUND(AVG(pp.avg_processing_days), 1) AS avg_processing_days,
    ROUND(AVG(pp.median_processing_days), 1) AS median_processing_days,
    ROUND(AVG(pp.pct_within_90_days), 1) AS pct_within_90_days,
    SUM(pp.total_units) AS total_units_permitted,
    SUM(pp.total_valuation) AS total_valuation,
    SUM(SUM(pp.total_units)) OVER (ORDER BY pp.month ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) AS rolling_12mo_units
FROM housing.permit_processing_monthly pp
GROUP BY pp.month
ORDER BY pp.month;
COMMENT ON MATERIALIZED VIEW public.mv_housing_headline IS 'Monthly permit processing stats — dashboard headline for housing question';
CREATE UNIQUE INDEX idx_mv_housing_month ON public.mv_housing_headline (month);

-- IRS migration: net AGI flow summary by year
CREATE MATERIALIZED VIEW public.mv_irs_migration_summary AS
SELECT
    irs.tax_year,
    SUM(CASE WHEN irs.direction = 'inflow' THEN irs.returns ELSE 0 END)  AS inflow_returns,
    SUM(CASE WHEN irs.direction = 'outflow' THEN irs.returns ELSE 0 END) AS outflow_returns,
    SUM(CASE WHEN irs.direction = 'inflow' THEN irs.returns ELSE 0 END)
        - SUM(CASE WHEN irs.direction = 'outflow' THEN irs.returns ELSE 0 END) AS net_returns,
    SUM(CASE WHEN irs.direction = 'inflow' THEN irs.agi_thousands ELSE 0 END)  AS inflow_agi_thousands,
    SUM(CASE WHEN irs.direction = 'outflow' THEN irs.agi_thousands ELSE 0 END) AS outflow_agi_thousands,
    SUM(CASE WHEN irs.direction = 'inflow' THEN irs.agi_thousands ELSE 0 END)
        - SUM(CASE WHEN irs.direction = 'outflow' THEN irs.agi_thousands ELSE 0 END) AS net_agi_thousands
FROM migration.irs_migration irs
GROUP BY irs.tax_year
ORDER BY irs.tax_year;
COMMENT ON MATERIALIZED VIEW public.mv_irs_migration_summary IS 'Annual net migration and net AGI from IRS SOI data — income-weighted migration headline';
CREATE UNIQUE INDEX idx_mv_irs_year ON public.mv_irs_migration_summary (tax_year);

-- Program headline: PCB summary stats
CREATE MATERIALIZED VIEW public.mv_program_headline AS
SELECT
    COUNT(*) FILTER (WHERE pcb.certification_status = 'active')    AS active_businesses,
    COUNT(*)                                                       AS total_certified,
    COUNT(*) FILTER (WHERE pcb.certification_status = 'graduated') AS graduated,
    SUM(pcb.employees_current)                                     AS total_current_employees,
    SUM(pcb.employees_current) - SUM(pcb.employees_at_cert)        AS jobs_created,
    MIN(pcb.certification_date)                                    AS program_start_date,
    MAX(pcb.certification_date)                                    AS latest_certification
FROM program.pcb_businesses pcb;
COMMENT ON MATERIALIZED VIEW public.mv_program_headline IS 'PCB program summary stats — dashboard headline';

-- ETL freshness: latest successful run per source
CREATE MATERIALIZED VIEW public.mv_etl_freshness AS
SELECT DISTINCT ON (el.source_name)
    el.source_name,
    ec.schema_name,
    ec.automation_tier,
    ec.expected_frequency,
    el.finished_at AS last_success_at,
    el.rows_inserted + COALESCE(el.rows_updated, 0) AS last_row_count,
    ec.staleness_threshold_hours,
    EXTRACT(EPOCH FROM (now() - el.finished_at)) / 3600.0 AS hours_since_success,
    CASE
        WHEN EXTRACT(EPOCH FROM (now() - el.finished_at)) / 3600.0 > ec.staleness_threshold_hours THEN 'stale'
        ELSE 'fresh'
    END AS freshness_status
FROM public.etl_log el
JOIN public.etl_source_config ec ON ec.source_name = el.source_name
WHERE el.status = 'success'
ORDER BY el.source_name, el.finished_at DESC;
COMMENT ON MATERIALIZED VIEW public.mv_etl_freshness IS 'Latest successful ETL run per source with staleness check — powers "last updated" on dashboard';
CREATE UNIQUE INDEX idx_mv_etl_source ON public.mv_etl_freshness (source_name);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Refresh all materialized views (call after ETL runs)
CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_migration_headline;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_business_headline;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_business_by_neighborhood;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_downtown_headline;
    REFRESH MATERIALIZED VIEW              public.mv_downtown_vacancy_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_safety_headline;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_safety_response_time;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_safety_by_neighborhood;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_housing_headline;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_irs_migration_summary;
    REFRESH MATERIALIZED VIEW              public.mv_program_headline;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_etl_freshness;
    RAISE NOTICE 'All materialized views refreshed at %', now();
END;
$$;
COMMENT ON FUNCTION public.refresh_all_materialized_views() IS 'Refreshes all dashboard materialized views. Call after any ETL run completes.';

-- Convenience: get last-updated timestamp for a data source
CREATE OR REPLACE FUNCTION public.get_last_updated(p_source_name TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE sql STABLE
AS $$
    SELECT finished_at
    FROM public.etl_log
    WHERE source_name = p_source_name AND status = 'success'
    ORDER BY finished_at DESC
    LIMIT 1;
$$;
COMMENT ON FUNCTION public.get_last_updated(TEXT) IS 'Returns the timestamp of the last successful ETL run for a given source';

-- Convenience: assign neighborhood_id from a point geometry
CREATE OR REPLACE FUNCTION reference.find_neighborhood(p_geom GEOMETRY)
RETURNS INTEGER
LANGUAGE sql STABLE
AS $$
    SELECT neighborhood_id
    FROM reference.neighborhoods
    WHERE ST_Contains(geom, p_geom)
    LIMIT 1;
$$;
COMMENT ON FUNCTION reference.find_neighborhood(GEOMETRY) IS 'Spatial lookup: returns neighborhood_id for a given point geometry';

-- =============================================================================
-- ROW-LEVEL UPDATED_AT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables that have an updated_at column
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema NOT IN ('information_schema', 'pg_catalog')
          AND table_name NOT LIKE 'mv_%'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I.%I '
            'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
            tbl.table_schema, tbl.table_name
        );
    END LOOP;
END;
$$;
