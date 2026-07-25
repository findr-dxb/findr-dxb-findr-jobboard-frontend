/**
 * Status labels shown to job seekers.
 * Never show internal admin statuses like "admin_review".
 */
export function getJobseekerStatusLabel(status?: string): string {
  if (!status) return "Applied"

  if (status === "admin_review" || status === "admin_hold") return "Applied"
  if (status === "admin_rejected" || status === "rejected") return "Rejected"
  if (status === "pending") return "Applied"
  if (status === "shortlisted") return "Shortlisted"
  if (status === "interview_scheduled") return "Interview Scheduled"
  if (status === "hired") return "Hired"
  if (status === "withdrawn") return "Withdrawn"

  // Fallback: turn snake_case into words, but never leave "admin" in the label
  return status
    .replace(/^admin_/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
