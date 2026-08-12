"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CandidateProfileView } from "@/components/candidate-profile"
import { CompanyProfileView } from "@/components/company-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield, Mail, User } from "lucide-react"
import { determineJobseekerMembershipFromUser } from "@/lib/jobseeker-membership"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdminUserDetailPage() {
  const params = useParams() as { userType: string; id: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        }
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }
        const response = await fetch(`${API_BASE_URL}/admin/users/${params.userType}/${params.id}/profile`, { headers })
        const result = await response.json()
        
        if (result.success) {
          setUserData(result.data)
        } else {
          setError(result.message || "Failed to load user profile")
        }
      } catch (e) {
        console.error("Error fetching user profile:", e)
        setError("Failed to load user details")
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
    verified: Boolean(userData.verificationStatus === 'verified'),
    logo: userData.companyLogo || userData.profilePhoto || "",
    specialties: userData.specialties || [],
    achievements: userData.achievements || [],
    workCulture: userData.workCulture || [],
    socialLinks: userData.socialLinks || {},
    activeJobsCount: userData.activeJobs ? userData.activeJobs.length : (userData.activeJobsCount || 0),
    totalJobsPosted: userData.postedJobs ? userData.postedJobs.length : (userData.totalJobsPosted || 0),
    memberSince: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A",
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
      <div className="pt-6 pb-8 bg-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="card-shadow border-0 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Employer Administrative Information (Admin View)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Login Email</div>
                  <div className="font-semibold text-gray-900">{userData.email || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Contact Phone</div>
                  <div className="font-semibold text-gray-900">{userData.phoneNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Verification Status</div>
                  <Badge variant={userData.verificationStatus === "verified" ? "default" : "secondary"}>
                    {userData.verificationStatus || "pending"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Subscription Plan</div>
                  <div className="font-semibold text-gray-900 capitalize">{userData.subscriptionPlan || "free"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Subscription Status</div>
                  <Badge variant={userData.subscriptionStatus === "active" ? "default" : "secondary"}>
                    {userData.subscriptionStatus || "inactive"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Membership Tier</div>
                  <div className="font-semibold text-gray-900">{userData.membershipTier || "Blue"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Referral Code</div>
                  <div className="font-semibold text-gray-900">{userData.referralCode || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Available Points</div>
                  <div className="font-semibold text-gray-900">{userData.points || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Profile Completion</div>
                  <div className="font-semibold text-gray-900">{userData.profileCompleted || 0}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Account Created</div>
                  <div className="font-semibold text-gray-900">{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div className="font-semibold text-gray-900">{userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>

              {/* Contact Person Sub-section */}
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-500 mb-3 font-semibold">Contact Person Details</div>
                <div className="grid md:grid-cols-3 gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="font-medium text-gray-900">{userData.contactPerson?.name || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{userData.contactPerson?.email || userData.companyEmail || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">{userData.contactPerson?.phone || "N/A"}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-500 mb-2 font-semibold">Referred By</div>
                {adminReferral ? (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                    {adminReferral.profilePicture ? (
                      <img
                        src={adminReferral.profilePicture}
                        alt={adminReferral.name}
                        className="w-12 h-12 rounded-full object-cover border border-emerald-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-700 font-bold text-lg">
                        {adminReferral.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">
                        {adminReferral.name}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <a
                          href={`mailto:${adminReferral.email}`}
                          className="text-sm text-gray-600 hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {adminReferral.email}
                        </a>
                        {adminReferral.linkedin && (
                          <>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <a
                              href={adminReferral.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 font-medium truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                            >
                              <svg
                                className="w-3.5 h-3.5 fill-current shrink-0"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                              </svg>
                              {adminReferral.linkedin}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Self Registered</div>
                      <div className="text-xs text-gray-500">This company registered directly without a referral code.</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
