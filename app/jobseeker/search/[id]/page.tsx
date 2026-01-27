"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { MapPin, Briefcase, DollarSign, Clock, Heart, ExternalLink, GraduationCap, TrendingUp, Check, Eye } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ProfileCompletionDialog } from "@/components/ui/profile-completion-dialog";
import { calculateProfileCompletion, isEligibleToApply } from "@/lib/profile-utils";

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string[];
  salary?: {
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
    companyLocation?: string;
    companyDescription?: string;
    companyWebsite?: string;
  };
  status: string;
  views?: number;
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = React.use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileCompletionResult, setProfileCompletionResult] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Saved jobs state (localStorage)
  const [saved, setSaved] = useState(false);

  // Fetch job details from API
  useEffect(() => {
    // Debug: Log the ID being used
    console.log('Job Details Page - ID from URL:', id);
    console.log('Type of ID:', typeof id);
    
    if (id) {
      fetchJobDetails();
      checkIfApplied();
    } else {
      console.error('No job ID provided');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined" && job) {
      const savedJobs = localStorage.getItem("savedJobs");
      if (savedJobs) {
        setSaved(JSON.parse(savedJobs).includes(job._id));
      }
    }
  }, [job]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching job with ID:', id);
      
      const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${id}`);
      console.log('Job API Response:', response.data);
      
      if (response.data && response.data.data) {
        setJob(response.data.data);
      } else {
        console.error('No job data in response');
        setJob(null);
      }
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Check if it's a 404 error
      if (error.response?.status === 404) {
        toast({
          title: "Job Not Found",
          description: "This job posting may have been removed or doesn't exist.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load job details. Please try again.",
          variant: "destructive",
        });
      }
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfApplied = async () => {
    // Check if user has already applied to this job (excluding withdrawn applications)
    const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    
    if (!token) {
      // Fallback to localStorage check if no token
      const appliedJobs = localStorage.getItem('appliedJobs');
      if (appliedJobs) {
        setHasApplied(JSON.parse(appliedJobs).includes(id));
      }
      return;
    }

    try {
      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // Check if there's an active (non-withdrawn) application for this job
      const hasActiveApplication = response.data.data.some((app: any) => {
        const jobId = app.jobId?._id || app.jobId;
        return jobId === id && app.status !== 'withdrawn';
      });

      setHasApplied(hasActiveApplication);
    } catch (error) {
      console.log('Could not fetch user applications:', error);
      // Fallback to localStorage check
      const appliedJobs = localStorage.getItem('appliedJobs');
      if (appliedJobs) {
        setHasApplied(JSON.parse(appliedJobs).includes(id));
      }
    }
  };

  const toggleSaveJob = () => {
    if (!job) return;
    setSaved((prev) => {
      let updated;
      const savedJobs = typeof window !== "undefined" ? localStorage.getItem("savedJobs") : null;
      let arr = savedJobs ? JSON.parse(savedJobs) : [];
      if (prev) {
        updated = arr.filter((savedId: string) => savedId !== job._id);
      } else {
        updated = [...arr, job._id];
      }
      localStorage.setItem("savedJobs", JSON.stringify(updated));
      return !prev;
    });
    toast({
      title: saved ? "Removed from Saved Jobs" : "Job Saved!",
      description: saved ? "This job has been removed from your saved jobs." : "This job has been added to your saved jobs.",
    });
  };

  const handleApply = async () => {
    console.log('🚀 APPLY BUTTON CLICKED on job detail page for job:', job?.title);
    if (!job) return;
    
    const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
        variant: "destructive",
      });
      router.push('/login/jobseeker');
      return;
    }
    
    setIsApplying(true);
    
    try {
      // Get user profile data from localStorage
      const userDataStr = localStorage.getItem('findr_user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      // Fetch fresh profile data for completion check
      console.log('🌐 Making API call to: https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details');
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token');
      
      const profileResponse = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).catch((error) => {
        console.error('❌ API ERROR:', error.response?.status, error.response?.data || error.message);
        return null;
      });
      
      console.log('📡 API Response:', profileResponse?.data);
      
      const userProfile = profileResponse?.data?.data;
      
      if (!userProfile) {
        toast({
          title: "Profile Error",
          description: "Unable to fetch your profile data. Please try again.",
          variant: "destructive",
        });
        setIsApplying(false);
        return;
      }
      
      console.log('📋 FULL PROFILE DATA:', userProfile);
      console.log('📄 RESUME DOCUMENT FIELD:', userProfile?.resumeDocument);
      
      // Check profile completion before allowing application
      const completionResult = calculateProfileCompletion(userProfile);
      setProfileCompletion(completionResult.percentage);
      setProfileCompletionResult(completionResult);
      
      if (!isEligibleToApply(completionResult)) {
        setShowProfileDialog(true);
        setIsApplying(false);
        return;
      }
      
      // Prepare application data with user's profile information
      const applicationData = {
        jobId: job._id,
        expectedSalary: userData?.expectedSalary || `${job.salary?.min || 0}-${job.salary?.max || 0}`,
        availability: userData?.availability || "Immediate",
        coverLetter: userData?.professionalSummary || 
          `I am interested in the ${job.title} position at ${job.companyName}. ` +
          `With my experience and skills, I believe I would be a valuable addition to your team. ` +
          `I am excited about this opportunity and look forward to contributing to your organization's success.`,
        resume: userData?.resumeUrl || userData?.resume || "profile-resume.pdf",
      };
      
      await axios.post('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications', applicationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      toast({
        title: "Application Submitted!",
        description: `Your application for ${job.title} has been submitted successfully with your profile details.`,
      });
      
      // Track applied job
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!appliedJobs.includes(job._id)) {
        appliedJobs.push(job._id);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        setHasApplied(true);
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit application";
      
      if (errorMessage.includes('already applied')) {
        toast({
          title: "Already Applied",
          description: "You have already applied to this job position.",
          variant: "destructive",
        });
        setHasApplied(true);
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExperienceLabel = (level?: string) => {
    switch(level) {
      case 'entry': return 'Entry Level (0-2 years)';
      case 'mid': return 'Mid Level (3-5 years)';
      case 'senior': return 'Senior Level (6-10 years)';
      case 'executive': return 'Executive Level (10+ years)';
      default: return level || '-';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600 mt-4">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* BreadcrumbNav */}
          <nav className="text-xs text-gray-500 flex items-center gap-2 mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">➔</span>
            <Link href="/jobseeker/search" className="hover:underline">Jobs</Link>
            <span className="mx-1">➔</span>
            <span className="text-gray-700 font-medium truncate">{job.title}</span>
          </nav>

          {/* JobHeaderCard */}
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900 truncate">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-gray-700 text-sm mb-1">
                  <span className="font-medium">{job.companyName}</span>
                  <span className="hidden md:inline">·</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{job.location}</span>
                  <span className="hidden md:inline">·</span>
                  <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" />{job.jobType?.join(", ") || "Full-time"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-gray-500 text-xs mt-1">
                  {job.salary && (
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      AED {job.salary.min} - {job.salary.max}
                    </span>
                  )}
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{formatDate(job.createdAt)}</span>
                  {job.views !== undefined && (
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {job.views} {job.views === 1 ? 'view' : 'views'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center mt-4 md:mt-0 md:ml-4">
                <Button 
                  className={hasApplied ? "bg-gray-400 text-white font-semibold px-6 py-2 md:px-8 md:py-2.5 shadow-md cursor-not-allowed" : "gradient-bg text-white font-semibold px-6 py-2 md:px-8 md:py-2.5 shadow-md"} 
                  style={{minWidth:120}} 
                  onClick={handleApply}
                  disabled={isApplying || hasApplied}
                >
                  {isApplying ? "Applying..." : hasApplied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Applied
                    </>
                  ) : "Apply Now"}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Save Job" className="border-gray-300" onClick={toggleSaveJob}>
                      <Heart className={`w-5 h-5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{saved ? "Unsave Job" : "Save Job"}</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* JobDescriptionSection */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-800">
                {job.description.split("\n").map((line, idx) => {
                  if (line.startsWith("**") && line.endsWith(":**")) {
                    return <div key={idx} className="font-bold mt-3 mb-1">{line.replace(/\*\*/g, "")}</div>;
                  }
                  if (line.startsWith("• ")) {
                    return <li key={idx} className="ml-4 list-disc">{line.replace("• ", "")}</li>;
                  }
                  if (line.trim() === "") {
                    return <br key={idx} />;
                  }
                  return <div key={idx}>{line}</div>;
                })}
              </div>
            </CardContent>
          </Card>

          {/* SkillsAndRequirementsCard */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Skills & Requirements</h2>
              
              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs font-medium">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col gap-1 text-gray-700 text-sm mt-4">
                <span className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-emerald-600" />
                  {getExperienceLabel(job.experienceLevel)}
                </span>
                {job.applicationDeadline && (
                  <span className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1 text-blue-600" />
                    Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CompanyInfoCard */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
              <img 
                src="/placeholder-logo.png" 
                alt="Company Logo" 
                className="w-14 h-14 rounded bg-white border object-contain mb-2 md:mb-0" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-base">{job.companyName}</span>
                  {job.employer?.companyWebsite && (
                    <Link 
                      href={job.employer.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" /> Website
                    </Link>
                  )}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {job.employer?.companyDescription || 
                   `${job.companyName} is a leading company in ${job.location}. We value innovation, collaboration, and excellence in everything we do.`}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (job.employer?._id) {
                      router.push(`/jobseeker/company-profile/${job.employer._id}`);
                    } else {
                      toast({
                        title: "Company Profile",
                        description: "Company profile not available for this company.",
                      });
                    }
                  }}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  View Company Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optional: More jobs from this company */}
          {/* <Card className="mb-6 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">More jobs from this company</h2>
              ...
            </CardContent>
          </Card> */}
        </main>
        {/* Sticky Apply Now for mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-md p-4 flex md:hidden justify-between items-center gap-2">
          <Button 
            className={hasApplied ? "bg-gray-400 text-white font-semibold flex-1 cursor-not-allowed" : "gradient-bg text-white font-semibold flex-1"} 
            onClick={handleApply}
            disabled={isApplying || hasApplied}
          >
            {isApplying ? "Applying..." : hasApplied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Applied
              </>
            ) : "Apply Now"}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Save Job" className="border-gray-300" onClick={toggleSaveJob}>
                <Heart className={`w-5 h-5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{saved ? "Unsave Job" : "Save Job"}</TooltipContent>
          </Tooltip>
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
            setShowProfileDialog(false);
            router.push('/jobseeker/profile');
          }}
        />
      </div>
    </TooltipProvider>
  );
} 