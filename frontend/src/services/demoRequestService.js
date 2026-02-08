import api from '../api/api';

class DemoRequestService {
  // Submit demo request (public)
  async submitDemoRequest(data) {
    try {
      const response = await api.post('/demo-requests', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        message: data.message,
        product: data.product,
        demoType: data.demoType,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit demo request';
      throw new Error(msg);
    }
  }

  // Get all demo requests with filters (admin only)
  async getAllDemoRequests({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    demoType = '',
    assignedToId = '',
  } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (demoType) params.demoType = demoType;
      if (assignedToId) params.assignedToId = assignedToId;

      const response = await api.get('/demo-requests', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch demo requests';
      throw new Error(msg);
    }
  }

  // Get pending requests
  async getPendingRequests(limit = 10) {
    try {
      const response = await api.get('/demo-requests/pending', { params: { limit } });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch pending requests';
      throw new Error(msg);
    }
  }

  // Get scheduled demos
  async getScheduledDemos(limit = 10) {
    try {
      const response = await api.get('/demo-requests/scheduled', { params: { limit } });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch scheduled demos';
      throw new Error(msg);
    }
  }

  // Get demo request statistics
  async getDemoRequestStats() {
    try {
      const response = await api.get('/demo-requests/stats');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch demo request stats';
      throw new Error(msg);
    }
  }

  // Get one demo request by ID
  async getDemoRequestById(id) {
    try {
      const response = await api.get(`/demo-requests/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch demo request';
      throw new Error(msg);
    }
  }

  // Update demo request
  async updateDemoRequest(id, data) {
    try {
      const response = await api.put(`/demo-requests/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update demo request';
      throw new Error(msg);
    }
  }

  // Update status
  async updateDemoRequestStatus(id, status) {
    try {
      const response = await api.patch(`/demo-requests/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update demo request status';
      throw new Error(msg);
    }
  }

  // Assign to admin
  async assignDemoRequest(id, adminId) {
    try {
      const response = await api.patch(`/demo-requests/${id}/assign`, { adminId });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to assign demo request';
      throw new Error(msg);
    }
  }

  // Schedule demo
  async scheduleDemo(id, scheduledAt, meetingLink = '') {
    try {
      const response = await api.patch(`/demo-requests/${id}/schedule`, {
        scheduledAt,
        meetingLink,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to schedule demo';
      throw new Error(msg);
    }
  }

  // Mark as completed
  async completeDemoRequest(id, internalNotes = '') {
    try {
      const response = await api.patch(`/demo-requests/${id}/complete`, { internalNotes });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to complete demo request';
      throw new Error(msg);
    }
  }

  // Cancel demo request
  async cancelDemoRequest(id, internalNotes = '') {
    try {
      const response = await api.patch(`/demo-requests/${id}/cancel`, { internalNotes });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to cancel demo request';
      throw new Error(msg);
    }
  }

  // Delete demo request
  async deleteDemoRequest(id) {
    try {
      const response = await api.delete(`/demo-requests/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete demo request';
      throw new Error(msg);
    }
  }
}

const demoRequestService = new DemoRequestService();
export default demoRequestService;

export const {
  submitDemoRequest,
  getAllDemoRequests,
  getPendingRequests,
  getScheduledDemos,
  getDemoRequestStats,
  getDemoRequestById,
  updateDemoRequest,
  updateDemoRequestStatus,
  assignDemoRequest,
  scheduleDemo,
  completeDemoRequest,
  cancelDemoRequest,
  deleteDemoRequest,
} = demoRequestService;
