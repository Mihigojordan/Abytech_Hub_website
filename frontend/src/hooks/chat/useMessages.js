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
     * Transform messages to add isSent property and standardize reply structure
     */
    const transformMessages = useCallback((messages) => {
        if (!messages) return [];
        return messages.map(msg => {
            // Map replyToMessage to replyTo format expected by UI
            let replyTo = null;
            if (msg.replyToMessage) {
                replyTo = {
                    id: msg.replyToMessage.id,
                    content: msg.replyToMessage.content,
                    sender: msg.replyToMessage.senderName || 'Unknown',
                    type: msg.replyToMessage.type || 'text'
                };
            }

            return {
                ...msg,
                isSent: currentUser?.id ? (msg.senderId === currentUser.id &&
                    msg.senderType === (currentUser.userType || 'ADMIN')) : false,
                replyTo: replyTo || msg.replyTo, // Use mapped or existing
                sender: msg.senderName || msg.sender || msg.senderId, // Prioritize senderName
                avatar: msg.senderAvatar,
                initial: msg.senderInitial,
                isRead: msg.isRead || (msg.readers && msg.readers.length > 0) // Check if read by current user
            };
        });
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
            const convIdStr = String(conversationId);

            // Transform messages to add isSent property
            const transformedMessages = transformMessages(response.messages);

            setAllMessages(prev => {
                const existingMessages = prev[convIdStr] || [];
                // Prepend older messages when loading more
                const newMessages = cursor
                    ? [...transformedMessages, ...existingMessages]
                    : transformedMessages;

                return {
                    ...prev,
                    [convIdStr]: newMessages
                };
            });

            setMessageLoadState(prev => ({
                ...prev,
                [convIdStr]: {
                    cursor: response.nextCursor,
                    hasMore: response.hasMore,
                    offset: (prev[convIdStr]?.offset || 0) + response.messages.length
                }
            }));

            return response;
        } catch (err) {
            setError(err.message || 'Failed to fetch messages');
            return null;
        } finally {
            setLoading(false);
        }
    }, [transformMessages]);

    /**
     * Get messages for a conversation (from local state)
     */
    const getMessagesForConversation = useCallback((conversationId) => {
        const convIdStr = String(conversationId);
        const messages = allMessages[convIdStr] || [];
        const loadState = messageLoadState[convIdStr] || { hasMore: true, offset: 0 };

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
                const chatIdStr = String(selectedChatId);

                setAllMessages(prev => ({
                    ...prev,
                    [chatIdStr]: (prev[chatIdStr] || []).map(msg =>
                        msg.id === editingMessage.id ? transformedMessage : msg
                    )
                }));

                setEditingMessage(null);
                return { inputValue: '', message: transformedMessage };
            } catch (err) {
                setError(err.message || 'Failed to edit message');
                return { inputValue: messageInput, message: null };
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
            const chatIdStr = String(selectedChatId);

            // Add to local state
            setAllMessages(prev => ({
                ...prev,
                [chatIdStr]: [...(prev[chatIdStr] || []), transformedNewMessage]
            }));

            clearFiles();
            setReplyingTo(null);

            // Return empty string for input and the new message for conversation update
            return { inputValue: '', message: transformedNewMessage };
        } catch (err) {
            setError(err.message || 'Failed to send message');
            return { inputValue: messageInput, message: null };
        }
    }, [editingMessage, replyingTo, transformMessages]);

    /**
     * Delete a message
     */
    const deleteMessage = useCallback(async (messageId, conversationId) => {
        try {
            await chatService.deleteMessage(messageId);
            const convIdStr = String(conversationId);

            setAllMessages(prev => ({
                ...prev,
                [convIdStr]: (prev[convIdStr] || []).filter(m => m.id !== messageId)
            }));
        } catch (err) {
            setError(err.message || 'Failed to delete message');
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
            // Silently fail for read receipts
        }
    }, []);

    /**
     * Handle message actions (copy, edit, reply, delete, forward)
     */
    const handleMessageAction = useCallback((action, messageId, textareaRef, conversationId) => {
        const convIdStr = String(conversationId);
        const message = allMessages[convIdStr]?.find(m => m.id === messageId);
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
                // Forward handled by parent component
                break;
            default:
                break;
        }
        return null;
    }, [allMessages, deleteMessage]);

    /**
     * Add new message from WebSocket
     * FIXED: Properly convert ID to string for comparison and ensure no duplicates
     */
    const addMessageFromSocket = useCallback((message, conversationId) => {
        if (!message || !conversationId) {
            return;
        }

        setAllMessages(prev => {
            const existing = prev[conversationId] || [];

            // Convert both IDs to strings for proper comparison
            const messageIdStr = String(message.id);

            // Check if message already exists (compare as strings)
            if (existing.some(m => String(m.id) === messageIdStr)) {
                return prev;
            }

            // Transform message to add isSent property
            const transformedMessage = transformMessages([message])[0];

            // Ensure new messages have proper readBy array initialized
            const messageWithReadBy = {
                ...transformedMessage,
                readBy: transformedMessage.readBy || [],
                isRead: transformedMessage.isRead || false
            };

            return {
                ...prev,
                [conversationId]: [...existing, messageWithReadBy]
            };
        });
    }, [transformMessages]);

    /**
     * Update message from WebSocket
     * FIXED: Properly convert ID to string for comparison
     */
    const updateMessageFromSocket = useCallback((updatedMessage, conversationId) => {
        if (!updatedMessage || !conversationId) {
            return;
        }

        setAllMessages(prev => {
            const existing = prev[conversationId];

            if (!existing || existing.length === 0) {
                return prev;
            }

            // Convert IDs to strings for proper comparison
            const updatedIdStr = String(updatedMessage.id);

            // Check if message exists
            const messageExists = existing.some(m => String(m.id) === updatedIdStr);

            if (!messageExists) {
                return prev;
            }

            // Transform updated message
            const transformedMessage = transformMessages([updatedMessage])[0];

            return {
                ...prev,
                [conversationId]: existing.map(msg =>
                    String(msg.id) === updatedIdStr ? { ...msg, ...updatedMessage, timestamp: new Date().toISOString(), edited: true } : msg
                )
            };
        });
    }, [transformMessages]);

    /**
     * Remove message from WebSocket
     * FIXED: Properly convert ID to string for comparison
     */
    const removeMessageFromSocket = useCallback((messageId, conversationId) => {
        if (!messageId || !conversationId) {
            return;
        }

        setAllMessages(prev => {
            const existing = prev[conversationId];

            if (!existing || existing.length === 0) {
                return prev;
            }

            // Convert ID to string for proper comparison
            const messageIdStr = String(messageId);

            return {
                ...prev,
                [conversationId]: existing.filter(m => String(m.id) !== messageIdStr)
            };
        });
    }, []);

    /**
     * Update message read status from WebSocket
     * NEW: Handle read receipt updates
     */
    const updateMessageReadStatus = useCallback((messageId, conversationId, readerId, readerType) => {
        if (!messageId || !conversationId) {
            return;
        }



        setAllMessages(prev => {
            const existing = prev[conversationId];

            if (!existing || existing.length === 0) {
                return prev;
            }

            const messageIdStr = String(messageId);

            return {
                ...prev,
                [conversationId]: existing.map(msg => {
                    if (String(msg.id) === messageIdStr) {
                        // Update readers array if it exists, or mark as read
                        const updatedReaders = msg.readers || [];

                        // Check if this reader already exists
                        const readerExists = updatedReaders.some(
                            r => r.readerId === readerId && r.readerType === readerType
                        );

                        if (!readerExists) {
                            updatedReaders.push({ readerId, readerType });
                        }

                        return {
                            ...msg,
                            readers: updatedReaders,
                            isRead: true // Mark as read
                        };
                    }
                    return msg;
                })
            };
        });
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
        removeMessageFromSocket,
        updateMessageReadStatus
    };
};