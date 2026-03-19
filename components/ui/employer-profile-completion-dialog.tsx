"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, FileText, ExternalLink, AlertTriangle } from "lucide-react"

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
  companyName,
  onCompleteProfile,
  missingFields: _missingFields, // Kept for API compatibility, not displayed
}: EmployerProfileCompletionDialogProps) {
  const remainingPercentage = 80 - completionPercentage
  const profileComplete = completionPercentage >= 80

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
