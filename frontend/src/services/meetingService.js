import api from '../api/api';

class MeetingService {
  // Create meeting
  async createMeeting(data) {
    try {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('startTime', data.startTime);
      if (data.description) formData.append('description', data.description);
      if (data.endTime) formData.append('endTime', data.endTime);
      if (data.status) formData.append('status', data.status);
      if (data.location) formData.append('location', data.location);
      if (data.meetingLink) formData.append('meetingLink', data.meetingLink);

      // JSON fields
      if (data.participants) formData.append('participants', JSON.stringify(data.participants));
      if (data.keyPoints) formData.append('keyPoints', JSON.stringify(data.keyPoints));
      if (data.actionItems) formData.append('actionItems', JSON.stringify(data.actionItems));

      // Attachments
      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post('/meetings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create meeting';
      throw new Error(msg);
    }
  }

  // Get all meetings with pagination and filters
  async getAllMeetings({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    createdById = '',
  } = {}) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (createdById) params.createdById = createdById;

      const response = await api.get('/meetings', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch meetings';
      throw new Error(msg);
    }
  }

  // Get upcoming meetings
  async getUpcomingMeetings(limit = 5, adminId = '') {
    try {
      const params = { limit };
      if (adminId) params.adminId = adminId;

      const response = await api.get('/meetings/upcoming', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch upcoming meetings';
      throw new Error(msg);
    }
  }

  // Get meeting statistics
  async getMeetingStats(adminId = '') {
    try {
      const params = {};
      if (adminId) params.adminId = adminId;

      const response = await api.get('/meetings/stats', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch meeting stats';
      throw new Error(msg);
    }
  }

  // Get one meeting by ID
  async getMeetingById(id) {
    try {
      const response = await api.get(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch meeting';
      throw new Error(msg);
    }
  }

  // Update meeting
  async updateMeeting(id, data) {
    try {
      const formData = new FormData();

      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.startTime) formData.append('startTime', data.startTime);
      if (data.endTime) formData.append('endTime', data.endTime);
      if (data.status) formData.append('status', data.status);
      if (data.location) formData.append('location', data.location);
      if (data.meetingLink) formData.append('meetingLink', data.meetingLink);

      // JSON fields
      if (data.participants) formData.append('participants', JSON.stringify(data.participants));
      if (data.keyPoints) formData.append('keyPoints', JSON.stringify(data.keyPoints));
      if (data.actionItems) formData.append('actionItems', JSON.stringify(data.actionItems));

      // Attachments
      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.put(`/meetings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update meeting';
      throw new Error(msg);
    }
  }

  // Update meeting status
  async updateMeetingStatus(id, status) {
    try {
      const response = await api.patch(`/meetings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update meeting status';
      throw new Error(msg);
    }
  }

  // Add participant
  async addParticipant(id, participant) {
    try {
      const response = await api.post(`/meetings/${id}/participants`, participant);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add participant';
      throw new Error(msg);
    }
  }

  // Remove participant
  async removeParticipant(id, adminId) {
    try {
      const response = await api.delete(`/meetings/${id}/participants/${adminId}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove participant';
      throw new Error(msg);
    }
  }

  // Update participant attendance
  async updateParticipantAttendance(id, adminId, attended) {
    try {
      const response = await api.patch(`/meetings/${id}/participants/${adminId}/attendance`, { attended });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update attendance';
      throw new Error(msg);
    }
  }

  // Add action item
  async addActionItem(id, actionItem) {
    try {
      const response = await api.post(`/meetings/${id}/action-items`, actionItem);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add action item';
      throw new Error(msg);
    }
  }

  // Update action item status
  async updateActionItemStatus(id, actionItemId, completed) {
    try {
      const response = await api.patch(`/meetings/${id}/action-items/${actionItemId}`, { completed });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update action item';
      throw new Error(msg);
    }
  }

  // Add key point
  async addKeyPoint(id, keyPoint) {
    try {
      const response = await api.post(`/meetings/${id}/key-points`, keyPoint);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add key point';
      throw new Error(msg);
    }
  }

  // Delete meeting
  async deleteMeeting(id) {
    try {
      const response = await api.delete(`/meetings/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete meeting';
      throw new Error(msg);
    }
  }
}

const meetingService = new MeetingService();
export default meetingService;

export const {
  createMeeting,
  getAllMeetings,
  getUpcomingMeetings,
  getMeetingStats,
  getMeetingById,
  updateMeeting,
  updateMeetingStatus,
  addParticipant,
  removeParticipant,
  updateParticipantAttendance,
  addActionItem,
  updateActionItemStatus,
  addKeyPoint,
  deleteMeeting,
} = meetingService;
