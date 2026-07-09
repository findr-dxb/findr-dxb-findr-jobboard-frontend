"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Calendar, Loader2, X } from "lucide-react"
import type { RmPostingRequest } from "@/components/admin/rm-posting-request-card"

export type ProvidePostingFormData = {
  numberOfPostings: number
  expiryDate: string
}

type ProvidePostingModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: RmPostingRequest | null
  isSubmitting?: boolean
  onSubmit: (data: ProvidePostingFormData) => void
}

function getCompanyName(request: RmPostingRequest | null) {
  if (!request) return ""
  return (
    request.companyName ||
    request.employerId?.companyName ||
    request.employerName ||
    "Employer"
  )
}

function getMinDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function ProvidePostingModal({
  open,
  onOpenChange,
  request,
  isSubmitting = false,
  onSubmit,
}: ProvidePostingModalProps) {
  const [numberOfPostings, setNumberOfPostings] = useState("1")
  const [expiryDate, setExpiryDate] = useState("")

  useEffect(() => {
    if (open) {
      setNumberOfPostings("1")
      setExpiryDate("")
    }
  }, [open, request?._id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(numberOfPostings, 10)
    if (!count || count < 1) return
    if (!expiryDate) return
    onSubmit({ numberOfPostings: count, expiryDate })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-0 sm:rounded-xl [&>button]:hidden">
        <DialogDescription className="sr-only">
          Grant job posting slots to an employer with an expiry date.
        </DialogDescription>

        <div className="gradient-bg px-5 py-4 flex items-start justify-between">
          <div>
            <DialogTitle className="text-white font-semibold text-lg">
              Provide Posting
            </DialogTitle>
            <p className="text-emerald-100 text-sm mt-0.5">
              {getCompanyName(request)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-white/90 hover:text-white rounded-md p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white">
          <div className="space-y-1.5">
            <Label htmlFor="posting-count" className="text-sm text-gray-700">
              Number of Postings
            </Label>
            <Input
              id="posting-count"
              type="number"
              min={1}
              max={100}
              value={numberOfPostings}
              onChange={(e) => setNumberOfPostings(e.target.value)}
              placeholder="e.g. 5"
              className="h-11 bg-slate-50 border-slate-200"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="posting-expiry" className="text-sm text-gray-700">
              Deadline to Post
            </Label>
            <div className="relative">
              <Input
                id="posting-expiry"
                type="date"
                min={getMinDate()}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 pr-10"
                disabled={isSubmitting}
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500">
              After this date, unused posting slots and jobs posted under this grant will be removed.
            </p>
          </div>

          <div className="flex gap-2 rounded-lg bg-sky-50 border border-sky-100 px-3 py-3 text-left">
            <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-900 leading-relaxed">
              The company will be notified immediately upon posting creation. Ensure
              all details are verified against the RM query.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-lg gradient-bg text-white hover:opacity-95"
              disabled={isSubmitting || !request}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Posting"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
