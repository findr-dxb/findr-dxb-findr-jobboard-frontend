"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, Users, ShoppingCart, Menu, X, Briefcase, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

const sidebarItems = [
  {
    href: "/employer/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/employer/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/employer/post-job",
    label: "Post a Job",
    icon: PlusCircle,
  },
  {
    href: "/employer/hr-services",
    label: "HR Services",
    icon: Users,
  },
  {
    href: "/employer/cart",
    label: "Cart",
    icon: ShoppingCart,
  },
]

export function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button variant="outline" size="sm" onClick={toggleSidebar} className="bg-white card-shadow border-0">
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:block border-r border-gray-100
      `}
      >
        <div className="flex flex-col h-full pt-20 lg:pt-6">
          {/* Company Profile Card */}
          <div className="p-4">
            <Card className="card-shadow border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center card-shadow">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <Button size="sm" className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full gradient-bg p-0">
                      <Upload className="w-2 h-2" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{user?.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Account Type</span>
                    <Badge className="gradient-bg text-white text-xs">Employer</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Active Jobs</span>
                    <span className="text-xs font-semibold">5</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Total Applicants</span>
                    <span className="text-xs font-semibold">127</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 card-shadow border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
