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

/** Returns a single user-facing message, or null if the form is valid. */
export function getJobFormValidationMessage(form: JobFormData): string | null {
  const missing = REQUIRED_FIELDS.filter(({ key }) => !String(form[key] ?? "").trim()).map(
    ({ label }) => label
  )

  if (missing.length === 1) {
    return `${missing[0]} is required.`
  }

  if (missing.length > 1) {
    return `Please complete the following: ${missing.map((label) => `${label} is required.`).join(" ")}`
  }

  const salary = Number(form.salary)
  if (!Number.isFinite(salary) || salary <= 0) {
    return "Please enter a valid salary amount."
  }

  const jobType = String(form.jobType || "").toLowerCase()
  if (jobType === "full-time" && salary < 3000) {
    return "Full-time jobs require a minimum salary of 3000 AED."
  }
  if (jobType === "part-time" && salary < 1500) {
    return "Part-time jobs require a minimum salary of 1500 AED."
  }

  return null
}
