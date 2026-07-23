// Utility functions for profile completion calculation

import {
  calculateJobseekerProfileCompletion,
  hasResume as checkHasResume,
  type JobseekerProfileInput,
  type ProfileCompletionResult as WeightedResult,
} from "@/lib/jobseeker-profile-completion"

export interface ProfileCompletionResult {
  percentage: number
  points: number
  completedFields: number
  totalFields: number
  missingFields: string[]
  hasResume: boolean
  canApply: boolean
}

function toLegacyResult(
  weighted: WeightedResult,
  profile: JobseekerProfileInput
): ProfileCompletionResult {
  const applicationPoints = profile?.rewards?.applyForJobs ?? 0
  const rmServicePoints = profile?.rewards?.rmService ?? 0
  const socialMediaBonus = profile?.rewards?.socialMediaBonus ?? 0
  const referralPoints = profile?.rewards?.referFriend ?? 0
  const deductedPoints = profile?.deductedPoints ?? 0
  const totalPoints =
    weighted.profilePoints +
    applicationPoints +
    rmServicePoints +
    socialMediaBonus +
    referralPoints
  const availablePoints = Math.max(0, totalPoints - deductedPoints)

  return {
    percentage: weighted.percentage,
    points: availablePoints,
    completedFields: weighted.percentage,
    totalFields: 100,
    missingFields: weighted.missingFields,
    hasResume: weighted.hasResume,
    canApply: weighted.canApply,
  }
}

export function calculateProfileCompletion(profile: any): ProfileCompletionResult {
  const weighted = calculateJobseekerProfileCompletion(profile as JobseekerProfileInput)
  return toLegacyResult(weighted, profile)
}

export function isEligibleToApply(profileCompletionResult: ProfileCompletionResult): boolean {
  return profileCompletionResult.canApply
}

export function isEligibleToApplyByPercentage(profileCompletionPercentage: number): boolean {
  return profileCompletionPercentage >= 80
}

export function getCompletionTier(percentage: number): string {
  // Legacy helper — jobseeker membership is salary-based (see jobseeker-membership.ts)
  if (percentage >= 90) return "Elite"
  if (percentage >= 80) return "Pro"
  if (percentage >= 60) return "Plus"
  return "Prime"
}

export function hasValidResume(profile: any): boolean {
  return checkHasResume(profile as JobseekerProfileInput)
}

export function getResumeValidationMessage(profile: any): string {
  if (hasValidResume(profile)) {
    return "✅ Resume uploaded successfully"
  }
  return "❌ Resume is required - please upload your resume document"
}

export function getCompletionMessage(completionResult: ProfileCompletionResult): string {
  const { percentage, hasResume, canApply } = completionResult

  if (canApply) {
    return "Great! Your profile is complete and you have uploaded your resume. You can apply for jobs."
  }
  if (!hasResume && percentage >= 80) {
    return "Your profile is 80%+ complete, but you need to upload your resume to apply for jobs."
  }
  if (hasResume && percentage < 80) {
    return `You have uploaded your resume, but need ${80 - percentage}% more profile completion to apply for jobs.`
  }
  if (!hasResume && percentage < 80) {
    return `You need ${80 - percentage}% more profile completion AND must upload your resume to apply for jobs.`
  }
  return `Complete ${80 - percentage}% more of your profile and upload your resume to apply for jobs.`
}
