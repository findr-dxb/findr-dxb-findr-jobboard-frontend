import { Jobseeker, Employer } from './admin-types';

// Auth headers helper - Note: Admin routes don't use authentication (following existing pattern)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Dashboard Statistics Types
export interface DashboardStats {
  jobseekers: number;
  employers: number;
  activeJobs: number;
  applications: number;
  servicesOrders: number;
  premiumOrders: number;
  monthlyOrders: number;
}

export interface NationalityDemographics {
  total: number;
  countries: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
}

export interface IndustryDistribution {
  total: number;
  source?: "jobseeker" | "applications" | "employers" | "none";
  industries: Array<{
    industry: string;
    count: number;
    percentage: number;
  }>;
}

export interface RecentLoginUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  type: "candidate" | "employer";
  status: "active" | "inactive";
  loginAt: string;
}

export interface RecentLogins {
  total: number;
  users: RecentLoginUser[];
}

export interface ActiveUsersToday {
  total: number;
  candidates: number;
  employers: number;
  date: string;
  hourly: Array<{
    hour: number;
    label: string;
    count: number;
  }>;
}

export interface DashboardAnalytics {
  recentApplications: number;
  recentJobs: number;
  topEmployers: Array<{
    _id: string;
    jobCount: number;
    employerInfo: Array<{
      companyName: string;
      email: string;
    }>;
  }>;
  userGrowth: {
    newJobseekers: number;
    newEmployers: number;
    total: number;
  };
}

// Users API Types
export interface UsersApiResponse {
  users: Jobseeker[] | Employer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface UsersApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Base URL - adjust according to your backend setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Users API Functions
export const getJobseekers = async (params: UsersApiParams = {}): Promise<UsersApiResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder
    });

    const response = await fetch(`${API_BASE_URL}/admin/users/jobseeker?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch jobseekers');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching jobseekers:', error);
    // Return fallback data in case of error
    return {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
      }
    };
  }
};

export const getEmployers = async (params: UsersApiParams = {}): Promise<UsersApiResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder
    });

    const response = await fetch(`${API_BASE_URL}/admin/users/employer?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch employers');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching employers:', error);
    // Return fallback data in case of error
    return {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
      }
    };
  }
};

// Generic function to get users by type
export const getUsersByType = async (
  userType: 'jobseeker' | 'employer',
  params: UsersApiParams = {}
): Promise<UsersApiResponse> => {
  if (userType === 'jobseeker') {
    return getJobseekers(params);
  } else {
    return getEmployers(params);
  }
};

// Jobs API Types and Functions
export interface JobsApiResponse {
  jobs: ActiveJob[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface JobsApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'paused' | 'closed' | 'all';
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
  description?: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  views?: number;
  employerInfo?: {
    name: string;
    email: string;
    logo?: string;
  };
  postedDate?: string;
  lastUpdated?: string;
}

// Get all jobs (active by default)
export const getJobs = async (params: JobsApiParams = {}): Promise<JobsApiResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
      status
    });

    const response = await fetch(`${API_BASE_URL}/admin/jobs?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch jobs');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return fallback data in case of error
    return {
      jobs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
      }
    };
  }
};

// Update job status
export const updateJobStatus = async (jobId: string, status: 'active' | 'paused' | 'closed'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update job status');
    }

    return true;
  } catch (error) {
    console.error('Error updating job status:', error);
    return false;
  }
};

// Delete job
export const deleteJob = async (jobId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete job');
    }

    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
};

// Dashboard Statistics API Functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch dashboard statistics');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback data in case of error
    return {
      jobseekers: 0,
      employers: 0,
      activeJobs: 0,
      applications: 0,
      servicesOrders: 0,
      premiumOrders: 0,
      monthlyOrders: 0,
    };
  }
};

export const getNationalityDemographics = async (): Promise<NationalityDemographics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/nationality`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch nationality demographics');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching nationality demographics:', error);
    return { total: 0, countries: [] };
  }
};

export const getIndustryDistribution = async (): Promise<IndustryDistribution> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/industry`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch industry distribution');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching industry distribution:', error);
    return { total: 0, industries: [] };
  }
};

export const getRecentLogins = async (): Promise<RecentLogins> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/recent-logins`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch recent logins');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching recent logins:', error);
    return { total: 0, users: [] };
  }
};

export const getActiveUsersToday = async (): Promise<ActiveUsersToday> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/active-users-today`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch active users today');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching active users today:', error);
    return {
      total: 0,
      candidates: 0,
      employers: 0,
      date: new Date().toISOString(),
      hourly: [],
    };
  }
};

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch dashboard analytics');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    // Return fallback data in case of error
    return {
      recentApplications: 0,
      recentJobs: 0,
      topEmployers: [],
      userGrowth: {
        newJobseekers: 0,
        newEmployers: 0,
        total: 0,
      },
    };
  }
};

// Simulated API functions for user management
// In a real application, these would make HTTP requests to your backend

export const blockUser = async (userId: string, userType: 'jobseeker' | 'employer'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status: 'blocked' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to block user');
    }

    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
};

export const unblockUser = async (userId: string, userType: 'jobseeker' | 'employer'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status: 'active' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to unblock user');
    }

    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
};

export const getUserStatus = async (userId: string, userType: 'jobseeker' | 'employer'): Promise<'active' | 'blocked'> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In a real implementation, this would make a GET request to your backend
  // Example: const response = await fetch(`/api/users/${userId}/status`);
  // return response.json();
  
  // For demo purposes, return a random status
  return Math.random() > 0.5 ? 'active' : 'blocked';
};

// Get individual user by ID
export const getJobseekerById = async (id: string): Promise<Jobseeker> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/jobseeker/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch jobseeker details');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching jobseeker by ID:', error);
    throw error;
  }
};

export const getEmployerById = async (id: string): Promise<Employer> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/employer/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch employer details');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching employer by ID:', error);
    throw error;
  }
};
