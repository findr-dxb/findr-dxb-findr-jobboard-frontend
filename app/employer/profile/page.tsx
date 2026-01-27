// "use client"

// import { useState, useEffect } from "react"
// import axios from "axios"
// import { Navbar } from "@/components/navbar"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   Building,
//   Upload,
//   Star,
//   Award,
//   Globe,
//   Users,
//   MapPin,
//   Phone,
//   Mail,
//   Trophy,
//   Linkedin,
//   Instagram,
//   MessageCircle,
//   User,
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { TOP_200_COMPANIES } from "@/lib/utils"
// import { FollowUs } from "@/components/follow-us"

// interface EmployerProfileData {
//   companyInfo: {
//     companyName: string
//     email: string
//     phone: string
//     website: string
//     industry: string
//     teamSize: string
//     foundedYear: string
//     about: string
//   }
//   contactPerson: {
//     name: string
//     email: string
//     phone: string
//   }
//   location: {
//     officeAddress: string
//     city: string
//     country: string
//   }
//   social: {
//     linkedin: string
//     instagram: string
//     twitter: string
//   }
//   logo: boolean
//   verified: boolean
//   llcCertificate?: File | null
// }

// /**
//  * API Integration for Employer Profile
//  * 
//  * This component integrates with two main APIs:
//  * 1. GET /api/v1/employer/details - Fetches employer profile data from database
//  * 2. PUT /api/v1/employer/update - Updates employer profile data in database
//  * 
//  * Features:
//  * - Automatic data loading on component mount
//  * - Real-time profile completion calculation
//  * - Error handling with user-friendly messages
//  * - Loading states for better UX
//  * - Token-based authentication
//  */

// // API Service Functions
// const API_BASE_URL = "https://findr-jobboard-backend-production.up.railway.app"

// const getAuthToken = () => {
//   // Try multiple possible token keys that might be used in the app
//   return localStorage.getItem("findr_token") || localStorage.getItem("authToken") || localStorage.getItem("token") || ""
// }

// const apiService = {
//   // Fetch employer profile details
//   getEmployerDetails: async () => {
//     try {
//       const token = getAuthToken()
//       console.log("Token being used for API call:", token ? `${token.substring(0, 20)}...` : "No token found")
      
//       const response = await axios.get(`${API_BASE_URL}/employer/details`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//       return response.data
//     } catch (error: any) {
//       console.error("Error fetching employer details:", error.response?.data || error.message)
//       throw error
//     }
//   },

//   // Update employer profile
//   updateEmployerProfile: async (profileData: any) => {
//     try {
//       const token = getAuthToken()
//       console.log("Token being used for update:", token ? `${token.substring(0, 20)}...` : "No token found")
      
//       const response = await axios.put(`${API_BASE_URL}/employer/update`, profileData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//       return response.data
//     } catch (error: any) {
//       console.error("Error updating employer profile:", error.response?.data || error.message)
//       throw error
//     }
//   },
// }

// export default function EmployerProfilePage() {
//   const [profileData, setProfileData] = useState<EmployerProfileData>({
//     companyInfo: {
//       companyName: "",
//       email: "",
//       phone: "",
//       website: "",
//       industry: "",
//       teamSize: "",
//       foundedYear: "",
//       about: "",
//     },
//     contactPerson: {
//       name: "",
//       email: "",
//       phone: "",
//     },
//     location: {
//       officeAddress: "",
//       city: "",
//       country: "",
//     },
//     social: {
//       linkedin: "",
//       instagram: "",
//       twitter: "",
//     },
//     logo: false,
//     verified: false,
//     llcCertificate: null,
//   })

//   const [profileCompletion, setProfileCompletion] = useState(0)
//   const [points, setPoints] = useState(0)
//   const [tier, setTier] = useState("Silver")
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const { toast } = useToast()

//   // Fetch employer data from API
//   useEffect(() => {
//     const fetchEmployerData = async () => {
//       try {
//         setLoading(true)
        
//         // Check if user is authenticated
//         const token = getAuthToken()
        
//         // Debug: Log available tokens in localStorage
//         console.log("=== Token Debug Info ===")
//         console.log("findr_token:", localStorage.getItem("findr_token") ? "Present" : "Not found")
//         console.log("authToken:", localStorage.getItem("authToken") ? "Present" : "Not found")
//         console.log("token:", localStorage.getItem("token") ? "Present" : "Not found")
//         console.log("Final token used:", token ? `${token.substring(0, 20)}...` : "No token")
//         console.log("======================")
        
//         if (!token) {
//           toast({
//             title: "Authentication Required",
//             description: "Please log in to view your profile.",
//             variant: "destructive",
//           })
//           setLoading(false)
//           return
//         }
        
//         const response = await apiService.getEmployerDetails()
        
//         if (response.success && response.data) {
//           const data = response.data
          
