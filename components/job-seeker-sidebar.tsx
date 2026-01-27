"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, UserCheck, ShoppingCart, Menu, X, Star, User, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

const sidebarItems = [
  {
    href: "/jobseeker/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/jobseeker/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/jobseeker/resume-builder",
    label: "Resume Builder",
    icon: FileText,
  },
  {
    href: "/jobseeker/premium", // changed from /jobseeker/rm-service
    label: "RM Service",
    icon: UserCheck,
  },
  {
    href: "/jobseeker/cart",
    label: "Cart",
    icon: ShoppingCart,
  },
]

export function JobSeekerSidebar() {
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
          {/* Profile Card */}
          <div className="p-4">
            <Card className="card-shadow border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center card-shadow">
                      <User className="w-6 h-6 text-emerald-600" />
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

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Profile Completion</span>
                      <span className="font-semibold">{user?.profileCompletion}%</span>
                    </div>
                    <Progress value={user?.profileCompletion} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-medium">{user?.points} Points</span>
                    </div>
                    <Badge className="gradient-bg text-white text-xs">Silver</Badge>
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
                          ? "bg-emerald-50 text-emerald-700 card-shadow border border-emerald-100"
                          : "text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
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
