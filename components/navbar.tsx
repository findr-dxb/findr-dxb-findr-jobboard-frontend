"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronDown, User, Briefcase, ShoppingCart, Heart, Shield, Search, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/lib/hooks"
import { checkEmployerEligibility } from "@/lib/features/jobPosting/jobPostingSlice"
import { EmployerProfileCompletionDialog } from "@/components/ui/employer-profile-completion-dialog"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://findr-jobboard-backend-production.up.railway.app/api/v1"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchIdentifier, setSearchIdentifier] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResult, setSearchResult] = useState<{
    exists: boolean
    id?: string
    name?: string
    email?: string
  } | null>(null)
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false)
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null)
  const [requestAccessLoading, setRequestAccessLoading] = useState(false)
  const [showPostJobProfileDialog, setShowPostJobProfileDialog] = useState(false)
  const [postJobProfileResult, setPostJobProfileResult] = useState<{
    percentage: number
    canPostJob: boolean
    missingFields: string[]
    companyName?: string
  } | null>(null)
  const [isCheckingPostJobEligibility, setIsCheckingPostJobEligibility] = useState(false)

  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()

  const handlePostJobClick = async () => {
    if (user?.type !== "employer") return
    setIsCheckingPostJobEligibility(true)
    try {
      const result = await dispatch(checkEmployerEligibility())
      if (checkEmployerEligibility.fulfilled.match(result)) {
        const { canPostJob, profileCompletion, companyInfo } = result.payload
        if (!canPostJob) {
          setPostJobProfileResult({
            percentage: profileCompletion.percentage,
            canPostJob,
            missingFields: profileCompletion.missingFields,
            companyName: companyInfo?.companyName,
          })
          setShowPostJobProfileDialog(true)
        } else {
          router.push("/employer/post-job")
        }
      } else {
        toast({
          title: "Profile Check Error",
          description: "Unable to check your company profile eligibility. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingPostJobEligibility(false)
    }
  }

  const resetSearchState = () => {
    setSearchIdentifier("")
    setSearchError(null)
    setSearchResult(null)
    setIsSearching(false)
    setShowRequestAccessModal(false)
    setPendingProfileId(null)
  }

  const handleViewProfile = async () => {
    const id = searchResult?.id
    if (!id) return
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("findr_token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token")
        : null
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/referrals/joiners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setIsSearchOpen(false)
        resetSearchState()
        router.push(`/jobseeker/referrals/joiners/${id}`)
        return
      }
      if (res.status === 404) {
        setPendingProfileId(id)
        setShowRequestAccessModal(true)
      }
    } catch {
      setShowRequestAccessModal(true)
      setPendingProfileId(id)
    }
  }

  const handleRequestAccess = async () => {
    if (!pendingProfileId) return
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("findr_token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token")
        : null
    if (!token) return
    setRequestAccessLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/profile-access/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: pendingProfileId }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
            title: "Request sent",
            description: data.message || "Request sent to target user for approval.",
        })
        setShowRequestAccessModal(false)
        setPendingProfileId(null)
        setIsSearchOpen(false)
        resetSearchState()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send request.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to send request. Try again later.",
        variant: "destructive",
      })
    } finally {
      setRequestAccessLoading(false)
    }
  }

  const handleSearchUser = async () => {
    const trimmed = searchIdentifier.trim()
    setSearchError(null)
    setSearchResult(null)

    if (!trimmed) {
      setSearchError("Please enter an email or Emirates phone number.")
      return
    }

    const isEmail = trimmed.includes("@")
    if (isEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(trimmed)) {
        setSearchError("Please enter a valid email address.")
        return
      }
    } else {
      const phonePattern = /^[0-9+\-\s()]+$/
      if (!phonePattern.test(trimmed)) {
        setSearchError("Please enter a valid Emirates phone number.")
        return
      }
    }

    try {
      setIsSearching(true)
      setSearchError(null)
      setSearchResult(null)

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("findr_token") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("token")
          : null

      if (!token) {
        setSearchError("You must be logged in to search users.")
        setIsSearching(false)
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/users/lookup?identifier=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok || data.success === false) {
        setSearchError(
          data.message || "Something went wrong while searching. Please try again."
        )
        setSearchResult(null)
        return
      }

      if (data.exists) {
        setSearchResult({
          exists: true,
          id: data.data?.id,
          name: data.data?.name,
          email: data.data?.email,
        })
      } else {
        setSearchResult({ exists: false })
      }
    } catch (error) {
      console.error("Error searching user:", error)
      setSearchError("Unable to search right now. Please try again later.")
      setSearchResult(null)
    } finally {
      setIsSearching(false)
    }
  }
  const handleLogout = async () => {
    try {
      clearCart() 
      logout()
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
    { href: "/rewards/jobseeker", label: "Rewards" },
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
    <Dialog
      open={isSearchOpen}
      onOpenChange={(open) => {
        setIsSearchOpen(open)
        if (!open) {
          resetSearchState()
        }
      }}
    >
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
              // Handle Post a Job for employer - validation before navigation
              if (item.label === "Post a Job" && user?.type === "employer") {
                return (
                  <button
                    key="post-job-employer"
                    type="button"
                    onClick={handlePostJobClick}
                    disabled={isCheckingPostJobEligibility}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 ${
                      pathname === "/employer/post-job" ? "text-emerald-600 underline" : "text-gray-700"
                    }`}
                  >
                    {isCheckingPostJobEligibility ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {item.label}
                  </button>
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
                {user.type === "jobseeker" && (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="mr-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Search user in portal"
                  >
                    <Search className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                  </button>
                )}
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
                  {/* <DropdownMenuItem asChild>
                    <Link href="/login/admin" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </DropdownMenuItem> */}
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
              {navItems.map((item) => {
                if (item.label === "Post a Job" && user?.type === "employer") {
                  return (
                    <button
                      key="post-job-mobile"
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        handlePostJobClick()
                      }}
                      disabled={isCheckingPostJobEligibility}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 ${
                        pathname === "/employer/post-job" ? "text-emerald-600" : "text-gray-700"
                      }`}
                    >
                      {isCheckingPostJobEligibility ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : null}
                      {item.label}
                    </button>
                  )
                }
                return (
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
                )
              })}
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
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </nav>

      {/* User Search Dialog */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search User in Portal</DialogTitle>
          <DialogDescription>
            Search for another job seeker by their email or Emirates phone number to check
            if they already exist in the Findr portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-search-identifier">Email or Emirates phone number</Label>
            <Input
              id="user-search-identifier"
              placeholder="e.g. user@example.com or +9715xxxxxxx"
              value={searchIdentifier}
              onChange={(e) => setSearchIdentifier(e.target.value)}
              disabled={isSearching}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500">
              We will only tell you whether the user exists in the portal.
            </p>
          </div>

          {searchError && (
            <p className="text-sm text-red-600">
              {searchError}
            </p>
          )}

          {searchResult && (
            <div
              className={`rounded-md border px-3 py-3 text-sm ${
                searchResult.exists
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <p className="font-medium">
                {searchResult.exists ? "User exists in the portal." : "User does not exist in the portal."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsSearchOpen(false)}
              disabled={isSearching}
            >
              Close
            </Button>
            {!searchResult?.exists && (
              <Button
                type="button"
                onClick={handleSearchUser}
                disabled={isSearching}
                className="gradient-bg text-white"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            )}
            {searchResult?.exists && searchResult?.id && (
              <Button
                className="gradient-bg text-white"
                type="button"
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Request access modal (when user is not referred by you) */}
      <Dialog open={showRequestAccessModal} onOpenChange={setShowRequestAccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request access to view profile</DialogTitle>
            <DialogDescription>
              This user was not referred by you. You can request access to view their profile. We will send an approval email to the target user. Once they click the link in that email, access will be granted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowRequestAccessModal(false)}
              disabled={requestAccessLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRequestAccess}
              disabled={requestAccessLoading}
              className="gradient-bg text-white"
            >
              {requestAccessLoading ? "Sending..." : "Request access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EmployerProfileCompletionDialog
        open={showPostJobProfileDialog}
        onOpenChange={setShowPostJobProfileDialog}
        completionPercentage={postJobProfileResult?.percentage ?? 0}
        canPostJob={postJobProfileResult?.canPostJob ?? false}
        missingFields={postJobProfileResult?.missingFields ?? []}
        companyName={postJobProfileResult?.companyName}
        onCompleteProfile={() => {
          setShowPostJobProfileDialog(false)
          router.push("/employer/profile")
        }}
      />
    </Dialog>
  )
}
