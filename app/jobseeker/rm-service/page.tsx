"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { JobSeekerSidebar } from "@/components/job-seeker-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserCheck, CheckCircle, Clock, Users, Star, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RMServicePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    jobRole: "",
    experience: "",
    preferredLocation: "",
    salaryExpectation: "",
    availability: "",
    additionalNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "RM Service Started!",
      description: "Your dedicated relationship manager will contact you within 24 hours.",
    })

    setIsDialogOpen(false)
    setIsSubmitting(false)
    setFormData({
      jobRole: "",
      experience: "",
      preferredLocation: "",
      salaryExpectation: "",
      availability: "",
      additionalNotes: "",
    })
    setTimeout(() => {
      router.push("/jobseeker/cart")
    }, 800)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const features = [
    {
      icon: Users,
      title: "Dedicated Manager",
      description: "A personal relationship manager assigned exclusively to you",
    },
    {
      icon: CheckCircle,
      title: "Job Applications",
      description: "We apply to relevant jobs on your behalf with personalized cover letters",
    },
    {
      icon: Clock,
      title: "Interview Scheduling",
      description: "We coordinate and schedule interviews that fit your availability",
    },
    {
      icon: Star,
      title: "Email Management",
      description: "Professional email responses to employers and follow-ups",
    },
  ]

  const process = [
    {
      step: 1,
      title: "Initial Consultation",
      description: "Discuss your career goals, preferences, and requirements",
    },
    {
      step: 2,
      title: "Profile Optimization",
      description: "Enhance your profile and resume for maximum impact",
    },
    {
      step: 3,
      title: "Job Search & Applications",
      description: "Active job searching and applications on your behalf",
    },
    {
      step: 4,
      title: "Interview Coordination",
      description: "Schedule and prepare you for interviews",
    },
    {
      step: 5,
      title: "Placement Support",
      description: "Support until you secure your ideal position",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <JobSeekerSidebar />

        <main className="flex-1 lg:ml-80 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Relationship Manager Service</h1>
                  <p className="text-gray-600">Get personalized support throughout your job search journey</p>
                </div>
              </div>
            </div>

            {/* Service Overview */}
            <Card className="mb-8 border-2 border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">What is RM Service?</CardTitle>
                <CardDescription className="text-lg">
                  A dedicated relationship manager who works as your personal career advocate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-gray-700 max-w-3xl mx-auto">
                    Our Relationship Manager (RM) Service provides you with a dedicated professional who handles your
                    entire job search process. From applying to jobs and scheduling interviews to managing email
                    communications with employers, your RM stays with you until you land your dream job.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gradient-bg text-white px-8 py-3 text-lg">
                        Start RM Service
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Start Your RM Service</DialogTitle>
                        <DialogDescription>
                          Tell us about your preferences and our RM will get started
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobRole">Preferred Job Role</Label>
                          <Input
                            id="jobRole"
                            value={formData.jobRole}
                            onChange={(e) => handleChange("jobRole", e.target.value)}
                            placeholder="e.g., Software Developer"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select
                            value={formData.experience}
                            onValueChange={(value) => handleChange("experience", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                              <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                              <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                              <SelectItem value="executive">Executive Level (10+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredLocation">Preferred Location</Label>
                          <Input
                            id="preferredLocation"
                            value={formData.preferredLocation}
                            onChange={(e) => handleChange("preferredLocation", e.target.value)}
                            placeholder="e.g., Dubai, Abu Dhabi"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="salaryExpectation">Salary Expectation (AED)</Label>
                          <Input
                            id="salaryExpectation"
                            value={formData.salaryExpectation}
                            onChange={(e) => handleChange("salaryExpectation", e.target.value)}
                            placeholder="e.g., 8000-12000"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          <Select
                            value={formData.availability}
                            onValueChange={(value) => handleChange("availability", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="When can you start?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="2weeks">2 weeks notice</SelectItem>
                              <SelectItem value="1month">1 month notice</SelectItem>
                              <SelectItem value="2months">2 months notice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additionalNotes">Additional Notes</Label>
                          <Textarea
                            id="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={(e) => handleChange("additionalNotes", e.target.value)}
                            placeholder="Any specific requirements or preferences..."
                            rows={3}
                          />
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full gradient-bg text-white">
                          {isSubmitting ? "Starting Service..." : "Start RM Service"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">What Your RM Does For You</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Process */}
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">How It Works</CardTitle>
                <CardDescription>Our proven 5-step process to get you hired</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {process.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Why Choose RM Service?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Save Time</h4>
                        <p className="text-sm text-gray-600">
                          Focus on your current job while we handle your job search
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Professional Representation</h4>
                        <p className="text-sm text-gray-600">Expert communication with employers on your behalf</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Higher Success Rate</h4>
                        <p className="text-sm text-gray-600">Proven track record of successful placements</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Personalized Approach</h4>
                        <p className="text-sm text-gray-600">Tailored strategy based on your unique profile</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">End-to-End Support</h4>
                        <p className="text-sm text-gray-600">From application to offer negotiation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Confidential Service</h4>
                        <p className="text-sm text-gray-600">Discreet job search while employed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
