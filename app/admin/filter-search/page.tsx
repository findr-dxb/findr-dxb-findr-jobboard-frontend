"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SuggestionComboInput } from "@/components/suggestion-combo-input"
import { MultiSelectComboInput } from "@/components/multi-select-combo-input"
import { SUGGESTED_NATIONALITIES } from "@/lib/suggested-nationalities"
import { SUGGESTED_ROLES } from "@/lib/suggested-roles"
import { SUGGESTED_INDUSTRIES } from "@/lib/suggested-industries"
import { AdminDataTable, Column } from "@/components/admin-data-table"
import { Jobseeker } from "@/lib/admin-types"
import { blockUser, unblockUser } from "@/lib/admin-api"
import { useRouter } from "next/navigation"
import { Eye, Ban, RefreshCw, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const COMMON_LANGUAGES = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Spanish",
  "French",
  "Russian",
  "Tagalog",
  "Malayalam",
  "Mandarin",
  "Bengali",
  "Punjabi",
  "Persian",
  "German",
  "Italian",
  "Swahili",
  "Turkish",
  "Portuguese",
  "Japanese"
]

export default function FilterSearchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Jobseeker[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })

  // Filter Form State
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")
  const [nationality, setNationality] = useState("")
  const [minSalary, setMinSalary] = useState("")
  const [maxSalary, setMaxSalary] = useState("")
  const [location, setLocation] = useState("")
  const [role, setRole] = useState("")
  const [spokenLanguages, setSpokenLanguages] = useState("")
  const [experience, setExperience] = useState("")
  const [keyword, setKeyword] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")

  // Fetch search results
  const fetchSearchResults = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", "10")

      if (name) queryParams.append("name", name)
      if (industry) queryParams.append("industry", industry)
      if (nationality) queryParams.append("nationality", nationality)
      if (minSalary) queryParams.append("minSalary", minSalary)
      if (maxSalary) queryParams.append("maxSalary", maxSalary)
      if (location) queryParams.append("location", location)
      if (role) queryParams.append("role", role)
      if (spokenLanguages) queryParams.append("spokenLanguages", spokenLanguages)
      if (experience) queryParams.append("experience", experience)
      if (keyword) queryParams.append("keyword", keyword)
      if (mobile) queryParams.append("mobile", mobile)
      if (email) queryParams.append("email", email)

      const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/admin/users-search?${queryParams}`, {
        headers
      })
      const result = await response.json()

      if (result.success) {
        setUsers(result.data.users)
        setPagination(result.data.pagination)
      } else {
        setError(result.message || "Failed to fetch search results")
      }
    } catch (err) {
      console.error("Error searching users:", err)
      setError("Failed to load search results")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilters = () => {
    fetchSearchResults(1)
  }

  const handleClearAll = () => {
    setName("")
    setIndustry("")
    setNationality("")
    setMinSalary("")
    setMaxSalary("")
    setLocation("")
    setRole("")
    setSpokenLanguages("")
    setExperience("")
    setKeyword("")
    setMobile("")
    setEmail("")
    setUsers([])
    setHasSearched(false)
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    })
  }

  const handleKnowMore = (item: Jobseeker) => {
    router.push(`/admin/users/jobseeker/${item.id}`)
  }

  const handleBlockUser = async (userId: string) => {
    try {
      const success = await blockUser(userId, 'jobseeker')
      if (success) {
        fetchSearchResults(pagination.currentPage)
      }
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      const success = await unblockUser(userId, 'jobseeker')
      if (success) {
        fetchSearchResults(pagination.currentPage)
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

  const jobseekerColumns: Column<Jobseeker>[] = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'emailAddress', label: 'Email Address', sortable: true },
    { key: 'phoneNumber', label: 'Phone Number', sortable: false },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'nationality', label: 'Nationality', sortable: true },
    { key: 'currentRole', label: 'Current Role', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'yearsOfExperience', label: 'Years of Experience', sortable: true },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'spokenLanguages', label: 'Spoken Languages', sortable: false },
    {
      key: 'loginStatus',
      label: 'Login Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.loginStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.loginStatus || 'active'}
        </span>
      )
    },
  ]

  const renderJobseekerActions = (jobseeker: Jobseeker) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          try {
            sessionStorage.setItem('admin_view_user', JSON.stringify(jobseeker))
          } catch {}
          handleKnowMore(jobseeker)
        }}
        className="flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Know More
      </Button>
      {jobseeker.loginStatus !== 'blocked' ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
            >
              <Ban className="w-3 h-3" />
              Block
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to block {jobseeker.fullName}? This will prevent them from accessing the portal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleBlockUser(jobseeker.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Block User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
            >
              <RefreshCw className="w-3 h-3" />
              Unblock
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unblock User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unblock {jobseeker.fullName}? This will allow them to access the portal again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUnblockUser(jobseeker.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Unblock User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-emerald-600" />
          Advanced Filter Search
        </h1>
        <p className="text-gray-600">Search and filter candidates by specific criteria</p>
      </div>

      <Card className="border border-emerald-100 shadow-sm bg-gradient-to-r from-white to-emerald-50/10">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label htmlFor="candidateName" className="font-semibold text-gray-700">Candidate Name</Label>
              <div className="relative">
                <Input
                  id="candidateName"
                  placeholder="Search by name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8 bg-white border-gray-200 h-11"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <MultiSelectComboInput
              id="filter-industry"
              label="Industry"
              value={industry}
              suggestions={SUGGESTED_INDUSTRIES}
              placeholder="Search or type industries"
              onChange={setIndustry}
              className="w-full"
            />

            <MultiSelectComboInput
              id="filter-nationality"
              label="Nationality"
              value={nationality}
              suggestions={SUGGESTED_NATIONALITIES}
              placeholder="Any Nationalities"
              onChange={setNationality}
              className="w-full"
            />

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Salary Range (Min - Max $)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="bg-white border-gray-200 h-11"
                />
                <span className="text-gray-400 text-xs">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="bg-white border-gray-200 h-11"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label htmlFor="location" className="font-semibold text-gray-700">Current Location</Label>
              <Input
                id="location"
                placeholder="e.g. New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white border-gray-200 h-11"
              />
            </div>

            <MultiSelectComboInput
              id="filter-role"
              label="Current Role"
              value={role}
              suggestions={SUGGESTED_ROLES}
              placeholder="Select Roles"
              onChange={setRole}
              className="w-full"
            />

            <MultiSelectComboInput
              id="filter-spoken-languages"
              label="Spoken Languages"
              value={spokenLanguages}
              suggestions={COMMON_LANGUAGES}
              placeholder="Any Languages"
              onChange={setSpokenLanguages}
              className="w-full"
            />

            <div className="space-y-2">
              <Label htmlFor="experience" className="font-semibold text-gray-700">Total Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                placeholder="Years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="bg-white border-gray-200 h-11"
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-2 col-span-1">
              <Label htmlFor="keyword" className="font-semibold text-gray-700">Keyword Search</Label>
              <Input
                id="keyword"
                placeholder="Python, PM, etc."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border-gray-200 h-11"
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="mobile" className="font-semibold text-gray-700">Mobile Number</Label>
              <Input
                id="mobile"
                placeholder="+971 XX XXX XXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="bg-white border-gray-200 h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Email ID</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-200 h-11"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={handleClearAll} className="text-gray-500 hover:text-gray-700 font-semibold">
              Clear All
            </Button>
            <Button onClick={handleApplyFilters} className="bg-[#00703c] hover:bg-[#005e32] text-white min-w-[120px] font-semibold rounded-lg shadow-sm">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Searching candidates...</span>
        </div>
      ) : (
        hasSearched && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Found {pagination.totalCount} candidate{pagination.totalCount === 1 ? "" : "s"} matching your criteria
            </h2>
            {users.length > 0 ? (
              <>
                <AdminDataTable
                  data={users}
                  columns={jobseekerColumns}
                  actions={renderJobseekerActions}
                  searchable={false}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                      {pagination.totalCount} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSearchResults(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSearchResults(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50 text-gray-500">
                No candidates found matching the selected filters.
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
