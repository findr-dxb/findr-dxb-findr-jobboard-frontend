"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, Heart, ExternalLink, UserPlus, Calendar, Building2, Check, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ProfileCompletionDialog } from "@/components/ui/profile-completion-dialog"

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string[];
  salary?: number | {
    min: number;
    max: number;
  };
  createdAt: string;
  description: string;
  requirements?: string[];
  skills?: string[];
  experienceLevel?: string;
  applicationDeadline?: string;
  employer?: {
    _id: string;
    companyName: string;
  };
  applications?: any[];
  status: string;
  featured?: boolean;
  views?: number;
}

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [profileCompletionResult, setProfileCompletionResult] = useState<any>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedJobs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const applied = localStorage.getItem('appliedJobs');
      return applied ? JSON.parse(applied) : [];
    }
    return [];
  });
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const params: any = { status: 'active' }
      
      if (searchTerm) params.search = searchTerm
      if (location) params.location = location
      if (jobType) params.jobType = jobType
      if (experienceLevel) params.experienceLevel = experienceLevel

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs', {
        params
      })

      setJobs(response.data.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    // Also fetch user's applications to mark already applied jobs
    fetchUserApplications()
    
    // Refresh applied jobs when page becomes visible or focused (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserApplications()
      }
    }
    
    const handleFocus = () => {
      fetchUserApplications()
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Fetch user's applications to track which jobs have been applied to
  const fetchUserApplications = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) return

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      // Extract job IDs from applications, excluding withdrawn applications
      const appliedJobIds = response.data.data
        .filter((app: any) => app.status !== 'withdrawn') // Exclude withdrawn applications
        .map((app: any) => app.jobId?._id || app.jobId)
        .filter(Boolean)
      
      // Update state and localStorage
      setAppliedJobs(appliedJobIds)
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds))
    } catch (error) {
      console.log('Could not fetch user applications:', error)
      // Fail silently - use localStorage as fallback
    }
  }

  const handleSearch = () => {
    fetchJobs()
  }

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      let updated;
      if (prev.includes(jobId)) {
        updated = prev.filter((id) => id !== jobId);
      } else {
        updated = [...prev, jobId];
      }
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleApply = async (job: Job) => {
    console.log('🚀 APPLY BUTTON CLICKED for job:', job.title);
    const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
        variant: "destructive",
      })
      router.push('/login/jobseeker')
      return
    }
    
    setApplyingJobId(job._id)
    
    try {
      // Use the new dedicated endpoint for profile eligibility check
      console.log('🌐 Making API call to: https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/eligibility');
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
      
      const eligibilityResponse = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/eligibility', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).catch((error) => {
        console.error('❌ ELIGIBILITY API ERROR:', error.response?.status, error.response?.data || error.message);
        return null;
      });
      
      console.log('📡 ELIGIBILITY API Response:', eligibilityResponse?.data);
      
      if (!eligibilityResponse?.data?.success) {
        toast({
          title: "Profile Check Error",
          description: "Unable to check your profile eligibility. Please try again.",
          variant: "destructive",
        });
        setApplyingJobId(null);
        return;
      }
      
      const eligibilityData = eligibilityResponse.data.data;
      
      // Set profile completion data for the dialog
      setProfileCompletion(eligibilityData.profileCompletion.percentage);
      setProfileCompletionResult({
        percentage: eligibilityData.profileCompletion.percentage,
        hasResume: eligibilityData.resumeStatus.hasResume,
        canApply: eligibilityData.canApply,
        missingFields: eligibilityData.profileCompletion.missingFields
      });
      
      console.log('✅ PROFILE ELIGIBILITY RESULT:', {
        canApply: eligibilityData.canApply,
        profilePercentage: eligibilityData.profileCompletion.percentage,
        hasResume: eligibilityData.resumeStatus.hasResume,
        missingFields: eligibilityData.profileCompletion.missingFields
      });
      
      if (!eligibilityData.canApply) {
        setSelectedJob(job)
        setShowProfileDialog(true)
        setApplyingJobId(null)
        return
      }
      
      // Get user profile data for application submission
      const profileResponse = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const userProfile = profileResponse?.data?.data;
      
      if (!userProfile) {
        toast({
          title: "Profile Error",
          description: "Unable to fetch your profile data for application. Please try again.",
          variant: "destructive",
        });
        setApplyingJobId(null);
        return;
      }
      
      // Prepare application data with user's profile information
      const applicationData = {
        jobId: job._id,
        // Use profile data for automatic filling
        expectedSalary: userProfile?.expectedSalary || (typeof job.salary === 'number' ? job.salary.toString() : `${job.salary?.min || 0}-${job.salary?.max || 0}`),
        availability: userProfile?.availability || "Immediate",
        coverLetter: userProfile?.professionalSummary || 
          `I am interested in the ${job.title} position at ${job.companyName}. ` +
          `With my experience and skills, I believe I would be a valuable addition to your team. ` +
          `I am excited about this opportunity and look forward to contributing to your organization's success.`,
        resume: eligibilityData.resumeStatus.resumeDocument || 
                eligibilityData.resumeStatus.resumeUrl || 
                (eligibilityData.resumeStatus.resumeAndDocs?.[0]) || 
                "profile-resume.pdf",
        // Additional profile data that might be useful
        skills: userProfile?.skills || [],
        experience: userProfile?.experience || [],
        education: userProfile?.education || [],
        phoneNumber: userProfile?.phoneNumber || userProfile?.phone || "",
        location: userProfile?.location || ""
      }
      
      const response = await axios.post('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications', applicationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      toast({
        title: "Application Submitted!",
        description: `Your application for ${job.title} at ${job.companyName} has been submitted successfully with your profile details.`,
      })
      
      // Track applied jobs in localStorage and state for quick reference
      const updatedAppliedJobs = [...appliedJobs]
      if (!updatedAppliedJobs.includes(job._id)) {
        updatedAppliedJobs.push(job._id)
        localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs))
        setAppliedJobs(updatedAppliedJobs)
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit application"
      
      // Check if already applied
      if (errorMessage.includes('already applied')) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this job position.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setApplyingJobId(null)
    }
  }

  const handleReferFriend = (jobId: string, jobTitle: string) => {
    router.push(`/jobseeker/refer-friend/${jobId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
          <p className="text-gray-600">Discover exciting opportunities in Dubai's dynamic job market</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="gradient-bg text-white">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive Level</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary">{jobs.length} jobs found</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-600 mt-2">Loading jobs...</p>
          </div>
        )}

        {/* Job Results */}
        {!isLoading && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">No jobs found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchTerm("")
                  setLocation("")
                  setJobType("")
                  setExperienceLevel("")
                  fetchJobs()
                }} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card
                  key={job._id}
                  className={`hover:shadow-md transition-shadow ${job.featured ? "border-2 border-emerald-200" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold mb-1 flex items-center">
                              {job.title}
                              {job.featured && <Badge className="ml-2 gradient-bg text-white">Featured</Badge>}
                            </h3>
                            <div className="flex items-center text-gray-600 font-medium">
                              <Building2 className="w-4 h-4 mr-1" />
                              {job.companyName}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          {job.jobType && job.jobType.length > 0 && (
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {job.jobType.join(', ')}
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              AED {typeof job.salary === 'number' ? job.salary.toLocaleString() : (job.salary.min || job.salary.max || 0).toLocaleString()}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(job.createdAt)}
                          </div>
                          {job.views !== undefined && (
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {job.views} {job.views === 1 ? 'view' : 'views'}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills && job.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.experienceLevel && (
                            <Badge variant="secondary" className="text-xs">
                              {job.experienceLevel === 'entry' ? 'Entry Level' :
                               job.experienceLevel === 'mid' ? 'Mid Level' :
                               job.experienceLevel === 'senior' ? 'Senior Level' :
                               'Executive Level'}
                            </Badge>
                          )}
                        </div>

                        {job.applicationDeadline && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-6">
                        <Button 
                          onClick={() => handleApply(job)} 
                          className={appliedJobs.includes(job._id) ? "bg-gray-400 text-white cursor-not-allowed" : "gradient-bg text-white"}
                          disabled={applyingJobId === job._id || appliedJobs.includes(job._id)}
                        >
                          {applyingJobId === job._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Applying...
                            </>
                          ) : appliedJobs.includes(job._id) ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Applied
                            </>
                          ) : (
                            "Apply Now"
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleReferFriend(job._id, job.title)} 
                          variant="outline"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Refer Friend
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/jobseeker/search/${job._id}`)}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job._id)} aria-label="Save job">
                          <Heart className={`w-4 h-4 ${savedJobs.includes(job._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Load More - Only show if there are more than 4 jobs */}
        {!isLoading && jobs.length > 4 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={fetchJobs}>
              Load More Jobs
            </Button>
          </div>
        )}
      </div>

      {/* Profile Completion Dialog */}
      <ProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        completionPercentage={profileCompletion}
        hasResume={profileCompletionResult?.hasResume || false}
        canApply={profileCompletionResult?.canApply || false}
        missingFields={profileCompletionResult?.missingFields || []}
        onCompleteProfile={() => {
          setShowProfileDialog(false)
          router.push('/jobseeker/profile')
        }}
      />
    </div>
  )
}
