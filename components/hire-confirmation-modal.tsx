import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Briefcase, MapPin, TrendingUp } from "lucide-react";

interface HireConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  profilePicture?: string;
  jobTitle: string;
  location?: string;
  expectedSalary?: number | { min?: number; max?: number };
  onConfirm: () => void;
}

export function HireConfirmationModal({
  isOpen,
  onOpenChange,
  applicantName,
  profilePicture,
  jobTitle,
  location,
  expectedSalary,
  onConfirm,
}: HireConfirmationModalProps) {
  
  const formatSalary = (salary?: number | { min?: number; max?: number }) => {
    if (!salary) return 'Not Specified';
    if (typeof salary === 'number') {
      return `AED ${salary.toLocaleString()}`;
    }
    if (typeof salary === 'object') {
      const min = salary.min;
      const max = salary.max;
      if (min !== undefined && max !== undefined) {
        return `AED ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      if (min !== undefined) return `AED ${min.toLocaleString()}`;
      if (max !== undefined) return `AED ${max.toLocaleString()}`;
    }
    return 'Not Specified';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/10 to-blue-50/10 p-0 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-bl-full pointer-events-none"></div>
        
        <DialogHeader className="p-6 pb-4 border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-blue-50/30">
          <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
            Finalize Hiring
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm hiring candidate {applicantName}
          </DialogDescription>
        </DialogHeader>

        {/* Candidate Details Card inside Dialog */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-emerald-100/40 shadow-sm">
            {profilePicture ? (
              <div className="w-14 h-14 rounded-full ring-2 ring-emerald-100 shadow-sm overflow-hidden">
                <img 
                  src={profilePicture} 
                  alt={applicantName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm ring-2 ring-emerald-100">
                {applicantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-gray-900 truncate">
                {applicantName}
              </h4>
              <p className="text-sm font-medium text-emerald-600 truncate flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                {jobTitle}
              </p>
            </div>
          </div>

          {/* Location and Salary info */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white border border-emerald-100/30 shadow-sm">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                Location
              </span>
              <span className="font-medium text-gray-700 truncate block">
                {location || 'Not Specified'}
              </span>
            </div>
            
            <div className="p-3 rounded-xl bg-white border border-emerald-100/30 shadow-sm">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Closing Salary
              </span>
              <span className="font-semibold text-emerald-600 truncate block">
                {formatSalary(expectedSalary)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-gray-50/50 border-t border-emerald-100/30 gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg animate-transition"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md font-semibold rounded-lg border-none"
          >
            Confirm Hire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
