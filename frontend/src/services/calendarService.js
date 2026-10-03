import api from '../api/api'; // your configured Axios instance

class CalendarService {
  // ✅ Get the logged-in admin's events, optionally between two ISO dates
  async getEvents(from, to) {
    try {
      const response = await api.get('/calendar', { params: { from, to } });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch events';
      throw new Error(msg);
    }
  }

  // ✅ Create a new event
  async createEvent(eventData) {
    try {
      const response = await api.post('/calendar', eventData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create event';
      throw new Error(msg);
    }
  }

  // ✅ Update an event
  async updateEvent(id, eventData) {
    try {
      const response = await api.put(`/calendar/${id}`, eventData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update event';
      throw new Error(msg);
    }
  }

  // ✅ Delete an event
  async deleteEvent(id) {
    try {
      const response = await api.delete(`/calendar/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete event';
      throw new Error(msg);
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;
