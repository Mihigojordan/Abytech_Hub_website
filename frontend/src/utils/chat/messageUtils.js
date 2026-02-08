import { API_URL } from '../../api/api';
import { formatTime } from './dateUtils';

/**
 * Get the last message for a conversation with formatted time
 * @param {Array} messages - All messages array for a conversation
 * @returns {Object|null} Full message object with added `time` field, or null
 */
export const getLastMessage = (messages) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return null;

    // Get the last message in the array
    const lastMsg = messages[messages.length - 1];

    // Safety check
    if (!lastMsg) return null;

    // Return full message object with formatted time added
    return {
        ...lastMsg,
        time: lastMsg.time || formatTime(new Date(lastMsg.timestamp || lastMsg.createdAt))
    };
};

/**
 * Get unread message count for a conversation
 * @param {Array} messages - Messages array for the specific conversation
 * @param {string} currentUserId - The current user ID
 * @returns {number} Count of unread messages
 */
export const getUnreadCount = (messages, currentUserId) => {
    if (!messages || !Array.isArray(messages)) return 0;

    // Count messages where current user is NOT in readers list
    return messages.filter(m => {
        // If readers is undefined or empty, it's unread
        if (!m.readers || m.readers.length === 0) return true;

        // Check if user is in readers list
        // Readers is array of { readerId, readerType, ... }
        const hasRead = m.readers.some(r => r.readerId === currentUserId);
        return !hasRead;
    }).length;
};



export const handleDisplayImgUrl = (url) => {
    // Return null if url is not provided or not a string
    if (!url || typeof url !== 'string') return null;

    // Return absolute URLs as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Ensure the path starts with a slash for relative URLs
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${path}`;
};