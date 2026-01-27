"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const orderId = "ORD-20240712-001";
const service = "Virtual RM Service";
const amount = "AED 2,500";
const date = new Date().toLocaleString();

export default function PaymentConfirmationPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-lg rounded-2xl shadow-lg bg-white flex flex-col items-center p-10">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2 text-center">Payment Successful!</h1>
          <div className="text-gray-600 mb-6 text-center">Thank you for your purchase. Your payment has been processed successfully.</div>
          <div className="w-full mb-6">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Order ID:</span><span className="font-medium">{orderId}</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Purchased Service:</span><span className="font-medium">{service}</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Amount Paid:</span><span className="font-medium text-green-600">{amount}</span></div>
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Transaction Date:</span><span className="font-medium">{date}</span></div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full mb-2 rounded-lg shadow" size="lg" onClick={() => router.push("/jobseeker/virtual-rm")}>View My Service Progress</Button>
          <div className="text-xs text-gray-400 text-center mt-2">A confirmation email has been sent to your registered email.</div>
        </Card>
      </main>
    </div>
  );
} 