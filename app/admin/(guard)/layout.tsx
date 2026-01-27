"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

export default function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      console.log("Admin Guard - User:", user)
      console.log("Admin Guard - User type:", user?.type)
      if (!user || user.type !== "admin") {
        console.log("Admin Guard - Redirecting to home page")
        router.replace("/")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.type !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Checking access…</div>
    )
  }

  return <>{children}</>
}


