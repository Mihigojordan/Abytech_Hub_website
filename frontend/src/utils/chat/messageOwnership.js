/**
 * Chat utility functions
 */

/**
 * Check if current user is the owner of a message
 * @param {Object} message - Message object with senderId and senderType
 * @param {Object} currentUser - Current user with id and userType
 * @returns {boolean} True if current user owns the message
 */
export const isMessageOwner = (message, currentUser) => {
    if (!message || !currentUser) return false;
    return message.senderId === currentUser.id &&
        message.senderType === (currentUser.userType || 'ADMIN');
};

/**
 * Get message alignment class based on ownership
 * @param {Object} message - Message object
 * @param {Object} currentUser - Current user
 * @returns {string} Tailwind class for flex alignment
 */
export const getMessageAlignment = (message, currentUser) => {
    return isMessageOwner(message, currentUser) ? 'justify-end' : 'justify-start';
};

/**
 * Get message background color based on ownership
 * @param {Object} message - Message object
 * @param {Object} currentUser - Current user
 * @returns {string} Tailwind background color class
 */
export const getMessageBgColor = (message, currentUser) => {
    return isMessageOwner(message, currentUser) ? 'bg-gray-100' : 'bg-indigo-600 text-white';
};
