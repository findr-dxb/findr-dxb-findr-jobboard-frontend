"use client";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  FileText,
  ArrowLeft,
  MessageSquare,
  Download,
  Star,
  Award,
  Clock,
  Building,
  Check,
  X,
  Video,
  Undo2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicantData {
  _id: string;
  applicantDetails: {
    _id: string;
    name: string;
    fullName?: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    dateOfBirth?: string;
    nationality?: string;
    professionalSummary?: string;
    professionalExperience?: Array<{
      currentRole: string;
      company: string;
      yearsOfExperience: number;
      industry: string;
    }>;
    education?: Array<{
      degree?: string;
      highestDegree?: string;
      institution?: string;
      graduationYear?: number;
      yearOfGraduation?: number;
      grade?: string;
      gradeCgpa?: string;
    }>;
    skills?: string[];
    certifications?: string[];
    profilePicture?: string;
    membershipTier?: string;
    emirateId?: string;
    passportNumber?: string;
    employmentVisa?: string;
    introVideo?: string;
    resumeDocument?: string;
    refersLink?: string;
    referredMember?: string;
    jobPreferences?: {
      preferredJobType?: string[];
      salaryExpectation?: string;
      preferredLocation?: string;
      availability?: string;
      resumeAndDocs?: string[];
    };
    socialLinks?: {
      linkedIn?: string;
      instagram?: string;
      twitterX?: string;
    };
    rmService?: string;
    rewards?: {
      completeProfile?: number;
      applyForJobs?: number;
      referFriend?: number;
      totalPoints?: number;
    };
    referralRewardPoints?: number;
    applications?: {
      totalApplications?: number;
      activeApplications?: number;
      awaitingFeedback?: number;
      appliedJobs?: Array<any>;
    };
    savedJobs?: Array<any>;
    profileCompleted?: string;
    points?: number;
  };
  jobDetails: {
    title: string;
    companyName: string;
  };
  status: string;
  appliedDate: string;
  expectedSalary?: string;
  availability?: string;
  coverLetter?: string;
  resume?: string;
  rating?: number;
}

