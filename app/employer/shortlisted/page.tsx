"use client";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";

const shortlisted = [
  {
    name: "Sarah Johnson",
    job: "Senior Software Engineer",
    date: "2024-07-12",
    status: "Shortlisted",
  },
  {
    name: "Emma Wilson",
    job: "HR Coordinator",
    date: "2024-07-11",
    status: "Shortlisted",
  },
  {
    name: "Ayesha Khan",
    job: "UI/UX Designer",
    date: "2024-07-10",
    status: "Shortlisted",
  },
];

export default function ShortlistedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Shortlisted Applicants</h1>
            <p className="text-gray-600 text-base">List of all shortlisted candidates</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {shortlisted.map((app, idx) => (
              <Card
                key={idx}
                className="transition-shadow duration-200 card-shadow border-0 bg-white rounded-2xl hover:shadow-lg flex flex-col justify-between min-h-[150px]"
              >
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-gray-900">{app.name}</span>
                    <Badge className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800">{app.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">Position: <span className="font-medium text-gray-800">{app.job}</span></div>
                  <div className="text-xs text-gray-500">Shortlisted on: {app.date}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 