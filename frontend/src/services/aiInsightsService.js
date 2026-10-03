import api from '../api/api';

const aiInsightsService = {
  getInsights: async (months = 6, refresh = false) => {
    try {
      const response = await api.get('/ai-insights', {
        params: { months, refresh: refresh ? 'true' : 'false' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to load insights');
    }
  },
};

export default aiInsightsService;
