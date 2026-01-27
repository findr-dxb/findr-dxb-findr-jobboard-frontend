"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { UserPlus, Send, Gift, PlayCircle, Briefcase, HelpCircle, DollarSign, TrendingUp } from "lucide-react";

export default function EarnMoneyPage() {
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);

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
            <DollarSign className="w-12 h-12 mr-2 drop-shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Earn up to 10,000 AED</h1>
          </div>
          <h2 className="text-xl md:text-2xl font-medium mb-3">Refer your friends to job openings. Earn money when they get hired.</h2>
          <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-lg px-8 py-3 rounded-xl shadow transition mb-2" onClick={() => router.push('/jobseeker/search')}>
            Start Referring Now
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <UserPlus className="w-10 h-10 text-emerald-500 mb-3" />
            <CardTitle className="mb-1">Browse Jobs</CardTitle>
            <CardDescription>Explore job openings on Findr.</CardDescription>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <Send className="w-10 h-10 text-blue-500 mb-3" />
            <CardTitle className="mb-1">Refer Friends</CardTitle>
            <CardDescription>Share the job with your network.</CardDescription>
          </Card>
          <Card className="flex flex-col items-center p-6 text-center shadow-md">
            <Gift className="w-10 h-10 text-yellow-500 mb-3" />
            <CardTitle className="mb-1">Earn Rewards</CardTitle>
            <CardDescription>Get paid when your referral is hired.</CardDescription>
          </Card>
        </div>
      </section>

      {/* Featured Jobs with Rewards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-center mb-8">Featured Jobs with High Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge className="bg-green-100 text-green-800">{job.level}</Badge>
                </div>
                <CardDescription>Refer a friend for this position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">{job.reward}</div>
                <p className="text-sm text-gray-600">Potential reward for successful referral</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full gradient-bg text-white" onClick={() => router.push('/jobseeker/search')}>
                  Browse Similar Jobs
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
          <PlayCircle className="w-7 h-7 text-emerald-500" />
          Watch How It Works
        </h3>
        <p className="text-center text-gray-600 mb-4">Learn how you can start earning money by referring candidates.</p>
        <div className="flex justify-center">
          {videoError ? (
            <div className="rounded-xl shadow-lg w-full max-w-[1200px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: '300px' }}>
              <div className="text-center p-8">
                <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Unable to load video</p>
                <p className="text-sm text-gray-500">Please check if the video file exists at /referal.mp4</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setVideoError(false);
                    // Force reload by updating the video source
                    const video = document.querySelector('video') as HTMLVideoElement;
                    if (video) {
                      video.load();
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <video 
              autoPlay
              loop
              playsInline
              className="rounded-xl shadow-lg w-full max-w-[1200px] bg-black" 
              style={{ aspectRatio: '16/9', height: 'auto' }} 
              preload="auto"
              onError={(e) => {
                console.error('Video error:', e);
                const target = e.target as HTMLVideoElement;
                if (target.error) {
                  console.error('Video error code:', target.error.code, 'Message:', target.error.message);
                  console.error('Video src:', target.src);
                }
                setVideoError(true);
              }}
              onLoadStart={() => {
                console.log('Video loading started');
              }}
              onCanPlay={() => {
                console.log('Video can play');
                setVideoError(false);
              }}
            >
              <source src="/referal.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="w-full">
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
              You can track all your referrals and rewards in your Findr dashboard under the Referral History section.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-5">
            <AccordionTrigger>What makes a successful referral?</AccordionTrigger>
            <AccordionContent>
              A successful referral is when your referred candidate gets hired and completes their probation period. The reward amount varies based on the job level and salary.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-3xl mx-auto px-4 py-8 text-center">
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-gray-600 mb-6">Join thousands of job seekers who are already earning money through referrals.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="gradient-bg text-white px-8 py-3 text-lg" onClick={() => router.push('/jobseeker/search')}>
                Browse Jobs Now
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg" onClick={() => router.push('/jobseeker/referrals/history')}>
                View My Referrals
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 