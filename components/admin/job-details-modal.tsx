"use client"

import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Simple field row used inside the modal
function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  )
}

// Format salary text in a simple way
function getSalaryText(job: any) {
  if (job.salary) {
    return Number(job.salary).toLocaleString()
  }

  const min = job.minimumSalary
  const max = job.maximumSalary

  if (min || max) {
    return `${Number(min || 0).toLocaleString()} - ${Number(max || 0).toLocaleString()}`
  }

  return "-"
}

// Format a date, or show "-"
function getDateText(value?: string) {
  if (!value || value === "N/A") return "-"
  return new Date(value).toLocaleDateString()
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  error: string
  job: any
}

export function JobDetailsModal({ open, onOpenChange, loading, error, job }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Post Details</DialogTitle>
          <DialogDescription>Full information about this job posting</DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size={28} />
            <span className="ml-3 text-gray-600">Loading job...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Job info */}
        {!loading && job && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Job Title" value={job.jobTitle} />
              <Field label="Company" value={job.companyName} />
              <Field label="Location" value={job.location} />
              <Field label="Job Type" value={job.jobType} />
              <Field label="Experience" value={job.experienceLevel} />
              <Field label="Nationality" value={job.nationality} />
              <Field label="Salary (AED)" value={getSalaryText(job)} />
              <Field label="Status" value={job.status} />
              <Field label="Application Deadline" value={getDateText(job.applicationDeadline)} />
              <Field label="Views" value={job.views ?? 0} />
              <Field label="Posted Date" value={getDateText(job.postedDate)} />
              <Field label="Employer Email" value={job.employerInfo?.email || "-"} />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description || "No description"}
              </p>
            </div>

            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, index: number) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Requirements</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {job.requirements.map((item: string, index: number) => (
                    <li key={`req-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Benefits</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {job.benefits.map((item: string, index: number) => (
                    <li key={`benefit-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
