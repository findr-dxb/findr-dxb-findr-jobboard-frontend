import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { AuthRedirect } from "@/components/auth-redirect"

export default function HomePage() {
  return (
    <AuthRedirect>
      <div className="min-h-screen bg-white">
        <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Services Preview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Gateway to <span className="gradient-text">Success</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're seeking talent or opportunities, Findr connects you with the right match in Dubai's dynamic
              job market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Job Seeker Services */}
            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Job Seeker Services</CardTitle>
                <CardDescription className="text-base">
                  Accelerate your career with our comprehensive support system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Professional Resume Building</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Relationship Manager Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Visa & Mobility Assistance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Rewards & Points System</span>
                </div>
                <Link href="/login/jobseeker" className="block pt-4">
                  <Button className="w-full gradient-bg text-white">Get Started as Job Seeker</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Employer Services */}
            <Card className="border-2 hover:border-emerald-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Employer Services</CardTitle>
                <CardDescription className="text-base">
                  Streamline your hiring process with our expert HR solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Recruitment & Staffing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>HR Compliance & Onboarding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Performance Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Training & Development</span>
                </div>
                <Link href="/login/employer" className="block pt-4">
                  <Button className="w-full gradient-bg text-white">Get Started as Employer</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gradient-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Active Jobs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm md:text-base opacity-90">Job Seekers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">200+</div>
              <div className="text-sm md:text-base opacity-90">Companies</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">95%</div>
              <div className="text-sm md:text-base opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section: Two Stacked Carousels */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Our Users Say</h2>
          {/* Job Seeker Carousel */}
          <div>
            <h3 className="text-xl font-semibold text-center mb-6">Job Seekers</h3>
            <Carousel opts={{ loop: true, align: 'start' }} plugins={[]}>
              <CarouselContent className="flex">
                {[{
                  avatar: '/images/jobseeker1.jpg',
                  quote: 'Findr made my Dubai job search effortless. The resume builder and RM support were game changers. I landed my dream job in just 3 weeks!',
                  name: 'Sarah Johnson',
                  title: 'Marketing Manager, Dubai',
                  rating: 5
                }, {
                  avatar: '/images/jobseeker2.jpg',
                  quote: 'Thanks to Findr, I found a company that values my skills. The process was smooth and the support team was always available.',
                  name: 'Priya Mehra',
                  title: 'Software Engineer, Abu Dhabi',
                  rating: 5
                }, {
                  avatar: '/images/jobseeker3.jpg',
                  quote: 'The rewards system kept me motivated. I highly recommend Findr to anyone looking for a job in the UAE.',
                  name: 'Mohammed Al Farsi',
                  title: 'Accountant, Sharjah',
                  rating: 5
                }, {
                  avatar: '/images/placeholder-user.jpg',
                  quote: 'Findr’s RM service is top-notch. I got interview calls within days!',
                  name: 'Aisha Patel',
                  title: 'HR Assistant, Dubai',
                  rating: 5
                }].map((t, i) => (
                  <CarouselItem key={i} className="basis-full md:basis-1/2 lg:basis-1/3 flex justify-center">
                    <Card className="rounded-2xl shadow bg-gradient-to-br from-emerald-50 to-white border-0 w-full max-w-xs flex flex-col items-center">
                      <CardHeader className="flex flex-col items-center pt-8 pb-2">
                        <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-emerald-200" />
                      </CardHeader>
                      <CardContent className="flex flex-col items-center px-6 pb-8">
                        <p className="text-gray-600 mb-3 italic text-center">“{t.quote}”</p>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(t.rating)].map((_, idx) => (
                            <span key={idx} className="text-yellow-400 text-lg">★</span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-800 font-semibold">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.title}</div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          {/* Employer Carousel */}
          <div>
            <h3 className="text-xl font-semibold text-center mb-6">Employers</h3>
            <Carousel opts={{ loop: true, align: 'start' }} plugins={[]}>
              <CarouselContent className="flex">
                {[{
                  avatar: '/images/employer1.jpg',
                  quote: 'We hired 3 top candidates through Findr in record time. The platform’s HR tools and support are unmatched in the UAE.',
                  name: 'Ahmed Al-Rashid',
                  title: 'HR Director, Al Noor Holdings',
                  rating: 5
                }, {
                  avatar: '/images/employer2.jpg',
                  quote: 'Findr’s compliance and onboarding solutions saved us hours. Highly recommended for any growing business.',
                  name: 'Fatima Zahra',
                  title: 'Operations Manager, Tech Solutions',
                  rating: 5
                }, {
                  avatar: '/images/employer3.jpg',
                  quote: 'The analytics dashboard gave us insights we never had before. Our hiring process is now seamless.',
                  name: 'Omar Bin Saeed',
                  title: 'CEO, Future Innovations',
                  rating: 5
                }, {
                  avatar: '/images/employer4.jpg',
                  quote: 'Findr’s team is responsive and professional. We filled our urgent roles quickly.',
                  name: 'Lina Haddad',
                  title: 'Talent Acquisition Lead, MediaWorks',
                  rating: 5
                }].map((t, i) => (
                  <CarouselItem key={i} className="basis-full md:basis-1/2 lg:basis-1/3 flex justify-center">
                    <Card className="rounded-2xl shadow bg-gradient-to-br from-purple-50 to-white border-0 w-full max-w-xs flex flex-col items-center">
                      <CardHeader className="flex flex-col items-center pt-8 pb-2">
                        <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-purple-200 bg-white" />
                      </CardHeader>
                      <CardContent className="flex flex-col items-center px-6 pb-8">
                        <p className="text-gray-600 mb-3 italic text-center">“{t.quote}”</p>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(t.rating)].map((_, idx) => (
                            <span key={idx} className="text-yellow-400 text-lg">★</span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-800 font-semibold">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.title}</div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>
      </div>
    </AuthRedirect>
  )
}
