"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  Users, 
  Globe, 
  Calendar, 
  ArrowLeft,
  Award,
  TrendingUp,
  Briefcase,
  LinkedinIcon,
  TwitterIcon,
  FacebookIcon,
  BriefcaseIcon
} from "lucide-react";

interface CompanyProfileData {
  companyName: string;
  industry: string;
  teamSize: string;
  foundedYear: string;
  about: string;
  location: {
    city: string;
    country: string;
    officeAddress?: string;
  };
  website?: string;
  verified: boolean;
  logo?: string;
  specialties?: string[];
  achievements?: string[];
  workCulture?: string[];
  // New dynamic fields
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  activeJobsCount?: number;
  totalJobsPosted?: number;
  memberSince?: string;
}

interface CompanyProfileViewProps {
  company: CompanyProfileData;
}

export function CompanyProfileView({ company }: CompanyProfileViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* <Navbar /> */}

      <main className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Back Button */}
          {/* <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center text-blue-600 hover:text-blue-800 px-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Previous Page
            </Button>
          </div> */}

          {/* Company Header Card */}
          <Card className="card-shadow border-0 bg-gradient-to-r from-blue-50 to-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center card-shadow flex-shrink-0">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={`${company.companyName} logo`} 
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <Building className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.companyName}</h1>
                    {company.verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-3">
                    <span className="flex items-center font-medium">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {company.industry}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {company.location.city}, {company.location.country}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {company.teamSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Founded {company.foundedYear}
                    </span>
                    {company.website && (
                      <span className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Visit Website
                        </a>
                      </span>
                    )}
                    {company.activeJobsCount !== undefined && (
                      <span className="flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-2" />
                        {company.activeJobsCount} active jobs
                      </span>
                    )}
                    {company.memberSince && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Member since {new Date(company.memberSince).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Overview */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building className="w-4 h-4 mr-2 text-blue-600" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{company.about}</p>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold text-gray-900">Industry</span>
                  </div>
                  <div className="text-sm text-gray-600">{company.industry}</div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold text-gray-900">Team Size</span>
                  </div>
                  <div className="text-sm text-gray-600">{company.teamSize}</div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold text-gray-900">Founded</span>
                  </div>
                  <div className="text-sm text-gray-600">{company.foundedYear}</div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold text-gray-900">Location</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {company.location.officeAddress && (
                      <div>{company.location.officeAddress}</div>
                    )}
                    <div>{company.location.city}, {company.location.country}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Specialties */}
          {company.specialties && company.specialties.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="w-4 h-4 mr-2 text-purple-600" />
                  Company Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {company.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Culture */}
          {company.workCulture && company.workCulture.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  Work Culture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {company.workCulture.map((culture, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{culture}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Company Achievements */}
          {company.achievements && company.achievements.length > 0 && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="w-4 h-4 mr-2 text-amber-600" />
                  Company Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {company.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {company.socialLinks && (company.socialLinks.linkedin || company.socialLinks.twitter || company.socialLinks.facebook) && (
            <Card className="card-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Globe className="w-4 h-4 mr-2 text-blue-600" />
                  Connect with Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {company.socialLinks.linkedin && (
                    <a
                      href={company.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  )}
                  {company.socialLinks.twitter && (
                    <a
                      href={company.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      <TwitterIcon className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  )}
                  {company.socialLinks.facebook && (
                    <a
                      href={company.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <FacebookIcon className="w-4 h-4 mr-2" />
                      Facebook
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
