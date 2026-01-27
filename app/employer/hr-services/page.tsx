"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, TrendingUp, Shield, Clock, CheckCircle, Star, ArrowRight, Phone, Mail, Calendar } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function HRServicesPage() {
  const services = [
    {
      title: "Recruitment & Staffing",
      description: "End-to-end recruitment solutions for all your hiring needs",
      features: ["Executive Search", "Volume Hiring", "Contract Staffing", "RPO Services"],
      deliverables: ["Shortlisted Candidates", "Interview Coordination", "Offer Management", "Onboarding Support"],
      popular: true,
      price: "",
    },
    {
      title: "HR Compliance & Onboarding",
      description: "Ensure legal compliance and smooth employee onboarding",
      features: ["UAE Labor Law Compliance", "Employee Contracts", "Visa Processing", "Digital Onboarding"],
      deliverables: ["Compliance Reports", "Employee Files", "Visa Documents", "Onboarding Kits"],
      popular: false,
      price: "",
    },
    {
      title: "Performance Management",
      description: "Comprehensive performance evaluation and improvement systems",
      features: ["360° Feedback", "KPI Tracking", "Performance Reviews", "Goal Setting"],
      deliverables: ["Performance Reports", "KPI Dashboards", "Review Summaries", "Goal Sheets"],
      popular: false,
      price: "",
    },
    {
      title: "Training & Development",
      description: "Upskill your workforce with customized training programs",
      features: ["Leadership Training", "Technical Skills", "Soft Skills", "Certification Programs"],
      deliverables: ["Training Schedules", "Completion Certificates", "Feedback Reports", "Skill Assessments"],
      popular: true,
      price: "",
    },
    {
      title: "Payroll Management",
      description: "Accurate and compliant payroll processing services",
      features: ["Monthly Payroll", "Tax Calculations", "Benefits Administration", "Reporting"],
      deliverables: ["Payslips", "Tax Reports", "Benefits Statements", "Payroll Summaries"],
      popular: false,
      price: "",
    },
    {
      title: "HR Analytics & Reporting",
      description: "Data-driven insights for better HR decision making",
      features: ["Workforce Analytics", "Turnover Analysis", "Cost Analysis", "Custom Reports"],
      deliverables: ["Analytics Dashboards", "Turnover Reports", "Cost Analysis Sheets", "Custom Reports"],
      popular: false,
      price: "",
    },
  ]

  const { cart, addToCart, isInCart } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()
  const [quoteLoading, setQuoteLoading] = useState<string | null>(null)
  const [addedService, setAddedService] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)

  // Simulate backend quote request - now with actual database save
  const handleGetQuote = async (service: any) => {
    setQuoteLoading(service.title)
    
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to request a quote.",
          variant: "destructive",
        })
        setQuoteLoading(null)
        return
      }

      // Save quote request to database
      const response = await fetch('https://findr-jobboard-backend-production.up.railway.app/api/v1/quotes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service.title,
          requirements: `Quote request for ${service.title} - ${service.description}`,
          budget: "To be discussed",
          timeline: "Flexible"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit quote request')
      }

      // Original success message
      toast({
        title: "Thank you! Our team will contact you shortly with a quotation.",
        description: `Service: ${service.title}`,
      })
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit quote request. Please try again.'
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setQuoteLoading(null)
    }
  }

  // Add to cart logic
  const handleAddToCart = (service: any) => {
    if (!isInCart(service.title)) {
      addToCart({ title: service.title, description: service.description, price: service.price || "" })
      setAddedService(service.title)
      toast({
        title: `${service.title} has been added to your cart.`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold">HR Services</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Comprehensive HR solutions to streamline your business operations and enhance workforce management
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="card-shadow border-0 card-hover relative">
              {service.popular && (
                <Badge className="absolute -top-2 -right-2 gradient-bg text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              <CardHeader className="pb-2 pt-4 px-6">
                <CardTitle className="text-xl text-gray-900 mb-1 leading-tight">{service.title}</CardTitle>
                <CardDescription className="text-gray-600 mb-1 leading-snug">{service.description}</CardDescription>
                <Dialog open={openModal === service.title} onOpenChange={open => setOpenModal(open ? service.title : null)}>
                  <DialogTrigger asChild>
                    <button
                      className="text-emerald-700 font-medium underline hover:font-bold transition cursor-pointer mt-1 text-sm"
                      style={{ cursor: "pointer" }}
                    >
                      Know More
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{service.title}</DialogTitle>
                      <DialogDescription>{service.description}</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Features</h4>
                      <ul className="list-disc ml-6 mb-3 text-gray-700">
                        {service.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                      <h4 className="font-semibold mb-2">Deliverables</h4>
                      <ul className="list-disc ml-6 mb-3 text-gray-700">
                        {service.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4 pb-4 pt-2 px-6">
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 py-2 px-4 rounded-md border border-solid border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 hover:font-bold transition shadow"
                    style={{ background: "transparent" }}
                    onClick={() => handleAddToCart(service)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    className="gradient-bg text-white flex-1 py-2 px-4 rounded-md shadow"
                    style={{ cursor: "pointer" }}
                    disabled={quoteLoading === service.title}
                    onClick={() => handleGetQuote(service)}
                  >
                    {quoteLoading === service.title ? (
                      <span className="flex items-center"><span className="loader mr-2"></span>Sending...</span>
                    ) : (
                      <>
                        Get Quote
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Choose Our HR Services */}
        <Card className="card-shadow border-0 mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Why Choose Our HR Services?</CardTitle>
            <CardDescription className="text-lg">Trusted by 200+ companies across Dubai</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">UAE Compliant</h3>
                <p className="text-gray-600">Fully compliant with UAE labor laws and regulations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock support for all your HR needs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Proven Results</h3>
                <p className="text-gray-600">95% client satisfaction rate and proven ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="card-shadow border-0 gradient-bg text-white">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your HR?</h3>
                <p className="text-emerald-100 mb-6">
                  Get a free consultation with our HR experts and discover how we can help streamline your operations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5" />
                    <span>+971 54 551 5125</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5" />
                    <span>contact@findr.ae</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 mb-4">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Free Consultation
                </Button>
                <p className="text-emerald-100 text-sm">No commitment required • 30-minute session</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
