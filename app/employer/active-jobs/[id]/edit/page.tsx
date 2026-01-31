"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, MapPin, DollarSign, Calendar, Briefcase, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"

export default function EditJobPage() {
  const params = useParams()
  const jobId = params.id as string
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    jobType: "",
    salary: "",
    experience: "",
    skills: "",
    description: "",
    requirements: "",
    deadline: "",
    status: "active"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to edit jobs.",
            variant: "destructive",
          })
          router.push('/login/employer')
          return
        }

        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        const job = response.data.data
        // Handle salary: if min/max exists, use min (or average if both exist), otherwise use single value
        let salaryValue = ""
        if (job.salary) {
          if (job.salary.min && job.salary.max) {
            // If both min and max exist, use min (or you could use average: (min + max) / 2)
            salaryValue = job.salary.min.toString()
          } else if (job.salary.min) {
            salaryValue = job.salary.min.toString()
          } else if (job.salary.max) {
            salaryValue = job.salary.max.toString()
          } else if (job.salary.amount) {
            salaryValue = job.salary.amount.toString()
          } else if (typeof job.salary === 'number') {
            salaryValue = job.salary.toString()
          }
        }
        setFormData({
          jobTitle: job.title || "",
          company: job.companyName || "",
          location: job.location || "",
          jobType: job.jobType?.[0] || "",
          salary: salaryValue,
          experience: job.experienceLevel || "",
          skills: job.skills?.join(", ") || "",
          description: job.description || "",
          requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : job.requirements || "",
          deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
          status: job.status || "active"
        })
      } catch (error) {
        console.error('Error fetching job:', error)
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        })
        router.push('/employer/active-jobs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to update the job.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const salaryAmount = parseFloat(formData.salary) || 0
      const response = await axios.put(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, {
        title: formData.jobTitle,
        companyName: formData.company,
        location: formData.location,
        jobType: [formData.jobType],
        salary: {
          min: salaryAmount,
          max: salaryAmount,
        },
        experienceLevel: formData.experience,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        description: formData.description,
        requirements: formData.requirements.split('\n').map(req => req.trim()).filter(req => req),
        applicationDeadline: formData.deadline,
        status: formData.status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      toast({
        title: "Job Updated Successfully!",
        description: "Your job posting has been updated.",
      })

      router.push('/employer/active-jobs')
    } catch (error) {
      console.error('Error updating job:', error)
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update job. Please try again.'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
            <Button
              variant="ghost"
              onClick={() => router.push('/employer/active-jobs')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center card-shadow">
                <Edit2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Job</h1>
                <p className="text-gray-600 text-lg">Update your job posting details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
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
                        <SelectItem value="executive">Executive Level (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Job Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
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
                    placeholder="List the required qualifications, experience, and skills (one per line)..."
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
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/employer/active-jobs')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gradient-bg text-white px-12 py-3 text-lg h-12">
                {isSubmitting ? "Updating Job..." : "Update Job"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

