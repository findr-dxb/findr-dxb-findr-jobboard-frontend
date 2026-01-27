"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthRedirectProps {
  children: React.ReactNode
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) return

    // If user is authenticated, redirect to their respective dashboard
    if (user) {
      const redirectUrl = user.type === "jobseeker" 
        ? "/jobseeker/dashboard" 
        : "/employer/dashboard"
      
      console.log('AuthRedirect: User detected on home page, redirecting to:', redirectUrl)
      router.replace(redirectUrl)
    }
  }, [user, isLoading, router])

  // Show loading or nothing while redirecting authenticated users
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render the home page content
  // (the redirect will happen via useEffect)
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user, render the home page content
  return <>{children}</>
}
