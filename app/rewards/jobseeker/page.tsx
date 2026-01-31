"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Gift, UserCheck, FileText, Star, ArrowRight, Award, Trophy, RefreshCw, Copy, Check, Share2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

const membershipTiers = [
  {
    name: "Blue",
    minPoints: 0,
    icon: Star,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "For job seekers with 0 to 1 years of experience",
  },
  {
    name: "Silver",
    minPoints: 150,
    icon: Trophy,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    desc: "For job seekers with 1 to 5 years of experience",
  },
  {
    name: "Gold",
    minPoints: 250,
    icon: Award,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    desc: "For job seekers with 5 or more years of experience",
  },
  {
    name: "Platinum",
    minPoints: 500,
    icon: Gift,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    desc: "For Emirati nationals",
  },
]

export default function JobSeekerRewardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for user data
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [referralPoints, setReferralPoints] = useState(0)
  const [activityPoints, setActivityPoints] = useState(0)
  const [userTier, setUserTier] = useState("Blue")
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [referralLink, setReferralLink] = useState("")
  const [copied, setCopied] = useState(false)

  // Get auth headers function
  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Calculate profile completion and points (fallback when server points missing)
  const calculateProfileMetrics = (profile: any) => {
    let completed = 0;
    const totalFields = 24; // employmentVisa removed

    // Personal Info (9 fields - employmentVisa removed)
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
    // Check resume in multiple possible locations (matching backend logic)
    const hasResume = !!(profile?.resumeDocument && profile.resumeDocument.trim() !== '') ||
                     !!(profile?.resumeUrl && profile.resumeUrl.trim() !== '') ||
                     !!(profile?.resume && (typeof profile.resume === 'string' ? profile.resume.trim() !== '' : profile.resume)) ||
                     !!(profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0) ||
                     !!(profile?.documents && profile.documents.length > 0 && profile.documents.some((doc: any) => 
                       doc.type === 'resume' || doc.name?.toLowerCase().includes('resume') || doc.name?.toLowerCase().includes('cv')
                     ));
    if (hasResume) completed++;

    // Social Links (3 fields) - check both uppercase and lowercase versions
    if (profile?.socialLinks?.linkedIn || profile?.socialLinks?.linkedin) completed++;
    if (profile?.socialLinks?.instagram) completed++;
    if (profile?.socialLinks?.twitterX || profile?.socialLinks?.twitter) completed++;

    const percentage = Math.round((completed / totalFields) * 100);
    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage (100% = 250 points)
    const applicationPoints = profile?.rewards?.applyForJobs || 0; // Points from job applications
    const rmServicePoints = profile?.rewards?.rmService || 0; // Points from RM service purchase
    const socialMediaBonus = profile?.rewards?.socialMediaBonus || 0; // Points from following social media
    const deductedPoints = profile?.deductedPoints || 0;
    const totalPoints = calculatedPoints + applicationPoints + rmServicePoints + socialMediaBonus;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);

    return { percentage, points: availablePoints };
  };

  // Determine user tier based on points and profile (for display purposes only)
  const determineUserTier = (profile: any, points: number) => {
    const yearsExp = profile?.professionalExperience?.[0]?.yearsOfExperience || 0;
    const isEmirati = profile?.nationality?.toLowerCase()?.includes("emirati");

    // If Emirati, always Platinum tier
    if (isEmirati) return "Platinum";
    // Otherwise determine by experience
    else if (points >= 500) return "Platinum";
    else if (yearsExp >= 5) return "Gold";
    else if (yearsExp >= 2 && yearsExp <= 5) return "Silver";
    else return "Blue"; // 0-1 year
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || `Failed to fetch profile (${response.status})`);
      }

      const data = await response.json();
      setUserProfile(data.data);
      
      const deducted = data.data?.deductedPoints || 0;
      const metrics = calculateProfileMetrics(data.data);
      setProfileCompletion(metrics.percentage);
      
      // Calculate activity points from individual components
      // First, fetch referral history to get hired count for placement points calculation
      let placementPoints = 0;
      let signupReferralPoints = 0;
      const totalReferralRewardPoints = data.data.referralRewardPoints || 0;
      
      try {
        // Fetch referral history to count hired referrals (job placements)
        const referralHistoryResponse = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/applications/referrals/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (referralHistoryResponse.ok) {
          const referralHistoryData = await referralHistoryResponse.json();
          const hiredCount = referralHistoryData?.stats?.hired || 0;
          // Placement points = only job placement referrals (20 points per hire)
          placementPoints = hiredCount * 20;
          // Signup referral points = total - placement points
          signupReferralPoints = Math.max(0, totalReferralRewardPoints - placementPoints);
        } else {
          // If we can't fetch referral history, use totalReferralRewardPoints as placement points
          // (fallback - assumes all are placement points)
          placementPoints = totalReferralRewardPoints;
          signupReferralPoints = 0;
        }
      } catch (error) {
        console.error('Error fetching referral history:', error);
        // Fallback: assume all are placement points
        placementPoints = totalReferralRewardPoints;
        signupReferralPoints = 0;
      }
      
      // Calculate base points
      const basePoints = 50 + metrics.percentage * 2; // Base 50 + 2 points per percentage
      
      // Determine tier (for display purposes only, not used in calculation)
      const tier = determineUserTier(data.data, basePoints);
      
      // Use base points directly without multiplier
      const calculatedBasePoints = basePoints;
      
      // Add other points (applications, RM service, social media, referrals)
      const applicationPoints = data.data?.rewards?.applyForJobs || 0;
      const rmServicePoints = data.data?.rewards?.rmService || 0;
      const socialMediaBonus = data.data?.rewards?.socialMediaBonus || 0;
      
      // Activity points = Base Points + Applications + RM Service + Social Media + Signup Referrals
      const activityRewardPoints = calculatedBasePoints + applicationPoints + rmServicePoints + socialMediaBonus + signupReferralPoints;
      
      // Calculate total points: Activity Points + Placement Points - Deducted Points
      const totalPoints = Math.max(0, activityRewardPoints + placementPoints - deducted);
      
      setReferralPoints(placementPoints);
      setActivityPoints(activityRewardPoints);
      setUserPoints(totalPoints);
      
        const referralCode = data.data?.referralCode || "";
        if (referralCode) {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://findrtechnosis.netlify.app';
          const link = `${baseUrl}/signup?ref=${referralCode}`;
          setReferralLink(link);
      } else {
        setReferralLink("");
      }
      setUserTier(tier);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchUserProfile();
  };

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Share referral link
  const shareReferralLink = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Findr - Dubai Job Board",
          text: "Join Findr using my referral link and start your career journey in Dubai!",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback to copy if share API not available
      copyReferralLink();
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Calculate tier and progress
  const currentTier = membershipTiers.find((t) => t.name === userTier) || membershipTiers[0];
  const nextTier = membershipTiers.find((t) => t.minPoints > userPoints);
  const progressToNext = nextTier
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header: Points & Tier - Improved Responsive Layout */}
        <Card
          className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-[#eaf3ff] to-white mb-8"
          style={{ padding: 0 }}
        >
          <CardContent className="flex flex-col md:flex-row items-stretch md:items-center w-full p-0">
            {/* Left Section: Icon + Info + Cards */}
            <div className="flex flex-col justify-center flex-1 px-8 py-8 md:py-10">
              <div className="flex flex-row items-center gap-6 mb-4">
                {/* Trophy Icon */}
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                {/* Main Info Stack */}
                <div className="flex flex-col items-start justify-center">
                  <h1 className="font-extrabold mb-1 text-4xl md:text-5xl text-blue-900 leading-tight">{userPoints} Points</h1>
                  <span className="mb-1 bg-white text-blue-900 font-semibold rounded-full px-6 py-2 text-base shadow-sm" style={{marginBottom:4}}>
                    {userTier} Member
                  </span>
                  <div className="text-gray-500 text-sm mb-1">
                    {nextTier ? `${nextTier.minPoints - userPoints} points to ${nextTier.name}` : "Maximum tier reached!"}
                  </div>
                </div>
              </div>
              {/* Bottom Card Row: Referral + Activity */}
              <div className="flex flex-row gap-4 mt-2 w-full max-w-md">
                {/* Referral Points Card */}
                <div className="flex-1 bg-blue-50 rounded-xl shadow-md flex items-center px-5 py-4 min-w-0">
                  <span className="text-2xl mr-4">🎁</span>
                  <span className="font-medium text-blue-900 text-base flex-1">Placement Points</span>
                  <span className="font-bold text-blue-800 text-lg ml-2">{referralPoints}</span>
                </div>
                {/* Activity Points Card */}
                <div className="flex-1 bg-emerald-50 rounded-xl shadow-md flex items-center px-5 py-4 min-w-0">
                  <span className="text-2xl mr-4">📝</span>
                  <span className="font-medium text-emerald-900 text-base flex-1">Activity Points</span>
                  <span className="font-bold text-emerald-800 text-lg ml-2">{activityPoints}</span>
                </div>
              </div>
            </div>
            {/* Right Section: Progress Bar */}
            <div className="flex flex-col justify-center items-center md:items-end w-full md:w-2/5 px-8 py-8 md:py-10">
              <div className="w-full max-w-xs md:max-w-sm">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{currentTier.name}</span>
                  <span>{nextTier ? nextTier.name : "Max"}</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              How to Earn Points
            </CardTitle>
            <CardDescription>Boost your points by being active on the platform</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>Complete your profile</span>
              <Badge className="bg-emerald-100 text-emerald-800 ml-2">+250</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Applying on behalf of a friend</span>
              <Badge className="bg-blue-100 text-blue-800 ml-2">+20/job</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6 text-pink-600" />
              <span>Invite a friend</span>
              <Badge className="bg-pink-100 text-pink-800 ml-2">+50</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowRight className="w-6 h-6 text-purple-600" />
              <span>Purchase premium services</span>
              <Badge className="bg-purple-100 text-purple-800 ml-2">+variable</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Earn Money Card */}
        <Card className="card-shadow border-0 mb-8 cursor-pointer hover:shadow-lg transition">
          <CardHeader className="bg-gradient-to-r from-emerald-400 to-blue-400 rounded-t-2xl p-6 text-white text-center">
            <CardTitle className="text-2xl font-bold mb-1">Earn up to 10,000 AED</CardTitle>
            <CardDescription className="text-lg text-white/90">by referring someone to job openings</CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 text-base mb-2">Refer candidates to jobs on Findr. If your referral is hired, you earn a cash reward!</p>
            <p className="text-gray-600 text-sm mb-4">Click to learn more about how you can earn money through our referral program.</p>
            <Link href="/rewards/jobseeker/earn-money">
              <Badge className="bg-emerald-600 text-white px-4 py-2 text-base cursor-pointer">Learn More</Badge>
            </Link>
          </CardContent>
        </Card>

       

        {/* Membership Tiers */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Membership Tiers</CardTitle>
            <CardDescription>Unlock more benefits as you earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {membershipTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 rounded-lg border-2 ${tier.name === userTier ? tier.border : "border-gray-200"} ${tier.name === userTier ? tier.bg : "bg-gray-50"}`}
                >
                  <div className="text-center">
                    <tier.icon className={`w-10 h-10 mx-auto mb-3 ${tier.color}`} />
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{tier.desc}</p>
                    {tier.name === userTier && <Badge className="gradient-bg text-white">Current Tier</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refer a Friend Section */}
        <Card className="card-shadow border-0 bg-gradient-to-br from-emerald-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Invite a Friend</CardTitle>
                <CardDescription>Share your referral link and earn rewards when friends join!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Link</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded-md p-3 border border-gray-200 overflow-hidden">
                  <p className="text-sm text-gray-800 break-all font-mono">
                    {loading ? "Loading..." : referralLink || (userProfile?.referralCode ? "Generating link..." : "No referral code available")}
                  </p>
                </div>
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={!referralLink}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                {typeof navigator !== "undefined" && (navigator as any).share && (
                  <Button
                    onClick={shareReferralLink}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!referralLink}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </div>
            
            {userProfile?.referralCode && (
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 rounded-md p-3 border border-gray-200">
                    <p className="text-lg font-bold text-blue-600 font-mono">{userProfile.referralCode}</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(userProfile.referralCode);
                      toast({
                        title: "Copied!",
                        description: "Referral code copied to clipboard",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-emerald-100 rounded-lg p-4 border border-emerald-300">
              <h4 className="font-semibold text-emerald-900 mb-2">How it works:</h4>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Share your referral link with friends who are looking for jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>When they sign up using your link, the referral code is automatically filled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Earn rewards when your referrals get hired through the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Track your referrals and earnings in the referral history section</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link href="/jobseeker/referrals/history" className="flex-1">
                <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  View Referral History
                </Button>
              </Link>
              <Link href="/rewards/jobseeker/earn-money" className="flex-1">
                <Button className="w-full gradient-bg text-white">
                  Learn More About Rewards
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 