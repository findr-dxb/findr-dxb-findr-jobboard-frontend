"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  RmPostingRequestCard,
  type RmPostingRequest,
} from "@/components/admin/rm-posting-request-card"
import {
  ProvidePostingModal,
  type ProvidePostingFormData,
} from "@/components/admin/provide-posting-modal"

type StatusFilter = "all" | "connect_clicked" | "query_submitted" | "posting_provided"

type StatusCounts = {
  connect_clicked: number
  query_submitted: number
  posting_provided: number
  total: number
}

export default function AdminRmPostingRequestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<RmPostingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<RmPostingRequest | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [queryOpen, setQueryOpen] = useState(false)
  const [providingId, setProvidingId] = useState<string | null>(null)
  const [provideModalOpen, setProvideModalOpen] = useState(false)
  const [provideTarget, setProvideTarget] = useState<RmPostingRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    connect_clicked: 0,
    query_submitted: 0,
    posting_provided: 0,
    total: 0,
  })

  const getAuthHeaders = (): Record<string, string> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("findr_token") || localStorage.getItem("authToken")
        : null
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const statusParam =
        statusFilter === "all" ? "" : `&status=${statusFilter}`
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/rm-posting-requests?page=${currentPage}&limit=${pageSize}${statusParam}`,
        { headers: getAuthHeaders() }
      )

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in as admin.",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setRequests(data.data.requests || [])
        setTotal(data.data.pagination?.total || 0)
        if (data.data.statusCounts) {
          setStatusCounts(data.data.statusCounts)
        }
      } else {
        throw new Error(data.message || "Failed to fetch requests")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load RM posting requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [currentPage, statusFilter])

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  const filterOptions: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: statusCounts.total },
    {
      value: "query_submitted",
      label: "Query Submitted",
      count: statusCounts.query_submitted,
    },
    {
      value: "connect_clicked",
      label: "Connect Only",
      count: statusCounts.connect_clicked,
    },
    {
      value: "posting_provided",
      label: "Posting Provided",
      count: statusCounts.posting_provided,
    },
  ]

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openProvideModal = (request: RmPostingRequest) => {
    setProvideTarget(request)
    setProvideModalOpen(true)
  }

  const handleSubmitProvidePosting = async (formData: ProvidePostingFormData) => {
    if (!provideTarget) return

    setProvidingId(provideTarget._id)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/rm-posting-requests/${provideTarget._id}/provide-posting`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            numberOfPostings: formData.numberOfPostings,
            expiryDate: formData.expiryDate,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to grant posting slots")
      }

      toast({
        title: "Posting granted",
        description: `${provideTarget.companyName || provideTarget.employerName} received ${formData.numberOfPostings} posting slot(s) until ${formData.expiryDate}.`,
      })

      setRequests((prev) =>
        prev.map((item) =>
          item._id === provideTarget._id
            ? {
                ...item,
                postingsGranted: data.data.postingsGranted,
                grantExpiresAt: data.data.grantExpiresAt,
                postingProvidedAt: data.data.postingProvidedAt,
                employerId: item.employerId
                  ? {
                      ...item.employerId,
                      jobPostingLimit: data.data.jobPostingLimit,
                      jobPostingGrantExpiresAt: data.data.jobPostingGrantExpiresAt,
                      jobPostingGrantedAt: data.data.jobPostingGrantedAt,
                    }
                  : item.employerId,
              }
            : item
        )
      )
      setProvideModalOpen(false)
      setProvideTarget(null)
      fetchRequests()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to grant job posting slots.",
        variant: "destructive",
      })
    } finally {
      setProvidingId(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="w-7 h-7 text-emerald-600" />
            RM Job Posting Requests
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review employer requests and grant posting access when ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
            {statusCounts.query_submitted} with query
          </Badge>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
            {statusCounts.connect_clicked} connect only
          </Badge>
          <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">
            {statusCounts.posting_provided} posting provided
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "default" : "outline"}
            size="sm"
            className={
              statusFilter === option.value
                ? "gradient-bg text-white"
                : undefined
            }
            onClick={() => handleStatusFilterChange(option.value)}
          >
            {option.label}
            <Badge
              variant="secondary"
              className={`ml-2 h-5 px-1.5 ${
                statusFilter === option.value
                  ? "bg-white/20 text-white hover:bg-white/20"
                  : ""
              }`}
            >
              {option.count}
            </Badge>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {statusFilter === "all"
              ? "No Relationship Manager posting requests yet."
              : statusFilter === "query_submitted"
                ? "No employers have submitted a query yet."
                : statusFilter === "posting_provided"
                  ? "No posting grants have been provided yet."
                  : "No connect-only requests right now."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {requests.map((item) => (
              <RmPostingRequestCard
                key={item._id}
                request={item}
                isProviding={providingId === item._id}
                onViewQuery={(request) => {
                  setSelected(request)
                  setQueryOpen(true)
                }}
                onViewDetails={(request) => {
                  setSelected(request)
                  setDetailOpen(true)
                }}
                onProvidePosting={openProvideModal}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}–{endIndex} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Employer Query</DialogTitle>
            <DialogDescription>
              Message submitted from the Relationship Manager flow
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium text-slate-900">
                {selected.companyName || selected.employerName}
              </p>
              <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-slate-800 whitespace-pre-wrap">
                {selected.query?.trim() || "No query submitted yet."}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>RM Posting Request</DialogTitle>
            <DialogDescription>Employer connect and query details</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-500">Company</span>
                <span className="font-medium">{selected.companyName || "—"}</span>
                <span className="text-gray-500">Contact person</span>
                <span className="font-medium">
                  {selected.employerId?.contactPerson?.name?.trim() || "—"}
                </span>
                <span className="text-gray-500">Company email</span>
                <span className="font-medium">
                  {selected.employerId?.contactPerson?.email?.trim() ||
                    selected.employerId?.companyEmail?.trim() ||
                    "—"}
                </span>
                <span className="text-gray-500">Company phone</span>
                <span className="font-medium">
                  {selected.employerId?.contactPerson?.phone?.trim() ||
                    selected.employerId?.phoneNumber?.trim() ||
                    "—"}
                </span>
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">
                  {selected.status.replace("_", " ")}
                </span>
                <span className="text-gray-500">Connect clicked</span>
                <span>{formatDate(selected.clickedAt)}</span>
                <span className="text-gray-500">Query submitted</span>
                <span>{formatDate(selected.submittedAt)}</span>
                <span className="text-gray-500">Posting limit</span>
                <span>{selected.employerId?.jobPostingLimit ?? "—"}</span>
                <span className="text-gray-500">Postings granted</span>
                <span>{selected.postingsGranted ?? "—"}</span>
                <span className="text-gray-500">Grant expires</span>
                <span>{formatDate(selected.grantExpiresAt)}</span>
                <span className="text-gray-500">Provided at</span>
                <span>{formatDate(selected.postingProvidedAt)}</span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Query</p>
                <p className="bg-slate-50 rounded-lg p-3 border text-gray-800 whitespace-pre-wrap">
                  {selected.query || "—"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ProvidePostingModal
        open={provideModalOpen}
        onOpenChange={(open) => {
          setProvideModalOpen(open)
          if (!open) setProvideTarget(null)
        }}
        request={provideTarget}
        isSubmitting={providingId === provideTarget?._id}
        onSubmit={handleSubmitProvidePosting}
      />
    </div>
  )
}
