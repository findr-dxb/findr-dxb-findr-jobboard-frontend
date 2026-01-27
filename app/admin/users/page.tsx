"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AdminDataTable } from "@/components/admin-data-table"
import { Jobseeker, Employer } from "@/lib/admin-types"
import { blockUser, unblockUser, getUsersByType, type UsersApiResponse } from "@/lib/admin-api"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Download, Ban, RefreshCw } from "lucide-react"
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

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'jobseekers' | 'employers'>('jobseekers')
  const [jobseekers, setJobseekers] = useState<Jobseeker[]>([])
  const [employers, setEmployers] = useState<Employer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobseekerPagination, setJobseekerPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })
  const [employerPagination, setEmployerPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })
  const hasInitialFetch = useRef(false)

  // Fetch users data based on active tab
  const fetchUsers = async (userType: 'jobseeker' | 'employer', page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await getUsersByType(userType, {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
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

  // Pre-fetch both counts on initial mount so counts are available for both tabs
  useEffect(() => {
    // Initialize tab from query (?tab=employers|jobseekers)
    const initialTab = searchParams?.get('tab') === 'employers' ? 'employers' : 'jobseekers'
    setActiveTab(initialTab)

    const fetchInitialCounts = async () => {
      if (hasInitialFetch.current) return
      hasInitialFetch.current = true

      try {
        setIsLoading(true)
        // Fetch both jobseekers and employers on initial load
        const [jobseekerResponse, employerResponse] = await Promise.all([
          getUsersByType('jobseeker', {
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }),
          getUsersByType('employer', {
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })
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

    // Only fetch on initial mount
    fetchInitialCounts()
  }, []) // Empty dependency array - only run on mount

  // Load data when tab changes (but skip on initial mount since we fetch both above)
  useEffect(() => {
    if (!hasInitialFetch.current) return // Skip if initial fetch hasn't completed yet
    
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    fetchUsers(userType)
  }, [activeTab])

  const handleRefresh = () => {
    const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
    const currentPagination = activeTab === 'jobseekers' ? jobseekerPagination : employerPagination
    fetchUsers(userType, currentPagination.currentPage)
  }

  const handleTabChange = (tab: 'jobseekers' | 'employers') => {
    setActiveTab(tab)
    if (tab === 'jobseekers') {
      setJobseekerPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
    } else {
      setEmployerPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
    }
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
      // Call the API to block the user
      const success = await blockUser(userId, userType);
      
      if (success) {
        // Refresh the data to get the updated status from the server
        const currentPagination = userType === 'jobseeker' ? jobseekerPagination : employerPagination
        await fetchUsers(userType, currentPagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to block user:', error);
      // In a real app, you might want to show a toast notification here
    }
  }

  const handleUnblockUser = async (userId: string, userType: 'jobseeker' | 'employer') => {
    try {
      // Call the API to unblock the user
      const success = await unblockUser(userId, userType);
      
      if (success) {
        // Refresh the data to get the updated status from the server
        const currentPagination = userType === 'jobseeker' ? jobseekerPagination : employerPagination
        await fetchUsers(userType, currentPagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
      // In a real app, you might want to show a toast notification here
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
                onClick={() => handleBlockUser(jobseeker.id, 'jobseeker')}
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
                onClick={() => handleUnblockUser(jobseeker.id, 'jobseeker')}
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
                Are you sure you want to block {employer.companyName}? This will prevent them from accessing the portal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleBlockUser(employer.id, 'employer')}
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
                Are you sure you want to unblock {employer.companyName}? This will allow them to access the portal again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUnblockUser(employer.id, 'employer')}
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
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
        <Button
          variant={activeTab === 'jobseekers' ? 'default' : 'ghost'}
          onClick={() => handleTabChange('jobseekers')}
          className="px-4 w-full sm:w-auto"
          disabled={isLoading}
        >
          Jobseekers ({jobseekerPagination.totalCount > 0 ? jobseekerPagination.totalCount : jobseekers.length})
        </Button>
        <Button
          variant={activeTab === 'employers' ? 'default' : 'ghost'}
          onClick={() => handleTabChange('employers')}
          className="px-4 w-full sm:w-auto"
          disabled={isLoading}
        >
          Employers ({employerPagination.totalCount > 0 ? employerPagination.totalCount : employers.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading {activeTab}...</span>
        </div>
      ) : (
        <>
          {activeTab === 'jobseekers' ? (
            <AdminDataTable
              data={jobseekers}
              columns={jobseekerColumns}
              actions={renderJobseekerActions}
            />
          ) : (
            <AdminDataTable
              data={employers}
              columns={employerColumns}
              actions={renderEmployerActions}
            />
          )}

          {/* Pagination Controls */}
          {(() => {
            const pagination = activeTab === 'jobseekers' ? jobseekerPagination : employerPagination
            return pagination.totalPages > 1 && (
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
                    onClick={() => {
                      const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
                      fetchUsers(userType, pagination.currentPage - 1)
                    }}
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
                    onClick={() => {
                      const userType = activeTab === 'jobseekers' ? 'jobseeker' : 'employer'
                      fetchUsers(userType, pagination.currentPage + 1)
                    }}
                    disabled={!pagination.hasNextPage || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}