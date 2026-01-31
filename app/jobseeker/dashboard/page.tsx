"use client"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, UserCheck, TrendingUp, Clock, Star, Award, Eye, Calendar, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
  };
  status: string;
  appliedDate: string;
  referredBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculatedCompletion, setCalculatedCompletion] = useState(0);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [referralStats, setReferralStats] = useState({ total: 0, active: 0, successful: 0 });
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [rmServiceStatus, setRmServiceStatus] = useState("inactive");
  const { toast } = useToast();

  // Refs to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const lastFocusTimeRef = useRef(0);

  // Fetch user applications
  const fetchApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 5 // Only get recent 5 applications
        }
      });

      setApplications(response.data.data || []);
      } catch (error) {
        // Silent error handling
      }
  }, []);

  // Fetch interview count
  const fetchInterviewCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/interviews/jobseeker', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 1 // Just get the count
        }
      });

      setInterviewCount(response.data.total || 0);
    } catch (error) {
      // Silent error handling
    }
  }, []);

  // Fetch referral stats
  const fetchReferralStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/referrals/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 1 // Just get the stats
        }
      });

      if (response.data && response.data.stats) {
        const stats = response.data.stats;
        setReferralStats({
          total: stats.total || 0,
          active: (stats.pending || 0) + (stats.shortlisted || 0) + (stats.interview_scheduled || 0),
          successful: stats.hired || 0
        });
      }
    } catch (error) {
      // Silent error handling
    }
  }, []);

  // Fetch recommended jobs
  const fetchRecommendedJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 3 // Get top 3 recommendations for dashboard
        }
      });

      setRecommendedJobs(response.data.data || []);
    } catch (error: any) {
      // Silent error handling
      // Set empty array on error to show "no recommendations" state
      setRecommendedJobs([]);
    }
  }, []);

  // Determine user tier based on points and profile (for display purposes only)
  const determineUserTier = (profile: any, basePoints: number) => {
    const yearsExp = profile?.professionalExperience?.[0]?.yearsOfExperience || 0;
    const isEmirati = profile?.nationality?.toLowerCase()?.includes("emirati");

    // If Emirati, always Platinum tier
    if (isEmirati) return "Platinum";
    // Otherwise determine by experience
    else if (basePoints >= 500) return "Platinum";
    else if (yearsExp >= 5) return "Gold";
    else if (yearsExp >= 2 && yearsExp <= 5) return "Silver";
    else return "Blue"; // 0-1 year
  };

  // Calculate profile completion and points (same logic as profile page)
  const calculateProfileMetrics = (profile: any) => {
    let completed = 0;
    const totalFields = 24; // Updated: removed employmentVisa (not in form, matching profile page)

    // Personal Info (9 fields - employmentVisa is optional, not in form)
    if (profile?.fullName) completed++;
    if (profile?.email) completed++;
    if (profile?.phoneNumber) completed++;
    if (profile?.location) completed++;
    if (profile?.dateOfBirth) completed++;
    if (profile?.nationality) completed++;
    if (profile?.professionalSummary) completed++;
    if (profile?.emirateId) completed++;
    if (profile?.passportNumber) completed++;

    // Experience (4 fields)
    const exp = profile?.professionalExperience?.[0];
    if (exp?.currentRole) completed++;
    if (exp?.company) completed++;
    if (exp?.yearsOfExperience) completed++;
    if (exp?.industry) completed++;

    // Education (4 fields)
    const edu = profile?.education?.[0];
    if (edu?.highestDegree) completed++;
    if (edu?.institution) completed++;
    if (edu?.yearOfGraduation) completed++;
    if (edu?.gradeCgpa) completed++;

    // Skills, Preferences, Certifications, Resume (4 fields)
    if (profile?.skills && profile.skills.length > 0) completed++;
    if (profile?.jobPreferences?.preferredJobType && profile.jobPreferences.preferredJobType.length > 0) completed++;
    if (profile?.certifications && profile.certifications.length > 0) completed++;
    if (profile?.resumeDocument || (profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0)) completed++;

    // Social Links (3 fields)
    if (profile?.socialLinks?.linkedIn) completed++;
    if (profile?.socialLinks?.instagram) completed++;
    if (profile?.socialLinks?.twitterX) completed++;

    const percentage = Math.round((completed / totalFields) * 100);
    
    // Calculate base points
    const basePoints = 50 + percentage * 2;
    
    // Determine tier (for display purposes only, not used in calculation)
    const tier = determineUserTier(profile, basePoints);
    
    // Use base points directly without multiplier
    const calculatedBasePoints = basePoints;
    
    // Add other points (applications, RM service)
    const applicationPoints = profile?.rewards?.applyForJobs || 0;
    const rmServicePoints = profile?.rewards?.rmService || 0;
    const deductedPoints = profile?.deductedPoints || 0;
    
    const totalPoints = calculatedBasePoints + applicationPoints + rmServicePoints;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);

    return { percentage, points: availablePoints };
  };

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserProfile(data.data);
      
      // Calculate metrics locally
      const metrics = calculateProfileMetrics(data.data);
      setCalculatedCompletion(metrics.percentage);
      setCalculatedPoints(metrics.points);
      
      // Set RM Service status
      setRmServiceStatus(data.data.rmService === "Active" ? "active" : "inactive");
      
    } catch (error) {
      // If token is invalid, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchApplications(),
        fetchInterviewCount(),
        fetchReferralStats(),
        fetchRecommendedJobs()
      ]);
    } finally {
      isFetchingRef.current = false;
      hasFetchedRef.current = true;
    }
  }, [fetchUserProfile, fetchApplications, fetchInterviewCount, fetchReferralStats, fetchRecommendedJobs]);

  useEffect(() => {
    // Only fetch on initial mount
    if (!hasFetchedRef.current) {
      fetchData();
    }


    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTimeRef.current > 30000) {
        lastFocusTimeRef.current = now;
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl p-6 card-shadow border-0">
            {loading ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {userProfile?.fullName || userProfile?.name || 'User'}!
                  </h1>
                  <p className="text-gray-600">Ready to take the next step in your career?</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">
                      {calculatedCompletion}%
                    </div>
                    <div className="text-sm text-gray-600">Profile Complete</div>
                    <Progress value={calculatedCompletion} className="w-20 h-2 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">
                      {calculatedPoints}
                    </div>
                    <div className="text-sm text-gray-600">Reward Points</div>
                    <Badge className="gradient-bg text-white mt-1 text-xs">
                      {(() => {
                        // Use calculated points instead of backend points
                        const points = calculatedPoints;
                        
                        
                        // Complex tier logic matching profile page
                        const yearsExp = userProfile?.professionalExperience?.[0]?.yearsOfExperience || 0;
                        
                        const isEmirati = userProfile?.nationality?.toLowerCase()?.includes("emirati");
                        const hasEmploymentVisa = userProfile?.employmentVisa === "yes";
                        const hasEmiratesId = !!userProfile?.emirateId;
                        
                        // Determine tier based on new logic
                        let tier;
                        if (isEmirati) tier = "Platinum"; // Emirati users get Platinum tier
                        else if (points >= 500) tier = "Platinum";
                        else if (yearsExp >= 5) tier = "Gold";
                        else if (yearsExp >= 2 && yearsExp <= 5) tier = "Silver";
                        else tier = "Blue"; // 0-1 year
                        
                        
                        return tier;
                      })()} Tier
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/jobseeker/applications" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{userProfile?.applications?.totalApplications || 0}</p>
                      <p className="text-xs text-gray-600">Applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/jobseeker/interviews" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{interviewCount}</p>
                      <p className="text-xs text-gray-600">Interviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/rewards/jobseeker" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{calculatedPoints}</p>
                      <p className="text-xs text-gray-600">Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/jobseeker/profile" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{calculatedCompletion}%</p>
                      <p className="text-xs text-gray-600">Profile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/jobseeker/referrals/history" className="cursor-pointer">
              <Card className="card-shadow border-0 card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{referralStats.total}</p>
                      <p className="text-xs text-gray-600">Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Services */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="card-shadow border-0 hover:shadow-lg transition-all duration-200 bg-white border border-emerald-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">RM Service</CardTitle>
                <CardDescription className="text-sm">
                  Get personalized support from our relationship managers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex flex-col justify-end">
                {rmServiceStatus === "active" ? (
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors" disabled>
                    Active
                  </Button>
                ) : (
                  <Link href="/jobseeker/cart">
                    <Button className="w-full gradient-bg text-white hover:opacity-90 transition-opacity">Start Service</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="card-shadow border-0 hover:shadow-lg transition-all duration-200 bg-white border border-emerald-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Earn up to 10,000 AED or more through Referrals</CardTitle>
                <CardDescription className="text-sm">Invite your friends to apply for jobs. Earn rewards when they get hired.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex flex-col justify-end">
                <Link href="/rewards/jobseeker/earn-money">
                  <Button className="w-full gradient-bg text-white hover:opacity-90 transition-opacity">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0 hover:shadow-lg transition-all duration-200 bg-white border border-emerald-100 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-3">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white text-xs">
                    {referralStats.active} Active Referrals
                  </Badge>
                </div>
                <CardTitle className="text-lg">Referral History</CardTitle>
                <CardDescription className="text-sm">View and manage your past referrals and their statuses</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex flex-col justify-end">
                <Link href="/jobseeker/referrals/history">
                  <Button className="w-full gradient-bg text-white hover:opacity-90 transition-opacity">View History</Button>
                </Link>
              </CardContent>
            </Card>
          </div>



          {/* Recent Activity & Recommendations */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No applications yet</p>
                    <Link href="/jobseeker/search">
                      <Button size="sm" className="mt-2 gradient-bg text-white">
                        Find Jobs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  applications.map(app => (
                    <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex-1">
                        <Link 
                          href={`/jobseeker/applications/${app._id}`}
                          className="font-semibold text-sm hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          {app.jobId?.title || 'Unknown Job'}
                        </Link>
                        <p className="text-xs text-gray-600">{app.jobId?.companyName || 'Unknown Company'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                        {app.referredBy && (
                          <p className="text-xs text-emerald-600 font-medium mt-1">
                            Referred by {app.referredBy.name}
                          </p>
                        )}
                        <Badge className={`text-xs mt-1 ${
                          app.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' :
                          app.status === 'hired' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/jobseeker/applications/${app._id}`, { scroll: false })}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="w-4 h-4 mr-2 text-emerald-600" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedJobs.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {loading ? "Loading personalized recommendations..." : "No job recommendations available at the moment"}
                    </p>
                  </div>
                ) : (
                  recommendedJobs.map((job) => (
                    <Link 
                      key={job._id} 
                      href={`/jobseeker/search/${job._id}`}
                      className="block p-3 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm hover:text-emerald-600 transition-colors">
                          {job.title}
                        </h4>
                        <Badge className={`text-white text-xs ${
                          job.recommendationScore >= 80 ? 'bg-green-500' :
                          job.recommendationScore >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}>
                          {job.recommendationScore}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{job.companyName}</p>
                      <p className="text-xs text-gray-600 mb-1">{job.location}</p>
                      {job.salary && (
                        <p className="text-xs text-emerald-600 font-semibold">
                          AED {typeof job.salary === 'number' ? job.salary.toLocaleString() : (job.salary.min || job.salary.max || 0).toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))
                )}
                {recommendedJobs.length > 0 && (
                  <div className="text-center pt-2">
                    <Link href="/jobseeker/search">
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
                        View All Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
