import { Button } from "@/components/ui/button";
import { CheckCircle, BarChart2, FileText, Star } from "lucide-react";

export default function PerformanceManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-emerald-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Performance Management</h1>
        <p className="text-lg md:text-2xl mb-6 opacity-90">Comprehensive performance evaluation and improvement systems</p>
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
          Our Performance Management service helps you evaluate, track, and improve employee performance through structured feedback and goal-setting systems. Empower your team to achieve more with actionable insights and continuous improvement.
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-4">
          <li>Boost productivity and engagement</li>
          <li>Identify and nurture top talent</li>
          <li>Align individual goals with business objectives</li>
        </ul>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-3">Features</h2>
        <ul className="space-y-2">
          {[
            "360° Feedback",
            "KPI Tracking",
            "Performance Reviews",
            "Goal Setting",
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
          <li>Initial Assessment</li>
          <li>Goal Setting</li>
          <li>Continuous Feedback</li>
          <li>Performance Reviews</li>
          <li>Development Planning</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-xl font-semibold mb-6">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <BarChart2 className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Data-Driven Insights</h3>
            <p className="text-gray-600 text-sm">Leverage analytics to make informed HR decisions.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <FileText className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Comprehensive Reporting</h3>
            <p className="text-gray-600 text-sm">Detailed reports for tracking progress and outcomes.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Star className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Employee Growth</h3>
            <p className="text-gray-600 text-sm">Support continuous development and career advancement.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 