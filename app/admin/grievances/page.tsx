"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Mail, User, Calendar, FileText, Eye, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Grievance {
  _id: string
  userId?: {
    _id: string
    name?: string
    email?: string
    fullName?: string
  }
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

export default function AdminGrievancesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalGrievances, setTotalGrievances] = useState(0)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token
      ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  const fetchGrievances = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/grievances?page=${currentPage}&limit=${pageSize}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view grievances.",
            variant: "destructive",
          })
          router.push('/login/admin')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setGrievances(data.data.grievances)
        setTotalGrievances(data.data.pagination.total)
      } else {
        throw new Error(data.message || 'Failed to fetch grievances')
      }
    } catch (error) {
      console.error('Error fetching grievances:', error)
      toast({
        title: "Error",
        description: "Failed to fetch grievances.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrievances()
  }, [currentPage])

  const handleViewDetails = (grievance: Grievance) => {
    setSelectedGrievance(grievance)
    setDetailOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (grievance: Grievance) => {
    if (grievance.userId) {
      return grievance.userId.fullName || grievance.userId.name || 'Registered User'
    }
    return 'Guest User'
  }

  const totalPages = Math.ceil(totalGrievances / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalGrievances)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grievances & Contact Messages</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage all contact form submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {totalGrievances} Total Messages
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGrievances}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading grievances...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {grievances.map((grievance) => (
              <Card key={grievance._id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        {grievance.subject}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{getUserName(grievance)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{grievance.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(grievance.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {grievance.userId && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Registered
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                    {grievance.message}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(grievance)}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {grievances.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grievances</h3>
                <p className="text-gray-600">No contact messages or grievances at the moment.</p>
              </CardContent>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{totalGrievances}</span> messages
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="sm:hidden hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 p-0 text-xs ${
                          currentPage === page 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="sm:hidden hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Message Details</DialogTitle>
                <DialogDescription>Full details of the contact message</DialogDescription>
              </DialogHeader>
              {selectedGrievance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Name</div>
                      <div className="font-medium text-gray-900">{selectedGrievance.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Email</div>
                      <div className="font-medium text-gray-900 break-all">{selectedGrievance.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">User Type</div>
                      <div className="font-medium text-gray-900">
                        {selectedGrievance.userId ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Registered User
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Guest User
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedGrievance.userId && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">User Account</div>
                        <div className="font-medium text-gray-900">
                          {selectedGrievance.userId.fullName || selectedGrievance.userId.name || 'N/A'}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date Submitted</div>
                      <div className="font-medium text-gray-900">{formatDate(selectedGrievance.createdAt)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Subject</div>
                    <div className="font-medium text-gray-900">{selectedGrievance.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Message</div>
                    <div className="p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                      {selectedGrievance.message}
                    </div>
                  </div>
                  <div className="border-t pt-4 flex gap-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        window.location.href = `mailto:${selectedGrievance.email}?subject=Re: ${selectedGrievance.subject}`
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Reply via Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDetailOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

