"use client";
import { useEffect, useState, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams?.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      setLoading(false);
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: "Your RM Service has been activated. You will receive a confirmation email shortly.",
      });
    } else {
      setLoading(false);
    }
  }, [searchParams, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <Card className="w-full max-w-lg rounded-2xl shadow-lg bg-white flex flex-col items-center p-10">
            <Loader2 className="w-20 h-20 text-emerald-500 mb-6 animate-spin" />
            <h1 className="text-2xl font-bold mb-2 text-center">Processing Payment...</h1>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-lg rounded-2xl shadow-lg bg-white flex flex-col items-center p-10">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2 text-center">Payment Successful!</h1>
          <div className="text-gray-600 mb-6 text-center">
            Thank you for your purchase. Your payment has been processed successfully and your RM Service has been activated.
          </div>
          <div className="w-full mb-6">
            {sessionId && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Session ID:</span>
                <span className="font-medium">{sessionId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Purchased Service:</span>
              <span className="font-medium">Virtual RM Service</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Transaction Date:</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full mb-2 rounded-lg shadow" 
            size="lg" 
            onClick={() => router.push("/jobseeker/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline"
            className="w-full rounded-lg" 
            size="lg" 
            onClick={() => router.push("/jobseeker/virtual-rm")}
          >
            View My Service Progress
          </Button>
          <div className="text-xs text-gray-400 text-center mt-4">
            A confirmation email has been sent to your registered email address.
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <Card className="w-full max-w-lg rounded-2xl shadow-lg bg-white flex flex-col items-center p-10">
            <Loader2 className="w-20 h-20 text-emerald-500 mb-6 animate-spin" />
            <h1 className="text-2xl font-bold mb-2 text-center">Loading...</h1>
          </Card>
        </main>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

