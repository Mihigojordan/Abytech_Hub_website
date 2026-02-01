import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing typing indicators with WebSocket support
 * @param {Object} socket - Socket instance from SocketContext
 * @param {string} conversationId - Current conversation ID
 * @param {string} userId - Current user ID
 * @returns {Object} Typing state and handlers
 */
export const useTypingIndicator = (socket, conversationId, userId) => {
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    /**
     * Start typing - emit to server
     */
    const startTyping = useCallback(() => {
        if (!socket || !conversationId || !userId) return;

        // Only emit if not already typing
        if (!isTypingRef.current) {
            socket.emit('typing:start', {
                conversationId,
                userId
            });
            isTypingRef.current = true;
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 3000);
    }, [socket, conversationId, userId]);

    /**
     * Stop typing - emit to server
     */
    const stopTyping = useCallback(() => {
        if (!socket || !conversationId || !userId) return;

        if (isTypingRef.current) {
            socket.emit('typing:stop', {
                conversationId,
                userId
            });
            isTypingRef.current = false;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [socket, conversationId, userId]);

    /**
     * Handle input change - trigger typing indicator
     */
    const handleTyping = useCallback((isTyping) => {
        if (isTyping) {
            startTyping();
        } else {
            stopTyping();
        }
    }, [startTyping, stopTyping]);

    /**
     * Listen to typing events from other users
     */
    useEffect(() => {
        if (!socket || !conversationId) return;

        const handleTypingStart = (data) => {
            if (data.conversationId === conversationId && data.userId !== userId) {
                setTypingUsers(prev => new Set([...prev, data.userId]));
            }
        };

        const handleTypingStop = (data) => {
            if (data.conversationId === conversationId && data.userId !== userId) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        };

        socket.on('typing:active', handleTypingStart);
        socket.on('typing:inactive', handleTypingStop);

        return () => {
            socket.off('typing:active', handleTypingStart);
            socket.off('typing:inactive', handleTypingStop);
            stopTyping(); // Clean up typing state when unmounting
        };
    }, [socket, conversationId, userId, stopTyping]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            stopTyping();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [stopTyping]);

    return {
        typingUsers: Array.from(typingUsers),
        isTyping: typingUsers.size > 0,
        handleTyping,
        startTyping,
        stopTyping
    };
};
