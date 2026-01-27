"use client"

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AlertTriangle, Phone, Mail } from "lucide-react"

interface BlockedUserPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function BlockedUserPopup({ isOpen, onClose }: BlockedUserPopupProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl text-red-600">
              Account Blocked
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700 text-base">
            Your account has been blocked by the administrator. You will not be able to access the platform until your account is unblocked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-gray-50 rounded-lg p-4 my-4">
          <h4 className="font-semibold text-gray-800 mb-2">What can you do?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Contact our support team for assistance</li>
            <li>• Check your email for any notifications</li>
            <li>• Wait for your account to be reviewed</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Mail className="w-4 h-4" />
              <span>support@findr.com</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Phone className="w-4 h-4" />
              <span>+971 4 123 4567</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
