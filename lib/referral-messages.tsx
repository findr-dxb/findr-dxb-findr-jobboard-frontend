import type { ReactNode } from "react"

export const REFERRAL_REWARD_ELIGIBILITY_LINES = [
  "You will receive reward points for this referral only if the candidate joins the company within 3 months of your referral.",
  "Once the candidate successfully joins within this period, you will be eligible to receive the applicable reward points.",
] as const

export function referralSubmittedToastContent(params: {
  candidateName: string
  jobTitle: string
  companyName: string
}): { title: string; description: ReactNode } {
  const { candidateName, jobTitle, companyName } = params
  return {
    title: `${candidateName} referred for "${jobTitle}" at ${companyName}. Approval link sent.`,
    description: (
      <div className="space-y-2">
        {REFERRAL_REWARD_ELIGIBILITY_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    ),
  }
}
