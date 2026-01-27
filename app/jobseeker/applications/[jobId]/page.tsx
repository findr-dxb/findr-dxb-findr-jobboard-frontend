"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, DollarSign, Clock, Calendar, Building, User, FileText, CheckCircle, AlertCircle, Download, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ApplicationData {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    salary: {
      min: number;
      max: number;
    };
    jobType: string[];
    description: string;
    requirements: string[];
    skills: string[];
    experienceLevel: string;
    applicationDeadline: string;
    status: string;
    views: number;
    createdAt: string;
    updatedAt: string;
    employer?: {
      _id: string;
      companyName?: string;
    } | string;
  };
  status: string;
  appliedDate: string;
  expectedSalary?: {
    min: number;
    max: number;
  };
  availability?: string;
  coverLetter?: string;
  resume?: string;
  additionalDocuments?: {
    fileName: string;
    fileUrl: string;
    uploadDate: string;
  }[];
  viewedByEmployer: boolean;
  employerNotes?: string;
  rating?: number;
  interviewDate?: string;
  interviewMode?: string;
  feedback?: string;
  viewedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { jobId } = React.use(params);
  
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
        
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view your application.",
            variant: "destructive",
          });
          router.push('/login/jobseeker');
          return;
        }

        // Get all user applications to find the one matching jobId
        const applicationsResponse = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const applications = applicationsResponse.data.data || [];
        
        const application = applications.find((app: any) => app._id === jobId);

        if (!application) {
          toast({
            title: "Application Not Found",
            description: "The application you're looking for doesn't exist.",
            variant: "destructive",
          });
          router.push('/jobseeker/applications');
          return;
        }

        // If jobId is populated, we have all the data we need
        if (application.jobId && typeof application.jobId === 'object') {
          setApplicationData(application);
        } else {
          // If jobId is just a string, fetch the full job details
          try {
            const jobResponse = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${application.jobId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            });

            setApplicationData({
              ...application,
              jobId: jobResponse.data.data
            });
          } catch (jobError) {
            console.error('Error fetching job details:', jobError);
            setApplicationData(application);
          }
        }

      } catch (error) {
        console.error('Error fetching application:', error);
        toast({
          title: "Error",
          description: "Failed to load application details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [jobId, router, toast]);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showWithdrawDialog) {
        setShowWithdrawDialog(false);
      }
    };

    if (showWithdrawDialog) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showWithdrawDialog]);

  const handleWithdrawApplication = async () => {
    if (!applicationData) return;
    
    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      const response = await axios.delete(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      // Get the actual job ID from the application
      const actualJobId = applicationData.jobId?._id || applicationData.jobId;
      
      // Remove the job from localStorage appliedJobs
      if (actualJobId && typeof window !== 'undefined') {
        const appliedJobs = localStorage.getItem('appliedJobs');
        if (appliedJobs) {
          try {
            const appliedJobsArray = JSON.parse(appliedJobs);
            const updatedAppliedJobs = appliedJobsArray.filter((id: string) => id !== actualJobId);
            localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }
      }

      toast({
        title: "Application Withdrawn",
        description: response.data.message || `Your application for ${applicationData.jobId.title} has been withdrawn successfully.`,
      });
      
      // Close dialog and redirect
      setShowWithdrawDialog(false);
      setTimeout(() => {
        router.push("/jobseeker/applications");
      }, 1000);
      
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      
      const errorMessage = error.response?.data?.message || "Failed to withdraw application. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const canWithdrawApplication = () => {
    if (!applicationData) return false;
    
    // Cannot withdraw if hired, rejected, or already withdrawn
    if (applicationData.status === 'hired' || 
        applicationData.status === 'rejected' || 
        applicationData.status === 'withdrawn') {
      return false;
    }
    
    return true;
  };

  const getWithdrawButtonText = () => {
    if (!applicationData) return "Withdraw Application";
    
    switch (applicationData.status) {
      case 'hired':
        return "Cannot Withdraw (Hired)";
      case 'rejected':
        return "Cannot Withdraw (Rejected)";
      case 'withdrawn':
        return "Application Withdrawn";
      case 'interview_scheduled':
        return "Withdraw Application";
      default:
        return "Withdraw Application";
    }
  };

  const handleViewCompanyProfile = () => {
    // Try to get employer ID from job data
    const employer = applicationData?.jobId?.employer;
    let employerId: string | undefined;
    
    if (typeof employer === 'string') {
      employerId = employer;
    } else if (employer && typeof employer === 'object' && '_id' in employer) {
      employerId = employer._id;
    }
    
    if (employerId) {
      router.push(`/jobseeker/company-profile/${employerId}`);
    } else {
      toast({
        title: "Company Profile",
        description: "Company profile not available for this company.",
        variant: "destructive",
      });
    }
  };

  const handlePrepareForInterview = () => {
    toast({
      title: "Interview Preparation",
      description: "Interview preparation resources will be available soon!",
    });
  };

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

  const downloadDocument = async (url: string, fileName: string) => {
    if (!url) {
      toast({
        title: "Download Error",
        description: `${fileName} is not available for download.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the download URL with fl_attachment flag for Cloudinary
      const downloadUrl = getDownloadUrl(url);
      
      // Extract filename from URL or use provided fileName
      let filename = fileName;
      if (url.includes('res.cloudinary.com')) {
        const urlParts = url.split('/');
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
        throw new Error('Failed to fetch document');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Get file extension from URL or filename
      const urlLower = url.toLowerCase();
      let extension = 'pdf';
      if (urlLower.includes('.docx') || filename.toLowerCase().endsWith('.docx')) extension = 'docx';
      else if (urlLower.includes('.doc') || filename.toLowerCase().endsWith('.doc')) extension = 'doc';
      else if (urlLower.includes('.txt') || filename.toLowerCase().endsWith('.txt')) extension = 'txt';
      else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || filename.toLowerCase().endsWith('.jpg')) extension = 'jpg';
      else if (urlLower.includes('.png') || filename.toLowerCase().endsWith('.png')) extension = 'png';
      else if (urlLower.includes('.pdf') || filename.toLowerCase().endsWith('.pdf')) extension = 'pdf';
      
      // If filename doesn't have extension, add it
      if (!filename.toLowerCase().endsWith(`.${extension}`)) {
        filename = `${filename}.${extension}`;
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
        window.open(url, '_blank');
        toast({
          title: "Opening Document",
          description: `${fileName} opened in a new tab.`,
        });
      } catch (fallbackError) {
        toast({
          title: "Download Error",
          description: `Failed to download ${fileName}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }


  const formatSalary = (salary: any) => {
    if (salary && salary.min && salary.max) {
      return `AED ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    return "Salary not specified";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "interview_scheduled":
        return "bg-green-100 text-green-800";
      case "hired":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/jobseeker/dashboard" className="hover:underline">Dashboard</Link>
          <span>➔</span>
          <Link href="/jobseeker/applications" className="hover:underline">Applications</Link>
          <span>➔</span>
          <span className="text-gray-700 font-medium truncate">{applicationData.jobId?.title || 'Job Application'}</span>
        </nav>

        {/* Job Header */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{applicationData.jobId?.title || 'Job Title'}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-3">
                  <span className="flex items-center font-medium">
                    <Building className="w-4 h-4 mr-2" />
                    {applicationData.jobId?.companyName || 'Company Name'}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {applicationData.jobId?.location || 'Location'}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {applicationData.jobId?.jobType?.join(', ') || 'Job Type'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-4">
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatSalary(applicationData.jobId?.salary)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Applied {new Date(applicationData.appliedDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Deadline: {applicationData.jobId?.applicationDeadline ? new Date(applicationData.jobId.applicationDeadline).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`px-3 py-1 ${getStatusColor(applicationData.status)}`}>
                    {formatStatus(applicationData.status)}
                  </Badge>
                  <span className="text-sm text-gray-600">• {applicationData.jobId?.experienceLevel || 'Experience level not specified'}</span>
                  {applicationData.viewedByEmployer && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Viewed by Employer
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:ml-4">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWithdrawDialog(true)}
                    disabled={!canWithdrawApplication()}
                    className={`w-full ${canWithdrawApplication() 
                      ? "text-red-600 border-red-200 hover:bg-red-50" 
                      : "text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {getWithdrawButtonText()}
                  </Button>
                  {!canWithdrawApplication() && (
                    <div className="absolute -bottom-6 left-0 right-0">
                      <p className="text-xs text-gray-500 text-center">
                        {applicationData?.status === 'hired' && "Cannot withdraw after being hired"}
                        {applicationData?.status === 'rejected' && "Cannot withdraw after rejection"}
                        {applicationData?.status === 'withdrawn' && "Application has been withdrawn"}
                      </p>
                    </div>
                  )}
                </div>
                <div className={!canWithdrawApplication() ? "mt-6" : ""}>
                  <Button 
                    variant="outline" 
                    onClick={handleViewCompanyProfile}
                    className="w-full"
                  >
                    View Company Profile
                  </Button>
                </div>
                {applicationData.status === 'interview_scheduled' && (
                  <Button 
                    className="gradient-bg text-white w-full"
                    onClick={handlePrepareForInterview}
                  >
                    Prepare for Interview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Information */}
        {applicationData.status === 'interview_scheduled' && applicationData.interviewDate && (
          <Card className="mb-6 shadow-md border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Interview Scheduled
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="font-medium">
                    {new Date(applicationData.interviewDate).toLocaleDateString()} at {new Date(applicationData.interviewDate).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-medium">Interview Scheduled</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Interview Type</p>
                  <p className="font-medium flex items-center">
                    {applicationData.interviewMode === 'virtual' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                        </svg>
                        Virtual
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        In-Person
                      </>
                    )}
                  </p>
                </div>
              </div>
              {applicationData.feedback && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Interview Notes</p>
                  <p className="text-sm">{applicationData.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Application Details */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Application Date</p>
                  <p className="font-medium">{new Date(applicationData.appliedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className={`${getStatusColor(applicationData.status)}`}>
                    {formatStatus(applicationData.status)}
                  </Badge>
                </div>
                {applicationData.expectedSalary && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expected Salary</p>
                    <p className="font-medium">{formatSalary(applicationData.expectedSalary)}</p>
                  </div>
                )}
                {applicationData.availability && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Availability</p>
                    <p className="font-medium">{applicationData.availability}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Viewed by Employer</p>
                  <p className="font-medium">{applicationData.viewedByEmployer ? 'Yes' : 'No'}</p>
                  {applicationData.viewedDate && (
                    <p className="text-xs text-gray-500">
                      Viewed on {new Date(applicationData.viewedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {applicationData.rating !== undefined && applicationData.rating !== null && Number(applicationData.rating) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Employer Rating</p>
                    <div className="flex items-center">
                      <span className="text-yellow-500">{'★'.repeat(Number(applicationData.rating))}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - Number(applicationData.rating))}</span>
                      <span className="ml-2 text-sm text-gray-600">({applicationData.rating}/5)</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Application Updated</p>
                  <p className="font-medium">{new Date(applicationData.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {applicationData.coverLetter && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Cover Letter</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{applicationData.coverLetter}</p>
                </div>
              </div>
            )}

            {applicationData.employerNotes && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Employer Notes</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{applicationData.employerNotes}</p>
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Application Documents</h3>
              <div className="space-y-3">
                {applicationData.resume && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="font-medium">Resume/CV</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadDocument(applicationData.resume!, 'Resume')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
                
                {applicationData.additionalDocuments && applicationData.additionalDocuments.length > 0 && (
                  <>
                    {applicationData.additionalDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-600 mr-3" />
                          <div>
                            <span className="font-medium">{doc.fileName}</span>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDocument(doc.fileUrl, doc.fileName)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        {applicationData.jobId?.description && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{applicationData.jobId.description}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {applicationData.jobId?.requirements && applicationData.jobId.requirements.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {applicationData.jobId.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Skills Required */}
        {applicationData.jobId?.skills && applicationData.jobId.skills.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {applicationData.jobId.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdraw Confirmation Dialog */}
        {showWithdrawDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Withdraw Application</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to withdraw your application for:
                </p>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-semibold text-gray-900">{applicationData?.jobId?.title}</p>
                  <p className="text-sm text-gray-600">{applicationData?.jobId?.companyName}</p>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  This action cannot be undone. You will need to reapply if you change your mind.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWithdrawDialog(false)}
                  disabled={isWithdrawing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleWithdrawApplication}
                  disabled={isWithdrawing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isWithdrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Withdraw Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}