//           // Map API response to frontend state structure
//           setProfileData({
//             companyInfo: {
//               companyName: data.companyName || "",
//               email: data.companyEmail || data.email || "",
//               phone: data.phoneNumber || "",
//               website: data.website || "",
//               industry: data.industry || "",
//               teamSize: data.teamSize || "",
//               foundedYear: data.foundedYear ? data.foundedYear.toString() : "",
//               about: data.aboutCompany || "",
//             },
//             contactPerson: {
//               name: data.contactPerson?.name || "",
//               email: data.contactPerson?.email || "",
//               phone: data.contactPerson?.phone || "",
//             },
//             location: {
//               officeAddress: data.companyLocation || "",
//               city: data.city || "",
//               country: data.country || "",
//             },
//             social: {
//               linkedin: data.socialLinks?.linkedin || "",
//               instagram: data.socialLinks?.facebook || "", // Using facebook for instagram as per API
//               twitter: data.socialLinks?.twitter || "",
//             },
//             logo: data.companyLogo ? true : false,
//             verified: data.verificationStatus === "verified",
//             llcCertificate: null,
//           })
          
//           // Set points and profile completion from API if available
//           if (data.points !== undefined) {
//             setPoints(data.points)
//           }
//           if (data.profileCompleted !== undefined) {
//             setProfileCompletion(data.profileCompleted)
//           }
//         }
//       } catch (error: any) {
//         console.error("Failed to fetch employer data:", error)
        
//         // Provide more specific error messages
//         let errorMessage = "Failed to load profile data."
//         if (error.response?.status === 401) {
//           errorMessage = "Authentication failed. Please log in again."
//         } else if (error.response?.data?.message) {
//           errorMessage = error.response.data.message
//         } else if (error.message) {
//           errorMessage = error.message
//         }
        
//         toast({
//           title: "Error",
//           description: errorMessage,
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchEmployerData()
//   }, [toast])

//   // Calculate profile completion and points
//   useEffect(() => {
//     const calculateCompletion = () => {
//       let completed = 0
//       const totalFields = 17

//       // Company Info (8 fields)
//       if (profileData.companyInfo.companyName) completed++
//       if (profileData.companyInfo.email) completed++
//       if (profileData.companyInfo.phone) completed++
//       if (profileData.companyInfo.website) completed++
//       if (profileData.companyInfo.industry) completed++
//       if (profileData.companyInfo.teamSize) completed++
//       if (profileData.companyInfo.foundedYear) completed++
//       if (profileData.companyInfo.about) completed++

//       // Contact Person (3 fields)
//       if (profileData.contactPerson.name) completed++
//       if (profileData.contactPerson.email) completed++
//       if (profileData.contactPerson.phone) completed++

//       // Location (3 fields)
//       if (profileData.location.officeAddress) completed++
//       if (profileData.location.city) completed++
//       if (profileData.location.country) completed++

//       // Social (2 fields)
//       if (profileData.social.linkedin) completed++
//       if (profileData.social.instagram) completed++

//       // Logo
//       if (profileData.logo) completed++

//       const percentage = Math.round((completed / totalFields) * 100)
//       setProfileCompletion(percentage)

//       // Calculate points based on completion
//       const newPoints = 80 + percentage * 2.5 // Base 80 + 2.5 points per percentage
//       setPoints(Math.round(newPoints))

//       // Determine tier
//       if (newPoints >= 300) setTier("Platinum")
//       else if (newPoints >= 200) setTier("Gold")
//       else setTier("Silver")
//     }

//     calculateCompletion()
//   }, [profileData])

//   // Company verification logic
//   useEffect(() => {
//     // Auto-verify if company name matches top 200
//     const isTopCompany = TOP_200_COMPANIES.some(
//       (name) => name.toLowerCase() === profileData.companyInfo.companyName.trim().toLowerCase()
//     )
//     if (isTopCompany) {
//       setProfileData((prev) => ({ ...prev, verified: true }))
//     } else if (profileData.llcCertificate) {
//       setProfileData((prev) => ({ ...prev, verified: true }))
//     } else {
//       setProfileData((prev) => ({ ...prev, verified: false }))
//     }
//   }, [profileData.companyInfo.companyName, profileData.llcCertificate])

//   const handleInputChange = (section: keyof EmployerProfileData, field: string, value: string | boolean) => {
//     setProfileData((prev) => ({
//       ...prev,
//       [section]: {
//         ...(prev[section] as Record<string, any>),
//         [field]: value,
//       },
//     }))
//   }

//   const handleSave = async () => {
//     try {
//       setSaving(true)
      
//       // Prepare data for API in the format expected by backend
//       const updateData = {
//         // Company Information
//         companyName: profileData.companyInfo.companyName,
//         companyEmail: profileData.companyInfo.email,
//         phoneNumber: profileData.companyInfo.phone,
//         website: profileData.companyInfo.website,
//         industry: profileData.companyInfo.industry,
//         teamSize: profileData.companyInfo.teamSize,
//         foundedYear: profileData.companyInfo.foundedYear ? parseInt(profileData.companyInfo.foundedYear) : 0,
//         aboutCompany: profileData.companyInfo.about,
        
