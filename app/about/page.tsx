import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Heart, Rocket } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Findr</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing the way talent connects with opportunity in Dubai's dynamic business landscape.
          </p>
        </div>

        {/* Mission, Values, Goals */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-2 hover:border-emerald-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To bridge the gap between exceptional talent and forward-thinking companies, creating meaningful
                connections that drive success for both job seekers and employers in Dubai's thriving economy.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-emerald-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Core Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Integrity & Transparency</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Excellence in Service</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Innovation & Growth</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Diversity & Inclusion</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-emerald-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Future Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Expand across the GCC</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>AI-powered matching</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Skills development platform</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Global talent network</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Findr */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Why Choose <span className="gradient-text">Findr</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Local Expertise</h3>
                  <p className="text-gray-600">Deep understanding of Dubai's job market and business culture.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Comprehensive Support</h3>
                  <p className="text-gray-600">End-to-end services from job search to visa assistance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Quality Matches</h3>
                  <p className="text-gray-600">Rigorous screening ensures the best fit for both parties.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Technology-Driven</h3>
                  <p className="text-gray-600">Modern platform with intuitive user experience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reward System</h3>
                  <p className="text-gray-600">Earn points and unlock exclusive benefits as you engage.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Proven Results</h3>
                  <p className="text-gray-600">Track record of successful placements and satisfied clients.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
