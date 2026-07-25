import { Application } from "@/lib/admin-types"

// Convert status code to friendly label shown under candidate name
export function getStatusLabel(status?: string) {
  if (status === "shortlisted") return "Shortlisted"
  if (status === "hired") return "Hired"
  if (status === "rejected" || status === "admin_rejected") return "Rejected"
  if (status === "interview_scheduled") return "Interview"
  if (status === "withdrawn") return "Withdrawn"
  if (status === "admin_hold") return "On Hold"
  return "Applied"
}

// Badge color based on friendly label
export function getStatusColor(status?: string) {
  const label = getStatusLabel(status)

  if (label === "Shortlisted") return "bg-blue-100 text-blue-700"
  if (label === "Hired") return "bg-emerald-100 text-emerald-700"
  if (label === "Rejected") return "bg-rose-100 text-rose-700"
  if (label === "Interview") return "bg-green-100 text-green-700"
  if (label === "On Hold") return "bg-amber-100 text-amber-700"
  return "bg-slate-100 text-slate-600"
}

// Format applied date like "25 Jul 2026"
export function formatDate(dateValue?: string) {
  if (!dateValue) return "-"

  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Start date for Daily / Weekly / Monthly filters
export function getPeriodStart(period: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  if (period === "weekly") {
    start.setDate(start.getDate() - 7)
  }

  if (period === "monthly") {
    start.setMonth(start.getMonth() - 1)
  }

  return start
}

// Step 1: filter by date period
export function filterByDate(
  apps: Application[],
  period: string,
  startDate: string,
  endDate: string
) {
  // No date filter selected
  if (!period) return apps

  // Daily / Weekly / Monthly
  if (period === "daily" || period === "weekly" || period === "monthly") {
    const start = getPeriodStart(period)

    return apps.filter((app) => {
      if (!app.appliedDate) return false
      return new Date(app.appliedDate) >= start
    })
  }

  // Custom range
  if (period === "custom") {
    return apps.filter((app) => {
      if (!app.appliedDate) return false

      const applied = new Date(app.appliedDate)

      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (applied < start) return false
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (applied > end) return false
      }

      return true
    })
  }

  return apps
}

// Step 2: filter by search text + status box
export function filterBySearchAndStatus(
  apps: Application[],
  search: string,
  statusFilter: string
) {
  const searchText = search.toLowerCase().trim()

  return apps.filter((app) => {
    // Search by candidate name or job title
    if (searchText) {
      const name = (app.candidate || "").toLowerCase()
      const job = (app.jobTitle || "").toLowerCase()
      const matchName = name.includes(searchText)
      const matchJob = job.includes(searchText)
      if (!matchName && !matchJob) return false
    }

    // Status box filter
    if (statusFilter === "all") return true

    if (statusFilter === "rejected") {
      return app.status === "rejected" || app.status === "admin_rejected"
    }

    return app.status === statusFilter
  })
}

// Count apps for each summary box (uses date-filtered list only)
export function getStats(apps: Application[]) {
  return {
    total: apps.length,
    movedToPipeline: apps.filter((a) => a.status === "pending").length,
    rejected: apps.filter(
      (a) => a.status === "rejected" || a.status === "admin_rejected"
    ).length,
    hold: apps.filter((a) => a.status === "admin_hold").length,
    unattended: apps.filter((a) => a.status === "admin_review").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    interviewed: apps.filter((a) => a.status === "interview_scheduled").length,
    hired: apps.filter((a) => a.status === "hired").length,
  }
}

// Show Pipeline / Hold / Reject buttons only for screening statuses
export function canShowActions(status?: string) {
  return (
    status === "admin_review" ||
    status === "admin_hold" ||
    status === "pending"
  )
}
