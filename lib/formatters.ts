/**
 * Format salary for display (number or min/max range).
 * @param emptyFallback - String to return when salary is empty/invalid (default: "—")
 */
export function formatSalary(
  salary?: number | { min?: number; max?: number } | null,
  emptyFallback = "—"
): string {
  if (salary == null) return emptyFallback;
  if (typeof salary === "number") {
    return `AED ${salary.toLocaleString()}`;
  }
  if (typeof salary === "object") {
    const { min, max } = salary;
    if (min != null && max != null) {
      return `AED ${min.toLocaleString()} – ${max.toLocaleString()}`;
    }
    if (min != null) return `AED ${min.toLocaleString()}+`;
    if (max != null) return `Up to AED ${max.toLocaleString()}`;
  }
  return emptyFallback;
}

/** Display jobseeker salary expectation string from profile (may already include "AED"). */
export function formatSalaryExpectation(value?: string | null, emptyFallback = "—"): string {
  if (value == null || String(value).trim() === "") return emptyFallback;
  const t = String(value).trim();
  if (/^aed\s/i.test(t)) return t;
  return `AED ${t}`;
}
