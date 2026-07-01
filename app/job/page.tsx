"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Lock, 
  Eye, 
  Calendar, 
  ChevronRight 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import axios from "axios"

interface Job {
  _id: string
  title: string
  companyName: string
  location: string
  jobType: string[]
  createdAt: string
  description: string
  experienceLevel?: string
  status: string
}

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [selectedJobTitle, setSelectedJobTitle] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const params: any = { status: "active" }
      
      if (searchTerm) params.search = searchTerm
      if (location) params.location = location

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        params
      })

      setJobs(response.data.data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = () => {
    fetchJobs()
  }

  const triggerLoginModal = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId)
    setSelectedJobTitle(jobTitle)
    setIsLoginDialogOpen(true)
  }

  const handleLoginRedirect = (type: "jobseeker" | "employer") => {
    setIsLoginDialogOpen(false)
    const dest = type === "jobseeker" && selectedJobId ? `/jobseeker/search/${selectedJobId}` : (type === "jobseeker" ? "/jobseeker/search" : "/employer/dashboard")
    router.push(`/login?type=${type}&redirect=${encodeURIComponent(dest)}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between border-b pb-6 border-gray-200">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
              Explore Available <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Positions</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Discover opportunities and connect with top companies in Dubai.
            </p>
          </div>
        </div>

        {/* Search Row */}
        <Card className="mb-10 shadow-sm border border-gray-200/80 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Location (e.g. Dubai, Abu Dhabi)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus-visible:ring-emerald-500"
                />
              </div>

              <Button 
                onClick={handleSearch} 
                className="h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium shadow-md shadow-emerald-600/10 transition-all rounded-xl"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-emerald-600"></div>
            <p className="text-gray-500 mt-4 font-medium">Fetching the latest positions...</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center border-dashed border-2 border-gray-200">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No jobs found</h3>
                  <p className="text-gray-500 mb-6">Try refining your search terms or location query.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("")
                      setLocation("")
                      fetchJobs()
                    }}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Clear Filters
                  </Button>
                </Card>
              </div>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job._id}
                  className="flex flex-col bg-white border border-gray-200/80 hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 rounded-2xl overflow-hidden group"
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-xs font-semibold rounded-md px-2.5 py-1">
                        {job.jobType?.[0] || "Full Time"}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center text-sm font-semibold text-gray-600 mb-3">
                      <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                      {job.companyName}
                    </div>

                    <div className="flex items-center text-xs text-gray-500 gap-3 border-t border-gray-100 pt-3">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {job.location}
                      </span>
                      {job.experienceLevel && (
                        <span className="flex items-center capitalize">
                          <Briefcase className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {job.experienceLevel} Level
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-6 bg-gray-50 p-3.5 rounded-xl border border-gray-100/50">
                      {job.description}
                    </p>
                    
                    <Button 
                      onClick={() => triggerLoginModal(job._id, job.title)}
                      className="w-full h-11 bg-white hover:bg-emerald-600 border border-emerald-600 hover:border-emerald-600 text-emerald-600 hover:text-white font-semibold transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                      <ChevronRight className="w-4 h-4 ml-0.5 opacity-70" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Login Wall Modal */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 p-6 shadow-2xl bg-white">
          <DialogHeader className="flex flex-col items-center text-center pt-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
              Join Findr to View Details
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm max-w-[320px]">
              Full details, including salary, requirements, applications, and referral systems for <span className="font-semibold text-gray-700">"{selectedJobTitle}"</span> are locked.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 my-6">
            <Button
              onClick={() => handleLoginRedirect("jobseeker")}
              className="h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-md transition-all rounded-xl"
            >
              Login as Job Seeker
            </Button>
            <Button
              onClick={() => handleLoginRedirect("employer")}
              variant="outline"
              className="h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-all rounded-xl"
            >
              Login as Employer
            </Button>
          </div>

          <DialogFooter className="flex flex-col items-center justify-center text-center sm:justify-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Don't have an account?{" "}
              <span 
                onClick={() => {
                  setIsLoginDialogOpen(false)
                  router.push("/signup")
                }}
                className="text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                Sign up now
              </span>
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
