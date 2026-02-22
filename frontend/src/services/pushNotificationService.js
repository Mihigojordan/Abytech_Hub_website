import api from '../api/api';

class PushNotificationService {
    constructor() {
        this.api = api;
    }

    // ===============================
    // SUBSCRIBE USER
    // ===============================

    async subscribe({ userId, type, subscription, label }) {
        try {
            const response = await this.api.post(
                '/push-notification/subscribe',
                {
                    userId,
                    type,
                    subscription,
                    label,
                }
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to subscribe for push notifications';
            throw new Error(msg);
        }
    }

    // ===============================
    // UNSUBSCRIBE SINGLE DEVICE
    // ===============================

    async unsubscribeDevice({ userId, type, endpoint }) {
        try {
            const response = await this.api.delete(
                '/push-notification/unsubscribe/device',
                {
                    data: { userId, type, endpoint },
                }
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to unsubscribe device';
            throw new Error(msg);
        }
    }

    // ===============================
    // UNSUBSCRIBE ALL DEVICES
    // ===============================

    async unsubscribeAllDevices({ userId, type }) {
        try {
            const response = await this.api.delete(
                '/push-notification/unsubscribe/all',
                {
                    data: { userId, type },
                }
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to unsubscribe all devices';
            throw new Error(msg);
        }
    }

    // ===============================
    // SEND TO SINGLE USER
    // ===============================

    async sendToUser({ userId, type, payload }) {
        try {
            const response = await this.api.post(
                '/push-notification/send/user',
                {
                    userId,
                    type,
                    payload,
                }
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to send push notification to user';
            throw new Error(msg);
        }
    }

    // ===============================
    // SEND TO ALL USERS OF TYPE
    // ===============================

    async sendToAll({ type, payload }) {
        try {
            const response = await this.api.post(
                '/push-notification/send/all',
                {
                    type,
                    payload,
                }
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to send push notification to all users';
            throw new Error(msg);
        }
    }

    // ===============================
    // GET USER SUBSCRIPTIONS
    // ===============================

    async getSubscriptions(userId, type) {
        try {
            const response = await this.api.get(
                `/push-notification/subscriptions/${userId}/${type}`
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch subscriptions';
            throw new Error(msg);
        }
    }

    // ===============================
    // GET TOTAL SUBSCRIPTION COUNT
    // ===============================

    async getTotalSubscriptions(type) {
        try {
            const response = await this.api.get(
                `/push-notification/count/${type}`
            );

            return response.data;
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch subscription count';
            throw new Error(msg);
        }
    }
}

// Singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;

// Optional named exports
export const {
    subscribe,
    unsubscribeDevice,
    unsubscribeAllDevices,
    sendToUser,
    sendToAll,
    getSubscriptions,
    getTotalSubscriptions,
} = pushNotificationService;
