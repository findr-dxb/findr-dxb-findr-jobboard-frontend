"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, ArrowLeft, Calendar, User, Building, CheckCircle, Clock, XCircle, Loader2, Eye } from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://findr-jobboard-backend-production.up.railway.app/api/v1"

interface ReferralHistoryItem {
  id: string;
  referredUser: string;
  referredUserEmail: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'pending' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected';
  lastUpdate: string;
  applicationId: string;
  jobId?: string;
  matchScore: number;
}

interface ReferralStats {
  total: number;
  pending: number;
  shortlisted: number;
  interview_scheduled: number;
  hired: number;
  rejected: number;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "shortlisted":
      return <CheckCircle className="w-4 h-4 text-blue-500" />
    case "interview_scheduled":
      return <Calendar className="w-4 h-4 text-green-500" />
    case "hired":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
  switch (status) {
    case "pending":
      return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</Badge>
    case "shortlisted":
      return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}>Shortlisted</Badge>
    case "interview_scheduled":
      return <Badge className={`${baseClasses} bg-green-100 text-green-800`}>Interview</Badge>
    case "hired":
      return <Badge className={`${baseClasses} bg-emerald-100 text-emerald-800`}>Hired</Badge>
    case "rejected":
      return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</Badge>
    default:
      return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending"
    case "shortlisted":
      return "Shortlisted"
    case "interview_scheduled":
      return "Interview Scheduled"
    case "hired":
      return "Hired"
    case "rejected":
      return "Rejected"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "1 day ago"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
}

