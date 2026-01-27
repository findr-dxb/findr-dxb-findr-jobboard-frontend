"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Video, MapPin, User, Briefcase, TrendingUp } from "lucide-react";

interface Interview {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  applicantId: {
    _id: string;
    name?: string;
    fullName?: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  interviewDate: string;
  interviewMode?: string;
  employerNotes?: string;
  status: string;
}

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Online", value: "Online" },
  { label: "In-Person", value: "In-Person" },
];
const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Completed", value: "Completed" },
  { label: "Rescheduled", value: "Rescheduled" },
];
const statusColor = (status: string) => {
  switch (status) {
    case "Upcoming":
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md";
    case "Completed":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md";
    case "Rescheduled":
      return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
  }
};

const getCardGradient = (index: number, interviewMode?: string) => {
  const gradients = [
    "from-blue-50 via-emerald-50 to-blue-100",
    "from-emerald-50 via-blue-50 to-emerald-100",
    "from-purple-50 via-pink-50 to-purple-100",
    "from-cyan-50 via-blue-50 to-cyan-100",
    "from-indigo-50 via-purple-50 to-indigo-100",
    "from-teal-50 via-emerald-50 to-teal-100",
  ];
  
  if (interviewMode === 'virtual') {
    return "from-violet-50 via-purple-50 to-violet-100";
  }
  
  return gradients[index % gradients.length];
};

export default function InterviewsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
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
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/interviews/employer', {
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
      const candidateName = intv.applicantId?.fullName || intv.applicantId?.name || intv.applicantId?.email || '';
      const matchesSearch = candidateName.toLowerCase().includes(search.toLowerCase()) ||
                           intv.jobId?.title?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search, interviews]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-white via-emerald-50/50 to-blue-50 backdrop-blur-sm pt-4 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-200/50 rounded-xl px-6 shadow-sm">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight gradient-text flex items-center gap-2">
                <Calendar className="w-8 h-8 text-emerald-600" />
                Interviews
              </h1>
              <p className="text-gray-600 text-base">Manage all your scheduled interviews</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by candidate name or position"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-full sm:w-64 transition-all"
                />
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-600" />
              </div>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Interviews Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInterviews.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">No interviews found.</div>
            )}
            {filteredInterviews.map((intv, idx) => {
              // Use the application ID (intv._id) since interviews are Application documents
              const applicationId = intv._id;
              const candidateName = intv.applicantId?.fullName || intv.applicantId?.name || intv.applicantId?.email || 'Unknown';
              const jobTitle = intv.jobId?.title || 'Unknown Position';
              const interviewDate = intv.interviewDate ? new Date(intv.interviewDate).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'Not scheduled';
              const interviewMode = intv.interviewMode || 'in-person';
              const formattedMode = interviewMode === 'virtual' ? 'Virtual' : interviewMode === 'in-person' ? 'In-Person' : interviewMode;
              const cardGradient = getCardGradient(idx, interviewMode);
              
              return (
                <Link key={idx} href={`/employer/applicants/profile/${applicationId}`}
                  className="block">
                  <Card className={`transition-shadow duration-200 shadow-lg border-2 border-transparent bg-gradient-to-br ${cardGradient} rounded-2xl flex flex-col justify-between min-h-[200px] overflow-hidden relative`}>
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-bl-full"></div>
                    
                    <CardContent className="p-6 flex flex-col gap-4 relative z-10">
                      {/* Header with candidate name and status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {candidateName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{candidateName}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Briefcase className="w-3 h-3" />
                              {jobTitle}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusColor(intv.status || 'Upcoming')} shadow-sm whitespace-nowrap`}>
                          {intv.status || 'Upcoming'}
                        </span>
                      </div>

                      {/* Interview details with icons */}
                      <div className="space-y-2 pt-2 border-t border-white/50">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{interviewDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {interviewMode === 'virtual' ? (
                            <Video className="w-4 h-4 text-purple-600" />
                          ) : (
                            <MapPin className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="font-medium">{formattedMode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
} 