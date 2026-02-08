import api from '../api/api';

class WeeklyGoalService {
  // Create weekly goal
  async createWeeklyGoal(data) {
    try {
      const response = await api.post('/weekly-goals', {
        title: data.title,
        description: data.description,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        status: data.status,
        progress: data.progress,
        tasks: data.tasks,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create weekly goal';
      throw new Error(msg);
    }
  }

  // Get all weekly goals with filters
  async getAllWeeklyGoals({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    ownerId = '',
    weekStart = '',
    weekEnd = '',
  } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (ownerId) params.ownerId = ownerId;
      if (weekStart) params.weekStart = weekStart;
      if (weekEnd) params.weekEnd = weekEnd;

      const response = await api.get('/weekly-goals', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch weekly goals';
      throw new Error(msg);
    }
  }

  // Get current week goals
  async getCurrentWeekGoals(ownerId = '') {
    try {
      const params = {};
      if (ownerId) params.ownerId = ownerId;

      const response = await api.get('/weekly-goals/current-week', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch current week goals';
      throw new Error(msg);
    }
  }

  // Get my goals
  async getMyGoals(limit = 10) {
    try {
      const response = await api.get('/weekly-goals/my-goals', { params: { limit } });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch my goals';
      throw new Error(msg);
    }
  }

  // Get weekly goal statistics
  async getWeeklyGoalStats(ownerId = '') {
    try {
      const params = {};
      if (ownerId) params.ownerId = ownerId;

      const response = await api.get('/weekly-goals/stats', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch weekly goal stats';
      throw new Error(msg);
    }
  }

  // Get one weekly goal by ID
  async getWeeklyGoalById(id) {
    try {
      const response = await api.get(`/weekly-goals/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch weekly goal';
      throw new Error(msg);
    }
  }

  // Update weekly goal
  async updateWeeklyGoal(id, data) {
    try {
      const response = await api.put(`/weekly-goals/${id}`, data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update weekly goal';
      throw new Error(msg);
    }
  }

  // Update status
  async updateWeeklyGoalStatus(id, status) {
    try {
      const response = await api.patch(`/weekly-goals/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update weekly goal status';
      throw new Error(msg);
    }
  }

  // Update progress
  async updateWeeklyGoalProgress(id, progress) {
    try {
      const response = await api.patch(`/weekly-goals/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update weekly goal progress';
      throw new Error(msg);
    }
  }

  // Add task
  async addTask(id, task) {
    try {
      const response = await api.post(`/weekly-goals/${id}/tasks`, task);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add task';
      throw new Error(msg);
    }
  }

  // Toggle task completion
  async toggleTask(id, taskId) {
    try {
      const response = await api.patch(`/weekly-goals/${id}/tasks/${taskId}/toggle`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to toggle task';
      throw new Error(msg);
    }
  }

  // Remove task
  async removeTask(id, taskId) {
    try {
      const response = await api.delete(`/weekly-goals/${id}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove task';
      throw new Error(msg);
    }
  }

  // Add review notes
  async addReviewNotes(id, reviewNotes) {
    try {
      const response = await api.patch(`/weekly-goals/${id}/review`, { reviewNotes });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add review notes';
      throw new Error(msg);
    }
  }

  // Delete weekly goal
  async deleteWeeklyGoal(id) {
    try {
      const response = await api.delete(`/weekly-goals/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete weekly goal';
      throw new Error(msg);
    }
  }
}

const weeklyGoalService = new WeeklyGoalService();
export default weeklyGoalService;

export const {
  createWeeklyGoal,
  getAllWeeklyGoals,
  getCurrentWeekGoals,
  getMyGoals,
  getWeeklyGoalStats,
  getWeeklyGoalById,
  updateWeeklyGoal,
  updateWeeklyGoalStatus,
  updateWeeklyGoalProgress,
  addTask,
  toggleTask,
  removeTask,
  addReviewNotes,
  deleteWeeklyGoal,
} = weeklyGoalService;
