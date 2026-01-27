import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config: any) => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('findr_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
  }
  return config;
});

// Auth API functions
export const authApi = {
  login: async (email: string, password: string, role: string) => {
    const response = await api.post('/login', { email, password, role });
    return response.data;
  },

  signup: async (data: {
    email: string;
    password: string;
    role: string;
    name?: string;
    fullName?: string;
    [key: string]: any;
  }) => {
    console.log('API Service: Making signup request to:', `${API_BASE_URL}/signup`);
    console.log('API Service: Request data:', data);
    try {
      const response = await api.post('/signup', data);
      console.log('API Service: Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service: Signup error:', error);
      throw error;
    }
  },

  getUserProfile: async () => {
    const response = await api.get('/profile/details');
    return response.data;
  },

  updateProfile: async (data: {
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
  }) => {
    const response = await api.put('/profile/update', data);
    return response.data;
  },

  // For employer profile updates
  updateEmployerProfile: async (data: {
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
  }) => {
    const response = await api.put('/profile/employer', data);
    return response.data;
  },

  // Admin login
  adminLogin: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
};

// Error handler helper
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.message || 'An error occurred';
    const status = error.response.status;
    
    // Handle specific error cases
    if (status === 400 && message.includes('already exists')) {
      return {
        message: 'An account with this email already exists. Please try logging in instead.',
        status,
      };
    }
    
    return {
      message,
      status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Unable to connect to server. Please check your internet connection.',
      status: 503,
    };
  } else {
    // Error in request setup
    return {
      message: 'Request failed. Please try again.',
      status: 400,
    };
  }
};
