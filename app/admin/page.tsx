"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Bell,
  ShoppingBasket,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getDashboardStats,
  getNationalityDemographics,
  getIndustryDistribution,
  getSignupsToday,
  getActiveUsersToday,
  type DashboardStats,
  type NationalityDemographics,
  type IndustryDistribution,
  type SignupsToday,
  type ActiveUsersToday,
} from "@/lib/admin-api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { NationalityDemographicsChart } from "@/components/admin/nationality-demographics-chart"
import { IndustryDistributionChart } from "@/components/admin/industry-distribution-chart"
import { RecentLoginsTable } from "@/components/admin/recent-logins-table"
import { ActiveUsersTodayChart } from "@/components/admin/active-users-today-chart"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [nationality, setNationality] = useState<NationalityDemographics | null>(null)
  const [industry, setIndustry] = useState<IndustryDistribution | null>(null)
  const [signupsToday, setSignupsToday] = useState<SignupsToday | null>(null)
  const [activeUsersToday, setActiveUsersToday] = useState<ActiveUsersToday | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNationalityLoading, setIsNationalityLoading] = useState(true)
  const [isIndustryLoading, setIsIndustryLoading] = useState(true)
  const [isSignupsLoading, setIsSignupsLoading] = useState(true)
  const [isActiveUsersLoading, setIsActiveUsersLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboard = useCallback(async () => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard statistics")
        setStats({
          jobseekers: 0,
          employers: 0,
          activeJobs: 0,
          applications: 0,
          servicesOrders: 0,
          premiumOrders: 0,
          monthlyOrders: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchNationality = async () => {
      try {
        setIsNationalityLoading(true)
        const data = await getNationalityDemographics()
        setNationality(data)
      } catch (err) {
        console.error("Error fetching nationality demographics:", err)
        setNationality({ total: 0, countries: [] })
      } finally {
        setIsNationalityLoading(false)
      }
    }

    const fetchIndustry = async () => {
      try {
        setIsIndustryLoading(true)
        const data = await getIndustryDistribution()
        setIndustry(data)
      } catch (err) {
        console.error("Error fetching industry distribution:", err)
        setIndustry({ total: 0, industries: [] })
      } finally {
        setIsIndustryLoading(false)
      }
    }

    const fetchSignupsToday = async () => {
      try {
        setIsSignupsLoading(true)
        const data = await getSignupsToday({ page: 1, limit: 5 })
        setSignupsToday(data)
      } catch (err) {
        console.error("Error fetching today's sign-ups:", err)
        setSignupsToday({
          total: 0,
          candidates: 0,
          employers: 0,
          date: new Date().toISOString(),
          users: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 5,
          },
        })
      } finally {
        setIsSignupsLoading(false)
      }
    }

    const fetchActiveUsersToday = async () => {
      try {
        setIsActiveUsersLoading(true)
        const data = await getActiveUsersToday()
        setActiveUsersToday(data)
      } catch (err) {
        console.error("Error fetching active users today:", err)
        setActiveUsersToday({
          total: 0,
          candidates: 0,
          employers: 0,
          date: new Date().toISOString(),
          hourly: [],
        })
      } finally {
        setIsActiveUsersLoading(false)
      }
    }

    await Promise.all([
      fetchStats(),
      fetchNationality(),
      fetchIndustry(),
      fetchSignupsToday(),
      fetchActiveUsersToday(),
    ])
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadDashboard()
    } finally {
      setIsRefreshing(false)
    }
  }

  const statsConfig = [
    {
      label: "Total Job Seekers",
      value: stats?.jobseekers || 0,
      icon: Users,
      route: "/admin/users",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Employers",
      value: stats?.employers || 0,
      icon: Building2,
      route: "/admin/users?tab=employers",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      route: "/admin/jobs",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      label: "Total Applications",
      value: stats?.applications || 0,
      icon: FileText,
      route: "/admin/applications",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      label: "Active Services",
      value: stats?.servicesOrders || 0,
      icon: Bell,
      route: "/admin/services",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      label: "Monthly Orders",
      value: stats?.monthlyOrders || 0,
      icon: ShoppingBasket,
      route: "/admin/services",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ]

  const handleCardClick = (route: string) => {
    router.push(route)
  }

  const isAnyLoading =
    isRefreshing ||
    isLoading ||
    isNationalityLoading ||
    isIndustryLoading ||
    isSignupsLoading ||
    isActiveUsersLoading

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time performance and analytics for Findr recruitment portal.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="text-sm text-gray-600 text-right">
            <p>Date: {now.toLocaleDateString()}</p>
            <p>Time: {now.toLocaleTimeString()}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isAnyLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsConfig.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => handleCardClick(s.route)}
              className="group text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <div className="mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <Icon className={`h-5 w-5 ${s.iconColor}`} strokeWidth={2} />
                </div>
              </div>

              <div className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                {isLoading ? <LoadingSpinner size={22} /> : s.value.toLocaleString()}
              </div>

              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700 leading-snug">
                {s.label}
              </p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentLoginsTable data={signupsToday} isLoading={isSignupsLoading} />
        <ActiveUsersTodayChart data={activeUsersToday} isLoading={isActiveUsersLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NationalityDemographicsChart data={nationality} isLoading={isNationalityLoading} />
        <IndustryDistributionChart data={industry} isLoading={isIndustryLoading} />
      </div>
    </div>
  )
}
