-- =============================================================================
-- Portland Climate Accountability Platform — Schema Extension
-- =============================================================================
--
-- Adds the environment schema for climate accountability tracking:
--   - CEW workplan actions (43 actions with full metadata)
--   - Bureau climate scorecard
--   - GHG emissions inventory (1990-2023)
--   - PCEF investments and funding tracking
--   - Action status history
--
-- Responds to the February 2026 Climate Justice Audit findings.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS environment;
COMMENT ON SCHEMA environment IS 'Climate accountability: CEW actions, emissions, PCEF, bureau scorecard';

-- =============================================================================
-- AirNow AQI (already used by existing API routes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.airnow_aqi (
    date              DATE NOT NULL,
    hour              SMALLINT NOT NULL,
    aqi               SMALLINT NOT NULL,
    category          TEXT NOT NULL,
    pollutant         TEXT NOT NULL,
    reporting_area    TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (date, hour, pollutant)
);
COMMENT ON TABLE environment.airnow_aqi IS 'EPA AirNow hourly AQI readings for Portland area';

-- =============================================================================
-- CEW WORKPLAN ACTIONS — the 43 actions from Climate Emergency Workplan
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.cew_actions (
    action_id         TEXT PRIMARY KEY,                    -- e.g. 'T-1', 'B-2', 'F-3'
    sector            TEXT NOT NULL,                       -- e.g. 'Transportation', 'Buildings'
    category          TEXT NOT NULL,                       -- 'decarbonization' or 'resilience'
    title             TEXT NOT NULL,
    description       TEXT,
    lead_bureaus      TEXT[] NOT NULL,                     -- array of bureau abbreviations
    maps_to_declaration BOOLEAN NOT NULL DEFAULT false,    -- ★ priority flag
    fiscal_year       TEXT,                                -- e.g. 'FY 22-25', 'Ongoing'
    resource_gap      TEXT,                                -- '$', '$$', '$$$', '$$$$', '$$$$$', 'Funded', 'N/A', 'TBD'
    status            TEXT NOT NULL DEFAULT 'ongoing',     -- 'achieved', 'ongoing', 'delayed'
    pcef_funded       BOOLEAN NOT NULL DEFAULT false,
    multi_bureau      BOOLEAN NOT NULL DEFAULT false,
    external_partners TEXT[],
    co_benefits       TEXT[],                              -- e.g. 'public_health', 'equity'
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.cew_actions IS 'All 43 Climate Emergency Workplan 2022-2025 actions with metadata';
CREATE INDEX idx_cew_actions_sector ON environment.cew_actions (sector);
CREATE INDEX idx_cew_actions_status ON environment.cew_actions (status);
CREATE INDEX idx_cew_actions_category ON environment.cew_actions (category);

-- =============================================================================
-- ACTION STATUS HISTORY — tracks changes over time
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.cew_action_history (
    id                SERIAL PRIMARY KEY,
    action_id         TEXT NOT NULL REFERENCES environment.cew_actions(action_id),
    status            TEXT NOT NULL,                       -- 'achieved', 'ongoing', 'delayed'
    report_period     TEXT NOT NULL,                       -- e.g. '2023', '2024', '2025'
    narrative         TEXT,                                -- progress notes
    recorded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.cew_action_history IS 'Status change history for CEW actions from annual progress reports';
CREATE INDEX idx_cew_history_action ON environment.cew_action_history (action_id);

-- =============================================================================
-- BUREAU CLIMATE ASSIGNMENTS — which bureaus own which actions
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.bureaus (
    abbreviation      TEXT PRIMARY KEY,                    -- e.g. 'BPS', 'PBOT'
    full_name         TEXT NOT NULL,
    category          TEXT,                                -- 'infrastructure', 'planning', 'emergency', etc.
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.bureaus IS 'City bureau lookup for climate scorecard';

-- =============================================================================
-- GHG EMISSIONS INVENTORY — Multnomah County 1990-2023
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.ghg_emissions (
    year              SMALLINT NOT NULL,
    sector            TEXT NOT NULL,                       -- 'transportation', 'electricity', 'natural_gas', 'industrial', 'waste'
    mtco2e            NUMERIC(12,0) NOT NULL,              -- metric tons CO2 equivalent
    source_detail     TEXT,                                -- e.g. 'gasoline', 'diesel', 'grid_electricity'
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (year, sector)
);
COMMENT ON TABLE environment.ghg_emissions IS 'Multnomah County annual GHG emissions by sector, 1990-2023';
CREATE INDEX idx_ghg_year ON environment.ghg_emissions (year);

-- =============================================================================
-- EMISSIONS TARGETS — reduction milestones
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.emissions_targets (
    target_year       SMALLINT PRIMARY KEY,
    target_mtco2e     NUMERIC(12,0) NOT NULL,
    target_pct_below_1990 NUMERIC(5,2) NOT NULL,          -- e.g. 50.00 for 50% below 1990
    description       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.emissions_targets IS 'Portland carbon reduction targets (2030: -50%, 2050: net-zero)';

-- =============================================================================
-- PCEF INVESTMENTS — Portland Clean Energy Fund tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.pcef_investments (
    id                SERIAL PRIMARY KEY,
    fiscal_year       TEXT NOT NULL,                       -- e.g. 'FY 23-24'
    category          TEXT NOT NULL,                       -- e.g. 'energy_efficiency', 'transportation', 'green_infrastructure'
    recipient_type    TEXT NOT NULL,                       -- 'bureau' or 'community'
    recipient_name    TEXT,                                -- bureau name or org name
    budgeted          NUMERIC(14,2),
    spent             NUMERIC(14,2),
    projects_funded   INTEGER,
    description       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.pcef_investments IS 'PCEF funding allocations and spending by category and recipient';
CREATE INDEX idx_pcef_fy ON environment.pcef_investments (fiscal_year);
CREATE INDEX idx_pcef_type ON environment.pcef_investments (recipient_type);

-- =============================================================================
-- RENEWABLE ENERGY — progress toward 100% renewable
-- =============================================================================

CREATE TABLE IF NOT EXISTS environment.renewable_energy (
    year              SMALLINT PRIMARY KEY,
    pct_renewable     NUMERIC(5,2),                        -- % of electricity from renewable sources
    pct_community_owned NUMERIC(5,2),                      -- % community-owned (solar, etc.)
    total_mwh         NUMERIC(14,0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE environment.renewable_energy IS 'Multnomah County renewable energy mix by year';
