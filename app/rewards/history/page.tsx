"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Trophy, Calendar, AlertCircle, Award, Star, History, DollarSign } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function RewardHistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');

      if (!token) {
        router.push('/login');
        return;
      }

      // 1. Fetch user profile details
      const profileResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(profileResponse.data.data);

      // 2. Fetch reward transactions
      const historyResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rewards/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(historyResponse.data.data || []);

    } catch (error: any) {
      console.error('Error fetching rewards history:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login');
        return;
      }
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  const isEmployer = userProfile?.role === "employer";
  const backUrl = isEmployer ? "/rewards/employer" : "/rewards/jobseeker";
  const themeGradient = isEmployer 
    ? "from-gray-50 via-emerald-50/20 to-emerald-50"
    : "from-gray-50 via-blue-50/20 to-blue-50";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradient} overflow-x-hidden pb-12`}>
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link href={backUrl}>
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Rewards
            </Button>
          </Link>
        </div>

        {/* Header Summary Card */}
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-[#eaf3ff] to-white overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md shrink-0">
                <History className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 leading-tight">
                  Point Transactions
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  View and track all points earned and spent by {userProfile?.name || "your account"}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col items-center justify-center min-w-[140px] border border-blue-50 shrink-0 self-start sm:self-auto">
              <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Total Balance</span>
              <span className="text-3xl font-black text-blue-950 mt-1">{userProfile?.points || 0}</span>
              <span className="text-blue-600 font-semibold text-xs mt-1">{userProfile?.membershipTier || "Prime"} Tier</span>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Ledger */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-5 px-6">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Transaction History
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Total of {transactions.length} record{transactions.length === 1 ? "" : "s"} found
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="py-12 text-center px-4 space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">No Transactions Yet</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  You haven't accumulated any transaction history yet. Keep exploring the platform to earn reward points!
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const typeInfo = tx.displayInfo || {
                  label: "Point Update",
                  emoji: "✨",
                  colorClass: "text-gray-600 bg-gray-50 border-gray-200"
                };
                const isPositive = tx.points >= 0;
                
                // Get human readable details
                const desc = tx.rewardHistory?.[0]?.description || `Points update for ${typeInfo.label}`;
                const formattedDate = new Date(tx.date || tx.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={tx._id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Emoji Icon Badge */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border shadow-sm ${typeInfo.colorClass}`}>
                        {typeInfo.emoji}
                      </div>
                      
                      {/* Description & Metadata */}
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {desc}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Points */}
                    <div className="shrink-0 text-right">
                      <span className={`text-lg md:text-xl font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? "+" : ""}{tx.points}
                      </span>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">points</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
