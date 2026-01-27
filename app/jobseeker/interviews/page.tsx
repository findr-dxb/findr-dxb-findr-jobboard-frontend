"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Interview {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  interviewDate: string;
  interviewMode?: string;
  employerNotes?: string;
  status: string;
}

const statusOptions = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "Rescheduled", value: "Rescheduled" },
  { label: "Completed", value: "Completed" },
];
const modeOptions = [
  { label: "All", value: "" },
  { label: "Zoom", value: "Zoom" },
  { label: "In-Person", value: "In-Person" },
  { label: "Call", value: "Call" },
];
const statusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Rescheduled":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function InterviewsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch interviews from API
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login/jobseeker');
        return;
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/interviews/jobseeker', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(intv => {
      const matchesSearch =
        intv.jobId?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        intv.jobId?.title?.toLowerCase().includes(search.toLowerCase());
      // For now, we'll just show all interview_scheduled status
      return matchesSearch;
    });
  }, [search, interviews]);

  // Summary stats
  const now = new Date();
  const upcoming = interviews.filter(i => new Date(i.interviewDate) > now).length;
  const past = interviews.filter(i => new Date(i.interviewDate) <= now).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Title & Summary Cards */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Interview Schedule</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Card className="rounded-xl shadow-md bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{upcoming}</div>
                  <div className="text-sm text-gray-600">Upcoming Interviews</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{past}</div>
                  <div className="text-sm text-gray-600">Past Interviews</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Filter/Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by company, job role…"
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
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {modeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Interviews Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <div className="col-span-full text-center text-gray-400 py-12">Loading interviews...</div>
            )}
            {!loading && filteredInterviews.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">No interviews found.</div>
            )}
            {!loading && filteredInterviews.map((intv) => (
              <Card key={intv._id} className="transition-shadow duration-200 shadow-md border-0 bg-white rounded-xl hover:shadow-lg flex flex-col justify-between min-h-[150px]">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/jobseeker/interviews/${intv._id}`}
                      className="font-semibold text-lg text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {intv.jobId?.title || 'Job Title'}
                    </Link>
                    <Badge className={`text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800`}>Scheduled</Badge>
                  </div>
                  <div className="text-sm text-gray-600">Company: <span className="font-medium text-gray-800">{intv.jobId?.companyName || 'Company'}</span></div>
                  <div className="text-xs text-gray-500">Date & Time: {new Date(intv.interviewDate).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    Type: 
                    {intv.interviewMode === 'virtual' ? (
                      <span className="ml-1 flex items-center text-blue-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                        </svg>
                        Virtual
                      </span>
                    ) : (
                      <span className="ml-1 flex items-center text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        In-Person
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Location: {intv.jobId?.location || 'Not specified'}</div>
                  {intv.employerNotes && (
                    <div className="text-xs text-gray-500">Notes: {intv.employerNotes}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 