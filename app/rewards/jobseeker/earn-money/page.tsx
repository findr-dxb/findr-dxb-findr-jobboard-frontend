// @ts-nocheck
"use client"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { UserPlus, Send, Gift, PlayCircle, Briefcase, HelpCircle, DollarSign, TrendingUp } from "lucide-react";
import React from "react";

export default function EarnMoneyPage() {
  const router = useRouter();

  // Dummy featured jobs
  const featuredJobs = [
    { title: "Sales Executive", reward: "2,000 AED", level: "Entry-Level" },
    { title: "Marketing Manager", reward: "5,000 AED", level: "Mid-Level" },
    { title: "Tech Lead", reward: "10,000 AED", level: "Senior Role" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 py-8 px-4 text-center text-white">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <div className="mr-2 drop-shadow-lg">
              <DollarSign size={48} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Earn up to 10,000 AED</h1>
          </div>
          <h2 className="text-xl md:text-2xl font-medium mb-3">Refer your friends to job openings. Earn money when they get hired.</h2>
          <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-lg px-8 py-3 rounded-xl shadow transition mb-2" onClick={() => router.push('/jobseeker/dashboard')}>
            Start Referring Now
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <div className="text-emerald-500 mb-3">
              <UserPlus size={40} />
            </div>
            <CardTitle className="mb-1">Browse Jobs</CardTitle>
            <CardDescription>Explore job openings on Findr.</CardDescription>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <div className="text-blue-500 mb-3">
              <Send size={40} />
            </div>
            <CardTitle className="mb-1">Refer Friends</CardTitle>
            <CardDescription>Share the job with your network.</CardDescription>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <div className="text-yellow-500 mb-3">
              <Gift size={40} />
            </div>
            <CardTitle className="mb-1">Earn Rewards</CardTitle>
            <CardDescription>Get paid when your referral is hired.</CardDescription>
          </Card>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
          <div className="text-emerald-500">
            <PlayCircle size={28} />
          </div>
          Watch How It Works
        </h3>
        <p className="text-center text-gray-600 mb-4">Learn how you can start earning money by referring candidates.</p>
        <div className="flex justify-center">
          <video 
            autoPlay
            
            loop
            playsInline
            className="rounded-xl shadow-lg w-full max-w-[1200px] min-w-0 bg-black" 
            style={{ aspectRatio: '16/9', height: 'auto' }} 
            preload="auto"
          >
            <source src="/referal.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="faq-1">
            <AccordionTrigger>How do I get paid?</AccordionTrigger>
            <AccordionContent>
              You will receive your reward via bank transfer or your preferred payment method after your referral is successfully hired and completes the required period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>When do I receive the reward?</AccordionTrigger>
            <AccordionContent>
              Rewards are typically processed within 30 days after your referral's successful onboarding.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>Can I refer multiple people?</AccordionTrigger>
            <AccordionContent>
              Yes! There is no limit to the number of people you can refer. The more successful referrals, the more you earn.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-4">
            <AccordionTrigger>Where can I track my referrals?</AccordionTrigger>
            <AccordionContent>
              You can track all your referrals and rewards in your Findr dashboard.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final CTA Section */}
      {/* (Remove the entire <footer> ... </footer> sticky CTA section) */}
    </div>
  );
}