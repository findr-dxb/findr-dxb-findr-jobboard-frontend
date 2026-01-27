"use client"
import React, { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";

const mockServices = [
  {
    name: "Payroll Management",
    status: "Ongoing",
    tenureStart: "2024-06-01",
    tenureEnd: "2025-06-01",
    accountManager: {
      name: "Ayesha Khan",
      email: "ayesha.khan@findr.com",
      phone: "+971 50 123 4567",
    },
    gradient: "from-emerald-50 to-emerald-100",
  },
  {
    name: "HR Analytics & Reporting",
    status: "Ongoing",
    tenureStart: "2024-06-01",
    tenureEnd: "2025-06-01",
    accountManager: {
      name: "Ayesha Khan",
      email: "ayesha.khan@findr.com",
      phone: "+971 50 123 4567",
    },
    gradient: "from-blue-50 to-blue-100",
  },
];

export default function ServiceProgressPage() {
  const [testimonial, setTestimonial] = useState("");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send testimonial/rating/name/designation/photo to backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center pt-6 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-sans">My HR Service Progress</h1>
          <div className="flex justify-center mt-2 mb-2">
            <div className="h-1 w-24 rounded-full bg-emerald-200" />
          </div>
          <p className="text-md text-gray-500 mb-2">Track your ongoing HR services and share your experience with Findr.</p>
        </div>

        {/* Services Section */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold text-gray-800">Active HR Services</span>
            <div className="h-1 w-8 rounded-full bg-emerald-100" />
          </div>
          <div className="flex flex-col gap-6">
            {mockServices.map((service, idx) => (
              <Card
                key={idx}
                className={`card-shadow card-hover border-0 rounded-2xl bg-gradient-to-br ${service.gradient} p-0`}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                  <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      {service.name}
                      <Badge className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold border-0">
                        {service.status}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center text-gray-600 text-sm gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">{service.tenureStart} → {service.tenureEnd}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-4 p-6 pt-2">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white border-2 border-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex flex-col text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">{service.accountManager.name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-emerald-400" /> {service.accountManager.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-emerald-400" /> {service.accountManager.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="max-w-3xl mx-auto mt-8">
          <Card className="card-shadow card-hover border-0 rounded-2xl bg-gradient-to-br from-white to-emerald-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-6 h-6 text-emerald-400" />
                <CardTitle className="text-lg font-bold text-gray-800">Share Your Experience</CardTitle>
              </div>
              <p className="text-gray-500 text-sm">We value your feedback. Let others know how Findr helped you.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <label className="flex flex-col items-center cursor-pointer w-full md:w-auto">
                    {photo ? (
                      <img src={photo} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100 mb-1" />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-gray-300 mb-1" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <span className="text-xs text-emerald-600 hover:underline">Upload photo</span>
                  </label>
                  <div className="flex flex-col gap-4 flex-1">
                    <input
                      className="border rounded-xl p-3 text-sm focus:outline-emerald-400 bg-emerald-50/20"
                      placeholder="Your Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <input
                      className="border rounded-xl p-3 text-sm focus:outline-emerald-400 bg-emerald-50/20"
                      placeholder="Designation / Company"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <textarea
                  className="w-full border rounded-xl p-3 text-sm focus:outline-emerald-400 bg-emerald-50/20"
                  rows={3}
                  placeholder="Your feedback..."
                  value={testimonial}
                  onChange={e => setTestimonial(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-sm">Rating:</span>
                  {[1,2,3,4,5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className={`transition-transform ${star <= rating ? "text-yellow-400 scale-110" : "text-gray-300"} text-2xl hover:scale-110 cursor-pointer`}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >★</button>
                  ))}
                </div>
                <Button
                  type="submit"
                  className="gradient-bg text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-colors mt-2"
                  disabled={submitted}
                >
                  {submitted ? "Thank you for your feedback!" : "Submit Testimonial"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 