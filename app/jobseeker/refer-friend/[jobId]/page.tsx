"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle, User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, Settings, FileText, Award } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { FileUpload } from "@/components/file-upload"
import { normalizeUAE } from "@/lib/utils"

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string[];
  salary: {
    min: number;
    max: number;
  };
  requirements: string[];
  skills: string[];
  description: string;
  experienceLevel: string;
  applicationDeadline: string;
}

interface ReferralForm {
  // Personal Information
  friendName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  
  // Professional Experience
  currentCompany: string
  expectedSalary: string
  location: string
  
  // Education
  education: string
  
  // Skills & Certifications
  skills: string
  certifications: string
  
  // Resume
  cvFile: File | null
  resumeUrl: string
}

export default function ReferFriendPage({ params }: { params: Promise<{ jobId: string }> }) {
  const [formData, setFormData] = useState<ReferralForm>({
    friendName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    currentCompany: "",
    expectedSalary: "",
    location: "",
    education: "",
    skills: "",
    certifications: "",
    cvFile: null,
    resumeUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [matchResult, setMatchResult] = useState<{ success: boolean; message: string } | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isViewMode, setIsViewMode] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle async params and fetch job data
  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const resolvedParams = await params
        const id = resolvedParams.jobId
        setJobId(id)
        
        // Fetch job data from API
        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${id}`)
        if (response.data && response.data.data) {
          setJob(response.data.data)
        } else {
          console.error('Job not found')
          setJob(null)
        }
      } catch (error) {
        console.error('Error loading job details:', error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }
    
    getJobDetails()
  }, [params])

  // Handle view mode - fetch application data if viewing
  useEffect(() => {
    const viewParam = searchParams?.get('view')
    const applicationId = searchParams?.get('applicationId')
    
    if (viewParam === 'true' && applicationId) {
      setIsViewMode(true)
      const fetchApplicationData = async () => {
        try {
          const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
          const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${applicationId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.data && response.data.data) {
            const appData = response.data.data
            const applicant = appData.applicantDetails || appData.applicantId
            
            // Extract nationality - check multiple possible paths
            const nationalityValue = (applicant?.nationality || appData.nationality || "").toString().trim()
            
            // Map nationality to match Select options (case-insensitive)
            const nationalityMap: Record<string, string> = {
              'uae': 'UAE',
              'united arab emirates': 'UAE',
              'india': 'India',
              'pakistan': 'Pakistan',
              'philippines': 'Philippines',
              'egypt': 'Egypt',
              'jordan': 'Jordan',
              'lebanon': 'Lebanon',
              'syria': 'Syria',
            }
            const nationalityLower = nationalityValue?.toLowerCase().trim() || ""
            let mappedNationality = nationalityMap[nationalityLower] || ""
            // If not found in map but value exists, check if it's already a valid option
            if (!mappedNationality && nationalityValue) {
              const validOptions = ['UAE', 'India', 'Pakistan', 'Philippines', 'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Other']
              mappedNationality = validOptions.includes(nationalityValue) ? nationalityValue : 'Other'
            }
            
            // Extract education - check multiple possible paths and formats
            const educationValue = (applicant?.education?.[0]?.highestDegree || 
                                  applicant?.education?.[0]?.degree || 
                                  applicant?.education?.[0]?.qualification ||
                                  "").toString().trim()
            
            // Map education to match Select options (case-insensitive)
            const educationMap: Record<string, string> = {
              'high school': 'High School',
              'diploma': 'Diploma',
              "bachelor's": "Bachelor's",
              "bachelor's degree": "Bachelor's",
              'bachelor': "Bachelor's",
              'bachelors': "Bachelor's",
              'b.tech': "Bachelor's",
              'b.tech.': "Bachelor's",
              'btech': "Bachelor's",
              'b.e.': "Bachelor's",
              'b.e': "Bachelor's",
              'be': "Bachelor's",
              'b.sc': "Bachelor's",
              'b.sc.': "Bachelor's",
              'bsc': "Bachelor's",
              'b.com': "Bachelor's",
              'b.com.': "Bachelor's",
              'bcom': "Bachelor's",
              'b.a.': "Bachelor's",
              'b.a': "Bachelor's",
              'ba': "Bachelor's",
              'b.s.': "Bachelor's",
              'b.s': "Bachelor's",
              'bs': "Bachelor's",
              'bachelor of technology': "Bachelor's",
              'bachelor of tech': "Bachelor's",
              'bachelor in technology': "Bachelor's",
              'bachelor in tech': "Bachelor's",
              'bachelor of engineering': "Bachelor's",
              'bachelor of science': "Bachelor's",
              'bachelor of commerce': "Bachelor's",
              'bachelor of arts': "Bachelor's",
              "master's": "Master's",
              "master's degree": "Master's",
              'master': "Master's",
              'masters': "Master's",
              'm.tech': "Master's",
              'm.tech.': "Master's",
              'mtech': "Master's",
              'm.e.': "Master's",
              'm.e': "Master's",
              'me': "Master's",
              'm.sc': "Master's",
              'm.sc.': "Master's",
              'msc': "Master's",
              'm.com': "Master's",
              'm.com.': "Master's",
              'mcom': "Master's",
              'm.a.': "Master's",
              'm.a': "Master's",
              'ma': "Master's",
              'm.s.': "Master's",
              'm.s': "Master's",
              'ms': "Master's",
              'master of technology': "Master's",
              'master of engineering': "Master's",
              'master of science': "Master's",
              'phd': 'PhD',
              'ph.d': 'PhD',
              'ph.d.': 'PhD',
              'doctorate': 'PhD',
            }
            const educationLower = educationValue?.toLowerCase().trim() || ""
            let mappedEducation = educationMap[educationLower] || ""
            
            // If not found by exact match, try partial matching
            if (!mappedEducation && educationValue) {
              const educationLowerForMatch = educationLower
              // Check for bachelor's degree variations
              if (educationLowerForMatch.includes('bachelor') || 
                  educationLowerForMatch.includes('b.tech') || 
                  educationLowerForMatch.includes('btech') ||
                  educationLowerForMatch.includes('b.e') ||
                  educationLowerForMatch.includes('be') ||
                  educationLowerForMatch.includes('b.sc') ||
                  educationLowerForMatch.includes('bsc') ||
                  educationLowerForMatch.includes('b.com') ||
                  educationLowerForMatch.includes('bcom') ||
                  educationLowerForMatch.includes('b.a') ||
                  educationLowerForMatch.includes('ba') ||
                  (educationLowerForMatch.includes('technology') && educationLowerForMatch.includes('bachelor'))) {
                mappedEducation = "Bachelor's"
              }
              // Check for master's degree variations
              else if (educationLowerForMatch.includes('master') || 
                       educationLowerForMatch.includes('m.tech') || 
                       educationLowerForMatch.includes('mtech') ||
                       educationLowerForMatch.includes('m.e') ||
                       educationLowerForMatch.includes('me') ||
                       educationLowerForMatch.includes('m.sc') ||
                       educationLowerForMatch.includes('msc')) {
                mappedEducation = "Master's"
              }
              // Check for PhD variations
              else if (educationLowerForMatch.includes('phd') || 
                       educationLowerForMatch.includes('ph.d') ||
                       educationLowerForMatch.includes('doctorate')) {
                mappedEducation = "PhD"
              }
              // Check if it's already a valid option
              else {
                const validOptions = ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other']
                mappedEducation = validOptions.includes(educationValue) ? educationValue : educationValue
              }
            }
            
            console.log('Application data mapping:', {
              rawNationality: nationalityValue,
              mappedNationality,
              rawEducation: educationValue,
              mappedEducation,
              applicantData: applicant,
              fullAppData: appData
            })
            
            // Pre-fill form with application data
            setFormData({
              friendName: applicant?.fullName || applicant?.name || "",
              email: applicant?.email || "",
              phone: applicant?.phoneNumber || "",
              dateOfBirth: applicant?.dateOfBirth ? new Date(applicant.dateOfBirth).toISOString().split('T')[0] : "",
              nationality: mappedNationality,
              currentCompany: applicant?.professionalExperience?.[0]?.company || "",
              expectedSalary: appData.expectedSalary?.min ? appData.expectedSalary.min.toString() : (typeof appData.expectedSalary === 'string' ? appData.expectedSalary : ""),
              location: applicant?.location || "",
              education: mappedEducation,
              skills: applicant?.skills?.join(', ') || "",
              certifications: applicant?.certifications?.join(', ') || "",
              cvFile: null,
              resumeUrl: applicant?.resumeDocument || appData.resume || "",
            })
          }
        } catch (error) {
          console.error('Error fetching application data:', error)
          toast({
            title: "Error",
            description: "Failed to load referral details",
            variant: "destructive"
          })
        }
      }
      fetchApplicationData()
    }
  }, [searchParams, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading job details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Job Not Found</h1>
              <p className="text-gray-600 mb-4">The job you're trying to refer for doesn't exist.</p>
              <Button onClick={() => router.push("/jobseeker/search")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof ReferralForm, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const validateForm = (): boolean => {
    const requiredFields = ['friendName', 'email', 'phone', 'currentCompany', 'expectedSalary', 'dateOfBirth', 'location', 'nationality', 'skills']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof ReferralForm]) {
        toast({
          title: "Missing required field",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          variant: "destructive",
        })
        return false
      }
    }

    if (!formData.resumeUrl) {
      toast({
        title: "Resume Required",
        description: "Please upload your friend's resume.",
        variant: "destructive",
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    // Phone number validation - UAE phone numbers only
    const normalizedPhone = normalizeUAE(formData.phone)
    if (!normalizedPhone) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid UAE mobile number. Formats: +971 50 123 4567 or 050 123 4567",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Mock AI matching logic
  const performAIMatching = (): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI matching based on job requirements and form data
        const matchScore = Math.random() * 100 // 0-100
        
        if (matchScore >= 80) {
          resolve({
            success: true,
            message: "Your friend's profile is a strong match for this role. We'll notify you when there's an update."
          })
        } else {
          resolve({
            success: false,
            message: "Your friend's profile didn't meet the job requirements. Try referring for a different opportunity."
          })
        }
      }, 2000) // Simulate processing time
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to refer a friend.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Normalize phone number before submission
      const normalizedPhone = normalizeUAE(formData.phone)
      if (!normalizedPhone) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid UAE mobile number. Formats: +971 50 123 4567 or 050 123 4567",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Submit referral application to backend
      const response = await axios.post('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/referral', {
        jobId,
        friendName: formData.friendName,
        email: formData.email,
        phone: normalizedPhone,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        currentCompany: formData.currentCompany,
        expectedSalary: formData.expectedSalary,
        location: formData.location,
        education: formData.education,
        skills: formData.skills,
        certifications: formData.certifications,
        resumeUrl: formData.resumeUrl
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        setMatchResult({
          success: true,
          message: "Your friend's application has been submitted successfully! They can now login with their email to track the application status."
        })
        setShowResult(true)
        
        toast({
          title: "Referral Submitted",
          description: "Your friend's application has been created successfully.",
        })
      }
      
    } catch (error: any) {
      console.error('Referral submission error:', error)
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResult && matchResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="card-shadow border-0">
            <CardContent className="p-8 text-center">
              {matchResult.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              
              <h1 className="text-2xl font-bold mb-4">
                {matchResult.success ? "🎉 Referral Submitted Successfully!" : "😔 Not a Match This Time"}
              </h1>
              
              <p className="text-gray-600 mb-6">{matchResult.message}</p>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/jobseeker/search")}>
                  Browse More Jobs
                </Button>
                <Button variant="outline" onClick={() => setShowResult(false)}>
                  Refer Another Friend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
            <Link href="/jobseeker/search" className="hover:underline">Jobs</Link>
            <span>➔</span>
            <Link href={`/jobseeker/search/${jobId}`} className="hover:underline">{job.title}</Link>
            <span>➔</span>
            <span className="text-gray-700 font-medium">Refer Friend</span>
          </nav>

          {/* Job Info Card */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-blue-900 mb-2">
                    {isViewMode ? "View Referral Details" : "Refer a Friend for: "}{!isViewMode && job.title}
                  </h1>
                  <p className="text-blue-700">{job.companyName} • {job.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {job.jobType?.join(', ') || 'Full-time'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      AED {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                      {job.experienceLevel}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">Referral Bonus Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Information */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic details about your friend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="friendName">Friend's Full Name *</Label>
                    <Input
                      id="friendName"
                      value={formData.friendName}
                      onChange={(e) => handleInputChange('friendName', e.target.value)}
                      placeholder="Enter friend's full name"
                      required
                      disabled={isViewMode}
                      className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="friend@example.com"
                        className={`pl-10 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        required
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow numbers and + character
                          let value = e.target.value.replace(/[^0-9+]/g, '')
                          // Limit to 15 characters max (accounts for +971501234567 format)
                          if (value.length > 15) value = value.slice(0, 15)
                          handleInputChange('phone', value)
                        }}
                        placeholder="+971 50 123 4567"
                        className={`pl-10 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        maxLength={15}
                        required
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Dubai, UAE"
                        className={`pl-10 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        required
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className={`pl-10 ${isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        required
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)} disabled={isViewMode}>
                      <SelectTrigger className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Pakistan">Pakistan</SelectItem>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="Jordan">Jordan</SelectItem>
                        <SelectItem value="Lebanon">Lebanon</SelectItem>
                        <SelectItem value="Syria">Syria</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Professional Experience */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                  Professional Experience
                </CardTitle>
                <CardDescription>Your friend's current work experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company *</Label>
                    <Input
                      id="currentCompany"
                      value={formData.currentCompany}
                      onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                      placeholder="Where is your friend currently working?"
                      required
                      disabled={isViewMode}
                      className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Expected Salary (AED) *</Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                      placeholder="15000"
                      required
                      disabled={isViewMode}
                      className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Education */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                  Education
                </CardTitle>
                <CardDescription>Your friend's educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Qualification</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)} disabled={isViewMode}>
                    <SelectTrigger className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select highest qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Skills & Certifications */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-4 h-4 mr-2 text-blue-600" />
                  Skills & Certifications
                </CardTitle>
                <CardDescription>Your friend's key skills and professional certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="List your friend's key skills (comma-separated)"
                    rows={3}
                    required
                    disabled={isViewMode}
                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="List your friend's certifications and licenses (optional)"
                    rows={3}
                    disabled={isViewMode}
                    className={isViewMode ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Resume Upload */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Resume Upload
                </CardTitle>
                <CardDescription>Upload your friend's resume and other relevant documents</CardDescription>
              </CardHeader>
              <CardContent>
                {isViewMode ? (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {formData.resumeUrl ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-700">Resume: {formData.resumeUrl.split('/').pop() || 'Uploaded'}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(formData.resumeUrl, '_blank')}
                          >
                            View Resume
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!formData.resumeUrl) {
                                toast({
                                  title: "Resume Not Available",
                                  description: "No resume uploaded.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              try {
                                // Helper function to get download URL with fl_attachment for Cloudinary
                                const getDownloadUrl = (url: string): string => {
                                  if (!url) return url;
                                  if (url.includes('res.cloudinary.com')) {
                                    const uploadIndex = url.indexOf('/upload/');
                                    if (uploadIndex !== -1) {
                                      const beforeUpload = url.substring(0, uploadIndex + 8);
                                      const afterUpload = url.substring(uploadIndex + 8);
                                      if (!afterUpload.startsWith('fl_attachment')) {
                                        return `${beforeUpload}fl_attachment/${afterUpload}`;
                                      }
                                    }
                                  }
                                  return url;
                                };
                                
                                const downloadUrl = getDownloadUrl(formData.resumeUrl);
                                
                                // Extract filename from URL
                                let filename = formData.friendName || 'Resume';
                                if (formData.resumeUrl.includes('res.cloudinary.com')) {
                                  const urlParts = formData.resumeUrl.split('/');
                                  const lastPart = urlParts[urlParts.length - 1];
                                  if (lastPart && lastPart.includes('.')) {
                                    const cleanFilename = lastPart.split('?')[0].split('_')[0];
                                    if (cleanFilename && cleanFilename.length > 0) {
                                      filename = cleanFilename;
                                    }
                                  }
                                }
                                
                                const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                                
                                // Fetch the file as a blob
                                const response = await fetch(downloadUrl, {
                                  method: 'GET',
                                  headers: token ? {
                                    'Authorization': `Bearer ${token}`,
                                  } : {},
                                });

                                if (!response.ok) {
                                  throw new Error('Failed to fetch resume');
                                }

                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                
                                // Get file extension from URL or filename
                                const urlLower = formData.resumeUrl.toLowerCase();
                                let extension = 'pdf';
                                if (urlLower.includes('.docx') || filename.toLowerCase().endsWith('.docx')) extension = 'docx';
                                else if (urlLower.includes('.doc') || filename.toLowerCase().endsWith('.doc')) extension = 'doc';
                                else if (urlLower.includes('.txt') || filename.toLowerCase().endsWith('.txt')) extension = 'txt';
                                else if (urlLower.includes('.pdf') || filename.toLowerCase().endsWith('.pdf')) extension = 'pdf';
                                
                                // If filename doesn't have extension, add it
                                if (!filename.toLowerCase().endsWith(`.${extension}`)) {
                                  filename = `${filename}_CV.${extension}`;
                                } else {
                                  filename = `${filename.replace(/\.(pdf|doc|docx|txt)$/i, '')}_CV.${extension}`;
                                }
                                
                                // Create a temporary anchor element to trigger download
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                
                                // Clean up
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);

                                toast({
                                  title: "Download Started",
                                  description: `Downloading ${filename}...`,
                                });
                              } catch (error) {
                                console.error('Download error:', error);
                                // Fallback: try opening in new tab if download fails
                                try {
                                  window.open(formData.resumeUrl, '_blank');
                                  toast({
                                    title: "Opening Resume",
                                    description: "Resume opened in a new tab.",
                                  });
                                } catch (fallbackError) {
                                  toast({
                                    title: "Download Error",
                                    description: "Failed to download resume. Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No resume uploaded</span>
                    )}
                  </div>
                ) : (
                  <FileUpload
                    onUploadSuccess={(fileData) => {
                      setFormData(prev => ({
                        ...prev,
                        resumeUrl: fileData.secure_url || fileData.url
                      }));
                      toast({
                        title: "Resume Uploaded",
                        description: "Your friend's resume has been uploaded successfully.",
                      });
                    }}
                    onUploadError={(error) => {
                      console.error("Resume upload error:", error);
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    accept=".pdf,.doc,.docx"
                    maxSize={5}
                    allowedTypes={['document']}
                    placeholder="Upload Your Friend's Resume"
                    currentFile={formData.resumeUrl ? "Resume uploaded" : null}
                  />
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            {!isViewMode && (
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="gradient-bg text-white flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Referral"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/jobseeker/search/${jobId}`)}
                >
                  Cancel
                </Button>
              </div>
            )}
            {isViewMode && (
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/jobseeker/referrals/history')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Referral History
                </Button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
} 