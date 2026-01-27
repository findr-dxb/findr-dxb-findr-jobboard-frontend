"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Clock, Building2, CheckCircle, FileText, Mail, ChevronLeft, ChevronRight, Phone, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Interface for quote request data
interface QuoteRequest {
  _id: string
  service: string
  companyName: string
  contactPerson: {
    name: string
    email: string
    phone: string
  }
  requirements: string
  budget: string
  timeline: string
  status: string
  priority: string
  createdAt: string
  adminResponse?: {
    message: string
    quotedPrice: number
    quotedTimeline: string
    respondedAt: string
  }
}

export default function QuotationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(4) // Show 4 quotations per page
  const [totalQuotations, setTotalQuotations] = useState(0)
  const [contactOpen, setContactOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<QuoteRequest | null>(null)

  // Get auth headers function (same as admin-api.ts)
  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token
      ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  // Fetch quote requests from API
  const fetchQuotations = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/quotes?page=${currentPage}&limit=${pageSize}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view quotations.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setQuotations(data.data.quoteRequests)
        setTotalQuotations(data.data.pagination.total)
      } else {
        throw new Error(data.message || 'Failed to fetch quotations')
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
      toast({
        title: "Error",
        description: "Failed to fetch quotation requests.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      const response = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in to update quote status.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Quote request ${status} successfully.`,
        })
        // Refresh the list
        fetchQuotations()
      } else {
        throw new Error(data.message || 'Failed to update quote status')
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
      toast({
        title: "Error",
        description: "Failed to update quote status.",
        variant: "destructive",
      })
    }
  }

  // Load quotations on component mount and page change
  useEffect(() => {
    fetchQuotations()
  }, [currentPage])

  const handleConfirmPayment = async (quotationId: string) => {
    try {
      const response = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/quotes/${quotationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'accepted' })
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in to confirm payment.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Payment Confirmed",
          description: "HR service has been activated for the employer and removed from quotations.",
        })
        // Refresh the list to remove this quotation
        fetchQuotations()
      } else {
        throw new Error(data.message || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContactEmployer = (quotation: QuoteRequest) => {
    setSelectedQuotation(quotation)
    setContactOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "quoted":
        return "bg-green-100 text-green-800"
      case "accepted":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(totalQuotations / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalQuotations)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotation Requests</h1>
        <Badge variant="outline" className="text-sm">
          {quotations.length} Pending Requests
        </Badge>
      </div>

      <div className="grid gap-6">
        {quotations.map((quotation) => (
          <Card key={quotation._id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    {quotation.companyName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{quotation.contactPerson.email}</p>
                </div>
                <Badge className={getStatusColor(quotation.status)}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Service Type:</span>
                  <span>{quotation.service}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Requested:</span>
                  <span>{new Date(quotation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleConfirmPayment(quotation._id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none"
                    onClick={() => handleContactEmployer(quotation)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Employer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quotations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotation Requests</h3>
            <p className="text-gray-600">No pending quotation requests at the moment.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{endIndex}</span> of <span className="font-medium text-gray-900">{totalQuotations}</span> quotation requests
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

      {/* Contact Employer Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employer Details</DialogTitle>
            <DialogDescription>Use this information to contact the employer.</DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Company</div>
                <div className="font-medium text-gray-900">{selectedQuotation.companyName}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Contact Person</div>
                  <div className="font-medium text-gray-900">{selectedQuotation.contactPerson?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium text-gray-900">{selectedQuotation.contactPerson?.phone || 'N/A'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900 break-all">{selectedQuotation.contactPerson?.email || 'N/A'}</div>
                </div>
              </div>
              <div className="border-t pt-3 flex gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    if (selectedQuotation?.contactPerson?.email) {
                      window.location.href = `mailto:${selectedQuotation.contactPerson.email}`
                    }
                  }}
                >
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedQuotation?.contactPerson?.phone) {
                      window.location.href = `tel:${selectedQuotation.contactPerson.phone}`
                    }
                  }}
                >
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
