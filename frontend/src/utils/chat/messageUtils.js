import { API_URL } from '../../api/api';
import { formatTime } from './dateUtils';

/**
 * Get the last message details for a conversation
 * @param {number} chatId - The chat/conversation ID
 * @param {Array} allMessages - All messages array
 * @returns {Object} Object with text and time of last message
 */
export const getLastMessage = (messages) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return { text: '', time: '' };

    // Sort by timestamp just in case (optional, but safer)
    // Assuming messages are already sorted or we just take the last one
    const lastMsg = messages[messages.length - 1];

    // Safety check
    if (!lastMsg) return { text: '', time: '' };

    let text = '';

    if (lastMsg.type === 'file') {
        text = `📎 ${lastMsg.content || 'File'}`;
    } else if (lastMsg.type === 'image') {
        text = '📷 Image';
    } else {
        text = lastMsg.content || '';
    }

    return { text, time: formatTime(new Date(lastMsg.timestamp)) };
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