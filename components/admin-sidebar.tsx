"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Briefcase, FileText, Star, FileCheck, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/create-admin", label: "Create Admin Account", icon: Star },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/services", label: "Services & Orders", icon: FileText },
  { href: "/admin/service-management", label: "Service Management", icon: Settings },
  { href: "/admin/quotation", label: "Quotation", icon: FileCheck },
  { href: "/admin/grievances", label: "Grievances", icon: FileText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const toast = useToast()
  
  const handleLogout = () => {
    try {
      // Show logout confirmation toast
      toast.toast({
        title: "Logging Out",
        description: "You are being logged out...",
      })
      
      // Call the auth logout function
      auth.logout()
      
      // Force page refresh after logout
      setTimeout(() => {
        window.location.href = "/login/admin"
      }, 300)
    } catch (error) {
      console.error('Error during logout:', error)
      toast.toast({
        title: "Logout Error",
        description: "There was an error during logout. Please try again.",
        variant: "destructive",
      })
    }
  }
  return (
    <div className="h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Findr Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isActive ? "text-white" : "text-gray-500 group-hover:text-emerald-600"
              }`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">All systems operational</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}


