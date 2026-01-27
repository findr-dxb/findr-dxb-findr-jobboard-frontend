"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string[];
  salary: {
    min: number;
    max: number;
  };
  description: string;
  skills: string[];
  createdAt: string;
  status: string;
}

export default function SavedJobsPage() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch actual job details for saved job IDs
  const fetchSavedJobs = async (jobIds: string[]) => {
    if (jobIds.length === 0) {
      setJobs([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Fetch all jobs and filter by saved IDs
      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/jobs', {
        params: { 
          status: 'active',
          limit: 100 // Get a large number to ensure we catch all saved jobs
        }
      })

      const allJobs = response.data.data.jobs || []
      const savedJobs = allJobs.filter((job: Job) => jobIds.includes(job._id))
      setJobs(savedJobs)
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch saved jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedJobs')
      const savedArr = saved ? JSON.parse(saved) : []
      setSavedJobIds(savedArr)
      fetchSavedJobs(savedArr)
    }
  }, [])

  // Refresh saved jobs when the page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && typeof window !== 'undefined') {
        const saved = localStorage.getItem('savedJobs')
        const savedArr = saved ? JSON.parse(saved) : []
        if (JSON.stringify(savedArr) !== JSON.stringify(savedJobIds)) {
          setSavedJobIds(savedArr)
          fetchSavedJobs(savedArr)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [savedJobIds])

  const toggleSaveJob = (jobId: string) => {
    const updated = savedJobIds.includes(jobId)
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId]
    
    setSavedJobIds(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
    
    // Update displayed jobs
    if (savedJobIds.includes(jobId)) {
      // Remove job from display
      setJobs(jobs.filter(job => job._id !== jobId))
    }
    
    toast({
      title: savedJobIds.includes(jobId) ? "Removed from Saved Jobs" : "Job Saved!",
      description: savedJobIds.includes(jobId) ? "This job has been removed from your saved jobs." : "This job has been added to your saved jobs.",
    })
  }

  // Format salary display
  const formatSalary = (salary: { min: number; max: number }) => {
    return `AED ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
  }

  // Format posted date
  const formatPostedDate = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
          <div className="text-center text-gray-500 mt-16 text-lg">Loading saved jobs...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
        {jobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-16 text-lg">No saved jobs yet. Click the heart icon on a job to save it here!</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card
                key={job._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1 flex items-center">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium">{job.companyName}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job._id)} aria-label="Unsave job">
                          <Heart className={`w-4 h-4 fill-rose-500 text-rose-500 transition-transform duration-150 hover:scale-110`} />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <span className="mr-1">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">{job.jobType.join(", ")}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">{formatSalary(job.salary)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">{formatPostedDate(job.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 rounded px-2 py-1 text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-6">
                      <Button className="gradient-bg text-white" onClick={() => router.push(`/jobseeker/search/${job._id}`)}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 