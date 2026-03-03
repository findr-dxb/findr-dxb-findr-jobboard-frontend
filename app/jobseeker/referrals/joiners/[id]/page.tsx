"use client"

import { useEffect, useCallback, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  Download,
  Video,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Star,
  CheckCircle,
  IdCard,
  Search,
  X,
  Building,
  SendHorizonal,
  DollarSign,
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://findr-jobboard-backend-production.up.railway.app/api/v1"
const JOBS_PER_PAGE = 8

interface JobseekerProfile {
  _id?: string
  fullName?: string
  name?: string
  email?: string
  phoneNumber?: string
  location?: string
  nationality?: string
  dateOfBirth?: string
  emirateId?: string
  passportNumber?: string
  employmentVisa?: string
  membershipTier?: string
  createdAt?: string
  profilePicture?: string
  professionalSummary?: string
  introVideo?: string
  resumeDocument?: string
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
    gradeCgpa?: string
  }>
  skills?: string[]
  certifications?: string[]
  jobPreferences?: {
    preferredJobType?: string[]
    salaryExpectation?: string
    preferredLocation?: string
    availability?: string
    resumeAndDocs?: string[]
  }
  socialLinks?: {
    linkedIn?: string
    instagram?: string
    twitterX?: string
  }
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
  website?: string
}

interface JoinerProfile {
  type: "jobseeker" | "employer"
  profile: JobseekerProfile | EmployerProfile
}

