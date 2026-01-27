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
import { FileText, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Education {
  degree: string
  institution: string
  year: string
  grade: string
}

interface Experience {
  position: string
  company: string
  duration: string
  description: string
}

export default function ResumeBuilderPage() {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  })

  const [education, setEducation] = useState<Education[]>([{ degree: "", institution: "", year: "", grade: "" }])

  const [experience, setExperience] = useState<Experience[]>([
    { position: "", company: "", duration: "", description: "" },
  ])

  const [skills, setSkills] = useState("")
  const [careerGoals, setCareerGoals] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", year: "", grade: "" }])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    setEducation(updated)
  }

  const addExperience = () => {
    setExperience([...experience, { position: "", company: "", duration: "", description: "" }])
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    setExperience(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Resume Submitted Successfully!",
      description: "Your professional resume will be shared via email within 24 hours.",
    })

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <JobSeekerSidebar />

        <main className="flex-1 lg:ml-80 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Resume Builder</h1>
                  <p className="text-gray-600">Create a professional resume that stands out</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic details about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        placeholder="City, Country"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                      placeholder="Brief summary of your professional background and goals"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>Your educational background</CardDescription>
                    </div>
                    <Button type="button" onClick={addEducation} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        {education.length > 1 && (
                          <Button type="button" onClick={() => removeEducation(index)} variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree/Qualification</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="e.g., Bachelor of Engineering"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                            placeholder="University/College name"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Year of Completion</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, "year", e.target.value)}
                            placeholder="e.g., 2020"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grade/CGPA</Label>
                          <Input
                            value={edu.grade}
                            onChange={(e) => updateEducation(index, "grade", e.target.value)}
                            placeholder="e.g., 3.8/4.0 or First Class"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Work Experience</CardTitle>
                      <CardDescription>Your professional experience</CardDescription>
                    </div>
                    <Button type="button" onClick={addExperience} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        {experience.length > 1 && (
                          <Button type="button" onClick={() => removeExperience(index)} variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Position/Role</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => updateExperience(index, "position", e.target.value)}
                            placeholder="e.g., Software Developer"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            placeholder="Company name"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, "duration", e.target.value)}
                          placeholder="e.g., Jan 2020 - Present"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Job Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
                          placeholder="Describe your responsibilities and achievements"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>List your technical and soft skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Textarea
                      id="skills"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g., JavaScript, React, Project Management, Communication"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Career Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                  <CardDescription>What are you looking for in your next role?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="careerGoals">Career Objectives</Label>
                    <Textarea
                      id="careerGoals"
                      value={careerGoals}
                      onChange={(e) => setCareerGoals(e.target.value)}
                      placeholder="Describe your career aspirations and what you're looking for"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting} className="gradient-bg text-white px-8 py-3 text-lg">
                  {isSubmitting ? "Building Resume..." : "Build My Resume"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
