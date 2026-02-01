import { useState } from 'react';

/**
 * Custom hook for managing message selection mode
 * @returns {Object} Selection state and handlers
 */
export const useMessageSelection = () => {
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);

    /**
     * Toggle message selection
     */
    const toggleMessageSelection = (messageId) => {
        setSelectedMessages(prev => {
            if (prev.includes(messageId)) {
                const newSelection = prev.filter(id => id !== messageId);
                if (newSelection.length === 0) setSelectionMode(false);
                return newSelection;
            } else {
                return [...prev, messageId];
            }
        });
    };

    /**
     * Handle bulk actions on selected messages
     */
    const handleBulkAction = (action, allMessages, setAllMessages) => {
        const selectedMsgs = allMessages.filter(m => selectedMessages.includes(m.id));
        const allUserMessages = selectedMsgs.every(m => m.isSent);

        switch (action) {
            case 'delete':
                // Only delete if all selected messages are user's messages
                if (!allUserMessages) {
                    alert('You can only delete your own messages');
                    return;
                }
                setAllMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
                break;
            case 'copy':
                const messagesToCopy = allMessages
                    .filter(m => selectedMessages.includes(m.id))
                    .map(m => m.content)
                    .join('\n\n');
                navigator.clipboard.writeText(messagesToCopy);
                break;
            case 'forward':
                alert('Forward functionality - select a chat to forward to');
                break;
            default:
                break;
        }
        setSelectedMessages([]);
        setSelectionMode(false);
    };

    /**
     * Clear selection
     */
    const clearSelection = () => {
        setSelectedMessages([]);
        setSelectionMode(false);
    };

    /**
     * Start selection mode
     */
    const startSelection = (messageId) => {
        setSelectionMode(true);
        setSelectedMessages([messageId]);
    };

    return {
        selectedMessages,
        selectionMode,
        setSelectionMode,
        toggleMessageSelection,
        handleBulkAction,
        clearSelection,
        startSelection
    };
};
