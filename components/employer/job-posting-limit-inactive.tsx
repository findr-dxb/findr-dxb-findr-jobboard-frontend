"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Headphones,
  Info,
  Loader2,
  Lock,
  PlusCircle,
} from "lucide-react"
import type { JobPostingLimitInfo } from "@/lib/features/jobPosting/jobPostingSlice"
import { RelationshipManagerPostingModal } from "@/components/employer/relationship-manager-posting-modal"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL

type JobPostingLimitInactiveProps = {
  jobPosting: JobPostingLimitInfo
}

function getLastPostedLabel(lastJobPostedAt: string | null) {
  if (!lastJobPostedAt) return null

  const last = new Date(lastJobPostedAt)
  const now = new Date()
  const daysAgo = Math.max(
    0,
    Math.floor((now.getTime() - last.getTime()) / (24 * 60 * 60 * 1000))
  )
  const formatted = last.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return {
    daysAgo,
    formatted,
    label:
      daysAgo === 0
        ? `today (${formatted})`
        : `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago (${formatted})`,
  }
}

export function JobPostingLimitInactive({
  jobPosting,
}: JobPostingLimitInactiveProps) {
  const [rmModalOpen, setRmModalOpen] = useState(false)
  const [rmRequestId, setRmRequestId] = useState<string | null>(null)
  const [isLoggingConnect, setIsLoggingConnect] = useState(false)
  const { toast } = useToast()
  const lastPosted = getLastPostedLabel(jobPosting.lastJobPostedAt)
  const daysUntil = jobPosting.daysUntilFreeSlot

  const handleConnectRm = async () => {
    const token =
      localStorage.getItem("findr_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")

    if (!token) {
      toast({
        title: "Not logged in",
        description: "Please log in and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoggingConnect(true)
    try {
      const res = await fetch(`${API_BASE_URL}/employer/rm-posting-request/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to connect")
      }

      setRmRequestId(data.data?.requestId || null)
      setRmModalOpen(true)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not connect to RM"
      toast({
        title: "Connection failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoggingConnect(false)
    }
  }

  return (
    <>
      <RelationshipManagerPostingModal
        open={rmModalOpen}
        onOpenChange={setRmModalOpen}
        requestId={rmRequestId}
      />
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
            Post Job
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your corporate recruitment lifecycle
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-5 md:px-6 md:py-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 max-w-md mx-auto leading-snug">
            Free posting period inactive right now
          </h2>

          <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-left max-w-lg mx-auto mb-4 space-y-2">
            {lastPosted ? (
              <p className="text-gray-600 text-sm">
                Your last job was posted{" "}
                <span className="font-semibold text-gray-900">{lastPosted.label}.</span>
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                You have used your available free job posting slot.
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Next free posting available in{" "}
              <span className="font-semibold text-emerald-600">
                {daysUntil > 0
                  ? `${daysUntil} day${daysUntil === 1 ? "" : "s"}`
                  : "less than a day"}
                .
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 max-w-xl mx-auto">
            <Button
              type="button"
              onClick={handleConnectRm}
              disabled={isLoggingConnect}
              className="gradient-bg text-white h-10 px-4 rounded-lg shadow-sm hover:opacity-95 flex-1"
            >
              {isLoggingConnect ? (
                <Loader2 className="w-4 h-4 shrink-0 mr-2 animate-spin" />
              ) : (
                <Headphones className="w-4 h-4 shrink-0 mr-2" />
              )}
              <span className="text-sm font-medium">
                Connect to Relationship Manager for posting
              </span>
            </Button>

            <Button
              type="button"
              disabled
              variant="outline"
              className="h-10 px-4 rounded-lg border-emerald-100 bg-emerald-50/40 text-gray-400 cursor-not-allowed flex-1 sm:flex-none sm:min-w-[120px]"
            >
              <PlusCircle className="w-4 h-4 mr-2 opacity-50" />
              Post Job
            </Button>
          </div>

          <div className="flex items-start justify-center gap-1.5 mt-3 text-xs text-gray-400 max-w-md mx-auto">
            <Info className="w-3 h-3 mt-0.5 shrink-0" />
            <p className="text-left italic leading-snug">
              Employer accounts are limited to one free post every{" "}
              {jobPosting.cooldownDays} days. Contact your Relationship Manager
              for additional postings.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
