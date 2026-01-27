"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Building2, FileText, Settings, ExternalLink, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"

interface EmployerProfileCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completionPercentage: number
  canPostJob: boolean
  missingFields: string[]
  companyName?: string
  onCompleteProfile: () => void
}

export function EmployerProfileCompletionDialog({
  open,
  onOpenChange,
  completionPercentage,
  canPostJob,
  missingFields,
  companyName,
  onCompleteProfile
}: EmployerProfileCompletionDialogProps) {
  const remainingPercentage = 80 - completionPercentage
  const profileComplete = completionPercentage >= 80

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getRequirementStatus = () => {
    if (canPostJob) {
      return {
        title: "Ready to Post Jobs!",
        message: "Your company profile meets all requirements for job posting.",
        color: "green",
        icon: FileText
      }
    } else {
      return {
        title: "Complete Your Company Profile",
        message: `You need ${remainingPercentage}% more profile completion to post jobs.`,
        color: "red",
        icon: AlertTriangle
      }
    }
  }

  const status = getRequirementStatus()

  // Group missing fields by category for better display
  const categorizeFields = (fields: string[]) => {
    const categories = {
      basic: [] as string[],
      company: [] as string[],
      location: [] as string[],
      contact: [] as string[],
      social: [] as string[]
    }

    fields.forEach(field => {
      const fieldLower = field.toLowerCase()
      if (fieldLower.includes('name') || fieldLower.includes('email') || fieldLower.includes('phone')) {
        categories.basic.push(field)
      } else if (fieldLower.includes('company') || fieldLower.includes('industry') || fieldLower.includes('team') || fieldLower.includes('founded') || fieldLower.includes('about') || fieldLower.includes('logo') || fieldLower.includes('website')) {
        categories.company.push(field)
      } else if (fieldLower.includes('location') || fieldLower.includes('city') || fieldLower.includes('country')) {
        categories.location.push(field)
      } else if (fieldLower.includes('contact')) {
        categories.contact.push(field)
      } else if (fieldLower.includes('linkedin') || fieldLower.includes('facebook') || fieldLower.includes('twitter')) {
        categories.social.push(field)
      } else {
        categories.basic.push(field)
      }
    })

    return categories
  }

  const categorizedFields = categorizeFields(missingFields)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <status.icon className={`h-6 w-6 ${
              status.color === 'green' ? 'text-green-500' : 'text-red-500'
            }`} />
            <DialogTitle>{status.title}</DialogTitle>
          </div>
          <DialogDescription>{status.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-3"
            />
            <div className="text-sm text-muted-foreground">
              {profileComplete 
                ? '✅ Profile completion: 80%+ ✓'
                : `❌ Profile completion: Need ${remainingPercentage}% more`
              }
            </div>
          </div>

          {/* Company Info Display */}
          {companyName && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {companyName}
                </span>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${
            canPostJob 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                canPostJob ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                <status.icon className={`h-4 w-4 ${
                  canPostJob ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {canPostJob ? 'Ready to Post Jobs' : 'Profile Requirements Not Met'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {canPostJob 
                    ? 'Your company profile has all the required information for job posting.'
                    : 'Complete your company profile to unlock job posting capabilities.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Missing Fields Display */}
          {!canPostJob && missingFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Missing Information:</h4>
              
              {categorizedFields.basic.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h5>
                  <div className="flex flex-wrap gap-1">
                    {categorizedFields.basic.map((field, index) => (
                      <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedFields.company.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Details</h5>
                  <div className="flex flex-wrap gap-1">
                    {categorizedFields.company.map((field, index) => (
                      <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedFields.location.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</h5>
                  <div className="flex flex-wrap gap-1">
                    {categorizedFields.location.map((field, index) => (
                      <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedFields.contact.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact Information</h5>
                  <div className="flex flex-wrap gap-1">
                    {categorizedFields.contact.map((field, index) => (
                      <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {categorizedFields.social.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Social Links</h5>
                  <div className="flex flex-wrap gap-1">
                    {categorizedFields.social.map((field, index) => (
                      <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {canPostJob ? (
            <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
              Continue Posting Job
            </Button>
          ) : (
            <Button onClick={onCompleteProfile} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Complete Company Profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
