/**
 * Weighted jobseeker profile completion (total 100%).
 * Keep in sync with Techno-backend-master/utils/jobseekerProfileCompletion.js
 */

export type JobseekerProfileInput = {
  fullName?: string
  name?: string
  email?: string
  phoneNumber?: string
  location?: string
  dateOfBirth?: string | Date | null
  nationality?: string
  professionalSummary?: string
  visaExpiryDate?: string | Date | null
  profilePicture?: string
  introVideo?: string
  resumeDocument?: string
  resumeUrl?: string
  resume?: boolean | string
  skills?: string[] | string
  certifications?: string[] | string
  documents?: Array<{ url?: string; name?: string; type?: string }>
  professionalExperience?: Array<{
    currentRole?: string
    company?: string
    yearsOfExperience?: number | string
    industry?: string
  }>
  education?: Array<{
    highestDegree?: string
    institution?: string
    yearOfGraduation?: number | string
    gradeCgpa?: string
  }>
  jobPreferences?: {
    salaryExpectation?: string
    preferredJobType?: string[] | string
    preferredLocation?: string
    availability?: string
    resumeAndDocs?: string[]
  }
  socialLinks?: {
    linkedIn?: string
    linkedin?: string
    instagram?: string
    twitterX?: string
    twitter?: string
  }
  rewards?: {
    applyForJobs?: number
    rmService?: number
    socialMediaBonus?: number
    referFriend?: number
  }
  deductedPoints?: number
  emirateId?: string
  passportNumber?: string
}

export type ProfileCompletionResult = {
  percentage: number
  missingFields: string[]
  hasResume: boolean
  canApply: boolean
  profilePoints: number
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim() !== ""
  if (typeof value === "number") return true
  if (typeof value === "boolean") return value
  if (Array.isArray(value)) return value.length > 0
  return false
}

function sectionScore(
  checks: { label: string; ok: boolean }[],
  weight: number,
  missingLabel: string
): { score: number; missing: string[] } {
  if (!checks.length) return { score: 0, missing: [] }
  const filled = checks.filter((c) => c.ok).length
  const missing = checks.filter((c) => !c.ok).map((c) => c.label)
  const score = (filled / checks.length) * weight
  return {
    score,
    missing: missing.length ? [`${missingLabel}: ${missing.join(", ")}`] : [],
  }
}

export function hasResume(user: JobseekerProfileInput): boolean {
  return (
    isFilled(user.resumeDocument) ||
    isFilled(user.resumeUrl) ||
    isFilled(user.resume) ||
    (user.jobPreferences?.resumeAndDocs?.length ?? 0) > 0
  )
}

function hasAdditionalDocuments(user: JobseekerProfileInput): boolean {
  const docs = user.jobPreferences?.resumeAndDocs || []
  const hasExtraDocs = docs.length > 0 || (user.documents?.length ?? 0) > 0
  const hasCertifications =
    (Array.isArray(user.certifications) && user.certifications.length > 0) ||
    (typeof user.certifications === "string" && user.certifications.trim() !== "")
  return hasExtraDocs || hasCertifications
}

function isNonEmirati(nationality?: string): boolean {
  if (!nationality) return false
  const n = nationality.toLowerCase()
  return !n.includes("emirati")
}

/** Map nested profile page state to API-shaped input for completion calc */
export function profilePageDataToCompletionInput(data: {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    dateOfBirth: string
    nationality: string
    summary: string
    visaExpiryDate: string
    emiratesId?: string
    passportNumber?: string
  }
  experience: {
    currentRole: string
    company: string
    experience: string
    industry: string
    currentSalary: string
  }
  education: { degree: string; institution: string; year: string; grade: string }
  skills: string
  certifications: string
  preferences: {
    jobType: string
    preferredLocation: string
    availability: string
  }
  profilePicture: string
  introVideo: string
  resumeDocument: string
  resume: boolean
  documents: unknown[]
  socialLinks: { linkedin: string; instagram: string; twitter: string }
}): JobseekerProfileInput {
  const expYears =
    data.experience.experience === "0-1"
      ? 1
      : data.experience.experience === "2-3"
        ? 3
        : data.experience.experience === "4-6"
          ? 6
          : data.experience.experience === "7-10"
            ? 10
            : data.experience.experience === "10+"
              ? 11
              : data.experience.experience
                ? Number(data.experience.experience) || undefined
                : undefined

  return {
    fullName: data.personalInfo.fullName,
    email: data.personalInfo.email,
    phoneNumber: data.personalInfo.phone,
    location: data.personalInfo.location,
    dateOfBirth: data.personalInfo.dateOfBirth,
    nationality: data.personalInfo.nationality,
    professionalSummary: data.personalInfo.summary,
    visaExpiryDate: data.personalInfo.visaExpiryDate,
    emirateId: data.personalInfo.emiratesId,
    passportNumber: data.personalInfo.passportNumber,
    profilePicture: data.profilePicture,
    introVideo: data.introVideo,
    resumeDocument: data.resumeDocument,
    resume: data.resume,
    skills: data.skills,
    certifications: data.certifications,
    documents: data.documents as JobseekerProfileInput["documents"],
    professionalExperience: [
      {
        currentRole: data.experience.currentRole,
        company: data.experience.company,
        yearsOfExperience: expYears,
        industry: data.experience.industry,
      },
    ],
    education: [
      {
        highestDegree: data.education.degree,
        institution: data.education.institution,
        yearOfGraduation: data.education.year,
        gradeCgpa: data.education.grade,
      },
    ],
    jobPreferences: {
      salaryExpectation: data.experience.currentSalary,
      preferredJobType: data.preferences.jobType ? [data.preferences.jobType] : [],
      preferredLocation: data.preferences.preferredLocation,
      availability: data.preferences.availability,
      resumeAndDocs: data.documents
        .map((d: unknown) => (typeof d === "object" && d && "url" in d ? (d as { url: string }).url : ""))
        .filter(Boolean),
    },
    socialLinks: {
      linkedIn: data.socialLinks.linkedin,
      instagram: data.socialLinks.instagram,
      twitterX: data.socialLinks.twitter,
    },
  }
}

