"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  Download,
  Layers,
  GitBranch,
  XCircle,
  PauseCircle,
  Inbox,
  Star,
  CalendarCheck,
  UserCheck,
  Search,
  Filter,
} from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Application } from "@/lib/admin-types"
import { updateApplicationScreening } from "@/lib/admin-api"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 10

// Show friendly status text under candidate name
function getStatusLabel(status?: string) {
  if (status === "shortlisted") return "Shortlisted"
  if (status === "hired") return "Hired"
  if (status === "rejected" || status === "admin_rejected") return "Rejected"
  if (status === "interview_scheduled") return "Interview"
  if (status === "withdrawn") return "Withdrawn"
  if (status === "admin_hold") return "On Hold"
  return "Applied"
}

function getStatusColor(status?: string) {
  const label = getStatusLabel(status)
  if (label === "Shortlisted") return "bg-blue-100 text-blue-700"
  if (label === "Hired") return "bg-emerald-100 text-emerald-700"
  if (label === "Rejected") return "bg-rose-100 text-rose-700"
  if (label === "Interview") return "bg-green-100 text-green-700"
  if (label === "On Hold") return "bg-amber-100 text-amber-700"
  return "bg-slate-100 text-slate-600"
}

function formatDate(dateValue?: string) {
  if (!dateValue) return "-"
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getPeriodStart(period: string) {
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

export default function AdminApplicationsPage() {
  const router = useRouter()

  // All applications from API (loaded once)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [loadingActionId, setLoadingActionId] = useState("")

  // Filters (all handled on frontend)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [period, setPeriod] = useState("") // "", "daily", "weekly", "monthly", "custom"
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      setIsLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: "1",
        limit: "10000",
        sortBy: "appliedDate",
        sortOrder: "desc",
        status: "all",
      })

      const res = await fetch(`${API_URL}/admin/applications?${params}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch applications")
      }

      setApplications(json.data.applications || [])
    } catch (err: any) {
      setError(err.message || "Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------- Frontend filters ----------

  // 1) Filter by date first (used for summary box counts)
  let listByDate = applications

  if (period === "daily" || period === "weekly" || period === "monthly") {
    const start = getPeriodStart(period)
    listByDate = applications.filter((app) => {
      if (!app.appliedDate) return false
      return new Date(app.appliedDate) >= start
    })
  }

  if (period === "custom") {
    listByDate = applications.filter((app) => {
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

  // 2) Then filter by search + status box
  const searchText = search.toLowerCase().trim()

  const filteredList = listByDate.filter((app) => {
    // Search: candidate name or job title
    if (searchText) {
      const name = (app.candidate || "").toLowerCase()
      const job = (app.jobTitle || "").toLowerCase()
      if (!name.includes(searchText) && !job.includes(searchText)) {
        return false
      }
    }

    // Status box filter
    if (statusFilter === "all") return true
    if (statusFilter === "rejected") {
      return app.status === "rejected" || app.status === "admin_rejected"
    }
    return app.status === statusFilter
  })

  // Summary box counts (from date-filtered list only)
  const stats = {
    total: listByDate.length,
    movedToPipeline: listByDate.filter((a) => a.status === "pending").length,
    rejected: listByDate.filter(
      (a) => a.status === "rejected" || a.status === "admin_rejected"
    ).length,
    hold: listByDate.filter((a) => a.status === "admin_hold").length,
    unattended: listByDate.filter((a) => a.status === "admin_review").length,
    shortlisted: listByDate.filter((a) => a.status === "shortlisted").length,
    interviewed: listByDate.filter((a) => a.status === "interview_scheduled").length,
    hired: listByDate.filter((a) => a.status === "hired").length,
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pageList = filteredList.slice(startIndex, startIndex + PAGE_SIZE)

  // ---------- Actions ----------

  async function handleAction(appId: string, action: "pipeline" | "hold" | "reject") {
    try {
      setLoadingActionId(appId)
      setError("")
      await updateApplicationScreening(appId, action)
      await loadApplications()
    } catch (err: any) {
      setError(err.message || "Failed to update application")
    } finally {
      setLoadingActionId("")
    }
  }

  function handleExport() {
    const rows = [
      ["Application ID", "Candidate", "Job Title", "Status", "Applied Date"],
      ...filteredList.map((app) => [
        app.id,
        app.candidate,
        app.jobTitle,
        app.status || "",
        app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "",
      ]),
    ]

    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, sheet, "Applications")
    XLSX.writeFile(workbook, `Applications_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  function clickStatBox(filterValue: string) {
    setStatusFilter(filterValue)
    setPage(1)
  }

  function clickPeriod(value: string) {
    setPeriod(value)
    setStartDate("")
    setEndDate("")
    setPage(1)
    setFiltersOpen(false)
  }

  function applyCustomRange() {
    setPeriod("custom")
    setPage(1)
    setFiltersOpen(false)
  }

  function clearDateFilter() {
    setPeriod("")
    setStartDate("")
    setEndDate("")
    setPage(1)
    setFiltersOpen(false)
  }

  // Summary boxes config
  const boxes = [
    { label: "Total", value: stats.total, filter: "all", icon: Layers, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-emerald-700" },
    { label: "Moved to Pipeline", value: stats.movedToPipeline, filter: "pending", icon: GitBranch, iconBg: "bg-teal-50", iconColor: "text-teal-600", valueColor: "text-gray-900" },
    { label: "Rejected", value: stats.rejected, filter: "rejected", icon: XCircle, iconBg: "bg-rose-50", iconColor: "text-rose-600", valueColor: "text-gray-900" },
    { label: "Hold", value: stats.hold, filter: "admin_hold", icon: PauseCircle, iconBg: "bg-amber-50", iconColor: "text-amber-600", valueColor: "text-gray-900" },
    { label: "Unattended", value: stats.unattended, filter: "admin_review", icon: Inbox, iconBg: "bg-sky-50", iconColor: "text-sky-600", valueColor: "text-gray-900" },
    { label: "Shortlisted", value: stats.shortlisted, filter: "shortlisted", icon: Star, iconBg: "bg-blue-50", iconColor: "text-blue-600", valueColor: "text-gray-900" },
    { label: "Interviewed", value: stats.interviewed, filter: "interview_scheduled", icon: CalendarCheck, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", valueColor: "text-gray-900" },
    { label: "Hired", value: stats.hired, filter: "hired", icon: UserCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-gray-900" },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Screen applications before they reach employers
        </p>
        {error && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4">
        {boxes.map((box) => {
          const Icon = box.icon
          const isActive = statusFilter === box.filter

          return (
            <button
              key={box.filter}
              type="button"
              onClick={() => clickStatBox(box.filter)}
              className={
                isActive
                  ? "text-left rounded-xl border border-emerald-300 bg-white p-4 shadow-sm ring-2 ring-emerald-500/30"
                  : "text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
              }
            >
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${box.iconBg}`}>
                <Icon className={`h-4 w-4 ${box.iconColor}`} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {box.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${box.valueColor}`}>{box.value}</p>
            </button>
          )
        })}
      </div>

      {/* Search + Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by candidate or job title..."
            className="h-11 pl-10 rounded-full border-emerald-200 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Date filter dropdown */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button className="h-11 rounded-full bg-emerald-500 px-5 text-white hover:bg-emerald-600">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-64 p-0 overflow-visible"
            style={{ maxHeight: "none" }}
          >
            {/* Quick periods */}
            <div className="px-3 pt-3 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Time Period
              </p>
              {[
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => clickPeriod(item.value)}
                  className={
                    period === item.value
                      ? "w-full rounded-md px-2.5 py-1.5 text-left text-sm bg-emerald-50 text-emerald-700 font-medium"
                      : "w-full rounded-md px-2.5 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <div className="border-t px-3 py-2.5 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                Custom Range
              </p>

              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <Button
                onClick={applyCustomRange}
                className="w-full h-9 bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Apply Range
              </Button>

              {period && (
                <button
                  type="button"
                  onClick={clearDateFilter}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Export */}
        <Button
          onClick={handleExport}
          variant="outline"
          className="h-11 rounded-full px-5"
          disabled={isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading applications...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <>
          <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Job Title</th>
                  <th className="px-5 py-4">Actions</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {pageList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-500">
                      No applications found
                    </td>
                  </tr>
                )}

                {pageList.map((app) => {
                  const isBusy = loadingActionId === app.id
                  const isRejected = app.status === "admin_rejected" || app.status === "rejected"
                  const isPipeline = app.status === "pending"
                  const isHold = app.status === "admin_hold"

                  // Only show action buttons for apps still in admin screening
                  const showActions =
                    app.status === "admin_review" ||
                    app.status === "admin_hold" ||
                    app.status === "pending"

                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50">
                      {/* Candidate */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {app.candidateAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.candidateAvatar}
                              alt={app.candidate}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold">
                              {app.candidateInitials || "NA"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{app.candidate}</p>
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${getStatusColor(app.status)}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job title */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-emerald-600">{app.jobTitle}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        {showActions ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              disabled={isBusy || isRejected || isPipeline}
                              onClick={() => handleAction(app.id, "pipeline")}
                              className="h-8 rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600"
                            >
                              Move to Pipeline
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isBusy || isRejected || isHold}
                              onClick={() => handleAction(app.id, "hold")}
                              className="h-8 rounded-full border-amber-200 bg-amber-50 text-amber-700 text-xs hover:bg-amber-100"
                            >
                              Hold
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isBusy || isRejected}
                              onClick={() => handleAction(app.id, "reject")}
                              className="h-8 rounded-full border-rose-200 bg-rose-50 text-rose-600 text-xs hover:bg-rose-100"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(app.appliedDate)}
                      </td>

                      {/* View */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(app.applicationUrl)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredList.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} ({filteredList.length} results)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