//         // Contact Person
//         contactPerson: {
//           name: profileData.contactPerson.name,
//           email: profileData.contactPerson.email,
//           phone: profileData.contactPerson.phone,
//         },
        
//         // Location
//         companyLocation: profileData.location.officeAddress,
//         city: profileData.location.city,
//         country: profileData.location.country,
        
//         // Social Links
//         socialLinks: {
//           linkedin: profileData.social.linkedin,
//           twitter: profileData.social.twitter,
//           facebook: profileData.social.instagram, // Map instagram to facebook as per API
//         },
        
//         // Profile completion and points (will be calculated by backend)
//         profileCompleted: profileCompletion,
//         points: points,
//       }

//       const response = await apiService.updateEmployerProfile(updateData)
      
//       if (response.success) {
//         toast({
//           title: "Profile Updated!",
//           description: `Profile saved successfully. Points: ${points}`,
//         })
        
//         // Update local state with any data returned from backend
//         if (response.data) {
//           const data = response.data
//           if (data.points !== undefined) {
//             setPoints(data.points)
//           }
//           if (data.profileCompleted !== undefined) {
//             setProfileCompletion(data.profileCompleted)
//           }
//         }
//       } else {
//         throw new Error(response.message || "Failed to update profile")
//       }
//     } catch (error: any) {
//       console.error("Error saving profile:", error)
//       toast({
//         title: "Error",
//         description: error.response?.data?.message || error.message || "Failed to save profile. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setSaving(false)
//     }
//   }

//   const getTierColor = (tier: string) => {
//     switch (tier) {
//       case "Platinum":
//         return "bg-purple-100 text-purple-800 border-purple-200"
//       case "Gold":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200"
//     }
//   }

//   const getTierIcon = (tier: string) => {
//     switch (tier) {
//       case "Platinum":
//         return <Trophy className="w-4 h-4" />
//       case "Gold":
//         return <Award className="w-4 h-4" />
//       default:
//         return <Star className="w-4 h-4" />
//     }
//   }

//   // LLC Certificate upload handler
//   const handleLLCCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null
//     setProfileData((prev) => ({ ...prev, llcCertificate: file }))
//   }

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Navbar />
//         <main className="p-4 lg:p-6">
//           <div className="max-w-4xl mx-auto space-y-6">
//             <div className="flex justify-center items-center min-h-[400px]">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
//                 <p className="text-emerald-600 font-medium">Loading profile data...</p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Navbar />

