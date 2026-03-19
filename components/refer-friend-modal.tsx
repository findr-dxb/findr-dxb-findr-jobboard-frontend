"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { formatSalary } from "@/lib/formatters"
import { User, X, Loader2, SendHorizonal, Users, ChevronLeft, ChevronRight, MapPin, Building2, Search } from "lucide-react"

const USERS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://findr-jobboard-backend-production.up.railway.app/api/v1"

interface NetworkPerson {
  id: string
  name: string
  role: string
  type: "invited" | "referred" | "searched"
  status: string
}

interface Job {
  _id: string
  title: string
  companyName: string
  location?: string
  jobType?: string[]
  salary?: number | { min?: number; max?: number }
}

interface ReferFriendModalProps {
  job: Job
  onClose: () => void
}

const getTypeBadge = (type: "invited" | "referred" | "searched") => {
  switch (type) {
    case "invited":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Invited
        </Badge>
      )
    case "referred":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          Referred
        </Badge>
      )
    case "searched":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
          Searched
        </Badge>
      )
  }
}

export function ReferFriendModal({ job, onClose }: ReferFriendModalProps) {
  const [people, setPeople] = useState<NetworkPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [referringId, setReferringId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const { toast } = useToast()

  const fetchNetwork = useCallback(
    async (pageNum: number, search: string) => {
      const token =
        localStorage.getItem("findr_token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token")
      if (!token) {
        toast({ title: "Please log in", variant: "destructive" })
        onClose()
        return
      }
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/referrals/my-network`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageNum,
            limit: USERS_PER_PAGE,
            search: search.trim() || undefined,
            role: "jobseeker",
          },
        })
        if (res.data?.success) {
          setPeople(res.data.data || [])
          setPagination(res.data.pagination || { total: 0, pages: 1 })
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load your network",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [onClose, toast]
  )

  useEffect(() => {
    const timer = setTimeout(
      () => fetchNetwork(page, searchQuery),
      searchQuery ? SEARCH_DEBOUNCE_MS : 0
    )
    return () => clearTimeout(timer)
  }, [page, searchQuery, fetchNetwork])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleRefer = async (person: NetworkPerson) => {
    if (person.role !== "jobseeker") {
      toast({
        title: "Cannot refer",
        description: "You can only refer jobseekers for jobs.",
        variant: "destructive",
      })
      return
    }

    const token =
      localStorage.getItem("findr_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")
    if (!token) return

    setReferringId(person.id)
    try {
      const profileRes = await axios.get(
        `${API_BASE_URL}/referrals/joiners/${person.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!profileRes.data?.success) throw new Error("Failed to load profile")

      const { type, profile } = profileRes.data.data
      const js = type === "jobseeker" ? profile : null
      if (!js || !js.email) {
        toast({
          title: "Cannot refer",
          description: "This contact does not have an email on file.",
          variant: "destructive",
        })
        return
      }

      const displayName =
        js.fullName || js.name || js.email?.split("@")[0] || "User"
      const payload = {
        jobId: job._id,
        friendName: displayName,
        email: js.email || "",
        phone: js.phoneNumber || "",
        dateOfBirth: js.dateOfBirth || "",
        nationality: js.nationality || "",
        currentCompany:
          js.professionalExperience?.[0]?.company || "Not specified",
        expectedSalary: js.jobPreferences?.salaryExpectation || "0",
        location: js.location || "",
        education: js.education?.[0]?.highestDegree || "",
        skills: (js.skills || []).join(", "),
        certifications: (js.certifications || []).join(", "),
        resumeUrl:
          js.resumeDocument || js.jobPreferences?.resumeAndDocs?.[0] || "",
      }

      await axios.post(`${API_BASE_URL}/applications/referral`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast({
        title: "Referral Submitted",
        description: `${displayName} has been referred for "${job.title}" at ${job.companyName}. A referral approval link has been sent to the candidate.`,
      })
      onClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to submit referral."
      if (msg.toLowerCase().includes("already referred")) {
        toast({
          title: "Already referred",
          description: msg,
        })
      } else {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        })
      }
    } finally {
      setReferringId(null)
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refer-friend-modal-title"
      aria-describedby="refer-friend-modal-desc"
    >
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col card-shadow border-0 rounded-2xl overflow-hidden">
        <CardHeader className="px-8 py-6 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle id="refer-friend-modal-title" className="flex items-center gap-2 text-xl">
                <SendHorizonal className="w-6 h-6 text-emerald-600" />
                Refer a Friend for: {job.title}
              </CardTitle>
              <CardDescription id="refer-friend-modal-desc" className="mt-2 text-gray-500">
                Select someone from your network to refer for this job at{" "}
                {job.companyName}
              </CardDescription>
            </div>
            <Button
              ref={closeBtnRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
              <p className="text-gray-500">Loading your network…</p>
            </div>
          ) : people.length === 0 && !loading ? (
            <div className="text-center py-20 px-6">
              <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobseekers in your network
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Invite friends to join Findr or refer people from your network to
                build your connections.
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b bg-gray-50 shrink-0">
                <div className="relative max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, status, job title, company, location, type, or salary…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-lg border-gray-200"
                    aria-label="Search network members"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto px-6 py-4">
                {people.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-1">No matching results</p>
                    <p className="text-sm text-gray-500">
                      Try a different search term or clear the search to see all network members.
                    </p>
                  </div>
                ) : (
                <Table aria-label="Network members to refer">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Job Title
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Company
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Location
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Salary
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {people.map((person) => (
                      <TableRow
                        key={person.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {person.name}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {person.role}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {getTypeBadge(person.type)}
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="font-medium text-gray-900 text-sm">
                            {job.title}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700">
                              {job.companyName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {job.location ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600">
                                {job.location}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {job.jobType?.[0] ? (
                            <Badge className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full capitalize">
                              {job.jobType[0]}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-700">
                            {formatSalary(job.salary)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={referringId === person.id}
                            onClick={() => handleRefer(person)}
                            aria-label={`Refer ${person.name} for this job`}
                          >
                            {referringId === person.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <SendHorizonal className="w-4 h-4 mr-1.5" />
                                Refer
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 shrink-0">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {pagination.total === 0
                        ? "0"
                        : `${(page - 1) * USERS_PER_PAGE + 1}–${Math.min(page * USERS_PER_PAGE, pagination.total)}`}
                    </span>{" "}
                    of <span className="font-semibold">{pagination.total}</span>{" "}
                    {searchQuery.trim() ? "matching " : ""}network members
                  </p>
                  <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-9"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[100px] text-center" aria-live="polite">
                      Page {page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="h-9"
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
