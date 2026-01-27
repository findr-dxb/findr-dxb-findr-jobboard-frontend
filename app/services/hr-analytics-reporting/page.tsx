import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart2, FileText, Star } from "lucide-react";

export default function HRAnalyticsReportingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-emerald-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">HR Analytics & Reporting</h1>
        <p className="text-lg md:text-2xl mb-6 opacity-90">Data-driven insights for better HR decision making</p>
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
          Our HR Analytics & Reporting service empowers your business with actionable insights from workforce data. Make informed decisions, optimize HR strategies, and drive organizational success with our comprehensive analytics solutions.
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-4">
          <li>Visualize key HR metrics and trends</li>
          <li>Identify areas for improvement</li>
          <li>Support data-driven HR strategies</li>
        </ul>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-3">Features</h2>
        <ul className="space-y-2">
          {[
            "Workforce Analytics",
            "Turnover Analysis",
            "Cost Analysis",
            "Custom Reports",
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
          <li>Data Collection</li>
          <li>Analysis & Visualization</li>
          <li>Report Generation</li>
          <li>Strategy Recommendations</li>
          <li>Ongoing Monitoring</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-xl font-semibold mb-6">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <BarChart2 className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Actionable Insights</h3>
            <p className="text-gray-600 text-sm">Transform data into strategies that drive results.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <FileText className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Custom Reporting</h3>
            <p className="text-gray-600 text-sm">Tailored reports to meet your unique business needs.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Star className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Expert Support</h3>
            <p className="text-gray-600 text-sm">Guidance from experienced HR analytics professionals.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 