import { useEffect } from 'react';
import chatService from '../../services/chatService';

/**
 * Auto-mark messages as read when viewing a conversation
 * @param {string} conversationId - Current conversation ID
 * @param {string} currentUserId - Current user ID
 * @param {string} currentUserType - Current user type ('ADMIN' or 'USER')
 */
export const useAutoRead = (conversationId, currentUserId, currentUserType) => {
    useEffect(() => {
        if (!conversationId || !currentUserId) return;

        // Mark as read after 1 second of viewing conversation
        const timer = setTimeout(() => {
            // Only mark as read if tab is visible
            if (document.visibilityState === 'visible') {
                chatService.markConversationAsRead(conversationId)
                    .then(() => {
                        console.log(`Marked conversation ${conversationId} as read`);
                    })
                    .catch(error => {
                        console.error('Failed to auto-mark conversation as read:', error);
                    });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [conversationId, currentUserId, currentUserType]);
};
