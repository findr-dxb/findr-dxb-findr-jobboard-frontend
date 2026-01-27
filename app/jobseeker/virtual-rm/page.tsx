"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, User, Mail, Phone, Calendar } from "lucide-react";

const service = {
  type: "Virtual RM Service",
  start: "2024-07-12",
  end: "2025-07-12",
  rm: {
    name: "Ayesha Khan",
    email: "ayesha.khan@findr.com",
    phone: "+971 50 123 4567",
  },
  status: "Ongoing",
};

export default function VirtualRMPage() {
  const [testimonial, setTestimonial] = useState({
    name: "",
    company: "",
    feedback: "",
    rating: 0,
    photo: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setTestimonial((t) => ({ ...t, [name]: files ? files[0] : value }));
  };
  const handleRating = (r: number) => setTestimonial((t) => ({ ...t, rating: r }));
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTestimonial({ name: "", company: "", feedback: "", rating: 0, photo: null });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center p-4 lg:p-8">
        <h1 className="text-3xl font-bold mb-2 mt-4 text-center">My Virtual RM Service Progress</h1>
        <p className="text-gray-600 mb-8 text-center">Track your ongoing Virtual RM service and share your experience with Findr.</p>
        <div className="w-full max-w-xl space-y-6">
          {/* Service Card */}
          <Card className="rounded-xl shadow bg-mint-50 border border-mint-100">
            <CardContent className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-mint-600" />
                <span className="font-semibold text-lg">{service.type}</span>
                <span className="ml-auto text-green-600 font-medium">{service.status}</span>
              </div>
              <div className="text-sm text-gray-700 mb-1">{service.start} – {service.end}</div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-mint-600" /> {service.rm.name}
                <Mail className="w-4 h-4 text-mint-600 ml-4" /> {service.rm.email}
                <Phone className="w-4 h-4 text-mint-600 ml-4" /> {service.rm.phone}
              </div>
            </CardContent>
          </Card>

          {/* Testimonial Form */}
          <Card className="rounded-xl shadow bg-white border border-mint-100">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2 text-mint-700">Share Your Experience</h2>
              <p className="text-gray-500 mb-4 text-sm">We value your feedback. Let others know how Findr helped you.</p>
              {submitted ? (
                <div className="text-green-600 font-semibold text-center">Thank you for your feedback!</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2 items-center mb-2">
                    <label className="text-xs text-gray-500">Upload photo</label>
                    <Input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-32" />
                  </div>
                  <Input name="name" value={testimonial.name} onChange={handleChange} placeholder="Your Name" className="rounded" required />
                  <Input name="company" value={testimonial.company} onChange={handleChange} placeholder="Designation / Company" className="rounded" required />
                  <textarea name="feedback" value={testimonial.feedback} onChange={handleChange} placeholder="Your feedback..." className="w-full border rounded p-2 text-sm" rows={3} required />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Rating:</span>
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} style={{ cursor: 'pointer', color: testimonial.rating >= star ? '#10b981' : '#d1d5db', fontSize: 22 }} onClick={() => handleRating(star)}>★</span>
                    ))}
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full mt-4 rounded" disabled={submitting}>{submitting ? "Submitting..." : "Submit Testimonial"}</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 