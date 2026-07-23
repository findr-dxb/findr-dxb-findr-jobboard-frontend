/**
 * Jobseeker membership: Prime / Plus / Pro / Elite / Icon
 * Keep in sync with Techno-backend-master/utils/jobseekerMembership.js
 */

export const MEMBERSHIP_TIERS = ["Prime", "Plus", "Pro", "Elite", "Icon"] as const

export type JobseekerMembership = (typeof MEMBERSHIP_TIERS)[number]

export function parseSalary(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  const cleaned = String(value).replace(/[^0-9.]/g, "")
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

export function isEmiratiNationality(nationality?: string | null): boolean {
  if (!nationality) return false
  return String(nationality).toLowerCase().includes("emirati")
}

/**
 * Icon = Emirati only.
 * Else by salary: Prime ≤7k, Plus ≤15k, Pro ≤25k, Elite >25k.
 */
export function determineJobseekerMembership(input: {
  nationality?: string | null
  salaryExpectation?: string | number | null
}): JobseekerMembership {
  if (isEmiratiNationality(input.nationality)) return "Icon"

  const salary = parseSalary(input.salaryExpectation)
  if (salary === null) return "Prime"
  if (salary <= 7000) return "Prime"
  if (salary <= 15000) return "Plus"
  if (salary <= 25000) return "Pro"
  return "Elite"
}

export function determineJobseekerMembershipFromUser(user: {
  nationality?: string | null
  jobPreferences?: { salaryExpectation?: string | number | null }
}): JobseekerMembership {
  return determineJobseekerMembership({
    nationality: user.nationality,
    salaryExpectation: user.jobPreferences?.salaryExpectation,
  })
}

/** Only Icon (Emirati) gets 2x; all others 1x. */
export function getMembershipMultiplier(tier: string): number {
  return tier === "Icon" ? 2 : 1
}

export function getMembershipTierColor(tier: string): string {
  switch (tier) {
    case "Icon":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "Elite":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "Pro":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "Plus":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "Prime":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

export const MEMBERSHIP_TIER_INFO = [
  {
    name: "Prime" as const,
    desc: "AED 0 – 7,000 salary",
  },
  {
    name: "Plus" as const,
    desc: "AED 7,000 – 15,000 salary",
  },
  {
    name: "Pro" as const,
    desc: "AED 15,000 – 25,000 salary",
  },
  {
    name: "Elite" as const,
    desc: "AED 25,000+ salary",
  },
  {
    name: "Icon" as const,
    desc: "Special membership for Emirati users",
  },
]
