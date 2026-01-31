"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Edit2, X, Pause, Play, Eye, Users, Calendar, MapPin, DollarSign, RefreshCw, Briefcase, TrendingUp, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  status: string;
  createdAt: string;
  applications?: any[];
  applicationCount?: number;
  views?: number;
  salary?: number | {
    min: number;
    max: number;
  };
  jobType?: string[];
  experienceLevel?: string;
  description?: string;
}

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Closed", value: "closed" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md";
    case "paused":
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md";
    case "closed":
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
  
  if (status === 'active') {
    return "from-emerald-50 via-green-50 to-emerald-100";
  } else if (status === 'paused') {
    return "from-yellow-50 via-orange-50 to-yellow-100";
  } else if (status === 'closed') {
    return "from-red-50 via-pink-50 to-red-100";
  }
  
  return gradients[index % gradients.length];
};

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your jobs.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          ...(status && status !== 'all' && { status }),
          ...(search && { search }),
        }
      });

      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  // Handle search when user stops typing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (search !== "") {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [search]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                           job.companyName?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [jobs, search]);

  // Job status counts
  const jobCounts = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length,
      paused: jobs.filter(job => job.status === 'paused').length,
      closed: jobs.filter(job => job.status === 'closed').length,
    };
  }, [jobs]);

  // Toggle job status (pause/resume/reactivate)
  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      // If active, pause it. If paused or closed, activate it.
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      await axios.put(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const actionMessage = currentStatus === 'closed' ? 'reactivated' : (newStatus === 'active' ? 'resumed' : 'paused');
      toast({
        title: "Success",
        description: `Job ${actionMessage} successfully.`,
      });
      
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close job
  const handleCloseJob = async () => {
    if (!closeJobId) return;

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.put(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${closeJobId}/close`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: "Job closed successfully.",
      });
      
      setCloseJobId(null);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error closing job:', error);
      toast({
        title: "Error",
        description: "Failed to close job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Navigate to edit page
  const handleEditJob = (jobId: string) => {
    router.push(`/employer/active-jobs/${jobId}/edit`);
  };

  // View applicants
  const handleViewApplicants = (jobId: string) => {
    router.push(`/employer/applicants/${jobId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 bg-gradient-to-r from-white via-emerald-50/50 to-blue-50 backdrop-blur-sm p-6 rounded-xl border-b border-emerald-200/50 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight gradient-text flex items-center gap-2">
                  <Briefcase className="w-8 h-8 text-emerald-600" />
                  My Jobs
                </h1>
                <p className="text-gray-600 text-base">
                  Manage all your job postings
                  {jobs.length > 0 && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      ({jobs.length} total)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-white to-emerald-50/30">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Search Jobs
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by job title or company…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                    />
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Status
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="border-2 border-blue-200 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchJobs}
                    disabled={isLoading}
                    className="rounded-xl border-2 border-purple-200 shadow-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Status Summary */}
          {!isLoading && jobs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-emerald-200/30 rounded-bl-full"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="text-2xl font-bold text-gray-900">{jobCounts.total}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Jobs</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-bl-full"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="text-2xl font-bold text-emerald-700">{jobCounts.active}</div>
                  <div className="text-sm text-gray-600 font-medium">Active</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-bl-full"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="text-2xl font-bold text-yellow-700">{jobCounts.paused}</div>
                  <div className="text-sm text-gray-600 font-medium">Paused</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-bl-full"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="text-2xl font-bold text-red-700">{jobCounts.closed}</div>
                  <div className="text-sm text-gray-600 font-medium">Closed</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-2">Loading jobs...</p>
            </div>
          )}

          {/* Jobs Grid */}
          {!isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No jobs found</p>
                  <p className="text-sm mb-4">{status ? ` with status "${statusOptions.find(opt => opt.value === status)?.label}"` : 'Try adjusting your filters or search terms'}</p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                    onClick={() => router.push('/employer/post-job')}
                  >
                    {jobs.length === 0 ? 'Post Your First Job' : 'Post Another Job'}
                  </Button>
                </div>
              )}
              {filteredJobs.map((job, idx) => {
                const cardGradient = getCardGradient(idx, job.status);
                return (
                  <Card key={job._id} className={`transition-shadow duration-200 shadow-lg border-2 border-transparent bg-gradient-to-br ${cardGradient} rounded-2xl overflow-hidden relative`}>
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-bl-full"></div>
                    
                    <CardContent className="p-6 relative z-10">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-sm text-gray-600 font-medium">{job.companyName}</p>
                        </div>
                        <Badge className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-2 mb-4 pt-2 border-t border-white/50">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>Posted: {formatDate(job.createdAt)}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">AED {typeof job.salary === 'number' ? job.salary.toLocaleString() : (job.salary.min || job.salary.max || 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                          <div className="flex items-center text-gray-700">
                            <Users className="w-4 h-4 mr-2 text-emerald-600" />
                            <span className="font-medium">{job.applications?.length || job.applicationCount || 0}</span>
                            <span className="ml-1">Applicants</span>
                          </div>
                          <div className="flex items-center text-blue-600">
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="font-medium">{job.views || 0}</span>
                            <span className="ml-1">Views</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                            onClick={() => handleViewApplicants(job._id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Applicants
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                            onClick={() => handleEditJob(job._id)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className={job.status === 'closed' ? "" : (job.status === 'active' || job.status === 'paused' ? "grid grid-cols-2 gap-2" : "")}>
                          {(job.status === 'active' || job.status === 'paused' || job.status === 'closed') && (
                            <Button
                              size="sm"
                              className={`bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md ${job.status === 'closed' ? 'w-full' : ''}`}
                              onClick={() => handleToggleStatus(job._id, job.status)}
                            >
                              {job.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Resume
                                </>
                              )}
                            </Button>
                          )}
                          {job.status !== 'closed' && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                              onClick={() => setCloseJobId(job._id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Close Confirmation Dialog */}
          <AlertDialog open={!!closeJobId} onOpenChange={() => setCloseJobId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close this job?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will close the job posting and hide it from job seekers. The job and all associated applications will be preserved, but job seekers will no longer be able to see or apply to this position.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCloseJob} className="bg-red-600 hover:bg-red-700">
                  Close Job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
} 