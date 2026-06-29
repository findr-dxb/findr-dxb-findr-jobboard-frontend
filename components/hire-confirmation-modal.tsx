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
  onConfirm: (hiredDetails: { jobTitle: string; location: string; closingSalary: string }) => void;
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
  const [editedJobTitle, setEditedJobTitle] = React.useState(jobTitle);
  const [editedLocation, setEditedLocation] = React.useState(location || "");
  const [editedSalary, setEditedSalary] = React.useState("");

  const formatInitialSalary = (salary?: number | { min?: number; max?: number }) => {
    if (!salary) return '';
    if (typeof salary === 'number') {
      return salary.toString();
    }
    if (typeof salary === 'object') {
      const min = salary.min;
      const max = salary.max;
      if (min !== undefined && max !== undefined) {
        return `${min} - ${max}`;
      }
      if (min !== undefined) return min.toString();
      if (max !== undefined) return max.toString();
    }
    return '';
  };

  // Synchronize state when modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      setEditedJobTitle(jobTitle);
      setEditedLocation(location || "");
      setEditedSalary(formatInitialSalary(expectedSalary));
    }
  }, [isOpen, jobTitle, location, expectedSalary]);

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
              <div className="w-14 h-14 rounded-full ring-2 ring-emerald-100 shadow-sm overflow-hidden flex-shrink-0">
                <img 
                  src={profilePicture} 
                  alt={applicantName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm ring-2 ring-emerald-100 flex-shrink-0">
                {applicantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base text-gray-900 truncate">
                {applicantName}
              </h4>
              <div className="mt-1 flex items-center gap-1.5 w-full">
                <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={editedJobTitle}
                  onChange={(e) => setEditedJobTitle(e.target.value)}
                  className="w-full text-sm font-medium text-emerald-600 bg-emerald-50/20 border border-emerald-100/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all"
                  placeholder="Hired Position / Job Title"
                />
              </div>
            </div>
          </div>

          {/* Location and Salary info */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white border border-emerald-100/30 shadow-sm">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                Location
              </span>
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                className="w-full text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all"
                placeholder="Noida, Uttar Pradesh"
              />
            </div>
            
            <div className="p-3 rounded-xl bg-white border border-emerald-100/30 shadow-sm">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Closing Salary
              </span>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-emerald-400 focus-within:bg-white transition-all">
                <span className="text-sm font-semibold text-emerald-600">AED</span>
                <input
                  type="text"
                  value={editedSalary}
                  onChange={(e) => setEditedSalary(e.target.value)}
                  className="w-full text-sm font-semibold text-emerald-600 bg-transparent border-none p-0 focus:outline-none focus:ring-0 transition-all"
                  placeholder="e.g. 122222"
                />
              </div>
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
            onClick={() => onConfirm({
              jobTitle: editedJobTitle,
              location: editedLocation,
              closingSalary: editedSalary
            })} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md font-semibold rounded-lg border-none"
          >
            Confirm Hire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
