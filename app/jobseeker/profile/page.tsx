"use client"

import { useState, useEffect, useRef } from "react"
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
  User,
  Upload,
  Star,
  Award,
  FileText,
  GraduationCap,
  Briefcase,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Trash2,
  Download,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/contexts/auth-context"
import { FollowUs } from "@/components/follow-us"
import { normalizeUAE } from "@/lib/utils"

const API_BASE_URL = "https://findr-jobboard-backend-production.up.railway.app"

interface ProfileData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    dateOfBirth: string
    nationality: string
    summary: string
    emiratesId: string
    passportNumber: string
    employmentVisa: string
    visaExpiryDate: string
  }
  experience: {
    currentRole: string
    company: string
    experience: string
    industry: string
  }
  education: {
    degree: string
    institution: string
    year: string
    grade: string
  }
  skills: string
  preferences: {
    jobType: string
    salaryExpectation: string
    preferredLocation: string
    availability: string
  }
  certifications: string
  resume: boolean
  resumeUrl: string
  profilePicture: string
  introVideo: string
  resumeDocument: string // Primary resume URL
  documents: Array<{
    id: string
    name: string
    url: string
    type: string
    size?: number
    uploadDate: string
  }>
  socialLinks: {
    linkedin: string
    instagram: string
    twitter: string
  }
  deductedPoints: number
  rewards?: {
    applyForJobs?: number
    rmService?: number
    totalPoints?: number
  }
}

