"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  UserCheck,
  FileText,
  Trophy,
  ArrowRight,
  Users,
  Briefcase,
  Sparkles,
  Wallet,
} from "lucide-react"

const earnActions = [
  { icon: UserCheck, label: "Complete your profile", points: "+250", color: "bg-emerald-100 text-emerald-800" },
  { icon: Users, label: "Invite a friend to Findr", points: "+100", color: "bg-pink-100 text-pink-800" },
  { icon: FileText, label: "Refer a friend for a job", points: "+20 / job", color: "bg-blue-100 text-blue-800" },
  { icon: Trophy, label: "Referred friend gets hired", points: "+1000", color: "bg-yellow-100 text-yellow-800" },
  { icon: Sparkles, label: "Purchase a premium RM service", points: "+100", color: "bg-purple-100 text-purple-800" },
]

const spendOptions = [
  {
    title: "RM Basic Service",
    description: "Job applications, email handling, and profile support from a Relationship Manager.",
    cost: "800 points",
    href: "/jobseeker/premium",
  },
  {
    title: "RM Elite Service",
    description: "Priority interviews, dedicated support, and placement help until you are hired.",
    cost: "1,100 points",
    href: "/jobseeker/premium",
  },
]

export default function RewardsPage() {
  const router = useRouter()
  const [role, setRole] = useState<"jobseeker" | "employer" | null>(null)
  const [userPoints, setUserPoints] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.success || !json.data) return
        const userRole = json.data.role === "employer" ? "employer" : "jobseeker"
        setRole(userRole)
        if (userRole === "jobseeker") {
          const deducted = json.data.deductedPoints || 0
          const stored = typeof json.data.points === "number" ? json.data.points : json.data.rewards?.totalPoints || 0
          setUserPoints(Math.max(0, stored - deducted))
        } else {
          setUserPoints(typeof json.data.points === "number" ? json.data.points : 0)
        }
      })
      .catch(() => {})
  }, [])

  const dashboardHref = role === "employer" ? "/rewards/employer" : "/rewards/jobseeker"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-[#eaf3ff] to-white overflow-hidden">
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md shrink-0">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 leading-tight">
                  Findr Rewards
                </h1>
                <p className="text-gray-600 mt-2 max-w-xl">
                  Earn points for profile activity, invites, and job referrals. Redeem them on premium RM services, or earn cash when a referred candidate is hired.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md px-6 py-5 min-w-[180px] border border-blue-50 text-center">
              {userPoints === null ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Get started</p>
                  <p className="text-lg font-bold text-blue-950 mt-1">Sign in to see points</p>
                  <Button className="mt-3 gradient-bg text-white" onClick={() => router.push("/login")}>
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Your balance</p>
                  <p className="text-4xl font-black text-blue-950 mt-1">{userPoints}</p>
                  <p className="text-blue-600 font-semibold text-xs mt-1">Available points</p>
                  <Button className="mt-3 gradient-bg text-white" onClick={() => router.push(dashboardHref)}>
                    Open rewards
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Gift className="w-5 h-5 mr-2 text-emerald-600" />
              How to earn points
            </CardTitle>
            <CardDescription>Current jobseeker rewards on Findr</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {earnActions.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm md:text-base">{item.label}</span>
                </div>
                <Badge className={`${item.color} text-xs md:text-sm px-3 py-1`}>{item.points}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Wallet className="w-5 h-5 mr-2 text-emerald-600" />
              Redeem points
            </CardTitle>
            <CardDescription>Use points on Premium RM Services. 1 point = 1 AED toward the package.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {spendOptions.map((option) => (
              <div key={option.title} className="rounded-xl border border-emerald-100 bg-white p-5 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900">{option.title}</h3>
                <p className="text-sm text-gray-600 mt-2 flex-1">{option.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <Badge className="bg-emerald-100 text-emerald-800">{option.cost}</Badge>
                  <Button variant="outline" size="sm" onClick={() => router.push(option.href)}>
                    View service
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-shadow border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-400 to-blue-400 text-white text-center p-6">
            <CardTitle className="text-2xl font-bold">Earn up to 10,000 AED</CardTitle>
            <CardDescription className="text-white/90 text-base">
              Refer someone to a job. If they get hired, you earn a cash reward.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 mb-4">
              Points are for platform rewards. Cash is paid separately when your referred candidate is hired.
            </p>
            <Link href="/rewards/jobseeker/earn-money">
              <Badge className="bg-emerald-600 text-white px-4 py-2 text-base cursor-pointer">Learn more</Badge>
            </Link>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                Jobseekers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Track points, share your invite link, and redeem RM packages from your rewards dashboard.
              </p>
              <Button className="w-full gradient-bg text-white" onClick={() => router.push("/rewards/jobseeker")}>
                Jobseeker rewards
              </Button>
            </CardContent>
          </Card>
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Employers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Earn points by completing your company profile and posting jobs. Tiers follow company size.
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push("/rewards/employer")}>
                Employer rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
