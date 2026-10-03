import api from '../api/api';

class UserAuthService {
  async getUsers(params = {}) {
    try {
      const response = await api.get('/user-auth/users', { params });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch users';
      throw new Error(msg);
    }
  }

  async getEmployees(params = {}) {
    return this.getUsers({ role: 'EMPLOYEE', ...params });
  }
}

const userAuthService = new UserAuthService();

export default userAuthService;
