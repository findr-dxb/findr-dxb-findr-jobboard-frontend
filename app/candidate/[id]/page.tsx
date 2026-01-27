"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CandidateProfileView } from "@/components/candidate-profile"
import { getJobseekerById } from "@/lib/admin-api"

export default function PublicCandidateProfilePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true)
        setError(null)
        if (!id || id === "undefined" || id === "null") {
          setError("Invalid candidate id")
          setIsLoading(false)
          return
        }
        const js = await getJobseekerById(id)
        if (js) {
          setUserData(js)
        } else if (typeof window !== 'undefined') {
          // Fallback: use data stashed by admin users page
          const raw = sessionStorage.getItem('admin_view_user')
          if (raw) {
            try { setUserData(JSON.parse(raw)) } catch {}
          }
        }
      } catch (e) {
        setError("Failed to load candidate")
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading candidate…
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>Profile not found</div>
        <div className="text-sm text-gray-500">We couldn't find the candidate profile you were looking for.</div>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-md border">Back to Dashboard</button>
      </div>
    )
  }

  const candidate = {
    name: userData.fullName,
    email: userData.emailAddress,
    phone: userData.phoneNumber,
    location: userData.location || "",
    dateOfBirth: userData.dateOfBirth || "",
    nationality: userData.nationality || "",
    summary: userData.summary || "",
    currentRole: userData.currentRole || "",
    company: userData.company || "",
    experience: (userData.yearsOfExperience?.toString?.() || "") + (userData.yearsOfExperience ? " years" : ""),
    industry: userData.industry || "",
    degree: userData.degree || "",
    institution: userData.institution || "",
    year: userData.year || "",
    grade: userData.grade || "",
    skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : (userData.skills || ""),
    certifications: Array.isArray(userData.certifications) ? userData.certifications.join(", ") : (userData.certifications || ""),
    jobType: userData.jobType || "",
    salaryExpectation: userData.salaryExpectation || "",
    preferredLocation: userData.preferredLocation || "",
    availability: userData.availability || "",
    appliedFor: userData.appliedFor || "",
    appliedDate: userData.appliedDate || "",
    status: userData.status || "",
    resumeFilename: userData.resumeFilename || "",
    coverLetter: userData.coverLetter || "",
    documentsList: userData.documentsList || [],
    rating: userData.rating || 0,
    tier: userData.tier || "Blue",
  }

  return <CandidateProfileView candidate={candidate} />
}

