"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ReferResponsiblyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ReferResponsiblyDialog({
  open,
  onOpenChange,
  onConfirm,
}: ReferResponsiblyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg z-[100]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start gap-2 text-left">
            <span aria-hidden>⚠️</span>
            Please Refer Responsibly
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left text-sm text-gray-600">
              <p>
                Before referring a candidate for a job, please carefully review the job requirements
                and ensure that the candidate&apos;s profile is relevant to the opportunity.
              </p>
              <p>
                If you share or refer more than 5 irrelevant CVs, your referral privileges may be
                restricted and your account may be blocked from the Findr platform.
              </p>
              <p>
                Please refer candidates responsibly and only when their skills and experience are a
                good match for the job.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            I understand, continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
