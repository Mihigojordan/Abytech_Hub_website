import api from '../api/api';

class ChatService {
    constructor() {
        this.api = api;
    }

    // ====================
    // CONVERSATIONS
    // ====================

    async getConversations() {
        try {
            const response = await this.api.get('/chat/conversations');
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to fetch conversations';
            throw new Error(msg);
        }
    }

    async getConversation(conversationId) {
        try {
            const response = await this.api.get(`/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to fetch conversation';
            throw new Error(msg);
        }
    }

    async createConversation(conversationData) {
        try {
            const response = await this.api.post('/chat/conversations', conversationData);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to create conversation';
            throw new Error(msg);
        }
    }

    async addMembersToConversation(conversationId, participantIds, participantTypes) {
        try {
            const response = await this.api.post(`/chat/conversations/${conversationId}/members`, {
                participantIds,
                participantTypes
            });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to add members';
            throw new Error(msg);
        }
    }

    // ====================
    // MESSAGES
    // ====================

    async getMessages(conversationId, options = {}) {
        try {
            const { cursor, limit = 15 } = options;
            const params = new URLSearchParams();
            if (cursor) params.append('cursor', cursor);
            if (limit) params.append('limit', limit.toString());

            const response = await this.api.get(
                `/chat/conversations/${conversationId}/messages?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to fetch messages';
            throw new Error(msg);
        }
    }

    async sendMessage(conversationId, messageData) {
        try {
            // Check if messageData is FormData to set appropriate headers
            const config = {};
            if (messageData instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            const response = await this.api.post(
                `/chat/conversations/${conversationId}/messages`,
                messageData,
                config
            );
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to send message';
            throw new Error(msg);
        }
    }

    async editMessage(messageId, content) {
        try {
            const response = await this.api.patch(`/chat/messages/${messageId}`, { content });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to edit message';
            throw new Error(msg);
        }
    }

    async deleteMessage(messageId) {
        try {
            const response = await this.api.delete(`/chat/messages/${messageId}`);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete message';
            throw new Error(msg);
        }
    }

    async markMessageAsRead(messageId) {
        try {
            const response = await this.api.post(`/chat/messages/${messageId}/read`);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to mark message as read';
            throw new Error(msg);
        }
    }

    async markConversationAsRead(conversationId) {
        try {
            const response = await this.api.post(`/chat/conversations/${conversationId}/mark-read`);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to mark conversation as read';
            throw new Error(msg);
        }
    }

    // ====================
    // REPLY & FORWARD
    // ====================

    async replyToMessage(messageId, replyData) {
        try {
            // Check if replyData is FormData to set appropriate headers
            const config = {};
            if (replyData instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            const response = await this.api.post(
                `/chat/messages/${messageId}/reply`,
                replyData,
                config
            );
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to reply to message';
            throw new Error(msg);
        }
    }

    /**
     * Forward messages to one or more conversations
     * @param {string[]} messageIds - Array of message IDs to forward
     * @param {string[]} targetConversationIds - Array of target conversation IDs
     * @returns {Promise<Array>} Array of forwarded message responses
     */
    async forwardMessages(messageIds, targetConversationIds) {
        try {
            // Ensure targetConversationIds is an array
            const conversationIds = Array.isArray(targetConversationIds)
                ? targetConversationIds
                : [targetConversationIds];

            // Forward to multiple conversations in parallel
            const promises = conversationIds.map(conversationId =>
                this.api.post('/chat/messages/forward', {
                    messageIds,
                    targetConversationId: conversationId
                })
            );

            const results = await Promise.all(promises);
            return results.map(r => r.data);
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to forward messages';
            throw new Error(msg);
        }
    }

    // ====================
    // UNREAD COUNTS
    // ====================

    async getUnreadMessageCounts() {
        try {
            const response = await this.api.get('/chat/conversations/unread');
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to fetch unread counts';
            throw new Error(msg);
        }
    }

    // ====================
    // CONTACTS
    // ====================

    async getContacts() {
        try {
            const response = await this.api.get('/chat/contacts');
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to fetch contacts';
            throw new Error(msg);
        }
    }

    async addContact(contactData) {
        try {
            const response = await this.api.post('/chat/contacts', contactData);
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to add contact';
            throw new Error(msg);
        }
    }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;

// Export individual methods for convenience
export const {
    getConversations,
    getConversation,
    createConversation,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
    markConversationAsRead,
    replyToMessage,
    forwardMessages,
    getUnreadMessageCounts,
    getContacts,
    addContact,
} = chatService;

