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

export default function PostJobPageRedux() {
  const [showProfileDialog, setShowProfileDialog] = useState(false)
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
            <p className="text-gray-600">Fill out the form below to create a new job posting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Job Information
                </CardTitle>
                <CardDescription>
                  Basic details about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="e.g., Tech Solutions Inc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., Dubai, UAE"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => handleChange('jobType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Salary Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Salary Information
                </CardTitle>
                <CardDescription>
                  Compensation details for the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary (AED)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleChange('salaryMin', e.target.value)}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary (AED)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleChange('salaryMax', e.target.value)}
                      placeholder="e.g., 15000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level *</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Manager (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-600" />
                  Job Description & Requirements
                </CardTitle>
                <CardDescription>
                  Detailed information about the role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="List the key requirements, qualifications, and skills needed (one per line)..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    placeholder="e.g., React, Node.js, Python, SQL (comma separated)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application Deadline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  When should applications close?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Completion Dialog */}
      <EmployerProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        profileCompletion={profileCompletion}
        missingFields={missingFields}
        companyName={companyName}
        onComplete={handleProfileDialogClose}
      />
    </div>
  )
}
