"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MapPin, DollarSign, Calendar, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { EmployerProfileCompletionDialog } from "@/components/ui/employer-profile-completion-dialog"
import { useJobPosting } from "@/lib/features/jobPosting/useJobPosting"

export default function PostJobPage() {
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [profileCompletionResult, setProfileCompletionResult] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  
  // Redux state and actions
  const {
    formData,
    isSubmitting,
    isLoading,
    error,
    success,
    profileCompletion,
    canPostJob,
    missingFields,
    companyName,
    updateField,
    updateForm,
    reset,
    clearErrorMessage,
    setSuccessMessage,
    checkEligibility,
    submitJob
  } = useJobPosting()

  // Handle form field changes
  const handleChange = (field: keyof typeof formData, value: string) => {
    updateField(field, value)
  }

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Handle form submission
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
      // Check employer eligibility first
      const eligibilityResult = await checkEligibility()
      
      if (eligibilityResult.type === 'jobPosting/checkEmployerEligibility/rejected') {
        toast({
          title: "Profile Check Error",
          description: "Unable to check your company profile eligibility. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!canPostJob) {
        setProfileCompletionResult({
          percentage: profileCompletion,
          canPostJob: canPostJob,
          missingFields: missingFields,
          companyName: companyName
        })
        setShowProfileDialog(true)
        return
      }

      // Submit job posting
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

  // Handle profile completion dialog close
  const handleProfileDialogClose = () => {
    setShowProfileDialog(false)
    router.push('/employer/profile')
  }

  // Clear error when component mounts
  useEffect(() => {
    clearErrorMessage()
  }, [clearErrorMessage])

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
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Your company name"
                      className="h-11"
                      required
                    />
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary (AED) *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleChange("salaryMin", e.target.value)}
                      placeholder="8000"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary (AED) *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleChange("salaryMax", e.target.value)}
                      placeholder="15000"
                      className="h-11"
                      required
                    />
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    placeholder="e.g., React, Node.js, Project Management (comma-separated)"
                    className="h-11"
                  />
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
                disabled={isSubmitting || isLoading} 
                className="gradient-bg text-white px-12 py-3 text-lg h-12"
              >
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Completion Dialog */}
      <EmployerProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        completionPercentage={profileCompletionResult?.percentage || profileCompletion}
        canPostJob={profileCompletionResult?.canPostJob || canPostJob}
        missingFields={profileCompletionResult?.missingFields || missingFields}
        companyName={profileCompletionResult?.companyName || companyName}
        onCompleteProfile={handleProfileDialogClose}
      />
    </div>
  )
}