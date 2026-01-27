// Employer Profile Types

export interface EmployerContactPerson {
  name: string;
  email: string;
  phone: string;
}

export interface EmployerSocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
}

export interface EmployerDocuments {
  businessLicense: string;
  taxRegistration: string;
  otherDocuments: string[];
}

export interface HRService {
  serviceName: 'recruitment' | 'payroll' | 'training' | 'compliance' | 'performance' | 'analytics';
  status: 'active' | 'inactive' | 'pending';
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationSettings {
  email: {
    applications: boolean;
    messages: boolean;
    updates: boolean;
  };
  inApp: {
    applications: boolean;
    messages: boolean;
    updates: boolean;
  };
}

export interface EmployerProfile {
  // Basic Information
  email: string;
  role: string;
  name: string;
  profilePhoto: string;
  phoneNumber: string;
  
  // Company Information
  companyName: string;
  companyEmail: string;
  companyLogo: string;
  industry: string;
  teamSize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  foundedYear: number;
  aboutCompany: string;
  
  // Location Information
  companyLocation: string;
  city: string;
  country: string;
  
  // Contact Information
  website: string;
  contactPerson: EmployerContactPerson;
  
  // Social Links
  socialLinks: EmployerSocialLinks;
  
  // Job Management
  activeJobs: string[]; // Array of Job IDs
  postedJobs: string[]; // Array of Job IDs
  applications: string[]; // Array of Application IDs
  
  // Subscription & Status
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  subscriptionExpiry?: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  
  // Documents
  documents: EmployerDocuments;
  
  // HR Services
  hrServices: HRService[];
  
  // Notifications Settings
  notifications: NotificationSettings;
  
  // Profile Stats
  points: number;
  profileCompleted: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployerDashboardStats {
  jobStats: {
    total: number;
    active: number;
    draft: number;
    paused: number;
    closed: number;
  };
  applicationStats: {
    total: number;
    pending: number;
    shortlisted: number;
    interviewScheduled: number;
    hired: number;
    rejected: number;
  };
  recentApplications: any[]; // You can define a more specific type for applications
  topPerformingJobs: {
    _id: string;
    title: string;
    status: string;
    createdAt: Date;
    applicationCount: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}
