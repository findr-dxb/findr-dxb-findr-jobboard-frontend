"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, Mail, Calendar, FileText, TrendingUp, Star, CheckCircle, PlayCircle, ArrowRight, Award, Users, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"

// Dummy user for dropdown
const user = { name: "Jobseeker", type: "jobseeker" }

const serviceStats = [
  { icon: TrendingUp, label: "95% Success Rate" },
  { icon: Calendar, label: "21 Avg Days to Hire" },
  { icon: Users, label: "500+ Successful Placements" },
  { icon: Star, label: "4.9 Client Rating" },
]

const features = [
  { icon: FileText, title: "Job Application Management", desc: "We apply to relevant jobs for you, maximizing your reach." },
  { icon: Mail, title: "Email Communication", desc: "We monitor and respond to employer emails on your behalf." },
  { icon: Calendar, title: "Interview Scheduling", desc: "We coordinate and schedule interviews for you." },
  { icon: UserCheck, title: "Profile Optimization", desc: "We optimize your profile and resume for best results." },
]

const journeySteps = [
  { day: "Day 1", title: "Profile Assessment" },
  { day: "Day 2–3", title: "Resume Building" },
  { day: "Ongoing", title: "Application Handling" },
  { day: "As required", title: "Interview Scheduling" },
  { day: "Until hired", title: "Placement Support" },
]

