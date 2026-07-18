"use client"

import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts"
import type { NationalityDemographics } from "@/lib/admin-api"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const COLORS = [
  "#166534",
  "#22c55e",
  "#1e3a5f",
  "#3b82f6",
  "#93c5fd",
  "#334155",
  "#64748b",
  "#0ea5e9",
  "#bfdbfe",
  "#94a3b8",
  "#cbd5e1",
]

function formatTotal(value: number): string {
  if (value >= 1000) {
    const k = value / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
  }
  return value.toLocaleString()
}

interface Props {
  data: NationalityDemographics | null
  isLoading?: boolean
}

export function NationalityDemographicsChart({ data, isLoading }: Props) {
  const countries = data?.countries || []
  const total = data?.total || 0
  const labels = countries.map((c) => c.country)
  const series = countries.map((c) => c.percentage)
  const colors = COLORS.slice(0, countries.length)

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    labels,
    colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: 18,
              fontSize: "11px",
              fontWeight: 600,
              color: "#6b7280",
              formatter: () => "TOTAL USERS",
            },
            value: {
              show: true,
              offsetY: -10,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              formatter: () => formatTotal(total),
            },
            total: {
              show: true,
              label: "TOTAL USERS",
              fontSize: "11px",
              fontWeight: 600,
              color: "#6b7280",
              formatter: () => formatTotal(total),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const count = countries[opts.seriesIndex]?.count ?? 0
          return `${val}% (${count.toLocaleString()})`
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-full">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Nationality Demographics</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {total.toLocaleString()} Total
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading…</div>
      ) : countries.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          No nationality data available
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="mx-auto w-full max-w-[240px] shrink-0">
            <Chart options={options} series={series} type="donut" height={260} />
          </div>

          <ul className="grid w-full min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {countries.map((item, i) => (
              <li
                key={`${item.country}-${i}`}
                className="flex min-w-0 items-start gap-2 text-sm text-gray-700"
              >
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: colors[i] }}
                />
                <p className="min-w-0 leading-5">
                  <span className="font-medium break-words">{item.country}</span>{" "}
                  <span className="whitespace-nowrap text-gray-500">({item.percentage}%)</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
