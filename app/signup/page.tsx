"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Briefcase, Eye, EyeOff, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
    referralCode: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // OTP Verification States
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationOtp, setVerificationOtp] = useState("")
  const [otpValues, setOtpValues] = useState(["", "", "", ""])
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      setFormData((prev) => ({
        ...prev,
        referralCode: decodeURIComponent(refCode).toUpperCase(),
      }));
      toast({
        title: "Referral Code Applied",
        description: "Your referral code has been automatically filled!",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const resetOtpForm = () => {
    setIsVerifying(false)
    setVerificationOtp("")
    setOtpValues(["", "", "", ""])
  }

  const handleOtpChange = (val: string, idx: number) => {
    const cleanVal = val.replace(/\D/g, "")
    const newValues = [...otpValues]
    
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 4).split("")
      const updatedValues = ["", "", "", ""]
      pastedDigits.forEach((digit, dIdx) => {
        updatedValues[dIdx] = digit
      })
      setOtpValues(updatedValues)
      setVerificationOtp(updatedValues.join(""))
      
      const focusIdx = Math.min(pastedDigits.length - 1, 3)
      const targetInput = document.getElementById(`otp-input-${focusIdx}`)
      targetInput?.focus()
      return
    }

    newValues[idx] = cleanVal
    setOtpValues(newValues)
    setVerificationOtp(newValues.join(""))

    if (cleanVal && idx < 3) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !otpValues[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-input-${idx - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    if (!formData.accountType) {
      toast({
        title: "Account Type Required",
        description: "Please select your account type.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare API payload
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.accountType, // "jobseeker" or "employer"
        name: formData.name,
        ...(formData.referralCode && { referralCode: formData.referralCode.trim().toUpperCase() }),
      }

      const response = await fetch(`${API_BASE_URL}/signup`, {
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
          title: "Registration Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Verification Code Sent!",
        description: "Please check your email for the 4-digit code.",
      })
      
      setIsVerifying(true)
      setResendCountdown(30)

    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationOtp || verificationOtp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit code.",
        variant: "destructive",
      })
      return
    }

    setOtpLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: verificationOtp,
          role: formData.accountType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code.",
          variant: "destructive",
        })
        return
      }

      // Store token and user info in localStorage (using keys that auth context expects)
      if (data.token) {
        localStorage.setItem("findr_token", data.token)
        
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
        
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userId", data.user._id)
        localStorage.setItem("userName", data.user.name || data.user.fullName)
      }

      toast({
        title: "Email Verified!",
        description: "Your account is verified. Logging you in...",
      })

      setTimeout(() => {
        const redirectUrl = formData.accountType === "jobseeker" ? "/jobseeker/dashboard" : "/employer/dashboard";
        router.replace(redirectUrl)
      }, 1500)

    } catch (error) {
      console.error("Verification error:", error)
      toast({
        title: "Network Error",
        description: "Failed to connect to the verification service.",
        variant: "destructive",
      })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return

    setOtpLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.accountType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Resend Failed",
          description: data.message || "Failed to resend verification code.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      })
      setResendCountdown(60) // 60 seconds cooldown after first manual resend
    } catch (error) {
      console.error("Resend error:", error)
      toast({
        title: "Network Error",
        description: "Failed to connect to the resend service.",
        variant: "destructive",
      })
    } finally {
      setOtpLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
        <Navbar />

        <div className="flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md card-shadow border-0">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 card-shadow">
                <KeyRound className="w-8 h-8 text-white animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
              <CardDescription className="text-base text-gray-500 mt-1">
                We sent a 4-digit code to <span className="font-semibold text-gray-900 break-all">{formData.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label className="sr-only">Verification Code</Label>
                  <div className="flex justify-center gap-4 my-6">
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-14 h-14 text-center text-3xl font-extrabold border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-emerald-900 shadow-sm"
                        disabled={otpLoading}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={otpLoading || verificationOtp.length !== 4} 
                  className="w-full h-11 gradient-bg text-white font-semibold rounded-xl card-shadow hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  {otpLoading ? "Verifying..." : "Verify & Activate Account"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{" "}
                  {resendCountdown > 0 ? (
                    <span className="text-gray-400 font-semibold">Resend in {resendCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold focus:outline-none hover:underline transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Made a mistake?{" "}
                  <button
                    type="button"
                    onClick={resetOtpForm}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold focus:outline-none hover:underline transition-colors"
                  >
                    Go back to Edit Details
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md card-shadow border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
            <CardDescription className="text-base">Create your Findr account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jobseeker">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Job Seeker</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="employer">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Employer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder="Create a password"
                    className="h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  className="h-11"
                />
                
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="#" className="text-emerald-600 hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 gradient-bg text-white">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}