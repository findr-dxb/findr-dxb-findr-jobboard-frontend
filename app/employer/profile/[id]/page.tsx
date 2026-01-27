"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CompanyProfileView } from "@/components/company-profile"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const API_BASE_URL = 'https://findr-jobboard-backend-production.up.railway.app/api/v1'

export default function PublicCompanyProfilePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE_URL}/company/${id}`, { method: 'GET' })
        if (!res.ok) throw new Error('Failed')
        const result = await res.json()
        const company = (result?.data?.company) ?? (result?.data) ?? result
        setData(company)
      } catch (e) {
        setError("Failed to load company profile")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) run()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading company…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>{error || "Company not found"}</div>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-md border">Go back</button>
      </div>
    )
  }

  const company = {
    companyName: data.companyName,
    industry: data.industry || "",
    teamSize: data.teamSize || "",
    foundedYear: (data.foundedYear?.toString?.() || ""),
    about: data.about || "",
    location: {
      city: data.companyLocation?.city || data.city || "",
      country: data.companyLocation?.country || data.country || "",
      officeAddress: data.companyLocation?.officeAddress || data.officeAddress || "",
    },
    website: data.companyWebsite || data.website || "",
    verified: Boolean(data.verificationStatus === 'verified'),
    logo: data.companyLogo || data.logo || "",
    specialties: data.specialties || [],
    achievements: data.achievements || [],
    workCulture: data.workCulture || [],
    socialLinks: data.socialLinks || {},
    activeJobsCount: data.activeJobsCount,
    totalJobsPosted: data.totalJobsPosted,
    memberSince: data.createdAt,
  }

  return <CompanyProfileView company={company} />
}

















