import { NextResponse } from "next/server";
import sql, { getCachedData, setCachedData } from "@/lib/db-query";

export const dynamic = "force-dynamic";

const CACHE_KEY = "housing_journey";

interface JourneyPhase {
  phase: string;
  median_day: number;
  median_step_duration: number;
  permits_affected: number;
}

interface JourneyByType {
  permit_type: string;
  label: string;
  permits: number;
  phases: { phase: string; median_day: number }[];
  total_days: number;
}

interface PhaseTrend {
  period: string;
  [key: string]: string | number;
}

interface JourneyResponse {
  phases: JourneyPhase[];
  byType: JourneyByType[];
  trend: PhaseTrend[];
  correctionStats: {
    pctWithCorrections: number;
    avgRounds: number;
    totalPermits: number;
  };
  dataStatus: string;
}

// Simplified permit type labels
const TYPE_MAP: Record<string, string> = {
  "Residential Bldg/Trade PermitSingle Family DwellingNew Construction": "Single Family (New)",
  "Residential Bldg/Trade PermitSingle Family DwellingAlteration": "Single Family (Remodel)",
  "Residential Bldg/Trade PermitSingle Family DwellingAddition": "Single Family (Addition)",
  "Residential Bldg/Trade PermitTownhouse (3 or more units)New Construction": "Townhouse (New)",
  "Residential Bldg/Trade PermitAccessory Dwelling UnitNew Construction": "ADU (New)",
  "Commercial Building PermitApartments/Condos (3 or more units)New Construction": "Apartment/Condo (New)",
  "Commercial Building PermitApartments/Condos (3 or more units)Alteration": "Apartment/Condo (Remodel)",
  "Commercial Building PermitBusinessAlteration": "Commercial (Remodel)",
  "Commercial Building PermitBusinessNew Construction": "Commercial (New)",
  "Commercial Building PermitUtilityAlteration": "Utility (Alteration)",
  "Commercial Building PermitUtilityNew Construction": "Utility (New)",
  "Commercial Building PermitAssemblyAlteration": "Assembly (Remodel)",
  "Commercial Building PermitStorageAlteration": "Storage (Remodel)",
  "Commercial Building PermitStorageNew Construction": "Storage (New)",
  "Commercial Building PermitMercantileAlteration": "Retail (Remodel)",
  "Commercial Building PermitFactory/IndustrialAlteration": "Industrial (Remodel)",
  "Commercial Building PermitBusinessDemolition": "Commercial (Demolition)",
  "Commercial Building PermitStorageDemolition": "Storage (Demolition)",
  "Commercial Building PermitEducationalAlteration": "Educational (Remodel)",
  "Residential Bldg/Trade PermitSingle Family DwellingInterior Alteration Only": "Single Family (Interior Only)",
  "Residential Bldg/Trade PermitSingle Family DwellingDemolition": "Single Family (Demolition)",
  "Residential Bldg/Trade PermitGarage/CarportDemolition": "Garage/Carport (Demolition)",
  "Residential Bldg/Trade PermitGarage/CarportAlteration": "Garage/Carport (Remodel)",
  "Residential Bldg/Trade PermitGarage/CarportNew Construction": "Garage/Carport (New)",
  "Residential Bldg/Trade PermitAccessory StructureNew Construction": "Accessory Structure (New)",
  "Residential Bldg/Trade PermitAccessory StructureAlteration": "Accessory Structure (Remodel)",
  "Residential Bldg/Trade PermitAccessory StructureDemolition": "Accessory Structure (Demolition)",
  "Residential Bldg/Trade PermitAccessory Dwelling UnitAlteration": "ADU (Remodel)",
  "Residential Bldg/Trade PermitDecks, Fences, Retaining WallsAlteration": "Decks/Fences (Remodel)",
  "Residential Bldg/Trade PermitDecks, Fences, Retaining WallsAddition": "Decks/Fences (Addition)",
  "Residential Bldg/Trade PermitDecks, Fences, Retaining WallsNew Construction": "Decks/Fences (New)",
  "Residential Bldg/Trade PermitDuplex/Two Family DwellingAlteration": "Duplex (Remodel)",
  "Residential Bldg/Trade PermitDuplex/Two Family DwellingNew Construction": "Duplex (New)",
  "Residential Bldg/Trade PermitTownhouse (3 or more units)Alteration": "Townhouse (Remodel)",
  "Residential Bldg/Trade PermitTownhouse (2 Units)New Construction": "Townhouse 2-Unit (New)",
};

// The key phases of the permit journey, in order
const KEY_PHASES = [
  "Application",
  "Planning and Zoning",
  "Structural",
  "Life Safety",
  "Fire Review",
  "Environmental Services",
  "Issuance",
  "Building Inspections",
  "Electrical Inspections",
  "Plumbing Inspections",
  "Mechanical Inspections",
  "Final Permit",
];

