"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Play, Pause, RefreshCw, Building2, User, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface ServiceItem {
  _id: string
  id: string
  buyerName: string
  buyerType: 'jobseeker' | 'employer'
  serviceName: string
  serviceType: string
  orderDate: string
  status: 'active' | 'in_progress' | 'payment_pending' | 'completed' | 'stopped' | 'suspended'
  amount: number
  description: string
  orderUrl: string
  userEmail: string
  userId: string
}

export default function ServiceManagementPage() {
  const router = useRouter()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'stopped'>('all')

  // Get auth headers function
  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token ? { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
  };

  // Fetch all active services
  const fetchServices = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1'
      
      // Fetch all services (we'll filter by status on frontend)
      const response = await fetch(`${API_BASE_URL}/admin/services?page=1&limit=100&buyerType=all`, {
        headers: getAuthHeaders()
      })

      if (response.status === 401) {
        toast.error('Authentication required. Please log in.')
        router.push('/login/admin')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      if (data.success) {
        setServices(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to fetch services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Update service status (stop/resume)
  const updateServiceStatus = async (serviceId: string, userId: string, buyerType: string, newStatus: 'stopped' | 'active') => {
    try {
      setUpdatingIds(prev => new Set(prev).add(serviceId))
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1'
      const response = await fetch(`${API_BASE_URL}/admin/service-management/${serviceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: newStatus,
          userId,
          buyerType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update service status')
      }

      const data = await response.json()
      if (data.success) {
        toast.success(`Service ${newStatus === 'stopped' ? 'stopped' : 'resumed'} successfully`)
        // Refresh the services list
        await fetchServices()
      } else {
        throw new Error(data.message || 'Failed to update service status')
      }
    } catch (error) {
      console.error('Error updating service status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update service status. Please try again.')
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(serviceId)
        return newSet
      })
    }
  }

  const handleStopService = (service: ServiceItem) => {
    updateServiceStatus(service.id, service.userId, service.buyerType, 'stopped')
  }

  const handleResumeService = (service: ServiceItem) => {
    updateServiceStatus(service.id, service.userId, service.buyerType, 'active')
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Filter services based on active tab
  const filteredServices = services.filter(service => {
    if (activeTab === 'active') {
      return service.status === 'active' || service.status === 'in_progress' || service.status === 'completed'
    } else if (activeTab === 'stopped') {
      return service.status === 'stopped' || service.status === 'suspended'
    }
    return true // all
  })

  const activeCount = services.filter(s => s.status === 'active' || s.status === 'in_progress' || s.status === 'completed').length
  const stoppedCount = services.filter(s => s.status === 'stopped' || s.status === 'suspended').length

  const formatTitleCase = (str: string) => {
    if (!str || typeof str !== 'string') return str;

    const lowercaseWords = [
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor',
      'of', 'on', 'or', 'the', 'to', 'with'
    ];
    
    return str
      .split(' ')
      .map((word, index) => {
        if (word === word.toUpperCase() && word.length > 1) {
          return word;
        }
        const lowerWord = word.toLowerCase();
        if (index > 0 && lowercaseWords.includes(lowerWord)) {
          return lowerWord;
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'stopped':
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Stopped</Badge>
      case 'payment_pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Management</h1>
          <p className="text-gray-600">Stop or resume subscription services for jobseekers and employers</p>
        </div>
        <Button
          onClick={fetchServices}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stopped Services</p>
                <p className="text-2xl font-bold text-red-600">{stoppedCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('all')}
          className="px-4 w-full sm:w-auto text-sm font-medium"
        >
          All Services ({services.length})
        </Button>
        <Button
          variant={activeTab === 'active' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('active')}
          className="px-4 w-full sm:w-auto text-sm font-medium"
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={activeTab === 'stopped' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stopped')}
          className="px-4 w-full sm:w-auto text-sm font-medium"
        >
          Stopped ({stoppedCount})
        </Button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              const isUpdating = updatingIds.has(service.id)
              const isActive = service.status === 'active' || service.status === 'in_progress' || service.status === 'completed'
              const isStopped = service.status === 'stopped' || service.status === 'suspended'

              return (
                <Card key={service.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {service.buyerType === 'employer' ? (
                            <Building2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                          <h3 className="font-semibold text-lg">{service.serviceName}</h3>
                          {getStatusBadge(service.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Buyer:</span>
                            <span className="font-medium ml-2">{service.buyerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="font-medium ml-2 capitalize">{service.buyerType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Service Type:</span>
                            <span className="font-medium ml-2">{service.serviceType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-medium text-green-600 ml-2">${service.amount}</span>
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600">{formatTitleCase(service.description)}</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopService(service)}
                            disabled={isUpdating}
                            className="flex items-center gap-2"
                          >
                            {isUpdating ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Stopping...
                              </>
                            ) : (
                              <>
                                <Pause className="w-4 h-4" />
                                Stop Service
                              </>
                            )}
                          </Button>
                        )}
                        {isStopped && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResumeService(service)}
                            disabled={isUpdating}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            {isUpdating ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Resuming...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Resume Service
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? 'No services available.' 
                    : activeTab === 'active' 
                    ? 'No active services found.' 
                    : 'No stopped services found.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}