export default function PremiumServicesPage() {
  const [isSticky, setIsSticky] = useState(false)
  const [rmServiceStatus, setRmServiceStatus] = useState("inactive")
  const [isLoading, setIsLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(0)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { cart, addToCart, isInCart } = useCart()

  // Fetch RM Service status and user points
  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setRmServiceStatus(data.data.rmService === "Active" ? "active" : "inactive")
            
            // Use points directly from database (backend already calculates and maintains this)
            // Backend stores total points including all components (base, applications, RM service, social media, referrals)
            // We just need to subtract deducted points to get available points
            const deducted = data.data?.deductedPoints || 0
            const dbPoints = typeof data.data.points === 'number' ? data.data.points : 0
            const availablePoints = Math.max(0, dbPoints - deducted)
            
            setUserPoints(availablePoints)
          }
        }
      } catch (error) {
        console.error('Error fetching service status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceStatus()
  }, [])

  React.useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handlePurchaseWithPoints = async (serviceType: 'basic' | 'elite') => {
    const serviceName = serviceType === 'basic' ? 'RM Basic Service' : 'RM Elite Service'
    const pointsRequired = serviceType === 'basic' ? 800 : 1100
    
    if (userPoints < pointsRequired) {
      toast({
        title: "Insufficient Points",
        description: `You need ${pointsRequired} points but only have ${userPoints} points available.`,
        variant: "destructive",
      })
      return
    }

    setPurchasing(serviceType)
    
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase services.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName,
          price: 0, // Points-based purchase, no AED price
          pointsUsed: pointsRequired,
          couponCode: '',
          totalAmount: 0 // Points-based purchase
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to purchase service')
      }

      toast({
        title: "Purchase Successful!",
        description: `${serviceName} has been activated. You earned 100 bonus points!`,
      })
      
      // Refresh service status and points
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  const calculateHybridPayment = (pointsRequired: number, userPoints: number) => {
    if (userPoints >= pointsRequired) {
      return null // No hybrid needed
    }
    
    const pointsToUse = userPoints
    const remainingPoints = pointsRequired - pointsToUse
    const aedAmount = remainingPoints // 1 point = 1 AED conversion rate
    
    return {
      pointsToUse,
      aedAmount,
      totalPointsRequired: pointsRequired
    }
  }

  const handleAddToCart = (serviceType: 'basic' | 'elite', paymentMethod: 'points' | 'aed' | 'hybrid') => {
    const serviceName = serviceType === 'basic' ? 'RM Basic Service' : 'RM Elite Service'
    const pointsRequired = serviceType === 'basic' ? 800 : 1100
    const aedPrice = serviceType === 'basic' ? 1500 : 2000 // AED pricing
    
    let cartItem: any = {
      title: serviceName,
      description: serviceType === 'basic' 
        ? "Job Application Management, Email Communication, Profile Optimization, Basic Interview Support"
        : "Everything in Basic + Priority Interview Scheduling, Advanced Profile Optimization, Dedicated Support Until Hired, Premium Placement Support",
      serviceType: serviceType,
      category: 'rm-service' as const,
      paymentMethod: paymentMethod
    }

    if (paymentMethod === 'hybrid') {
      const hybridPayment = calculateHybridPayment(pointsRequired, userPoints)
      if (hybridPayment) {
        cartItem.price = `${hybridPayment.pointsToUse} Points + AED ${hybridPayment.aedAmount}`
        cartItem.hybridPayment = hybridPayment
      }
    } else if (paymentMethod === 'points') {
      cartItem.price = "0"
      cartItem.points = pointsRequired
    } else {
      cartItem.price = `${aedPrice}`
      cartItem.aedPrice = aedPrice
    }

    if (isInCart(serviceName)) {
      toast({
        title: "Already in Cart",
        description: `${serviceName} is already in your cart.`,
        variant: "destructive",
      })
      return
    }

    addToCart(cartItem)
    
    let paymentDescription = ''
    if (paymentMethod === 'hybrid' && cartItem.hybridPayment) {
      paymentDescription = `${cartItem.hybridPayment.pointsToUse} Points + AED ${cartItem.hybridPayment.aedAmount}`
    } else if (paymentMethod === 'points') {
      paymentDescription = `${pointsRequired} Points`
    } else {
      paymentDescription = `AED ${aedPrice}`
    }
    
    toast({
      title: "Added to Cart",
      description: `${serviceName} has been added to your cart (${paymentDescription}).`,
    })
  }

  const handlePurchaseWithAED = async (serviceType: 'basic' | 'elite') => {
    const serviceName = serviceType === 'basic' ? 'RM Basic Service' : 'RM Elite Service'
    const aedPrice = serviceType === 'basic' ? 1500 : 2000
    
    setPurchasing(serviceType)
    
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase services.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Call Stripe checkout endpoint for AED payment
      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/rm-service/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName,
          price: aedPrice,
          pointsUsed: 0,
          totalAmount: aedPrice,
          paymentMethod: 'aed'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session')
      }

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('AED purchase error:', error)
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  const handleHybridPurchase = async (serviceType: 'basic' | 'elite') => {
    const serviceName = serviceType === 'basic' ? 'RM Basic Service' : 'RM Elite Service'
    const pointsRequired = serviceType === 'basic' ? 800 : 1100
    const hybridPayment = calculateHybridPayment(pointsRequired, userPoints)
    
    if (!hybridPayment) {
      toast({
        title: "No Hybrid Payment Needed",
        description: "You have enough points for full payment.",
        variant: "destructive",
      })
      return
    }

    setPurchasing(serviceType)
    
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase services.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      // Use regular checkout endpoint with hybrid payment data
      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/rm-service/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName,
          pointsUsed: hybridPayment.pointsToUse,
          totalAmount: hybridPayment.aedAmount,
          paymentMethod: 'hybrid',
          hybridPayment: {
            pointsToUse: hybridPayment.pointsToUse,
            aedAmount: hybridPayment.aedAmount,
            totalPointsRequired: hybridPayment.totalPointsRequired
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session')
      }

      if (data.success && data.url) {
        // Redirect to Stripe checkout for AED portion
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Hybrid purchase error:', error)
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Navbar */}
      <div className={`sticky top-0 z-50 transition-all ${isSticky ? "bg-white shadow border-b" : "bg-transparent"}`}>
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-emerald-50 to-white py-12 px-4 text-center">
        {rmServiceStatus === "active" ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your RM Service is Active</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Your dedicated Relationship Manager is working on your job search. Check your dashboard for updates and progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-green-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition mb-4"
                onClick={() => router.push("/jobseeker/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-3 text-lg font-semibold rounded-full shadow-md hover:shadow-lg transition mb-4"
                onClick={() => router.push("/jobseeker/applications")}
              >
                View Applications
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium RM Services</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Get a dedicated Relationship Manager who will handle your entire job search process—from applications to interviews, until you land your dream job.
            </p>
            {!isLoading && (
              <div className="text-lg font-semibold text-emerald-600 mb-8">
                Your Available Points: {userPoints}
              </div>
            )}
          </>
        )}
      </section>

      {/* Service Highlights */}
      {rmServiceStatus === "active" ? (
        <section className="w-full max-w-4xl mx-auto py-8 px-4">
          <Card className="rounded-xl shadow-md p-8 text-center bg-green-50 border-green-200">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Service Active</h2>
            <p className="text-green-700 mb-4">
              Your Relationship Manager is actively working on your job search. You'll receive updates on applications, interviews, and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => router.push("/jobseeker/dashboard")}
              >
                View Progress
              </Button>
              <Button 
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => router.push("/jobseeker/applications")}
              >
                Check Applications
              </Button>
            </div>
          </Card>
        </section>
      ) : (
        <>
          {/* Service Stats */}
          <section className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 py-8 px-4">
            {serviceStats.map((stat, i) => (
              <Card key={i} className="rounded-xl shadow-md text-center py-6">
                <stat.icon className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <div className="font-semibold text-lg">{stat.label}</div>
              </Card>
            ))}
          </section>

          {/* Service Options */}
          <section className="w-full max-w-5xl mx-auto py-8 px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Choose Your Service Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RM Basic Service */}
              <Card className="rounded-xl shadow-lg border-2 border-emerald-200 hover:border-emerald-400 transition">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-emerald-700">RM Basic Service</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    <div className="space-y-1">
                      <div>
                        <span className="text-3xl font-bold text-emerald-600">800</span>
                        <span className="text-gray-600 ml-2">Points</span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Job Application Management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Email Communication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Profile Optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic Interview Support</span>
                    </li>
                  </ul>
                  <div className="space-y-2">
                    {userPoints >= 800 ? (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAddToCart('basic', 'points')}
                        disabled={isInCart('RM Basic Service')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart('RM Basic Service') ? 'In Cart' : 'Add to Cart (800 Points)'}
                      </Button>
                    ) : userPoints > 0 ? (
                      <>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                          <div className="font-medium text-yellow-800 mb-1">Hybrid Payment Available</div>
                          <div className="text-yellow-700">
                            Use your {userPoints} points + AED {800 - userPoints}
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                          onClick={() => handleAddToCart('basic', 'hybrid')}
                          disabled={isInCart('RM Basic Service')}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isInCart('RM Basic Service') ? 'In Cart' : `Add to Cart (${userPoints} Points + AED ${800 - userPoints})`}
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleAddToCart('basic', 'aed')}
                        disabled={isInCart('RM Basic Service')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart('RM Basic Service') ? 'In Cart' : 'Add to Cart (AED 1,500)'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* RM Elite Service */}
              <Card className="rounded-xl shadow-lg border-2 border-purple-200 hover:border-purple-400 transition relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-600 text-white">Popular</Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-purple-700">RM Elite Service</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    <div className="space-y-1">
                      <div>
                        <span className="text-3xl font-bold text-purple-600">1,100</span>
                        <span className="text-gray-600 ml-2">Points</span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>Priority Interview Scheduling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>Advanced Profile Optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>Dedicated Support Until Hired</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>Premium Placement Support</span>
                    </li>
                  </ul>
                  <div className="space-y-2">
                    {userPoints >= 1100 ? (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleAddToCart('elite', 'points')}
                        disabled={isInCart('RM Elite Service')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart('RM Elite Service') ? 'In Cart' : 'Add to Cart (1,100 Points)'}
                      </Button>
                    ) : userPoints > 0 ? (
                      <>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                          <div className="font-medium text-yellow-800 mb-1">Hybrid Payment Available</div>
                          <div className="text-yellow-700">
                            Use your {userPoints} points + AED {1100 - userPoints}
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          onClick={() => handleAddToCart('elite', 'hybrid')}
                          disabled={isInCart('RM Elite Service')}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {isInCart('RM Elite Service') ? 'In Cart' : `Add to Cart (${userPoints} Points + AED ${1100 - userPoints})`}
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleAddToCart('elite', 'aed')}
                        disabled={isInCart('RM Elite Service')}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart('RM Elite Service') ? 'In Cart' : 'Add to Cart (AED 2,000)'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {/* What Your RM Will Do - Only show when service is not active */}
      {rmServiceStatus !== "active" && (
        <section className="w-full max-w-5xl mx-auto py-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What Your RM Will Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="rounded-xl shadow-md text-center p-6">
                <f.icon className="w-8 h-8 mx-auto text-emerald-500 mb-3" />
                <div className="font-semibold text-lg mb-1">{f.title}</div>
                <div className="text-gray-600 text-sm">{f.desc}</div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Timeline Stepper Bar - Only show when service is not active */}
      {rmServiceStatus !== "active" && (
        <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto">
            {[
              { icon: <UserCheck className="w-6 h-6 text-[#00B894]" />, title: "Profile Assessment", sub: "Day 1" },
              { icon: <FileText className="w-6 h-6 text-[#00B894]" />, title: "Resume Building", sub: "Day 2–3" },
              { icon: <TrendingUp className="w-6 h-6 text-[#00B894]" />, title: "Application Handling", sub: "Ongoing" },
              { icon: <Calendar className="w-6 h-6 text-[#00B894]" />, title: "Interview Scheduling", sub: "As required" },
              { icon: <CheckCircle className="w-6 h-6 text-[#00B894]" />, title: "Placement Support", sub: "Until Hired" },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center min-w-[160px]">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#E6FAF3] flex items-center justify-center shadow-sm mb-2">
                    {step.icon}
                  </div>
                  <div className="font-semibold text-base text-center whitespace-nowrap">{step.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{step.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-2">
                    <ArrowRight className="w-5 h-5 text-[#00B894] opacity-60" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Video Only Section */}
        <section className="w-full py-12 px-4 bg-white flex flex-col items-center justify-center">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl" style={{ width: '75%' }}>
              <div className="rounded-2xl shadow-lg overflow-hidden mx-auto" style={{ height: '350px', maxHeight: '60vw' }}>
                <video
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover bg-black"
                  style={{ minHeight: '200px', maxHeight: '350px' }}
                  preload="auto"
                  controls
                >
                  <source src="/premium.mp4" type="video/mp4" />
                  Sorry, your browser does not support embedded videos.
                </video>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-[#6e6e6e] text-base md:text-lg font-medium">
            Watch how your RM will guide your job search
          </div>
        </section>
      </section>
      )}
    </div>
  )
}
