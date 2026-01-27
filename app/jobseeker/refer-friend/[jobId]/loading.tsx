import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ReferFriendLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Referral Form</h1>
            <p className="text-gray-600">Please wait while we load the job details...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 