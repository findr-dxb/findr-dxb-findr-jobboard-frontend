"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Users, User, Mail, Calendar } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://findr-jobboard-backend-production.up.railway.app/api/v1"

interface ReferralJoiner {
  id: string
  name: string
  email: string
  role: "jobseeker" | "employer" | string
  joinedAt: string
  phoneNumber?: string
  location?: string
}

export default function ReferralJoinersPage() {
  const [joiners, setJoiners] = useState<ReferralJoiner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJoiners = async () => {
      try {
        const token =
          localStorage.getItem("findr_token") || localStorage.getItem("authToken") || localStorage.getItem("token")

        if (!token) {
          router.push("/login")
          return
        }

        const response = await axios.get(`${API_BASE_URL}/referrals/joiners`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            page,
            limit: 10,
          },
        })

        if (response.data?.success) {
          const payload = response.data.data || {}
          setJoiners(payload.joiners || [])
          setTotal(payload.total || 0)
          setTotalPages(payload.totalPages || 1)
        } else {
          const msg = response.data?.message || "Failed to load referred users"
          setError(msg)
          toast({
            title: "Error",
            description: msg,
            variant: "destructive",
          })
        }
      } catch (err: any) {
        console.error("Error fetching referral joiners:", err)
        const msg = err.response?.data?.message || "Failed to load referred users"
        setError(msg)
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJoiners()
  }, [router, toast, page])

  const totalJoiners = total
  const jobseekerCount = joiners.filter((j) => j.role === "jobseeker").length
  const employerCount = joiners.filter((j) => j.role === "employer").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600">Loading your referred users...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Users Joined Using Your Code</h1>
              <p className="text-gray-600">
                View all users who registered on Findr using your unique referral code.
              </p>
            </div>
            <Link href="/jobseeker/referrals/history">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Referral History
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalJoiners}</p>
                    <p className="text-sm text-gray-600">Total Referred Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{jobseekerCount}</p>
                    <p className="text-sm text-gray-600">Jobseeker Accounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <BuildingIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{employerCount}</p>
                    <p className="text-sm text-gray-600">Employer Accounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error state */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* List of joiners */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-4 h-4 mr-2 text-emerald-600" />
                Referred Users
              </CardTitle>
              <CardDescription>
                These users signed up using your referral code. Stay connected and help them succeed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {joiners.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No referred users yet</h3>
                  <p className="text-gray-600 mb-4">
                    Share your referral link with friends and colleagues to grow your network and earn rewards.
                  </p>
                  <Link href="/rewards/jobseeker/earn-money">
                    <Button className="gradient-bg text-white hover:opacity-90 h-10 text-sm px-5">
                      Learn how referrals work
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {joiners.map((joiner) => (
                      <div
                        key={joiner.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-emerald-50/40 transition-colors duration-150"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm text-gray-900">{joiner.name}</p>
                                <Badge
                                  className={
                                    joiner.role === "employer"
                                      ? "bg-purple-100 text-purple-800 text-[10px] font-semibold"
                                      : "bg-blue-100 text-blue-800 text-[10px] font-semibold"
                                  }
                                >
                                  {joiner.role === "employer" ? "Employer" : "Jobseeker"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="font-mono text-[11px]">{joiner.email}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Joined{" "}
                                    {joiner.joinedAt
                                      ? new Date(joiner.joinedAt).toLocaleDateString()
                                      : "Unknown date"}
                                  </span>
                                </span>
                              </div>
                              {joiner.phoneNumber && (
                                <p className="mt-1 text-xs text-gray-600">
                                  Phone: <span className="font-mono text-[11px]">{joiner.phoneNumber}</span>
                                </p>
                              )}
                              {joiner.location && (
                                <p className="text-xs text-gray-600">
                                  Location: <span className="font-medium">{joiner.location}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => router.push(`/jobseeker/referrals/joiners/${joiner.id}`)}
                            >
                              View More
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Page {page} of {totalPages} • Showing {joiners.length} of {totalJoiners} users
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function BuildingIcon() {
  return (
    <svg
      className="w-5 h-5 text-purple-600"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 21V5.6C4 4.72 4 4.28 4.163 3.913C4.307 3.593 4.547 3.327 4.846 3.157C5.189 2.96 5.626 2.96 6.5 2.96C7.374 2.96 7.811 2.96 8.154 3.157C8.453 3.327 8.693 3.593 8.837 3.913C9 4.28 9 4.72 9 5.6V21M4 21H2M4 21H9M20 21V10.4C20 9.52 20 9.08 19.837 8.713C19.693 8.393 19.453 8.127 19.154 7.957C18.811 7.76 18.374 7.76 17.5 7.76C16.626 7.76 16.189 7.76 15.846 7.957C15.547 8.127 15.307 8.393 15.163 8.713C15 9.08 15 9.52 15 10.4V21M20 21H22M20 21H15M9 21H15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 7.25V7.26M6.75 10.25V10.26M6.75 13.25V13.26M17.25 12.25V12.26M17.25 15.25V15.26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

