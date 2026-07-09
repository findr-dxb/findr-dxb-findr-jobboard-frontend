"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  MoreVertical,
  MousePointerClick,
  Phone,
  SquarePlus,
  Users,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface RmPostingRequestEmployer {
  _id: string
  name?: string
  companyName?: string
  email?: string
  companyEmail?: string
  phoneNumber?: string
  industry?: string
  teamSize?: string
  companyLogo?: string
  points?: number
  jobPostingLimit?: number
  jobPostingGrantExpiresAt?: string | null
  jobPostingGrantedAt?: string | null
  contactPerson?: {
    name?: string
    email?: string
    phone?: string
  }
  socialLinks?: {
    linkedin?: string
  }
}

export interface RmPostingRequest {
  _id: string
  employerId?: RmPostingRequestEmployer
  employerName: string
  companyName: string
  employerEmail: string
  query: string
  status: "connect_clicked" | "query_submitted" | "posting_provided"
  clickedAt: string
  submittedAt?: string | null
  postingsGranted?: number | null
  grantExpiresAt?: string | null
  postingProvidedAt?: string | null
  createdAt: string
}

type RmPostingRequestCardProps = {
  request: RmPostingRequest
  onViewQuery: (request: RmPostingRequest) => void
  onViewDetails: (request: RmPostingRequest) => void
  onProvidePosting: (request: RmPostingRequest) => void
  isProviding?: boolean
}

function formatTeamSize(size?: string) {
  if (!size) return null

  const labels: Record<string, string> = {
    "0-50": "0-50 Employees",
    "51-250": "51-250 Employees",
    "251-500": "251-500 Employees",
    "500+": "500+ Employees",
  }

  return labels[size] || `${size} Employees`
}

function formatShortDate(dateString?: string | null) {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function isGrantActive(request: RmPostingRequest) {
  const expiresAt =
    request.grantExpiresAt || request.employerId?.jobPostingGrantExpiresAt
  if (!expiresAt || !request.postingProvidedAt) return false
  return new Date(expiresAt) > new Date()
}

function RequestStatusBadge({ request }: { request: RmPostingRequest }) {
  const hasSubmittedQuery = Boolean(
    request.submittedAt || request.status === "query_submitted"
  )

  return (
    <>
      {hasSubmittedQuery ? (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
          <MessageSquare className="h-3 w-3 mr-1" />
          Query Submitted
        </Badge>
      ) : (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
          <MousePointerClick className="h-3 w-3 mr-1" />
          Connect Only
        </Badge>
      )}
      {request.postingProvidedAt ? (
        <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Posting Provided
        </Badge>
      ) : null}
    </>
  )
}

function getContactDetails(request: RmPostingRequest) {
  const employer = request.employerId
  const contactPerson = employer?.contactPerson

  // Contact Person section uses HR/contact or company details — not login account email.
  return {
    name: contactPerson?.name?.trim() || "—",
    email:
      contactPerson?.email?.trim() ||
      employer?.companyEmail?.trim() ||
      "—",
    phone:
      contactPerson?.phone?.trim() ||
      employer?.phoneNumber?.trim() ||
      "—",
    linkedin: employer?.socialLinks?.linkedin?.trim() || "",
  }
}

export function RmPostingRequestCard({
  request,
  onViewQuery,
  onViewDetails,
  onProvidePosting,
  isProviding = false,
}: RmPostingRequestCardProps) {
  const employer = request.employerId
  const companyName =
    request.companyName || employer?.companyName || request.employerName || "Employer"
  const industry = employer?.industry?.trim()
  const teamSize = formatTeamSize(employer?.teamSize)
  const points = employer?.points ?? 0
  const contact = getContactDetails(request)
  const hasQuery =
    Boolean(request.submittedAt || request.status === "query_submitted") &&
    Boolean(request.query?.trim())
  const isConnectOnly = !request.submittedAt && request.status !== "query_submitted"
  const grantActive = isGrantActive(request)
  const activeSlots = employer?.jobPostingLimit ?? request.postingsGranted ?? 0
  const grantExpiry =
    request.grantExpiresAt || request.employerId?.jobPostingGrantExpiresAt

  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        grantActive
          ? "border-sky-200 ring-1 ring-sky-100"
          : hasQuery
            ? "border-emerald-200 ring-1 ring-emerald-100"
            : "border-amber-100 ring-1 ring-amber-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
          {employer?.companyLogo ? (
            <Image
              src={employer.companyLogo}
              alt={`${companyName} logo`}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {companyName}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <RequestStatusBadge request={request} />
                {industry ? (
                  <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {industry}
                  </span>
                ) : null}
                {teamSize ? (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    {teamSize}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Points</p>
                <p className="text-2xl font-bold leading-none text-emerald-600">
                  {points}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onViewQuery(request)}
                disabled={isConnectOnly}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                  hasQuery
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                }`}
                aria-label={hasQuery ? "View employer query" : "No query submitted"}
              >
                <Mail className="h-4 w-4" />
                {hasQuery ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
                    1
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Contact Person
          </p>
          {contact.linkedin ? (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              LinkedIn
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>

        <p className="font-semibold text-slate-900">{contact.name}</p>

        <div className="mt-2 space-y-1.5 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{contact.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{contact.phone}</span>
          </p>
        </div>

        {hasQuery ? (
          <p className="mt-3 line-clamp-2 border-t border-slate-200 pt-3 text-sm text-slate-700">
            {request.query}
          </p>
        ) : (
          <p className="mt-3 border-t border-slate-200 pt-3 text-sm italic text-amber-700/80">
            Clicked connect — no query submitted yet
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Button
          className="gradient-bg h-11 flex-1 rounded-lg text-white hover:opacity-95"
          onClick={() => onProvidePosting(request)}
          disabled={isProviding || grantActive}
        >
          {isProviding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SquarePlus className="mr-2 h-4 w-4" />
          )}
          {grantActive
            ? `${activeSlots} slot${activeSlots === 1 ? "" : "s"} until ${formatShortDate(grantExpiry)}`
            : "Provide Posting"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-lg"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onViewQuery(request)}
              disabled={isConnectOnly}
            >
              View query
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails(request)}>
              View details
            </DropdownMenuItem>
            {employer?._id ? (
              <DropdownMenuItem asChild>
                <a href={`/admin/users/employer/${employer._id}`}>
                  Open employer profile
                </a>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}
