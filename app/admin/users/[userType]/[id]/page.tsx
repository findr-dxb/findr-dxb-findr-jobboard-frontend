"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CandidateProfileView } from "@/components/candidate-profile"
import { CompanyProfileView } from "@/components/company-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield, Mail, User, Phone, Smartphone, Calendar, Globe, Users, Info, Lock, BriefcaseIcon, ChevronRight, Code2, Palette, Terminal, MapPin, FolderClosed, FileText, Download, UserCheck, UserMinus, Share2, Link, Hash } from "lucide-react"
import {
  LinkedInBrandIcon,
  InstagramBrandIcon,
  TwitterBrandIcon,
  FacebookBrandIcon,
} from "@/components/icons/social-brand-icons"
import { determineJobseekerMembershipFromUser } from "@/lib/jobseeker-membership"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminUserDetailPage() {
  const params = useParams() as { userType: string; id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [showAllJobs, setShowAllJobs] = useState(false)
  const [selectedJobForApps, setSelectedJobForApps] = useState<any | null>(null)
  const [jobApps, setJobApps] = useState<any[]>([])
  const [isLoadingApps, setIsLoadingApps] = useState(false)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch(e) {
      return "N/A";
    }
  }

  const getFileInfo = (url: string, defaultName: string) => {
    if (!url) return null;
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1] || defaultName;
      const extParts = filename.split('.');
      const ext = extParts.length > 1 ? extParts[extParts.length - 1].split('?')[0].toUpperCase() : 'PDF';
      return {
        name: defaultName,
        url,
        ext,
        size: '2.4 MB'
      };
    } catch(e) {
      return null;
    }
  }

  const downloadDocument = async (url: string | undefined, fileName: string) => {
    if (!url) {
      toast({
        title: "Download Error",
        description: `${fileName} is not available for download.`,
        variant: "destructive",
      })
      return
    }

    try {
      let filename = fileName
      const urlParts = url.split("/")
      const lastPart = urlParts[urlParts.length - 1]
      if (lastPart?.includes(".")) {
        const cleanFilename = lastPart.split("?")[0]
        if (cleanFilename) filename = cleanFilename
      }

      const response = await fetch(url, { method: "GET" })
      if (!response.ok) throw new Error("Failed to fetch document")

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)

      toast({
        title: "Download Started",
        description: `Downloading ${filename}...`,
      })
    } catch (error) {
      console.error("Download error:", error)
      try {
        window.open(url, "_blank")
        toast({
          title: "Opening Document",
          description: `${fileName} opened in a new tab.`,
        })
      } catch {
        toast({
          title: "Download Error",
          description: `Failed to download ${fileName}. Please try again.`,
          variant: "destructive",
        })
      }
    }
  }

  const fetchJobApplications = async (job: any) => {
    setSelectedJobForApps(job);
    setIsLoadingApps(true);
    setJobApps([]);
    try {
      const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/admin/applications`, {
        params: {
          jobId: job._id || job.id,
          limit: 100
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data?.success && response.data?.data && Array.isArray(response.data.data.applications)) {
        setJobApps(response.data.data.applications);
      }
    } catch (e) {
      console.error("Error fetching job applications:", e);
    } finally {
      setIsLoadingApps(false);
    }
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
        const response = await axios.get(`${API_BASE_URL}/admin/users/${params.userType}/${params.id}/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        
        if (response.data?.success) {
          setUserData(response.data.data)
        } else {
          setError(response.data?.message || "Failed to load user profile")
        }
      } catch (e: any) {
        console.error("Error fetching user profile:", e)
        setError(e.response?.data?.message || "Failed to load user details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.userType && params.id) {
      fetchUserProfile()
    }
  }, [params.userType, params.id])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading profile…
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>{error || "User not found"}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border"
        >
          Go back
        </button>
      </div>
    )
  }

  // Map API shape to read-only view props
  if (params.userType === "jobseeker") {
    // Extract first professional experience (or use empty defaults)
    const firstExperience = userData.professionalExperience?.[0] || {};
    
    // Extract first education (or use empty defaults)
    const firstEducation = userData.education?.[0] || {};
    
    // Extract job preferences
    const jobPrefs = userData.jobPreferences || {};
    const preferredJobTypes = Array.isArray(jobPrefs.preferredJobType) 
      ? jobPrefs.preferredJobType.join(", ") 
      : (jobPrefs.preferredJobType || "N/A");
    
    // Extract documents
    const resumeAndDocs = Array.isArray(jobPrefs.resumeAndDocs) ? jobPrefs.resumeAndDocs : [];
    const resumeDocument = userData.resumeDocument || "";
    const allDocuments = resumeDocument ? [resumeDocument, ...resumeAndDocs] : resumeAndDocs;
    
    // Format date of birth
    const formattedDateOfBirth = userData.dateOfBirth 
      ? new Date(userData.dateOfBirth).toLocaleDateString() 
      : "N/A";
    
    // Format year of graduation
    const formattedYear = firstEducation.yearOfGraduation 
      ? firstEducation.yearOfGraduation.toString() 
      : "N/A";

    // Calculate membership from salary + Emirati nationality
    const calculateTier = () => {
      return determineJobseekerMembershipFromUser(userData)
    };

    const candidate = {
      name: userData.fullName || userData.name || "N/A",
      email: userData.email || "N/A",
      phone: userData.phoneNumber || "N/A",
      location: userData.location || "N/A",
      dateOfBirth: userData.dateOfBirth || formattedDateOfBirth,
      nationality: userData.nationality || "N/A",
      summary: userData.professionalSummary || "N/A",
      currentRole: firstExperience.currentRole || "N/A",
      company: firstExperience.company || "N/A",
      experience: (firstExperience.yearsOfExperience?.toString?.() || "0") + " years",
      industry: firstExperience.industry || "N/A",
      degree: firstEducation.highestDegree || "N/A",
      institution: firstEducation.institution || "N/A",
      year: formattedYear,
      grade: firstEducation.gradeCgpa || "N/A",
      skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : (userData.skills || "N/A"),
      certifications: Array.isArray(userData.certifications) ? userData.certifications.join(", ") : (userData.certifications || "N/A"),
      jobType: preferredJobTypes,
      salaryExpectation: jobPrefs.salaryExpectation || "N/A",
      preferredLocation: jobPrefs.preferredLocation || "N/A",
      availability: jobPrefs.availability || "N/A",
      appliedFor: "", // Remove for admin view
      appliedDate: "", // Remove for admin view
      status: userData.loginStatus || "Active",
      resumeFilename: resumeDocument ? resumeDocument.split('/').pop() || "Resume.pdf" : "N/A",
      coverLetter: allDocuments.length > 1 ? allDocuments[1].split('/').pop() || "Cover Letter.pdf" : "N/A",
      documentsList: allDocuments.slice(2).map((doc: string) => doc.split('/').pop() || "Document.pdf"),
      resumeDocument,
      coverLetterUrl: allDocuments.length > 1 ? allDocuments[1] : "",
      documentsUrls: allDocuments.slice(2),
      rating: userData.rating || 0,
      tier: calculateTier(),
      spokenLanguages: userData.spokenLanguages || "",
      emirateId: userData.emirateId || "N/A",
      referredBy: userData.referredBy
        ? {
            name: userData.referredBy.fullName || userData.referredBy.name || "N/A",
            email: userData.referredBy.email || "N/A",
            profilePicture: userData.referredBy.profilePicture || "",
            linkedin: userData.referredBy.socialLinks?.linkedIn || "",
          }
        : null,
      introVideo: userData.introVideo || "",
      isAdminView: true,
      profileCompleted: userData.profileCompleted || 100,
      pointsAndRewards: {
        points: userData.points || 0,
        deductedPoints: userData.deductedPoints || 0,
        rmService: userData.rmService || "Inactive",
        rewards: userData.rewards || {},
      },
      applicationsAndSavedJobs: {
        total: userData.applications?.totalApplications || 0,
        active: userData.applications?.activeApplications || 0,
        awaiting: userData.applications?.awaitingFeedback || 0,
        saved: userData.savedJobs?.length || 0,
      },
      allEducation: userData.education || [],
      socialProfiles: {
        linkedIn: userData.socialLinks?.linkedIn || "",
        instagram: userData.socialLinks?.instagram || "",
        twitterX: userData.socialLinks?.twitterX || "",
        linkedInConnected: userData.linkedIn || false,
        instagramConnected: userData.instagram || false,
        profilePicture: userData.profilePicture || "",
      },
    }
    
    // Additional admin data
    const adminData = {
      emirateId: userData.emirateId || "N/A",
      passportNumber: userData.passportNumber || "N/A",
      profilePicture: userData.profilePicture || "",
      introVideo: userData.introVideo || "",
      socialLinks: userData.socialLinks || {},
      rmService: userData.rmService || "Inactive",
      points: userData.points || 0,
      deductedPoints: userData.deductedPoints || 0,
      rewards: userData.rewards || {},
      referralRewardPoints: userData.referralRewardPoints || 0,
      profileCompleted: userData.profileCompleted || "0",
      linkedIn: userData.linkedIn || false,
      instagram: userData.instagram || false,
      applications: userData.applications || {},
      savedJobs: userData.savedJobs || [],
      orders: userData.orders || [],
      allProfessionalExperience: userData.professionalExperience || [],
      allEducation: userData.education || [],
      createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A",
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : "N/A",
      resumeAndDocs: allDocuments,
      referredBy: userData.referredBy
        ? {
            name: userData.referredBy.fullName || userData.referredBy.name || "N/A",
            email: userData.referredBy.email || "N/A",
            profilePicture: userData.referredBy.profilePicture || "",
            linkedin: userData.referredBy.socialLinks?.linkedIn || "",
          }
        : null,
    }

    return (
      <div className="w-full bg-transparent pt-0 mt-0">
        <div className="pt-0 pb-2">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-full px-4 py-1.5 text-xs font-semibold transition-all mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Users</span>
            </Button>
          </div>
        </div>

        {/* Main Profile View */}
        <CandidateProfileView candidate={candidate} />

        {/* Admin Additional Information */}
        <div className="pt-6 pb-8 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Orders */}
            {adminData.orders && adminData.orders.length > 0 && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
                    Orders ({adminData.orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminData.orders.map((order: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Service</div>
                            <div className="font-semibold">{order.service || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Status</div>
                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                              {order.status || "N/A"}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Price</div>
                            <div className="font-semibold">AED {order.price || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                            <div className="font-semibold">AED {order.totalAmount || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Points Used</div>
                            <div className="font-semibold">{order.pointsUsed || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Order Date</div>
                            <div className="font-semibold">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                          {order.couponCode && (
                            <div className="md:col-span-2">
                              <div className="text-sm text-gray-600 mb-1">Coupon Code</div>
                              <div className="font-semibold">{order.couponCode}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  const company = {
    companyName: userData.companyName || userData.name || "N/A",
    industry: userData.industry || "N/A",
    teamSize: userData.teamSize || "N/A",
    foundedYear: (userData.foundedYear?.toString?.() || "N/A"),
    about: userData.aboutCompany || userData.about || "N/A",
    location: {
      city: userData.city || "N/A",
      country: userData.country || "N/A",
      officeAddress: userData.companyLocation || userData.officeAddress || "N/A",
    },
    website: userData.website || "N/A",
    verified: Boolean(userData.documents?.businessLicense),
    logo: userData.companyLogo || userData.profilePhoto || "",
    specialties: userData.specialties || [],
    achievements: userData.achievements || [],
    workCulture: userData.workCulture || [],
    socialLinks: userData.socialLinks || {},
    activeJobsCount: userData.activeJobs ? userData.activeJobs.length : (userData.activeJobsCount || 0),
    totalJobsPosted: userData.postedJobs ? userData.postedJobs.length : (userData.totalJobsPosted || 0),
    memberSince: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A",
    email: userData.email || "N/A",
    phone: userData.phoneNumber || "N/A",
    isAdminView: true,
    membershipTier: userData.membershipTier || "Blue",
    verificationStatus: userData.documents?.businessLicense ? "verified" : (userData.verificationStatus || "pending"),
    profileCompleted: userData.profileCompleted || 0,
  }

  const adminReferral = userData.referredBy
    ? {
        name: userData.referredBy.fullName || userData.referredBy.name || "N/A",
        email: userData.referredBy.email || "N/A",
        profilePicture: userData.referredBy.profilePicture || "",
        linkedin: userData.referredBy.socialLinks?.linkedIn || "",
      }
    : null;

  return (
    <div className="w-full bg-transparent">
      <div className="pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Users
          </Button>
        </div>
      </div>

      {/* Main Profile View (Shows the blue header card on very top) */}
      <CompanyProfileView company={company} />

      {/* Admin view for Employer's Referral & Admin info (rendered below profile) */}
      <div className="pt-2 pb-8 bg-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Administrative Overview */}
            <Card className="card-shadow border-0 border-l-4 border-l-emerald-600 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                  <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                  Administrative Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="p-6 rounded-xl bg-blue-50/20 border border-blue-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Login Email</div>
                      <div className="font-semibold text-slate-800 text-sm truncate" title={userData.email}>{userData.email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Subscription Plan</div>
                      <div className="font-semibold text-slate-800 text-sm capitalize">{userData.subscriptionPlan || "Free"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Contact Phone</div>
                      <div className="font-semibold text-slate-800 text-sm">{userData.phoneNumber || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Subscription Status</div>
                      <div>
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-100/50 hover:bg-blue-50 text-xs px-2.5 py-0.5 rounded font-semibold capitalize shadow-none">
                          {userData.subscriptionStatus || "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Verification</div>
                      <div className="font-semibold text-slate-800 text-sm capitalize">{userData.documents?.businessLicense ? "verified" : (userData.verificationStatus || "pending")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Available Points</div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {userData.points || 0}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Membership Tier</div>
                      <div className="font-semibold text-slate-800 text-sm capitalize">{userData.membershipTier || "Blue"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Referral Code</div>
                      <div className="font-semibold text-slate-800 text-sm uppercase">{userData.referralCode || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Account Created</div>
                      <div className="font-semibold text-slate-800 text-sm">{formatDate(userData.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Last Updated</div>
                      <div className="font-semibold text-slate-800 text-sm">{formatDate(userData.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Account Contact */}
            <Card className="card-shadow border-0 mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">{userData.contactPerson?.name || "N/A"}</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Primary Account Contact</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm/50">
                    <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate" title={userData.contactPerson?.email || userData.companyEmail}>
                      {userData.contactPerson?.email || userData.companyEmail || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm/50">
                    <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {userData.contactPerson?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Postings Card */}
            {userData.postedJobs && userData.postedJobs.length > 0 && (
              <Card className="card-shadow border-0 mb-6">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                    <BriefcaseIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Job Postings
                  </CardTitle>
                  <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white font-semibold rounded-full px-3 py-0.5 text-xs shadow-none">
                    Total: {userData.postedJobs.length}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {(showAllJobs ? userData.postedJobs : userData.postedJobs.slice(0, 2)).map((job: any) => {
                      // Dynamically pick icon
                      const titleLower = (job.title || "").toLowerCase();
                      let JobIcon = BriefcaseIcon;
                      if (titleLower.includes("react") || titleLower.includes("developer") || titleLower.includes("code") || titleLower.includes("software") || titleLower.includes("engineer")) {
                        JobIcon = Code2;
                      } else if (titleLower.includes("designer") || titleLower.includes("ui") || titleLower.includes("ux") || titleLower.includes("creative") || titleLower.includes("art")) {
                        JobIcon = Palette;
                      }

                      return (
                        <div
                          key={job._id || job.id}
                          onClick={() => router.push(`/admin/jobs/${job._id || job.id}`)}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm/50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-50/50 border border-blue-100/10 flex items-center justify-center shrink-0">
                              <JobIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 truncate">{job.title || "N/A"}</h4>
                              <p className="text-xs text-slate-500 mt-1 truncate">
                                {job.location || "N/A"} • {Array.isArray(job.jobType) ? job.jobType.join(", ") : (job.jobType || "N/A")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchJobApplications(job);
                              }}
                              className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 text-xs rounded-lg border border-blue-100/50 hover:bg-blue-100/85 transition-colors cursor-pointer"
                            >
                              {job.applications?.length || 0} Applications
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {userData.postedJobs.length > 2 && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllJobs(!showAllJobs)}
                        className="w-full border-dashed border-gray-250 hover:bg-slate-50/80 rounded-lg py-2.5 text-sm font-semibold text-slate-600 flex items-center justify-center"
                      >
                        {showAllJobs ? "Show Less" : `View All ${userData.postedJobs.length} Jobs`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Headquarters Card */}
            {(userData.companyLocation || userData.officeAddress || userData.city || userData.country) && (
              <Card className="card-shadow border-0 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                    Headquarters
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-slate-700 leading-relaxed font-medium">
                  {userData.companyLocation || userData.officeAddress ? (
                    <div>{userData.companyLocation || userData.officeAddress}</div>
                  ) : null}
                  {userData.city || userData.country ? (
                    <div className="text-slate-500 mt-1">
                      {userData.city && userData.country ? `${userData.city}, ${userData.country}` : (userData.city || userData.country)}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Documents Card */}
            {(() => {
              const docsList = [];
              if (userData.documents?.businessLicense) {
                docsList.push(getFileInfo(userData.documents.businessLicense, "Business License"));
              }
              if (userData.documents?.taxRegistration) {
                docsList.push(getFileInfo(userData.documents.taxRegistration, "Tax Registration Certificate"));
              }
              if (Array.isArray(userData.documents?.otherDocuments)) {
                userData.documents.otherDocuments.forEach((doc: string, idx: number) => {
                  if (doc) docsList.push(getFileInfo(doc, `Other Document ${idx + 1}`));
                });
              }

              if (docsList.length === 0) return null;

              return (
                <Card className="card-shadow border-0 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                      <FolderClosed className="w-5 h-5 mr-2 text-emerald-600" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <hr className="mb-4 border-gray-200" />
                    <div className="space-y-3">
                      {docsList.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm/50 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-50/50 border border-blue-100/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 truncate">
                                {doc.ext} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadDocument(doc.url, doc.name)}
                            className="p-2 text-slate-450 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                            title={`Download ${doc.name}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Onboarding Card */}
            <Card className="card-shadow border-0 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                  <UserCheck className="w-5 h-5 mr-2 text-emerald-600" />
                  Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <hr className="mb-4 border-gray-200" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Referred By</div>
                  {adminReferral ? (
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-800">
                      <UserMinus className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a href={`mailto:${adminReferral.email}`} className="hover:underline">{adminReferral.name}</a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                      <UserMinus className="w-4 h-4 text-emerald-650 shrink-0" />
                      <span>Self Registered</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            <Card className="card-shadow border-0 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl font-bold text-emerald-900">
                  <Share2 className="w-5 h-5 mr-2 text-emerald-600" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <hr className="mb-4 border-gray-200" />
                <div className="flex items-center gap-3">
                  {userData.website && userData.website !== "N/A" && (
                    <a
                      href={userData.website.startsWith("http") ? userData.website : `https://${userData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-colors shadow-sm"
                      title="Website"
                    >
                      <Link className="w-4 h-4" />
                    </a>
                  )}
                  {userData.socialLinks?.linkedin && (
                    <a
                      href={userData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                      title="LinkedIn"
                    >
                      <LinkedInBrandIcon className="w-5 h-5" />
                    </a>
                  )}
                  {userData.socialLinks?.instagram && (
                    <a
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                      title="Instagram"
                    >
                      <InstagramBrandIcon className="w-5 h-5" />
                    </a>
                  )}
                  {userData.socialLinks?.twitter && (
                    <a
                      href={userData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                      title="Twitter"
                    >
                      <TwitterBrandIcon className="w-5 h-5" />
                    </a>
                  )}
                  {userData.socialLinks?.facebook && (
                    <a
                      href={userData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                      title="Facebook"
                    >
                      <FacebookBrandIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Side-panel for Job Applications */}
      <Sheet open={!!selectedJobForApps} onOpenChange={(open) => { if (!open) setSelectedJobForApps(null); }}>
        <SheetContent className="sm:max-w-xl overflow-y-auto max-h-screen">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-emerald-600" />
              <span>Applications</span>
            </SheetTitle>
            <SheetDescription className="text-sm font-semibold text-slate-500 mt-1">
              Job: {selectedJobForApps?.title || "N/A"}
            </SheetDescription>
          </SheetHeader>
          <hr className="mb-4 border-slate-100" />

          {isLoadingApps ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700" />
              <p className="text-xs text-slate-400 mt-3 font-semibold">Loading applicants...</p>
            </div>
          ) : jobApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-semibold text-sm">No applications found for this job.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobApps.map((app: any) => (
                <div 
                  key={app.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col gap-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-center gap-3">
                      {app.candidateAvatar ? (
                        <img 
                          src={app.candidateAvatar} 
                          alt={app.candidate} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                          {app.candidateInitials}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{app.candidate}</h4>
                        <div className="text-xs text-slate-500 font-semibold mt-1">
                          Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`capitalize font-semibold border px-2.5 py-0.5 rounded-full text-[10px] shadow-none ${
                      app.status === "hired" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      app.status === "rejected" || app.status === "admin_rejected" ? "bg-red-50 text-red-700 border-red-200" :
                      app.status === "shortlisted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-250"
                    }`}>
                      {app.status === "admin_review" ? "Unattended" : (app.status || "Pending")}
                    </Badge>
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${app.email}`} className="hover:underline truncate">{app.email}</a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{app.phone}</span>
                    </div>
                  </div>

                  {/* Action buttons (Resume and View profile) */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100/50">
                    <div>
                      {app.resume ? (
                        <a 
                          href={app.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">No Resume Uploaded</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedJobForApps(null);
                        router.push(`/admin/users/jobseeker/${app.applicantId}`);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 h-auto rounded-lg transition-colors cursor-pointer"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
