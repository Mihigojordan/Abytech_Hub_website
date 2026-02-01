// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
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
    const [messageLoadState, setMessageLoadState] = useState({});
    const [mediaViewer, setMediaViewer] = useState({
        isOpen: false,
        media: [],
        currentIndex: 0,
        timestamp: null
    });
    const [conversations, setConversations] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    // Remove manual contacts state - can fetch if needed, 
    // or keep for now but we'll focus on conversations
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
                console.warn('shit', convsData);
                // Map array to object: { [id]: conversation }
                // Backend returns ConversationParticipant objects which contain the conversation
                // structure: { conversation: { id, ... }, ... }
                const convsMap = convsData.reduce((acc: any, item: any) => {
                    // Start with the conversation object
                    const conv = { ...item.conversation };
                    // Add participant details if needed (like role, joinedAt)
                    conv.participantRole = item.role;
                    conv.joinedAt = item.joinedAt;

                    acc[conv.id] = conv;
                    return acc;
                }, {});


                setConversations(convsMap);

                // Fetch unread counts
                // We need to pass admin ID and type (usually 'ADMIN' for this dashboard)
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

        // console.log('New message received:', message);

        // Update messages list if viewing this conversation
        // Update messages list if viewing this conversation
        if (selectedChatId == conversationId.toString()) {
            addMessageFromSocket(message, conversationId.toString());
        }

        // Update conversation list preview
        setConversations((prev: any) => {
            const conv = prev[conversationId];
            if (!conv) return prev; // Should Fetch if new conversation?

            return {
                ...prev,
                [conversationId]: {
                    ...conv,
                    messages: [message], // Update preview
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

        if (selectedChatId == conversationId.toString()) {
            setAllMessages((prev: any) => {
                const currentMessages = prev[conversationId] || [];
                // We're just updating the UI to show it's read
                // Since this is complex to do with simple map without full message data used in transform,
                // and the current UI might not even show granular read receipts per user yet (just "isRead" or similar),
                // we will skip complex updates for now or implement a proper helper later.
                // But to avoid crashing:
                return {
                    ...prev,
                    [conversationId]: currentMessages.map((m: any) => {
                        if (m.id == messageId) {
                            // Cloning to trigger re-render if needed
                            return { ...m, isRead: true }; // Simplified update
                        }
                        return m;
                    })
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
        fetchMessages, // Added fetchMessages
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
        // setSelectionMode, // Removed
        toggleMessageSelection,
        handleBulkAction: originalBulkAction, // Aliased
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

    const { typingUsers, handleTyping } = useTypingIndicator(socket, selectedChatId, admin?.id);

    // Derive isTyping for backward compatibility
    const isTyping = typingUsers && typingUsers.length > 0;

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fetchedChatsRef = useRef<Set<string>>(new Set()); // Track fetched conversations

    // Fetch messages when conversation changes
    useEffect(() => {
        if (selectedChatId && admin?.id && !fetchedChatsRef.current.has(selectedChatId)) {
            // Mark as fetched before the async call to prevent race conditions
            fetchedChatsRef.current.add(selectedChatId);
            fetchMessages(selectedChatId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChatId, admin?.id]); // Intentionally exclude fetchMessages to prevent infinite loop

    // Get messages for selected conversation
    // Note: getMessagesForConversation uses internal hook state, no need to pass argument
    const { messages, hasMore } = selectedChatId
        ? getMessagesForConversation(selectedChatId)
        : { messages: [], hasMore: false };

    const scrollHook = useScrollManagement(messages, selectedChatId || 0);
    const {
        isLoadingMore,
        showScrollButton,
        messagesEndRef,
        messagesContainerRef,
        loadMoreTriggerRef,
        scrollToBottom,
        loadMoreMessages,
        setIsLoadingMore
    } = scrollHook;

    // Message read receipts
    const { setMessageRef } = useMessageRead(messages, admin?.id, markMessageAsRead, messagesContainerRef);

    // Update URL when conversation changes
    useEffect(() => {
        if (selectedChatId) {
            navigate(`/admin/dashboard/chat/${selectedChatId}`, { replace: true });
        }
    }, [selectedChatId, navigate]);

    // Scroll-to-top event listener for lazy loading
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || !hasMore) return;

        const handleScrollToTop = () => {
            if (hasMore && !isLoadingMore) {
                loadMoreMessages(messageLoadState, setMessageLoadState);
            }
        };

        container.addEventListener('scrollToTop', handleScrollToTop);
        return () => container.removeEventListener('scrollToTop', handleScrollToTop);
    }, [hasMore, isLoadingMore, selectedChatId, messageLoadState]);

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
            handleBulkAction(action, allMessages, setAllMessages);
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
                isTyping={isTyping}
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
                scrollToBottom={scrollToBottom}
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