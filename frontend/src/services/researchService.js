import api from '../api/api';

class ResearchService {
  // Create research (with attachments)
  async createResearch(data) {
    try {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.type) formData.append('type', data.type);
      if (data.status) formData.append('status', data.status);
      if (data.summary) formData.append('summary', data.summary);
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);

      // JSON fields
      if (data.problem) formData.append('problem', JSON.stringify(data.problem));
      if (data.objective) formData.append('objective', JSON.stringify(data.objective));
      if (data.methodology) formData.append('methodology', JSON.stringify(data.methodology));
      if (data.findings) formData.append('findings', JSON.stringify(data.findings));
      if (data.conclusion) formData.append('conclusion', JSON.stringify(data.conclusion));
      if (data.recommendations) formData.append('recommendations', JSON.stringify(data.recommendations));

      // Attachments
      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post('/research', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create research';
      throw new Error(msg);
    }
  }

  // Get all researches with pagination and filters
  async getAllResearches({ page = 1, limit = 10, search = '', status = '', type = '' } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (type) params.type = type;

      const response = await api.get('/research', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch researches';
      throw new Error(msg);
    }
  }

  // Get one research by ID
  async getResearchById(id) {
    try {
      const response = await api.get(`/research/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch research';
      throw new Error(msg);
    }
  }

  // Update research
  async updateResearch(id, data) {
    try {
      const formData = new FormData();

      if (data.title) formData.append('title', data.title);
      if (data.slug) formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      if (data.type) formData.append('type', data.type);
      if (data.status) formData.append('status', data.status);
      if (data.summary) formData.append('summary', data.summary);
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);

      // JSON fields
      if (data.problem) formData.append('problem', JSON.stringify(data.problem));
      if (data.objective) formData.append('objective', JSON.stringify(data.objective));
      if (data.methodology) formData.append('methodology', JSON.stringify(data.methodology));
      if (data.findings) formData.append('findings', JSON.stringify(data.findings));
      if (data.conclusion) formData.append('conclusion', JSON.stringify(data.conclusion));
      if (data.recommendations) formData.append('recommendations', JSON.stringify(data.recommendations));

      // Attachments
      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.put(`/research/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update research';
      throw new Error(msg);
    }
  }

  // Delete research
  async deleteResearch(id) {
    try {
      const response = await api.delete(`/research/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete research';
      throw new Error(msg);
    }
  }
}

const researchService = new ResearchService();
export default researchService;

export const {
  createResearch,
  getAllResearches,
  getResearchById,
  updateResearch,
  deleteResearch,
} = researchService;
