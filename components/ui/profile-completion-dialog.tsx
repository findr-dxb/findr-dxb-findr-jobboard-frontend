"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, User, FileText, GraduationCap, Briefcase, Settings, ExternalLink, Upload, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface ProfileCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completionPercentage: number
  hasResume: boolean
  canApply: boolean
  missingFields: string[]
  onCompleteProfile: () => void
}

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  completionPercentage,
  hasResume,
  canApply,
  missingFields,
  onCompleteProfile
}: ProfileCompletionDialogProps) {
  const remainingPercentage = 80 - completionPercentage
  const profileComplete = completionPercentage >= 80

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getRequirementStatus = () => {
    if (canApply) {
      return {
        title: "Ready to Apply!",
        message: "Your profile meets all requirements for job applications.",
        color: "green",
        icon: FileText
      }
    } else if (!hasResume && profileComplete) {
      return {
        title: "Resume Required",
        message: "Your profile is 80%+ complete, but you must upload your resume to apply for jobs.",
        color: "red",
        icon: Upload
      }
    } else if (hasResume && !profileComplete) {
      return {
        title: "Complete Your Profile",
        message: `You have a resume, but need ${remainingPercentage}% more profile completion to apply.`,
        color: "orange",
        icon: User
      }
    } else {
      return {
        title: "Profile Incomplete",
        message: `You need ${remainingPercentage}% more completion AND must upload your resume.`,
        color: "red",
        icon: AlertTriangle
      }
    }
  }

  const status = getRequirementStatus()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <status.icon className={`h-6 w-6 ${
              status.color === 'green' ? 'text-green-500' : 
              status.color === 'orange' ? 'text-orange-500' : 'text-red-500'
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
            <div className="text-sm text-muted-foreground">
              {hasResume 
                ? '✅ Resume uploaded ✓'
                : '❌ Resume required for job applications'
              }
            </div>
          </div>

          {/* Resume Requirement Card */}
          {!hasResume && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <Upload className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-red-800 dark:text-red-200">
                    Resume Required
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    You must upload your resume to apply for jobs. The resume should be stored in the resumeDocument field.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${
            canApply 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                canApply ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'
              }`}>
                <status.icon className={`h-4 w-4 ${
                  canApply ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {canApply ? 'Ready to Apply' : 'Requirements Not Met'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {canApply 
                    ? 'Your profile has all the required information and resume for job applications.'
                    : 'Complete your profile and upload your resume to unlock job applications.'
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
          {canApply ? (
            <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700">
              Continue Application
            </Button>
          ) : (
            <Button onClick={onCompleteProfile} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              {!hasResume ? 'Upload Resume & Complete Profile' : 'Complete Profile'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