export async function GET(): Promise<NextResponse<JourneyResponse>> {
  try {
    // Check cache first (1-hour TTL)
    const cached = await getCachedData<JourneyResponse>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // 1. Overall journey phases — median arrival day and step duration
    const phaseRows = await sql`
      WITH permit_phases AS (
        SELECT
          a.detail_id, a.activity_type, a.days_from_setup,
          a.days_from_setup - LAG(a.days_from_setup) OVER (
            PARTITION BY a.detail_id ORDER BY a.completed_date, a.days_from_setup
          ) as step_duration
        FROM housing.permit_activities a
        WHERE a.completed_date IS NOT NULL
          AND a.days_from_setup IS NOT NULL AND a.days_from_setup >= 0
      )
      SELECT
        activity_type,
        count(DISTINCT detail_id)::int as permits_affected,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_from_setup))::numeric)::int as median_day,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CASE WHEN step_duration > 0 THEN step_duration END))::numeric)::int as median_step_duration
      FROM permit_phases
      WHERE activity_type = ANY(${KEY_PHASES})
      GROUP BY activity_type
      HAVING count(DISTINCT detail_id) >= 100
    `;

    const phases: JourneyPhase[] = KEY_PHASES
      .map((phase) => {
        const row = phaseRows.find((r) => r.activity_type === phase);
        if (!row) return null;
        return {
          phase,
          median_day: Number(row.median_day),
          median_step_duration: Number(row.median_step_duration),
          permits_affected: Number(row.permits_affected),
        };
      })
      .filter(Boolean) as JourneyPhase[];

    // 2. Journey by permit type — top permit types with milestone days
    const typeRows = await sql`
      SELECT
        d.permit_type,
        count(DISTINCT a.detail_id)::int as permits,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Structural'))::numeric)::int as structural,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Life Safety'))::numeric)::int as life_safety,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Issuance'))::numeric)::int as issuance,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Building Inspections'))::numeric)::int as building_insp,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Final Permit'))::numeric)::int as final_permit
      FROM housing.permit_activities a
      JOIN housing.permit_details d ON d.detail_id = a.detail_id
      WHERE a.completed_date IS NOT NULL AND a.days_from_setup >= 0
      GROUP BY d.permit_type
      HAVING count(DISTINCT a.detail_id) >= 200
      ORDER BY count(DISTINCT a.detail_id) DESC
      LIMIT 10
    `;

    const byType: JourneyByType[] = typeRows.map((r) => {
      const raw = r.permit_type as string;
      const label = TYPE_MAP[raw] ?? raw.replace(/Residential Bldg\/Trade Permit|Commercial Building Permit/g, "").trim();
      const phases = [
        { phase: "Reviews", median_day: Math.min(Number(r.structural) || 999, Number(r.life_safety) || 999) },
        { phase: "Permit Issued", median_day: Number(r.issuance) || 0 },
        { phase: "Construction", median_day: Number(r.building_insp) || 0 },
        { phase: "Final", median_day: Number(r.final_permit) || 0 },
      ].filter((p) => p.median_day > 0 && p.median_day < 999);
      return {
        permit_type: raw,
        label,
        permits: Number(r.permits),
        phases,
        total_days: Number(r.final_permit) || Number(r.building_insp) || 0,
      };
    });

    // 3. Trend — how key milestones are changing over time (by half-year)
    const trendRows = await sql`
      SELECT
        TO_CHAR(date_trunc('quarter', d.setup_date), 'YYYY-"Q"Q') as period,
        count(DISTINCT a.detail_id)::int as permits,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Structural'))::numeric)::int as structural_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Issuance'))::numeric)::int as issuance_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Building Inspections'))::numeric)::int as inspection_days,
        ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.days_from_setup) FILTER (WHERE a.activity_type = 'Final Permit'))::numeric)::int as final_days
      FROM housing.permit_activities a
      JOIN housing.permit_details d ON d.detail_id = a.detail_id
      WHERE a.completed_date IS NOT NULL AND a.days_from_setup >= 0
        AND d.setup_date >= '2019-01-01'
      GROUP BY 1
      HAVING count(DISTINCT a.detail_id) >= 50
      ORDER BY 1
    `;

    const trend: PhaseTrend[] = trendRows.map((r) => ({
      period: r.period as string,
      "Review Complete": Number(r.structural_days) || 0,
      "Permit Issued": Number(r.issuance_days) || 0,
      "Inspections Done": Number(r.inspection_days) || 0,
      "Final Permit": Number(r.final_days) || 0,
    }));

    // 4. Correction stats
    const corrRows = await sql`
      SELECT
        count(DISTINCT detail_id)::int as total,
        count(DISTINCT detail_id) FILTER (WHERE activity_name ILIKE '%correction%') as with_corr
      FROM housing.permit_activities
    `;
    const corrRoundRows = await sql`
      SELECT ROUND(AVG(rounds)::numeric, 1)::float as avg
      FROM (SELECT count(*) as rounds FROM housing.permit_activities WHERE activity_name ILIKE '%correction%' GROUP BY detail_id) sub
    `;

    const result: JourneyResponse = {
      phases,
      byType,
      trend,
      correctionStats: {
        pctWithCorrections: Number(corrRows[0].total) > 0
          ? Math.round((Number(corrRows[0].with_corr) / Number(corrRows[0].total)) * 1000) / 10
          : 0,
        avgRounds: Number(corrRoundRows[0]?.avg ?? 0),
        totalPermits: Number(corrRows[0].total),
      },
      dataStatus: "live",
    };

    await setCachedData(CACHE_KEY, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[housing/journey] DB query failed:", error);
    return NextResponse.json({
      phases: [],
      byType: [],
      trend: [],
      correctionStats: { pctWithCorrections: 0, avgRounds: 0, totalPermits: 0 },
      dataStatus: "unavailable",
    });
  }
}
