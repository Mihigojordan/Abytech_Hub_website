import api from '../api/api';

const withError = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

const calendarService = {
  getEvents: (from, to) =>
    withError(() => api.get('/calendar', { params: { from, to } }), 'Failed to load events'),
  createEvent: (payload) =>
    withError(() => api.post('/calendar', payload), 'Failed to create event'),
  updateEvent: (id, payload) =>
    withError(() => api.put(`/calendar/${id}`, payload), 'Failed to update event'),
  deleteEvent: (id) =>
    withError(() => api.delete(`/calendar/${id}`), 'Failed to delete event'),
};

export default calendarService;
