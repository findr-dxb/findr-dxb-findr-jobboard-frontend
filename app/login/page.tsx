"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Briefcase, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const API_BASE_URL = "https://findr-jobboard-backend-production.up.railway.app/api/v1"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("jobseeker")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { refreshAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "employer" || type === "jobseeker") {
      setActiveTab(type)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare API payload
      const payload = {
        email: formData.email,
        password: formData.password,
        role: activeTab, // "jobseeker" or "employer"
      }

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle API errors
        toast({
          title: "Login Failed",
          description: data.message || "Please check your credentials and try again.",
          variant: "destructive",
        })
        return
      }

      // Store token and user info in localStorage (using keys that auth context expects)
      if (data.token) {
        // Store token with the key that auth context looks for
        localStorage.setItem("findr_token", data.token)
        
        // Store user data in the format auth context expects
        const userData = {
          id: data.user._id,
          email: data.user.email,
          type: data.user.role,
          name: data.user.name || data.user.fullName,
          profileImage: data.user.profilePicture || `/images/${data.user.role}-hero.png`,
          points: data.user.points || 0,
          profileCompletion: data.user.profileCompletion || 0
        }
        localStorage.setItem("findr_user", JSON.stringify(userData))
        
        // Keep your original storage for backward compatibility if needed
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userId", data.user._id)
        localStorage.setItem("userName", data.user.name)
        
        // Store user data if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email)
        }
      }

      // Refresh the auth context to update navbar immediately
      refreshAuth();

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.name}! Redirecting to your dashboard...`,
        })
      
      // Redirect based on role
      console.log('Login: User role:', data.user.role);
      const redirectUrl = data.user.role === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard";
      console.log('Login: Redirecting to:', redirectUrl);
      
      // Also store the redirect URL for manual navigation if needed
      localStorage.setItem('pendingRedirect', redirectUrl);
      
      // Use replace instead of push to avoid router state issues
      router.replace(redirectUrl)
      
      // Fallback: Force navigation with window.location if router fails
      setTimeout(() => {
        if (window.location.pathname !== redirectUrl) {
          console.log('Login: Router failed, using window.location');
          window.location.href = redirectUrl;
        }
      }, 2000)

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md card-shadow border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">Sign in to your Findr account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="jobseeker" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Job Seeker</span>
                </TabsTrigger>
                <TabsTrigger value="employer" className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Employer</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobseeker" className="space-y-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                        }
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Link href="/login/forgot-password" className="text-sm text-emerald-600 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full gradient-bg text-white">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="employer" className="space-y-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                        }
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Link href="/login/forgot-password" className="text-sm text-emerald-600 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full gradient-bg text-white">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-emerald-600 hover:underline font-medium">
                  Get Started
                </Link>
              </p>
              
              {/* Debug: Manual navigation buttons */}
             
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}