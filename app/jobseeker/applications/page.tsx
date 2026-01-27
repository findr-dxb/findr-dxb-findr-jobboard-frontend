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
import { Calendar, MapPin, Building2, DollarSign, Briefcase, Eye, Clock } from "lucide-react";

interface Application {
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
    status: string;
  };
  status: string;
  appliedDate: string;
  interviewDate?: string;
  interviewMode?: string;
  expectedSalary?: {
    min: number;
    max: number;
  };
  viewedByEmployer: boolean;
}

interface ApplicationStats {
  total: number;
  pending: number;
  shortlisted: number;
  interview_scheduled: number;
  hired: number;
  rejected: number;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview Scheduled", value: "interview_scheduled" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "shortlisted":
      return "bg-blue-100 text-blue-800";
    case "interview_scheduled":
      return "bg-green-100 text-green-800";
    case "hired":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    hired: 0,
    rejected: 0
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your applications.",
          variant: "destructive",
        });
        router.push('/login/jobseeker');
        return;
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          status: status || undefined,
        }
      });

      setApplications(response.data.data || []);
      setStats(response.data.stats || {
        total: 0,
        pending: 0,
        shortlisted: 0,
        interview_scheduled: 0,
        hired: 0,
        rejected: 0
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [status]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.jobId?.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.jobId?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        app.jobId?.location?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [applications, search]);

  // Summary stats
  const total = stats.total;
  const active = stats.pending + stats.shortlisted + stats.interview_scheduled;
  const awaiting = stats.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Title & Summary Cards */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Your Applications</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Card className="rounded-xl shadow-md bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{total}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{active}</div>
                  <div className="text-sm text-gray-600">Active Applications</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{awaiting}</div>
                  <div className="text-sm text-gray-600">Jobs Awaiting Feedback</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Filter/Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by job title, company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-64"
            />
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Loading State */}
          {isLoading && (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 mt-2">Loading applications...</p>
            </div>
          )}

          {/* Applications Grid */}
          {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {filteredApps.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <p>No applications found.</p>
                  <Button 
                    className="mt-4 gradient-bg text-white"
                    onClick={() => router.push('/jobseeker/search')}
                  >
                    Find Jobs to Apply
                  </Button>
                </div>
              )}
              {filteredApps.map((app) => (
                <Card key={app._id} className="transition-shadow duration-200 shadow-md border-0 bg-white rounded-xl hover:shadow-lg">
                  <CardContent className="p-6">
                    {/* Application Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {app.jobId?.title || 'Position Unavailable'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-1" />
                          {app.jobId?.companyName || 'Company Unavailable'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(app.status)}`}>
                          {formatStatus(app.status)}
                        </Badge>
                        {app.viewedByEmployer && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Viewed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {app.jobId?.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Applied: {new Date(app.appliedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {app.status === 'interview_scheduled' && app.interviewDate && (
                        <>
                          <div className="flex items-center text-sm text-green-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Interview: {new Date(app.interviewDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            {app.interviewMode === 'virtual' ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                                </svg>
                                Virtual Interview
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                </svg>
                                In-Person Interview
                              </>
                            )}
                          </div>
                        </>
                      )}
                      {app.jobId?.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          AED {app.jobId.salary.min} - {app.jobId.salary.max}
                        </div>
                      )}
                      {app.jobId?.jobType && app.jobId.jobType.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {app.jobId.jobType.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Job Status */}
                    {app.jobId?.status !== 'active' && (
                      <div className="p-2 bg-yellow-50 rounded-lg mb-3">
                        <p className="text-xs text-yellow-800">
                          This job is currently {app.jobId?.status || 'unavailable'}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/jobseeker/applications/${app._id}`)}
                      >
                        View Details
                      </Button>
                      {app.status === 'interview_scheduled' && (
                        <Button
                          size="sm"
                          className="gradient-bg text-white flex-1"
                          onClick={() => router.push(`/jobseeker/interviews/${app.jobId._id}`)}
                        >
                          Interview Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 