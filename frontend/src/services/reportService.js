import api from '../api/api';

class ReportService {
  // ✅ Create report (with file or content)
  async createReport(data) {
    try {
      const formData = new FormData();

      if (data.title) formData.append('title', data.title);

      if (data.content) {
        // stringify JSON content since FormData only supports text
        formData.append('content', JSON.stringify(data.content));
      }
      
       if (data.createdAt) {
        formData.append('createdAt', data.createdAt);
      }

      if (data.reportFile) {
        formData.append('reportUrl', data.reportFile);
      }

      const response = await api.post('/report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to create report';
      throw new Error(msg);
    }
  }

  // ✅ Get all reports
  async getAllReports() {
    try {
      const response = await api.get('/report');
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to fetch reports';
      throw new Error(msg);
    }
  }

  // ✅ Get one report by ID
  async getReportById(id) {
    try {
      const response = await api.get(`/report/${id}`);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to fetch report';
      throw new Error(msg);
    }
  }

  // ✅ Update report (handles file or text)
  async updateReport(id, data) {
    try {
      const formData = new FormData();

      
      if (data.title) formData.append('title', data.title);

      if (data.content) {
        formData.append('content', JSON.stringify(data.content));
      }

      if (data.createdAt) {
        formData.append('createdAt', data.createdAt);
      }

      if (data.reportFile) {
        formData.append('reportUrl', data.reportFile);
      }

      const response = await api.put(`/report/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to update report';
      throw new Error(msg);
    }
  }

  // ✅ Delete report
  async deleteReport(id) {
    try {
      const response = await api.delete(`/report/${id}`);
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to delete report';
      throw new Error(msg);
    }
  }
}

const reportService = new ReportService();
export default reportService;
export const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} = reportService;
