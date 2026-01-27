"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Search, Briefcase, Calendar, MapPin, Mail, Building, CheckCircle, User } from "lucide-react";

interface HiredCandidate {
  _id: string;
  applicantDetails: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    profilePicture?: string;
  };
  jobDetails: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  appliedDate: string;
  updatedAt: string;
  status: string;
}

const roleOptions = [
  { label: "All Roles", value: "" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getCardGradient = (index: number) => {
  const gradients = [
    "from-purple-50 via-pink-50 to-purple-100",
    "from-emerald-50 via-green-50 to-emerald-100",
    "from-blue-50 via-cyan-50 to-blue-100",
    "from-indigo-50 via-purple-50 to-indigo-100",
    "from-pink-50 via-rose-50 to-pink-100",
    "from-violet-50 via-purple-50 to-violet-100",
  ];
  
  return gradients[index % gradients.length];
};

export default function HiresPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [hires, setHires] = useState<HiredCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch hired candidates from API
  const fetchHiredCandidates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view hired candidates.",
          variant: "destructive",
        });
        router.push('/login/employer');
        return;
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/employer', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          status: 'hired',
          limit: 100 // Get more hired candidates
        }
      });

      setHires(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hired candidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hired candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHiredCandidates();
  }, []);

  const filteredHires = useMemo(() => {
    return hires.filter(hire => {
      const matchesSearch =
        hire.applicantDetails.name.toLowerCase().includes(search.toLowerCase()) ||
        hire.jobDetails.title.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role ? hire.jobDetails.title === role : true;
      return matchesSearch && matchesRole;
    });
  }, [search, role, hires]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-white via-purple-50/50 to-pink-50 backdrop-blur-sm p-6 rounded-xl border-b border-purple-200/50 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight gradient-text flex items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                  Hired Candidates
                </h1>
                <p className="text-gray-600 text-base">Celebrate your successful hires</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search by name, role or joining date…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-64 rounded-xl border-2 border-purple-200 bg-white px-4 py-2 pl-10 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-600" />
                </div>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-2">Loading hired candidates...</p>
            </div>
          )}

          {/* Hires Grid */}
          {!isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHires.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">
                    {hires.length === 0 ? "No hired candidates yet." : "No hired candidates match your search."}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Start hiring to see candidates here</p>
                </div>
              )}
              {filteredHires.map((hire, idx) => {
                const cardGradient = getCardGradient(idx);
                const candidateName = hire.applicantDetails?.name || 'Unknown';
                
                return (
                  <Link key={hire._id} href={`/employer/applicants/profile/${hire._id}`}
                    className="block">
                    <Card className={`transition-shadow duration-200 shadow-lg border-2 border-transparent bg-gradient-to-br ${cardGradient} rounded-2xl overflow-hidden relative`}>
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-bl-full"></div>
                      
                      <CardContent className="p-6 relative z-10 flex flex-col gap-4">
                        {/* Header with candidate name and status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {hire.applicantDetails?.profilePicture ? (
                              <div className="w-12 h-12 rounded-full ring-2 ring-white shadow-md overflow-hidden">
                                <img 
                                  src={hire.applicantDetails.profilePicture} 
                                  alt={candidateName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                                {candidateName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">{candidateName}</h3>
                              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md text-xs px-3 py-1 rounded-full font-semibold mt-1">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Hired
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Candidate Details */}
                        <div className="space-y-2 pt-2 border-t border-white/50">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{hire.jobDetails?.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Building className="w-4 h-4 text-blue-600" />
                            <span>{hire.jobDetails?.companyName}</span>
                          </div>
                          {hire.applicantDetails?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="w-4 h-4 text-emerald-600" />
                              <span className="truncate">{hire.applicantDetails.email}</span>
                            </div>
                          )}
                          {hire.applicantDetails?.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <MapPin className="w-4 h-4 text-pink-600" />
                              <span>{hire.applicantDetails.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span>Applied: {formatDate(hire.appliedDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">Hired: {formatDate(hire.updatedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 