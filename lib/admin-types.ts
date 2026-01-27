export interface Jobseeker {
    id: string;
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    location: string;
    nationality: string;
    currentRole: string;
    company: string;
    yearsOfExperience: number;
    industry: string;
    profileUrl: string;
    loginStatus?: 'active' | 'blocked'; 
  }
  
  export interface Employer {
    id: string;
    companyName: string;
    companyEmail: string;
    phoneNumber: string;
    website: string;
    industry: string;
    teamSize: string;
    foundedYear: number;
    profileUrl: string;
    loginStatus?: 'active' | 'blocked';
  }
  
  export interface ActiveJob {
    id: string;
    jobTitle: string;
    companyName: string;
    location: string;
    jobType: string;
    minimumSalary: number;
    maximumSalary: number;
    applicationDeadline: string;
    status: 'active' | 'paused' | 'closed';
    jobUrl: string;
  }
  
  export interface Application {
    id: string;
    candidate: string;
    jobTitle: string;
    applicationUrl: string;
  }
  
  export interface PremiumOrder {
    id: string;
    buyerName: string;
    startDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'cancelled';
    amount: number;
    orderUrl: string;
  }
  
  export interface PremiumService {
    id: string;
    buyerName: string;
    buyerType: 'jobseeker' | 'employer';
    serviceName: string;
    serviceType: string;
    orderDate: string;
    status: 'active' | 'in_progress' | 'payment_pending' | 'completed';
    amount: number;
    description: string;
    orderUrl: string;
  }
  
  export type AdminDataCategory = 'jobseekers' | 'employers' | 'activeJobs' | 'applications' | 'premiumOrders' | 'premiumServices';
  
  export interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: AdminDataCategory;
    data: any[];
    title: string;
  }