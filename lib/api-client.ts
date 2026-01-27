const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1';

class ApiClient {
  private getAuthHeaders() {
    // Only access localStorage on client side
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Job Management
  async getEmployerJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/employer`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async createJob(jobData: any) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    return response.json();
  }

  async updateJobStatus(jobId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  // Application Management
  async getEmployerApplications() {
    const response = await fetch(`${API_BASE_URL}/applications/employer`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async getJobApplications(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    return response.json();
  }

  async rateApplicant(applicationId: string, rating: number, feedback?: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/rate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rating, feedback })
    });
    return response.json();
  }

  // Dashboard Analytics
  async getEmployerDashboard() {
    const response = await fetch(`${API_BASE_URL}/applications/dashboard`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async getEmployerDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/employer/dashboard/stats`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // Employer Profile Management
  async getEmployerProfile() {
    const response = await fetch(`${API_BASE_URL}/employer/profile/details`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  async updateEmployerProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/employer/profile/update`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return response.json();
  }

  async updateEmployerSubscription(subscriptionData: any) {
    const response = await fetch(`${API_BASE_URL}/employer/subscription`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subscriptionData)
    });
    return response.json();
  }

  async updateEmployerHRServices(hrServicesData: any) {
    const response = await fetch(`${API_BASE_URL}/employer/hr-services`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ hrServices: hrServicesData })
    });
    return response.json();
  }

  async updateEmployerNotifications(notificationsData: any) {
    const response = await fetch(`${API_BASE_URL}/employer/notifications`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notifications: notificationsData })
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
