"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, Phone, MapPin, Calendar, FileText, Star, 
  Check, X, Clock, Video, Briefcase, DollarSign, ArrowLeft, Search, Undo2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Applicant {
  _id: string;
  applicantDetails: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    profilePicture?: string;
    membershipTier?: string;
    professionalSummary?: string;
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
  rating?: number;
  viewedByEmployer: boolean;
  employerNotes?: string;
  employerComments?: string;
  reviewTimestamp?: string;
  interviewDate?: string;
}

interface JobDetails {
  _id: string;
  title: string;
  companyName: string;
  location: string;
}

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
    case "shortlisted":
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md";
    case "interview_scheduled":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md";
    case "hired":
      return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md";
    case "rejected":
      return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
  }
};

const getCardGradient = (index: number, status?: string) => {
  const gradients = [
    "from-blue-50 via-emerald-50 to-blue-100",
    "from-emerald-50 via-blue-50 to-emerald-100",
    "from-purple-50 via-pink-50 to-purple-100",
    "from-cyan-50 via-blue-50 to-cyan-100",
    "from-indigo-50 via-purple-50 to-indigo-100",
    "from-teal-50 via-emerald-50 to-teal-100",
  ];
  
  if (status === 'hired') {
    return "from-purple-50 via-pink-50 to-purple-100";
  } else if (status === 'interview_scheduled') {
    return "from-emerald-50 via-green-50 to-emerald-100";
  } else if (status === 'shortlisted') {
    return "from-blue-50 via-cyan-50 to-blue-100";
  }
  
  return gradients[index % gradients.length];
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

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

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "",
    time: "",
    mode: "in-person",
    notes: ""
  });
  const [statusHistory, setStatusHistory] = useState<Record<string, string>>({}); // Track previous statuses for undo
  const [undoDialogOpen, setUndoDialogOpen] = useState(false);
  const [applicantToUndo, setApplicantToUndo] = useState<Applicant | null>(null);

  // Fetch applicants for the job
  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view applicants.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      // Fetch job details
      const jobResponse = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setJobDetails(jobResponse.data.data);

      // Fetch applicants
      const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setApplicants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch =
        app.applicantDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.applicantDetails?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter && statusFilter !== "all" ? app.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter]);

  const updateApplicantStatus = async (applicationId: string, newStatus: string, previousStatus?: string, notes?: string) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      // Track previous status for undo BEFORE making the API call
      let prevStatusToTrack: string | undefined = previousStatus;
      if (!prevStatusToTrack) {
        const currentApplicant = applicants.find(a => a._id === applicationId);
        if (currentApplicant && currentApplicant.status !== newStatus) {
          prevStatusToTrack = currentApplicant.status;
        }
      }
      
      // Always track the previous status if we have it and it's different from new status
      if (prevStatusToTrack && prevStatusToTrack !== newStatus) {
        const normalizedId = normalizeId(applicationId);
        setStatusHistory(prev => {
          const updated: Record<string, string> = {
            ...prev,
            [normalizedId]: prevStatusToTrack!
          };
          return updated;
        });
      }
      
      await axios.patch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${applicationId}/status`, {
        status: newStatus,
        notes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: `Applicant status updated to ${formatStatus(newStatus)}.`,
      });
      
      fetchApplicants(); // Refresh the list
    } catch (error: any) {
      // Remove from history if update failed using normalized ID
      if (!previousStatus) {
        const normalizedId = normalizeId(applicationId);
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
        description: error.response?.data?.message || "Failed to update applicant status.",
        variant: "destructive",
      });
    }
  };

  // Open undo dialog
  const openUndoDialog = (applicant: Applicant) => {
    setApplicantToUndo(applicant);
    setUndoDialogOpen(true);
  };

  // Undo status change with selected status
  const undoStatusChange = async (newStatus: string) => {
    if (!applicantToUndo) return;
    
    try {
      // Pass current status as previousStatus so it gets tracked for future undo
      await updateApplicantStatus(applicantToUndo._id, newStatus, applicantToUndo.status);
      // Don't remove from history - keep it so user can undo again if needed
      setUndoDialogOpen(false);
      setApplicantToUndo(null);
    } catch (error) {
      // Error handling is done in updateApplicantStatus
    }
  };

  const scheduleInterview = async () => {
    if (!selectedApplicant) return;

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
      if (selectedApplicant) {
        const normalizedId = normalizeId(selectedApplicant._id);
        setStatusHistory(prev => ({
          ...prev,
          [normalizedId]: selectedApplicant.status
        }));
      }
      
      await axios.patch(`https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/${selectedApplicant._id}/status`, {
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
        description: `Interview scheduled for ${selectedApplicant.applicantDetails.name}.`,
      });
      
      setInterviewDialogOpen(false);
      setInterviewDetails({ date: "", time: "", mode: "in-person", notes: "" });
      fetchApplicants();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 bg-gradient-to-r from-white via-emerald-50/50 to-blue-50 backdrop-blur-sm p-6 rounded-xl border-b border-emerald-200/50 shadow-sm">
            <Button
              variant="ghost"
              onClick={() => router.push('/employer/active-jobs')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight gradient-text flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-emerald-600" />
                Applicants for {jobDetails?.title || "Loading..."}
              </h1>
              <p className="text-gray-600 text-base">
                {jobDetails?.companyName} • {jobDetails?.location}
              </p>
              <div className="mt-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md">{applicants.length} Total Applicants</Badge>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-white to-emerald-50/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-600" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-2 border-blue-200 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-2">Loading applicants...</p>
            </div>
          )}

          {/* Applicants Grid */}
          {!isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplicants.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <p>No applicants found.</p>
                </div>
              )}
              {filteredApplicants.map((applicant, idx) => {
                const cardGradient = getCardGradient(idx, applicant.status);
                const applicantName = applicant.applicantDetails?.name || 'Unknown';
                
                return (
                  <Card key={applicant._id} className={`transition-shadow duration-200 shadow-lg border-2 border-transparent bg-gradient-to-br ${cardGradient} rounded-2xl overflow-hidden relative`}>
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-bl-full"></div>
                    
                    <CardContent className="p-6 relative z-10">
                      {/* Applicant Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          {applicant.applicantDetails?.profilePicture ? (
                            <div className="w-12 h-12 rounded-full ring-2 ring-white shadow-md overflow-hidden">
                              <img 
                                src={applicant.applicantDetails.profilePicture} 
                                alt={applicantName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                              {applicantName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">
                              {applicantName}
                            </h3>
                            <Badge className={`text-xs px-3 py-1 rounded-full font-semibold mt-1 ${statusColor(applicant.status)}`}>
                              {formatStatus(applicant.status)}
                            </Badge>
                          </div>
                        </div>
                        {!applicant.viewedByEmployer && (
                          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md text-xs px-2 py-1">New</Badge>
                        )}
                      </div>

                      {/* Applicant Details */}
                      <div className="space-y-2 mb-4 pt-2 border-t border-white/50 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="truncate">{applicant.applicantDetails?.email}</span>
                        </div>
                        {applicant.applicantDetails?.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-emerald-600" />
                            <span>{applicant.applicantDetails.phone}</span>
                          </div>
                        )}
                        {applicant.applicantDetails?.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>{applicant.applicantDetails.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                        </div>
                        {applicant.expectedSalary && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>Expected: AED {applicant.expectedSalary.min} - {applicant.expectedSalary.max}</span>
                          </div>
                        )}
                        {applicant.availability && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-cyan-600" />
                            <span>{applicant.availability}</span>
                          </div>
                        )}
                      </div>


                    {/* Comments Section */}
                    {applicant.employerComments && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Employer Comments:</div>
                        <div className="text-sm text-gray-600">{applicant.employerComments}</div>
                        {applicant.reviewTimestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            Reviewed: {new Date(applicant.reviewTimestamp).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {/* First Row: View Profile (50%) and Undo (50%) */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                            onClick={() => router.push(`/employer/applicants/profile/${applicant._id}`)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50 shadow-md"
                            onClick={() => openUndoDialog(applicant)}
                          >
                            <Undo2 className="w-4 h-4 mr-1" />
                            Undo
                          </Button>
                        </div>
                        
                        {/* Second Row: Status-specific buttons */}
                        {applicant.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                              onClick={() => updateApplicantStatus(applicant._id, 'shortlisted')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                              onClick={() => updateApplicantStatus(applicant._id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {applicant.status === 'shortlisted' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                              onClick={() => {
                                setSelectedApplicant(applicant);
                                setInterviewDialogOpen(true);
                              }}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                              onClick={() => updateApplicantStatus(applicant._id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {applicant.status === 'interview_scheduled' && (
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
                            onClick={() => updateApplicantStatus(applicant._id, 'hired')}
                          >
                            <Briefcase className="w-4 h-4 mr-1" />
                            Hire
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {selectedApplicant?.applicantDetails?.name}
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

      {/* Undo Status Change Dialog */}
      <Dialog open={undoDialogOpen} onOpenChange={setUndoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Application Status</DialogTitle>
            <DialogDescription>
              Select the status you want to set for {applicantToUndo?.applicantDetails?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Current Status: <span className="font-semibold">{formatStatus(applicantToUndo?.status || '')}</span></Label>
              {(() => {
                // Use normalized ID to find previous status
                const normalizedId = applicantToUndo?._id ? normalizeId(applicantToUndo._id) : '';
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
                    .filter(opt => opt.value !== 'all' && opt.value !== applicantToUndo?.status)
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
              setApplicantToUndo(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

