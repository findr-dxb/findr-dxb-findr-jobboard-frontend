import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { authApi, handleApiError } from '@/lib/api';

interface ProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  dateOfBirth?: string;
  nationality?: string;
  emirateId?: string;
  passportNumber?: string;
  introVideo?: string;
  professionalSummary?: string;
  professionalExperience?: Array<{
    currentRole: string;
    company: string;
    yearsOfExperience: number;
    industry: string;
  }>;
  education?: Array<{
    highestDegree: string;
    institution: string;
    yearOfGraduation: number;
    gradeCgpa: string;
  }>;
  skills?: string[];
  certifications?: string[];
  jobPreferences?: {
    preferredJobType: string[];
    salaryExpectation: string;
    preferredLocation: string;
    availability: string;
    resumeAndDocs: string[];
  };
  socialLinks?: {
    linkedIn?: string;
    instagram?: string;
    twitterX?: string;
  };
}

interface EmployerProfileData {
  companyName: string;
  industry: string;
  companySize: string;
  companyLocation: string;
  contactPerson: string;
  companyDescription: string;
  website?: string;
  socialLinks?: {
    linkedIn?: string;
    twitter?: string;
    facebook?: string;
  };
}

export function useProfile() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserProfile = async (data: ProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const success = await updateProfile(data);
      
      if (!success) {
        throw new Error('Failed to update profile');
      }

      return true;
    } catch (err: any) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployerProfile = async (data: EmployerProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (user.type !== 'employer') {
        throw new Error('Only employers can update company profile');
      }

      const response = await authApi.updateEmployerProfile(data);
      return true;
    } catch (err: any) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await authApi.getUserProfile();
      return response.data;
    } catch (err: any) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    updateEmployerProfile,
    fetchProfile,
    isLoading,
    error,
    user
  };
}
