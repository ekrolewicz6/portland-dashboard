/**
 * Types for the Real Estate Portal module.
 */

export interface PCBTerms {
  popup_available?: boolean;
  popup_minimum?: string;
  popup_rate?: number;
  graduated_rent?: boolean;
  graduated_schedule?: string;
}

export interface Listing {
  id: number;
  title: string;
  address: string;
  neighborhood: string;
  sqft: number;
  space_type: SpaceType;
  asking_rent: number;
  pcb_terms: PCBTerms;
  condition: string;
  vacancy_duration: string | null;
  listed_date: string;
  status: ListingStatus;
  description: string | null;
  amenities: string[];
  floor: string | null;
  contact_email: string | null;
  lat: number | null;
  lon: number | null;
}

export type SpaceType =
  | "retail"
  | "office"
  | "restaurant"
  | "industrial"
  | "flex";

export type ListingStatus = "available" | "under_negotiation" | "leased";

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  retail: "Retail",
  office: "Office",
  restaurant: "Restaurant / F&B",
  industrial: "Industrial / Maker",
  flex: "Flex / Mixed-Use",
};

export const CONDITION_LABELS: Record<string, string> = {
  "move-in ready": "Move-In Ready",
  "white box": "White Box",
  "industrial shell": "Industrial Shell",
  "needs renovation": "Needs Renovation",
  "previous restaurant": "Previous Restaurant",
  "partially renovated": "Partially Renovated",
  "gallery ready": "Gallery Ready",
  "built-out stall": "Built-Out Stall",
};

export interface ListingsFilters {
  search?: string;
  space_type?: SpaceType;
  neighborhood?: string;
  min_sqft?: number;
  max_sqft?: number;
  max_rent?: number;
  popup_available?: boolean;
  graduated_rent?: boolean;
  condition?: string;
  sort?: "rent_asc" | "rent_desc" | "sqft_asc" | "sqft_desc" | "newest";
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  neighborhoods: string[];
  filters_applied: ListingsFilters;
}
