"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Download, Check, X, Clock, DollarSign, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import * as XLSX from 'xlsx'
import { toast } from "sonner"

// Interface for service data from API
interface ServiceData {
  _id: string
  id: string
  buyerName: string
  buyerType: 'jobseeker' | 'employer'
  serviceName: string
  serviceType: string
  orderDate: string
  status: 'active' | 'in_progress' | 'payment_pending' | 'completed'
  amount: number
  description: string
  orderUrl: string
  userEmail: string
  userId: string
}

export default function AdminServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'jobseekers' | 'employers'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(6) // Show 6 services per page
  const [totalServices, setTotalServices] = useState(0)
  const [allTotalCount, setAllTotalCount] = useState<number | null>(null)
  const [jobseekerTotalCount, setJobseekerTotalCount] = useState<number | null>(null)
  const [employerTotalCount, setEmployerTotalCount] = useState<number | null>(null)

  // Get auth headers function (same as admin-api.ts)
  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Map UI tab to API buyerType
  const mapTabToBuyerType = (tab: 'all' | 'jobseekers' | 'employers'): 'all' | 'jobseeker' | 'employer' => {
    if (tab === 'jobseekers') return 'jobseeker'
    if (tab === 'employers') return 'employer'
    return 'all'
  }

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1';
      const buyerType = mapTabToBuyerType(activeTab)
      const response = await fetch(`${API_BASE_URL}/admin/services?page=${currentPage}&limit=${pageSize}&buyerType=${buyerType}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.status === 401) {
        toast.error('Authentication required. Please log in.');
        router.push('/login/admin');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      if (data.success) {
        const sortedServices = (data.data || []).sort((a: ServiceData, b: ServiceData) => {
          const dateA = new Date(a.orderDate).getTime();
          const dateB = new Date(b.orderDate).getTime();
          return dateB - dateA;
        });
        setServices(sortedServices);
        setTotalServices(data.pagination.totalCount);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }

      try {
        const [allResp, jsResp, empResp] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/services?page=1&limit=1&buyerType=all`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } }),
          fetch(`${API_BASE_URL}/admin/services?page=1&limit=1&buyerType=jobseeker`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } }),
          fetch(`${API_BASE_URL}/admin/services?page=1&limit=1&buyerType=employer`, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } })
        ])
        if (allResp.ok) {
          const allData = await allResp.json();
          if (allData?.success && allData?.pagination?.totalCount !== undefined) setAllTotalCount(allData.pagination.totalCount)
        }
        if (jsResp.ok) {
          const jsData = await jsResp.json();
          if (jsData?.success && jsData?.pagination?.totalCount !== undefined) setJobseekerTotalCount(jsData.pagination.totalCount)
        }
        if (empResp.ok) {
          const empData = await empResp.json();
          if (empData?.success && empData?.pagination?.totalCount !== undefined) setEmployerTotalCount(empData.pagination.totalCount)
        }
      } catch {}
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update service status
  const updateServiceStatus = async (serviceId: string, newStatus: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1';
      const response = await fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update service status');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setServices(prevServices =>
          prevServices.map(service =>
            service.id === serviceId
              ? { ...service, status: newStatus as ServiceData['status'] }
              : service
          )
        );
        toast.success('Service status updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status. Please try again.');
    }
  };

  // Fetch services when component mounts or dependencies change
  useEffect(() => {
    fetchServices();
  }, [currentPage, activeTab]);

  // Initialize tab from query param (?type=All|Employer|Jobseeker)
  useEffect(() => {
    const typeParam = searchParams?.get('type') || ''
    const normalized = typeParam.toLowerCase()
    if (normalized === 'employer' || normalized === 'employers') {
      setActiveTab('employers')
      setCurrentPage(1)
    } else if (normalized === 'jobseeker' || normalized === 'jobseekers') {
      setActiveTab('jobseekers')
      setCurrentPage(1)
    } else if (normalized === 'all') {
      setActiveTab('all')
      setCurrentPage(1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh services
  const refreshServices = () => {
    fetchServices();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'payment_pending':
        return <DollarSign className="w-4 h-4 text-yellow-600" />
      default:
        return <X className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'payment_pending':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats from current services
  const jobseekerServices = services.filter(s => s.buyerType === 'jobseeker')
  const employerServices = services.filter(s => s.buyerType === 'employer')

  // Pagination logic
  const totalPages = Math.ceil(totalServices / pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset to page 1 when tab changes
  const handleTabChange = (tab: 'all' | 'jobseekers' | 'employers') => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleStatusChange = (serviceId: string, newStatus: string) => {
    updateServiceStatus(serviceId, newStatus)
  }

  const handleStatusConfirm = (serviceId: string, status: string) => {
    handleStatusChange(serviceId, status)
  }

  const handleStatusCancel = (serviceId: string) => {
    // Reset to payment_pending as default
    handleStatusChange(serviceId, 'payment_pending')
  }

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    const worksheetData = [
      ['Service ID', 'Buyer Name', 'Buyer Type', 'Service Name', 'Service Type', 'Order Date', 'Status', 'Amount', 'Description'],
      ...services.map(service => [
        service.id,
        service.buyerName,
        service.buyerType,
        service.serviceName,
        service.serviceType,
        service.orderDate,
        service.status,
        `$${service.amount}`,
        service.description
      ])
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Premium Services')
    
    const filename = `Premium_Services_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const handleViewMore = (service: ServiceData) => {
    router.push(service.orderUrl)
  }

  const renderServiceCard = (service: ServiceData) => (
    <div key={service.id} className="bg-white rounded-lg border p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{service.serviceName}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{service.serviceType}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(service.status)}`}>
          {getStatusIcon(service.status)}
          <span className="hidden sm:inline">{service.status.replace('_', ' ').toUpperCase()}</span>
          <span className="sm:hidden">{service.status.replace('_', ' ').split(' ')[0].toUpperCase()}</span>
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Buyer:</span>
            <span className="font-medium text-right">{service.buyerName}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize text-right">{service.buyerType}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Order Date:</span>
            <span className="font-medium text-right">{new Date(service.orderDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium text-green-600 text-right">${service.amount}</span>
          </div>
        </div>
        <div className="text-xs sm:text-sm">
          <span className="text-gray-500">Description:</span>
          <p className="text-gray-700 mt-1 text-xs sm:text-sm leading-relaxed">{service.description}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t">
        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <Select
            value={service.status}
            onValueChange={(newStatus) => handleStatusChange(service.id, newStatus)}
          >
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-gray-200 shadow-lg">
              <SelectItem value="active" className="hover:bg-green-50 focus:bg-green-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusConfirm(service.id, 'active')
                      }}
                      className="h-6 w-6 p-0 hover:bg-green-100"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusCancel(service.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="in_progress" className="hover:bg-blue-50 focus:bg-blue-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusConfirm(service.id, 'in_progress')
                      }}
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                    >
                      <Check className="w-3 h-3 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusCancel(service.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="payment_pending" className="hover:bg-yellow-50 focus:bg-yellow-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                    <span>Payment Pending</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusConfirm(service.id, 'payment_pending')
                      }}
                      className="h-6 w-6 p-0 hover:bg-yellow-100"
                    >
                      <Check className="w-3 h-3 text-yellow-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusCancel(service.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="completed" className="hover:bg-green-50 focus:bg-green-50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusConfirm(service.id, 'completed')
                      }}
                      className="h-6 w-6 p-0 hover:bg-green-100"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusCancel(service.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View More Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewMore(service)}
            className="flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">View More</span>
            <span className="sm:hidden">View</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Services & Orders Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage premium services for jobseekers and employers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshServices}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold">{(allTotalCount ?? totalServices)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jobseeker Services</p>
              <p className="text-2xl font-bold">{(jobseekerTotalCount ?? jobseekerServices.length)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employer Services</p>
              <p className="text-2xl font-bold">{(employerTotalCount ?? employerServices.length)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('all')}
            className="px-4 w-full sm:w-auto text-sm font-medium"
          >
            All Services ({allTotalCount ?? totalServices})
          </Button>
          <Button
            variant={activeTab === 'jobseekers' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('jobseekers')}
            className="px-4 w-full sm:w-auto text-sm font-medium"
          >
            Jobseekers ({jobseekerTotalCount ?? jobseekerServices.length})
          </Button>
          <Button
            variant={activeTab === 'employers' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('employers')}
            className="px-4 w-full sm:w-auto text-sm font-medium"
          >
            Employers ({employerTotalCount ?? employerServices.length})
          </Button>
        </div>
        
        {/* Active Filter Indicator */}
        <div className="text-sm text-gray-600">
          {activeTab === 'all' && `Showing all ${totalServices} services`}
          {activeTab === 'jobseekers' && `Showing ${jobseekerServices.length} jobseeker services`}
          {activeTab === 'employers' && `Showing ${employerServices.length} employer services`}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.length > 0 ? (
            services.map(renderServiceCard)
          ) : (
            <div className="col-span-full bg-white rounded-lg border p-8 text-center text-muted-foreground">
              No services found for the selected category
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing <span className="font-medium text-gray-900">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, totalServices)}</span> of <span className="font-medium text-gray-900">{totalServices}</span> services
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
    </div>
  )
}