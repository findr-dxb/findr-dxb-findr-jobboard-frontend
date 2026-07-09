"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, Briefcase, Star, Award, Trophy, Loader2 } from "lucide-react"
import {
  fetchFindrStars,
  FINDR_STARS_STORAGE_KEY,
  FINDR_STARS_UPDATED_EVENT,
  type FindrStarEntry,
} from "@/lib/findr-stars"

function StarCard({
  star,
  index,
  variant,
}: {
  star: FindrStarEntry
  index: number
  variant: "jobseeker" | "employer"
}) {
  const isJobseeker = variant === "jobseeker"
  const initials = star.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <Card
      key={star.id || `${star.name}-${index}`}
      className={`rounded-2xl shadow bg-gradient-to-br ${
        isJobseeker ? "from-emerald-50 to-white" : "from-purple-50 to-white"
      } border-0 w-full max-w-xs flex flex-col items-center relative overflow-hidden group hover:shadow-lg transition-all duration-300`}
    >
      <div
        className={`absolute top-3 right-3 flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
          isJobseeker
            ? "bg-emerald-100 text-emerald-800 border-emerald-200/55"
            : "bg-purple-100 text-purple-800 border-purple-200/55"
        }`}
      >
        <Star
          className={`w-3.5 h-3.5 ${
            isJobseeker ? "fill-emerald-500 text-emerald-500" : "fill-purple-500 text-purple-500"
          }`}
        />
        <span>#{index + 1}</span>
      </div>
      <CardHeader className="flex flex-col items-center pt-8 pb-2">
        <div className="relative mb-2">
          {star.profilePicture ? (
            <img
              src={star.profilePicture}
              alt={star.name}
              className={`w-16 h-16 rounded-full object-cover border-2 group-hover:scale-105 transition-transform duration-300 ${
                isJobseeker ? "border-emerald-200" : "border-purple-200 bg-white"
              }`}
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 text-xl font-bold group-hover:scale-105 transition-transform duration-300 shadow-inner ${
                isJobseeker
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                  : "bg-purple-50 border-purple-100 text-purple-600"
              }`}
            >
              {initials}
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 text-white p-0.5 rounded-full shadow-md ${
              isJobseeker ? "bg-emerald-500" : "bg-purple-500"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center px-6 pb-8 flex-grow justify-between w-full">
        <div className="flex flex-col items-center text-center">
          <p className="text-gray-600 mb-3 italic text-center text-sm line-clamp-3">
            &ldquo;{star.appreciationMessage}&rdquo;
          </p>
          <div
            className={`text-sm text-gray-800 font-semibold transition-colors ${
              isJobseeker ? "group-hover:text-emerald-600" : "group-hover:text-purple-600"
            }`}
          >
            {star.name}
          </div>
        </div>
        <div
          className={`mt-3 flex items-center justify-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isJobseeker
              ? "bg-emerald-100/50 text-emerald-800"
              : "bg-purple-100/50 text-purple-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-ping ${
              isJobseeker ? "bg-emerald-500" : "bg-purple-500"
            }`}
          />
          <span>{star.points} Activity Points</span>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ variant }: { variant: "jobseeker" | "employer" }) {
  const isJobseeker = variant === "jobseeker"

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed min-h-[220px] ${
        isJobseeker
          ? "bg-emerald-50/20 border-emerald-200"
          : "bg-purple-50/20 border-purple-200"
      }`}
    >
      {isJobseeker ? (
        <Users className="w-8 h-8 text-emerald-400 mb-2 animate-pulse" />
      ) : (
        <Briefcase className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
      )}
      <p className="text-gray-500 text-sm font-medium text-center">
        {isJobseeker ? "No stars on the leaderboard yet." : "No featured employers yet."}
      </p>
      <p className="text-gray-400 text-xs text-center mt-1 max-w-[240px]">
        {isJobseeker
          ? "Earn points by completing your profile and applying for jobs to show up here!"
          : "Post jobs and review candidates on Findr to show up on the leaderboard!"}
      </p>
    </div>
  )
}

export function FindrStarsSection() {
  const [jobseekers, setJobseekers] = useState<FindrStarEntry[]>([])
  const [employers, setEmployers] = useState<FindrStarEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadStars = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true)
      const data = await fetchFindrStars()
      setJobseekers(data.jobseekers)
      setEmployers(data.employers)
    } catch (error) {
      console.error("Failed to fetch Findr Stars:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStars(true)

    const handleUpdate = () => loadStars(false)

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FINDR_STARS_STORAGE_KEY) {
        loadStars(false)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadStars(false)
      }
    }

    window.addEventListener(FINDR_STARS_UPDATED_EVENT, handleUpdate)
    window.addEventListener("storage", handleStorage)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener(FINDR_STARS_UPDATED_EVENT, handleUpdate)
      window.removeEventListener("storage", handleStorage)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [loadStars])

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-4 border border-emerald-100">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>Findr Leaderboard</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our <span className="gradient-text">Findr Stars</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating our most active, highly rated job seekers and employers based on platform
            activity, achievements, and points.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Top Job Seekers</h3>
              </div>
              {jobseekers.length === 0 ? (
                <EmptyState variant="jobseeker" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {jobseekers.map((seeker, index) => (
                    <StarCard key={seeker.id || index} star={seeker} index={index} variant="jobseeker" />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Top Employers</h3>
              </div>
              {employers.length === 0 ? (
                <EmptyState variant="employer" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {employers.map((employer, index) => (
                    <StarCard key={employer.id || index} star={employer} index={index} variant="employer" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
