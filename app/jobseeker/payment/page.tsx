"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock } from "lucide-react";

const billingDetails = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  amount: "AED 2,500",
};

export default function PaymentPage() {
  const [form, setForm] = useState({
    name: "",
    card: "",
    expiry: "",
    cvv: "",
    useSaved: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePayment = (e: any) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/jobseeker/payment/confirmation"), 1000);
  };

  const handleCancel = () => {
    setForm({ name: "", card: "", expiry: "", cvv: "", useSaved: false });
    router.push("/jobseeker/cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-3xl">
          {/* Title with Lock Icon */}
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold">Secure Payment</h1>
          </div>
          {/* Billing Details */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow bg-white">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <div className="font-semibold text-gray-800">{billingDetails.name}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow bg-white">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-semibold text-gray-800">{billingDetails.email}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow bg-white">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Amount</div>
                <div className="font-semibold text-green-600">{billingDetails.amount}</div>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-xl shadow-md bg-white flex flex-col md:flex-row overflow-hidden">
            <div className="flex-1 p-8">
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name on Card</label>
                  <Input name="name" value={form.name} onChange={handleChange} required autoComplete="cc-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <Input name="card" value={form.card} onChange={handleChange} required maxLength={19} autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Expiry Date (MM/YY)</label>
                    <Input name="expiry" value={form.expiry} onChange={handleChange} required maxLength={5} autoComplete="cc-exp" placeholder="MM/YY" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <Input name="cvv" value={form.cvv} onChange={handleChange} required maxLength={4} autoComplete="cc-csc" placeholder="123" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" name="useSaved" checked={form.useSaved} onChange={handleChange} id="useSaved" className="rounded" />
                  <label htmlFor="useSaved" className="text-sm">Use Saved Card</label>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>Cancel</Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full" size="lg" disabled={loading}>{loading ? "Processing..." : "Make Payment"}</Button>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 p-8 flex flex-col justify-center min-w-[260px] border-l border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
              <div className="flex justify-between mb-2 text-sm">
                <span>Service</span>
                <span>Virtual RM Service</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal</span>
                <span>AED 2,500</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-green-600">AED 2,500</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 