import type { JobFormData } from "./jobPostingSlice"

const REQUIRED_FIELDS: { key: keyof JobFormData; label: string }[] = [
  { key: "jobTitle", label: "Job title" },
  { key: "company", label: "Company name" },
  { key: "location", label: "Location" },
  { key: "jobType", label: "Job type" },
  { key: "experience", label: "Experience level" },
  { key: "salary", label: "Salary" },
  { key: "description", label: "Job description" },
  { key: "requirements", label: "Requirements" },
  { key: "deadline", label: "Application deadline" },
]

/** Returns a single user-facing message, or null if the form is complete. */
export function getJobFormValidationMessage(form: JobFormData): string | null {
  const missing = REQUIRED_FIELDS.filter(({ key }) => !String(form[key] ?? "").trim()).map(
    ({ label }) => label
  )

  if (missing.length === 0) return null

  if (missing.length === 1) {
    return `${missing[0]} is required.`
  }

  return `Please complete the following: ${missing.map((label) => `${label} is required.`).join(" ")}`
}
