import { useState, useCallback } from 'react';
import chatService from '../../services/chatService';

/**
 * Custom hook for managing message operations with backend integration
 * @param {Object} currentUser - Current user object with id and type (should be { id, userType: 'ADMIN' | 'USER' })
 * @returns {Object} Messages state and handlers
 */
export const useMessages = (currentUser = null) => {
    const [allMessages, setAllMessages] = useState({});
    const [messageLoadState, setMessageLoadState] = useState({});
    const [editingMessage, setEditingMessage] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Transform messages to add isSent property based on current user
     */
    const transformMessages = useCallback((messages) => {
        if (!currentUser?.id) return messages;

        return messages.map(msg => ({
            ...msg,
            isSent: msg.senderId === currentUser.id &&
                msg.senderType === (currentUser.userType || 'ADMIN')
        }));
    }, [currentUser]);

    /**
     * Fetch messages for a conversation from backend
     */
    const fetchMessages = useCallback(async (conversationId, cursor = null, limit = 15) => {
        if (!conversationId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await chatService.getMessages(conversationId, { cursor, limit });

            // Transform messages to add isSent property
            const transformedMessages = transformMessages(response.messages);

            setAllMessages(prev => {
                const existingMessages = prev[conversationId] || [];
                // Prepend older messages when loading more
                const newMessages = cursor
                    ? [...transformedMessages, ...existingMessages]
                    : transformedMessages;

                return {
                    ...prev,
                    [conversationId]: newMessages
                };
            });

            setMessageLoadState(prev => ({
                ...prev,
                [conversationId]: {
                    cursor: response.nextCursor,
                    hasMore: response.hasMore,
                    offset: (prev[conversationId]?.offset || 0) + response.messages.length
                }
            }));

            return response;
        } catch (err) {
            setError(err.message || 'Failed to fetch messages');
            console.error('Error fetching messages:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [transformMessages]);

    /**
     * Get messages for a conversation (from local state)
     */
    const getMessagesForConversation = useCallback((conversationId) => {
        const messages = allMessages[conversationId] || [];
        const loadState = messageLoadState[conversationId] || { hasMore: true, offset: 0 };

        return {
            messages,
            hasMore: loadState.hasMore,
            total: messages.length
        };
    }, [allMessages, messageLoadState]);

    /**
     * Send a new message with file support
     */
    const sendMessage = useCallback(async (
        messageInput,
        uploadedFiles,
        selectedChatId,
        clearFiles
    ) => {
        // Allow sending if there's text OR files (not both required)
        const hasContent = (messageInput && messageInput.trim()) || (uploadedFiles && uploadedFiles.length > 0);
        if (!hasContent && !editingMessage) return '';

        // Handle message editing
        if (editingMessage) {
            try {
                const updatedMessage = await chatService.editMessage(
                    editingMessage.id,
                    messageInput.trim()
                );

                // Transform updated message
                const transformedMessage = transformMessages([updatedMessage])[0];

                setAllMessages(prev => ({
                    ...prev,
                    [selectedChatId]: prev[selectedChatId].map(msg =>
                        msg.id === editingMessage.id ? transformedMessage : msg
                    )
                }));

                setEditingMessage(null);
                return '';
            } catch (err) {
                setError(err.message || 'Failed to edit message');
                return messageInput;
            }
        }

        try {
            // Create FormData for file uploads
            const formData = new FormData();

            // Add text content
            if (messageInput && messageInput.trim()) {
                formData.append('content', messageInput.trim());
            }

            // Add reply reference
            if (replyingTo) {
                formData.append('replyToMessageId', replyingTo.id);
            }

            // Separate images and files
            const images = uploadedFiles.filter(f => f.type === 'image');
            const files = uploadedFiles.filter(f => f.type === 'file');

            // Add images to formData
            images.forEach(img => {
                formData.append('chatImages', img.file);
            });

            // Add files to formData
            files.forEach(file => {
                formData.append('chatFiles', file.file);
            });

            // Send to backend
            const newMessage = await chatService.sendMessage(selectedChatId, formData);

            // Transform new message to add isSent property
            const transformedNewMessage = transformMessages([newMessage])[0];

            // Add to local state
            setAllMessages(prev => ({
                ...prev,
                [selectedChatId]: [...(prev[selectedChatId] || []), transformedNewMessage]
            }));

            clearFiles();
            setReplyingTo(null);
            return '';
        } catch (err) {
            setError(err.message || 'Failed to send message');
            console.error('Error sending message:', err);
            return messageInput;
        }
    }, [editingMessage, replyingTo, transformMessages]);

    /**
     * Delete a message
     */
    const deleteMessage = useCallback(async (messageId, conversationId) => {
        try {
            await chatService.deleteMessage(messageId);

            setAllMessages(prev => ({
                ...prev,
                [conversationId]: prev[conversationId].filter(m => m.id !== messageId)
            }));
        } catch (err) {
            setError(err.message || 'Failed to delete message');
            console.error('Error deleting message:', err);
        }
    }, []);

    /**
     * Mark message as read
     */
    const markMessageAsRead = useCallback(async (messageId) => {
        try {
            await chatService.markMessageAsRead(messageId);
            // Update will come via WebSocket, so no local state update needed
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    }, []);

    /**
     * Handle message actions (copy, edit, reply, delete, forward)
     */
    const handleMessageAction = useCallback((action, messageId, textareaRef, conversationId) => {
        const message = allMessages[conversationId]?.find(m => m.id === messageId);
        if (!message) return null;

        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(message.content || '');
                break;
            case 'edit':
                if (message.isSent) {
                    setEditingMessage(message);
                    setReplyingTo(null);
                    textareaRef.current?.focus();
                    return message.content || '';
                }
                break;
            case 'reply':
                setReplyingTo(message);
                setEditingMessage(null);
                textareaRef.current?.focus();
                break;
            case 'delete':
                deleteMessage(messageId, conversationId);
                break;
            case 'forward':
                console.log('Forward functionality - to be implemented');
                break;
            default:
                break;
        }
        return null;
    }, [allMessages, deleteMessage]);

    /**
     * Add new message from WebSocket
     */
    const addMessageFromSocket = useCallback((message, conversationId) => {
        setAllMessages(prev => {
            const existing = prev[conversationId] || [];
            // Check if message already exists
            if (existing.some(m => m.id === message.id)) {
                return prev;
            }

            // Transform message to add isSent property
            const transformedMessage = transformMessages([message])[0];

            return {
                ...prev,
                [conversationId]: [...existing, transformedMessage]
            };
        });
    }, [transformMessages]);

    /**
     * Update message from WebSocket
     */
    const updateMessageFromSocket = useCallback((updatedMessage, conversationId) => {
        // Transform updated message
        const transformedMessage = transformMessages([updatedMessage])[0];

        setAllMessages(prev => ({
            ...prev,
            [conversationId]: prev[conversationId]?.map(msg =>
                msg.id === updatedMessage.id ? transformedMessage : msg
            ) || []
        }));
    }, [transformMessages]);

    /**
     * Remove message from WebSocket
     */
    const removeMessageFromSocket = useCallback((messageId, conversationId) => {
        setAllMessages(prev => ({
            ...prev,
            [conversationId]: prev[conversationId]?.filter(m => m.id !== messageId) || []
        }));
    }, []);

    /**
     * Cancel edit/reply
     */
    const cancelEditOrReply = useCallback(() => {
        setEditingMessage(null);
        setReplyingTo(null);
        return '';
    }, []);

    return {
        allMessages,
        setAllMessages,
        editingMessage,
        setEditingMessage,
        replyingTo,
        setReplyingTo,
        loading,
        error,
        fetchMessages,
        getMessagesForConversation,
        sendMessage,
        deleteMessage,
        handleMessageAction,
        markMessageAsRead,
        cancelEditOrReply,
        // WebSocket handlers
        addMessageFromSocket,
        updateMessageFromSocket,
        removeMessageFromSocket
    };
};
