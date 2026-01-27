"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AdminDataTable } from "@/components/admin-data-table"
import { getJobs, updateJobStatus, type ActiveJob, type JobsApiResponse } from "@/lib/admin-api"
import { useRouter } from "next/navigation"
import { Eye, Pause, X, Download, RefreshCw } from "lucide-react"
import * as XLSX from 'xlsx'
import { toast } from "sonner"
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

export default function AdminJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<ActiveJob[]>([])
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

  // Fetch jobs data
  const fetchJobs = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await getJobs({
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'all' // Get all jobs including active, paused, closed
      })

      setJobs(response.jobs)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error fetching jobs data:', err)
      setError('Failed to load jobs data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data when component mounts
  useEffect(() => {
    fetchJobs()
  }, [])

  const handleRefresh = () => {
    fetchJobs(pagination.currentPage)
  }

  const columns = [
    { key: 'jobTitle', label: 'Job Title', sortable: true },
    { key: 'companyName', label: 'Company Name', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'jobType', label: 'Job Type', sortable: true },
    { key: 'minimumSalary', label: 'Minimum Salary', sortable: true },
    { key: 'maximumSalary', label: 'Maximum Salary', sortable: true },
    { key: 'applicationDeadline', label: 'Application Deadline', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ]

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    const worksheetData = [
      ['Job Title', 'Company Name', 'Location', 'Job Type', 'Minimum Salary', 'Maximum Salary', 'Application Deadline', 'Status'],
      ...jobs.map(job => [
        job.jobTitle,
        job.companyName,
        job.location,
        job.jobType,
        `$${job.minimumSalary.toLocaleString()}`,
        `$${job.maximumSalary.toLocaleString()}`,
        job.applicationDeadline,
        job.status
      ])
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Active Jobs')
    
    const filename = `Active_Jobs_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const handleViewMore = (job: ActiveJob) => {
    router.push(job.jobUrl)
  }

  const handlePauseJob = async (job: ActiveJob) => {
    try {
      const newStatus = job.status === 'active' ? 'paused' : 'active'
      const success = await updateJobStatus(job.id, newStatus)
      
      if (success) {
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id 
              ? { ...j, status: newStatus }
              : j
          )
        )
        toast.success(`Job ${newStatus === 'paused' ? 'paused' : 'activated'} successfully`)
      } else {
        toast.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const handleCloseJob = async (job: ActiveJob) => {
    try {
      const success = await updateJobStatus(job.id, 'closed')
      
      if (success) {
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id 
              ? { ...j, status: 'closed' }
              : j
          )
        )
        toast.success('Job closed successfully')
      } else {
        toast.error('Failed to close job')
      }
    } catch (error) {
      console.error('Error closing job:', error)
      toast.error('Failed to close job')
    }
  }

  const renderActions = (job: ActiveJob) => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleViewMore(job)}
        className="flex items-center justify-center gap-1 w-full sm:w-auto"
      >
        <Eye className="w-3 h-3" />
        <span className="hidden sm:inline">View More</span>
        <span className="sm:hidden">View</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePauseJob(job)}
        className={`flex items-center justify-center gap-1 w-full sm:w-auto ${
          job.status === 'paused' ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'
        }`}
        disabled={isLoading}
      >
        <Pause className="w-3 h-3" />
        <span className="hidden sm:inline">{job.status === 'active' ? 'Pause Job' : 'Activate Job'}</span>
        <span className="sm:hidden">{job.status === 'active' ? 'Pause' : 'Activate'}</span>
      </Button>
      {job.status !== 'closed' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1 text-orange-600 hover:text-orange-700 w-full sm:w-auto"
              disabled={isLoading}
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Close Job</span>
              <span className="sm:hidden">Close</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to close "{job.jobTitle}" at {job.companyName}? This will prevent new applications but keep existing applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleCloseJob(job)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Yes, Close Job
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
          <h1 className="text-xl md:text-2xl font-bold">Jobs Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage all job postings ({pagination.totalCount} total)</p>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={32} />
          <span className="ml-3 text-gray-600">Loading jobs...</span>
        </div>
      ) : (
        <>
          <AdminDataTable
            data={jobs}
            columns={columns}
            actions={renderActions}
          />

          {/* Pagination Controls */}
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
                  onClick={() => fetchJobs(pagination.currentPage - 1)}
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
                  onClick={() => fetchJobs(pagination.currentPage + 1)}
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