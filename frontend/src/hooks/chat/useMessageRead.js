import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing message read receipts with IntersectionObserver
 * @param {Array} messages - Current messages array
 * @param {number} currentUserId - Current user ID
 * @param {Function} markAsRead - Function to mark message as read
 * @param {Object} messagesContainerRef - Ref to messages container
 * @returns {Function} setMessageRef - Function to set message ref
 */
export const useMessageRead = (messages, currentUserId, markAsRead, messagesContainerRef) => {
    const messageRefsMap = useRef(new Map());
    const observerRef = useRef(null);

    useEffect(() => {
        // Create IntersectionObserver
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const messageId = entry.target.dataset.messageId;
                        if (messageId) {
                            const message = messages.find(m => m.id == messageId);

                            // Only mark as read if it's not sent by current user and not already read
                            if (message && !message.isSent && !message.readers?.includes(currentUserId)) {
                                // Call backend API to mark as read
                                markAsRead(messageId);
                            }
                        }
                    }
                });
            },
            {
                threshold: 0.5,
                root: messagesContainerRef?.current || null
            }
        );

        // Observe all current message elements
        messageRefsMap.current.forEach((element, messageId) => {
            if (element && observerRef.current) {
                observerRef.current.observe(element);
            }
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [messages, currentUserId, markAsRead, messagesContainerRef]);

    /**
     * Set ref for a message element
     */
    const setMessageRef = (messageId, element) => {
        if (element) {
            messageRefsMap.current.set(messageId, element);
            if (observerRef.current) {
                observerRef.current.observe(element);
            }
        } else {
            // Remove ref when element is unmounted
            const oldElement = messageRefsMap.current.get(messageId);
            if (oldElement && observerRef.current) {
                observerRef.current.unobserve(oldElement);
            }
            messageRefsMap.current.delete(messageId);
        }
    };

    return { setMessageRef };
};
