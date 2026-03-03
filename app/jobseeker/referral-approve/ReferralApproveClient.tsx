"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://findr-jobboard-backend-production.up.railway.app/api/v1"

type ReferralApproveClientProps = {
  token: string | null
}

export default function ReferralApproveClient({ token }: ReferralApproveClientProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid link. Missing token.")
      return
    }

    const confirm = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/applications/referral/confirm?token=${encodeURIComponent(token)}`
        )
        const data = await res.json()
        if (data.success) {
          setStatus("success")
          setMessage(
            data.message ||
              "Your referral has been approved and your application has been submitted successfully."
          )
        } else {
          setStatus("error")
          setMessage(data.message || "Invalid or expired referral link.")
        }
      } catch {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    confirm()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="card-shadow border-0 max-w-md w-full">
          <CardContent className="p-6 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600">Processing your referral approval...</p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Referral approved
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">
                  You can now log in to Findr to track your application status.
                </p>
                <Link href="/login">
                  <Button className="mt-4 gradient-bg text-white">Go to login</Button>
                </Link>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Could not approve referral
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <Link href="/">
                  <Button variant="outline">Back to home</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

