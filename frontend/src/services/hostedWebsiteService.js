import api from '../api/api';

class HostedWebsiteService {
  // Create hosted website
  async createWebsite(data) {
    try {
      const response = await api.post('/hosted-websites', {
        name: data.name,
        domain: data.domain,
        description: data.description,
        status: data.status,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create website';
      throw new Error(msg);
    }
  }

  // Get all websites with pagination and filters
  async getAllWebsites({ page = 1, limit = 10, search = '', status = '' } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/hosted-websites', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch websites';
      throw new Error(msg);
    }
  }

  // Get active websites (public)
  async getActiveWebsites() {
    try {
      const response = await api.get('/hosted-websites/active');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch active websites';
      throw new Error(msg);
    }
  }

  // Get website statistics
  async getWebsiteStats() {
    try {
      const response = await api.get('/hosted-websites/stats');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch website stats';
      throw new Error(msg);
    }
  }

  // Check domain availability
  async checkDomainAvailability(domain) {
    try {
      const response = await api.get(`/hosted-websites/check-domain/${domain}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to check domain availability';
      throw new Error(msg);
    }
  }

  // Get website by domain
  async getWebsiteByDomain(domain) {
    try {
      const response = await api.get(`/hosted-websites/domain/${domain}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch website';
      throw new Error(msg);
    }
  }

  // Get one website by ID
  async getWebsiteById(id) {
    try {
      const response = await api.get(`/hosted-websites/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch website';
      throw new Error(msg);
    }
  }

  // Update website
  async updateWebsite(id, data) {
    try {
      const response = await api.put(`/hosted-websites/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update website';
      throw new Error(msg);
    }
  }

  // Update website status
  async updateWebsiteStatus(id, status) {
    try {
      const response = await api.patch(`/hosted-websites/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update website status';
      throw new Error(msg);
    }
  }

  // Suspend website
  async suspendWebsite(id) {
    try {
      const response = await api.patch(`/hosted-websites/${id}/suspend`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to suspend website';
      throw new Error(msg);
    }
  }

  // Activate website
  async activateWebsite(id) {
    try {
      const response = await api.patch(`/hosted-websites/${id}/activate`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to activate website';
      throw new Error(msg);
    }
  }

  // Mark as expired
  async expireWebsite(id) {
    try {
      const response = await api.patch(`/hosted-websites/${id}/expire`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to expire website';
      throw new Error(msg);
    }
  }

  // Delete website
  async deleteWebsite(id) {
    try {
      const response = await api.delete(`/hosted-websites/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete website';
      throw new Error(msg);
    }
  }
}

const hostedWebsiteService = new HostedWebsiteService();
export default hostedWebsiteService;

export const {
  createWebsite,
  getAllWebsites,
  getActiveWebsites,
  getWebsiteStats,
  checkDomainAvailability,
  getWebsiteByDomain,
  getWebsiteById,
  updateWebsite,
  updateWebsiteStatus,
  suspendWebsite,
  activateWebsite,
  expireWebsite,
  deleteWebsite,
} = hostedWebsiteService;
