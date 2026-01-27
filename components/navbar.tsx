"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, User, Briefcase, ShoppingCart, Heart, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { cart, clearCart } = useCart()

  

  
  const handleLogout = async () => {
    try {
      clearCart() 
      logout()
      // Force a re-render by updating the mobile menu state
      setIsOpen(false)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  type NavItem = {
    href: string;
    label: string;
    icon?: LucideIcon;
  };

  const publicNavItems: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
    { href: "/rewards/jobseeker", label: "Rewards" }, // Ensure Rewards is present
  ];

  const jobSeekerNavItems: NavItem[] = [
    { href: "/jobseeker/dashboard", label: "Dashboard" },
    { href: "/jobseeker/search", label: "Search Jobs" },
    { href: "/jobseeker/rewards/jobseeker", label: "Rewards" },
    { href: "/jobseeker/premium", label: "Premium Services" },
  ];

  const employerNavItems: NavItem[] = [
    { href: "/employer/dashboard", label: "Dashboard" },
    { href: "/employer/post-job", label: "Post a Job" },
    { href: "/employer/hr-services", label: "HR Services" },
  ];

  const getNavItems = () => {
    if (user?.type === "jobseeker") return jobSeekerNavItems
    if (user?.type === "employer") return employerNavItems
    return publicNavItems
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50" key={user?.id || 'anonymous'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
           <Link 
            href={user ? (user.type === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard") : "/"} 
            className="flex items-center space-x-2"
          >
            <img
              src="/Findr_Logo.jpeg"
              alt="Findr"
              className="w-24 h-24 object-contain"
            />
            <span className="sr-only">Findr</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              // Handle Rewards for job seeker navigation
              if (item.label === "Rewards" && user?.type === "jobseeker") {
                return (
                  <Link
                    key="rewards-jobseeker"
                    href="/rewards/jobseeker"
                    className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                      pathname === "/rewards/jobseeker" ? "text-emerald-600" : "text-gray-700"
                    }`}
                  >
                    Rewards
                  </Link>
                )
              }
              // Handle Rewards for employer navigation
              if (item.label === "Rewards" && user?.type === "employer") {
                return (
                  <Link
                    key="rewards-employer"
                    href="/rewards/employer"
                    className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                      pathname === "/rewards/employer" ? "text-emerald-600" : "text-gray-700"
                    }`}
                  >
                    Rewards
                  </Link>
                )
              }
              // Handle Rewards for public navigation (not logged in)
              if (item.label === "Rewards" && !user) {
                return (
                  <DropdownMenu key="rewards-dropdown">
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-transparent">
                        Rewards <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/rewards/jobseeker">Job Seeker Rewards</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/rewards/employer">Employer Rewards</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
              // Default nav item
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 ${
                    pathname === item.href ? "text-emerald-600 underline" : "text-gray-700"
                  }`} 
                  style={{ cursor: 'pointer' }}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              )
            })}



            {/* Auth Section */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* Cart Icon */}
                <Link href={user.type === "jobseeker" ? "/jobseeker/cart" : "/employer/cart"} className="mr-2 relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-emerald-600 text-white border-emerald-600">
                      {cart.length}
                    </Badge>
                  )}
                </Link>
                {/* Saved Jobs Heart Icon (Jobseeker only) */}
                {user.type === "jobseeker" && (
                  <Link href="/jobseeker/saved" className="mr-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                    <Heart className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                        {user.profileImage && user.profileImage !== `/images/${user.type}-hero.png` ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name || 'Profile'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${user.type === "jobseeker" ? "bg-blue-100" : "bg-emerald-100"} flex items-center justify-center`}>
                            {user.type === "jobseeker" ? (
                              <User className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Briefcase className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-sm">{user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={user.type === "jobseeker" ? "/jobseeker/profile" : "/employer/profile"}>Profile</Link>
                    </DropdownMenuItem>
                    {user.type === "jobseeker" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/rewards/jobseeker">Rewards</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/about">About</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/contact">Contact Us</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.type === "employer" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/rewards/employer">Rewards</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/about">About</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/contact">Contact Us</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gradient-bg text-white">
                    Login <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/login?type=jobseeker" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Job Seeker
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login?type=employer" className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Employer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login/admin" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 ${
                    pathname === item.href ? "text-emerald-600 underline" : "text-gray-700"
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              ))}
              {isLoading ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : user ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                      {user.profileImage && user.profileImage !== `/images/${user.type}-hero.png` ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || 'Profile'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${user.type === "jobseeker" ? "bg-blue-100" : "bg-emerald-100"} flex items-center justify-center`}>
                          {user.type === "jobseeker" ? (
                            <User className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Link
                    href={user.type === "jobseeker" ? "/jobseeker/profile" : "/employer/profile"}
                    onClick={() => setIsOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2"
                  >
                    Profile
                  </Link>
                  {user.type === "jobseeker" && (
                    <>
                      <Link href="/jobseeker/cart" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">Cart</Link>
                      <Link href="/rewards/jobseeker" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">Rewards</Link>
                      <Link href="/about" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">About</Link>
                      <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">Contact Us</Link>
                    </>
                  )}
                  {user.type === "employer" && (
                    <>
                      <Link href="/rewards/employer" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">Rewards</Link>
                      <Link href="/about" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">About</Link>
                      <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-emerald-600 mb-2">Contact Us</Link>
                    </>
                  )}
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-2">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Login</p>
                    <Link href="/login?type=jobseeker" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start bg-transparent mb-2">
                        <User className="w-4 h-4 mr-2" />
                        Login as Job Seeker
                      </Button>
                    </Link>
                    <Link href="/login?type=employer" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start gradient-bg text-white">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Login as Employer
                      </Button>
                    </Link>
                    <Link href="/login/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="destructive" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Login as Admin
                      </Button>
                    </Link>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
