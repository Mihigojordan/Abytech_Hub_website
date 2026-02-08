import api from '../api/api';

class InternshipService {
  // Submit application (public)
  async submitApplication(data) {
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        institution: data.institution,
        fieldOfStudy: data.fieldOfStudy,
        level: data.level,
        country: data.country,
        city: data.city,
        internshipType: data.internshipType,
        period: data.period,
        preferredStart: data.preferredStart,
        preferredEnd: data.preferredEnd,
        coverLetter: data.coverLetter,
        skills: data.skills,
        cvUrl: data.cvUrl,
        portfolioUrl: data.portfolioUrl,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
      };

      const response = await api.post('/internships/apply', payload);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit application';
      throw new Error(msg);
    }
  }

  // Get all applications with filters (admin only)
  async getAllApplications({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    internshipType = '',
    period = '',
    isShortlisted = '',
    isContacted = '',
    country = '',
  } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (internshipType) params.internshipType = internshipType;
      if (period) params.period = period;
      if (isShortlisted) params.isShortlisted = isShortlisted;
      if (isContacted) params.isContacted = isContacted;
      if (country) params.country = country;

      const response = await api.get('/internships', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch applications';
      throw new Error(msg);
    }
  }

  // Get shortlisted applications
  async getShortlistedApplications(limit = 10) {
    try {
      const response = await api.get('/internships/shortlisted', { params: { limit } });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch shortlisted applications';
      throw new Error(msg);
    }
  }

  // Get application statistics
  async getApplicationStats() {
    try {
      const response = await api.get('/internships/stats');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch application stats';
      throw new Error(msg);
    }
  }

  // Get one application by ID
  async getApplicationById(id) {
    try {
      const response = await api.get(`/internships/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch application';
      throw new Error(msg);
    }
  }

  // Update application
  async updateApplication(id, data) {
    try {
      const response = await api.put(`/internships/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update application';
      throw new Error(msg);
    }
  }

  // Update application status
  async updateApplicationStatus(id, status) {
    try {
      const response = await api.patch(`/internships/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update application status';
      throw new Error(msg);
    }
  }

  // Review application
  async reviewApplication(id, reviewData) {
    try {
      const response = await api.post(`/internships/${id}/review`, reviewData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to review application';
      throw new Error(msg);
    }
  }

  // Toggle shortlist
  async toggleShortlist(id) {
    try {
      const response = await api.patch(`/internships/${id}/shortlist`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to toggle shortlist';
      throw new Error(msg);
    }
  }

  // Mark as contacted
  async markAsContacted(id) {
    try {
      const response = await api.patch(`/internships/${id}/contacted`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to mark as contacted';
      throw new Error(msg);
    }
  }

  // Bulk update status
  async bulkUpdateStatus(ids, status) {
    try {
      const response = await api.patch('/internships/bulk/status', { ids, status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to bulk update status';
      throw new Error(msg);
    }
  }

  // Delete application
  async deleteApplication(id) {
    try {
      const response = await api.delete(`/internships/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete application';
      throw new Error(msg);
    }
  }
}

const internshipService = new InternshipService();
export default internshipService;

export const {
  submitApplication,
  getAllApplications,
  getShortlistedApplications,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  reviewApplication,
  toggleShortlist,
  markAsContacted,
  bulkUpdateStatus,
  deleteApplication,
} = internshipService;
