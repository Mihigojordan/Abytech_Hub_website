// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/chat/Sidebar';
import ChatList from '../../layouts/chat/ChatList';
import ChatArea from '../../layouts/chat/ChatArea';
import DragDropOverlay from '../../components/dashboard/chat/ui/DragDropOverlay';
import MediaViewer from '../../components/dashboard/chat/ui/MediaViewer';
import ForwardModal from '../../components/dashboard/chat/ui/ForwardModal';

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
                    acc[conv.id] = conv;
                    return acc;
                }, {});
                setConversations(convsMap);

                // Fetch unread counts
                const countsData = await chatService.getUnreadMessageCounts(admin.id, 'ADMIN');
                const countsMap = countsData.reduce((acc: any, item: any) => {
                    acc[item.conversationId] = item.unreadCount;
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

    // Socket Event: New Message
    useSocketEvent('message:new', (data: any) => {
        const { conversationId, message } = data;

        // Update messages list if viewing this conversation
        if (selectedChatId == conversationId.toString()) {
            addMessageFromSocket(message, conversationId.toString());

        }

        // Update conversation list preview with latest message
        setConversations((prev: any) => {
            const conv = prev[conversationId];
            if (!conv) return prev;



            // Determine if message is read (sender always sees their own messages as read)
            const isRead = message.senderId === admin?.id && message.senderType === 'ADMIN';

            return {
                ...prev,
                [conversationId]: {
                    ...conv,
                    messages: [{
                        ...message,
                        isRead: isRead,
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
        if (selectedChatId != conversationId.toString()) {
            setUnreadCounts((prev: any) => ({
                ...prev,
                [conversationId]: (prev[conversationId] || 0) + 1
            }));
        }
    });

    // Socket Event: Message Edited
    useSocketEvent('message:edited', (data: any) => {
        const { conversationId, messageId, content, edited } = data;

        // Update in message list if viewing this conversation
        if (selectedChatId == conversationId.toString()) {
            updateMessageFromSocket({ id: messageId, content, edited: true }, conversationId.toString());
        }

        // Update conversation preview if this is the last message
        setConversations((prev: any) => {
            const conv = prev[conversationId];
            if (!conv || !conv.messages || conv.messages.length === 0) return prev;

            const lastMessage = conv.messages[0];
            if (lastMessage.id == messageId) {
                return {
                    ...prev,
                    [conversationId]: {
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
        if (selectedChatId == conversationId.toString()) {
            removeMessageFromSocket(messageId, conversationId.toString());
        }
    });

    // Socket Event: Message Read
    useSocketEvent('message:read', (data: any) => {
        const { conversationId, messageId, readerId } = data;

        // Update message list if viewing this conversation
        if (selectedChatId == conversationId.toString()) {
            setAllMessages((prev: any) => {
                const currentMessages = prev[conversationId] || [];
                return {
                    ...prev,
                    [conversationId]: currentMessages.map((m: any) => {
                        if (m.id == messageId) {
                            return { ...m, isRead: true };
                        }
                        return m;
                    })
                };
            });
        }

        // Update conversation preview if this is the last message (for sender to see double tick)
        setConversations((prev: any) => {
            const conv = prev[conversationId];
            if (!conv || !conv.messages || conv.messages.length === 0) return prev;

            const lastMessage = conv.messages[0];
            // Only update if this is the last message and current user is the sender
            if (lastMessage.id == messageId && lastMessage.senderId === admin?.id && lastMessage.senderType === 'ADMIN') {
                return {
                    ...prev,
                    [conversationId]: {
                        ...conv,
                        messages: [{
                            ...lastMessage,
                            isRead: true
                        }]
                    }
                };
            }
            return prev;
        });

        // Update unread count if current user read the message
        if (readerId === admin?.id) {
            setUnreadCounts((prev: any) => {
                const currentCount = prev[conversationId] || 0;
                return {
                    ...prev,
                    [conversationId]: Math.max(0, currentCount - 1)
                };
            });
        }
    });

    // Custom hooks
    const messagesHook = useMessages(admin ? { id: admin.id, userType: 'ADMIN' } : null);
    const {
        allMessages,
        setAllMessages,
        editingMessage,
        replyingTo,
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

    // Auto-read functionality
    useAutoRead(selectedChatId, admin?.id, 'ADMIN');

    // Fetch messages when conversation changes
    useEffect(() => {
        if (selectedChatId && admin?.id && !fetchedChatsRef.current.has(selectedChatId)) {
            fetchedChatsRef.current.add(selectedChatId);
            console.log('📨 Fetching initial messages for conversation:', selectedChatId);
            fetchMessages(selectedChatId);
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
            console.log('📥 Loading more messages...', oldestMessageId);
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
        setSelectedChatId(chatId);
        clearSelection();
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
        if (handleTyping) {
            handleTyping(value.length > 0);
        }
    };

    const handleSendMessage = async () => {
        const newInput = await sendMessage(messageInput, uploadedFiles, selectedChatId, clearFiles);
        setMessageInput(newInput);
    };

    const handleMessageActionWrapper = (action, messageId) => {
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
        if (action === 'edit' && selectedMessages.length === 1) {
            const message = allMessages.find((m: any) => m.id === selectedMessages[0]);
            if (message && message.isSent) {
                handleMessageActionWrapper('edit', selectedMessages[0]);
                clearSelection();
            }
        } else if (action === 'reply' && selectedMessages.length === 1) {
            handleMessageActionWrapper('reply', selectedMessages[0]);
            clearSelection();
        } else if (action === 'forward') {
            // Open forward modal with selected messages
            const messagesToForward = allMessages.filter((m: any) =>
                selectedMessages.includes(m.id)
            );
            setForwardModal({
                isOpen: true,
                messages: messagesToForward,
                loading: false
            });
        } else {
            originalBulkAction(action, allMessages, setAllMessages);
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

            // Show success message (you can add toast notification here)
            console.log(`Messages forwarded to ${targetConversationIds.length} conversation(s)`);

            // Messages will appear via WebSocket automatically
        } catch (err) {
            console.error('Forward failed:', err);
            setForwardModal(prev => ({ ...prev, loading: false }));
            // Show error message (you can add toast notification here)
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

    const downloadMedia = (media: any) => {
        const link = document.createElement('a');
        link.href = media.url || '#';
        link.download = media.name || 'download';
        link.click();
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

    const handleNewConversation = (conversation) => {
        setConversations(prev => ({
            ...prev,
            [conversation.id]: conversation
        }));
        setSelectedChatId(conversation.id);
        navigate(`/admin/dashboard/chat/${conversation.id}`);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar onConversationCreated={handleNewConversation} />

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
            />

            <ChatArea
                selectedConversation={selectedConversation}
                messages={messages}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
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
            />

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
            {console.log('Rendering ForwardModal:', {
                isOpen: forwardModal.isOpen,
                messagesCount: forwardModal.messages.length,
                conversationsCount: Object.values(conversations).length
            })}
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