export default function JobSeekerProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      dateOfBirth: "",
      nationality: "",
      summary: "",
      emiratesId: "",
      passportNumber: "",
      employmentVisa: "",
      visaExpiryDate: "",
    },
    experience: {
      currentRole: "",
      company: "",
      experience: "",
      industry: "",
    },
    education: {
      degree: "",
      institution: "",
      year: "",
      grade: "",
    },
    skills: "",
    preferences: {
      jobType: "",
      salaryExpectation: "",
      preferredLocation: "",
      availability: "",
    },
    certifications: "",
    resume: false,
    resumeUrl: "",
    profilePicture: "",
    introVideo: "",
    resumeDocument: "",
    documents: [],
    socialLinks: {
      linkedin: "",
      instagram: "",
      twitter: "",
    },
    deductedPoints: 0,
  })

  const [profileCompletion, setProfileCompletion] = useState(0)
  const [points, setPoints] = useState(0)
  const [emiratesIdError, setEmiratesIdError] = useState<string>("")

  // Helper function to modify Cloudinary URL to force download
  const getDownloadUrl = (url: string): string => {
    if (!url) return url;
    
    // Check if it's a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
      // Add fl_attachment flag to force download
      // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}
      // We need to insert fl_attachment after /upload/
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
        const afterUpload = url.substring(uploadIndex + 8);
        
        // Check if fl_attachment already exists
        if (!afterUpload.startsWith('fl_attachment')) {
          return `${beforeUpload}fl_attachment/${afterUpload}`;
        }
      }
    }
    
    return url;
  }
  const [tier, setTier] = useState("Blue")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { refreshAuth } = useAuth()

  const [recording, setRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // API Functions
  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/profile/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        const apiData = data.data;
        
        // Map API data to local state structure
        setProfileData(prevData => ({
          ...prevData,
          personalInfo: {
            ...prevData.personalInfo,
            fullName: apiData.fullName || apiData.name || "",
            email: apiData.email || "",
            phone: apiData.phoneNumber || "",
            location: apiData.location || "",
            dateOfBirth: apiData.dateOfBirth ? 
              new Date(apiData.dateOfBirth).toISOString().split('T')[0] : "",
            nationality: apiData.nationality || "",
            summary: apiData.professionalSummary || "",
            emiratesId: apiData.emirateId || "",
            passportNumber: apiData.passportNumber || "",
            employmentVisa: "", // Not provided by API, keep empty
            visaExpiryDate: apiData.visaExpiryDate ? 
              new Date(apiData.visaExpiryDate).toISOString().split('T')[0] : "",
          },
          experience: {
            currentRole: apiData.professionalExperience?.[0]?.currentRole || "",
            company: apiData.professionalExperience?.[0]?.company || "",
            experience: apiData.professionalExperience?.[0]?.yearsOfExperience ? 
              (apiData.professionalExperience[0].yearsOfExperience <= 1 ? "0-1" :
               apiData.professionalExperience[0].yearsOfExperience <= 3 ? "2-3" :
               apiData.professionalExperience[0].yearsOfExperience <= 6 ? "4-6" :
               apiData.professionalExperience[0].yearsOfExperience <= 10 ? "7-10" : "10+") : "",
            industry: apiData.professionalExperience?.[0]?.industry || "",
          },
          education: {
            degree: apiData.education?.[0]?.highestDegree || "",
            institution: apiData.education?.[0]?.institution || "",
            year: apiData.education?.[0]?.yearOfGraduation?.toString() || "",
            grade: apiData.education?.[0]?.gradeCgpa || "",
          },
          skills: apiData.skills?.join(", ") || "",
          preferences: {
            jobType: apiData.jobPreferences?.preferredJobType?.[0] || "",
            salaryExpectation: apiData.jobPreferences?.salaryExpectation || "",
            preferredLocation: apiData.jobPreferences?.preferredLocation || "",
            availability: apiData.jobPreferences?.availability || "",
          },
          certifications: apiData.certifications?.join(", ") || "",
          resumeDocument: apiData.resumeDocument || "",
          resume: !!(apiData.resumeDocument || apiData.jobPreferences?.resumeAndDocs?.length > 0),
          resumeUrl: "", // Keep empty for now, could be enhanced later
          profilePicture: apiData.profilePicture || "",
          introVideo: apiData.introVideo || "",
          documents: (apiData.jobPreferences?.resumeAndDocs || []).map((url: string, index: number) => {
            // Extract filename from URL if possible
            let filename = `Document ${index + 1}`;
            try {
              const urlParts = url.split('/');
              const lastPart = urlParts[urlParts.length - 1];
              if (lastPart && lastPart.includes('.')) {
                // Remove Cloudinary transformations and get the actual filename
                const cleanFilename = lastPart.split('?')[0]; // Remove query parameters
                if (cleanFilename.length > 0) {
                  filename = cleanFilename;
                }
              }
            } catch (error) {
              console.log('Could not extract filename from URL:', url);
            }
            
            return {
              id: `doc-${index}-${Date.now()}`,
              name: filename,
              url: url,
              type: 'document',
              uploadDate: new Date().toISOString(),
            };
          }),
          socialLinks: {
            linkedin: apiData.socialLinks?.linkedIn || "",
            instagram: apiData.socialLinks?.instagram || "",
            twitter: apiData.socialLinks?.twitterX || "",
          },
          deductedPoints: apiData.deductedPoints || 0,
        }))
        
        // Points will be calculated in the useEffect based on profile completion and deductedPoints
        
        if (apiData.membershipTier) {
          setTier(apiData.membershipTier)
        }
        
        // Use profileCompleted (percentage) instead of rewards.completeProfile (points)
        // Backend stores points in rewards.completeProfile but percentage in profileCompleted
        if (apiData.profileCompleted !== undefined) {
          const percentage = parseInt(apiData.profileCompleted) || 0
          // Ensure percentage is between 0-100, not points (250)
          if (percentage <= 100) {
            setProfileCompletion(percentage)
          } else {
            // If it's > 100, it's likely points, so let useEffect recalculate
            // The useEffect will calculate correctly from profileData
          }
        } else if (apiData.rewards?.completeProfile !== undefined) {
          // Fallback: check if it's actually a percentage (<= 100) or points (> 100)
          const value = apiData.rewards.completeProfile
          if (value <= 100) {
            setProfileCompletion(value)
          }
          // If > 100, ignore it and let useEffect recalculate
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast({
        title: "Error Loading Profile",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfileData = async () => {
    try {
      setIsSaving(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Validate Emirates ID if provided
      const emiratesId = profileData.personalInfo.emiratesId;
      if (emiratesId && emiratesId.length !== 15) {
        setEmiratesIdError("Emirates ID must be exactly 15 digits");
        toast({
          title: "Validation Error",
          description: "Emirates ID must be exactly 15 digits. Please correct it before saving.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Phone number validation - UAE phone numbers only
      const phone = profileData.personalInfo.phone?.trim() || '';
      if (phone) {
        const normalizedPhone = normalizeUAE(phone);
        
        if (!normalizedPhone) {
          toast({
            title: "Invalid phone number",
            description: "Please enter a valid UAE mobile number. Formats: +971 50 123 4567 or 050 123 4567",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        
        // Update the phone number with normalized value
        profileData.personalInfo.phone = normalizedPhone;
      }

      // Validate Visa Expiry Date for non-Emirati users
      const isEmirati = profileData.personalInfo.nationality?.toLowerCase().includes("emirati") || 
                        profileData.personalInfo.nationality?.toLowerCase().includes("uae");
      
      if (!isEmirati && profileData.personalInfo.nationality) {
        if (!profileData.personalInfo.visaExpiryDate || profileData.personalInfo.visaExpiryDate.trim() === "") {
          toast({
            title: "Validation Error",
            description: "Visa Expiry Date is required for non-Emirati users. Please enter your visa expiry date.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Map local state to API format (matching your backend controller)
      // Clear visaExpiryDate if nationality is Emirati/UAE
      const visaExpiryDate = isEmirati ? null : (profileData.personalInfo.visaExpiryDate || undefined);
      
      const apiData = {
        // Basic Information
        fullName: profileData.personalInfo.fullName,
        email: profileData.personalInfo.email,
        phoneNumber: profileData.personalInfo.phone,
        location: profileData.personalInfo.location,
        dateOfBirth: profileData.personalInfo.dateOfBirth,
        nationality: profileData.personalInfo.nationality,
        emirateId: profileData.personalInfo.emiratesId,
        passportNumber: profileData.personalInfo.passportNumber,
        professionalSummary: profileData.personalInfo.summary,
        visaExpiryDate: visaExpiryDate,
        
        // Professional Experience (convert to array format expected by backend)
        professionalExperience: [{
          currentRole: profileData.experience.currentRole,
          company: profileData.experience.company,
          yearsOfExperience: profileData.experience.experience === "0-1" ? 1 : 
                           profileData.experience.experience === "2-3" ? 3 :
                           profileData.experience.experience === "4-6" ? 6 :
                           profileData.experience.experience === "7-10" ? 10 :
                           profileData.experience.experience === "10+" ? 11 : 0,
          industry: profileData.experience.industry,
        }].filter(exp => exp.currentRole || exp.company), // Only send if has data
        
        // Education (convert to array format expected by backend)
        education: [{
          highestDegree: profileData.education.degree,
          institution: profileData.education.institution,
          yearOfGraduation: profileData.education.year ? parseInt(profileData.education.year) : undefined,
          gradeCgpa: profileData.education.grade,
        }].filter(edu => edu.highestDegree || edu.institution), // Only send if has data
        
        // Skills & Certifications (convert to arrays)
        skills: (typeof profileData.skills === 'string' && profileData.skills) ? 
                profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        certifications: (typeof profileData.certifications === 'string' && profileData.certifications) ? 
                       profileData.certifications.split(',').map(cert => cert.trim()).filter(Boolean) : [],
        
        // Job Preferences
        jobPreferences: {
          preferredJobType: profileData.preferences.jobType ? [profileData.preferences.jobType] : [],
          salaryExpectation: profileData.preferences.salaryExpectation,
          preferredLocation: profileData.preferences.preferredLocation,
          availability: profileData.preferences.availability,
          resumeAndDocs: profileData.documents.map(doc => doc.url),
        },
        
        // Social Links
        socialLinks: {
          linkedIn: profileData.socialLinks.linkedin,
          instagram: profileData.socialLinks.instagram,
          twitterX: profileData.socialLinks.twitter,
        },
        
        // Profile Picture
        profilePicture: profileData.profilePicture,
        
        // Intro Video
        introVideo: profileData.introVideo,
        
        // Resume Document
        resumeDocument: profileData.resumeDocument,
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (response.ok && data.message) {
        // Don't update profileCompletion from save response - it may contain points (250) instead of percentage (100)
        // The useEffect already calculates it correctly based on profileData, so we keep that value
        // Only update other fields if needed, but let the useEffect handle completion calculation
        
        toast({
          title: "Profile Updated Successfully!",
          description: data.message,
        })
      } else {
        throw new Error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile data:', error)
      toast({
        title: "Error Saving Profile",
        description: "Failed to save profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData()
  }, [])

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  }, [mediaStream]);

  // Calculate profile completion and points
  useEffect(() => {
    const calculateCompletion = () => {
      let completed = 0
      const totalFields = 24 // Updated: removed employmentVisa (not in form)

      // Personal Info (9 fields - employmentVisa is optional, not in form)
      if (profileData.personalInfo.fullName) completed++
      if (profileData.personalInfo.email) completed++
      if (profileData.personalInfo.phone) completed++
      if (profileData.personalInfo.location) completed++
      if (profileData.personalInfo.dateOfBirth) completed++
      if (profileData.personalInfo.nationality) completed++
      if (profileData.personalInfo.summary) completed++
      if (profileData.personalInfo.emiratesId) completed++
      if (profileData.personalInfo.passportNumber) completed++
      // employmentVisa removed from required fields as it's not in the form

      // Experience (4 fields)
      if (profileData.experience.currentRole) completed++
      if (profileData.experience.company) completed++
      if (profileData.experience.experience) completed++
      if (profileData.experience.industry) completed++

      // Education (4 fields)
      if (profileData.education.degree) completed++
      if (profileData.education.institution) completed++
      if (profileData.education.year) completed++
      if (profileData.education.grade) completed++

      // Skills, Preferences, Certifications, Resume (4 fields)
      if (profileData.skills) completed++
      if (profileData.preferences.jobType) completed++
      if (profileData.certifications) completed++
      // Check if resume exists (either resume boolean or resumeDocument URL)
      if (profileData.resume || profileData.resumeDocument) completed++

      // Social Links (3 fields)
      if (profileData.socialLinks.linkedin) completed++
      if (profileData.socialLinks.instagram) completed++
      if (profileData.socialLinks.twitter) completed++

      const percentage = Math.min(Math.round((completed / totalFields) * 100), 100)
      setProfileCompletion(percentage)

      // Helper functions for tier calculation
      const getExperienceLevel = (yearsExp: number): 'Blue' | 'Silver' | 'Gold' => {
        if (yearsExp <= 1) return 'Blue';
        else if (yearsExp >= 2 && yearsExp <= 5) return 'Silver';
        else return 'Gold'; // 5+ years
      };

      const getTierMultiplier = (tier: string, experienceLevel: 'Blue' | 'Silver' | 'Gold'): number => {
        const A = 1.0;
        if (tier === 'Platinum') {
          if (experienceLevel === 'Blue') return 2.0;
          else if (experienceLevel === 'Silver') return 3.0;
          else return 4.0;
        } else if (tier === 'Gold') return 2.0 * A;
        else if (tier === 'Silver') return 1.5 * A;
        else return 1.0 * A;
      };

      const determineUserTier = (basePoints: number, yearsExp: number, isEmirati: boolean) => {
        if (isEmirati) return "Platinum";
        else if (basePoints >= 500) return "Platinum";
        else if (yearsExp >= 5) return "Gold";
        else if (yearsExp >= 2 && yearsExp <= 5) return "Silver";
        else return "Blue";
      };

      // Calculate base points (before multiplier)
      const basePoints = 50 + percentage * 2;
      
      // Determine experience and tier
      let yearsExp = 0;
      const expStr = profileData.experience.experience;
      if (expStr === "0-1") yearsExp = 1;
      else if (expStr === "2-3") yearsExp = 3;
      else if (expStr === "4-6") yearsExp = 6;
      else if (expStr === "7-10") yearsExp = 10;
      else if (expStr === "10+") yearsExp = 11;
      
      const isEmirati = profileData.personalInfo.nationality?.toLowerCase().includes("emirati");
      const experienceLevel = getExperienceLevel(yearsExp);
      const tier = determineUserTier(basePoints, yearsExp, isEmirati);
      
      // Get tier multiplier and apply to base points
      const multiplier = getTierMultiplier(tier, experienceLevel);
      const multipliedBasePoints = basePoints * multiplier;
      
      // Add other points without multiplier
      const applicationPoints = profileData?.rewards?.applyForJobs || 0;
      const rmServicePoints = profileData?.rewards?.rmService || 0;
      const deductedPoints = profileData.deductedPoints || 0;
      
      const totalPoints = multipliedBasePoints + applicationPoints + rmServicePoints;
      const availablePoints = Math.max(0, totalPoints - deductedPoints);
      
      setPoints(availablePoints);
      setTier(tier);
    }

    calculateCompletion()
  }, [profileData])

  const handleInputChange = (section: keyof ProfileData, field: string, value: string | boolean) => {
    setProfileData((prev) => {
      // Handle direct properties (skills, certifications, resume)
      if (field === "" && (section === "skills" || section === "certifications" || section === "resume")) {
        return {
          ...prev,
          [section]: value,
        }
      }
      
      // Handle nested object properties
      return {
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, any>),
          [field]: value,
        },
      }
    })
  }

  const handleSave = async () => {
    await saveProfileData()
  }

  // Start camera and recording
  const handleStartRecording = async () => {
    setRecordedChunks([]);
    setVideoUrl("");
    setIsPreview(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingTime(0);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setIsPreview(true);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };
      recorder.start();
      // Timer for 90s max
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 89) {
            handleStopRecording();
            return 90;
          }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      setRecording(false);
      setMediaStream(null);
      setMediaRecorder(null);
      alert("Camera access denied or not available.");
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Re-record
  const handleReRecord = () => {
    setRecordedChunks([]);
    setVideoUrl("");
    setIsPreview(false);
    setRecordingTime(0);
  };

  // Upload video to Cloudinary and save to profile
  const handleSaveVideo = async () => {
    if (!videoUrl) {
      toast({
        title: "No Video",
        description: "Please record a video first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert video URL to blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const videoFile = new File([blob], `intro-video-${Date.now()}.webm`, {
        type: 'video/webm'
      });

      // Upload to Cloudinary using our upload API
      const formData = new FormData();
      formData.append('file', videoFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();
      const videoCloudinaryUrl = uploadData.data.secure_url || uploadData.data.url;

      // Update profile data with video URL
      setProfileData(prev => ({
        ...prev,
        introVideo: videoCloudinaryUrl
      }));

      // Auto-save to database
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (token) {
        const saveResponse = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            introVideo: videoCloudinaryUrl
          }),
        });

        if (saveResponse.ok) {
          toast({
            title: "Video Saved!",
            description: "Your introductory video has been saved to your profile.",
          });
          
          // Clean up the local video URL
          URL.revokeObjectURL(videoUrl);
          setVideoUrl("");
          setIsPreview(false);
        } else {
          throw new Error('Failed to save video to profile');
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center card-shadow">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-blue-600" />
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-bg p-0"
                      onClick={() => {
                        const photoSection = document.querySelector('[data-section="profile-photo"]');
                        photoSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-blue-900">{profileData.personalInfo.fullName}</h1>
                    <p className="text-blue-700">{profileData.personalInfo.email}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={`${getTierColor(tier)} border text-xs`}>
                        {getTierIcon(tier)}
                        <span className="ml-1">{tier} Member</span>
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-semibold text-blue-800 text-sm">{points} Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-right">
                  <div className="text-2xl font-bold text-blue-900 mb-1">{Math.min(profileCompletion, 100)}%</div>
                  <div className="text-blue-700 mb-3 text-sm">Profile Complete</div>
                  <Progress value={profileCompletion} className="w-40 h-2" />
                  <p className="text-xs text-blue-600 mt-2">
                    {profileCompletion < 100
                      ? `${100 - profileCompletion}% to unlock premium features`
                      : "All features unlocked!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic details about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading profile data...</div>
                </div>
              ) : (
                <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profileData.personalInfo.fullName}
                    onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      value={profileData.personalInfo.email}
                      onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
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
                      value={profileData.personalInfo.phone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9+\s-]/g, '');
                        // Limit to 15 characters max (accounts for +971 50 123 4567 format)
                        if (value.length > 15) value = value.slice(0, 15);
                        handleInputChange("personalInfo", "phone", value);
                      }}
                      className="pl-10"
                      placeholder="+971 50 123 4567 or 050 123 4567"
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    UAE mobile numbers only. Formats: +971 50 123 4567 or 050 123 4567
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={profileData.personalInfo.location}
                      onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={profileData.personalInfo.nationality}
                    onChange={(e) => {
                      const newNationality = e.target.value;
                      handleInputChange("personalInfo", "nationality", newNationality);
                      // Clear visaExpiryDate if nationality is changed to Emirati/UAE
                      if (newNationality && 
                          (newNationality.toLowerCase().includes("emirati") || 
                           newNationality.toLowerCase().includes("uae"))) {
                        handleInputChange("personalInfo", "visaExpiryDate", "");
                      }
                    }}
                    placeholder="e.g., Indian, British, American"
                  />
                </div>
                {/* Show Visa Expiry Date only for non-Emirati users */}
                {profileData.personalInfo.nationality && 
                 !profileData.personalInfo.nationality.toLowerCase().includes("emirati") && 
                 !profileData.personalInfo.nationality.toLowerCase().includes("uae") && (
                  <div className="space-y-2">
                    <Label htmlFor="visaExpiryDate">
                      Visa Expiry Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="visaExpiryDate"
                        type="date"
                        value={profileData.personalInfo.visaExpiryDate}
                        onChange={(e) => handleInputChange("personalInfo", "visaExpiryDate", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Required for non-Emirati users</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emiratesId">Emirates ID</Label>
                  <Input
                    id="emiratesId"
                    value={profileData.personalInfo.emiratesId}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      const numericValue = value.replace(/\D/g, '');
                      // Limit to 15 digits
                      const limitedValue = numericValue.slice(0, 15);
                      
                      handleInputChange("personalInfo", "emiratesId", limitedValue);
                      
                      // Validate and set error (only if field has value, since it's optional)
                      if (limitedValue && limitedValue.length !== 15) {
                        setEmiratesIdError("Emirates ID must be exactly 15 digits");
                      } else if (limitedValue.length === 15) {
                        setEmiratesIdError("");
                      } else {
                        // Clear error if field is empty (optional field)
                        setEmiratesIdError("");
                      }
                    }}
                    placeholder="Enter 15-digit Emirates ID (optional)"
                    maxLength={15}
                    className={emiratesIdError ? "border-red-500" : ""}
                  />
                  {emiratesIdError && (
                    <p className="text-sm text-red-500 mt-1">{emiratesIdError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={profileData.personalInfo.passportNumber}
                    onChange={(e) => handleInputChange("personalInfo", "passportNumber", e.target.value)}
                    placeholder="Enter your Passport Number (optional)"
                  />
                </div>
              </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Profile Photo Upload */}
          <Card className="card-shadow border-0" data-section="profile-photo">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Profile Photo
              </CardTitle>
              <CardDescription>Upload a professional profile photo to make your profile stand out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Current Photo Display */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Upload Section */}
                <div className="flex-1">
                  <FileUpload
                    onUploadSuccess={async (fileData) => {
                      const photoUrl = fileData.secure_url || fileData.url;
                      setProfileData(prev => ({
                        ...prev,
                        profilePicture: photoUrl
                      }));
                      
                      // Auto-save profile data with new photo
                      try {
                        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                        if (token) {
                          const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              profilePicture: photoUrl
                            }),
                          });
                          
                          if (response.ok) {
                            // Refresh auth context to update navbar
                            refreshAuth();
                            toast({
                              title: "Profile Photo Updated",
                              description: "Your profile photo has been saved successfully.",
                            });
                          } else {
                            throw new Error('Failed to save profile photo');
                          }
                        }
                      } catch (error) {
                        console.error('Error saving profile photo:', error);
                        toast({
                          title: "Photo Uploaded",
                          description: "Photo uploaded but not saved. Please click 'Save Profile' to persist changes.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Profile photo upload error:", error);
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    accept=".jpg,.jpeg,.png,.webp"
                    maxSize={2}
                    allowedTypes={['image']}
                    placeholder="Upload Profile Photo"
                    currentFile={profileData.profilePicture ? "Profile photo uploaded" : null}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 400x400px. Max size: 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Introductory Video Card */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Upload className="w-4 h-4 mr-2 text-blue-600" />
                Introductory Video
              </CardTitle>
              <CardDescription>Let employers know more about you through a short introductory video.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Video Display */}
              {profileData.introVideo && !isPreview && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Current Introductory Video:</h4>
                  <video 
                    src={profileData.introVideo} 
                    controls 
                    className="rounded max-w-xs border"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}

              {/* Video Upload Option */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Upload Pre-recorded Video:</h4>
                  <FileUpload
                    onUploadSuccess={async (fileData) => {
                      const videoUrl = fileData.secure_url || fileData.url;
                      setProfileData(prev => ({
                        ...prev,
                        introVideo: videoUrl
                      }));
                      
                      // Auto-save to database
                      try {
                        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                        if (token) {
                          const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              introVideo: videoUrl
                            }),
                          });
                          
                          if (response.ok) {
                            toast({
                              title: "Video Updated",
                              description: "Your introductory video has been saved successfully.",
                            });
                          }
                        }
                      } catch (error) {
                        console.error('Error saving video:', error);
                        toast({
                          title: "Video Uploaded",
                          description: "Video uploaded but not saved. Please click 'Save Profile' to persist changes.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Video upload error:", error);
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    accept=".mp4,.mov,.avi,.webm"
                    maxSize={50}
                    allowedTypes={['video']}
                    placeholder="Upload Video File"
                    currentFile={profileData.introVideo ? "Video uploaded" : null}
                  />
                </div>
                
                <div className="text-center text-gray-500">
                  <span>OR</span>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Record New Video:</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-10" 
                    onClick={handleStartRecording} 
                    disabled={recording || isPreview}
                  >
                    Record Video
                  </Button>
                </div>
              </div>
              {/* Live Camera Preview & Controls */}
              {recording && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <video ref={videoRef} autoPlay muted playsInline className="rounded max-w-xs border" />
                  <div className="text-xs text-gray-600">Recording... {recordingTime}s / 90s</div>
                  <Button type="button" variant="destructive" className="h-8 px-4 mt-2" onClick={handleStopRecording}>
                    Stop Recording
                  </Button>
                </div>
              )}
              {/* Video Preview & Save/Redo */}
              {isPreview && videoUrl && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <video src={videoUrl} controls className="rounded max-w-xs border" style={{ maxWidth: '100%' }} />
                  <div className="text-xs text-gray-500">You can use the fullscreen button in the video controls to enlarge your video.</div>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" className="h-8 px-4" onClick={handleReRecord}>
                      Re-record
                    </Button>
                    <Button type="button" className="h-8 px-4 gradient-bg text-white" onClick={handleSaveVideo}>
                      Save Video
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload a short 30–60 second video introducing yourself.</p>
              <p className="text-xs text-blue-600 mt-1">This video will be shared with employers as part of your job application. Make sure to speak confidently and highlight your career goals.</p>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Professional Summary
              </CardTitle>
              <CardDescription>Brief summary of your professional background and career goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={profileData.personalInfo.summary}
                  onChange={(e) => handleInputChange("personalInfo", "summary", e.target.value)}
                  placeholder="Brief summary of your professional background and career goals"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                Professional Experience
              </CardTitle>
              <CardDescription>Your current work experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={profileData.experience.currentRole}
                    onChange={(e) => handleInputChange("experience", "currentRole", e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.experience.company}
                    onChange={(e) => handleInputChange("experience", "company", e.target.value)}
                    placeholder="Current company name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select
                    value={profileData.experience.experience}
                    onValueChange={(value) => handleInputChange("experience", "experience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-6">4-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profileData.experience.industry}
                    onValueChange={(value) => handleInputChange("experience", "industry", value)}
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                Education
              </CardTitle>
              <CardDescription>Your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Highest Degree</Label>
                  <Input
                    id="degree"
                    value={profileData.education.degree}
                    onChange={(e) => handleInputChange("education", "degree", e.target.value)}
                    placeholder="e.g., Bachelor of Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={profileData.education.institution}
                    onChange={(e) => handleInputChange("education", "institution", e.target.value)}
                    placeholder="University/College name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Graduation</Label>
                  <Input
                    id="year"
                    value={profileData.education.year}
                    onChange={(e) => handleInputChange("education", "year", e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/CGPA</Label>
                  <Input
                    id="grade"
                    value={profileData.education.grade}
                    onChange={(e) => handleInputChange("education", "grade", e.target.value)}
                    placeholder="e.g., 3.8/4.0 or First Class"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Preferences */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-4 h-4 mr-2 text-blue-600" />
                  Skills & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    value={profileData.skills}
                    onChange={(e) => handleInputChange("skills", "", e.target.value)}
                    placeholder="List your key skills (comma-separated)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={profileData.certifications}
                    onChange={(e) => handleInputChange("certifications", "", e.target.value)}
                    placeholder="List your certifications and licenses"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Job Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobType">Preferred Job Type</Label>
                  <Select
                    value={profileData.preferences.jobType}
                    onValueChange={(value) => handleInputChange("preferences", "jobType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryExpectation">Salary Expectation (AED)</Label>
                  <Input
                    id="salaryExpectation"
                    value={profileData.preferences.salaryExpectation}
                    onChange={(e) => handleInputChange("preferences", "salaryExpectation", e.target.value)}
                    placeholder="e.g., 8000-12000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredLocation">Preferred Location</Label>
                  <Input
                    id="preferredLocation"
                    value={profileData.preferences.preferredLocation}
                    onChange={(e) => handleInputChange("preferences", "preferredLocation", e.target.value)}
                    placeholder="e.g., Dubai, Abu Dhabi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={profileData.preferences.availability}
                    onValueChange={(value) => handleInputChange("preferences", "availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="When can you start?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="2weeks">2 weeks notice</SelectItem>
                      <SelectItem value="1month">1 month notice</SelectItem>
                      <SelectItem value="2months">2 months notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Resume */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Primary Resume
              </CardTitle>
              <CardDescription>
                Upload your main resume document (PDF, DOC, DOCX - max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Resume Display */}
                {profileData.resumeDocument && (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Current Resume</p>
                          <p className="text-sm text-gray-500">Resume uploaded and saved</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(profileData.resumeDocument, '_blank')}
                          className="h-8 px-3"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!profileData.resumeDocument) {
                              toast({
                                title: "Download Error",
                                description: "Resume is not available for download.",
                                variant: "destructive",
                              });
                              return;
                            }

                            try {
                              // Get the download URL with fl_attachment flag for Cloudinary
                              const downloadUrl = getDownloadUrl(profileData.resumeDocument);
                              
                              // Extract filename from URL or use default
                              let filename = 'resume';
                              if (profileData.resumeDocument.includes('res.cloudinary.com')) {
                                const urlParts = profileData.resumeDocument.split('/');
                                const lastPart = urlParts[urlParts.length - 1];
                                if (lastPart && lastPart.includes('.')) {
                                  const cleanFilename = lastPart.split('?')[0].split('_')[0];
                                  if (cleanFilename && cleanFilename.length > 0) {
                                    filename = cleanFilename;
                                  }
                                }
                              }
                              
                              // Get file extension from URL
                              const urlLower = profileData.resumeDocument.toLowerCase();
                              let extension = 'pdf';
                              if (urlLower.includes('.docx') || filename.toLowerCase().endsWith('.docx')) extension = 'docx';
                              else if (urlLower.includes('.doc') || filename.toLowerCase().endsWith('.doc')) extension = 'doc';
                              else if (urlLower.includes('.txt') || filename.toLowerCase().endsWith('.txt')) extension = 'txt';
                              else if (urlLower.includes('.pdf') || filename.toLowerCase().endsWith('.pdf')) extension = 'pdf';
                              
                              // If filename doesn't have extension, add it
                              if (!filename.toLowerCase().endsWith(`.${extension}`)) {
                                filename = `${filename}.${extension}`;
                              }
                              
                              // Fetch the file as a blob
                              const response = await fetch(downloadUrl);
                              if (!response.ok) {
                                throw new Error('Failed to fetch file');
                              }
                              
                              const blob = await response.blob();
                              const blobUrl = URL.createObjectURL(blob);
                              
                              // Create download link
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              link.download = filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              // Clean up blob URL
                              URL.revokeObjectURL(blobUrl);
                              
                              toast({
                                title: "Download Started",
                                description: `Downloading ${filename}...`,
                              });
                            } catch (error) {
                              console.error('Download error:', error);
                              toast({
                                title: "Download failed",
                                description: "Failed to download resume. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="h-8 px-3"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resume Upload */}
                <FileUpload
                  onUploadSuccess={async (fileData) => {
                    const resumeUrl = fileData.secure_url || fileData.url;
                    setProfileData(prev => ({ ...prev, resumeDocument: resumeUrl, resume: true }));
                    
                    // Auto-save to database
                    try {
                      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                      if (token) {
                        const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            resumeDocument: resumeUrl
                          }),
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Resume Uploaded",
                            description: "Your resume has been saved to your profile.",
                          });
                        } else {
                          throw new Error('Failed to save resume');
                        }
                      }
                    } catch (error) {
                      console.error('Error saving resume:', error);
                      toast({
                        title: "Resume Uploaded",
                        description: "Resume uploaded but not saved. Please click 'Save Profile' to persist changes.",
                        variant: "destructive",
                      });
                    }
                  }}
                  onUploadError={(error) => {
                    console.error("Resume upload error:", error);
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

          {/* Additional Documents */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Additional Documents
              </CardTitle>
              <CardDescription>Upload additional documents like certificates, portfolios, etc. (up to 10 documents, max 10MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Documents Display */}
              {profileData.documents.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Your Documents ({profileData.documents.length}/10)</h4>
                  <div className="space-y-3">
                    {profileData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center flex-1">
                          <FileText className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                              {doc.size && ` • ${Math.round(doc.size / 1024)} KB`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="h-8 px-2"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!doc.url) {
                                toast({
                                  title: "Download Error",
                                  description: "Document is not available for download.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              try {
                                // Get the download URL with fl_attachment flag for Cloudinary
                                const downloadUrl = getDownloadUrl(doc.url);
                                
                                // Extract filename from doc.name or URL
                                let filename = doc.name;
                                if (doc.url.includes('res.cloudinary.com') && !filename.includes('.')) {
                                  const urlParts = doc.url.split('/');
                                  const lastPart = urlParts[urlParts.length - 1];
                                  if (lastPart && lastPart.includes('.')) {
                                    const cleanFilename = lastPart.split('?')[0].split('_')[0];
                                    if (cleanFilename && cleanFilename.length > 0) {
                                      filename = cleanFilename;
                                    }
                                  }
                                }
                                
                                // Get file extension from name or URL
                                const urlLower = doc.url.toLowerCase();
                                let extension = '';
                                if (filename.includes('.')) {
                                  extension = filename.split('.').pop() || '';
                                } else if (urlLower.includes('.pdf')) extension = 'pdf';
                                else if (urlLower.includes('.docx')) extension = 'docx';
                                else if (urlLower.includes('.doc')) extension = 'doc';
                                else if (urlLower.includes('.txt')) extension = 'txt';
                                else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) extension = 'jpg';
                                else if (urlLower.includes('.png')) extension = 'png';
                                
                                // If filename doesn't have extension, add it
                                if (extension && !filename.toLowerCase().endsWith(`.${extension}`)) {
                                  filename = `${filename}.${extension}`;
                                }
                                
                                // Fetch the file as a blob
                                const response = await fetch(downloadUrl);
                                if (!response.ok) {
                                  throw new Error('Failed to fetch file');
                                }
                                
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                
                                // Create download link
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                // Clean up blob URL
                                URL.revokeObjectURL(blobUrl);
                                
                                toast({
                                  title: "Download Started",
                                  description: `Downloading ${filename}...`,
                                });
                              } catch (error) {
                                console.error('Download error:', error);
                                toast({
                                  title: "Download failed",
                                  description: "Failed to download document. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="h-8 px-2"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const updatedDocuments = profileData.documents.filter(d => d.id !== doc.id);
                              
                              setProfileData(prev => ({
                                ...prev,
                                documents: updatedDocuments
                              }));

                              // Auto-save to database
                              try {
                                const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                                if (token) {
                                  const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
                                    method: 'PUT',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      jobPreferences: {
                                        resumeAndDocs: updatedDocuments.map(d => d.url),
                                      }
                                    }),
                                  });
                                  
                                  if (response.ok) {
                                    toast({
                                      title: "Document Removed",
                                      description: `${doc.name} has been removed from your profile.`,
                                    });
                                  } else {
                                    throw new Error('Failed to update profile');
                                  }
                                } else {
                                  toast({
                                    title: "Document Removed Locally",
                                    description: `${doc.name} removed locally. Please click 'Save Profile' to persist changes.`,
                                    variant: "destructive",
                                  });
                                }
                              } catch (error) {
                                console.error('Error updating profile after document deletion:', error);
                                toast({
                                  title: "Document Removed Locally",
                                  description: `${doc.name} removed locally. Please click 'Save Profile' to persist changes.`,
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Documents */}
              <div>
                <h4 className="font-medium mb-3">
                  {profileData.documents.length === 0 ? 'Upload Documents' : 'Add More Documents'}
                </h4>
                {profileData.documents.length < 10 ? (
                  <FileUpload
                    onUploadSuccess={async (fileData) => {
                      // Try multiple possible filename fields, prioritizing the most reliable ones
                      const originalName = fileData.clientOriginalName ||     // From our FileUpload component
                                         fileData.original_filename ||        // From Cloudinary
                                         fileData.display_name ||             // Alternative Cloudinary field
                                         fileData.public_id ||                // Cloudinary public ID
                                         `Document-${Date.now()}`;            // Final fallback with timestamp
                      
                      const newDocument = {
                        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: originalName,
                        url: fileData.secure_url || fileData.url,
                        type: fileData.format || 'document',
                        size: fileData.bytes,
                        uploadDate: new Date().toISOString(),
                      };

                      const updatedDocuments = [...profileData.documents, newDocument];
                      
                      setProfileData(prev => ({
                        ...prev,
                        documents: updatedDocuments
                      }));

                      // Auto-save documents to database
                      try {
                        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
                        if (token) {
                          const response = await fetch(`${API_BASE_URL}/api/v1/profile/update`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              jobPreferences: {
                                resumeAndDocs: updatedDocuments.map(doc => doc.url),
                              }
                            }),
                          });
                          
                          if (response.ok) {
                            toast({
                              title: "Document Uploaded",
                              description: `${newDocument.name} has been saved to your profile.`,
                            });
                          } else {
                            throw new Error('Failed to save document');
                          }
                        }
                      } catch (error) {
                        console.error('Error saving document:', error);
                        toast({
                          title: "Document Uploaded",
                          description: "Document uploaded but not saved. Please click 'Save Profile' to persist changes.",
                          variant: "destructive",
                        });
                      }
                    }}
                    onUploadError={(error) => {
                      console.error("Document upload error:", error);
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    maxSize={10}
                    allowedTypes={['document', 'image']}
                    placeholder="Upload Resume, Certificates, or Other Documents"
                    multiple={false}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Maximum of 10 documents allowed. Remove some documents to upload new ones.</p>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  <p>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                  <p>Maximum file size: 10MB per document</p>
                  <p>You can upload up to 10 documents total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links Card */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Social Media Links
              </CardTitle>
              <CardDescription>Share your professional and social profiles (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9" rx="2"/><circle cx="4" cy="4" r="2"/></svg>
                  <Input
                    id="linkedin"
                    type="url"
                    pattern="https?://.+"
                    value={profileData.socialLinks.linkedin}
                    onChange={(e) => handleInputChange("socialLinks", "linkedin", e.target.value)}
                    placeholder="LinkedIn profile URL"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  <Input
                    id="instagram"
                    type="url"
                    pattern="https?://.+"
                    value={profileData.socialLinks.instagram}
                    onChange={(e) => handleInputChange("socialLinks", "instagram", e.target.value)}
                    placeholder="Instagram profile URL"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1.64a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.01-4.52 4.5 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 0 1 .96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.56 1.74 2.17 3 4.09 3.04A9.05 9.05 0 0 1 0 19.54a12.8 12.8 0 0 0 6.95 2.03c8.36 0 12.94-6.92 12.94-12.93 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 24 4.59a9.1 9.1 0 0 1-2.6.71z"/></svg>
                  <Input
                    id="twitter"
                    type="url"
                    pattern="https?://.+"
                    value={profileData.socialLinks.twitter}
                    onChange={(e) => handleInputChange("socialLinks", "twitter", e.target.value)}
                    placeholder="Twitter/X profile URL"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow Us Section */}
          <FollowUs 
            onPointsEarned={(platform, earnedPoints) => {
              // Recalculate points with the new earned points
              const newCalculatedPoints = 50 + profileCompletion * 2 + earnedPoints
              const deductedPoints = profileData.deductedPoints || 0
              const availablePoints = Math.max(0, newCalculatedPoints - deductedPoints)
              setPoints(availablePoints)
              toast({
                title: "Profile Updated!",
                description: `Earned ${earnedPoints} points for following us on ${platform}! Total points: ${availablePoints}`,
              })
            }}
          />

          {/* Save Button */}
          <div className="flex justify-center">
            <Button onClick={handleSave} disabled={isSaving || isLoading} className="gradient-bg text-white px-8 py-2">
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
