import api from '../api/api';

class SalaryService {
    // Submit salary request
    async createSalary(data) {
        try {
            const response = await api.post('/salary', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit salary request');
        }
    }

    // Get all salary requests (with filters)
    async getAllSalaries(params = {}) {
        try {
            const response = await api.get('/salary', { params });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch salaries');
        }
    }

    // Get salary stats
    async getStats() {
        try {
            const response = await api.get('/salary/stats');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch salary stats');
        }
    }

    // Get single salary
    async getSalaryById(id) {
        try {
            const response = await api.get(`/salary/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch salary');
        }
    }

    // Update salary (only PENDING)
    async updateSalary(id, data) {
        try {
            const response = await api.put(`/salary/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update salary');
        }
    }

    // Approve (boss can set bonus/deduction)
    async approve(id, bonus = 0, deduction = 0) {
        try {
            const response = await api.patch(`/salary/${id}/approve`, { bonus, deduction });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to approve salary');
        }
    }

    // Reject
    async reject(id, rejectionReason) {
        try {
            const response = await api.patch(`/salary/${id}/reject`, { rejectionReason });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reject salary');
        }
    }

    // Mark as Paid
    async markAsPaid(id) {
        try {
            const response = await api.patch(`/salary/${id}/pay`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to mark salary as paid');
        }
    }

    // Delete
    async deleteSalary(id) {
        try {
            const response = await api.delete(`/salary/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete salary');
        }
    }
}

const salaryService = new SalaryService();
export default salaryService;
