"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Award, Crown, Users, Briefcase, Gift, ArrowRight, RefreshCw, Share2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TOP_200_COMPANIES } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"

type EmployerTier = {
  name: string
  label: string
  employees: string
  icon: any
  color: string
  bg: string
  border: string
  minPoints: number
  pointsRequired: boolean
  perks?: string[]
}

const employerTiers: EmployerTier[] = [
  {
    name: "Blue",
    label: "Starter Tier",
    employees: "0 – 100",
    icon: Star,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    minPoints: 0,
    pointsRequired: false,
    
  },
  {
    name: "Silver",
    label: "Growing Tier",
    employees: "101 – 500",
    icon: Trophy,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    minPoints: 0,
    pointsRequired: false,
    
  },
  {
    name: "Gold",
    label: "Advanced Tier",
    employees: "501 – 1000+",
    icon: Award,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    minPoints: 0,
    pointsRequired: false,
    
  },
  {
    name: "Platinum",
    label: "Elite Tier",
    employees: "1000+",
    icon: Crown,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    minPoints: 500,
    pointsRequired: true,
    
  },
]

const howToEarn = [
  {
    icon: Briefcase,
    label: "Post a job",
    badge: "+30/job",
    color: "bg-blue-100 text-blue-800",
  },
  {
    icon: Gift,
    label: "Purchase premium services",
    badge: "+variable",
    color: "bg-purple-100 text-purple-800",
  },
  {
    icon: ArrowRight,
    label: "Hire a candidate",
    badge: "+50/hire",
    color: "bg-yellow-100 text-yellow-800",
  },
]

