"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminDataTable } from "@/components/admin-data-table"
import { Jobseeker, Employer } from "@/lib/admin-types"
import { blockUser, unblockUser, getUsersByType } from "@/lib/admin-api"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Download, Ban, RefreshCw, Search } from "lucide-react"
import * as XLSX from 'xlsx'
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

const defaultPagination = {
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  hasNextPage: false,
  hasPrevPage: false,
  limit: 10,
}

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'jobseekers' | 'employers'>('jobseekers')
  const [searchInput, setSearchInput] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [jobseekers, setJobseekers] = useState<Jobseeker[]>([])
  const [employers, setEmployers] = useState<Employer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobseekerPagination, setJobseekerPagination] = useState(defaultPagination)
  const [employerPagination, setEmployerPagination] = useState(defaultPagination)
  const hasInitialFetch = useRef(false)

  const fetchUsers = async (
    userType: 'jobseeker' | 'employer',
    page: number = 1,
    search: string = activeSearch
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getUsersByType(userType, {
        page,
        limit: 10,
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      if (userType === 'jobseeker') {
        setJobseekers(response.users as Jobseeker[])
        setJobseekerPagination(response.pagination)
      } else {
        setEmployers(response.users as Employer[])
        setEmployerPagination(response.pagination)
      }
    } catch (err) {
      console.error(`Error fetching ${userType} data:`, err)
      setError(`Failed to load ${userType} data`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initialTab = searchParams?.get('tab') === 'employers' ? 'employers' : 'jobseekers'
    setActiveTab(initialTab)

    const fetchInitialCounts = async () => {
      if (hasInitialFetch.current) return
      hasInitialFetch.current = true

      try {
        setIsLoading(true)
        const [jobseekerResponse, employerResponse] = await Promise.all([
          getUsersByType('jobseeker', { page: 1, limit: 10, search: "", sortBy: 'createdAt', sortOrder: 'desc' }),
          getUsersByType('employer', { page: 1, limit: 10, search: "", sortBy: 'createdAt', sortOrder: 'desc' }),
        ])

        setJobseekers(jobseekerResponse.users as Jobseeker[])
        setJobseekerPagination(jobseekerResponse.pagination)
        setEmployers(employerResponse.users as Employer[])
        setEmployerPagination(employerResponse.pagination)
      } catch (err) {
        console.error('Error fetching initial counts:', err)
        setError('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialCounts()
  }, [])

  const handleSearch = () => {
    const query = searchInput.trim()
    setActiveSearch(query)
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    fetchUsers(userType, 1, query)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setActiveSearch("")
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    fetchUsers(userType, 1, "")
  }

  const handleRefresh = () => {
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    const currentPagination = activeTab === 'jobseekers' ? jobseekerPagination : employerPagination
    fetchUsers(userType, currentPagination.currentPage, activeSearch)
  }

  const handleTabChange = (tab: 'jobseekers' | 'employers') => {
    setActiveTab(tab)
    setSearchInput("")
    setActiveSearch("")
    const userType = tab === 'jobseekers' ? 'jobseeker' : 'employer'
    fetchUsers(userType, 1, "")
  }

  const jobseekerColumns = [
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'emailAddress', label: 'Email Address', sortable: true },
    { key: 'phoneNumber', label: 'Phone Number', sortable: false },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'nationality', label: 'Nationality', sortable: true },
    { key: 'currentRole', label: 'Current Role', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'yearsOfExperience', label: 'Years of Experience', sortable: true },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'loginStatus', label: 'Login Status', sortable: true },
  ]

  const employerColumns = [
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'companyEmail', label: 'Company Email', sortable: true },
    { key: 'phoneNumber', label: 'Phone Number', sortable: false },
    { key: 'website', label: 'Website', sortable: false },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'teamSize', label: 'Team Size', sortable: true },
    { key: 'foundedYear', label: 'Founded Year', sortable: true },
    { key: 'loginStatus', label: 'Login Status', sortable: true },
  ]

  const handleExportToExcel = () => {
    const data = activeTab === 'jobseekers' ? jobseekers : employers
    const columns = activeTab === 'jobseekers' ? jobseekerColumns : employerColumns

    const workbook = XLSX.utils.book_new()
    const worksheetData = [
      columns.map(col => col.label),
      ...data.map(row => columns.map(col => (row as any)[col.key]))
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'jobseekers' ? 'Jobseekers' : 'Employers')

    const filename = `${activeTab === 'jobseekers' ? 'Jobseekers' : 'Employers'}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const handleKnowMore = (item: Jobseeker | Employer) => {
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    router.push(`/admin/users/${userType}/${item.id}`)
  }

  const handleBlockUser = async (userId: string, userType: 'jobseeker' | 'employer') => {
    try {
      const success = await blockUser(userId, userType)
      if (success) {
        const currentPagination = userType === 'jobseeker' ? jobseekerPagination : employerPagination
        await fetchUsers(userType, currentPagination.currentPage, activeSearch)
      }
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const handleUnblockUser = async (userId: string, userType: 'jobseeker' | 'employer') => {
    try {
      const success = await unblockUser(userId, userType)
      if (success) {
        const currentPagination = userType === 'jobseeker' ? jobseekerPagination : employerPagination
        await fetchUsers(userType, currentPagination.currentPage, activeSearch)
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

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
            <Button variant="destructive" size="sm" className="flex items-center gap-1">
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
              <AlertDialogAction onClick={() => handleBlockUser(jobseeker.id, 'jobseeker')} className="bg-red-600 hover:bg-red-700">
                Yes, Block User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50">
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
              <AlertDialogAction onClick={() => handleUnblockUser(jobseeker.id, 'jobseeker')} className="bg-green-600 hover:bg-green-700">
                Yes, Unblock User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )

  const renderEmployerActions = (employer: Employer) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          try {
            sessionStorage.setItem('admin_view_user', JSON.stringify(employer))
          } catch {}
          handleKnowMore(employer)
        }}
        className="flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Know More
      </Button>
      {employer.loginStatus !== 'blocked' ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex items-center gap-1">
              <Ban className="w-3 h-3" />
              Block
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to block {employer.companyName}? This will prevent them from accessing the portal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleBlockUser(employer.id, 'employer')} className="bg-red-600 hover:bg-red-700">
                Yes, Block User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50">
              <RefreshCw className="w-3 h-3" />
              Unblock
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unblock User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unblock {employer.companyName}? This will allow them to access the portal again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleUnblockUser(employer.id, 'employer')} className="bg-green-600 hover:bg-green-700">
                Yes, Unblock User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )

  const pagination = activeTab === 'jobseekers' ? jobseekerPagination : employerPagination
  const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Users Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage jobseekers and employers</p>
          {error && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportToExcel} variant="outline" className="flex items-center gap-2 w-full sm:w-auto" disabled={isLoading}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
        <Button variant={activeTab === 'jobseekers' ? 'default' : 'ghost'} onClick={() => handleTabChange('jobseekers')} className="px-4 w-full sm:w-auto" disabled={isLoading}>
          Jobseekers ({jobseekerPagination.totalCount > 0 ? jobseekerPagination.totalCount : jobseekers.length})
        </Button>
        <Button variant={activeTab === 'employers' ? 'default' : 'ghost'} onClick={() => handleTabChange('employers')} className="px-4 w-full sm:w-auto" disabled={isLoading}>
          Employers ({employerPagination.totalCount > 0 ? employerPagination.totalCount : employers.length})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all users by name, email, phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
          {activeSearch && (
            <Button variant="outline" onClick={handleClearSearch} disabled={isLoading}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {activeSearch && (
        <p className="text-sm text-gray-600">
          Showing results for: <span className="font-medium text-gray-900">&quot;{activeSearch}&quot;</span>
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading {activeTab}...</span>
        </div>
      ) : (
        <>
          {activeTab === 'jobseekers' ? (
            <AdminDataTable data={jobseekers} columns={jobseekerColumns} actions={renderJobseekerActions} searchable={false} />
          ) : (
            <AdminDataTable data={employers} columns={employerColumns} actions={renderEmployerActions} searchable={false} />
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(userType, pagination.currentPage - 1, activeSearch)}
                  disabled={!pagination.hasPrevPage || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(userType, pagination.currentPage + 1, activeSearch)}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
