"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Briefcase,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  PlusCircle,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useJobPosting } from "@/lib/features/jobPosting/useJobPosting"
import { useAppDispatch } from "@/lib/hooks"
import { updateFormField, checkEmployerEligibility } from "@/lib/features/jobPosting/jobPostingSlice"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://findr-jobboard-backend-production.up.railway.app/api/v1"

const SUGGESTED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Vue.js",
  "Angular",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "Go",
  "Ruby",
  "PHP",
  "Laravel",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Git",
  "REST API",
  "GraphQL",
  "UI/UX",
  "Figma",
  "Adobe Photoshop",
  "Project Management",
  "Agile",
  "Scrum",
  "Communication",
  "Sales",
  "Marketing",
  "Data Analysis",
  "Excel",
  "Microsoft Word",
  "Power BI",
  "Tableau",
  "Machine Learning",
  "Deep Learning",
  "SAP",
  "Salesforce",
  "Customer Service",
  "Negotiation",
  "Leadership",
  "Accounting",
  "HR",
] as const

function parseSkillsCsv(csv: string): string[] {
  return csv
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function mergeSkillsUnique(existing: string[], additions: string[]): string[] {
  const lower = new Set(existing.map((s) => s.toLowerCase()))
  const out = [...existing]
  for (const a of additions) {
    const t = a.trim()
    if (!t) continue
    const lk = t.toLowerCase()
    if (!lower.has(lk)) {
      lower.add(lk)
      out.push(t)
    }
  }
  return out
}

export default function PostJobPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [isLoadingCompany, setIsLoadingCompany] = useState(true)
  const [companyFetchFailed, setCompanyFetchFailed] = useState(false)
  const [isEligibilityChecked, setIsEligibilityChecked] = useState(false)
  /** Naukri-style skills: current typing in the single input (comma-separated stored in formData.skills). */
  const [skillDraft, setSkillDraft] = useState("")
  const [skillsSuggestionsOpen, setSkillsSuggestionsOpen] = useState(false)
  const skillsComboRef = useRef<HTMLDivElement>(null)

  // Redux state and actions
  const dispatch = useAppDispatch()
  const {
    formData,
    isSubmitting,
    error,
    updateField,
    reset,
    clearErrorMessage,
    submitJob
  } = useJobPosting()

  // Handle form field changes
  const handleChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value)
  }

  const skillsParsed = useMemo(
    () => parseSkillsCsv(formData.skills),
    [formData.skills]
  )

  const filteredSkillSuggestions = useMemo(() => {
    const q = skillDraft.trim().toLowerCase()
    return SUGGESTED_SKILLS.filter(
      (s) =>
        !skillsParsed.some((x) => x.toLowerCase() === s.toLowerCase()) &&
        (!q || s.toLowerCase().includes(q))
    )
  }, [skillDraft, skillsParsed])

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        skillsComboRef.current &&
        !skillsComboRef.current.contains(e.target as Node)
      ) {
        setSkillsSuggestionsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  const addSkillToken = (token: string) => {
    const t = token.trim()
    if (!t) return
    handleChange("skills", mergeSkillsUnique(skillsParsed, [t]).join(", "))
    setSkillDraft("")
  }

  const removeSkillAt = (index: number) => {
    const next = skillsParsed.filter((_, i) => i !== index)
    handleChange("skills", next.join(", "))
  }

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Handle form submission (validation moved to Navbar "Post a Job" link)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate deadline is not in the past
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
      deadlineDate.setHours(0, 0, 0, 0)
      
      if (deadlineDate < today) {
        toast({
          title: "Invalid Deadline",
          description: "Application deadline cannot be in the past. Please select a future date.",
          variant: "destructive",
        })
        return
      }
    }
    
    try {
      const submitResult = await submitJob()
      
      if (submitResult.type === 'jobPosting/submitJobPosting/fulfilled') {
        toast({
          title: "Job Posted Successfully!",
          description: "Your job posting is now live and visible to job seekers.",
        })
        reset()
        router.push('/employer/dashboard')
      } else {
        toast({
          title: "Error",
          description: error || "Failed to post job. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch employer details and auto-fill company name
  useEffect(() => {
    const fetchEmployerDetails = async () => {
      const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
      if (!token) {
        setIsLoadingCompany(false)
        return
      }
      try {
        setIsLoadingCompany(true)
        setCompanyFetchFailed(false)
        const res = await axios.get(`${API_BASE_URL}/employer/details`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const companyName = res.data?.data?.companyName
        if (companyName) {
          dispatch(updateFormField({ field: "company", value: companyName }))
        }
      } catch {
        setCompanyFetchFailed(true)
        toast({
          title: "Could not load company",
          description: "Unable to fetch your company name. Please complete your profile or try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCompany(false)
      }
    }
    fetchEmployerDetails()
  }, [dispatch, toast])

  // Guard: check eligibility when accessing via direct URL
  useEffect(() => {
    if (isAuthLoading) return
    if (user?.type !== "employer") {
      router.replace("/login?type=employer")
      return
    }
    const verifyEligibility = async () => {
      const result = await dispatch(checkEmployerEligibility())
      if (checkEmployerEligibility.fulfilled.match(result)) {
        if (!result.payload.canPostJob) {
          toast({
            title: "Complete your profile",
            description: "You need to complete your company profile before posting jobs.",
            variant: "destructive",
          })
          router.replace("/employer/profile")
        } else {
          setIsEligibilityChecked(true)
        }
      } else {
        toast({
          title: "Unable to verify",
          description: "Could not verify your eligibility. Please try again.",
          variant: "destructive",
        })
        router.replace("/employer/dashboard")
      }
    }
    verifyEligibility()
  }, [user?.type, isAuthLoading, dispatch, router, toast])

  // Clear error when component mounts
  useEffect(() => {
    clearErrorMessage()
  }, [clearErrorMessage])

  if (!isEligibilityChecked || isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center card-shadow">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Post a Job</h1>
                <p className="text-gray-600 text-lg">Create a new job posting to attract top talent</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-emerald-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <div className="relative">
                      {isLoadingCompany && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      <Input
                        id="company"
                        value={isLoadingCompany ? "" : formData.company}
                        readOnly={!companyFetchFailed}
                        aria-readonly={!companyFetchFailed}
                        onChange={companyFetchFailed ? (e) => handleChange("company", e.target.value) : undefined}
                        placeholder={isLoadingCompany ? "Loading company..." : "Your company name"}
                        className={companyFetchFailed ? "h-11 border-amber-200" : "h-11 bg-gray-50"}
                        required
                      />
                    </div>
                    {companyFetchFailed && (
                      <p className="text-xs text-amber-600 mt-1">
                        Company name could not be loaded. Enter it manually or complete your profile.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="Dubai, UAE"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select value={formData.jobType} onValueChange={(value) => handleChange("jobType", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleChange("experience", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="lead">Lead/Manager (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-emerald-600" />
                  Compensation
                </CardTitle>
                <CardDescription>Salary range and benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (AED) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", e.target.value)}
                    placeholder="e.g., 12000"
                    className="h-11"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Detailed description and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                    placeholder="List the required qualifications, experience, and skills..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2 relative z-20">
                  <Label htmlFor="skills-combo-input">Required Skills</Label>
                  <div
                    ref={skillsComboRef}
                    className="rounded-md border border-input bg-background"
                  >
                    {skillsParsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 border-b border-border">
                        {skillsParsed.map((s, i) => (
                          <Badge
                            key={`${s}-${i}`}
                            variant="secondary"
                            className="pl-2 pr-1 py-0.5 gap-1 font-normal"
                          >
                            {s}
                            <button
                              type="button"
                              className="rounded-full p-0.5 hover:bg-muted"
                              onClick={() => removeSkillAt(i)}
                              aria-label={`Remove ${s}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="relative isolate">
                      <Input
                        id="skills-combo-input"
                        autoComplete="off"
                        value={skillDraft}
                        onChange={(e) => {
                          setSkillDraft(e.target.value)
                          setSkillsSuggestionsOpen(true)
                        }}
                        onFocus={() => setSkillsSuggestionsOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addSkillToken(skillDraft)
                            setSkillsSuggestionsOpen(false)
                            return
                          }
                          if (e.key === ",") {
                            e.preventDefault()
                            addSkillToken(skillDraft)
                            return
                          }
                          if (
                            e.key === "Backspace" &&
                            !skillDraft &&
                            skillsParsed.length > 0
                          ) {
                            removeSkillAt(skillsParsed.length - 1)
                          }
                        }}
                        placeholder="Type a skill, pick from suggestions, or press Enter to add"
                        className={cn(
                          "h-11 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                          skillsParsed.length > 0
                            ? "rounded-none rounded-b-md"
                            : "rounded-md"
                        )}
                      />
                      {skillsSuggestionsOpen &&
                        (filteredSkillSuggestions.length > 0 ||
                          skillDraft.trim().length > 0) && (
                          <ul
                            className="absolute left-0 right-0 top-full z-[200] mt-0.5 max-h-52 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5"
                            role="listbox"
                          >
                            {filteredSkillSuggestions.map((s) => (
                              <li key={s} role="option">
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                  onMouseDown={(ev) => ev.preventDefault()}
                                  onClick={() => {
                                    addSkillToken(s)
                                    setSkillsSuggestionsOpen(false)
                                  }}
                                >
                                  {s}
                                </button>
                              </li>
                            ))}
                            {filteredSkillSuggestions.length === 0 &&
                              skillDraft.trim().length > 0 && (
                                <li className="px-3 py-2 text-sm text-muted-foreground">
                                  No suggestion match — press{" "}
                                  <kbd className="px-1 rounded border bg-muted text-[10px]">
                                    Enter
                                  </kbd>{" "}
                                  to add &quot;{skillDraft.trim()}&quot;
                                </li>
                              )}
                          </ul>
                        )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    One field: suggestions open as you type; click a row or press Enter / comma to add.
                    If nothing matches, Enter still adds what you typed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="h-11 pl-10"
                      min={getTodayDate()}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50 card-shadow border-0">
                <CardContent className="pt-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting} 
                className="gradient-bg text-white px-12 py-3 text-lg h-12"
              >
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}