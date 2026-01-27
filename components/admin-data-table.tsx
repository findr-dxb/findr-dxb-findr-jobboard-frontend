"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react"

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface AdminDataTableProps {
  data: any[];
  columns: Column[];
  searchable?: boolean;
  pageSize?: number;
  actions?: (row: any) => React.ReactNode;
}

export function AdminDataTable({ 
  data, 
  columns, 
  searchable = true, 
  pageSize = 10,
  actions 
}: AdminDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true
    return columns.some((column) => {
      const value = row[column.key]
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatValue = (value: any, key: string) => {
    if (key.includes('Salary') && typeof value === 'number') {
      return `$${value.toLocaleString()}`
    }
    if (key.includes('Date') && value) {
      return new Date(value).toLocaleDateString()
    }
    if (key.includes('Status') || key === 'loginStatus') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'blocked' ? 'bg-red-100 text-red-800' :
          value === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          value === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value || 'active'}
        </span>
      )
    }
    return value?.toString() || '-'
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block rounded-lg border shadow-sm bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-semibold text-gray-900 whitespace-nowrap py-4">
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-semibold hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        {column.label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {actions && <TableHead className="font-semibold text-gray-900 whitespace-nowrap py-4">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow key={row.id || index} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <TableCell key={column.key} className="whitespace-nowrap py-4">
                        {formatValue(row[column.key], column.key)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="whitespace-nowrap py-4">
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xl">📊</span>
                      </div>
                      <p className="font-medium">No data found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((row, index) => (
            <div key={row.id || index} className="bg-white rounded-lg border shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-gray-600 min-w-0 flex-shrink-0 mr-2">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 text-right min-w-0 flex-1 font-medium">
                    {formatValue(row[column.key], column.key)}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-end">
                    {actions(row)}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <p className="font-semibold text-gray-700">No data found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(endIndex, sortedData.length)}</span> of <span className="font-medium text-gray-900">{sortedData.length}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="hidden sm:flex hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="sm:hidden hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 p-0 text-xs ${
                      currentPage === page 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                    }`}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="hidden sm:flex hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="sm:hidden hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
