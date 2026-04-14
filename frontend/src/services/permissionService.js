import api from '../api/api';

class PermissionService {
    // Get all available permissions
    async getAllPermissions() {
        try {
            const response = await api.get('/permissions');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }

    // Get my permissions
    async getMyPermissions() {
        try {
            const response = await api.get('/permissions/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch my permissions');
        }
    }

    // Get admin's permissions
    async getAdminPermissions(adminId) {
        try {
            const response = await api.get(`/permissions/admin/${adminId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch admin permissions');
        }
    }

    // Assign permission
    async assignPermission(adminId, permissionName) {
        try {
            const response = await api.post('/permissions/assign', { adminId, permissionName });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to assign permission');
        }
    }

    // Revoke permission
    async revokePermission(adminId, permissionName) {
        try {
            const response = await api.delete('/permissions/revoke', { data: { adminId, permissionName } });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to revoke permission');
        }
    }

    // Set all permissions for admin
    async setAdminPermissions(adminId, permissionNames) {
        try {
            const response = await api.put(`/permissions/set/${adminId}`, { permissionNames });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to set permissions');
        }
    }

    // Seed permissions
    async seedPermissions() {
        try {
            const response = await api.post('/permissions/seed');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to seed permissions');
        }
    }

    // Toggle super admin
    async toggleSuperAdmin(adminId, isSuperAdmin) {
        try {
            const response = await api.post(`/permissions/super-admin/${adminId}`, { isSuperAdmin });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to toggle super admin');
        }
    }
}

const permissionService = new PermissionService();
export default permissionService;
