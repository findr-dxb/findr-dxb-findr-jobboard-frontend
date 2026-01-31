"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CandidateProfileView } from "@/components/candidate-profile"
import { CompanyProfileView } from "@/components/company-profile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, 
  FileText, Award, ExternalLink, Video, Image as ImageIcon, 
  Gift, ShoppingCart, Bookmark, Clock, Shield
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1'

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
        
        const response = await fetch(`${API_BASE_URL}/admin/users/${params.userType}/${params.id}/profile`)
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

    // Calculate tier dynamically (same logic as dashboard and profile pages)
    const calculateTier = () => {
      // Calculate profile completion points
      let completed = 0;
      const totalFields = 24;
      
      if (userData.fullName) completed++;
      if (userData.email) completed++;
      if (userData.phoneNumber) completed++;
      if (userData.location) completed++;
      if (userData.dateOfBirth) completed++;
      if (userData.nationality) completed++;
      if (userData.professionalSummary) completed++;
      if (userData.emirateId) completed++;
      if (userData.passportNumber) completed++;
      
      if (firstExperience.currentRole) completed++;
      if (firstExperience.company) completed++;
      if (firstExperience.yearsOfExperience) completed++;
      if (firstExperience.industry) completed++;
      
      if (firstEducation.highestDegree) completed++;
      if (firstEducation.institution) completed++;
      if (firstEducation.yearOfGraduation) completed++;
      if (firstEducation.gradeCgpa) completed++;
      
      if (userData.skills && userData.skills.length > 0) completed++;
      if (jobPrefs.preferredJobType && jobPrefs.preferredJobType.length > 0) completed++;
      if (userData.certifications && userData.certifications.length > 0) completed++;
      if (jobPrefs.resumeAndDocs && jobPrefs.resumeAndDocs.length > 0) completed++;
      if (userData.socialLinks?.linkedIn) completed++;
      if (userData.socialLinks?.instagram) completed++;
      if (userData.socialLinks?.twitterX) completed++;
      
      const percentage = Math.min(Math.round((completed / totalFields) * 100), 100);
      
      // Calculate base points
      const basePoints = 50 + percentage * 2;
      
      // Get experience and determine tier (for display purposes only)
      const yearsExp = firstExperience.yearsOfExperience || 0;
      const isEmirati = userData.nationality?.toLowerCase().includes("emirati");
      
      // Determine tier
      let tier: string;
      if (isEmirati) tier = "Platinum";
      else if (basePoints >= 500) tier = "Platinum";
      else if (yearsExp >= 5) tier = "Gold";
      else if (yearsExp >= 2 && yearsExp <= 5) tier = "Silver";
      else tier = "Blue";
      
      // Use base points directly without multiplier
      const calculatedBasePoints = basePoints;
      
      // Add other points
      const applicationPoints = userData.rewards?.applyForJobs || 0;
      const rmServicePoints = userData.rewards?.rmService || 0;
      const deductedPoints = userData.deductedPoints || 0;
      
      const totalPoints = calculatedBasePoints + applicationPoints + rmServicePoints;
      const availablePoints = Math.max(0, totalPoints - deductedPoints);
      
      return tier;
    };

    const candidate = {
      name: userData.fullName || userData.name || "N/A",
      email: userData.email || "N/A",
      phone: userData.phoneNumber || "N/A",
      location: userData.location || "N/A",
      dateOfBirth: formattedDateOfBirth,
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
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Main Profile View */}
        <CandidateProfileView candidate={candidate} />

        {/* Admin Additional Information */}
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6 mt-6">
            {/* Additional Personal Information */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Additional Personal Information (Admin View)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Emirates ID</div>
                    <div className="font-semibold">{adminData.emirateId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Passport Number</div>
                    <div className="font-semibold">{adminData.passportNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Profile Completion</div>
                    <div className="font-semibold">{adminData.profileCompleted}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Account Created</div>
                    <div className="font-semibold">{adminData.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                    <div className="font-semibold">{adminData.updatedAt}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Professional Experience */}
            {adminData.allProfessionalExperience && adminData.allProfessionalExperience.length > 0 && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    All Professional Experience ({adminData.allProfessionalExperience.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminData.allProfessionalExperience.map((exp: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Role</div>
                            <div className="font-semibold">{exp.currentRole || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Company</div>
                            <div className="font-semibold">{exp.company || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Experience</div>
                            <div className="font-semibold">{exp.yearsOfExperience || 0} years</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Industry</div>
                            <div className="font-semibold">{exp.industry || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Education */}
            {adminData.allEducation && adminData.allEducation.length > 0 && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                    All Education ({adminData.allEducation.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminData.allEducation.map((edu: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Degree</div>
                            <div className="font-semibold">{edu.highestDegree || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Institution</div>
                            <div className="font-semibold">{edu.institution || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Year of Graduation</div>
                            <div className="font-semibold">{edu.yearOfGraduation || "N/A"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Grade/CGPA</div>
                            <div className="font-semibold">{edu.gradeCgpa || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media & Media */}
            {(adminData.socialLinks?.linkedIn || adminData.socialLinks?.instagram || adminData.socialLinks?.twitterX || adminData.profilePicture || adminData.introVideo) && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                    Social Media & Media Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {adminData.socialLinks?.linkedIn && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">LinkedIn</div>
                        <a href={adminData.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {adminData.socialLinks.linkedIn} <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    )}
                    {adminData.socialLinks?.instagram && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Instagram</div>
                        <a href={adminData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {adminData.socialLinks.instagram} <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    )}
                    {adminData.socialLinks?.twitterX && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Twitter/X</div>
                        <a href={adminData.socialLinks.twitterX} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {adminData.socialLinks.twitterX} <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    )}
                    {adminData.profilePicture && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Profile Picture</div>
                        <a href={adminData.profilePicture} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" /> View Image <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                    {adminData.introVideo && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Intro Video</div>
                        <a href={adminData.introVideo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          <Video className="w-3 h-3 mr-1" /> Watch Video <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">LinkedIn Connected</div>
                      <Badge variant={adminData.linkedIn ? "default" : "secondary"}>
                        {adminData.linkedIn ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Instagram Connected</div>
                      <Badge variant={adminData.instagram ? "default" : "secondary"}>
                        {adminData.instagram ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Points & Rewards */}
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Gift className="w-4 h-4 mr-2 text-blue-600" />
                  Points & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Points</div>
                    <div className="font-semibold text-lg">{adminData.points}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Deducted Points</div>
                    <div className="font-semibold text-lg">{adminData.deductedPoints}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Referral Reward Points</div>
                    <div className="font-semibold text-lg">{adminData.referralRewardPoints}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">RM Service Status</div>
                    <Badge variant={adminData.rmService === "Active" ? "default" : "secondary"}>
                      {adminData.rmService}
                    </Badge>
                  </div>
                  {adminData.rewards && (
                    <>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Profile Completion Reward</div>
                        <div className="font-semibold">{adminData.rewards.completeProfile || 0} points</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Job Applications Reward</div>
                        <div className="font-semibold">{adminData.rewards.applyForJobs || 0} points</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Referral Reward</div>
                        <div className="font-semibold">{adminData.rewards.referFriend || 0} points</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Social Media Bonus</div>
                        <div className="font-semibold">{adminData.rewards.socialMediaBonus || 0} points</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Reward Points</div>
                        <div className="font-semibold text-lg">{adminData.rewards.totalPoints || 0} points</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applications & Saved Jobs */}
            {(adminData.applications?.totalApplications > 0 || (adminData.savedJobs && adminData.savedJobs.length > 0)) && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Bookmark className="w-4 h-4 mr-2 text-blue-600" />
                    Applications & Saved Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Applications</div>
                      <div className="font-semibold text-lg">{adminData.applications?.totalApplications || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Active Applications</div>
                      <div className="font-semibold text-lg">{adminData.applications?.activeApplications || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Awaiting Feedback</div>
                      <div className="font-semibold text-lg">{adminData.applications?.awaitingFeedback || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Saved Jobs</div>
                      <div className="font-semibold text-lg">{adminData.savedJobs?.length || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* All Documents */}
            {adminData.resumeAndDocs && adminData.resumeAndDocs.length > 0 && (
              <Card className="card-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    All Documents ({adminData.resumeAndDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {adminData.resumeAndDocs.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="font-medium">{doc}</span>
                        </div>
                        <a href={doc} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                        </a>
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

  // Employer view
  const company = {
    companyName: userData.companyName || "N/A",
    industry: userData.industry || "N/A",
    teamSize: userData.teamSize || "N/A",
    foundedYear: (userData.foundedYear?.toString?.() || "N/A"),
    about: userData.about || "N/A",
    location: {
      city: userData.city || "N/A",
      country: userData.country || "N/A",
      officeAddress: userData.officeAddress || "N/A",
    },
    website: userData.website || "N/A",
    verified: Boolean(userData.verificationStatus === 'verified'),
    logo: userData.companyLogo || "",
    specialties: userData.specialties || [],
    achievements: userData.achievements || [],
    workCulture: userData.workCulture || [],
    socialLinks: userData.socialLinks || {},
    activeJobsCount: userData.activeJobsCount || 0,
    totalJobsPosted: userData.totalJobsPosted || 0,
    memberSince: userData.memberSince ? new Date(userData.memberSince).toLocaleDateString() : "N/A",
  }
  return <CompanyProfileView company={company} />
}


