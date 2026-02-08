import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';
import chatService from '../services/chatService';
import { useMessages as useChatMessages } from '../hooks/chat/useMessages';
import useAdminAuth from './AdminAuthContext';

const MessageContext = createContext();

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within MessageProvider');
    }
    return context;
};

export const MessageProvider = ({ children }) => {
    const { socket, on, off } = useSocket();
    const { user: admin } = useAdminAuth();

    // Initialize the chat messages hook with the current admin user
    // This hook manages the 'allMessages' state and business logic
    const {
        allMessages,
        setAllMessages,
        editingMessage,
        setEditingMessage,
        replyingTo,
        setReplyingTo,
        loading: messagesLoading,
        error: messagesError,
        fetchMessages,
        getMessagesForConversation,
        sendMessage,
        deleteMessage,
        handleMessageAction,
        markMessageAsRead,
        cancelEditOrReply,
        addMessageFromSocket,
        updateMessageFromSocket,
        removeMessageFromSocket,
        updateMessageReadStatus
    } = useChatMessages(admin ? { id: admin.id, userType: 'ADMIN' } : null);

    // ====================
    // ADDITIONAL STATE (Conversations, Online Status)
    // ====================
    const [conversations, setConversations] = useState({}); // { [id]: conversation }
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set of online userIds
    const [unreadCounts, setUnreadCounts] = useState({}); // { [convId]: count }
    const [currentConversation, setCurrentConversation] = useState(null); // Current conversation ID

    // ====================
    // CONVERSATION MANAGEMENT
    // ====================

    const updateConversation = useCallback((conversationId, updates) => {
        setConversations(prev => ({
            ...prev,
            [conversationId]: {
                ...prev[conversationId],
                ...updates,
            },
        }));
    }, []);

    const sortConversations = useCallback(() => {
        setConversations(prev => {
            const sorted = Object.values(prev).sort((a, b) => {
                const aTime = new Date(a.conversation?.updatedAt || a.updatedAt || 0).getTime();
                const bTime = new Date(b.conversation?.updatedAt || b.updatedAt || 0).getTime();
                return bTime - aTime; // Newest first
            });

            // Convert back to object
            return sorted.reduce((acc, conv) => {
                const convId = conv.conversation?.id || conv.id;
                acc[convId] = conv;
                return acc;
            }, {});
        });
    }, []);

    const updateConversationLastMessage = useCallback((conversationId, message) => {
        setConversations(prev => {
            const conv = prev[conversationId];
            if (!conv) return prev;

            return {
                ...prev,
                [conversationId]: {
                    ...conv,
                    conversation: {
                        ...conv.conversation,
                        messages: [message],
                        updatedAt: new Date().toISOString(),
                    },
                },
            };
        });

        // Trigger re-sort after updating
        setTimeout(sortConversations, 100);
    }, [sortConversations]);

    // ====================
    // ONLINE STATUS MANAGEMENT
    // ====================

    const setUserOnlineStatus = useCallback((userId, isOnline, lastSeen = null) => {
        setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (isOnline) {
                newSet.add(userId);
            } else {
                newSet.delete(userId);
            }
            return newSet;
        });

        // Update participant status in all conversations
        setConversations(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(convId => {
                const conv = updated[convId];
                if (conv.conversation?.participants) {
                    updated[convId] = {
                        ...conv,
                        conversation: {
                            ...conv.conversation,
                            participants: conv.conversation.participants.map(p =>
                                p.participantId === userId
                                    ? { ...p, isOnline, lastSeen }
                                    : p
                            ),
                        },
                    };
                }
            });
            return updated;
        });
    }, []);

    // ====================
    // READ RECEIPTS (Conversation Level)
    // ====================

    const markConversationAsRead = useCallback(async (conversationId) => {
        try {
            const response = await chatService.markConversationAsRead(conversationId);

            // Clear unread count
            setUnreadCounts(prev => ({
                ...prev,
                [conversationId]: 0,
            }));

            // Update all messages in this conversation to be read
            setAllMessages(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || []).map(msg => ({
                    ...msg,
                    isRead: true,
                })),
            }));

            return response;
        } catch (error) {
            console.error('Failed to mark conversation as read:', error);
            throw error;
        }
    }, [setAllMessages]);

    // Helper for manual setting if needed (though hook mostly handles it)
    const setConversationMessages = useCallback((conversationId, messages) => {
        setAllMessages(prev => ({
            ...prev,
            [conversationId]: messages,
        }));
    }, [setAllMessages]);

    // ====================
    // WEBSOCKET EVENT LISTENERS
    // ====================

    useEffect(() => {
        if (!socket) return;

        // New message
        const handleNewMessage = (data) => {
            const { conversationId, message } = data;

            // 1. Update Message List (via Hook)
            addMessageFromSocket(message, conversationId.toString());

            // 2. Update Conversation Last Message & Sort
            updateConversationLastMessage(conversationId.toString(), message);

            // 3. Increment unread count if not current conversation
            if (currentConversation !== conversationId.toString()) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [conversationId]: (prev[conversationId] || 0) + 1,
                }));
            }
        };

        // Message edited
        const handleMessageEdited = (data) => {
            const { conversationId, messageId, content } = data;

            // Update Message List (via Hook)
            // Hook expects complete object or handles partial?
            // Hook's updateMessageFromSocket transforms it.
            updateMessageFromSocket({ id: messageId, content, isEdited: true }, conversationId.toString());
        };

        // Message deleted
        const handleMessageDeleted = (data) => {
            const { conversationId, messageId } = data;
            removeMessageFromSocket(messageId, conversationId.toString());
        };

        // Message read
        const handleMessageRead = (data) => {
            const { conversationId, messageId, readerId, readerType } = data;
            if (updateMessageReadStatus) {
                updateMessageReadStatus(messageId, conversationId.toString(), readerId, readerType);
            }
        };

        // User status
        const handleUserStatus = (data) => {
            const { userId, status, lastSeen } = data;
            setUserOnlineStatus(userId, status === 'online', lastSeen);
        };

        // Register event listeners
        on('message:new', handleNewMessage);
        on('message:edited', handleMessageEdited);
        on('message:deleted', handleMessageDeleted);
        on('message:read', handleMessageRead);
        on('user:status', handleUserStatus);

        // Cleanup
        return () => {
            off('message:new', handleNewMessage);
            off('message:edited', handleMessageEdited);
            off('message:deleted', handleMessageDeleted);
            off('message:read', handleMessageRead);
            off('user:status', handleUserStatus);
        };
    }, [
        socket, on, off,
        currentConversation,
        addMessageFromSocket,
        updateMessageFromSocket,
        removeMessageFromSocket,
        updateMessageReadStatus,
        updateConversationLastMessage,
        setUserOnlineStatus
    ]);

    // ====================
    // CONTEXT VALUE
    // ====================

    const value = {
        // State (Mixed from Hook + Local)
        conversations,
        allMessages, // From Hook
        onlineUsers,
        unreadCounts,
        currentConversation,
        messagesLoading, // From Hook
        messagesError,   // From Hook
        editingMessage,  // From Hook
        replyingTo,      // From Hook

        // Setters
        setConversations,
        setCurrentConversation,
        setUnreadCounts,
        setConversationMessages,
        setEditingMessage, // From HOok
        setReplyingTo,     // From Hook

        // Conversation Operations
        updateConversation,
        sortConversations,
        updateConversationLastMessage,
        markConversationAsRead,

        // Message Operations (Delegated to Hook)
        fetchMessages,
        getMessagesForConversation,
        sendMessage,
        deleteMessage,
        handleMessageAction,
        markMessageAsRead,
        cancelEditOrReply,

        // Online Status
        setUserOnlineStatus,
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};
