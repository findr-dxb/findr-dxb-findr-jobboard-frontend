"use client"

import Link from "next/link"
import { UserPlus } from "lucide-react"
import type { RecentLogins } from "@/lib/admin-api"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatLoginDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

interface Props {
  data: RecentLogins | null
  isLoading?: boolean
}

export function RecentLoginsTable({ data, isLoading }: Props) {
  const users = data?.users || []
  const total = data?.total || 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <UserPlus className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">New Sign-ups</h2>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {total.toLocaleString()} Total
          </span>
        </div>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : users.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          No new sign-ups yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={`${user.type}-${user._id}`} className="border-b border-gray-50 last:border-0">
                  <td className="py-3.5 pr-4">
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
                  <td className="py-3.5 pr-4">
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
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        user.status === "active" ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                  </td>
                  <td className="py-3.5 text-right text-sm text-gray-500 whitespace-nowrap">
                    {formatLoginDateTime(user.loginAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
