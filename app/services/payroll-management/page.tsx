import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, DollarSign, Star } from "lucide-react";

export default function PayrollManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-emerald-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Payroll Management</h1>
        <p className="text-lg md:text-2xl mb-6 opacity-90">Accurate and compliant payroll processing services</p>
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
          Our Payroll Management service ensures your employees are paid accurately and on time, while maintaining full compliance with UAE regulations. We handle all payroll complexities so you can focus on your core business.
        </p>
        <ul className="list-disc ml-6 text-gray-700 mb-4">
          <li>Accurate and timely payroll processing</li>
          <li>Compliance with UAE tax and labor laws</li>
          <li>Confidential and secure data handling</li>
        </ul>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-3">Features</h2>
        <ul className="space-y-2">
          {[
            "Monthly Payroll",
            "Tax Calculations",
            "Benefits Administration",
            "Reporting",
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
          <li>Payroll Calculation</li>
          <li>Compliance Checks</li>
          <li>Salary Disbursement</li>
          <li>Reporting & Support</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-xl font-semibold mb-6">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Accurate Payments</h3>
            <p className="text-gray-600 text-sm">Ensure your team is paid correctly and on time, every time.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <FileText className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Regulatory Compliance</h3>
            <p className="text-gray-600 text-sm">Stay compliant with all UAE payroll and tax regulations.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center">
            <Star className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold mb-1">Confidentiality</h3>
            <p className="text-gray-600 text-sm">Your payroll data is handled with the highest level of security.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 