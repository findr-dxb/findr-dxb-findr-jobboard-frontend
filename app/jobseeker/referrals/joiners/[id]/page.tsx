"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin, Calendar, Briefcase, Award } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://findr-jobboard-backend-production.up.railway.app/api/v1"

interface JobseekerProfile {
  fullName?: string
  name?: string
  email?: string
  phoneNumber?: string
  location?: string
  nationality?: string
  dateOfBirth?: string
  membershipTier?: string
  createdAt?: string
  professionalSummary?: string
  professionalExperience?: Array<{
    currentRole?: string
    company?: string
    yearsOfExperience?: number
    industry?: string
  }>
  education?: Array<{
    highestDegree?: string
    institution?: string
    yearOfGraduation?: number
  }>
  skills?: string[]
}

interface EmployerProfile {
  companyName?: string
  name?: string
  email?: string
  phoneNumber?: string
  companyLocation?: string
  industry?: string
  membershipTier?: string
  createdAt?: string
  aboutCompany?: string
}

type JoinerProfile = {
  type: "jobseeker" | "employer"
  profile: JobseekerProfile | EmployerProfile
}

export default function ReferralJoinerProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<JoinerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!params?.id) return

      try {
        const token =
          localStorage.getItem("findr_token") || localStorage.getItem("authToken") || localStorage.getItem("token")

        if (!token) {
          router.push("/login")
          return
        }

        const response = await axios.get(`${API_BASE_URL}/referrals/joiners/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.data?.success) {
          setData(response.data.data as JoinerProfile)
        } else {
          const msg = response.data?.message || "Failed to load referred user profile"
          setError(msg)
          toast({
            title: "Error",
            description: msg,
            variant: "destructive",
          })
        }
      } catch (err: any) {
        console.error("Error fetching referral joiner profile:", err)
        const msg = err.response?.data?.message || "Failed to load referred user profile"
        setError(msg)
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params?.id, router, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600">Loading referred user profile...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Referred User Profile</h1>
              <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">
                  {error || "We could not find this referred user or you do not have access to view their profile."}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const { type, profile } = data
  const isJobseeker = type === "jobseeker"

  const displayName =
    (profile as JobseekerProfile).fullName ||
    (profile as JobseekerProfile).name ||
    (profile as EmployerProfile).companyName ||
    "User"

  const joinedAt = (profile as any).createdAt

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Referred User Profile</h1>
              <p className="text-gray-600">
                This is a read-only view of a user who joined using your referral code.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/jobseeker/referrals/joiners">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Referred Users
                </Button>
              </Link>
            </div>
          </div>

          {/* Basic info card */}
          <Card className="card-shadow border-0">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
                    <Badge
                      className={
                        isJobseeker
                          ? "bg-blue-100 text-blue-800 text-[11px] font-semibold"
                          : "bg-purple-100 text-purple-800 text-[11px] font-semibold"
                      }
                    >
                      {isJobseeker ? "Jobseeker" : "Employer"}
                    </Badge>
                    {profile.membershipTier && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] font-semibold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {profile.membershipTier} Tier
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    {profile.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="font-mono text-[11px]">{profile.email}</span>
                      </span>
                    )}
                    {"phoneNumber" in profile && profile.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono text-[11px]">{profile.phoneNumber}</span>
                      </span>
                    )}
                    {"location" in profile && profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{profile.location}</span>
                      </span>
                    )}
                    {joinedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {new Date(joinedAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed info (read-only) */}
          {isJobseeker ? (
            <>
              {/* Professional summary */}
              {(
                profile as JobseekerProfile
              ).professionalSummary && (
                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {(profile as JobseekerProfile).professionalSummary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Experience & education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray((profile as JobseekerProfile).professionalExperience) &&
                    (profile as JobseekerProfile).professionalExperience!.length > 0 ? (
                      (profile as JobseekerProfile).professionalExperience!.map((exp, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          {exp.currentRole && (
                            <p className="text-sm font-semibold text-gray-900">{exp.currentRole}</p>
                          )}
                          {exp.company && (
                            <p className="text-xs text-gray-600">
                              {exp.company}
                              {typeof exp.yearsOfExperience === "number" && exp.yearsOfExperience > 0
                                ? ` • ${exp.yearsOfExperience} yrs`
                                : ""}
                            </p>
                          )}
                          {exp.industry && (
                            <p className="text-xs text-gray-500 mt-0.5">{exp.industry}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No experience information available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray((profile as JobseekerProfile).education) &&
                    (profile as JobseekerProfile).education!.length > 0 ? (
                      (profile as JobseekerProfile).education!.map((edu, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          {edu.highestDegree && (
                            <p className="text-sm font-semibold text-gray-900">{edu.highestDegree}</p>
                          )}
                          {edu.institution && (
                            <p className="text-xs text-gray-600">
                              {edu.institution}
                              {edu.yearOfGraduation ? ` • ${edu.yearOfGraduation}` : ""}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No education information available.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              {Array.isArray((profile as JobseekerProfile).skills) &&
                (profile as JobseekerProfile).skills!.length > 0 && (
                  <Card className="card-shadow border-0">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(profile as JobseekerProfile).skills!.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          ) : (
            <>
              {/* Employer about card */}
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Company Information
                  </CardTitle>
                  <CardDescription>High-level, read-only details for this employer account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  {(profile as EmployerProfile).companyName && (
                    <p>
                      <span className="font-semibold">Company: </span>
                      {(profile as EmployerProfile).companyName}
                    </p>
                  )}
                  {(profile as EmployerProfile).industry && (
                    <p>
                      <span className="font-semibold">Industry: </span>
                      {(profile as EmployerProfile).industry}
                    </p>
                  )}
                  {(profile as EmployerProfile).companyLocation && (
                    <p>
                      <span className="font-semibold">Location: </span>
                      {(profile as EmployerProfile).companyLocation}
                    </p>
                  )}
                  {(profile as EmployerProfile).aboutCompany && (
                    <p className="mt-2 whitespace-pre-line">
                      <span className="font-semibold">About: </span>
                      {(profile as EmployerProfile).aboutCompany}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

