"use client";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  DollarSign, 
  Clock, 
  Briefcase,
  ArrowLeft,
  Edit,
  Pause,
  Play,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params?.id as string;
  
  const [jobData, setJobData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view job details.",
            variant: "destructive",
          });
          router.push('/login/employer');
          return;
        }

        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        setJobData(response.data.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Failed to fetch job details. The job may not exist or you may not have permission to view it.",
          variant: "destructive",
        });
        // Redirect back to jobs page after showing error
        setTimeout(() => {
          router.push('/employer/active-jobs');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  // Toggle job status (pause/resume)
  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      const newStatus = jobData.status === 'active' ? 'paused' : 'active';
      
      await axios.put(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      setJobData({ ...jobData, status: newStatus });
      toast({
        title: "Success",
        description: `Job ${newStatus === 'active' ? 'resumed' : 'paused'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Close job
  const handleCloseJob = async () => {
    if (!confirm('Are you sure you want to close this job? This will hide it from job seekers but preserve all applications.')) {
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      
      await axios.put(`https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs/${jobId}/close`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      toast({
        title: "Success",
        description: "Job closed successfully.",
      });
      
      // Update the job data to reflect the closed status
      setJobData((prev: any) => prev ? {...prev, status: 'closed'} : null);
    } catch (error) {
      console.error('Error closing job:', error);
      toast({
        title: "Error",
        description: "Failed to close job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <Link href="/employer/active-jobs" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Jobs
            </Link>
            <div className="flex gap-2">
              <Link href={`/employer/active-jobs/${jobId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleStatus}
                disabled={isUpdating}
              >
                {jobData?.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-800"
                onClick={handleCloseJob}
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>

          {/* Job Header Card */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${statusColor(jobData.status)} text-xs px-3 py-1`}>
                      {formatStatus(jobData.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Posted {new Date(jobData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobData.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      {jobData.companyName}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {jobData.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      {jobData.jobType?.join(", ")}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      AED {jobData.salary?.min} - {jobData.salary?.max}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                      {jobData.experienceLevel} level
                    </div>
                  </div>
                </div>
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">{jobData.applications?.length || jobData.applicationCount || 0}</div>
                      <div className="text-xs text-gray-600">Applicants</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600">{jobData.views || 0}</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="text-xl">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {jobData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {jobData.requirements && jobData.requirements.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="text-xl">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobData.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {jobData.benefits && jobData.benefits.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="text-xl">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobData.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/employer/applicants/${jobId}`}>
              <Button className="gradient-bg text-white px-8 py-3">
                <Users className="w-4 h-4 mr-2" />
                View Applicants ({jobData.applications?.length || jobData.applicationCount || 0})
              </Button>
            </Link>
            <Link href={`/employer/active-jobs/${jobId}/edit`}>
              <Button variant="outline" className="px-8 py-3">
                <Edit className="w-4 h-4 mr-2" />
                Edit Job Posting
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
