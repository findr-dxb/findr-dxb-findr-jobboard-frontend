"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CompanyProfileView } from "@/components/company-profile";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface CompanyProfileData {
  _id: string;
  companyName: string;
  industry: string;
  teamSize: string;
  foundedYear: number;
  about: string;
  location: {
    city: string;
    country: string;
    officeAddress: string;
  };
  website: string;
  verified: boolean;
  logo: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
  };
  activeJobsCount: number;
  totalJobsPosted: number;
  memberSince: string;
}

export default function CompanyProfilePage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  
  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch company profile from API
        const response = await axios.get(`https://findr-jobboard-backend-production.up.railway.app/api/v1/company/${companyId}`);
        
        if (response.data.success) {
          setCompany(response.data.data);
        } else {
          setError("Company not found");
        }
      } catch (error: any) {
        console.error('Error fetching company profile:', error);
        setError(error.response?.data?.message || "Failed to load company profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "We couldn't find the company profile you were looking for."}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Transform the API data to match the CompanyProfileView expected format
  const transformedCompany = {
    companyName: company.companyName,
    industry: company.industry,
    teamSize: company.teamSize,
    foundedYear: company.foundedYear.toString(),
    about: company.about,
    location: company.location,
    website: company.website,
    verified: company.verified,
    logo: company.logo,
    socialLinks: company.socialLinks,
    // Add some computed/default fields for compatibility
    specialties: [], // We can enhance this later if needed
    workCulture: [], // We can enhance this later if needed
    achievements: [], // We can enhance this later if needed
    // Add new dynamic fields
    activeJobsCount: company.activeJobsCount,
    totalJobsPosted: company.totalJobsPosted,
    memberSince: company.memberSince,
  };

  return <CompanyProfileView company={transformedCompany} />;
}
