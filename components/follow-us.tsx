"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Linkedin, Instagram, Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FollowUsProps {
  onPointsEarned?: (platform: string, points: number) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app';

export function FollowUs({ onPointsEarned }: FollowUsProps) {
  const [followedPlatforms, setFollowedPlatforms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const { toast } = useToast()

  // Fetch current follow status from backend
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          setIsLoadingStatus(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/profile/details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const followed = new Set<string>()
            if (data.data.linkedIn) followed.add('LinkedIn')
            if (data.data.instagram) followed.add('Instagram')
            setFollowedPlatforms(followed)
          }
        }
      } catch (error) {
        console.error('Error fetching follow status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    fetchFollowStatus()
  }, [])

  const handleSocialClick = async (platform: string, url: string) => {
    // Open social media link in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    
    // Check if user hasn't already earned points for this platform
    if (followedPlatforms.has(platform)) {
      toast({
        title: "Already Followed",
        description: `You have already followed us on ${platform}.`,
      })
      return
    }

    // Set loading state
    setLoading(prev => ({ ...prev, [platform]: true }))

    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to earn points for following us.",
          variant: "destructive",
        })
        setLoading(prev => ({ ...prev, [platform]: false }))
        return
      }

      // Map platform name to API format
      const platformKey = platform === 'LinkedIn' ? 'linkedIn' : 'instagram'

      // Call API to record the follow
      const response = await fetch(`${API_BASE_URL}/api/v1/profile/follow-social`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: platformKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Add platform to followed set
        setFollowedPlatforms(prev => new Set(prev).add(platform))
        
        // Award points (10 per platform)
        const points = data.data?.pointsAwarded || 10
        if (onPointsEarned) {
          onPointsEarned(platform, points)
        }
        
        // Show success toast
        toast({
          title: "Points Earned! 🎉",
          description: data.data?.message || `You earned ${points} bonus points for following us on ${platform}!`,
        })
      } else {
        // If already followed, update UI
        if (data.message?.includes('already followed')) {
          setFollowedPlatforms(prev => new Set(prev).add(platform))
        }
        toast({
          title: data.success ? "Success" : "Error",
          description: data.message || "Failed to record follow. Please try again.",
          variant: data.success ? "default" : "destructive",
        })
      }
    } catch (error) {
      console.error('Error recording social follow:', error)
      toast({
        title: "Error",
        description: "Failed to record follow. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }))
    }
  }

  const platforms = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/company/102722338",
      color: "text-blue-600 hover:text-blue-700",
      bgColor: "hover:bg-blue-50"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      url: "https://www.instagram.com/findrdubai?igsh=bTY0bzJvcWFja3Nz",
      color: "text-pink-600 hover:text-pink-700",
      bgColor: "hover:bg-pink-50"
    }
  ]

  return (
    <Card className="card-shadow border-0">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Star className="w-4 h-4 mr-2 text-yellow-500" />
          Follow Us
        </CardTitle>
        <CardDescription>
          🎉 Follow us on LinkedIn or Instagram and earn 10 bonus points!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const hasFollowed = followedPlatforms.has(platform.name)
            const isLoading = loading[platform.name] || false
            
            return (
              <Button
                key={platform.name}
                variant="outline"
                disabled={isLoadingStatus || isLoading}
                className={`flex-1 flex items-center justify-center gap-2 p-4 h-auto transition-all duration-200 ${platform.bgColor} ${
                  hasFollowed 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'border-gray-200'
                } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                onClick={() => handleSocialClick(platform.name, platform.url)}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className={`w-5 h-5 ${hasFollowed ? 'text-green-600' : platform.color}`} />
                )}
                <span className="font-medium">
                  {isLoading 
                    ? 'Recording...' 
                    : hasFollowed 
                      ? `✓ Followed on ${platform.name}` 
                      : `Follow on ${platform.name}`
                  }
                </span>
                {!hasFollowed && !isLoading && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1">
                    +10 pts
                  </span>
                )}
              </Button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Points are awarded once per platform. Links open in a new tab.
        </p>
      </CardContent>
    </Card>
  )
}