import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing scroll behavior in messages container
 * @param {Array} messages - Current messages array
 * @param {number} selectedChatId - Currently selected chat ID
 * @param {Function} onScrollToTop - Callback when user scrolls to top (for loading more messages)
 * @param {boolean} hasMore - Whether there are more messages to load
 * @returns {Object} Scroll state, refs, and handlers
 */
export const useScrollManagement = (messages, selectedChatId, onScrollToTop, hasMore = true) => {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);
    const isLoadingRef = useRef(false);

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
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    }, []);

    /**
     * Handle scroll detection
     */
    const handleScroll = useCallback(() => {
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
        // Add a threshold to trigger slightly before reaching absolute top
        if (scrollTop < 200 && hasMore && !isLoadingRef.current) {
            console.log('🔄 Triggering load more messages - scrollTop:', scrollTop);
            isLoadingRef.current = true;
            setIsLoadingMore(true);
            
            if (onScrollToTop) {
                onScrollToTop();
            }
        }
    }, [hasMore, onScrollToTop]);

    // Track previous messages state
    const previousMessagesLength = useRef(0);
    const lastMessageRef = useRef(null);

    // Smart auto-scroll logic
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || messages.length === 0) {
            previousMessagesLength.current = messages.length;
            if (messages.length > 0) lastMessageRef.current = messages[messages.length - 1];
            return;
        }

        const isNewMessage = messages.length > previousMessagesLength.current;
        const currentLastMessage = messages[messages.length - 1];
        const isDifferentLastMessage = currentLastMessage?.id !== lastMessageRef.current?.id;

        // Only trigger scroll logic if we have new messages (not just updates/edits)
        if (isNewMessage && isDifferentLastMessage) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const isNearBottom = distanceFromBottom < 300; // Threshold for auto-scroll
            const isMyMessage = currentLastMessage?.senderType === 'ADMIN'; // Assuming current user is ADMIN

            // Auto-scroll if user is near bottom OR if it's their own message
            if (isNearBottom || isMyMessage) {
                // Use setTimeout to allow DOM to layout
                setTimeout(scrollToBottom, 100);
            } else {
                // If not auto-scrolling, show the new message badge
                setShowScrollButton(true);
            }
        }

        previousMessagesLength.current = messages.length;
        lastMessageRef.current = currentLastMessage;

    }, [messages, selectedChatId, scrollToBottom]);

    // Reset loading state when messages change (new messages loaded)
    useEffect(() => {
        if (messages.length > 0) {
            isLoadingRef.current = false;
            setIsLoadingMore(false);
        }
    }, [messages.length]);

    // Initial scroll to bottom when conversation changes
    useEffect(() => {
        if (shouldScrollToBottom && messages.length > 0) {
            // Reset trackers for new conversation
            previousMessagesLength.current = messages.length;
            lastMessageRef.current = messages[messages.length - 1];

            setTimeout(() => {
                scrollToBottomInstant();
                setShouldScrollToBottom(false);
            }, 100);
        }
    }, [selectedChatId, messages.length]);

    // Reset shouldScrollToBottom when conversation changes
    useEffect(() => {
        setShouldScrollToBottom(true);
        setShowScrollButton(false);
        previousMessagesLength.current = 0;
        lastMessageRef.current = null;
        isLoadingRef.current = false;
        setIsLoadingMore(false);
    }, [selectedChatId]);

    // Add scroll listener
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return {
        showScrollButton,
        isLoadingMore,
        messagesEndRef,
        messagesContainerRef,
        loadMoreTriggerRef,
        scrollToBottom,
        scrollToBottomInstant,
        handleScroll,
        setIsLoadingMore
    };
};