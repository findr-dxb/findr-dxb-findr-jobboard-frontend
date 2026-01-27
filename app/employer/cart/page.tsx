"use client"

import { useState } from "react"
import { ShoppingCart, X, BadgePercent } from "lucide-react"
import { useRouter } from "next/navigation"

import { Navbar } from "@/components/navbar"
import { EmployerSidebar } from "@/components/employer-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

interface CartItem {
  id: number
  name: string
  description: string
  originalPrice: number
  discountedPrice?: number
  category: string
}

export default function EmployerCartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  /* ----------------------------------------------------------------------- */
  /*                              HELPER FUNCS                               */
  /* ----------------------------------------------------------------------- */
  const handleRemove = (title: string) => {
    removeFromCart(title);
    toast({
      title: "Service removed",
      description: "The service has been removed from your cart.",
    });
  };

  const handleGetQuote = async () => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to request a quote.",
          variant: "destructive",
        });
        return;
      }

      // Send one quote request per selected service (aligns with single-service API)
      const results = await Promise.allSettled(
        cart.map(async (item) => {
          const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/quotes', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service: item.title,
              requirements: `Quote request for ${item.title} - ${item.description || ''}`.trim(),
              budget: 'To be discussed',
              timeline: 'Flexible',
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to submit quote for ${item.title}`);
          }
          return { item: item.title, success: true };
        })
      );

      // Check for failures
      const failures = results.filter((result) => result.status === 'rejected');
      const successes = results.filter((result) => result.status === 'fulfilled');

      if (failures.length > 0) {
        const errorMessages = failures.map((failure: any) => {
          const reason = failure.reason?.message || 'Unknown error';
          return reason;
        }).join('; ');

        toast({
          title: "Some requests failed",
          description: errorMessages,
          variant: "destructive",
        });
      }

      if (successes.length > 0) {
        toast({
          title: `${successes.length} quote request(s) submitted successfully.`,
          description: failures.length > 0 ? "Some services already have pending quotations." : "Our team will contact you shortly.",
        });
        
        if (failures.length === 0) {
          router.push("/employer/cart/in-progress");
        }
      } else {
        toast({
          title: "Request Failed",
          description: "All quote requests failed. Please check if you've already requested quotations for these services.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit quote request. Please try again.';
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  /* ----------------------------------------------------------------------- */
  /*                                   JSX                                   */
  /* ----------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/40">
      <Navbar />

      <div className="flex">
        {/* Main content */}
        <main className="flex flex-col items-center justify-center px-2 py-8 md:py-14 w-full flex-1">
          <div className="w-full max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
                <ShoppingCart className="size-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">HR Services Cart</h1>
                <p className="text-gray-600 dark:text-gray-400">Review your selected HR services</p>
              </div>
            </div>
            {/* Cart Items */}
            <Card className="shadow-lg rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Services&nbsp;({cart.length})</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {cart.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">Your cart is empty.</p>
                )}
                {cart.map((item, idx) => (
                  <div key={item.title} className="py-4 flex items-start justify-between gap-4 group">
                    <div className="flex-1 flex items-start gap-3">
                      {/* Optional icon placeholder */}
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-lg font-bold shrink-0">
                        {item.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(item.title)}
                        aria-label={`Remove ${item.title}`}
                        className="transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Get Quote Button */}
            <div className="flex justify-center mt-4">
              <Button
                className="flex items-center justify-center gap-2 h-10 px-5 text-[14px] font-medium rounded-[8px] gradient-bg text-white"
                style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, borderRadius: 8, width: 'fit-content' }}
                onClick={handleGetQuote}
                disabled={cart.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 align-middle">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 10l15-6-6 15-2.5-6-6-2.5z" />
                </svg>
                Get Quote
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
