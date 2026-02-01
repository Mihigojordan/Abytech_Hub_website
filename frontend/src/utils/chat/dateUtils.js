/**
 * Format timestamp to HH:MM format
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return '';

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Format full date with time
 * @param {Date} date - The date to format
 * @returns {string} Full formatted date string
 */
export const formatFullDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    // Check if valid date
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Group messages by date with labels (Today, Yesterday, or full date)
 * @param {Array} messages - Array of messages to group
 * @returns {Array} Array of grouped messages with date labels
 */
export const groupMessagesByDate = (messages) => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    messages.forEach(message => {
        const messageDate = new Date(message.timestamp);
        const dateKey = messageDate.toDateString();

        let label;
        if (messageDate.toDateString() === today.toDateString()) {
            label = 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            label = 'Yesterday';
        } else {
            label = messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (!groups[dateKey]) {
            groups[dateKey] = { label, messages: [] };
        }
        groups[dateKey].messages.push(message);
    });

    return Object.values(groups);
};
