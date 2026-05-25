import { redirect } from "next/navigation"

type JobLinkPageProps = {
  params: Promise<{ id: string }>
}

/**
 * Public job links from emails use /jobs/:id — redirect to the job details page.
 */
export default async function JobLinkPage({ params }: JobLinkPageProps) {
  const { id } = await params

  if (!id) {
    redirect("/jobseeker/search")
  }

  redirect(`/jobseeker/search/${id}`)
}
