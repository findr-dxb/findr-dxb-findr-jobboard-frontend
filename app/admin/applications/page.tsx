"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminDataTable } from "@/components/admin-data-table"
import { Application } from "@/lib/admin-types"
import { useRouter } from "next/navigation"
import { Eye, Download } from "lucide-react"
import * as XLSX from 'xlsx'
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })

  const columns = [
    { key: 'id', label: 'Application ID', sortable: true },
    { key: 'candidate', label: 'Candidate', sortable: true },
    { key: 'jobTitle', label: 'Job Title', sortable: true },
  ]

  const handleExportToExcel = async () => {
    try {
      // Fetch all applications for export (use a large limit to get all)
      const queryParams = new URLSearchParams({
        page: '1',
        limit: (pagination.totalCount > 0 ? pagination.totalCount : 10000).toString(),
        sortBy: 'appliedDate',
        sortOrder: 'desc'
      })
      
      const res = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/applications?${queryParams}`)
      const json = await res.json()
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch applications for export')
      }
      
      const allApplications = json.data.applications
      
      const workbook = XLSX.utils.book_new()
      const worksheetData = [
        ['Application ID', 'Candidate', 'Job Title'],
        ...allApplications.map((app: Application) => [app.id, app.candidate, app.jobTitle])
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications')
      
      const filename = `Applications_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, filename)
    } catch (error: any) {
      console.error('Error exporting applications:', error)
      setError(error.message || 'Failed to export applications')
    }
  }

  const handleViewMore = (application: Application) => {
    router.push(application.applicationUrl)
  }

  const fetchApplications = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'appliedDate',
        sortOrder: 'desc'
      })
      
      const res = await fetch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/admin/applications?${queryParams}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch applications')
      }
      setApplications(json.data.applications)
      setPagination(json.data.pagination)
    } catch (e: any) {
      console.error('Error loading applications:', e)
      setError(e.message || 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications(1)
  }, [])

  const renderActions = (application: Application) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleViewMore(application)}
      className="flex items-center gap-1"
    >
      <Eye className="w-3 h-3" />
      View More
    </Button>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Applications Management</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage all job applications</p>
          {error && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading applications...</span>
        </div>
      ) : (
        <>
          <AdminDataTable
            data={applications}
            columns={columns}
            actions={renderActions}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchApplications(pagination.currentPage - 1)}
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
                  onClick={() => fetchApplications(pagination.currentPage + 1)}
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
