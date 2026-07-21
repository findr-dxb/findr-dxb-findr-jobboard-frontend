"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, UserPlus } from "lucide-react"
import { getSignupsToday, type SignupTodayUser, type SignupsToday } from "@/lib/admin-api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatSignupDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export default function SignupsTodayPage() {
  const [data, setData] = useState<SignupsToday | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const loadSignups = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getSignupsToday({ page: pageNum, limit: 20 })
      setData(result)
    } catch (err) {
      console.error("Error loading today's sign-ups:", err)
      setError("Failed to load today's sign-ups")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSignups(page)
  }, [loadSignups, page])

  const users: SignupTodayUser[] = data?.users || []
  const pagination = data?.pagination
  const todayLabel = data?.date
    ? new Date(data.date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Today&apos;s Sign-ups
              </h1>
              <p className="text-sm text-gray-500">{todayLabel}</p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => loadSignups(page)}
          disabled={isLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Today</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
            {isLoading && !data ? <LoadingSpinner size={20} /> : (data?.total || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Candidates</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
            {isLoading && !data ? <LoadingSpinner size={20} /> : (data?.candidates || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employers</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700 tabular-nums">
            {isLoading && !data ? <LoadingSpinner size={20} /> : (data?.employers || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {isLoading && !data ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size={28} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-500">
            No sign-ups today
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3.5 font-medium">User</th>
                  <th className="px-5 py-3.5 font-medium">Type</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={`${user.type}-${user._id}`}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          user.type === "candidate"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {user.type === "candidate" ? "Candidate" : "Employer"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            user.status === "active" ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        />
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-500 whitespace-nowrap">
                      {formatSignupDateTime(user.signupAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