export function calculateJobseekerProfileCompletion(
  user: JobseekerProfileInput
): ProfileCompletionResult {
  const missingFields: string[] = []
  let percentage = 0

  const nationality = user.nationality || ""
  const personalChecks = [
    { label: "Full Name", ok: isFilled(user.fullName || user.name) },
    { label: "Email", ok: isFilled(user.email) },
    { label: "Phone Number", ok: isFilled(user.phoneNumber) },
    { label: "Location", ok: isFilled(user.location) },
    { label: "Date of Birth", ok: isFilled(user.dateOfBirth) },
    { label: "Nationality", ok: isFilled(user.nationality) },
    { label: "Emirates ID", ok: isFilled(user.emirateId) },
    { label: "Passport Number", ok: isFilled(user.passportNumber) },
    { label: "Professional Summary", ok: isFilled(user.professionalSummary) },
  ]
  if (isNonEmirati(nationality)) {
    personalChecks.push({
      label: "Visa Expiry Date",
      ok: isFilled(user.visaExpiryDate),
    })
  }

  const personal = sectionScore(personalChecks, 25, "Personal Information")
  percentage += personal.score
  missingFields.push(...personal.missing)

  if (isFilled(user.profilePicture)) {
    percentage += 10
  } else {
    missingFields.push("Profile Picture")
  }

  const exp = user.professionalExperience?.[0] || {}
  const professional = sectionScore(
    [
      { label: "Current Role", ok: isFilled(exp.currentRole) },
      { label: "Company", ok: isFilled(exp.company) },
      { label: "Years of Experience", ok: isFilled(exp.yearsOfExperience) },
      { label: "Industry", ok: isFilled(exp.industry) },
      {
        label: "Current Salary",
        ok: isFilled(user.jobPreferences?.salaryExpectation),
      },
    ],
    15,
    "Professional Information"
  )
  percentage += professional.score
  missingFields.push(...professional.missing)

  const edu = user.education?.[0] || {}
  const education = sectionScore(
    [
      { label: "Highest Degree", ok: isFilled(edu.highestDegree) },
      { label: "Institution", ok: isFilled(edu.institution) },
      { label: "Year of Graduation", ok: isFilled(edu.yearOfGraduation) },
      { label: "Grade/CGPA", ok: isFilled(edu.gradeCgpa) },
    ],
    10,
    "Education"
  )
  percentage += education.score
  missingFields.push(...education.missing)

  if (hasResume(user)) {
    percentage += 10
  } else {
    missingFields.push("Resume Upload")
  }

  if (hasAdditionalDocuments(user)) {
    percentage += 5
  } else {
    missingFields.push("Additional Documents")
  }

  if (isFilled(user.introVideo)) {
    percentage += 5
  } else {
    missingFields.push("Introductory Video")
  }

  const social = user.socialLinks || {}
  if (isFilled(social.linkedIn || social.linkedin)) percentage += 4
  else missingFields.push("LinkedIn URL")
  if (isFilled(social.instagram)) percentage += 4
  else missingFields.push("Instagram URL")
  if (isFilled(social.twitterX || social.twitter)) percentage += 2
  else missingFields.push("Twitter URL")

  const skillsOk =
    (Array.isArray(user.skills) && user.skills.length > 0) ||
    (typeof user.skills === "string" && user.skills.trim() !== "")
  if (skillsOk) percentage += 5
  else missingFields.push("Skills")

  const prefs = user.jobPreferences || {}
  const preferredJobType = prefs.preferredJobType
  const jobTypeOk = Array.isArray(preferredJobType)
    ? preferredJobType.length > 0
    : isFilled(preferredJobType)

  const prefChecks = [
    { label: "Preferred Job Type", ok: jobTypeOk },
    { label: "Preferred Location", ok: isFilled(prefs.preferredLocation) },
    { label: "Availability", ok: isFilled(prefs.availability) }
  ]

  const prefScore = sectionScore(prefChecks, 5, "Job Preferences")
  percentage += prefScore.score
  missingFields.push(...prefScore.missing)

  const rounded = Math.min(Math.round(percentage), 100)
  const resume = hasResume(user)

  return {
    percentage: rounded,
    missingFields,
    hasResume: resume,
    canApply: rounded >= 80 && resume,
    profilePoints: 50 + rounded * 2,
  }
}