//       <main className="p-4 lg:p-6">
//         <div className="max-w-4xl mx-auto space-y-6">
//           {/* Profile Header */}
//           <Card className="card-shadow border-0 bg-gradient-to-r from-emerald-50 to-emerald-100">
//             <CardContent className="p-6">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//                 <div className="flex items-center space-x-4 mb-4 lg:mb-0">
//                   <div className="relative">
//                     <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center card-shadow">
//                       <Building className="w-10 h-10 text-emerald-600" />
//                     </div>
//                     <Button size="sm" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-bg p-0">
//                       <Upload className="w-3 h-3" />
//                     </Button>
//                   </div>
//                   <div>
//                     <div className="flex items-center space-x-2 mb-1">
//                       <h1 className="text-2xl font-bold text-emerald-900">{profileData.companyInfo.companyName}</h1>
//                       {profileData.verified ? (
//                         <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✓ Verified</Badge>
//                       ) : (
//                         <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">⚠️ Unverified</Badge>
//                       )}
//                     </div>
//                     <p className="text-emerald-700">{profileData.companyInfo.email}</p>
//                     <div className="flex items-center space-x-3 mt-2">
//                       <Badge className={`${getTierColor(tier)} border text-xs`}>
//                         {getTierIcon(tier)}
//                         <span className="ml-1">{tier} Partner</span>
//                       </Badge>
//                       <div className="flex items-center space-x-1">
//                         <Star className="w-3 h-3 text-yellow-500" />
//                         <span className="font-semibold text-emerald-800 text-sm">{points} Points</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-center lg:text-right">
//                   <div className="text-2xl font-bold text-emerald-900 mb-1">{profileCompletion}%</div>
//                   <div className="text-emerald-700 mb-3 text-sm">Profile Complete</div>
//                   <Progress value={profileCompletion} className="w-40 h-2" />
//                   <p className="text-xs text-emerald-600 mt-2">
//                     {profileCompletion < 100
//                       ? `${100 - profileCompletion}% to maximize visibility`
//                       : "Maximum visibility achieved!"}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Company Information */}
//           <Card className="card-shadow border-0">
//             <CardHeader>
//               <CardTitle className="flex items-center text-lg">
//                 <Building className="w-4 h-4 mr-2 text-emerald-600" />
//                 Company Information
//               </CardTitle>
//               <CardDescription>Essential details about your company</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="companyName">Company Name *</Label>
//                   <Input
//                     id="companyName"
//                     value={profileData.companyInfo.companyName}
//                     onChange={(e) => handleInputChange("companyInfo", "companyName", e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Company Email *</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="email"
//                       value={profileData.companyInfo.email}
//                       onChange={(e) => handleInputChange("companyInfo", "email", e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone Number *</Label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="phone"
//                       value={profileData.companyInfo.phone}
//                       onChange={(e) => handleInputChange("companyInfo", "phone", e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="website">Website</Label>
//                   <div className="relative">
//                     <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="website"
//                       value={profileData.companyInfo.website}
//                       onChange={(e) => handleInputChange("companyInfo", "website", e.target.value)}
//                       placeholder="https://yourcompany.com"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="industry">Industry</Label>
//                   <Select
//                     value={profileData.companyInfo.industry}
//                     onValueChange={(value) => handleInputChange("companyInfo", "industry", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select industry" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="technology">Technology</SelectItem>
//                       <SelectItem value="finance">Finance</SelectItem>
//                       <SelectItem value="healthcare">Healthcare</SelectItem>
//                       <SelectItem value="education">Education</SelectItem>
//                       <SelectItem value="retail">Retail</SelectItem>
//                       <SelectItem value="construction">Construction</SelectItem>
//                       <SelectItem value="hospitality">Hospitality</SelectItem>
//                       <SelectItem value="manufacturing">Manufacturing</SelectItem>
//                       <SelectItem value="consulting">Consulting</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="teamSize">Team Size</Label>
//                   <Select
//                     value={profileData.companyInfo.teamSize}
//                     onValueChange={(value) => handleInputChange("companyInfo", "teamSize", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select team size" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="1-10">1-10 employees</SelectItem>
//                       <SelectItem value="11-50">11-50 employees</SelectItem>
//                       <SelectItem value="51-200">51-200 employees</SelectItem>
//                       <SelectItem value="201-500">201-500 employees</SelectItem>
//                       <SelectItem value="501-1000">501-1000 employees</SelectItem>
//                       <SelectItem value="1000+">1000+ employees</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="foundedYear">Founded Year</Label>
//                   <Input
//                     id="foundedYear"
//                     value={profileData.companyInfo.foundedYear}
//                     onChange={(e) => handleInputChange("companyInfo", "foundedYear", e.target.value)}
//                     placeholder="e.g., 2015"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="about">About Company</Label>
//                 <Textarea
//                   id="about"
//                   value={profileData.companyInfo.about}
//                   onChange={(e) => handleInputChange("companyInfo", "about", e.target.value)}
//                   placeholder="Describe your company, mission, values, and what makes you unique"
//                   rows={4}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Contact Person Details */}
//           <Card className="card-shadow border-0">
//             <CardHeader>
//               <CardTitle className="flex items-center text-lg">
//                 <User className="w-4 h-4 mr-2 text-emerald-600" />
//                 Contact Person Details
//               </CardTitle>
//               <CardDescription>Details of the primary contact person</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="contactName">Contact Person Name *</Label>
//                   <Input
//                     id="contactName"
//                     value={profileData.contactPerson.name}
//                     onChange={(e) => handleInputChange("contactPerson", "name", e.target.value)}
//                     placeholder="e.g., Anjali Kapoor"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="contactEmail">Contact Email *</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="contactEmail"
//                       type="email"
//                       value={profileData.contactPerson.email}
//                       onChange={(e) => handleInputChange("contactPerson", "email", e.target.value)}
//                       placeholder="e.g., anjali.kapoor@company.ae"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="contactPhone">Contact Phone *</Label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="contactPhone"
//                       type="tel"
//                       value={profileData.contactPerson.phone}
//                       onChange={(e) => handleInputChange("contactPerson", "phone", e.target.value)}
//                       placeholder="e.g., +971 55 123 4567"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* LLC Certificate Upload (if not verified) */}
//           {!profileData.verified && (
//             <Card className="card-shadow border-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Upload className="w-4 h-4 mr-2 text-emerald-600" />
//                   Upload LLC Certificate
//                 </CardTitle>
//                 <CardDescription>Required for verification (PDF, JPG, PNG)</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={handleLLCCertificateUpload}
//                   className="mb-2"
//                 />
//                 {profileData.llcCertificate && (
//                   <div className="mt-2 text-green-700 text-sm">
//                     Selected: {profileData.llcCertificate.name}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {/* Location & Social */}
//           <div className="grid lg:grid-cols-2 gap-4">
//             <Card className="card-shadow border-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
//                   Office Location
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="officeAddress">Office Address</Label>
//                   <Textarea
//                     id="officeAddress"
//                     value={profileData.location.officeAddress}
//                     onChange={(e) => handleInputChange("location", "officeAddress", e.target.value)}
//                     placeholder="Full office address"
//                     rows={3}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-2">
//                     <Label htmlFor="city">City</Label>
//                     <Input
//                       id="city"
//                       value={profileData.location.city}
//                       onChange={(e) => handleInputChange("location", "city", e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="country">Country</Label>
//                     <Input
//                       id="country"
//                       value={profileData.location.country}
//                       onChange={(e) => handleInputChange("location", "country", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="card-shadow border-0">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-lg">
//                   <Users className="w-4 h-4 mr-2 text-emerald-600" />
//                   Social Media
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="linkedin">LinkedIn</Label>
//                   <div className="relative">
//                     <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="linkedin"
//                       value={profileData.social.linkedin}
//                       onChange={(e) => handleInputChange("social", "linkedin", e.target.value)}
//                       placeholder="LinkedIn company page URL"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="instagram">Instagram</Label>
//                   <div className="relative">
//                     <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="instagram"
//                       value={profileData.social.instagram}
//                       onChange={(e) => handleInputChange("social", "instagram", e.target.value)}
//                       placeholder="Instagram profile URL"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="twitter">Twitter</Label>
//                   <div className="relative">
//                     <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="twitter"
//                       value={profileData.social.twitter}
//                       onChange={(e) => handleInputChange("social", "twitter", e.target.value)}
//                       placeholder="Twitter profile URL"
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Company Logo Upload */}
//           <Card className="card-shadow border-0">
//             <CardHeader>
//               <CardTitle className="flex items-center text-lg">
//                 <Building className="w-4 h-4 mr-2 text-emerald-600" />
//                 Company Logo
//               </CardTitle>
//               <CardDescription>Upload your company logo to enhance your profile</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
//                 <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
//                 <h3 className="font-semibold mb-2">Upload Company Logo</h3>
//                 <p className="text-gray-600 mb-4 text-sm">Drag and drop your logo here, or click to browse</p>
//                 <Button className="gradient-bg text-white" onClick={() => handleInputChange("logo", "", true)}>
//                   Choose File
//                 </Button>
//                 {profileData.logo && (
//                   <div className="mt-3 p-3 bg-green-50 rounded-lg">
//                     <p className="text-green-800 font-medium text-sm">✓ Logo uploaded successfully</p>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Follow Us Section */}
//           <FollowUs 
//             onPointsEarned={(platform, earnedPoints) => {
//               setPoints(prev => prev + earnedPoints)
//               toast({
//                 title: "Profile Updated!",
//                 description: `Earned ${earnedPoints} points for following us on ${platform}! Total points: ${points + earnedPoints}`,
//               })
//             }}
//           />