interface Job {
  _id: string
  title: string
  companyName: string
  location: string
  jobType?: string[]
  salary?: number | { min?: number; max?: number }
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="card-shadow border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-emerald-600">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatSalary(salary?: number | { min?: number; max?: number }): string {
  if (!salary) return "—"
  if (typeof salary === "number") {
    return `AED ${salary.toLocaleString()}`
  }
  const { min, max } = salary
  if (min && max) return `AED ${min.toLocaleString()} – ${max.toLocaleString()}`
  if (min) return `AED ${min.toLocaleString()}+`
  if (max) return `Up to AED ${max.toLocaleString()}`
  return "—"
}

function JobPickerModal({
  displayName,
  profile,
  onClose,
}: {
  displayName: string
  profile: JobseekerProfile
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [applying, setApplying] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchJobs = useCallback(async (searchQuery: string, pageNum: number) => {
    setSearching(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs/picker`, {
        params: { search: searchQuery, page: pageNum, limit: JOBS_PER_PAGE },
      })
      const d = res.data?.data
      setJobs(d?.jobs ?? [])
      setTotal(d?.pagination?.total ?? 0)
      setTotalPages(d?.pagination?.pages ?? 1)
    } catch {
      setJobs([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(query, page), 400)
    return () => clearTimeout(timer)
  }, [query, page, fetchJobs])

  const handleApply = async (job: Job) => {
    const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
    if (!token) return

    setApplying(job._id)
    try {
      const payload = {
        jobId: job._id,
        friendName: profile.fullName || profile.name || profile.email?.split("@")[0] || "",
        email: profile.email || "",
        phone: profile.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
        nationality: profile.nationality || "",
        currentCompany: profile.professionalExperience?.[0]?.company || "Not specified",
        expectedSalary: profile.jobPreferences?.salaryExpectation || "0",
        location: profile.location || "",
        education: profile.education?.[0]?.highestDegree || "",
        skills: (profile.skills || []).join(", "),
        certifications: (profile.certifications || []).join(", "),
        resumeUrl: profile.resumeDocument || profile.jobPreferences?.resumeAndDocs?.[0] || "",
      }

      await axios.post(`${API_BASE_URL}/applications/referral`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast({
        title: "Referral Submitted",
        description: `${displayName} has been referred for "${job.title}" at ${job.companyName}.`,
      })
      onClose()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit referral.",
        variant: "destructive",
      })
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-5xl max-h-[85vh] flex flex-col card-shadow border-0 rounded-2xl overflow-hidden">
        <CardHeader className="px-8 py-6 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <SendHorizonal className="w-5 h-5 text-emerald-600" />
                Refer <span className="text-emerald-600">{displayName}</span> for a Job
              </CardTitle>
              <CardDescription className="mt-2 text-gray-500">
                Search active jobs and click Refer to submit an instant referral.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </CardHeader>

        <div className="px-8 py-5 border-b bg-gray-50/50 shrink-0">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              className="pl-12 h-12 text-base rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Search by job title, company or location…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              autoFocus
            />
          </div>
        </div>

        <CardContent className="flex-1 overflow-hidden p-0 bg-white">
          {searching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
              <span className="text-gray-500 text-base">Searching jobs…</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs found</h3>
              <p className="text-gray-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-[450px]">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Job Title</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Company</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Location</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Salary</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell className="py-5 px-6">
                        <p className="font-medium text-sm text-gray-900 hover:text-emerald-600 transition-colors">{job.title}</p>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-700">{job.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        {job.location ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-600">{job.location}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        {job.jobType?.[0] ? (
                          <Badge className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
                            {job.jobType[0]}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <span className="text-sm text-gray-700">{formatSalary(job.salary)}</span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 rounded-lg flex items-center gap-1.5"
                          disabled={applying === job._id}
                          onClick={() => handleApply(job)}
                        >
                          {applying === job._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <SendHorizonal className="w-4 h-4" />
                              Refer
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {!searching && totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t bg-gray-50 shrink-0">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{(page - 1) * JOBS_PER_PAGE + 1}–{Math.min(page * JOBS_PER_PAGE, total)}</span> of{" "}
              <span className="font-semibold text-gray-800">{total}</span> jobs
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 px-4"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 min-w-[80px] text-center">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 px-4"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function ReferralJoinerProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<JoinerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showJobPicker, setShowJobPicker] = useState(false)

  useEffect(() => {
    if (!params?.id) return

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await axios.get(`${API_BASE_URL}/referrals/joiners/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data?.success) {
          setData(response.data.data)
        } else {
          throw new Error(response.data?.message || "Failed to load profile")
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to load profile"
        setError(msg)
        toast({ title: "Error", description: msg, variant: "destructive" })
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
          <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
            <p className="text-gray-600">Loading profile…</p>
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
          <div className="max-w-4xl mx-auto space-y-4">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">{error || "Profile not found or access denied."}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const { type, profile } = data
  const isJobseeker = type === "jobseeker"
  const js = profile as JobseekerProfile
  const emp = profile as EmployerProfile

  const displayName = js.fullName || js.name || emp.companyName || "User"
  const joinedAt = (profile as any).createdAt

  const resumeUrls: string[] = []
  if (js.resumeDocument) resumeUrls.push(js.resumeDocument)
  js.jobPreferences?.resumeAndDocs?.forEach((url) => {
    if (url && !resumeUrls.includes(url)) resumeUrls.push(url)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {showJobPicker && isJobseeker && (
        <JobPickerModal displayName={displayName} profile={js} onClose={() => setShowJobPicker(false)} />
      )}

      <main className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Network Member Profile</h1>
              <p className="text-gray-600 text-sm">Full read-only profile view.</p>
            </div>
            <Link href="/jobseeker/referrals/joiners">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Network
              </Button>
            </Link>
          </div>

          <Card className="card-shadow border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-200">
                  {js.profilePicture ? (
                    <img src={js.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                    <Badge className={isJobseeker ? "bg-blue-100 text-blue-800 text-xs" : "bg-purple-100 text-purple-800 text-xs"}>
                      {isJobseeker ? "Jobseeker" : "Employer"}
                    </Badge>
                    {profile.membershipTier && (
                      <Badge className="bg-amber-100 text-amber-800 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {profile.membershipTier} Tier
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {profile.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {profile.email}
                      </span>
                    )}
                    {js.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {js.phoneNumber}
                      </span>
                    )}
                    {js.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {js.location}
                      </span>
                    )}
                    {joinedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(joinedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isJobseeker && (
            <>
              {js.professionalSummary && (
                <Section icon={<Briefcase className="w-4 h-4" />} title="Professional Summary">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{js.professionalSummary}</p>
                </Section>
              )}

              <Section icon={<User className="w-4 h-4" />} title="Personal Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Nationality" value={js.nationality} />
                  <InfoRow
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label="Date of Birth"
                    value={js.dateOfBirth ? new Date(js.dateOfBirth).toLocaleDateString() : undefined}
                  />
                  <InfoRow icon={<IdCard className="w-3.5 h-3.5" />} label="Emirate ID" value={js.emirateId} />
                  <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Passport No." value={js.passportNumber} />
                  <InfoRow icon={<CheckCircle className="w-3.5 h-3.5" />} label="Employment Visa" value={js.employmentVisa} />
                  <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Preferred Location" value={js.jobPreferences?.preferredLocation} />
                  <InfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Availability" value={js.jobPreferences?.availability} />
                  <InfoRow icon={<Award className="w-3.5 h-3.5" />} label="Salary Expectation" value={js.jobPreferences?.salaryExpectation} />
                </div>
                {js.jobPreferences?.preferredJobType && js.jobPreferences.preferredJobType.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Preferred Job Types</p>
                    <div className="flex flex-wrap gap-2">
                      {js.jobPreferences.preferredJobType.map((jt, i) => (
                        <Badge key={i} variant="outline" className="text-xs capitalize">{jt}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section icon={<Briefcase className="w-4 h-4" />} title="Experience">
                  {js.professionalExperience && js.professionalExperience.length > 0 ? (
                    <div className="space-y-4">
                      {js.professionalExperience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-emerald-200 pl-3">
                          {exp.currentRole && <p className="text-sm font-semibold text-gray-900">{exp.currentRole}</p>}
                          {exp.company && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {exp.company}
                              {typeof exp.yearsOfExperience === "number" && exp.yearsOfExperience > 0
                                ? ` · ${exp.yearsOfExperience} yr${exp.yearsOfExperience !== 1 ? "s" : ""}`
                                : ""}
                            </p>
                          )}
                          {exp.industry && <p className="text-xs text-gray-400 mt-0.5">{exp.industry}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No experience information available.</p>
                  )}
                </Section>

                <Section icon={<GraduationCap className="w-4 h-4" />} title="Education">
                  {js.education && js.education.length > 0 ? (
                    <div className="space-y-4">
                      {js.education.map((edu, i) => (
                        <div key={i} className="border-l-2 border-blue-200 pl-3">
                          {edu.highestDegree && <p className="text-sm font-semibold text-gray-900">{edu.highestDegree}</p>}
                          {edu.institution && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {edu.institution}
                              {edu.yearOfGraduation ? ` · ${edu.yearOfGraduation}` : ""}
                            </p>
                          )}
                          {edu.gradeCgpa && <p className="text-xs text-gray-400 mt-0.5">Grade / CGPA: {edu.gradeCgpa}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No education information available.</p>
                  )}
                </Section>
              </div>

              {js.skills && js.skills.length > 0 && (
                <Section icon={<CheckCircle className="w-4 h-4" />} title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {js.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              {js.certifications && js.certifications.length > 0 && (
                <Section icon={<Award className="w-4 h-4" />} title="Certifications">
                  <ul className="space-y-1">
                    {js.certifications.map((cert, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {resumeUrls.length > 0 && (
                <Section icon={<FileText className="w-4 h-4" />} title="CV & Documents">
                  <div className="space-y-2">
                    {resumeUrls.map((url, i) => {
                      const fileName = url.split("/").pop()?.split("?")[0] || `Document ${i + 1}`
                      return (
                        <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{fileName}</span>
                          </div>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs shrink-0">
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </Section>
              )}

              {js.introVideo && (
                <Section icon={<Video className="w-4 h-4" />} title="Intro Video">
                  <a href={js.introVideo} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4 text-emerald-600" />
                      Watch Intro Video
                    </Button>
                  </a>
                </Section>
              )}

              {(js.socialLinks?.linkedIn || js.socialLinks?.instagram || js.socialLinks?.twitterX) && (
                <Section icon={<Globe className="w-4 h-4" />} title="Social Links">
                  <div className="flex flex-wrap gap-3">
                    {js.socialLinks?.linkedIn && (
                      <a href={js.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
                          <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {js.socialLinks?.instagram && (
                      <a href={js.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
                          <Instagram className="w-3.5 h-3.5 text-pink-500" />
                          Instagram
                        </Button>
                      </a>
                    )}
                    {js.socialLinks?.twitterX && (
                      <a href={js.socialLinks.twitterX} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
                          <Twitter className="w-3.5 h-3.5 text-sky-500" />
                          Twitter / X
                        </Button>
                      </a>
                    )}
                  </div>
                </Section>
              )}
            </>
          )}

          {!isJobseeker && (
            <Section icon={<Briefcase className="w-4 h-4" />} title="Company Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <InfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Company" value={emp.companyName} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Industry" value={emp.industry} />
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={emp.companyLocation} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={emp.phoneNumber} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={emp.website} />
              </div>
              {emp.aboutCompany && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">About</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{emp.aboutCompany}</p>
                </div>
              )}
            </Section>
          )}

          {isJobseeker && (
            <Card className="card-shadow border-0 bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-900">Refer {displayName} for a Job</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Pick any active job and apply on their behalf instantly — no form to fill.
                  </p>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 flex items-center gap-2"
                  onClick={() => setShowJobPicker(true)}
                >
                  <Briefcase className="w-4 h-4" />
                  Refer for a Job
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
