"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import type { ApexOptions } from "apexcharts"
import { Activity } from "lucide-react"
import type { ActiveUsersToday } from "@/lib/admin-api"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

function buildHourlySeries(
  hourly: ActiveUsersToday["hourly"] | undefined
): Array<{ hour: number; label: string; count: number }> {
  const base = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}:00`,
    count: 0,
  }))

  if (!hourly?.length) return base

  hourly.forEach((entry) => {
    const hour = typeof entry.hour === "number" ? entry.hour : Number(String(entry.label).split(":")[0])
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) {
      base[hour].count = entry.count || 0
    }
  })

  return base
}

interface Props {
  data: ActiveUsersToday | null
  isLoading?: boolean
}

export function ActiveUsersTodayChart({ data, isLoading }: Props) {
  const hourly = buildHourlySeries(data?.hourly)

  const total = data?.total || 0
  const candidates = data?.candidates || 0
  const employers = data?.employers || 0

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: "70%",
      },
    },
    colors: ["#166534"],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 4, right: 4 },
    },
    xaxis: {
      categories: hourly.map((h) => h.label),
      tickAmount: 24,
      labels: {
        show: true,
        hideOverlappingLabels: false,
        showDuplicates: true,
        trim: false,
        rotate: -45,
        rotateAlways: true,
        style: { colors: "#9ca3af", fontSize: "9px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: "Hours (24h)",
        style: { color: "#9ca3af", fontSize: "11px", fontWeight: 500 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        formatter: (val: number) => String(Math.round(val)),
      },
      min: 0,
      forceNiceScale: true,
      title: {
        text: "Active users",
        style: { color: "#9ca3af", fontSize: "11px", fontWeight: 500 },
      },
    },
    tooltip: {
      x: {
        formatter: (_val, opts) => {
          const hour = opts?.dataPointIndex ?? 0
          return `${String(hour).padStart(2, "0")}:00 – ${String(hour).padStart(2, "0")}:59`
        },
      },
      y: {
        formatter: (val: number) => `${val} active`,
      },
    },
  }

  const series = [
    {
      name: "Active Users",
      data: hourly.map((h) => h.count),
    },
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Active Users Today</h2>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {total.toLocaleString()} Total
          </span>
        </div>
        <Link
          href="/admin/active-users-today"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
        >
          View All
        </Link>
      </div>

      <div className="mb-4 flex gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500">Candidates</p>
          <p className="font-semibold text-gray-900">{candidates.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Employers</p>
          <p className="font-semibold text-gray-900">{employers.toLocaleString()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : (
        <Chart options={options} series={series} type="bar" height={280} />
      )}
    </div>
  )
}
