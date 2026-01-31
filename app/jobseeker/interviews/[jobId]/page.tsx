"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, DollarSign, Clock, Calendar, Building, User, FileText, CheckCircle, AlertCircle, Video, Phone, MapPin as MapPinIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface InterviewData {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    salary?: {
      min: number;
      max: number;
    };
    jobType?: string[];
    experienceLevel?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    employer?: {
      _id: string;
      companyName: string;
    };
  };
  jobDetails?: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    salary?: {
      min: number;
      max: number;
    };
    jobType?: string[];
    experienceLevel?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    employer?: {
      _id: string;
      companyName: string;
    };
  };
  interviewDate?: string;
  interviewMode?: string;
  employerNotes?: string;
  status: string;
  appliedDate: string;
  employerId?: string;
  expectedSalary?: {
    min: number;
    max: number;
  };
  availability?: string;
  applicantDetails?: {
    _id: string;
    name: string;
    email: string;
  };
}


export default function InterviewJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { jobId } = React.use(params);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login/jobseeker');
          return;
        }

        // Get the specific interview/application data
        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        setInterviewData(response.data.data);
      } catch (error) {
        console.error('Error fetching interview data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch interview details.",
          variant: "destructive",
        });
        router.push('/jobseeker/interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [jobId, router, toast]);

  const job = interviewData;

  const handleRescheduleInterview = () => {
    toast({
      title: "Reschedule Request",
      description: "Your reschedule request has been sent to the interviewer.",
    });
  };

  const handleViewCompanyProfile = () => {
    // Try to get employer ID from interview data
    const employerId = interviewData?.employerId || 
                      interviewData?.jobDetails?.employer?._id || 
                      interviewData?.jobId?.employer?._id;
    
    if (employerId && typeof employerId === 'string') {
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



  const getInterviewIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'zoom':
      case 'video call':
        return <Video className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPinIcon className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Loading Interview Details...</h1>
        </div>
      </div>
    );
  }

  if (!interviewData || interviewData.status !== 'interview_scheduled') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Interview Not Found</h1>
          <p className="text-gray-600 mb-6">The interview you're looking for doesn't exist or is not scheduled.</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6">
          <Link href="/jobseeker/dashboard" className="hover:underline">Dashboard</Link>
          <span>➔</span>
          <Link href="/jobseeker/interviews" className="hover:underline">Interviews</Link>
          <span>➔</span>
          <span className="text-gray-700 font-medium truncate">{interviewData.jobDetails?.title || 'Interview'}</span>
        </nav>

        {/* Interview Information - Prominent Display */}
        <Card className="mb-6 shadow-md border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Interview Scheduled
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-lg">
                      {interviewData.interviewDate ? 
                        new Date(interviewData.interviewDate).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'To be scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mode</p>
                    <p className="font-medium flex items-center">
                      {getInterviewIcon(interviewData.interviewMode || 'in-person')}
                      <span className="ml-2">{interviewData.interviewMode === 'virtual' ? 'Virtual' : 'In-Person'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company</p>
                    <p className="font-medium">{interviewData.jobDetails?.companyName || 'Company'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium">{interviewData.jobDetails?.location || 'Not specified'}</p>
                  </div>
                </div>
                {interviewData.employerNotes && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Interview Notes</p>
                    <p className="text-sm">{interviewData.employerNotes}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 lg:ml-4">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className="font-medium text-gray-800 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span>Interview Scheduled</span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRescheduleInterview}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Reschedule
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePrepareForInterview}
                >
                  Prepare for Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Header */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{interviewData.jobDetails?.title || 'Job Title'}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-3">
                  <span className="flex items-center font-medium">
                    <Building className="w-4 h-4 mr-2" />
                    {interviewData.jobDetails?.companyName || 'Company'}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {interviewData.jobDetails?.location || 'Location'}
                  </span>
                  {interviewData.jobDetails?.jobType && (
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {Array.isArray(interviewData.jobDetails.jobType) ? 
                        interviewData.jobDetails.jobType.join(', ') : 
                        interviewData.jobDetails.jobType}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-4">
                  {interviewData.jobDetails?.salary && (
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      AED {typeof interviewData.jobDetails.salary === 'number' ? interviewData.jobDetails.salary.toLocaleString() : (interviewData.jobDetails.salary.min || interviewData.jobDetails.salary.max || 0).toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Applied {new Date(interviewData.appliedDate).toLocaleDateString()}
                  </span>
                  {interviewData.jobDetails?.experienceLevel && (
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {interviewData.jobDetails.experienceLevel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    Interview Scheduled
                  </Badge>
                  <span className="text-sm text-gray-600">• Status: {interviewData.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:ml-4">
                <Button 
                  variant="outline" 
                  onClick={handleViewCompanyProfile}
                >
                  View Company Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Overview */}
        {interviewData.jobDetails?.description && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed">{interviewData.jobDetails.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {interviewData.jobDetails?.requirements && interviewData.jobDetails.requirements.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Requirements</h2>
              <ul className="space-y-2">
                {interviewData.jobDetails.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {interviewData.jobDetails?.skills && interviewData.jobDetails.skills.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {interviewData.jobDetails.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Summary */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Application Summary</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Application Status</p>
                <p className="font-medium">{interviewData.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                <p className="font-medium">{new Date(interviewData.appliedDate).toLocaleDateString()}</p>
              </div>
              {interviewData.expectedSalary && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Salary</p>
                  <p className="font-medium">
                    AED {interviewData.expectedSalary && typeof interviewData.expectedSalary === 'object' 
                      ? (interviewData.expectedSalary.min || interviewData.expectedSalary.max || 0).toLocaleString()
                      : (typeof interviewData.expectedSalary === 'number' ? interviewData.expectedSalary.toLocaleString() : 'Not specified')}
                  </p>
                </div>
              )}
              {interviewData.availability && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Availability</p>
                  <p className="font-medium">{interviewData.availability}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


