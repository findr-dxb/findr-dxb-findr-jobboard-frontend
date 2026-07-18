"use client"

import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts"
import { Activity } from "lucide-react"
import type { ActiveUsersToday } from "@/lib/admin-api"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: ActiveUsersToday | null
  isLoading?: boolean
}

export function ActiveUsersTodayChart({ data, isLoading }: Props) {
  const hourly = data?.hourly?.length
    ? data.hourly
    : Array.from({ length: 24 }, (_, hour) => ({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
        count: 0,
      }))

  const total = data?.total || 0
  const candidates = data?.candidates || 0
  const employers = data?.employers || 0

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    colors: ["#166534"],
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: hourly.map((h) => h.label),
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: { colors: "#9ca3af", fontSize: "10px" },
        formatter: (value: string) => {
          const hour = Number(String(value).split(":")[0])
          return hour % 3 === 0 ? value : ""
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        formatter: (val: number) => String(Math.round(val)),
      },
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
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
        <div className="flex h-56 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : (
        <Chart options={options} series={series} type="bar" height={240} />
      )}
    </div>
  )
}
