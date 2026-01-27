import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Briefcase, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Started with <span className="gradient-text">Findr</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path and unlock opportunities in Dubai's dynamic job market
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Job Seeker Card */}
          <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-emerald-50 to-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 card-shadow">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Job Seeker</CardTitle>
              <CardDescription className="text-lg text-emerald-700">Find your dream career in Dubai</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Professional Resume Building</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Dedicated Relationship Manager</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Visa & Mobility Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Rewards & Points System</span>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <Link href="/signup?type=jobseeker">
                  <Button className="w-full h-12 gradient-bg text-white">
                    Sign Up as Job Seeker
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?type=jobseeker">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Already have an account? Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card className="card-shadow border-0 card-hover bg-gradient-to-br from-emerald-50 to-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 card-shadow">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Employer</CardTitle>
              <CardDescription className="text-lg text-emerald-700">Find top talent for your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Recruitment & Staffing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">HR Compliance & Onboarding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Performance Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Training & Development</span>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <Link href="/signup?type=employer">
                  <Button className="w-full h-12 gradient-bg text-white">
                    Sign Up as Employer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?type=employer">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Already have an account? Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Findr */}
        <Card className="card-shadow border-0 bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Why Choose Findr?</CardTitle>
            <CardDescription className="text-lg">
              The leading job platform in Dubai's business ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">1K+</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Active Job Seekers</h3>
                <p className="text-gray-600">Qualified professionals ready to contribute</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">200+</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Partner Companies</h3>
                <p className="text-gray-600">Leading businesses across Dubai</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">95%</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Success Rate</h3>
                <p className="text-gray-600">Successful job placements and hires</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
