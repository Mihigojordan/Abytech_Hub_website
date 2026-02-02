import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../../context/SocketContext';

/**
 * Custom hook for managing typing indicators with WebSocket support
 * @param {string} conversationId - Current conversation ID
 * @param {string} userId - Current user ID
 * @param {string} userType - Current user Type
 * @returns {Object} Typing state and handlers
 */
/**
 * Custom hook for managing typing indicators with WebSocket support
 * @param {string} currentConversationId - Current active conversation ID (for emitting)
 * @param {string} userId - Current user ID
 * @param {string} userType - Current user Type
 * @returns {Object} Typing state and handlers
 */
export const useTypingIndicator = (currentConversationId, userId, userType) => {
    const { socket, emit } = useSocket();

    // State: Map of conversationId -> Set of userIds
    const [typingMap, setTypingMap] = useState({});

    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    /**
     * Start typing - emit to server for current conversation
     */
    const startTyping = useCallback(() => {
        if (!currentConversationId || !userId) {
            return;
        }

        // Only emit if not already typing
        if (!isTypingRef.current) {
            emit('typing:start', {
                conversationId: currentConversationId,
                userId,
                userType
            });
            isTypingRef.current = true;
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    }, [currentConversationId, userId, userType, emit]);

    /**
     * Stop typing - emit to server for current conversation
     */
    const stopTyping = useCallback(() => {
        if (!currentConversationId || !userId) return;

        if (isTypingRef.current) {
            emit('typing:stop', {
                conversationId: currentConversationId,
                userId,
                userType
            });
            isTypingRef.current = false;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [currentConversationId, userId, userType, emit]);

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
     * Handle typing start event (Global listener)
     */
    const handleTypingStart = useCallback((data) => {
        if (data.userId === userId) return; // Ignore self

        setTypingMap(prev => {
            const convId = data.conversationId;
            const currentSet = new Set(prev[convId] || []);
            currentSet.add(data.userId);

            return {
                ...prev,
                [convId]: currentSet
            };
        });
    }, [userId]);

    /**
     * Handle typing stop event (Global listener)
     */
    const handleTypingStop = useCallback((data) => {
        if (data.userId === userId) return; // Ignore self

        setTypingMap(prev => {
            const convId = data.conversationId;
            if (!prev[convId]) return prev;

            const currentSet = new Set(prev[convId]);
            currentSet.delete(data.userId); // Remove user

            // If empty, we can keep empty set or remove key 
            // Keeping empty set is fine for now
            return {
                ...prev,
                [convId]: currentSet
            };
        });
    }, [userId]);

    // Use useSocketEvent for listeners (Global - independent of currentConversationId)
    useSocketEvent('typing:active', handleTypingStart, [userId]);
    useSocketEvent('typing:inactive', handleTypingStop, [userId]);

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
        // Return raw map for list view
        typingMap,
        // Helper for specific conversation (e.g. current selected one)
        getTypingUsers: (convId) => Array.from(typingMap[convId] || []),
        // Current conversation typing users (convenience)
        typingUsers: Array.from(typingMap[currentConversationId] || []),

        handleTyping,
        startTyping,
        stopTyping
    };
};
