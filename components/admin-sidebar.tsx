"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Star,
  FileCheck,
  LogOut,
  Settings,
  Award,
  Headphones,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  getSidebarBadges,
  type SidebarBadgeKey,
  type SidebarBadges,
} from "@/lib/admin-api"

const LAST_SEEN_STORAGE_KEY = "admin_sidebar_last_seen"

const BADGE_KEYS: SidebarBadgeKey[] = [
  "users",
  "jobs",
  "applications",
  "services",
  "serviceManagement",
  "quotation",
  "grievances",
  "rmPostingRequests",
]

const navItems: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
  badgeKey?: SidebarBadgeKey
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users, badgeKey: "users" },
  { href: "/admin/stars", label: "Findr Stars", icon: Award },
  { href: "/admin/create-admin", label: "Create Admin Account", icon: Star },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, badgeKey: "jobs" },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
    badgeKey: "applications",
  },
  {
    href: "/admin/services",
    label: "Services & Orders",
    icon: FileText,
    badgeKey: "services",
  },
  {
    href: "/admin/service-management",
    label: "Service Management",
    icon: Settings,
    badgeKey: "serviceManagement",
  },
  {
    href: "/admin/quotation",
    label: "Quotation",
    icon: FileCheck,
    badgeKey: "quotation",
  },
  {
    href: "/admin/grievances",
    label: "Grievances",
    icon: FileText,
    badgeKey: "grievances",
  },
  {
    href: "/admin/rm-posting-requests",
    label: "RM Posting Requests",
    icon: Headphones,
    badgeKey: "rmPostingRequests",
  },
]

function readLastSeen(): Partial<Record<SidebarBadgeKey, string>> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(LAST_SEEN_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeLastSeen(map: Partial<Record<SidebarBadgeKey, string>>) {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_SEEN_STORAGE_KEY, JSON.stringify(map))
}

function ensureLastSeenInitialized(): Partial<Record<SidebarBadgeKey, string>> {
  const current = readLastSeen()
  const now = new Date().toISOString()
  let changed = false
  const next = { ...current }

  BADGE_KEYS.forEach((key) => {
    if (!next[key]) {
      next[key] = now
      changed = true
    }
  })

  if (changed) writeLastSeen(next)
  return next
}

function formatBadgeCount(count: number): string {
  if (count > 99) return "99+"
  return String(count)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const auth = useAuth()
  const toast = useToast()
  const [badges, setBadges] = useState<SidebarBadges>({
    users: 0,
    jobs: 0,
    applications: 0,
    services: 0,
    serviceManagement: 0,
    quotation: 0,
    grievances: 0,
    rmPostingRequests: 0,
  })

  const fetchBadges = useCallback(async () => {
    const since = ensureLastSeenInitialized()
    const data = await getSidebarBadges(since)

    // While a tab is open, keep lastSeen fresh so items seen live don't badge again later
    const activeItem = navItems.find((item) => {
      if (!item.badgeKey || !pathname) return false
      return pathname === item.href || pathname.startsWith(item.href + "/")
    })
    if (activeItem?.badgeKey) {
      const nextSeen = {
        ...readLastSeen(),
        [activeItem.badgeKey]: new Date().toISOString(),
      }
      writeLastSeen(nextSeen)
      data[activeItem.badgeKey] = 0
    }

    setBadges(data)
  }, [pathname])

  const markSeen = useCallback(
    (badgeKey: SidebarBadgeKey) => {
      const current = readLastSeen()
      const next = {
        ...current,
        [badgeKey]: new Date().toISOString(),
      }
      writeLastSeen(next)
      setBadges((prev) => ({ ...prev, [badgeKey]: 0 }))
    },
    []
  )

  useEffect(() => {
    fetchBadges()
    const timer = setInterval(fetchBadges, 30000)
    return () => clearInterval(timer)
  }, [fetchBadges])


  useEffect(() => {
    if (!pathname) return
    const matched = navItems.find((item) => {
      if (!item.badgeKey) return false
      return pathname === item.href || pathname.startsWith(item.href + "/")
    })
    if (matched?.badgeKey) {
      markSeen(matched.badgeKey)
    }
  }, [pathname, markSeen])

  const handleLogout = () => {
    try {
      toast.toast({
        title: "Logging Out",
        description: "You are being logged out...",
      })

      auth.logout()

      setTimeout(() => {
        window.location.href = "/"
      }, 300)
    } catch (error) {
      console.error("Error during logout:", error)
      toast.toast({
        title: "Logout Error",
        description: "There was an error during logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Findr Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon
          const count = item.badgeKey ? badges[item.badgeKey] || 0 : 0
          const showBadge = !isActive && count > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.badgeKey) markSeen(item.badgeKey)
              }}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-gray-500 group-hover:text-emerald-600"
                }`}
              />
              <span className="font-medium truncate">{item.label}</span>
              {showBadge ? (
                <span className="ml-auto inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white">
                  {formatBadgeCount(count)}
                </span>
              ) : isActive ? (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 px-3 py-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
