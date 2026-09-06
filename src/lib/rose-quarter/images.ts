/**
 * ODOT's own maps and renderings, archived locally.
 *
 * These are the agency's images, used here editorially to show what the
 * project actually proposes. Every one renders with a visible credit and a
 * link to the original, and nothing ships without a sourceUrl and a retrieval
 * date.
 *
 * They are archived rather than hotlinked for the same reason the budget PDFs
 * and the advisory-committee documents are: ODOT has already moved this
 * project's web presence once (i5rosequarter.oregon.gov → i5rosequarter.org),
 * so hotlinks rot, and a page scrutinising an agency should not depend on
 * that agency to keep hosting the evidence.
 *
 * Originals in runtime-data/rose-quarter/images/ (gitignored); the copies in
 * public/ are resized and re-encoded for the web.
 */

export interface Rendering {
  id: string;
  file: string;
  alt: string;
  caption: string;
  /** What ODOT's own image does NOT show, where that matters. */
  omits?: string;
  sourceUrl: string;
  retrieved: string;
}

const BASE = "/images/rose-quarter";
const RETRIEVED = "2026-08-13";

export const RENDERINGS = {
  cover: {
    id: "cover",
    file: `${BASE}/cover-rendering.jpg`,
    alt: "ODOT rendering of the proposed highway cover over I-5, looking south toward the Moda Center, showing landscaped plazas, crossing streets and low buildings.",
    caption:
      "ODOT's rendering of the highway cover. The freeway runs underneath; the streets and buildings on top are the point of the project.",
    omits:
      "It does not show the flyover ramp, and it shows buildings across the whole deck — in the current design only about four of the roughly seven acres can carry them.",
    sourceUrl: "https://www.i5rosequarter.org/media/24zgiott/cover-rendering_disclaimer.jpg",
    retrieved: RETRIEVED,
  },
  mapCover: {
    id: "mapCover",
    file: `${BASE}/map-cover.jpg`,
    alt: "ODOT map showing the extent of the proposed highway cover over I-5 between the Broadway/Weidler couplet and Hancock Street.",
    caption: "Where the cover goes: one continuous lid, not several separate lids.",
    sourceUrl: "https://www.i5rosequarter.org/media/ryoo4jqu/map_cover-2x.png",
    retrieved: RETRIEVED,
  },
  mapAuxiliary: {
    id: "mapAuxiliary",
    file: `${BASE}/map-auxiliary.jpg`,
    alt: "ODOT map showing where auxiliary lanes and full shoulders would be added to I-5 in each direction.",
    caption:
      "The lanes. ODOT is careful to call these auxiliary lanes, ramp-to-ramp connections, rather than through lanes, and the distinction is the centre of the dispute.",
    omits: "It does not show total paved width, which is what critics say makes the roadway stripeable to ten lanes.",
    sourceUrl: "https://www.i5rosequarter.org/media/awzbqwyw/map_auxiliary-2x.png",
    retrieved: RETRIEVED,
  },
  mapOfframp: {
    id: "mapOfframp",
    file: `${BASE}/map-sb-offramp.jpg`,
    alt: "ODOT map showing the relocated southbound I-5 off-ramp and the new flyover connection to Weidler Street.",
    caption:
      "The relocated southbound off-ramp and its flyover — the design change that followed the Trail Blazers' objection, and one of the changes at the centre of the comprehensive-plan lawsuit.",
    sourceUrl: "https://www.i5rosequarter.org/media/imrkf2nz/map_sb_offramp-2x.png",
    retrieved: RETRIEVED,
  },
  mapHancock: {
    id: "mapHancock",
    file: `${BASE}/map-hancock.jpg`,
    alt: "ODOT map showing the new Hancock Street crossing over I-5.",
    caption: "The Hancock crossing — a street connection that does not exist today.",
    sourceUrl: "https://www.i5rosequarter.org/media/51ik2o1b/map_hancock-2x.png",
    retrieved: RETRIEVED,
  },
  mapMultimodal: {
    id: "mapMultimodal",
    file: `${BASE}/map-multimodal.jpg`,
    alt: "ODOT map showing planned local street, sidewalk and bikeway improvements around the Rose Quarter.",
    caption: "The surface street network that comes with the project.",
    sourceUrl: "https://www.i5rosequarter.org/media/e0ya4rzy/map_multimodal-2x.png",
    retrieved: RETRIEVED,
  },
  mapBikePed: {
    id: "mapBikePed",
    file: `${BASE}/map-bike-ped.jpg`,
    alt: "ODOT map showing the proposed car-free pedestrian and bicycle bridge over I-5.",
    caption: "A car-free crossing of the freeway, added back into the design in the 2024 revision.",
    sourceUrl: "https://www.i5rosequarter.org/media/44wd31g4/map_bike_ped-2x.png",
    retrieved: RETRIEVED,
  },
  closureMap: {
    id: "closureMap",
    file: `${BASE}/closure-map.jpg`,
    alt: "ODOT map of the September 2026 southbound I-5 closure, showing the closed section between I-405 and I-84 and the detour routes onto I-405 and I-205.",
    caption:
      "The September closure. Southbound traffic goes to I-405; regional traffic is sent to I-205, which is, near enough, what removal advocates propose permanently.",
    sourceUrl:
      "https://www.i5rosequarter.org/media/wkqd4vft/2026_closure-map_southbound_07132026_mappluslegend.jpg",
    retrieved: RETRIEVED,
  },
  phase1a: {
    id: "phase1a",
    file: `${BASE}/phase1a-map.jpg`,
    alt: "ODOT map of Phase 1A construction, showing stormwater work and seismic retrofit locations near the I-5 and I-405 interchange.",
    caption:
      "Phase 1A, the only part under construction: stormwater facilities and seismic retrofit. It adds no through capacity.",
    sourceUrl:
      "https://www.i5rosequarter.org/media/sqkjtoil/2025_construction-scenarios_08262025_phase1a-2025-1.jpg",
    retrieved: RETRIEVED,
  },
  schedule: {
    id: "schedule",
    file: `${BASE}/schedule.jpg`,
    alt: "ODOT project schedule graphic showing construction phases from 2025 through the 2030s.",
    caption: "ODOT's own schedule, as revised in March 2026.",
    sourceUrl: "https://www.i5rosequarter.org/media/jwvbskex/i5rq_2025_project-schedule_03302026_web.png",
    retrieved: RETRIEVED,
  },
} as const satisfies Record<string, Rendering>;

export type RenderingId = keyof typeof RENDERINGS;

export const CREDIT = "Oregon Department of Transportation";
