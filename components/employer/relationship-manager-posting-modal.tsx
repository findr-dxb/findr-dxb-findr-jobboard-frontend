"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, Mail, Phone, User, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL

const RM_PROFILE = {
  name: "Sarah Ahmed",
  title: "Senior Account Executive",
  email: "sarah.ahmed@findr.ae",
  phone: "+971 4 555 0192",
  phoneLabel: "Dubai Contact",
}

type RelationshipManagerPostingModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string | null
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return (
    localStorage.getItem("findr_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token")
  )
}

export function RelationshipManagerPostingModal({
  open,
  onOpenChange,
  requestId,
}: RelationshipManagerPostingModalProps) {
  const [query, setQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please type your query before submitting.",
        variant: "destructive",
      })
      return
    }

    if (!requestId) {
      toast({
        title: "Session expired",
        description: "Please close and click Connect again.",
        variant: "destructive",
      })
      return
    }

    const token = getAuthToken()
    if (!token) {
      toast({
        title: "Not logged in",
        description: "Please log in and try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/employer/rm-posting-request/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, query: query.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit query")
      }

      toast({
        title: "Query submitted",
        description: "Your Relationship Manager will reach out within 2 business hours.",
      })
      setQuery("")
      onOpenChange(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit query"
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-0 sm:rounded-xl [&>button]:hidden">
        <DialogDescription className="sr-only">
          Contact your relationship manager to request an additional job posting.
        </DialogDescription>
        <div className="gradient-bg px-4 py-3 flex items-center justify-between">
          <DialogTitle className="text-white font-semibold text-base">
            Relationship Manager
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-white/90 hover:text-white rounded-md p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden mb-2">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{RM_PROFILE.name}</h3>
            <p className="text-sm font-medium text-emerald-700">{RM_PROFILE.title}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {RM_PROFILE.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-500">{RM_PROFILE.phoneLabel}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {RM_PROFILE.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              A priority query has been raised for you. {RM_PROFILE.name.split(" ")[0]}{" "}
              will reach out within <span className="font-semibold">2 business hours</span>{" "}
              to discuss your posting requirements.
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="rm-query" className="text-sm text-gray-700">
              Your Query
            </Label>
            <Textarea
              id="rm-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query here..."
              className="min-h-[88px] resize-y bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !requestId}
            className="w-full gradient-bg text-white h-10 rounded-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Query"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
