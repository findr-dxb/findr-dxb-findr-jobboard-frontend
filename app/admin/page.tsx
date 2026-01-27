"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, FileText, Star, TrendingUp, BarChart3, Activity, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDashboardStats, type DashboardStats } from "@/lib/admin-api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
        // Set fallback stats
        setStats({
          jobseekers: 0,
          employers: 0,
          activeJobs: 0,
          applications: 0,
          servicesOrders: 0,
          premiumOrders: 0, // Keep for API compatibility but don't display
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsConfig = [
    { 
      label: "Jobseekers", 
      value: stats?.jobseekers || 0, 
      icon: Users, 
      route: "/admin/users",
      color: "bg-blue-500",
    },
    { 
      label: "Employers", 
      value: stats?.employers || 0, 
      icon: Users, 
      route: "/admin/users?tab=employers",
      color: "bg-emerald-500",
    },
    { 
      label: "Active Jobs", 
      value: stats?.activeJobs || 0, 
      icon: Briefcase, 
      route: "/admin/jobs",
      color: "bg-purple-500",
    },
    { 
      label: "Applications", 
      value: stats?.applications || 0, 
      icon: FileText, 
      route: "/admin/applications",
      color: "bg-orange-500",
    },
    { 
      label: "Services & Orders", 
      value: stats?.servicesOrders || 0, 
      icon: Star, 
      route: "/admin/services",
      color: "bg-pink-500",
    },
  ]

  const handleCardClick = (route: string) => {
    router.push(route)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const dashboardStats = await getDashboardStats()
      setStats(dashboardStats)
      setError(null)
    } catch (err) {
      setError('Failed to refresh dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-emerald-100">Welcome back! Here's what's happening with your platform today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Activity className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        {error && (
          <div className="mt-3 bg-red-500/20 border border-red-300/30 rounded-lg p-3">
            <p className="text-red-100 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {statsConfig.map((s) => {
          const Icon = s.icon
          return (
            <Card 
              key={s.label} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              onClick={() => handleCardClick(s.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${s.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <CardTitle className="text-sm text-gray-600 font-medium">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    s.value.toLocaleString()
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleCardClick("/admin/users")}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
            >
              <Users className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-blue-900">Manage Users</h3>
              <p className="text-sm text-blue-600">View and manage jobseekers & employers</p>
            </button>
            <button 
              onClick={() => handleCardClick("/admin/jobs")}
              className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left group"
            >
              <Briefcase className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-emerald-900">Job Management</h3>
              <p className="text-sm text-emerald-600">Monitor active jobs and applications</p>
            </button>
            <button 
              onClick={() => handleCardClick("/admin/services")}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group"
            >
              <Star className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-purple-900">Services</h3>
              <p className="text-sm text-purple-600">Manage premium services and orders</p>
            </button>
            <button 
              onClick={() => handleCardClick("/admin/quotation")}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left group"
            >
              <FileText className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-orange-900">Quotations</h3>
              <p className="text-sm text-orange-600">Review and process quotation requests</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


