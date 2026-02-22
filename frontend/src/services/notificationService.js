import api from '../api/api';

class NotificationService {
    constructor() {
        this.api = api;
    }

    // ====================
    // CREATE NOTIFICATION
    // ====================

    async createNotification(notificationData) {
        try {
            const response = await this.api.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to create notification';
            throw new Error(msg);
        }
    }

    // ====================
    // GET NOTIFICATIONS (PAGINATED + SEARCH)
    // ====================

    async getNotifications(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
            } = options;

            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            if (search) {
                params.append('search', search);
            }

            const response = await this.api.get(
                `/notifications?${params.toString()}`
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch notifications';
            throw new Error(msg);
        }
    }

    // ====================
    // GET UNREAD COUNT
    // ====================

    async getUnreadCount() {
        try {
            const response = await this.api.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch unread count';
            throw new Error(msg);
        }
    }

    // ====================
    // MARK SINGLE AS READ
    // ====================

    async markAsRead(notificationId) {
        try {
            const response = await this.api.put(
                `/notifications/${notificationId}/read`
            );
            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to mark notification as read';
            throw new Error(msg);
        }
    }

    // ====================
    // MARK ALL AS READ
    // ====================

    async markAllAsRead() {
        try {
            const response = await this.api.put(
                '/notifications/mark-all-read'
            );
            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to mark all notifications as read';
            throw new Error(msg);
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Optional named exports (like your chat service)
export const {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = notificationService;