export default function EmployerRewardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for employer data
  const [employerProfile, setEmployerProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [userTier, setUserTier] = useState("Blue")
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

  const calculateEmployerPoints = (profile: any) => {
    let points = 0;
    
    // Base points for being an employer
    points += 50;
    
    // Points for company profile completion (total 200 points for complete profile)
    if (profile?.companyName) points += 25;
    if (profile?.companyEmail) points += 25;
    if (profile?.phoneNumber) points += 25;
    if (profile?.website) points += 25;
    if (profile?.industry) points += 25;
    if (profile?.teamSize) points += 25;
    if (profile?.foundedYear) points += 25;
    if (profile?.aboutCompany) points += 25;
    
    // Points for posted jobs (if available)
    const postedJobs = profile?.postedJobs?.length || 0;
    points += postedJobs * 30; // 30 points per job posted
    
    // Points for hires (if available)
    const hires = profile?.hires?.length || 0;
    points += hires * 50; // 50 points per hire
    
    // Points for referrals (if available)
    const referrals = profile?.referrals?.length || 0;
    points += referrals * 50; // 50 points per referral
    
    // Points for premium services (if available)
    const premiumServices = profile?.premiumServices?.length || 0;
    points += premiumServices * 20; // 20 points per premium service
    
    // Use points from database if available (more accurate)
    if (profile?.points) {
      points = profile.points;
    }
    
    return points;
  };

  // Determine employer tier based on team size (points only for Platinum)
  const determineEmployerTier = (profile: any, points: number) => {
    const teamSize = profile?.teamSize || "0-10";
    let teamSizeNum = 0;
    
    // Handle different team size formats
    if (teamSize.includes('+')) {
      // Handle "1000+" format
      teamSizeNum = parseInt(teamSize.replace('+', '')) || 0;
    } else if (teamSize.includes('-')) {
      // Handle "1-10", "11-50", etc.
      teamSizeNum = parseInt(teamSize.split('-')[0]) || 0;
    } else {
      teamSizeNum = parseInt(teamSize) || 0;
    }
    
    const companyName = profile?.companyName || "";
    
    // Check if company is in TOP_200_COMPANIES
    const isTopCompany = TOP_200_COMPANIES.some(
      (company) => company.toLowerCase() === companyName.toLowerCase()
    );
    
    // Platinum tier: requires 500+ points
    if (points >= 500) return "Platinum";
    
    // All other tiers based ONLY on team size (no point requirements)
    // If company size is 0-100, it should be Blue tier
    if (teamSizeNum <= 100) return "Blue";
    
    // If company size is 101-500, it should be Silver tier
    if (teamSizeNum >= 101 && teamSizeNum <= 500) return "Silver";
    
    // If company size is 501-1000 or TOP_200_COMPANIES, it should be Gold tier
    if ((teamSizeNum >= 501 && teamSizeNum <= 1000) || isTopCompany) return "Gold";
    
    // Default fallback
    return "Blue";
  };

  // Fetch employer profile data
  const fetchEmployerProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/employer/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch((networkError) => {
        // Handle network errors (CORS, connection refused, etc.)
        console.error('Network error:', networkError);
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || `Failed to fetch employer profile (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Invalid response from server');
      }
      
      setEmployerProfile(data.data);
      
      // Use database points if available, otherwise calculate
      const calculatedPoints = data.data.points || calculateEmployerPoints(data.data);
      setUserPoints(calculatedPoints);
      
      const referralCode = data.data?.referralCode || "";
      if (referralCode) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://findrtechnosis.netlify.app';
        const link = `${baseUrl}/signup?ref=${referralCode}`;
        setReferralLink(link);
      } else {
        setReferralLink("");
      }
      
      const tier = determineEmployerTier(data.data, calculatedPoints);
      setUserTier(tier);
      
    } catch (error) {
      console.error('Error fetching employer profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch employer data. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchEmployerProfile();
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
    
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
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
    fetchEmployerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate tier and progress
  const currentTier = employerTiers.find((t) => t.name === userTier) || employerTiers[0];
  // Only show progress for Platinum tier (since other tiers are based on team size only)
  const nextTier = currentTier.name === "Platinum" 
    ? null // Platinum is the highest tier
    : currentTier.name === "Gold" 
    ? employerTiers.find((t) => t.name === "Platinum")
    : employerTiers.find((t) => t.pointsRequired && t.minPoints > userPoints);
  const progressToNext = nextTier && nextTier.pointsRequired
    ? Math.min(100, ((userPoints / nextTier.minPoints) * 100))
    : userTier === "Platinum" ? 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header: Points & Tier */}
        <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-emerald-50 mb-8">
          <CardContent className="p-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className={`w-20 h-20 ${currentTier.bg} ${currentTier.border} border-2 rounded-full flex items-center justify-center card-shadow`}>
                <currentTier.icon className={`w-10 h-10 ${currentTier.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-1">{userPoints} Points</h1>
                <Badge className="border text-base px-4 py-2 mt-2" variant="secondary">
                  {userTier} Member
                </Badge>
                <div className="mt-2 text-gray-600 text-sm">
                  {userTier === "Platinum" 
                    ? "Maximum tier reached!" 
                    : nextTier && nextTier.pointsRequired
                    ? `${nextTier.minPoints - userPoints} points to ${nextTier.name}`
                    : nextTier
                    ? `Upgrade company size to reach ${nextTier.name} tier`
                    : "Maximum tier reached!"}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <Progress value={progressToNext} className="h-3" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{currentTier.name}</span>
                <span>{nextTier ? nextTier.name : (userTier === "Platinum" ? "Max" : "Based on team size")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Gift className="w-5 h-5 mr-2 text-emerald-600" />
              How to Earn Points
            </CardTitle>
            <CardDescription>Boost your points by being active as an employer on Findr</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {howToEarn.map((item, idx) => (
              <div className="flex items-center space-x-3" key={idx}>
                <item.icon className="w-6 h-6 text-emerald-600" />
                <span>{item.label}</span>
                <Badge className={item.color + " ml-2"}>{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Membership Tiers */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Membership Tiers</CardTitle>
            <CardDescription>Advance through tiers as your company grows and earn more rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {employerTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 rounded-lg border-2 ${tier.border} ${tier.bg} transition-shadow duration-200 hover:shadow-lg shadow-md`}
                >
                  <div className="text-center">
                    <tier.icon className={`w-10 h-10 mx-auto mb-3 ${tier.color}`} />
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <Badge className="mb-2 gradient-bg text-white">{tier.label}</Badge>
                    {!tier.pointsRequired && (
                      <p className="text-xs text-gray-600 mb-2">Employees: {tier.employees}</p>
                    )}
                    {tier.pointsRequired && (
                      <p className="text-xs font-semibold text-emerald-700 mb-2">
                        Requires: {tier.minPoints}+ points
                      </p>
                    )}
                    <ul className="text-xs text-gray-700 mb-2 space-y-1 text-left">
                      {(tier.perks || []).map((perk: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redeemable Rewards */}
        <Card className="card-shadow border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Gift className="w-5 h-5 mr-2 text-emerald-600" />
              Redeem Your Points
            </CardTitle>
            <CardDescription>Use your points for exclusive discounts on HR services</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <h3 className="font-semibold mb-1">Recruitment Services Discount</h3>
              <p className="text-gray-600 text-sm mb-2">Get up to 15% off on recruitment and talent acquisition services.</p>
              <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold mb-1">Onboarding Solutions Discount</h3>
              <p className="text-gray-600 text-sm mb-2">Redeem points for discounts on onboarding and training solutions.</p>
              <Badge className="bg-blue-100 text-blue-800">Available</Badge>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="font-semibold mb-1">Compliance & HR Consulting</h3>
              <p className="text-gray-600 text-sm mb-2">Use your points for discounted compliance and HR advisory services.</p>
              <Badge className="bg-yellow-100 text-yellow-800">Available</Badge>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-semibold mb-1">Performance Management Tools</h3>
              <p className="text-gray-600 text-sm mb-2">Unlock discounts on premium performance management tools and analytics.</p>
              <Badge className="bg-purple-100 text-purple-800">Available</Badge>
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
                    {loading ? "Loading..." : referralLink || (employerProfile?.referralCode ? "Generating link..." : "No referral code available")}
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
            
            {employerProfile?.referralCode && (
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Code</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 rounded-md p-3 border border-gray-200">
                    <p className="text-lg font-bold text-blue-600 font-mono">{employerProfile.referralCode}</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(employerProfile.referralCode);
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
                  <span>Share your referral link with friends or colleagues who are looking for jobs</span>
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
              <Link href="/employer/applicants" className="flex-1">
                <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  View Applicants
                </Button>
              </Link>
              <Link href="/rewards/employer" className="flex-1">
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