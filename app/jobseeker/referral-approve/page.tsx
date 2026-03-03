import ReferralApproveClient from "./ReferralApproveClient"

type ReferralApprovePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReferralApprovePage({ searchParams }: ReferralApprovePageProps) {
  const params = (await searchParams) || {}
  const tokenParam = params.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  return <ReferralApproveClient token={token ?? null} />
}

