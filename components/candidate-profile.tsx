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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { CandidateProfile } from "@/lib/applications";

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
    case "Platinum":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Gold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Silver":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export function CandidateProfileView({ candidate }: { candidate: CandidateProfile }) {
  const router = useRouter();
  const { toast } = useToast();

  const getDownloadUrl = (url: string): string => {
    if (!url) return url;
    if (url.includes('res.cloudinary.com')) {
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const beforeUpload = url.substring(0, uploadIndex + 8);
        const afterUpload = url.substring(uploadIndex + 8);
        if (!afterUpload.startsWith('fl_attachment')) {
          return `${beforeUpload}fl_attachment/${afterUpload}`;
        }
      }
    }
    return url;
  };

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
      // Get the download URL with fl_attachment flag for Cloudinary
      const downloadUrl = getDownloadUrl(url);
      
      // Extract filename from URL or use provided fileName
      let filename = fileName;
      if (url.includes('res.cloudinary.com')) {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          const cleanFilename = lastPart.split('?')[0].split('_')[0];
          if (cleanFilename && cleanFilename.length > 0) {
            filename = cleanFilename;
          }
        }
      }
      
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl, {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* <Navbar /> */}

      <main className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
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

          {/* Contact Information */}
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
                  <span className="text-gray-700">Born: {candidate.dateOfBirth}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Education */}
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

          {/* Documents */}
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
        </div>
      </main>
    </div>
  );
}


