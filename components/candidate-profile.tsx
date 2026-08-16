"use client";

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
  Cake,
  Languages,
  IdCard,
  Play,
  UserPlus,
  Flag,
  Banknote,
  ClipboardList,
  SlidersHorizontal,
  Share2,
  XCircle,
  Eye,
  Folder,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { CandidateProfile } from "@/lib/applications";
import {
  LinkedInBrandIcon,
  InstagramBrandIcon,
  TwitterBrandIcon,
  LinkedInBrandIconMuted,
  InstagramBrandIconMuted,
  TwitterBrandIconMuted,
} from "@/components/icons/social-brand-icons";

function getStatusColor(status: string): string {
  switch (status) {
    case "Shortlisted":
      return "bg-blue-100 text-blue-800";
    case "Interview Scheduled":
      return "bg-green-100 text-green-800";
    case "Hired":
      return "bg-purple-100 text-purple-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "Icon":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Elite":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Pro":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Plus":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "Prime":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

function formatSimpleDOB(dobString: string): string {
  if (!dobString || dobString === "N/A") return "N/A";
  try {
    const date = new Date(dobString);
    if (isNaN(date.getTime())) return dobString;
    return date.toLocaleDateString();
  } catch (e) {
    return dobString;
  }
}

function formatDOB(dobString: string): string {
  if (!dobString || dobString === "N/A") return "N/A";
  try {
    const date = new Date(dobString);
    if (isNaN(date.getTime())) return dobString;
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return `${day} ${month} ${year} (${age})`;
  } catch (e) {
    return dobString;
  }
}

export function CandidateProfileView({ candidate }: { candidate: CandidateProfile }) {
  const router = useRouter();
  const { toast } = useToast();

  const downloadDocument = async (url: string | undefined, fileName: string) => {
    if (!url) {
      toast({
        title: "Download Error",
        description: `${fileName} is not available for download.`,
        variant: "destructive",
      });
      return;
    }

    try {
      let filename = fileName;
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        const cleanFilename = lastPart.split('?')[0];
        if (cleanFilename) filename = cleanFilename;
      }
      
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Get file extension from URL or filename
      const urlLower = url.toLowerCase();
      let extension = 'pdf';
      if (urlLower.includes('.docx') || filename.toLowerCase().endsWith('.docx')) extension = 'docx';
      else if (urlLower.includes('.doc') || filename.toLowerCase().endsWith('.doc')) extension = 'doc';
      else if (urlLower.includes('.txt') || filename.toLowerCase().endsWith('.txt')) extension = 'txt';
      else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || filename.toLowerCase().endsWith('.jpg')) extension = 'jpg';
      else if (urlLower.includes('.png') || filename.toLowerCase().endsWith('.png')) extension = 'png';
      else if (urlLower.includes('.pdf') || filename.toLowerCase().endsWith('.pdf')) extension = 'pdf';
      
      // If filename doesn't have extension, add it
      if (!filename.toLowerCase().endsWith(`.${extension}`)) {
        filename = `${filename}.${extension}`;
      }
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: try opening in new tab if download fails
      try {
        window.open(url, '_blank');
        toast({
          title: "Opening Document",
          description: `${fileName} opened in a new tab.`,
        });
      } catch (fallbackError) {
        toast({
          title: "Download Error",
          description: `Failed to download ${fileName}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* <Navbar /> */}

      <main className="pt-0 pb-4 lg:pb-6 px-0">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Back Button */}
          {/* <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center text-blue-600 hover:text-blue-800 px-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div> */}

          {/* Candidate Header Card */}
          {candidate.isAdminView ? (
            /* Upgraded Candidate Header Card for Admin */
            <Card className="card-shadow border-0 bg-white border border-slate-100">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Profile Picture */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center card-shadow bg-slate-50 shrink-0">
                    {candidate.socialProfiles?.profilePicture ? (
                      <img
                        src={candidate.socialProfiles.profilePicture}
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-emerald-600" />
                    )}
                  </div>

                  {/* Details Area */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Top Row: Name and Tier Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                          {candidate.name}
                        </h1>
                        <div className="flex items-center text-slate-500 gap-2 text-sm mt-1">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{candidate.email}</span>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 self-start sm:self-center shrink-0">
                        <Award className="w-3.5 h-3.5" />
                        {candidate.tier}
                      </Badge>
                    </div>

                    {/* Points & Profile Completion Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</div>
                        <div className="text-xl font-extrabold text-emerald-600 mt-1">
                          {candidate.pointsAndRewards?.points ?? 0}{" "}
                          <span className="text-xs font-semibold text-slate-400">pts</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Profile Completion</span>
                          <span className="text-slate-700 font-extrabold">{candidate.profileCompleted ?? 100}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${candidate.profileCompleted ?? 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Standard Candidate Header Card */
            <Card className="card-shadow border-0 bg-gradient-to-r from-emerald-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center card-shadow">
                      <User className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-emerald-900">{candidate.name}</h1>
                        <Badge className={`${getStatusColor(candidate.status)} text-xs px-3 py-1`}>
                          {candidate.status}
                        </Badge>
                      </div>
                      <p className="text-emerald-700 mb-2">{candidate.email}</p>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getTierColor(candidate.tier)} border text-xs`}>
                          <Award className="w-3 h-3 mr-1" />
                          {candidate.tier} Member
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-semibold text-emerald-800 text-sm">{candidate.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {candidate.appliedFor && candidate.appliedDate && (
                    <div className="text-center lg:text-right">
                      <div className="text-sm text-emerald-700 mb-2">Applied for</div>
                      <div className="font-semibold text-emerald-900 mb-1">{candidate.appliedFor}</div>
                      <div className="text-xs text-emerald-600">Applied on {candidate.appliedDate}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.isAdminView ? (
            /* Upgraded Personal Details Card for Admin */
            <Card className="card-shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                  <User className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-600" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <hr className="mb-6 border-gray-200" />
                <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                  {/* Column 1 */}
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Phone</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">{candidate.phone}</div>
                      </div>
                    </div>

                    {/* DOB */}
                    <div className="flex items-start gap-3">
                      <Cake className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">DOB</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">
                          {formatDOB(candidate.dateOfBirth)}
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex items-start gap-3">
                      <Languages className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Languages</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">
                          {candidate.spokenLanguages || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Referred By */}
                    <div className="flex items-start gap-3">
                      <UserPlus className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Referred By</div>
                        {candidate.referredBy ? (
                          <div className="mt-0.5">
                            <div className="text-base font-semibold text-slate-800">{candidate.referredBy.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {candidate.referredBy.email}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <div className="text-base font-semibold text-slate-800">Self Registered</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              This user registered directly without a referral code.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-6">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Location</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">{candidate.location}</div>
                      </div>
                    </div>

                    {/* Nationality */}
                    <div className="flex items-start gap-3">
                      <Flag className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Nationality</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">{candidate.nationality}</div>
                      </div>
                    </div>

                    {/* Emirates ID */}
                    <div className="flex items-start gap-3">
                      <IdCard className="w-5 h-5 text-slate-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 font-semibold tracking-wide">Emirates ID</div>
                        <div className="text-base font-semibold text-slate-800 mt-0.5">
                          {candidate.emirateId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {candidate.introVideo && (
                  <>
                    <hr className="my-6 border-gray-200" />
                    <div className="pt-2">
                      <a href={candidate.introVideo} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <Button
                          variant="outline"
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-white shrink-0">
                            <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                          </div>
                          View Introductory Video
                        </Button>
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Contact Information */
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="w-4 h-4 mr-2 text-emerald-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{candidate.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">{candidate.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">Born: {formatSimpleDOB(candidate.dateOfBirth)}</span>
                  </div>
                </div>
                {candidate.spokenLanguages && (
                  <div className="pt-3 border-t border-gray-100 flex items-center">
                    <span className="font-semibold text-gray-900 text-sm mr-2">Spoken Languages:</span>
                    <span className="text-gray-700 text-sm">{candidate.spokenLanguages}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {candidate.isAdminView && candidate.pointsAndRewards && (
            /* Upgraded Points & Rewards Card for Admin */
            <Card className="card-shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-emerald-800">
                  <Banknote className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-100" />
                  Points & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <hr className="mb-6 border-gray-200" />
                
                {/* 3 Status Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50">
                    <div className="text-xs text-gray-500 font-semibold">Total Points</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-1">
                      {candidate.pointsAndRewards.points ?? 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50">
                    <div className="text-xs text-gray-500 font-semibold">Deducted Points</div>
                    <div className="text-xl font-extrabold text-slate-700 mt-1">
                      {candidate.pointsAndRewards.deductedPoints ?? 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50">
                    <div className="text-xs text-gray-500 font-semibold">RM Service Status</div>
                    <div className="text-base font-bold text-slate-700 mt-1">
                      {candidate.pointsAndRewards.rmService ?? "Inactive"}
                    </div>
                  </div>
                </div>

                {/* Rewards List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Profile Completion Reward</span>
                    <span className="text-slate-800 font-bold">
                      {candidate.pointsAndRewards.rewards?.completeProfile ?? 0} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Job Applications Reward</span>
                    <span className="text-slate-800 font-bold">
                      {candidate.pointsAndRewards.rewards?.applyForJobs ?? 0} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Referral Reward</span>
                    <span className="text-slate-800 font-bold">
                      {candidate.pointsAndRewards.rewards?.referFriend ?? 0} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Social Media Bonus</span>
                    <span className="text-slate-800 font-bold">
                      {candidate.pointsAndRewards.rewards?.socialMediaBonus ?? 0} pts
                    </span>
                  </div>
                </div>

                {/* Total */}
                <hr className="border-emerald-200 my-4" />
                <div className="flex justify-between items-center text-base font-bold text-emerald-800 py-1">
                  <span>Total Reward Points</span>
                  <span>
                    {candidate.pointsAndRewards.rewards?.totalPoints ?? 0} pts
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.isAdminView ? (
            /* Upgraded Professional Overview Card for Admin */
            <Card className="card-shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                  <Briefcase className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-600" />
                  Professional Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-6">
                <p className="text-gray-700 leading-relaxed text-[15px]">
                  {candidate.summary}
                </p>
                
                {/* Highlight Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-blue-50/20 border border-blue-100/50">
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Current Role</div>
                    <div className="text-[14px] font-bold text-slate-800 mt-1 truncate">{candidate.currentRole}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Company</div>
                    <div className="text-[14px] font-bold text-slate-800 mt-1 truncate">{candidate.company}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Experience</div>
                    <div className="text-[14px] font-bold text-slate-800 mt-1 truncate">{candidate.experience}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Industry</div>
                    <div className="text-[14px] font-bold text-slate-800 mt-1 truncate">{candidate.industry}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Professional Summary */}
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
                </CardContent>
              </Card>

              {/* Current Experience */}
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Briefcase className="w-4 h-4 mr-2 text-emerald-600" />
                    Current Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-900">{candidate.currentRole}</span>
                      </div>
                      <div className="text-sm text-gray-600">{candidate.company}</div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-900">{candidate.experience} experience</span>
                      </div>
                      <div className="text-sm text-gray-600">{candidate.industry} industry</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {candidate.isAdminView && candidate.applicationsAndSavedJobs && (
            /* Upgraded Applications & Saved Jobs Card for Admin */
            <Card className="card-shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                  <ClipboardList className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-100" />
                  Applications & Saved Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <hr className="mb-6 border-gray-200" />
                
                {/* 4 Status Boxes in a Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50 text-center">
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Total</div>
                    <div className="text-xl font-extrabold text-slate-700 mt-2">
                      {candidate.applicationsAndSavedJobs.total ?? 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50 text-center">
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Active</div>
                    <div className="text-xl font-extrabold text-emerald-600 mt-2">
                      {candidate.applicationsAndSavedJobs.active ?? 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50 text-center">
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Awaiting</div>
                    <div className="text-xl font-extrabold text-slate-700 mt-2">
                      {candidate.applicationsAndSavedJobs.awaiting ?? 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50 text-center">
                    <div className="text-[11px] text-gray-500 font-bold tracking-wider uppercase">Saved</div>
                    <div className="text-xl font-extrabold text-slate-700 mt-2">
                      {candidate.applicationsAndSavedJobs.saved ?? 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.isAdminView && candidate.allEducation && candidate.allEducation.length > 0 ? (
            /* Upgraded Education Timeline Card for Admin */
            <Card className="card-shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                  <GraduationCap className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-100" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <hr className="mb-6 border-gray-200" />
                
                <div className="relative pl-6 border-l-2 border-emerald-100 ml-3 space-y-8">
                  {candidate.allEducation.map((edu: any, index: number) => {
                    const isFirst = index === 0;
                    return (
                      <div key={index} className="relative">
                        {/* Timeline Circle */}
                        <div className="absolute -left-[37px] top-1 flex items-center justify-center">
                          {isFirst ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-600">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-300">
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-800">
                            {edu.highestDegree || edu.degree || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">
                            {edu.institution || "N/A"}
                          </p>
                          <div className="inline-block mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
                              {edu.yearOfGraduation || edu.year || "N/A"}
                            </span>
                            {edu.gradeCgpa && edu.gradeCgpa !== "N/A" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100 ml-2">
                                Grade: {edu.gradeCgpa}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Education */
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <GraduationCap className="w-4 h-4 mr-2 text-emerald-600" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{candidate.degree}</div>
                    <div className="text-sm text-gray-600">{candidate.institution}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Graduated: {candidate.year}</div>
                    <div className="text-sm text-gray-600">Grade: {candidate.grade}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.isAdminView ? (
            <>
              {/* Upgraded Top Skills Card for Admin */}
              <Card className="card-shadow border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                    <Award className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-100" />
                    Top Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <hr className="mb-6 border-gray-200" />
                  
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    {candidate.skills.split(", ").map((skill, index) => {
                      const isTop = index < 3;
                      return (
                        <span
                          key={index}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                            isTop
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  {candidate.certifications && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-gray-400 font-bold tracking-wider uppercase">Certifications</div>
                      <div className="space-y-2.5">
                        {candidate.certifications.split(", ").map((cert, index) => (
                          <div key={index} className="flex items-start gap-2.5 text-sm font-semibold text-slate-800">
                            <Award className="w-4 h-4 text-emerald-600 fill-emerald-100 mt-0.5 shrink-0" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgraded Preferences Card for Admin */}
              <Card className="card-shadow border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                    <SlidersHorizontal className="w-5 h-5 mr-2 text-emerald-700" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <hr className="mb-6 border-gray-200" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50">
                      <div className="text-xs text-gray-500 font-semibold">Job Type</div>
                      <div className="text-sm font-bold text-slate-850 mt-2">{candidate.jobType || "N/A"}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50">
                      <div className="text-xs text-gray-500 font-semibold">Preferred Locations</div>
                      <div className="text-sm font-bold text-slate-850 mt-2 truncate" title={candidate.preferredLocation}>{candidate.preferredLocation || "N/A"}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100/50 border-l-4 border-l-emerald-600">
                      <div className="text-xs text-gray-500 font-semibold">Availability</div>
                      <div className="text-sm font-bold text-slate-850 mt-2">{candidate.availability || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Skills & Certifications */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.split(", ").map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {candidate.certifications.split(", ").map((cert, index) => (
                        <div key={index} className="text-sm text-gray-700">• {cert}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Preferences */}
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Job Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Job Type</div>
                      <div className="font-semibold text-gray-900">{candidate.jobType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Salary Expectation</div>
                      <div className="font-semibold text-gray-900">{candidate.salaryExpectation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Preferred Location</div>
                      <div className="font-semibold text-gray-900">{candidate.preferredLocation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Availability</div>
                      <div className="font-semibold text-gray-900">{candidate.availability}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {candidate.isAdminView ? (
            <>
              {/* Upgraded Social Profiles Card for Admin */}
              <Card className="card-shadow border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                    <Share2 className="w-5 h-5 mr-2 text-emerald-700" />
                    Social Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-6">
                  <hr className="mb-6 border-gray-200" />
                  
                  {/* Round Social Buttons */}
                  <div className="flex gap-4">
                    {candidate.socialProfiles?.linkedIn ? (
                      <a
                        href={candidate.socialProfiles.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0A66C2] hover:bg-blue-100 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <LinkedInBrandIcon className="w-5 h-5" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-not-allowed">
                        <LinkedInBrandIconMuted className="w-5 h-5" />
                      </div>
                    )}

                    {candidate.socialProfiles?.instagram ? (
                      <a
                        href={candidate.socialProfiles.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        title="Instagram Profile"
                      >
                        <InstagramBrandIcon className="w-5 h-5" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-not-allowed">
                        <InstagramBrandIconMuted className="w-5 h-5" />
                      </div>
                    )}

                    {candidate.socialProfiles?.twitterX ? (
                      <a
                        href={candidate.socialProfiles.twitterX}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                        title="Twitter Profile"
                      >
                        <TwitterBrandIcon className="w-5 h-5" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center cursor-not-allowed">
                        <TwitterBrandIconMuted className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Connected Labels */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      {candidate.socialProfiles?.linkedInConnected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" />
                          <span>LinkedIn Connected: Yes</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                          <span>LinkedIn Connected: No</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      {candidate.socialProfiles?.instagramConnected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2.5 shrink-0" />
                          <span>Instagram Connected: Yes</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                          <span>Instagram Connected: No</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Profile Picture Action Button */}
                  {candidate.socialProfiles?.profilePicture && (
                    <div className="pt-2">
                      <a href={candidate.socialProfiles.profilePicture} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          className="border-gray-200 text-slate-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-semibold"
                        >
                          View Full Profile Picture
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgraded Documents Card for Admin */}
              <Card className="card-shadow border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                    <Folder className="w-5 h-5 mr-2 text-emerald-700 fill-emerald-100" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <hr className="mb-6 border-gray-200" />
                  
                  <div className="space-y-4">
                    {/* Resume Document */}
                    {candidate.resumeFilename && candidate.resumeFilename !== "N/A" && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/20 border border-blue-100/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white border border-blue-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[400px]">
                              {candidate.resumeFilename}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">Resume • Click preview to view</div>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadDocument((candidate as any).resumeUrl || (candidate as any).resumeDocument, candidate.resumeFilename)}
                          className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-50 animate-fade-in"
                          title="Preview / Download"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Cover Letter Document */}
                    {candidate.coverLetter && candidate.coverLetter !== "N/A" && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/20 border border-blue-100/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white border border-blue-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[400px]">
                              {candidate.coverLetter}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">Cover Letter • Click preview to view</div>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadDocument((candidate as any).coverLetterUrl, candidate.coverLetter)}
                          className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-50"
                          title="Preview / Download"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Additional Documents List */}
                    {candidate.documentsList.map((doc, index) => {
                      const url = (candidate as any).documentsUrls?.[index] || "";
                      const isImage = /\.(jpg|jpeg|png|webp)$/i.test(doc) || url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.png') || url.toLowerCase().includes('.jpeg');
                      return (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-blue-50/20 border border-blue-100/50">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-white border border-blue-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                              {isImage ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[400px]">
                                {doc}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">Additional Document • Click preview to view</div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadDocument(url, doc)}
                            className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-50"
                            title="Preview / Download"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Documents */
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-medium">{candidate.resumeFilename}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadDocument((candidate as any).resumeUrl || (candidate as any).resumeDocument, candidate.resumeFilename)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-3 text-green-600" />
                      <span className="font-medium">{candidate.coverLetter}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadDocument((candidate as any).coverLetterUrl, candidate.coverLetter)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {candidate.documentsList.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-3 text-purple-600" />
                        <span className="font-medium">{doc}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDocument((candidate as any).documentsUrls?.[index], doc)}
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
        </div>
      </main>
    </div>
  );
}