//           {/* Save Button */}
//           <div className="flex justify-center">
//             <Button 
//               onClick={handleSave} 
//               disabled={saving || loading}
//               className="gradient-bg text-white px-8 py-2"
//             >
//               {saving ? "Saving..." : "Save Profile"}
//             </Button>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building,
  Upload,
  Star,
  Award,
  Globe,
  Users,
  MapPin,
  Phone,
  Mail,
  Trophy,
  Linkedin,
  Instagram,
  MessageCircle,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TOP_200_COMPANIES, normalizeUAE } from "@/lib/utils"
import { FollowUs } from "@/components/follow-us"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface EmployerProfileData {
  companyInfo: {
    companyName: string
    email: string
    phone: string
    website: string
    industry: string
    teamSize: string
    foundedYear: string
    about: string
  }
  contactPerson: {
    name: string
    email: string
    phone: string
  }
  location: {
    officeAddress: string
    city: string
    country: string
  }
  social: {
    linkedin: string
    instagram: string
    twitter: string
  }
  companyLogo: string // URL from Cloudinary
  businessLicense: string // LLC Certificate URL from Cloudinary
  verified: boolean
}

const API_BASE_URL = "https://findr-jobboard-backend-production.up.railway.app/api/v1"

const getAuthToken = () => {
  return localStorage.getItem("findr_token") || localStorage.getItem("authToken") || localStorage.getItem("token") || ""
}