// Get today's date in YYYY-MM-DD format (local timezone)
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeId = (id: string | undefined | null) => {
  if (!id) return '';
  return id.toString().trim().toLowerCase();
};

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  let idParam = params?.id || "";
  if (Array.isArray(idParam)) idParam = idParam[0];
  
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "",
    time: "",
    mode: "in-person",
    notes: ""
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [employerReview, setEmployerReview] = useState({
    rating: 0,
    comments: "",
    status: "",
    interviewNotes: ""
  });
  const [existingReview, setExistingReview] = useState<any>(null);
  const [statusHistory, setStatusHistory] = useState<Record<string, string>>({}); // Track previous statuses for undo
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);

  useEffect(() => {
    const fetchApplicantData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
        
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view applicant profiles.",
            variant: "destructive",
          });
          router.push('/login/employer');
          return;
        }

        // Fetch applicant data using the application ID - always fetch fresh data
        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${idParam}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          params: {
            _t: Date.now() // Cache busting parameter
          }
        });

        // Ensure we have the data and log for debugging
        if (response.data && response.data.data) {
          console.log('Fetched application status:', response.data.data.status);
          setApplicantData(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
        
        // Fetch existing employer review for this application
        await fetchEmployerReview();
        
      } catch (error) {
        console.error('Error fetching applicant data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applicant profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (idParam) {
      fetchApplicantData();
    }
  }, [idParam, router, toast]);

  // Fetch existing employer review
  const fetchEmployerReview = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/employer/reviews/application/${idParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data.success && response.data.data) {
        setExistingReview(response.data.data);
        setEmployerReview({
          rating: response.data.data.rating || 0,
          comments: response.data.data.comments || "",
          status: response.data.data.status || "",
          interviewNotes: response.data.data.interviewNotes || ""
        });
      }
    } catch (error) {
      // Review doesn't exist yet, which is fine
      console.log('No existing review found');
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  const handleDownloadResume = async () => {
    const resumeUrl = candidate.resumeDocument || applicantData?.resume;
    if (!resumeUrl) {
      toast({
        title: "Resume unavailable",
        description: "This candidate has not uploaded a resume yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the download URL with fl_attachment flag for Cloudinary
      const downloadUrl = getDownloadUrl(resumeUrl);
      
      // Extract filename from URL or use default
      let filename = 'candidate-resume';
      const urlLower = resumeUrl.toLowerCase();
      
      // Try to extract original filename from Cloudinary URL
      if (resumeUrl.includes('res.cloudinary.com')) {
        // Cloudinary URLs often have the filename in the path
        const urlParts = resumeUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          // Remove query parameters and transformations
          const cleanFilename = lastPart.split('?')[0].split('_')[0];
          if (cleanFilename && cleanFilename.length > 0) {
            filename = cleanFilename;
          }
        }
      }
      
      // Determine file extension
      let extension = 'pdf';
      if (urlLower.includes('.docx') || filename.toLowerCase().endsWith('.docx')) extension = 'docx';
      else if (urlLower.includes('.doc') || filename.toLowerCase().endsWith('.doc')) extension = 'doc';
      else if (urlLower.includes('.txt') || filename.toLowerCase().endsWith('.txt')) extension = 'txt';
      else if (urlLower.includes('.pdf') || filename.toLowerCase().endsWith('.pdf')) extension = 'pdf';
      
      // If filename doesn't have extension, add it
      if (!filename.toLowerCase().endsWith(`.${extension}`)) {
        filename = `${filename}.${extension}`;
      }
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download started",
        description: `Downloading ${filename}...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update application status
  const updateApplicationStatus = async (newStatus: string, previousStatus?: string) => {
    if (!applicantData) return;

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      // Track previous status for undo BEFORE making the API call
      let prevStatusToTrack: string | undefined = previousStatus;
      if (!prevStatusToTrack && applicantData.status !== newStatus) {
        prevStatusToTrack = applicantData.status;
      }
      
      // Always track the previous status if we have it and it's different from new status
      if (prevStatusToTrack && prevStatusToTrack !== newStatus) {
        const normalizedId = normalizeId(applicantData._id);
        setStatusHistory(prev => {
          const updated: Record<string, string> = {
            ...prev,
            [normalizedId]: prevStatusToTrack!
          };
          return updated;
        });
      }
      
      await axios.patch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${applicantData._id}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: `Application status updated to ${formatStatus(newStatus)}.`,
      });
      
      // Update local state
      setApplicantData(prev => prev ? {...prev, status: newStatus} : null);
      
    } catch (error: any) {
      // Remove from history if update failed using normalized ID
      if (!previousStatus && applicantData) {
        const normalizedId = normalizeId(applicantData._id);
        setStatusHistory(prev => {
          const newHistory = { ...prev };
          // Try to find and delete by normalized ID
          const keyToDelete = Object.keys(newHistory).find(key => 
            normalizeId(key) === normalizedId
          );
          if (keyToDelete) {
            delete newHistory[keyToDelete];
          }
          return newHistory;
        });
      }
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  // Open undo dialog
  const openUndoDialog = () => {
    setUndoDialogOpen(true);
  };

  // Undo status change with selected status
  const undoStatusChange = async (newStatus: string) => {
    if (!applicantData) return;
    
    try {
      // Pass current status as previousStatus so it gets tracked for future undo
      await updateApplicationStatus(newStatus, applicantData.status);
      // Don't remove from history - keep it so user can undo again if needed
      setUndoDialogOpen(false);
    } catch (error) {
      // Error handling is done in updateApplicationStatus
    }
  };

  // Schedule interview
  const scheduleInterview = async () => {
    if (!applicantData) return;

    // Validate date and time
    if (!interviewDetails.date || !interviewDetails.time) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time for the interview.",
        variant: "destructive",
      });
      return;
    }

    const interviewDateTime = new Date(`${interviewDetails.date}T${interviewDetails.time}`);
    const now = new Date();

    // Check if interview date/time is in the past
    if (interviewDateTime <= now) {
      toast({
        title: "Invalid Date/Time",
        description: "Interview date and time must be in the future. Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      const interviewDateTimeStr = `${interviewDetails.date}T${interviewDetails.time}`;
      
      // Track previous status for undo using normalized ID
      if (applicantData) {
        const normalizedId = normalizeId(applicantData._id);
        setStatusHistory(prev => ({
          ...prev,
          [normalizedId]: applicantData.status
        }));
      }
      
      await axios.patch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${applicantData._id}/status`, {
        status: "interview_scheduled",
        notes: interviewDetails.notes,
        interviewDate: interviewDateTimeStr,
        interviewMode: interviewDetails.mode
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Interview Scheduled",
        description: `Interview scheduled for ${applicantData.applicantDetails.name}.`,
      });
      
      setInterviewDialogOpen(false);
      setInterviewDetails({ date: "", time: "", mode: "in-person", notes: "" });
      
      // Update local state
      setApplicantData(prev => prev ? {...prev, status: "interview_scheduled"} : null);
      
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      });
    }
  };

  // Save employer review
  const saveEmployerReview = async () => {
    if (!applicantData) return;

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      const reviewData = {
        applicationId: applicantData._id,
        applicantId: applicantData.applicantDetails._id,
        rating: employerReview.rating,
        comments: employerReview.comments,
        status: employerReview.status,
        interviewNotes: employerReview.interviewNotes
      };

      await axios.post(`https://findr-jobboard-backend-production.up.railway.app/api/v1/employer/reviews`, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Review Saved",
        description: "Your review has been saved successfully.",
      });
      
      setReviewDialogOpen(false);
      // Refresh the review data
      await fetchEmployerReview();
      
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-600 mt-2">Loading applicant profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!applicantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
                <p className="text-gray-600 mb-4">We couldn't find the candidate profile you were looking for.</p>
                <div className="flex gap-2">
                  <Link href="/employer/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Extract data with fallbacks
  const candidate = applicantData.applicantDetails;
  const experience = candidate.professionalExperience?.[0];
  const education = candidate.education?.[0];

  const statusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "interview_scheduled":
        return "bg-green-100 text-green-800";
      case "hired":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/employer/applicants" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applicants
            </Link>
              <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setContactDialogOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                <Download className="w-4 h-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div>

          {/* Profile Header */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {candidate.profilePicture ? (
                      <img 
                        src={candidate.profilePicture} 
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">{candidate.fullName || candidate.name}</h1>
                      <Badge className={`text-xs px-2 py-1 ${statusColor(applicantData.status)}`}>
                        {formatStatus(applicantData.status)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{candidate.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2 py-1">
                        🏆 {candidate.membershipTier || 'Blue'} Member
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                    <div className="text-sm font-medium">Applied for</div>
                    <div className="font-bold">{applicantData.jobDetails?.title || 'SEO Expert'}</div>
                    <div className="text-xs">Applied on {new Date(applicantData.appliedDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DEBUG: Show available data */}
          

          {/* Contact Information */}
          <Card className="border-0 shadow-sm mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base font-medium text-gray-900">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-6">
                {/* Email - Always show if available */}
                {candidate?.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 break-all">{candidate.email}</span>
                  </div>
                )}
                
                {/* Phone - Show only if not empty string */}
                {candidate?.phoneNumber && candidate.phoneNumber.trim() !== "" && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{candidate.phoneNumber}</span>
                  </div>
                )}
                
                {/* Location - Show only if not empty string */}
                {candidate?.location && candidate.location.trim() !== "" && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{candidate.location}</span>
                  </div>
                )}
                
                {/* Nationality - Show if available and not empty */}
                {candidate?.nationality && candidate.nationality.trim() !== "" && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">Nationality: {candidate.nationality}</span>
                  </div>
                )}
                
                {/* Date of Birth - Show only if not null and not empty */}
                {candidate?.dateOfBirth && candidate.dateOfBirth !== null && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Born: {new Date(candidate.dateOfBirth).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                      })}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Show informative message about available contact info */}
              
            </CardContent>
          </Card>

          {/* Professional Summary */}
          {candidate.professionalSummary && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 leading-relaxed">
                  {candidate.professionalSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Current Experience */}
          {candidate.professionalExperience && candidate.professionalExperience.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                  Current Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{candidate.professionalExperience[0].currentRole}</span>
                    </div>
                    <div className="text-gray-600 ml-7">{candidate.professionalExperience[0].company}</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{candidate.professionalExperience[0].yearsOfExperience} years experience</span>
                    </div>
                    <div className="text-gray-600 ml-7">{candidate.professionalExperience[0].industry} industry</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{candidate.education[0].degree || candidate.education[0].highestDegree}</div>
                    <div className="text-gray-600">{candidate.education[0].institution}</div>
                  </div>
                  <div>
                    <div className="text-gray-900 mb-1">Graduated: {candidate.education[0].graduationYear || candidate.education[0].yearOfGraduation}</div>
                    {(candidate.education[0].grade || candidate.education[0].gradeCgpa) && (
                      <div className="text-gray-600">Grade: {candidate.education[0].grade || candidate.education[0].gradeCgpa}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Certifications */}
          <div className="grid lg:grid-cols-2 gap-6 mb-4">
            {candidate.skills && candidate.skills.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-gray-900">Skills</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.certifications && candidate.certifications.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-gray-900">Certifications</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {candidate.certifications.map((cert, index) => (
                      <div key={index} className="text-gray-700 flex items-center">
                        <span className="text-blue-500 mr-2">•</span>
                        {cert}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Job Preferences */}
          {(candidate as any).jobPreferences && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                  Job Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-6">
                  {(candidate as any).jobPreferences.preferredJobType && (candidate as any).jobPreferences.preferredJobType.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Job Type</div>
                      <div className="font-semibold text-gray-900">{(candidate as any).jobPreferences.preferredJobType[0]}</div>
                    </div>
                  )}
                  {(candidate as any).jobPreferences.salaryExpectation && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Salary Expectation</div>
                      <div className="font-semibold text-gray-900">{(candidate as any).jobPreferences.salaryExpectation}</div>
                    </div>
                  )}
                  {(candidate as any).jobPreferences.preferredLocation && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Preferred Location</div>
                      <div className="font-semibold text-gray-900">{(candidate as any).jobPreferences.preferredLocation}</div>
                    </div>
                  )}
                  {(candidate as any).jobPreferences.availability && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Availability</div>
                      <div className="font-semibold text-gray-900">{(candidate as any).jobPreferences.availability}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Introductory Video */}
          {candidate.introVideo && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Introductory Video
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-purple-600" />
                    <span className="font-medium">Introduction Video</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(candidate.introVideo, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Primary Resume */}
          {candidate.resumeDocument && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Primary Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-red-600" />
                    <span className="font-medium">Primary Resume</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(candidate.resumeDocument, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Additional Documents */}
          {candidate.jobPreferences?.resumeAndDocs && candidate.jobPreferences.resumeAndDocs.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium text-gray-900">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Additional Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {candidate.jobPreferences.resumeAndDocs.map((docUrl, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-3 text-orange-600" />
                        <span className="font-medium">Document {index + 1}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(docUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Statistics */}

           {/* Action Buttons */}
           <div className="flex flex-wrap items-center justify-center gap-4">
             {applicantData.status === 'pending' && (
               <>
                 <Button
                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                   onClick={() => updateApplicationStatus('shortlisted')}
                 >
                   <Check className="w-4 h-4 mr-2" />
                   Shortlist Candidate
                 </Button>
                 <Button
                   variant="destructive"
                   className="px-8 py-3"
                   onClick={() => updateApplicationStatus('rejected')}
                 >
                   <X className="w-4 h-4 mr-2" />
                   Reject Application
                 </Button>
               </>
             )}
             
             {applicantData.status === 'shortlisted' && (
               <>
                 <Button
                   className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                   onClick={() => setInterviewDialogOpen(true)}
                 >
                   <Video className="w-4 h-4 mr-2" />
                   Schedule Interview
                 </Button>
                 <Button
                   variant="destructive"
                   className="px-8 py-3"
                   onClick={() => updateApplicationStatus('rejected')}
                 >
                   <X className="w-4 h-4 mr-2" />
                   Reject Application
                 </Button>
               </>
             )}
             
             {applicantData.status === 'interview_scheduled' && (
               <Button
                 className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                 onClick={() => updateApplicationStatus('hired')}
               >
                 <Check className="w-4 h-4 mr-2" />
                 Hire Candidate
               </Button>
             )}
             
             {(applicantData.status === 'hired' || applicantData.status === 'rejected') && (
               <Badge className={`text-sm sm:text-base px-4 py-2 ${statusColor(applicantData.status)}`}>
                 {formatStatus(applicantData.status)}
               </Badge>
             )}
             
             {/* Undo Button - Available for all statuses */}
             <Button
               variant="outline"
               className="text-orange-600 border-orange-300 hover:bg-orange-50 px-8 py-3"
               onClick={openUndoDialog}
             >
               <Undo2 className="w-4 h-4 mr-2" />
               Undo
             </Button>
             
             {/* Review Button - Available for all statuses */}
             <Button 
               onClick={() => setReviewDialogOpen(true)}
               className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
             >
               <MessageSquare className="w-4 h-4 mr-2" />
               {existingReview ? 'Edit Review' : 'Add Review'}
             </Button>
           </div>
           
           {/* Existing Review Display */}
           {existingReview && (
             <Card className="mt-6 border-purple-200 bg-purple-50">
               <CardHeader>
                 <CardTitle className="text-lg text-purple-800 flex items-center">
                   <MessageSquare className="w-5 h-5 mr-2" />
                   Your Review
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <span className="font-semibold text-sm">Rating:</span>
                     <div className="flex">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <span
                           key={star}
                           className={`text-lg ${star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                         >
                           ★
                         </span>
                       ))}
                     </div>
                     <span className="text-sm text-gray-600">({existingReview.rating}/5)</span>
                   </div>
                   
                   {existingReview.comments && (
                     <div>
                       <span className="font-semibold text-sm">Comments:</span>
                       <p className="text-sm text-gray-700 mt-1 bg-white p-3 rounded border">
                         {existingReview.comments}
                       </p>
                     </div>
                   )}
                   
                   {existingReview.interviewNotes && (
                     <div>
                       <span className="font-semibold text-sm">Interview Notes:</span>
                       <p className="text-sm text-gray-700 mt-1 bg-white p-3 rounded border">
                         {existingReview.interviewNotes}
                       </p>
                     </div>
                   )}
                   
                   <div className="text-xs text-gray-500">
                     Last updated: {new Date(existingReview.updatedAt).toLocaleDateString()}
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
        </div>
      </main>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {applicantData?.applicantDetails?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails(prev => ({...prev, date: e.target.value}))}
                className="col-span-3"
                min={getTodayDateString()}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails(prev => ({...prev, time: e.target.value}))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mode" className="text-right">
                Interview Mode
              </Label>
              <Select value={interviewDetails.mode} onValueChange={(value) => setInterviewDetails(prev => ({...prev, mode: value}))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select interview mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      In-Person
                    </div>
                  </SelectItem>
                  <SelectItem value="virtual">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Virtual
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={interviewDetails.notes}
                onChange={(e) => setInterviewDetails(prev => ({...prev, notes: e.target.value}))}
                placeholder="Interview details, location, or meeting link..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={scheduleInterview} className="gradient-bg text-white">
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {existingReview ? 'Edit Review' : 'Add Review'}
            </DialogTitle>
            <DialogDescription>
              Rate and review {applicantData?.applicantDetails?.name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating (1-5 stars)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEmployerReview(prev => ({...prev, rating: star}))}
                    className={`text-2xl transition-colors ${
                      star <= employerReview.rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">Current rating: {employerReview.rating}/5</p>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Share your thoughts about this candidate..."
                value={employerReview.comments}
                onChange={(e) => setEmployerReview(prev => ({...prev, comments: e.target.value}))}
                rows={4}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Review Status</Label>
              <Select value={employerReview.status} onValueChange={(value) => setEmployerReview(prev => ({...prev, status: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interview Notes */}
            <div className="space-y-2">
              <Label htmlFor="interviewNotes">Interview Notes (Optional)</Label>
              <Textarea
                id="interviewNotes"
                placeholder="Notes from interview or additional observations..."
                value={employerReview.interviewNotes}
                onChange={(e) => setEmployerReview(prev => ({...prev, interviewNotes: e.target.value}))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveEmployerReview} 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={employerReview.rating === 0}
            >
              {existingReview ? 'Update Review' : 'Save Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Details Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {candidate.fullName || candidate.name}</DialogTitle>
            <DialogDescription>
              Quick access to the candidate&apos;s contact information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {candidate.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>{candidate.email}</span>
              </div>
            )}
            {candidate.phoneNumber && candidate.phoneNumber.trim() !== "" && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{candidate.phoneNumber}</span>
              </div>
            )}
            {candidate.location && candidate.location.trim() !== "" && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>{candidate.location}</span>
              </div>
            )}
            {candidate.nationality && candidate.nationality.trim() !== "" && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-amber-600" />
                <span>Nationality: {candidate.nationality}</span>
              </div>
            )}
            {candidate.dateOfBirth && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>
                  Born: {new Date(candidate.dateOfBirth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Status Change Dialog */}
      <Dialog open={undoDialogOpen} onOpenChange={setUndoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Application Status</DialogTitle>
            <DialogDescription>
              Select the status you want to set for {applicantData?.applicantDetails?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Current Status: <span className="font-semibold">{formatStatus(applicantData?.status || '')}</span></Label>
              {(() => {
                // Use normalized ID to find previous status
                const normalizedId = applicantData?._id ? normalizeId(applicantData._id) : '';
                const historyKey = Object.keys(statusHistory).find(key => 
                  normalizeId(key) === normalizedId
                );
                const previousStatus = historyKey ? statusHistory[historyKey] : undefined;
                return previousStatus ? (
                  <Label>Previous Status: <span className="font-semibold text-orange-600">{formatStatus(previousStatus)}</span></Label>
                ) : null;
              })()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="undo-status">Select New Status</Label>
              <Select onValueChange={(value) => undoStatusChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions
                    .filter(opt => opt.value !== applicantData?.status)
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUndoDialogOpen(false);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
