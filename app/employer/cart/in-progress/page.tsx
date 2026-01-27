"use client"
import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const mockServices = [
  { name: "Payroll Management", status: "In Progress" },
  { name: "HR Analytics & Reporting", status: "In Progress" },
];

export default function InProgressPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="flex flex-col items-center text-center">
          <span className="text-4xl mb-2">📝</span>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Thank you for your request</h1>
          <p className="text-gray-600 mb-6">
            One of our team members will contact you shortly to proceed with payment and onboarding.
          </p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-yellow-500" /> Service Summary
          </h2>
          <ul>
            {mockServices.map((service, idx) => (
              <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                <span className="text-gray-700">{service.name}</span>
                <span className="text-yellow-600 font-medium">{service.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-gray-500 text-center mt-4">
          Status for all selected services: <span className="font-semibold text-yellow-600">In Progress</span>
        </div>
        <div className="flex justify-center mt-6">
          <Button
            className="gradient-bg text-white"
            onClick={() => router.push("/employer/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 