export default function ReferralHistoryPage() {
  const [filterType, setFilterType] = useState<'all' | 'successful' | 'active'>('all')
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>([])
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    pending: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    hired: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()

  // Fetch referral history from API
  useEffect(() => {
    const fetchReferralHistory = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await axios.get(`${API_BASE_URL}/applications/referrals/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.data) {
          setReferralHistory(response.data.data || [])
          setStats(response.data.stats || stats)
        }
      } catch (error: any) {
        console.error('Error fetching referral history:', error)
        const errorMessage = error.response?.data?.message || 'Failed to load referral history'
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReferralHistory()
  }, [router, toast])

  const activeReferrals = stats.pending + stats.shortlisted + stats.interview_scheduled
  const totalReferrals = stats.total
  const successfulReferrals = stats.hired

  // Filter referral history based on selected filter
  const filteredReferralHistory = useMemo(() => {
    switch (filterType) {
      case 'successful':
        return referralHistory.filter(ref => ref.status === "hired")
      case 'active':
        return referralHistory.filter(ref => 
          ref.status === "pending" || 
          ref.status === "shortlisted" || 
          ref.status === "interview_scheduled"
        )
      default:
        return referralHistory
    }
  }, [filterType, referralHistory])

  const handleCardClick = (type: 'all' | 'successful' | 'active') => {
    // Toggle off filter if clicking the same card
    if (filterType === type) {
      setFilterType('all')
    } else {
      setFilterType(type)
    }
  }

  const getCardStyles = (type: 'all' | 'successful' | 'active') => {
    const isSelected = filterType === type
    return {
      card: `card-shadow border-0 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200' 
          : 'hover:shadow-lg hover:bg-gray-50'
      }`,
      icon: `w-10 h-10 rounded-lg flex items-center justify-center ${
        type === 'all' ? 'bg-blue-50' : type === 'successful' ? 'bg-green-50' : 'bg-yellow-50'
      }`,
      iconColor: type === 'all' ? 'text-blue-600' : type === 'successful' ? 'text-green-600' : 'text-yellow-600'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600">Loading your referral history...</p>
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
              <h1 className="text-2xl font-bold mb-2">Your Referral History</h1>
              <p className="text-gray-600">Track how your shared links have performed.</p>
            </div>
            <Link href="/jobseeker/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={getCardStyles('all').card}
              onClick={() => handleCardClick('all')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={getCardStyles('all').icon}>
                    <UserPlus className={`w-5 h-5 ${getCardStyles('all').iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalReferrals}</p>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={getCardStyles('successful').card}
              onClick={() => handleCardClick('successful')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={getCardStyles('successful').icon}>
                    <CheckCircle className={`w-5 h-5 ${getCardStyles('successful').iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{successfulReferrals}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={getCardStyles('active').card}
              onClick={() => handleCardClick('active')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={getCardStyles('active').icon}>
                    <Clock className={`w-5 h-5 ${getCardStyles('active').iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeReferrals}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Indicator */}
          {filterType !== 'all' && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Showing:</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {filterType === 'successful' ? 'Successful Referrals' : 'Active Referrals'}
                </Badge>
                <span className="text-sm text-gray-500">
                  ({filteredReferralHistory.length} of {totalReferrals})
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Filter
              </Button>
            </div>
          )}

          {/* Referral History Table */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
                Referral History
              </CardTitle>
              <CardDescription>
                Detailed view of all your referrals and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Referred User</TableHead>
                      <TableHead className="font-semibold text-gray-700">Job & Company</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date Applied</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Match Score</TableHead>
                      <TableHead className="font-semibold text-gray-700">Last Update</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferralHistory.map((referral) => (
                      <TableRow key={referral.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm hover:text-emerald-600 transition-colors">{referral.referredUser}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm hover:text-emerald-600 transition-colors">{referral.jobTitle}</p>
                            <div className="flex items-center space-x-1">
                              <Building className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-600">{referral.company}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{new Date(referral.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(referral.status)}
                            <div className="cursor-pointer hover:shadow-sm transition-shadow">
                              {getStatusBadge(referral.status)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  referral.matchScore >= 80 ? 'bg-emerald-500' :
                                  referral.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${referral.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{referral.matchScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{getTimeAgo(referral.lastUpdate)}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                // Fetch application to get jobId
                                const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
                                const appResponse = await axios.get(`${API_BASE_URL}/applications/${referral.applicationId}`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                })
                                const jobId = appResponse.data.data?.jobId?._id || appResponse.data.data?.jobId
                                if (jobId) {
                                  router.push(`/jobseeker/refer-friend/${jobId}?view=true&applicationId=${referral.applicationId}`)
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "Could not find job information",
                                    variant: "destructive"
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to load referral details",
                                  variant: "destructive"
                                })
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredReferralHistory.map((referral) => (
                  <div key={referral.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm hover:text-emerald-600 transition-colors">{referral.referredUser}</p>
                          <p className="text-xs text-gray-600">{referral.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(referral.status)}
                        <div className="cursor-pointer hover:shadow-sm transition-shadow">
                          {getStatusBadge(referral.status)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{referral.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(referral.date).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                referral.matchScore >= 80 ? 'bg-emerald-500' :
                                referral.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${referral.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{referral.matchScore}% Match</span>
                        </div>
                        <span className="text-xs text-gray-500">{getTimeAgo(referral.lastUpdate)}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Fetch application to get jobId
                              const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
                              const appResponse = await axios.get(`${API_BASE_URL}/applications/${referral.applicationId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              })
                              const jobId = appResponse.data.data?.jobId?._id || appResponse.data.data?.jobId
                              if (jobId) {
                                router.push(`/jobseeker/refer-friend/${jobId}?view=true&applicationId=${referral.applicationId}`)
                              } else {
                                toast({
                                  title: "Error",
                                  description: "Could not find job information",
                                  variant: "destructive"
                                })
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to load referral details",
                                variant: "destructive"
                              })
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredReferralHistory.length === 0 && (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterType === 'all' ? 'No referrals yet' : `No ${filterType} referrals`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filterType === 'all' 
                      ? 'Start referring your friends to earn rewards!' 
                      : `No referrals match the "${filterType}" filter.`
                    }
                  </p>
                  {filterType === 'all' && (
                    <Link href="/jobseeker/search">
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 text-sm px-5">
                        Browse Jobs to Refer
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/jobseeker/search" className="flex-1">
                  <Button className="w-full gradient-bg text-white cursor-pointer hover:opacity-90">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Refer New Friend
                  </Button>
                </Link>
                <Link href="/rewards/jobseeker" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Rewards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 