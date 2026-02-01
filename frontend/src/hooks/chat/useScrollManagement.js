import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing scroll behavior in messages container
 * @param {Array} messages - Current messages array
 * @param {number} selectedChatId - Currently selected chat ID
 * @returns {Object} Scroll state, refs, and handlers
 */
export const useScrollManagement = (messages, selectedChatId) => {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);
    const previousScrollHeight = useRef(0);

    /**
     * Scroll to bottom instantly (no animation)
     */
    const scrollToBottomInstant = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        setShowScrollButton(false);
    };

    /**
     * Scroll to bottom with smooth animation
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    };

    /**
     * Handle scroll detection
     */
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isAtBottom = distanceFromBottom < 100;

        // Show scroll button when user scrolls up
        if (!isAtBottom && distanceFromBottom > 200) {
            setShowScrollButton(true);
        } else if (isAtBottom) {
            setShowScrollButton(false);
        }

        // Detect scroll to top for loading more messages
        if (scrollTop < 100 && !isLoadingMore) {
            // User is near the top, trigger load more
            const event = new CustomEvent('scrollToTop');
            container.dispatchEvent(event);
        }
    };

    /**
     * Load more messages (for pagination)
     */
    const loadMoreMessages = (messageLoadState, setMessageLoadState) => {
        if (isLoadingMore) return;

        const container = messagesContainerRef.current;
        if (!container) return;

        // Save current scroll position
        const scrollHeight = container.scrollHeight;
        previousScrollHeight.current = scrollHeight;

        setIsLoadingMore(true);

        // Simulate loading delay
        setTimeout(() => {
            setMessageLoadState(prev => ({
                ...prev,
                [selectedChatId]: {
                    offset: (prev[selectedChatId]?.offset || 0) + 15,
                    hasMore: true
                }
            }));
            setIsLoadingMore(false);

            // Maintain scroll position after loading
            setTimeout(() => {
                if (container) {
                    const newScrollHeight = container.scrollHeight;
                    const scrollDiff = newScrollHeight - previousScrollHeight.current;
                    container.scrollTop += scrollDiff;
                }
            }, 50);
        }, 500);
    };

    // Initial scroll to bottom when conversation changes
    useEffect(() => {
        if (shouldScrollToBottom) {
            setTimeout(() => {
                scrollToBottomInstant();
                setShouldScrollToBottom(false);
            }, 100);
        }
    }, [selectedChatId]);

    // Reset shouldScrollToBottom when conversation changes
    useEffect(() => {
        setShouldScrollToBottom(true);
        setShowScrollButton(false);
    }, [selectedChatId]);

    // Add scroll listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [isLoadingMore]);

    return {
        showScrollButton,
        isLoadingMore,
        messagesEndRef,
        messagesContainerRef,
        loadMoreTriggerRef,
        scrollToBottom,
        scrollToBottomInstant,
        handleScroll,
        loadMoreMessages,
        setIsLoadingMore
    };
};
