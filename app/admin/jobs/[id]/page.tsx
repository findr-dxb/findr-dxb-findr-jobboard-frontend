"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FileText,
  ArrowLeft,
  Eye,
  Pause,
  Trash2
} from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1'

export default function AdminJobDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobData, setJobData] = useState<any | null>(null)

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setJobData(result.data)
        } else {
          setError(result.message || "Failed to load job details")
        }
      } catch (e) {
        console.error("Error fetching job details:", e)
        setError("Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchJobDetails()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center gap-3 text-gray-600">
        <LoadingSpinner size={32} />
        Loading job details…
      </div>
    )
  }

  if (error || !jobData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-gray-700">
        <div>{error || "Job not found"}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border"
        >
          Go back
        </button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* No Navbar - removed for admin view */}

      <main className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* No Back Button - removed for admin view */}

          {/* Job Header Card */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-indigo-100">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center card-shadow">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-blue-900">{jobData.title || jobData.jobTitle}</h1>
                      <Badge className={`${getStatusColor(jobData.status)} text-xs px-3 py-1`}>
                        {jobData.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-blue-700 mb-2">{jobData.companyName}</p>
                    <div className="flex items-center space-x-4 text-sm text-blue-600">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {jobData.location}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {jobData.jobType}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${jobData.minimumSalary?.toLocaleString()} - ${jobData.maximumSalary?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm text-blue-700 mb-2">Application Deadline</div>
                  <div className="font-semibold text-blue-900 mb-1">
                    {jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-blue-600">
                    {jobData.views || 0} views
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {jobData.description || 'No description available'}
              </p>
            </CardContent>
          </Card>

          {/* Job Requirements */}
          {jobData.requirements && jobData.requirements.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-4 h-4 mr-2 text-green-600" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobData.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Job Benefits */}
          {jobData.benefits && jobData.benefits.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobData.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {jobData.skills && jobData.skills.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="text-lg">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employer Information */}
          {jobData.employerInfo && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building className="w-4 h-4 mr-2 text-indigo-600" />
                  Employer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Company Name</div>
                    <div className="font-semibold text-gray-900">{jobData.employerInfo.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Contact Email</div>
                    <div className="font-semibold text-gray-900">{jobData.employerInfo.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Statistics */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Eye className="w-4 h-4 mr-2 text-amber-600" />
                Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{jobData.views || 0}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {jobData.postedDate ? new Date(jobData.postedDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Posted Date</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
