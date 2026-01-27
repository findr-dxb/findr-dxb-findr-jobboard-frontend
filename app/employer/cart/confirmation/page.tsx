"use client"
import React from "react";
import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center flex flex-col items-center">
        <span className="text-4xl mb-2">🎉</span>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Congratulations! You're Onboarded</h1>
        <p className="mb-8 text-gray-600">Your services have been activated. You can now track your service progress.</p>
        <button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-base mt-2"
          onClick={() => router.push("/employer/services/progress")}
        >
          View My Service Progress
        </button>
      </div>
    </div>
  );
} 