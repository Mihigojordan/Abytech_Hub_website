import api from '../api/api'; // your configured Axios instance

class AiInsightsService {
  // ✅ Get AI insights for the last `months` months (super admin only).
  // `refresh` forces the backend to regenerate instead of using its cache.
  async getInsights(months = 6, refresh = false) {
    try {
      const response = await api.get('/ai-insights', {
        params: { months, ...(refresh ? { refresh: true } : {}) },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch AI insights';
      throw new Error(msg);
    }
  }
}

const aiInsightsService = new AiInsightsService();
export default aiInsightsService;
