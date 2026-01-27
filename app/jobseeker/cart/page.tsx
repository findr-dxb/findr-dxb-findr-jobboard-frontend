"use client"
import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Trash2, BadgePercent } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function CartPage() {
  const [rewardPoints, setRewardPoints] = useState<number | "">("")
  const [userPoints, setUserPoints] = useState(0)
  const [coupon, setCoupon] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { cart, removeFromCart } = useCart()

  // Calculate profile points (same logic as dashboard) - fallback only
  const calculateProfilePoints = (profile: any) => {
    let completed = 0;
    const totalFields = 24; // Same as dashboard (employmentVisa removed)

    // Personal Info (9 fields - employmentVisa removed)
    if (profile?.fullName) completed++;
    if (profile?.email) completed++;
    if (profile?.phoneNumber) completed++;
    if (profile?.location) completed++;
    if (profile?.dateOfBirth) completed++;
    if (profile?.nationality) completed++;
    if (profile?.professionalSummary) completed++;
    if (profile?.emirateId) completed++;
    if (profile?.passportNumber) completed++;

    // Experience (4 fields)
    const exp = profile?.professionalExperience?.[0];
    if (exp?.currentRole) completed++;
    if (exp?.company) completed++;
    if (exp?.yearsOfExperience) completed++;
    if (exp?.industry) completed++;

    // Education (4 fields)
    const edu = profile?.education?.[0];
    if (edu?.highestDegree) completed++;
    if (edu?.institution) completed++;
    if (edu?.yearOfGraduation) completed++;
    if (edu?.gradeCgpa) completed++;

    // Skills, Preferences, Certifications, Resume (4 fields)
    if (profile?.skills && profile.skills.length > 0) completed++;
    if (profile?.jobPreferences?.preferredJobType && profile.jobPreferences.preferredJobType.length > 0) completed++;
    if (profile?.certifications && profile.certifications.length > 0) completed++;
    if (profile?.jobPreferences?.resumeAndDocs && profile.jobPreferences.resumeAndDocs.length > 0) completed++;

    // Social Links (3 fields)
    if (profile?.socialLinks?.linkedIn) completed++;
    if (profile?.socialLinks?.instagram) completed++;
    if (profile?.socialLinks?.twitterX) completed++;

    const percentage = Math.round((completed / totalFields) * 100);
    const calculatedPoints = 50 + percentage * 2; // Base 50 + 2 points per percentage (100% = 250 points)
    const applicationPoints = profile?.rewards?.applyForJobs || 0; // Points from job applications
    const rmServicePoints = profile?.rewards?.rmService || 0; // Points from RM service purchase
    const socialMediaBonus = profile?.rewards?.socialMediaBonus || 0; // Points from following social media
    const deductedPoints = profile?.deductedPoints || 0;
    const totalPoints = calculatedPoints + applicationPoints + rmServicePoints + socialMediaBonus;
    const availablePoints = Math.max(0, totalPoints - deductedPoints);

    return availablePoints;
  };

  // Fetch user's points on component mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your points.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/profile/details', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        if (data.success && data.data) {
          // Prefer server points when available
          const apiPoints = (typeof data.data.points === 'number' ? data.data.points : (data.data.rewards?.totalPoints ?? null))
          const deducted = data.data?.deductedPoints || 0
          if (apiPoints !== null) {
            setUserPoints(Math.max(0, apiPoints - deducted))
          } else {
            // Fallback to local calculation
            const calc = calculateProfilePoints(data.data)
            setUserPoints(calc)
          }
        }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your points balance.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
    }

    fetchUserPoints()
  }, [router, toast])

  // Calculate totals for all payment methods
  const pointsItems = cart.filter(item => item.paymentMethod === 'points')
  const aedItems = cart.filter(item => item.paymentMethod === 'aed')
  const hybridItems = cart.filter(item => item.paymentMethod === 'hybrid')
  
  const totalPointsRequired = pointsItems.reduce((total, item) => total + (item.points || 0), 0)
  const totalAEDRequired = aedItems.reduce((total, item) => total + (item.aedPrice || 0), 0)
  
  // Calculate hybrid totals
  const hybridPointsRequired = hybridItems.reduce((total, item) => total + (item.hybridPayment?.pointsToUse || 0), 0)
  const hybridAEDRequired = hybridItems.reduce((total, item) => total + (item.hybridPayment?.aedAmount || 0), 0)
  
  // Combined totals
  const combinedPointsRequired = totalPointsRequired + hybridPointsRequired
  const combinedAEDRequired = totalAEDRequired + hybridAEDRequired
  
  const pointsDiscount = (typeof rewardPoints === "number" ? rewardPoints : 0);
  const finalPointsTotal = Math.max(combinedPointsRequired - pointsDiscount, 0);

  const handleRemove = (itemTitle: string) => {
    removeFromCart(itemTitle)
    toast({ title: "Removed from cart", description: `${itemTitle} removed from cart.` })
  }

  const handlePointsChange = (value: string | number) => {
    // Handle empty input
    if (value === "" || value === null || value === undefined) {
      setRewardPoints("")
      return
    }

    const numValue = Number(value)
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      setRewardPoints("")
      return
    }

    if (numValue > userPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userPoints} points available.`,
        variant: "destructive",
      })
      return
    }
    if (numValue < 0) {
      setRewardPoints("")
      return
    }
    setRewardPoints(numValue)
  }

  const handleApplyPoints = () => {
    const pointsToApply = typeof rewardPoints === "number" ? rewardPoints : 0
    
    if (pointsToApply > userPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userPoints} points available.`,
        variant: "destructive",
      })
      return
    }
    if (pointsToApply > 0) {
      toast({ 
        title: "Points Applied!", 
        description: `${pointsToApply} points applied as discount.` 
      })
    } else {
      toast({
        title: "No Points Applied",
        description: "Please enter the number of points you want to use.",
        variant: "destructive",
      })
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place an order.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      if (cart.length === 0) {
        toast({
          title: "Cart Empty",
          description: "Please add items to your cart before placing an order.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const pointsUsed = typeof rewardPoints === "number" ? rewardPoints : 0

      // Check if user has enough points for points-based items
      if (combinedPointsRequired > 0 && finalPointsTotal > userPoints) {
        toast({
          title: "Insufficient Points",
          description: `You need ${finalPointsTotal} points but only have ${userPoints} points available.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Handle different payment scenarios
      if (combinedAEDRequired > 0) {
        // Payment via Stripe (handles both AED-only and hybrid payments)
        const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/rm-service/checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            services: cart.map(item => ({
              service: item.title,
              paymentMethod: item.paymentMethod,
              pointsToUse: item.hybridPayment?.pointsToUse || item.points || 0,
              aedAmount: item.hybridPayment?.aedAmount || item.aedPrice || 0,
              totalPointsRequired: item.hybridPayment?.totalPointsRequired || item.points || 0
            })),
            pointsUsed: combinedPointsRequired,
            totalAmount: combinedAEDRequired,
            paymentMethod: hybridItems.length > 0 ? 'hybrid' : 'aed'
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to create checkout session')
        }

        if (data.success && data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url
          return
        } else {
          throw new Error('No checkout URL received')
        }
      } else {
        // Points-only payment
        const allPointsItems = [...pointsItems, ...hybridItems.filter(item => !item.hybridPayment?.aedAmount)]
        const orderPromises = allPointsItems.map(async (item) => {
          if (item.category === 'rm-service' && item.serviceType) {
            const serviceName = item.title
            const pointsRequired = item.points || 0
            
            return fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/orders', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                service: serviceName,
                price: 0,
                pointsUsed: pointsRequired,
                couponCode: '',
                totalAmount: 0
              })
            })
          }
        })

        const responses = await Promise.all(orderPromises.filter(Boolean))
        
        const allSuccessful = responses.every(response => response?.ok)
        
        if (!allSuccessful) {
          throw new Error('Some orders failed to process')
        }

        toast({
          title: "Orders Successful!",
          description: `All services have been activated successfully. You earned bonus points!`,
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      console.error('Order processing error:', error)
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process orders. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    toast({ title: "Proceeding to payment...", description: "Redirecting to payment gateway." })
    setTimeout(() => router.push("/jobseeker/payment"), 800)
  }

  const refreshPoints = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) return

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
          const apiPoints = (typeof data.data.points === 'number' ? data.data.points : (data.data.rewards?.totalPoints ?? null))
          const deducted = data.data?.deductedPoints || 0
          if (apiPoints !== null) {
            setUserPoints(Math.max(0, apiPoints - deducted))
          } else {
            const calc = calculateProfilePoints(data.data)
            setUserPoints(calc)
          }
          toast({
            title: "Points Refreshed",
            description: `Your current balance is ${apiPoints !== null ? Math.max(0, apiPoints - deducted) : userPoints} points.`,
          })
        }
      }
    } catch (error) {
      // Silent error handling for refresh
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/40 flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-12 md:py-20 w-full flex-1">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow">
              <ShoppingCart className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-gray-600 dark:text-gray-400">Review your selected service before proceeding to payment.</p>
            </div>
          </div>

          {/* Cart Items */}
          {cart.length === 0 ? (
            <Card className="rounded-xl shadow-md min-h-[110px]">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-gray-500 text-sm mb-4">Add some premium services to get started</p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/jobseeker/premium')}
                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                >
                  Browse Premium Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <Card key={index} className="rounded-xl shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base md:text-lg">
                      <span>{item.title}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemove(item.title)} 
                        style={{cursor:'pointer'}} 
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" style={{cursor:'pointer'}} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-0">
                    <div className="text-gray-700 text-sm flex-1">
                      {item.description}
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          item.paymentMethod === 'points' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : item.paymentMethod === 'hybrid'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.paymentMethod === 'points' ? 'Points Payment' : 
                           item.paymentMethod === 'hybrid' ? 'Hybrid Payment' : 'AED Payment'}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-lg">
                      {item.paymentMethod === 'points' ? (
                        <span className="text-emerald-600">{item.points} Points</span>
                      ) : item.paymentMethod === 'hybrid' && item.hybridPayment ? (
                        <div className="text-sm">
                          <span className="text-emerald-600">{item.hybridPayment.pointsToUse} Points</span>
                          <span className="text-gray-500"> + </span>
                          <span className="text-blue-600">AED {item.hybridPayment.aedAmount}</span>
                        </div>
                      ) : (
                        <span className="text-blue-600">AED {item.aedPrice}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reward Points/Coupon */}
          <Card className="rounded-xl shadow-md min-h-[110px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BadgePercent className="w-5 h-5 text-emerald-600" />
                Redeem Findr Points / Coupon
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 pt-0">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <Input
                    type="number"
                    min={0}
                    max={userPoints}
                    value={rewardPoints === "" ? "" : rewardPoints}
                    onChange={e => handlePointsChange(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Reward Points"
                    className="max-w-[120px]"
                    disabled={cart.length === 0 || isLoading}
                    style={{cursor:'pointer'}}
                  />
                  <Input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Coupon Code"
                    className="max-w-[180px]"
                    disabled={cart.length === 0}
                    style={{cursor:'pointer'}}
                  />
                  <Button 
                    className="gradient-bg text-white rounded-full self-start" 
                    disabled={cart.length === 0 || isLoading} 
                    onClick={handleApplyPoints} 
                    style={{cursor:'pointer'}}
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  Available: {isLoading ? 'Loading...' : `${userPoints} points`}
                  <button 
                    onClick={refreshPoints}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                    disabled={isLoading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </CardContent>
            <CardDescription className="text-xs text-gray-500 pt-2 px-6 pb-4">
              Use earned points to reduce the points required for premium services. Enter points to apply as discount.
            </CardDescription>
          </Card>

          {/* Pricing Summary */}
          <Card className="rounded-xl shadow-md min-h-[180px]">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pt-0">
              {combinedPointsRequired > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Points Required</span>
                    <span>{combinedPointsRequired.toLocaleString()} Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Discount</span>
                    <span className="text-emerald-600">–{pointsDiscount.toLocaleString()} Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Points</span>
                    <span>{userPoints.toLocaleString()} Points</span>
                  </div>
                </>
              )}
              
              {combinedAEDRequired > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>AED Amount</span>
                    <span>AED {combinedAEDRequired.toLocaleString()}</span>
                  </div>
                </>
              )}
              
              {hybridItems.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="text-xs font-medium text-yellow-800 mb-1">Hybrid Payment Breakdown:</div>
                  {hybridItems.map((item, idx) => (
                    <div key={idx} className="text-xs text-yellow-700">
                      {item.title}: {item.hybridPayment?.pointsToUse} Points + AED {item.hybridPayment?.aedAmount}
                    </div>
                  ))}
                </div>
              )}
              
              <hr />
              
              <div className="space-y-2">
                {combinedPointsRequired > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>Points Total</span>
                    <span className={finalPointsTotal > userPoints ? 'text-red-600' : 'text-emerald-600'}>
                      {finalPointsTotal.toLocaleString()} Points
                    </span>
                  </div>
                )}
                
                {combinedAEDRequired > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>AED Total</span>
                    <span className="text-blue-600">
                      AED {combinedAEDRequired.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  className="gradient-bg text-white font-medium rounded-[8px] shadow-md hover:shadow-lg transition"
                  style={{ height: 40, paddingLeft: 24, paddingRight: 24, fontSize: 14, borderRadius: 8, width: 'fit-content' }}
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || isLoading || (combinedPointsRequired > 0 && finalPointsTotal > userPoints)}
                >
                  {isLoading ? 'Processing...' : 
                   (combinedPointsRequired > 0 && finalPointsTotal > userPoints) ? 'Insufficient Points' :
                   combinedAEDRequired > 0 ? `Proceed to Payment (AED ${combinedAEDRequired})` :
                   'Purchase with Points'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <a href="/jobseeker/premium" className="text-emerald-600 hover:underline text-sm">Back to Premium Services</a>
          </div>
        </div>
      </main>
    </div>
  )
}
