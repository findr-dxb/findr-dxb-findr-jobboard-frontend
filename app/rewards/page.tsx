"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, Trophy, Crown, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const rewardTiers = [
  {
    name: "Bronze",
    points: 0,
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    name: "Silver",
    points: 100,
    icon: Trophy,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    name: "Gold",
    points: 250,
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
]

const rewards = [
  {
    id: 1,
    title: "20% off Resume Builder",
    description: "Professional resume creation service",
    discount: 20,
    pointsRequired: 50,
    category: "Resume Services",
  },
  {
    id: 2,
    title: "30% off Visa Consultation",
    description: "Expert guidance on visa requirements",
    discount: 30,
    pointsRequired: 75,
    category: "Visa Services",
  },
  {
    id: 3,
    title: "25% off Mobility Support",
    description: "Relocation and settling assistance",
    discount: 25,
    pointsRequired: 100,
    category: "Mobility Services",
  },
  {
    id: 4,
    title: "Free Career Consultation",
    description: "1-hour session with career expert",
    discount: 100,
    pointsRequired: 150,
    category: "Consultation",
  },
  {
    id: 5,
    title: "15% off HR Services",
    description: "For employers - HR consultation discount",
    discount: 15,
    pointsRequired: 80,
    category: "HR Services",
  },
  {
    id: 6,
    title: "Premium Job Alerts",
    description: "Get notified of exclusive job opportunities",
    discount: 100,
    pointsRequired: 120,
    category: "Premium Features",
  },
]

export default function RewardsPage() {
  const [userPoints] = useState(150) // Mock user points
  const { toast } = useToast()

  const getCurrentTier = () => {
    return rewardTiers.reduce((prev, current) => (userPoints >= current.points ? current : prev))
  }

  const getNextTier = () => {
    return rewardTiers.find((tier) => tier.points > userPoints)
  }

  const handleRedeem = (reward: (typeof rewards)[0]) => {
    if (userPoints >= reward.pointsRequired) {
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward.title}. Check your email for details.`,
      })
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsRequired - userPoints} more points to redeem this reward.`,
        variant: "destructive",
      })
    }
  }

  const currentTier = getCurrentTier()
  const nextTier = getNextTier()
  const progressToNext = nextTier
    ? ((userPoints - currentTier.points) / (nextTier.points - currentTier.points)) * 100
    : 100

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Rewards</span> Program
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Earn points for every action you take and unlock exclusive benefits and discounts
          </p>
        </div>

        {/* Points Overview */}
        <Card className="mb-12 border-2 border-emerald-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div
                className={`w-16 h-16 ${currentTier.bgColor} ${currentTier.borderColor} border-2 rounded-full flex items-center justify-center`}
              >
                <currentTier.icon className={`w-8 h-8 ${currentTier.color}`} />
              </div>
              <div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentTier.name} Member
                </Badge>
              </div>
            </div>
            <CardTitle className="text-3xl gradient-text">{userPoints} Points</CardTitle>
            <CardDescription className="text-lg">
              {nextTier ? `${nextTier.points - userPoints} points to ${nextTier.name}` : "Maximum tier reached!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentTier.name}</span>
                  <span>{nextTier.name}</span>
                </div>
                <Progress value={progressToNext} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Gift className="w-6 h-6 mr-2 text-emerald-600" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Complete Profile</div>
                  <div className="text-sm text-gray-600">+50 points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Upload Resume</div>
                  <div className="text-sm text-gray-600">+25 points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Apply for Job</div>
                  <div className="text-sm text-gray-600">+10 points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Refer a Friend</div>
                  <div className="text-sm text-gray-600">+30 points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Get Hired</div>
                  <div className="text-sm text-gray-600">+100 points</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium">Leave Review</div>
                  <div className="text-sm text-gray-600">+15 points</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Available Rewards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border-2 hover:border-emerald-200 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{reward.category}</Badge>
                    <Badge variant="secondary" className="gradient-bg text-white">
                      {reward.discount}% OFF
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{reward.pointsRequired} points</span>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={userPoints < reward.pointsRequired}
                      className={userPoints >= reward.pointsRequired ? "gradient-bg text-white" : ""}
                    >
                      {userPoints >= reward.pointsRequired ? "Redeem Now" : "Need More Points"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  )
}
