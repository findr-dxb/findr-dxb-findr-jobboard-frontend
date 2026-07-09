export const FINDR_STARS_UPDATED_EVENT = "findr-stars-updated"
export const FINDR_STARS_STORAGE_KEY = "findr-stars-last-updated"

export interface FindrStarEntry {
  id?: string
  name: string
  profilePicture?: string
  points: number
  appreciationMessage: string
}

export interface FindrStarsData {
  jobseekers: FindrStarEntry[]
  employers: FindrStarEntry[]
}

export function notifyFindrStarsUpdated(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(FINDR_STARS_STORAGE_KEY, Date.now().toString())
  window.dispatchEvent(new CustomEvent(FINDR_STARS_UPDATED_EVENT))
}

export async function fetchFindrStars(): Promise<FindrStarsData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return { jobseekers: [], employers: [] }
  }

  const response = await fetch(`${apiUrl}/stars`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Findr Stars (${response.status})`)
  }

  const result = await response.json()
  if (!result?.success || !result?.data) {
    return { jobseekers: [], employers: [] }
  }

  return {
    jobseekers: result.data.jobseekers || [],
    employers: result.data.employers || [],
  }
}
