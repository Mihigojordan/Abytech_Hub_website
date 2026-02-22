// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/chat/Sidebar';
import ChatList from '../../layouts/chat/ChatList';
import ChatArea from '../../layouts/chat/ChatArea';
import DragDropOverlay from '../../components/dashboard/chat/ui/DragDropOverlay';
import MediaViewer from '../../components/dashboard/chat/ui/MediaViewer';
import ForwardModal from '../../components/dashboard/chat/ui/ForwardModal';
import { API_URL } from '../../api/api';

// Custom hooks
import { useMessages } from '../../hooks/chat/useMessages';
import { useMessageSelection } from '../../hooks/chat/useMessageSelection';
import { useFileUpload } from '../../hooks/chat/useFileUpload';
import { useScrollManagement } from '../../hooks/chat/useScrollManagement';
import { useTypingIndicator } from '../../hooks/chat/useTypingIndicator';
import { useMessageRead } from '../../hooks/chat/useMessageRead';
import { useAutoRead } from '../../hooks/chat/useAutoRead';

// Services and Context
import chatService from '../../services/chatService';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import useAdminAuth from '../../context/AdminAuthContext';

/**
 * Main Chat Application Page
 */
const ChatApp = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();

    // Socket Context
    const { socket, isConnected, emit, on, off, emitUserOnline } = useSocket();

    // Auth Context
    const { user: admin } = useAdminAuth();

    // State
    const [selectedChatId, setSelectedChatId] = useState<string | null>(
        conversationId || null
    );
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(null);
    const [mediaViewer, setMediaViewer] = useState({
        isOpen: false,
        media: [],
        currentIndex: 0,
        timestamp: null
    });
    const [conversations, setConversations] = useState({});
    const [forwardModal, setForwardModal] = useState({
        isOpen: false,
        messages: [],
        loading: false
    });
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState<Map<string, { userType: 'ADMIN' | 'USER' }>>(new Map());

    // Fetch conversations and unread counts on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!admin?.id) return;

            setLoading(true);
            try {
                // Fetch conversations
                const convsData = await chatService.getConversations();
                const convsMap = convsData.reduce((acc: any, item: any) => {
                    const conv = { ...item.conversation };
                    conv.participantRole = item.role;
                    conv.joinedAt = item.joinedAt;
                    // Use string keys for consistent ID handling
                    acc[String(conv.id)] = conv;
                    return acc;
                }, {});
                setConversations(convsMap);

                // Fetch unread counts
                const countsData = await chatService.getUnreadMessageCounts();
                const countsMap = countsData.reduce((acc: any, item: any) => {
                    // Use string keys for consistent ID handling
                    acc[String(item.conversationId)] = item.unreadCount;
                    return acc;
                }, {});
                setUnreadCounts(countsMap);

                // Fetch contacts
                const contactsData = await chatService.getContacts();
                setContacts(contactsData);
            } catch (error) {
                console.error("Failed to fetch chat data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [admin?.id]);

    // Emit user:online when socket connects
    useEffect(() => {
        if (isConnected && admin?.id) {
            emitUserOnline(admin.id, 'ADMIN');
        }
    }, [isConnected, admin?.id, emitUserOnline]);

    // Socket Event Listeners for online status
    useSocketEvent('user:status', (data: any) => {
        const { userId, userType, status, lastSeen } = data;

        setOnlineUsers(prev => {
            const newMap = new Map(prev);
            if (status === 'online') {
                newMap.set(userId, { userType });
            } else {
                newMap.delete(userId);
            }
            return newMap;
        });

        // Update lastSeen in conversations if offline
        if (status === 'offline' && lastSeen) {
            setConversations((prev: any) => {
                const updated = { ...prev };
                Object.keys(updated).forEach(convId => {
                    const conv = updated[convId];
                    if (conv.participants) {
                        conv.participants = conv.participants.map((p: any) => {
                            if (p.participantId === userId && p.participantType === userType) {
                                return { ...p, lastSeen: new Date(lastSeen) };
                            }
                            return p;
                        });
                    }
                });
                return updated;
            });
        }
    });

    // Listen for initial online users list
    useSocketEvent('online:users', (data: any) => {
        const { users } = data;
        setOnlineUsers(new Map(
            users.map((u: any) => [u.userId, { userType: u.userType }])
        ));
    });

    // Socket Event: New Conversation (real-time)
    useSocketEvent('conversation:new', (data: any) => {
        const { conversation } = data;
        if (!conversation || !conversation.id) return;

        const convIdStr = String(conversation.id);

        // Add the new conversation to the state
        setConversations((prev: any) => {
            // Don't add if already exists
            if (prev[convIdStr]) return prev;

            return {
                ...prev,
                [convIdStr]: conversation
            };
        });

        // Initialize unread count for this conversation (0 since it's new)
        setUnreadCounts((prev: any) => ({
            ...prev,
            [convIdStr]: 0
        }));
    });

    // Socket Event: New Message
    useSocketEvent('message:new', (data: any) => {
        const { conversationId, message } = data;
        const convIdStr = String(conversationId);

        // Update messages list if viewing this conversation
        if (String(selectedChatId) === convIdStr) {
            addMessageFromSocket(message, convIdStr);
        }

        // Update conversation list preview with latest message
        setConversations((prev: any) => {
            const conv = prev[convIdStr];
            if (!conv) return prev;

            return {
                ...prev,
                [convIdStr]: {
                    ...conv,
                    messages: [{
                        ...message,
                        isRead: false, // New message starts unread
                        readBy: [], // Initialize empty readBy array for tracking
                        time: new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })
                    }],
                    updatedAt: message.timestamp || new Date().toISOString(),
                }
            };
        });

        // Update unread count if not current chat
        if (String(selectedChatId) !== convIdStr) {
            setUnreadCounts((prev: any) => ({
                ...prev,
                [convIdStr]: (prev[convIdStr] || 0) + 1
            }));
        }
    });

    // Socket Event: Message Edited
    useSocketEvent('message:edited', (data: any) => {
        const { conversationId, messageId, content, edited } = data;
        const convIdStr = String(conversationId);
        const msgIdStr = String(messageId);

        // Update in message list if viewing this conversation
        if (String(selectedChatId) === convIdStr) {
            updateMessageFromSocket({ id: messageId, content, edited: true }, convIdStr);
        }

        // Update conversation preview if this is the last message
        setConversations((prev: any) => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages || conv.messages.length === 0) return prev;

            const lastMessage = conv.messages[0];
            if (String(lastMessage.id) === msgIdStr) {
                return {
                    ...prev,
                    [convIdStr]: {
                        ...conv,
                        messages: [{
                            ...lastMessage,
                            content,
                            edited: true
                        }]
                    }
                };
            }
            return prev;
        });
    });

    // Socket Event: Message Deleted
    useSocketEvent('message:deleted', (data: any) => {
        const { conversationId, messageId } = data;
        const convIdStr = String(conversationId);

        if (String(selectedChatId) === convIdStr) {
            removeMessageFromSocket(messageId, convIdStr);
        }

        // Update conversation preview if deleted message was the last message
        setConversations((prev: any) => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages || conv.messages.length === 0) return prev;

            const lastMessage = conv.messages[0];
            if (String(lastMessage.id) === String(messageId)) {
                // Clear the last message preview since it was deleted
                return {
                    ...prev,
                    [convIdStr]: {
                        ...conv,
                        messages: []
                    }
                };
            }
            return prev;
        });
    });

    // Socket Event: Message Read
    // Note: Backend only sends this event to the message SENDER, so we know this is for our sent message
    useSocketEvent('message:read', (data: any) => {
        const { conversationId, messageId, readerId, readerType } = data;
        const convIdStr = String(conversationId);
        const msgIdStr = String(messageId);

        // Get conversation info to check if it's a group
        const conv = (conversations as any)[convIdStr];
        const isGroup = conv?.isGroup || false;
        const participantCount = conv?.participants?.length || 2;

        // Update message list for this conversation
        setAllMessages((prev: any) => {
            const currentMessages = prev[convIdStr] || [];
            if (currentMessages.length === 0) return prev;

            return {
                ...prev,
                [convIdStr]: currentMessages.map((m: any) => {
                    if (String(m.id) === msgIdStr) {
                        // Get current readBy array or initialize it
                        const currentReadBy = m.readBy || [];

                        // Check if this reader is already in the list
                        const alreadyRead = currentReadBy.some(
                            (r: any) => String(r.participantId) === String(readerId) && r.participantType === readerType
                        );

                        // Add reader if not already in list
                        const newReadBy = alreadyRead
                            ? currentReadBy
                            : [...currentReadBy, { participantId: readerId, participantType: readerType, readAt: new Date().toISOString() }];

                        // For 1-on-1: isRead = at least one person has read
                        // For groups: isRead = ALL other participants have read (participantCount - 1)
                        let newIsRead;
                        if (isGroup) {
                            const requiredReaders = participantCount - 1; // Everyone except sender
                            newIsRead = newReadBy.length >= requiredReaders;
                        } else {
                            newIsRead = newReadBy.length > 0;
                        }

                        return {
                            ...m,
                            readBy: newReadBy,
                            readByCount: newReadBy.length,
                            isRead: newIsRead
                        };
                    }
                    return m;
                })
            };
        });

        // Update conversation preview if this is the last message (for sender to see double tick)
        setConversations((prev: any) => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages || conv.messages.length === 0) return prev;

            const isGroupConv = conv.isGroup || false;
            const partCount = conv.participants?.length || 2;

            // Get the last message
            const lastMessage = conv.messages[conv.messages.length - 1] || conv.messages[0];

            // Update if this is the message being read
            if (String(lastMessage.id) === msgIdStr) {
                // Get current readBy or initialize
                const currentReadBy = lastMessage.readBy || [];
                const alreadyRead = currentReadBy.some(
                    (r: any) => String(r.participantId) === String(readerId) && r.participantType === readerType
                );
                const newReadBy = alreadyRead
                    ? currentReadBy
                    : [...currentReadBy, { participantId: readerId, participantType: readerType }];

                // Calculate isRead based on group/1-on-1
                let newIsRead;
                if (isGroupConv) {
                    const requiredReaders = partCount - 1;
                    newIsRead = newReadBy.length >= requiredReaders;
                } else {
                    newIsRead = newReadBy.length > 0;
                }

                return {
                    ...prev,
                    [convIdStr]: {
                        ...conv,
                        messages: conv.messages.map((m: any) =>
                            String(m.id) === msgIdStr ? { ...m, readBy: newReadBy, isRead: newIsRead } : m
                        )
                    }
                };
            }
            return prev;
        });
    });

    // Custom hooks
    const messagesHook = useMessages(admin ? { id: admin.id, userType: 'ADMIN' } : null);
    const {
        allMessages,
        setAllMessages,
        editingMessage,
        replyingTo,
        loading: messagesLoading,
        getMessagesForConversation,
        fetchMessages,
        sendMessage,
        handleMessageAction,
        markMessageAsRead,
        cancelEditOrReply,
        addMessageFromSocket,
        updateMessageFromSocket,
        removeMessageFromSocket
    } = messagesHook;

    const selectionHook = useMessageSelection();
    const {
        selectedMessages,
        selectionMode,
        toggleMessageSelection,
        handleBulkAction: originalBulkAction,
        clearSelection,
        startSelection
    } = selectionHook;

    const fileUploadHook = useFileUpload();
    const {
        uploadedFiles,
        isDragging,
        handleFileUpload,
        removeFile,
        clearFiles
    } = fileUploadHook;

    const { typingUsers, typingMap, handleTyping } = useTypingIndicator(selectedChatId, admin?.id, 'ADMIN');
    const isTyping = typingUsers && typingUsers.length > 0;

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fetchedChatsRef = useRef<Set<string>>(new Set());

    // Callback to clear unread count when conversation is marked as read
    const handleConversationRead = useCallback((conversationId: string) => {
        const convIdStr = String(conversationId);
        setUnreadCounts((prev: any) => ({
            ...prev,
            [convIdStr]: 0
        }));
    }, []);

    // Auto-read functionality
    useAutoRead(selectedChatId, admin?.id, 'ADMIN', handleConversationRead);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (selectedChatId && admin?.id) {
            const chatIdStr = String(selectedChatId);
            // Only fetch if not already fetched for this conversation
            if (!fetchedChatsRef.current.has(chatIdStr)) {
                fetchedChatsRef.current.add(chatIdStr);
                fetchMessages(selectedChatId);
            }
        }
    }, [selectedChatId, admin?.id, fetchMessages]);

    // Get messages for selected conversation
    const conversationData = selectedChatId
        ? getMessagesForConversation(selectedChatId)
        : { messages: [], hasMore: false };

    const { messages, hasMore } = conversationData;

    // Load more messages callback
    const loadMoreMessagesCallback = useCallback(async () => {
        if (!selectedChatId || !hasMore) return;

        const currentMessages = getMessagesForConversation(selectedChatId)?.messages || [];
        const oldestMessageId = currentMessages.length > 0 ? currentMessages[0].id : null;

        if (oldestMessageId) {
            await fetchMessages(selectedChatId, oldestMessageId);
        }
    }, [selectedChatId, hasMore, fetchMessages, getMessagesForConversation]);

    const scrollHook = useScrollManagement(messages, selectedChatId, loadMoreMessagesCallback, hasMore);
    const {
        isLoadingMore,
        showScrollButton,
        messagesEndRef,
        messagesContainerRef,
        loadMoreTriggerRef,
        scrollToBottom,
        setIsLoadingMore
    } = scrollHook;

    // Preserve scroll position
    const previousMessagesLengthRef = useRef(0);
    const scrollHeightRef = useRef(0);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (messages.length > previousMessagesLengthRef.current && previousMessagesLengthRef.current > 0) {
            const heightDifference = container.scrollHeight - scrollHeightRef.current;
            if (heightDifference > 0 && container.scrollTop < 300) {
                container.scrollTop += heightDifference;
            }
        }
        previousMessagesLengthRef.current = messages.length;
        scrollHeightRef.current = container.scrollHeight;
    }, [messages.length, messagesContainerRef]);

    // Message read receipts
    const handleMarkAsRead = useCallback((messageId) => {
        markMessageAsRead(messageId).then(() => {
            setUnreadCounts((prev) => {
                const currentCount = prev[selectedChatId] || 0;
                return {
                    ...prev,
                    [selectedChatId]: Math.max(0, currentCount - 1)
                };
            });
        });
    }, [selectedChatId, markMessageAsRead]);

    const { setMessageRef: setReadReceiptRef } = useMessageRead(messages, admin?.id, handleMarkAsRead, messagesContainerRef);

    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const setMessageRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) {
            messageRefs.current[id] = el;
        } else {
            delete messageRefs.current[id];
        }
        setReadReceiptRef(id, el);
    }, [setReadReceiptRef]);

    const scrollToMessage = useCallback((messageId: string) => {
        const el = messageRefs.current[messageId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-indigo-50', 'transition-colors', 'duration-500');
            setTimeout(() => {
                el.classList.remove('bg-indigo-50', 'transition-colors', 'duration-500');
            }, 2000);
        }
    }, []);

    // Update URL when conversation changes
    useEffect(() => {
        if (selectedChatId) {
            navigate(`/admin/dashboard/chat/${selectedChatId}`, { replace: true });
        }
    }, [selectedChatId, navigate]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowMenu(null);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMenu]);

    const handleSelectChat = (chatId) => {
        // Ensure consistent string type for chat ID
        setSelectedChatId(String(chatId));
        clearSelection();
        cancelEditOrReply();
        setMessageInput('');
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
        if (handleTyping) {
            handleTyping(value.length > 0);
        }
    };

    const handleSendMessage = async () => {
        if (isSending) return; // Prevent double-sending

        setIsSending(true);
        try {
            const result = await sendMessage(messageInput, uploadedFiles, selectedChatId, clearFiles);
            setMessageInput(result.inputValue);

            // Update conversation list with new message
            if (result.message && selectedChatId) {
                const chatIdStr = String(selectedChatId);
                setConversations((prev: any) => {
                    const conv = prev[chatIdStr];
                    if (!conv) return prev;

                    return {
                        ...prev,
                        [chatIdStr]: {
                            ...conv,
                            messages: [{
                                ...result.message,
                                isRead: false, // Initially not read by recipients (single tick)
                                readBy: [], // Initialize empty readBy array for tracking
                                time: new Date(result.message.timestamp || Date.now()).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })
                            }],
                            updatedAt: result.message.timestamp || new Date().toISOString(),
                        }
                    };
                });
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleMessageActionWrapper = (action, messageId) => {
        // Handle forward action from individual message menu
        if (action === 'forward') {
            const currentMessages = selectedChatId ? (allMessages[selectedChatId] || []) : [];
            const messageToForward = currentMessages.find((m: any) => String(m.id) === String(messageId));
            if (messageToForward) {
                setForwardModal({
                    isOpen: true,
                    messages: [messageToForward],
                    loading: false
                });
            }
            setShowMenu(null);
            return;
        }

        const result = handleMessageAction(action, messageId, textareaRef, selectedChatId);
        if (result !== null) {
            setMessageInput(result);
        }
        setShowMenu(null);
    };

    const handleToggleSelection = (messageId, startMode = false) => {
        if (startMode) {
            startSelection(messageId);
        } else {
            toggleMessageSelection(messageId);
        }
    };

    const handleBulkActionWrapper = (action) => {
        // Get current conversation messages
        const currentMessages = selectedChatId ? (allMessages[selectedChatId] || []) : [];

        if (action === 'edit' && selectedMessages.length === 1) {
            const message = currentMessages.find((m: any) => String(m.id) === String(selectedMessages[0]));
            if (message && message.isSent) {
                handleMessageActionWrapper('edit', selectedMessages[0]);
                clearSelection();
            }
        } else if (action === 'reply' && selectedMessages.length === 1) {
            handleMessageActionWrapper('reply', selectedMessages[0]);
            clearSelection();
        } else if (action === 'forward') {
            // Open forward modal with selected messages
            const messagesToForward = currentMessages.filter((m: any) =>
                selectedMessages.some(id => String(id) === String(m.id))
            );
            setForwardModal({
                isOpen: true,
                messages: messagesToForward,
                loading: false
            });
        } else if (action === 'delete') {
            // Delete selected messages
            selectedMessages.forEach((messageId: any) => {
                handleMessageActionWrapper('delete', messageId);
            });
            clearSelection();
        } else {
            originalBulkAction(action, currentMessages, (updatedMessages: any) => {
                setAllMessages((prev: any) => ({
                    ...prev,
                    [selectedChatId]: updatedMessages
                }));
            });
        }
    };

    // Handle forward messages to multiple conversations
    const handleForward = async (targetConversationIds: string[]) => {
        try {
            setForwardModal(prev => ({ ...prev, loading: true }));

            const messageIds = forwardModal.messages.map((m: any) => m.id.toString());

            // Forward to all selected conversations
            await chatService.forwardMessages(messageIds, targetConversationIds);

            // Close modal and clear selection
            setForwardModal({ isOpen: false, messages: [], loading: false });
            clearSelection();

            // Messages will appear via WebSocket automatically
        } catch (err) {
            setForwardModal(prev => ({ ...prev, loading: false }));
            alert('Failed to forward messages');
        }
    };

    const handleCancelEditReply = () => {
        const newInput = cancelEditOrReply();
        setMessageInput(newInput);
    };

    const handleMediaView = (media: any[], index: number, timestamp: Date) => {
        setMediaViewer({
            isOpen: true,
            media,
            currentIndex: index,
            timestamp
        });
    };

    const navigateMedia = (direction) => {
        setMediaViewer(prev => ({
            ...prev,
            currentIndex: Math.max(0, Math.min(prev.media.length - 1, prev.currentIndex + direction))
        }));
    };

    const downloadMedia = async (media: any) => {
        try {
            // Resolve the actual URL (handles both relative and absolute URLs)
            let url = '';
            if (media.type === 'image') {
                url = media.url?.imageUrl || media.url || '';
            } else {
                url = media.url?.fileUrl || media.fileUrl || media.url || '';
            }

            // If it's a relative URL, prepend the API base
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                const path = url.startsWith('/') ? url : `/${url}`;
                url = `${API_URL}${path}`;
            }

            if (!url) return;

            // Fetch the file as a blob for a real download
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = media.name || media.fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            const fallbackUrl = media.url?.imageUrl || media.url?.fileUrl || media.fileUrl || media.url || '';
            if (fallbackUrl) {
                window.open(fallbackUrl.startsWith('http') ? fallbackUrl : `${API_URL}${fallbackUrl}`, '_blank');
            }
        }
    };

    // Helper function to check if a user is online
    const isUserOnline = useCallback((userId: string, userType: 'ADMIN' | 'USER') => {
        const user = onlineUsers.get(userId);
        return user && user.userType === userType;
    }, [onlineUsers]);

    // Enrich selected conversation with real-time online status
    const selectedConversation = useMemo(() => {
        if (!selectedChatId || !(conversations as any)[selectedChatId]) {
            return null;
        }

        const conv = (conversations as any)[selectedChatId];

        // Enrich participants with real-time online status
        const enrichedParticipants = conv.participants?.map((p: any) => ({
            ...p,
            isOnline: isUserOnline(p.participantId, p.participantType)
        }));

        return {
            ...conv,
            participants: enrichedParticipants
        };
    }, [selectedChatId, conversations, isUserOnline]);

    const handleBack = () => {
        setSelectedChatId(null);
        navigate('/admin/dashboard/chat', { replace: true });
    };

    const handleNewConversation = (conversation) => {
        setConversations(prev => ({
            ...prev,
            [conversation.id]: conversation
        }));
        setSelectedChatId(conversation.id);
        navigate(`/admin/dashboard/chat/${conversation.id}`);
    };

    return (
        <div className="flex h-[90vh] xl:h-[92vh] bg-gray-100 overflow-hidden">
            <Sidebar
                onConversationCreated={handleNewConversation}
                selectedChatId={selectedChatId}
            />

            <ChatList
                conversations={conversations}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isTyping={typingMap}
                allMessages={allMessages}
                contacts={contacts}
                currentUser={admin}
                unreadCounts={unreadCounts}
                onlineUsers={onlineUsers}
                isLoading={loading}
            />

            <div className={`flex-1 flex flex-col h-full min-w-0 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                <ChatArea
                    selectedConversation={selectedConversation}
                    messages={messages}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    isLoadingInitial={messagesLoading && messages.length === 0}
                    showScrollButton={showScrollButton}
                    unreadCount={unreadCounts[selectedChatId] || 0}
                    scrollToBottom={scrollToBottom}
                    scrollToMessage={scrollToMessage}
                    loadMoreTriggerRef={loadMoreTriggerRef}
                    messagesEndRef={messagesEndRef}
                    messagesContainerRef={messagesContainerRef}
                    messageInput={messageInput}
                    onMessageInputChange={handleInputChange}
                    onSendMessage={handleSendMessage}
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    imageInputRef={imageInputRef}
                    onFileUpload={handleFileUpload}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={removeFile}
                    onClearFiles={clearFiles}
                    editingMessage={editingMessage}
                    replyingTo={replyingTo}
                    onCancelEditReply={handleCancelEditReply}
                    selectionMode={selectionMode}
                    selectedMessages={selectedMessages}
                    onCancelSelection={clearSelection}
                    onBulkAction={handleBulkActionWrapper}
                    isTyping={isTyping}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    onToggleSelection={handleToggleSelection}
                    onMessageAction={handleMessageActionWrapper}
                    onMediaView={handleMediaView}
                    allMessages={allMessages}
                    setMessageRef={setMessageRef}
                    onConversationUpdated={fetchMessages}
                    isSending={isSending}
                    onBack={handleBack}
                />
            </div>

            {/* Drag & Drop Overlay */}
            <DragDropOverlay isVisible={isDragging} />

            <MediaViewer
                isOpen={mediaViewer.isOpen}
                media={mediaViewer.media}
                currentIndex={mediaViewer.currentIndex}
                timestamp={mediaViewer.timestamp}
                onClose={() => setMediaViewer(prev => ({ ...prev, isOpen: false }))}
                onNavigate={navigateMedia}
                onDownload={downloadMedia}
            />

            {/* Forward Modal */}
            <ForwardModal
                isOpen={forwardModal.isOpen}
                messages={forwardModal.messages}
                conversations={Object.values(conversations)}
                currentConversationId={selectedChatId}
                loading={forwardModal.loading}
                onForward={handleForward}
                onClose={() => setForwardModal({ isOpen: false, messages: [], loading: false })}
            />
        </div>
    );
};

export default ChatApp;