const apiService = {
  getEmployerDetails: async () => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No authentication token found")
      
      const response = await axios.get(`${API_BASE_URL}/employer/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch employer details")
    }
  },

  updateEmployerProfile: async (profileData: any) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No authentication token found")
      
      const response = await axios.put(`${API_BASE_URL}/employer/update`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update employer profile")
    }
  },

  uploadLLCCertificate: async (file: File) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error("No authentication token found")
      
      const formData = new FormData()
      formData.append("llcCertificate", file)
      
      const response = await axios.post(`${API_BASE_URL}/employer/upload-certificate`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to upload LLC certificate")
    }
  },
}

export default function EmployerProfilePage() {
  const router = useRouter()
  const { refreshAuth } = useAuth()
  const [profileData, setProfileData] = useState<EmployerProfileData>({
    companyInfo: {
      companyName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      teamSize: "",
      foundedYear: "",
      about: "",
    },
    contactPerson: {
      name: "",
      email: "",
      phone: "",
    },
    location: {
      officeAddress: "",
      city: "",
      country: "",
    },
    social: {
      linkedin: "",
      instagram: "",
      twitter: "",
    },
    companyLogo: "",
    businessLicense: "",
    verified: false,
  })

  const [profileCompletion, setProfileCompletion] = useState(0)
  const [points, setPoints] = useState(0)
  const [tier, setTier] = useState("Blue")  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        setLoading(true)
        const token = getAuthToken()
        
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your profile.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const response = await apiService.getEmployerDetails()
        
        if (response.success && response.data) {
          const data = response.data
          setProfileData({
            companyInfo: {
              companyName: data.companyName || "",
              email: data.companyEmail || data.email || "",
              phone: data.phoneNumber || "",
              website: data.website || "",
              industry: data.industry || "",
              teamSize: data.teamSize || "",
              foundedYear: data.foundedYear ? data.foundedYear.toString() : "",
              about: data.aboutCompany || "",
            },
            contactPerson: {
              name: data.contactPerson?.name || "",
              email: data.contactPerson?.email || "",
              phone: data.contactPerson?.phone || "",
            },
            location: {
              officeAddress: data.companyLocation || "",
              city: data.city || "",
              country: data.country || "",
            },
            social: {
              linkedin: data.socialLinks?.linkedin || "",
              instagram: data.socialLinks?.facebook || "",
              twitter: data.socialLinks?.twitter || "",
            },
            companyLogo: data.companyLogo || "",
            businessLicense: data.documents?.businessLicense || "",
            verified: data.verificationStatus === "verified",
          })
          setPoints(data.points || 0)
          setProfileCompletion(data.profileCompleted || 0)
          // Tier will be calculated in the useEffect below based on points and team size
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        if (error.message.includes("Unauthorized") || error.message.includes("Authentication")) {
          router.push("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEmployerData()
  }, [toast, router])

  useEffect(() => {
    const calculateCompletion = () => {
      let completed = 0
      const totalFields = 17

      if (profileData.companyInfo.companyName) completed++
      if (profileData.companyInfo.email) completed++
      if (profileData.companyInfo.phone) completed++
      if (profileData.companyInfo.website) completed++
      if (profileData.companyInfo.industry) completed++
      if (profileData.companyInfo.teamSize) completed++
      if (profileData.companyInfo.foundedYear) completed++
      if (profileData.companyInfo.about) completed++

      if (profileData.contactPerson.name) completed++
      if (profileData.contactPerson.email) completed++
      if (profileData.contactPerson.phone) completed++

      if (profileData.location.officeAddress) completed++
      if (profileData.location.city) completed++
      if (profileData.location.country) completed++

      if (profileData.social.linkedin) completed++
      if (profileData.social.instagram) completed++

      if (profileData.companyLogo) completed++

      const percentage = Math.round((completed / totalFields) * 100)
      setProfileCompletion(percentage)
      const newPoints = 80 + percentage * 2.5
      setPoints(Math.round(newPoints))
      
      // Determine tier based on team size (points only for Platinum)
      const determineTier = () => {
        const teamSize = profileData.companyInfo.teamSize || "0-10";
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
        
        const companyName = profileData.companyInfo.companyName || "";
        
        // Check if company is in TOP_200_COMPANIES
        const isTopCompany = TOP_200_COMPANIES.some(
          (company) => company.toLowerCase() === companyName.toLowerCase()
        );
        
        // Platinum tier: requires 500+ points
        if (newPoints >= 500) return "Platinum";
        
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
      
      setTier(determineTier())
    }

    calculateCompletion()
  }, [profileData])

  useEffect(() => {
    const isTopCompany = TOP_200_COMPANIES.some(
      (name) => name.toLowerCase() === profileData.companyInfo.companyName.trim().toLowerCase()
    )
    setProfileData((prev) => ({
      ...prev,
      verified: isTopCompany || !!prev.businessLicense,
    }))
  }, [profileData.companyInfo.companyName, profileData.businessLicense])

  const handleInputChange = (section: keyof EmployerProfileData, field: string, value: string | boolean) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }))
  }

  const handleCompanyLogoUpload = async (fileData: any) => {
    try {
      const logoUrl = fileData.secure_url || fileData.url;
      setProfileData(prev => ({ ...prev, companyLogo: logoUrl }));
      
      // Auto-save to database
      const token = getAuthToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/employer/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyLogo: logoUrl
          }),
        });
        
        if (response.ok) {
          // Refresh auth context to update navbar
          refreshAuth();
          toast({
            title: "Company Logo Uploaded",
            description: "Your company logo has been saved successfully.",
          });
        } else {
          throw new Error('Failed to save company logo');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload company logo",
        variant: "destructive",
      })
    }
  }

  const handleLLCCertificateUpload = async (fileData: any) => {
    try {
      const certificateUrl = fileData.secure_url || fileData.url;
      setProfileData(prev => ({ ...prev, businessLicense: certificateUrl }));
      
      // Auto-save to database
      const token = getAuthToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/employer/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documents: {
              businessLicense: certificateUrl
            }
          }),
        });
        
        if (response.ok) {
          toast({
            title: "LLC Certificate Uploaded",
            description: "Your LLC certificate has been saved successfully.",
          });
        } else {
          throw new Error('Failed to save LLC certificate');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload LLC certificate",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      // Phone number validation - UAE phone numbers only
      const phone = profileData.companyInfo.phone?.trim() || '';
      if (phone) {
        const normalizedPhone = normalizeUAE(phone);
        
        if (!normalizedPhone) {
          toast({
            title: "Invalid phone number",
            description: "Please enter a valid UAE mobile number. Formats: +971 50 123 4567 or 050 123 4567",
            variant: "destructive",
          });
          return;
        }
        
        // Update the phone number with normalized value
        profileData.companyInfo.phone = normalizedPhone;
      }

      setSaving(true)
      const updateData = {
        companyName: profileData.companyInfo.companyName,
        companyEmail: profileData.companyInfo.email,
        phoneNumber: profileData.companyInfo.phone,
        website: profileData.companyInfo.website,
        industry: profileData.companyInfo.industry,
        teamSize: profileData.companyInfo.teamSize,
        foundedYear: profileData.companyInfo.foundedYear ? parseInt(profileData.companyInfo.foundedYear) : 0,
        aboutCompany: profileData.companyInfo.about,
        contactPerson: {
          name: profileData.contactPerson.name,
          email: profileData.contactPerson.email,
          phone: profileData.contactPerson.phone,
        },
        companyLocation: profileData.location.officeAddress,
        city: profileData.location.city,
        country: profileData.location.country,
        socialLinks: {
          linkedin: profileData.social.linkedin,
          twitter: profileData.social.twitter,
          facebook: profileData.social.instagram,
        },
        profileCompleted: profileCompletion,
        points,
        membershipTier: tier,
      }

      const response = await apiService.updateEmployerProfile(updateData)
      toast({
        title: "Profile Updated!",
        description: `Profile saved successfully. Points: ${points}`,
      })
      if (response.data) {
        setPoints(response.data.points || points)
        setProfileCompletion(response.data.profileCompleted || profileCompletion)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return <Trophy className="w-4 h-4" />
      case "Gold":
        return <Award className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-emerald-600 font-medium">Loading profile data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="card-shadow border-0 bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center card-shadow">
                      {profileData.companyLogo ? (
                        <img 
                          src={profileData.companyLogo} 
                          alt="Company Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-10 h-10 text-emerald-600" />
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-bg p-0"
                      onClick={() => {
                        const logoSection = document.querySelector('[data-section="company-logo"]');
                        logoSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold text-emerald-900">{profileData.companyInfo.companyName}</h1>
                      {profileData.verified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✓ Verified</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">⚠️ Unverified</Badge>
                      )}
                    </div>
                    <p className="text-emerald-700">{profileData.companyInfo.email}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={`${getTierColor(tier)} border text-xs`}>
                        {getTierIcon(tier)}
                        <span className="ml-1">{tier} Partner</span>
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-semibold text-emerald-800 text-sm">{points} Points</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-2xl font-bold text-emerald-900 mb-1">{profileCompletion}%</div>
                  <div className="text-emerald-700 mb-3 text-sm">Profile Complete</div>
                  <Progress value={profileCompletion} className="w-40 h-2" />
                  <p className="text-xs text-emerald-600 mt-2">
                    {profileCompletion < 100
                      ? `${100 - profileCompletion}% to maximize visibility`
                      : "Maximum visibility achieved!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-4 h-4 mr-2 text-emerald-600" />
                Company Information
              </CardTitle>
              <CardDescription>Essential details about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={profileData.companyInfo.companyName}
                    onChange={(e) => handleInputChange("companyInfo", "companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      value={profileData.companyInfo.email}
                      onChange={(e) => handleInputChange("companyInfo", "email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.companyInfo.phone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9+\s-]/g, '');
                        // Limit to 15 characters max (accounts for +971 50 123 4567 format)
                        if (value.length > 15) value = value.slice(0, 15);
                        handleInputChange("companyInfo", "phone", value);
                      }}
                      placeholder="+971 50 123 4567 or 050 123 4567"
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    UAE mobile numbers only. Formats: +971 50 123 4567 or 050 123 4567
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="website"
                      value={profileData.companyInfo.website}
                      onChange={(e) => handleInputChange("companyInfo", "website", e.target.value)}
                      placeholder="https://yourcompany.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profileData.companyInfo.industry}
                    onValueChange={(value) => handleInputChange("companyInfo", "industry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Select
                    value={profileData.companyInfo.teamSize}
                    onValueChange={(value) => handleInputChange("companyInfo", "teamSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    value={profileData.companyInfo.foundedYear}
                    onChange={(e) => handleInputChange("companyInfo", "foundedYear", e.target.value)}
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Company</Label>
                <Textarea
                  id="about"
                  value={profileData.companyInfo.about}
                  onChange={(e) => handleInputChange("companyInfo", "about", e.target.value)}
                  placeholder="Describe your company, mission, values, and what makes you unique"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-4 h-4 mr-2 text-emerald-600" />
                Contact Person Details
              </CardTitle>
              <CardDescription>Details of the primary contact person</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    value={profileData.contactPerson.name}
                    onChange={(e) => handleInputChange("contactPerson", "name", e.target.value)}
                    placeholder="e.g., Anjali Kapoor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={profileData.contactPerson.email}
                      onChange={(e) => handleInputChange("contactPerson", "email", e.target.value)}
                      placeholder="e.g., anjali.kapoor@company.ae"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={profileData.contactPerson.phone}
                      onChange={(e) => {
                        // Allow only + and numbers
                        const value = e.target.value.replace(/[^+0-9]/g, '')
                        handleInputChange("contactPerson", "phone", value)
                      }}
                      onKeyDown={(e) => {
                        // Prevent typing if it's not a number, +, or allowed keys (backspace, delete, arrow keys, etc.)
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End']
                        const isNumber = e.key >= '0' && e.key <= '9'
                        const isPlus = e.key === '+'
                        const isAllowedKey = allowedKeys.includes(e.key)
                        const isCtrlCmd = e.ctrlKey || e.metaKey
                        
                        // Allow Ctrl/Cmd + A, C, V, X for select all, copy, paste, cut
                        if (isCtrlCmd && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                          return
                        }
                        
                        // Block if it's not a number, plus, or allowed key
                        if (!isNumber && !isPlus && !isAllowedKey) {
                          e.preventDefault()
                        }
                      }}
                      onPaste={(e) => {
                        // Clean pasted content to only allow + and numbers
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData('text')
                        const cleanedText = pastedText.replace(/[^+0-9]/g, '')
                        handleInputChange("contactPerson", "phone", cleanedText)
                      }}
                      placeholder="e.g., +971 55 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {!profileData.verified && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Upload className="w-4 h-4 mr-2 text-emerald-600" />
                  Upload LLC Certificate
                </CardTitle>
                <CardDescription>Required for verification (PDF, JPG, PNG)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Certificate Display */}
                  {profileData.businessLicense && (
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Upload className="w-8 h-8 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">LLC Certificate Uploaded</p>
                            <p className="text-sm text-green-700">Certificate verified and saved</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(profileData.businessLicense, '_blank')}
                            className="h-8 px-3"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Certificate Upload */}
                  <FileUpload
                    onUploadSuccess={handleLLCCertificateUpload}
                    onUploadError={(error) => {
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    allowedTypes={['document']}
                    maxSize={10}
                    multiple={false}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                  Office Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea
                    id="officeAddress"
                    value={profileData.location.officeAddress}
                    onChange={(e) => handleInputChange("location", "officeAddress", e.target.value)}
                    placeholder="Full office address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.location.city}
                      onChange={(e) => handleInputChange("location", "city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.location.country}
                      onChange={(e) => handleInputChange("location", "country", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-4 h-4 mr-2 text-emerald-600" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="linkedin"
                      value={profileData.social.linkedin}
                      onChange={(e) => handleInputChange("social", "linkedin", e.target.value)}
                      placeholder="LinkedIn company page URL"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="instagram"
                      value={profileData.social.instagram}
                      onChange={(e) => handleInputChange("social", "instagram", e.target.value)}
                      placeholder="Instagram profile URL"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="twitter"
                      value={profileData.social.twitter}
                      onChange={(e) => handleInputChange("social", "twitter", e.target.value)}
                      placeholder="Twitter profile URL"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="card-shadow border-0" data-section="company-logo">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-4 h-4 mr-2 text-emerald-600" />
                Company Logo
              </CardTitle>
              <CardDescription>Upload your company logo to enhance your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Logo Display */}
                {profileData.companyLogo && (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center">
                          <img 
                            src={profileData.companyLogo} 
                            alt="Company Logo" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Company Logo Uploaded</p>
                          <p className="text-sm text-gray-500">Logo saved and displayed in profile</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(profileData.companyLogo, '_blank')}
                          className="h-8 px-3"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Upload */}
                <FileUpload
                  onUploadSuccess={handleCompanyLogoUpload}
                  onUploadError={(error) => {
                    toast({
                      title: "Upload Failed",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                  allowedTypes={['image']}
                  maxSize={5}
                  multiple={false}
                />
              </div>
            </CardContent>
          </Card>
          <FollowUs 
            onPointsEarned={(platform, earnedPoints) => {
              setPoints(prev => prev + earnedPoints)
              toast({
                title: "Profile Updated!",
                description: `Earned ${earnedPoints} points for following us on ${platform}! Total points: ${points + earnedPoints}`,
              })
            }}
          />
          <div className="flex justify-center">
            <Button 
              onClick={handleSave} 
              disabled={saving || loading}
              className="gradient-bg text-white px-8 py-2"
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}