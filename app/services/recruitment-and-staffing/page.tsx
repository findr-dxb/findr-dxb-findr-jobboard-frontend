import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Clock, Star } from "lucide-react";
import Link from "next/link";

export default function RecruitmentStaffingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-emerald-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Recruitment & Staffing</h1>
        <p className="text-lg md:text-2xl mb-6 opacity-90">End-to-end recruitment solutions for all your hiring needs</p>
        <div className="flex justify-center gap-3 mt-4">
          <Button
            className="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 px-4 py-1.5 h-9 text-[14px] rounded"
            style={{ fontSize: 14, borderRadius: 6 }}
          >
            Add to Cart
          </Button>
          <Button
            className="gradient-bg text-white hover:opacity-90 px-4 py-1.5 h-9 text-[14px] rounded"
            style={{ fontSize: 14, borderRadius: 6 }}
          >
            Get Quote
          </Button>
        </div>
      </section>

      {/* Overview */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-semibold mb-3">Service Overview</h2>
        <p className="text-gray-700 mb-4">
          Our Recruitment & Staffing service provides comprehensive solutions to help you find, attract, and onboard top talent efficiently. We leverage our deep market expertise and advanced sourcing techniques to ensure you get the best candidates for your business needs.
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-4">
          <li>Access to a large pool of qualified candidates</li>
          <li>Streamlined hiring process</li>
          <li>Personalized support from industry experts</li>
        </ul>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-3">Features</h2>
        <ul className="space-y-2">
          {[
            "Executive Search",
            "Volume Hiring",
            "Contract Staffing",
            "RPO Services",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-gray-800">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-3">How It Works</h2>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Requirement Gathering</li>
          <li>Candidate Sourcing</li>
          <li>Shortlisting</li>
          <li>Interview Coordination</li>
          <li>Onboarding Support</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-xl font-semibold mb-6">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Clock className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Fast Turnaround</h3>
            <p className="text-gray-600 text-sm">Quick and efficient hiring process to fill your vacancies faster.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">UAE Hiring Expertise</h3>
            <p className="text-gray-600 text-sm">Deep knowledge of the UAE job market and compliance requirements.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Star className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Personalized Support</h3>
            <p className="text-gray-600 text-sm">Dedicated account managers to guide you at every step.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 