"use client"

import type { IndustryDistribution } from "@/lib/admin-api"

const COLORS = [
  "#166534",
  "#1e3a8a",
  "#22c55e",
  "#334155",
  "#93c5fd",
  "#a5b4fc",
]

function formatCount(value: number): string {
  if (value >= 1000) {
    const k = value / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
  }
  return value.toLocaleString()
}

interface Props {
  data: IndustryDistribution | null
  isLoading?: boolean
}

export function IndustryDistributionChart({ data, isLoading }: Props) {
  const industries = data?.industries || []

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Industry Distribution</h2>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : industries.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          No candidate industry data available
        </div>
      ) : (
        <div className="space-y-5">
          {industries.map((item, i) => (
            <div key={item.industry}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gray-900">{item.industry}</span>
                <span className="shrink-0 text-gray-500">
                  {formatCount(item.count)} Candidates
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
