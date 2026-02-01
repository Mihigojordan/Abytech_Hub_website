// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../layouts/chat/Sidebar';
import ChatList from '../../layouts/chat/ChatList';
import ChatArea from '../../layouts/chat/ChatArea';
import DragDropOverlay from '../../components/dashboard/chat/ui/DragDropOverlay';
import MediaViewer from '../../components/dashboard/chat/ui/MediaViewer';

// Custom hooks
import { useMessages } from '../../hooks/chat/useMessages';
import { useMessageSelection } from '../../hooks/chat/useMessageSelection';
import { useFileUpload } from '../../hooks/chat/useFileUpload';
import { useScrollManagement } from '../../hooks/chat/useScrollManagement';
import { useTypingIndicator } from '../../hooks/chat/useTypingIndicator';
import { useMessageRead } from '../../hooks/chat/useMessageRead';

// Services and Context
import chatService from '../../services/chatService';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import useAdminAuth from '../../context/AdminAuthContext';

/**
 * Main Chat Application Page - Refactored
 * This component orchestrates all chat functionality using modular components and hooks
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
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([
        { id: '1', name: 'Patrick', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
        { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
        { id: '3', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
    ]);

    // Fetch conversations and unread counts on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!admin?.id) return;

            setLoading(true);
            try {
                // Fetch conversations
                const convsData = await chatService.getConversations();
                console.warn('Conversations data:', convsData);
                
                // Map array to object: { [id]: conversation }
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

    // Socket Event Listeners

    // 1. New Message
    useSocketEvent('message:new', (data: any) => {
        const { conversationId, message } = data;

        console.warn('New message received:', message);

        // Update messages list if viewing this conversation
        if (selectedChatId == conversationId.toString()) {
            addMessageFromSocket(message, conversationId.toString());
        }

        // Update conversation list preview
        setConversations((prev: any) => {
            const conv = prev[conversationId];
            if (!conv) return prev;

            return {
                ...prev,
                [conversationId]: {
                    ...conv,
                    messages: [message],
                    updatedAt: new Date().toISOString(),
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

    // 2. Message Edited
    useSocketEvent('message:edited', (data: any) => {
        const { conversationId, messageId, content } = data;
        
        if (selectedChatId == conversationId.toString()) {
        console.warn(data);
            updateMessageFromSocket({ id: messageId, content, edited: true }, conversationId.toString());
        }
    });

    // 3. Message Deleted
    useSocketEvent('message:deleted', (data: any) => {
        const { conversationId, messageId } = data;

        if (selectedChatId == conversationId.toString()) {
            removeMessageFromSocket(messageId, conversationId.toString());
        }
    });

    // 4. Message Read
    useSocketEvent('message:read', (data: any) => {
        const { conversationId, messageId, readerId } = data;

        // Update message status in UI
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

        // Update unread count if I read the message
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

    // Derive isTyping for backward compatibility
    const isTyping = typingUsers && typingUsers.length > 0;

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fetchedChatsRef = useRef<Set<string>>(new Set());

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

    // Calculate cursor as the ID of the oldest (first) message
    const cursor = messages.length > 0 ? messages[0].id : null;

    console.log('📊 Conversation state:', {
        selectedChatId,
        messageCount: messages.length,
        hasMore,
        cursor,
        oldestMessage: messages.length > 0 ? messages[0] : null,
        newestMessage: messages.length > 0 ? messages[messages.length - 1] : null
    });

    // Load more messages callback
    const loadMoreMessagesCallback = useCallback(async () => {
        if (!selectedChatId) {
            console.log('⚠️ No chat selected, skipping load more');
            return;
        }

        if (!hasMore) {
            console.log('⚠️ No more messages to load');
            return;
        }

        // Get the current oldest message ID as cursor
        const currentMessages = getMessagesForConversation(selectedChatId)?.messages || [];
        const oldestMessageId = currentMessages.length > 0 ? currentMessages[0].id : null;

        if (!oldestMessageId) {
            console.log('⚠️ No messages available to use as cursor');
            return;
        }

        console.log('📥 Loading more messages...', {
            conversationId: selectedChatId,
            cursor: oldestMessageId,
            currentMessageCount: currentMessages.length
        });

        try {
            // Fetch more messages with the oldest message ID as cursor
            await fetchMessages(selectedChatId, oldestMessageId);
            console.log('✅ Successfully loaded more messages');
        } catch (error) {
            console.error('❌ Error loading more messages:', error);
        }
    }, [selectedChatId, hasMore, fetchMessages, getMessagesForConversation]);

    // Initialize scroll hook with the callback and hasMore flag
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

    // Preserve scroll position after loading more messages
    const previousMessagesLengthRef = useRef(0);
    const scrollHeightRef = useRef(0);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // If messages increased (new messages loaded at the top)
        if (messages.length > previousMessagesLengthRef.current && previousMessagesLengthRef.current > 0) {
            const heightDifference = container.scrollHeight - scrollHeightRef.current;
            
            // Only adjust if we loaded messages at the top (not at bottom)
            if (heightDifference > 0 && container.scrollTop < 300) {
                console.log('📍 Preserving scroll position:', {
                    previousHeight: scrollHeightRef.current,
                    newHeight: container.scrollHeight,
                    heightDiff: heightDifference,
                    previousScrollTop: container.scrollTop
                });
                
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

    // Scroll to specific message and handle read receipts
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const setMessageRef = useCallback((id: string, el: HTMLDivElement | null) => {
        // Handle local refs for scrolling
        if (el) {
            messageRefs.current[id] = el;
        } else {
            delete messageRefs.current[id];
        }

        // Handle read receipts
        setReadReceiptRef(id, el);
    }, [setReadReceiptRef]);

    const scrollToMessage = useCallback((messageId: string) => {
        const el = messageRefs.current[messageId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight effect
            el.classList.add('bg-indigo-50', 'transition-colors', 'duration-500');
            setTimeout(() => {
                el.classList.remove('bg-indigo-50', 'transition-colors', 'duration-500');
            }, 2000);
        } else {
            console.warn(`Message ${messageId} not found in DOM`);
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
        } else {
            originalBulkAction(action, allMessages, setAllMessages);
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

    const selectedConversation = selectedChatId ? (conversations as any)[selectedChatId] : null;

    // Handle new conversation created from admin list
    const handleNewConversation = (conversation) => {
        // Add to conversations list
        setConversations(prev => ({
            ...prev,
            [conversation.id]: conversation
        }));
        // Select the new conversation
        setSelectedChatId(conversation.id);
        navigate(`/admin/dashboard/chat/${conversation.id}`);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar onConversationCreated={handleNewConversation} />

            {/* Chat List */}
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
            />

            {/* Chat Area */}
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

            {/* Drag & Drop Overlay */}
            <DragDropOverlay isVisible={isDragging} />

            {/* Media Viewer */}
            <MediaViewer
                isOpen={mediaViewer.isOpen}
                media={mediaViewer.media}
                currentIndex={mediaViewer.currentIndex}
                timestamp={mediaViewer.timestamp}
                onClose={() => setMediaViewer(prev => ({ ...prev, isOpen: false }))}
                onNavigate={navigateMedia}
                onDownload={downloadMedia}
            />
        </div>
    );
};

export default ChatApp;