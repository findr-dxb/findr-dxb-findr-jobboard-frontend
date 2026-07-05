"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Star, 
  Trash2, 
  RefreshCw, 
  Users, 
  Briefcase, 
  Award, 
  Plus, 
  Search, 
  Loader2,
  Building,
  User,
  RotateCcw,
  Edit2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface FindrStar {
  _id: string
  name: string
  type: 'jobseeker' | 'employer'
  profilePicture: string
  points: number
  appreciationMessage: string
  userId?: string
  isSystemGenerated?: boolean
  createdAt?: string
}

interface UserSearchResult {
  id: string
  fullName?: string
  companyName?: string
  emailAddress?: string
  companyEmail?: string
  profileImage?: string
  companyLogo?: string
  points?: number
}

export default function FindrStarsAdminPage() {
  const [stars, setStars] = useState<FindrStar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Form State
  const [formType, setFormType] = useState<'jobseeker' | 'employer'>('jobseeker')
  const [formName, setFormName] = useState('')
  const [formPicture, setFormPicture] = useState('')
  const [formPoints, setFormPoints] = useState(0)
  const [formMessage, setFormMessage] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  // User Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const fetchStars = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/stars`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch Findr Stars")
      }
      setStars(result.data || [])
    } catch (error: any) {
      console.error("Error fetching stars:", error)
      toast({
        title: "Error Loading Findr Stars",
        description: error.message || "Failed to load featured leaderboard.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Search users from DB
  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return
    try {
      setIsSearching(true)
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${formType}?search=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
          }
        }
      )
      const result = await response.json()
      if (response.ok && result.success) {
        setSearchResults(result.data?.users || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectUser = (user: UserSearchResult) => {
    const name = formType === 'employer' ? user.companyName : user.fullName
    const picture = formType === 'employer' ? user.companyLogo : user.profileImage
    
    setFormName(name || '')
    setFormPicture(picture || '')
    setFormPoints(user.points || 0)
    setSelectedUserId(user.id)
    setSearchResults([])
    setSearchQuery('')
    toast({
      title: "User Selected",
      description: `Autofilled details for ${name}.`,
    })
  }

  const handleCustomizeStar = (star: FindrStar) => {
    setFormType(star.type)
    setFormName(star.name)
    setFormPicture(star.profilePicture)
    setFormPoints(star.points)
    setFormMessage(star.appreciationMessage)
    setSelectedUserId(star.userId || star._id || null) // use userId or _id for system generated
    setDialogOpen(true)
  }

  const handleAddStar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and appreciation message are required.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/stars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: formName,
          type: formType,
          profilePicture: formPicture,
          points: formPoints,
          appreciationMessage: formMessage,
          userId: selectedUserId
        })
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add Findr Star")
      }

      toast({
        title: selectedUserId ? "Findr Star Customized!" : "Findr Star Added!",
        description: `${formName} has been featured on the homepage.`,
      })

      // Reset Form & Close Dialog
      setFormName('')
      setFormPicture('')
      setFormPoints(0)
      setFormMessage('')
      setSelectedUserId(null)
      setDialogOpen(false)
      fetchStars()
    } catch (error: any) {
      toast({
        title: "Failed to Save Findr Star",
        description: error.message || "An error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleResetStar = async (id: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stars/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        }
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to remove override")
      }
      toast({
        title: "Override Removed",
        description: `${name} has been reset to system defaults.`,
      })
      fetchStars()
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset Findr Star.",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchStars()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-8 h-8 text-emerald-600 animate-bounce" />
            Manage Findr Stars
          </h1>
          <p className="text-gray-600 mt-2">Customize featured job seekers & employers shown on the homepage leaderboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchStars}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              // reset states
              setFormName('')
              setFormPicture('')
              setFormPoints(0)
              setFormMessage('')
              setSelectedUserId(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white flex items-center gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                Add Custom Star
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedUserId ? "Customize Featured Star" : "Add Custom Featured Star"}</DialogTitle>
                <DialogDescription>
                  {selectedUserId ? "Modify quotes and details for this star user." : "Create a custom featured card. You can search for an existing user to auto-populate fields."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddStar} className="space-y-4 pt-4">
                {/* Star Type */}
                <div className="space-y-2">
                  <Label>Star Type</Label>
                  <Select 
                    value={formType} 
                    onValueChange={(val: 'jobseeker' | 'employer') => {
                      setFormType(val)
                      setSearchResults([])
                      setSelectedUserId(null)
                    }}
                    disabled={!!selectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Search (only visible when not customizing a specific user) */}
                {!selectedUserId && (
                  <div className="space-y-2 border-b pb-4">
                    <Label className="text-xs text-gray-500 font-semibold">Search Existing User (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={formType === 'employer' ? "Search company name..." : "Search user name/email..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleSearchUsers}
                        disabled={isSearching}
                        variant="secondary"
                        className="shrink-0"
                      >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded-md max-h-[160px] overflow-y-auto bg-white divide-y shadow-inner">
                        {searchResults.map((user) => {
                          const name = formType === 'employer' ? user.companyName : user.fullName
                          const email = formType === 'employer' ? user.companyEmail : user.emailAddress
                          return (
                            <div
                              key={user.id}
                              className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                              onClick={() => selectUser(user)}
                            >
                              <div>
                                <p className="font-semibold text-gray-900">{name}</p>
                                <p className="text-xs text-gray-500">{email}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="text-xs text-emerald-600 hover:text-emerald-700">Select</Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="star-name">Display Name *</Label>
                  <Input
                    id="star-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={formType === 'employer' ? "e.g., Al Noor Holdings" : "e.g., Aditya Kumar"}
                    required
                  />
                </div>

                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label htmlFor="star-picture">Profile Picture / Logo URL</Label>
                  <Input
                    id="star-picture"
                    value={formPicture}
                    onChange={(e) => setFormPicture(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <Label htmlFor="star-points">Activity Points</Label>
                  <Input
                    id="star-points"
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                {/* Appreciation Quote */}
                <div className="space-y-2">
                  <Label htmlFor="star-message">Appreciation Quote *</Label>
                  <Textarea
                    id="star-message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe their achievements or add a nice quote about them..."
                    rows={3}
                    required
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitLoading}
                    className="gradient-bg text-white"
                  >
                    {isSubmitLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Override
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid of Stars */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Seekers Card */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Job Seekers</CardTitle>
                  <CardDescription>Featured candidates shown on homepage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stars.filter(s => s.type === 'jobseeker').map((star) => (
                  <div key={star.userId || star._id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-emerald-100 shadow-sm">
                      {star.profilePicture ? (
                        <img src={star.profilePicture} alt={star.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900 truncate">{star.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          star.isSystemGenerated 
                            ? "bg-slate-100 text-slate-600 border border-slate-200" 
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}>
                          {star.isSystemGenerated ? "System Generated" : "Customized"}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{star.points} Activity Points</p>
                      <p className="text-xs text-gray-600 mt-1 italic line-clamp-2 bg-slate-50 p-2 rounded-md border border-gray-50">"{star.appreciationMessage}"</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleCustomizeStar(star)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Customize Quote
                        </Button>

                        {!star.isSystemGenerated && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                            onClick={() => handleResetStar(star.userId || star._id, star.name)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset to Default
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Employers Card */}
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Employers</CardTitle>
                  <CardDescription>Featured employers / partners shown on homepage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stars.filter(s => s.type === 'employer').map((star) => (
                  <div key={star.userId || star._id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-purple-100 shadow-sm">
                      {star.profilePicture ? (
                        <img src={star.profilePicture} alt={star.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-gray-900 truncate">{star.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          star.isSystemGenerated 
                            ? "bg-slate-100 text-slate-600 border border-slate-200" 
                            : "bg-purple-100 text-purple-700 border border-purple-200"
                        }`}>
                          {star.isSystemGenerated ? "System Generated" : "Customized"}
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 font-semibold mt-0.5">{star.points} Activity Points</p>
                      <p className="text-xs text-gray-600 mt-1 italic line-clamp-2 bg-slate-50 p-2 rounded-md border border-gray-50">"{star.appreciationMessage}"</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs flex items-center gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
                          onClick={() => handleCustomizeStar(star)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Customize Quote
                        </Button>

                        {!star.isSystemGenerated && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                            onClick={() => handleResetStar(star.userId || star._id, star.name)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset to Default
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
