import { parseTokenCsv } from "@/lib/token-combo"

/** Human-readable industry suggestions (type or pick; multiple stored comma-separated). */
export const SUGGESTED_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Construction",
  "Hospitality",
  "Manufacturing",
  "Consulting",
  "Banking",
  "Insurance",
  "Real Estate",
  "Telecommunications",
  "Media & Entertainment",
  "Marketing & Advertising",
  "E-Commerce",
  "Transportation",
  "Logistics & Supply Chain",
  "Automobile",
  "Pharmaceutical",
  "Biotechnology",
  "Legal Services",
  "Government",
  "Non-Profit",
  "Agriculture",
  "Energy & Utilities",
  "Oil & Gas",
  "Food & Beverage",
  "Fashion & Apparel",
  "Sports & Fitness",
  "Travel & Tourism",
  "Human Resources",
  "Event Management",
  "Cybersecurity",
  "Artificial Intelligence",
  "Gaming",
  "Animation & VFX",
  "Architecture",
  "Interior Design",
  "Other",
] as const

/** Legacy profile values stored as snake_case from old Select fields. */
const LEGACY_INDUSTRY_LABELS: Record<string, string> = {
  technology: "Technology",
  finance: "Finance",
  healthcare: "Healthcare",
  education: "Education",
  retail: "Retail",
  construction: "Construction",
  hospitality: "Hospitality",
  manufacturing: "Manufacturing",
  consulting: "Consulting",
  banking: "Banking",
  insurance: "Insurance",
  real_estate: "Real Estate",
  telecommunications: "Telecommunications",
  media_entertainment: "Media & Entertainment",
  marketing_advertising: "Marketing & Advertising",
  ecommerce: "E-Commerce",
  transportation: "Transportation",
  logistics_supply_chain: "Logistics & Supply Chain",
  automobile: "Automobile",
  pharmaceutical: "Pharmaceutical",
  biotechnology: "Biotechnology",
  legal_services: "Legal Services",
  government: "Government",
  non_profit: "Non-Profit",
  agriculture: "Agriculture",
  energy_utilities: "Energy & Utilities",
  oil_gas: "Oil & Gas",
  food_beverage: "Food & Beverage",
  fashion_apparel: "Fashion & Apparel",
  sports_fitness: "Sports & Fitness",
  travel_tourism: "Travel & Tourism",
  human_resources: "Human Resources",
  event_management: "Event Management",
  cybersecurity: "Cybersecurity",
  artificial_intelligence: "Artificial Intelligence",
  gaming: "Gaming",
  animation_vfx: "Animation & VFX",
  architecture: "Architecture",
  interior_design: "Interior Design",
  other: "Other",
}

export function formatIndustryToken(token: string): string {
  const key = token.trim().toLowerCase()
  if (LEGACY_INDUSTRY_LABELS[key]) return LEGACY_INDUSTRY_LABELS[key]
  if (key.includes("_")) {
    return token
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  }
  return token
}

/** Single industry only — uses the first value if legacy data had multiple. */
export function normalizeIndustryCsv(csv: string): string {
  const tokens = parseTokenCsv(csv)
  if (tokens.length === 0) return ""
  return formatIndustryToken(tokens[0])
}
