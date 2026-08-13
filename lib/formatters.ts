/** Coerce job salary to a single number (handles legacy object shapes from old clients). */
export function coerceJobSalary(salary: unknown): number | null {
  if (typeof salary === "number" && Number.isFinite(salary)) return salary
  if (typeof salary === "string") {
    const parsed = parseFloat(salary.replace(/[^0-9.]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }
  if (salary && typeof salary === "object") {
    const o = salary as { min?: unknown; max?: unknown; amount?: unknown }
    if (typeof o.amount === "number" && Number.isFinite(o.amount)) return o.amount
    if (typeof o.min === "number" && Number.isFinite(o.min)) return o.min
    if (typeof o.max === "number" && Number.isFinite(o.max)) return o.max
  }
  return null
}

/** Format a single job salary for display. */
export function formatSalary(salary?: unknown, emptyFallback = "—"): string {
  const amount = coerceJobSalary(salary)
  if (amount == null) return emptyFallback
  return `AED ${amount.toLocaleString()}`
}

/** String form for API payloads (e.g. expectedSalary on apply). */
export function salaryToString(salary: unknown, fallback = "0"): string {
  const amount = coerceJobSalary(salary)
  return amount != null ? String(amount) : fallback
}

/** Display jobseeker salary expectation string from profile (may already include "AED"). */
export function formatSalaryExpectation(value?: string | null, emptyFallback = "—"): string {
  if (value == null || String(value).trim() === "") return emptyFallback
  const t = String(value).trim()
  if (/^aed\s/i.test(t)) return t
  return `AED ${t}`
}
