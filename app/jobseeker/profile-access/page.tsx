import ProfileAccessClient from "./ProfileAccessClient"

type ProfileAccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProfileAccessPage({ searchParams }: ProfileAccessPageProps) {
  const params = (await searchParams) || {}
  const tokenParam = params.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  return <ProfileAccessClient token={token ?? null} />
}
