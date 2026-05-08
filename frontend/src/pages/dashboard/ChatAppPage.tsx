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
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// Custom hooks
import { useMessages } from '../../hooks/chat/useMessages';
import { useMessageSelection } from '../../hooks/chat/useMessageSelection';
import { useFileUpload } from '../../hooks/chat/useFileUpload';
import { useScrollManagement } from '../../hooks/chat/useScrollManagement';
import { useTypingIndicator } from '../../hooks/chat/useTypingIndicator';
import { useMessageRead } from '../../hooks/chat/useMessageRead';
import { useAutoRead } from '../../hooks/chat/useAutoRead';
import { useCallContext } from '../../context/CallContext';

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
    const { bg, bg2, bg3, textC, border } = useDashboardTheme();

    // Socket Context
    const { socket, isConnected, emit, on, off } = useSocket();

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
                const convsData = await chatService.getConversations();
                const convsMap = convsData.reduce((acc: any, item: any) => {
                    const conv = { ...item.conversation };
                    conv.participantRole = item.role;
                    conv.joinedAt = item.joinedAt;
                    acc[String(conv.id)] = conv;
                    return acc;
                }, {});
                setConversations(convsMap);

                const countsData = await chatService.getUnreadMessageCounts();
                const countsMap = countsData.reduce((acc: any, item: any) => {
                    acc[String(item.conversationId)] = item.unreadCount;
                    return acc;
                }, {});
                setUnreadCounts(countsMap);

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

    useSocketEvent('user:status', (data: any) => {
        const { userId, userType, status, lastSeen } = data;
        setOnlineUsers(prev => {
            const newMap = new Map(prev);
            if (status === 'online') newMap.set(userId, { userType });
            else newMap.delete(userId);
            return newMap;
        });
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

    useSocketEvent('online:users', (data: any) => {
        const { users } = data;
        setOnlineUsers(new Map(users.map((u: any) => [u.userId, { userType: u.userType }])));
    });

    useSocketEvent('conversation:new', (data: any) => {
        const { conversation } = data;
        if (!conversation || !conversation.id) return;
        const convIdStr = String(conversation.id);
        setConversations(prev => prev[convIdStr] ? prev : { ...prev, [convIdStr]: conversation });
        setUnreadCounts(prev => ({ ...prev, [convIdStr]: 0 }));
    });

    useSocketEvent('message:new', (data: any) => {
        const { conversationId, message } = data;
        const convIdStr = String(conversationId);
        if (String(selectedChatId) === convIdStr) addMessageFromSocket(message, convIdStr);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv) return prev;
            return {
                ...prev,
                [convIdStr]: {
                    ...conv,
                    messages: [{
                        ...message,
                        isRead: false,
                        readBy: [],
                        time: new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                    }],
                    updatedAt: message.timestamp || new Date().toISOString(),
                }
            };
        });
        if (String(selectedChatId) !== convIdStr) setUnreadCounts(prev => ({ ...prev, [convIdStr]: (prev[convIdStr] || 0) + 1 }));
    });

    useSocketEvent('message:edited', (data: any) => {
        const { conversationId, messageId, content } = data;
        const convIdStr = String(conversationId);
        if (String(selectedChatId) === convIdStr) updateMessageFromSocket({ id: messageId, content, edited: true }, convIdStr);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages?.length) return prev;
            const lastMessage = conv.messages[0];
            if (String(lastMessage.id) === String(messageId)) {
                return { ...prev, [convIdStr]: { ...conv, messages: [{ ...lastMessage, content, edited: true }] } };
            }
            return prev;
        });
    });

    // ── Call message updated in-place (ringing → ended/missed/declined) ───────
    useSocketEvent('call:message-updated', (data: any) => {
        const { conversationId, messageId, callData, content } = data;
        const convIdStr = String(conversationId);
        // Update in the messages list
        if (String(selectedChatId) === convIdStr) {
            updateMessageFromSocket({ id: messageId, content, callData }, convIdStr);
        }
        // Update in the conversation's last-message preview
        setConversations((prev: any) => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages?.length) return prev;
            const lastMessage = conv.messages[0];
            if (String(lastMessage.id) === String(messageId)) {
                return { ...prev, [convIdStr]: { ...conv, messages: [{ ...lastMessage, content, callData }] } };
            }
            return prev;
        });
    });

    useSocketEvent('message:deleted', (data: any) => {
        const { conversationId, messageId } = data;
        const convIdStr = String(conversationId);
        if (String(selectedChatId) === convIdStr) removeMessageFromSocket(messageId, convIdStr);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages?.length) return prev;
            if (String(conv.messages[0].id) === String(messageId)) {
                return { ...prev, [convIdStr]: { ...conv, messages: [] } };
            }
            return prev;
        });
    });

    useSocketEvent('message:read', (data: any) => {
        const { conversationId, messageId, readerId, readerType } = data;
        const convIdStr = String(conversationId);
        const msgIdStr = String(messageId);
        const conv = (conversations as any)[convIdStr];
        const isGroup = conv?.isGroup || false;
        const participantCount = conv?.participants?.length || 2;

        setAllMessages(prev => {
            const messages = prev[convIdStr];
            if (!messages) return prev;
            return {
                ...prev,
                [convIdStr]: messages.map((m: any) => {
                    if (String(m.id) === String(messageId)) {
                        const currentReadBy = m.readBy || [];
                        const alreadyRead = currentReadBy.some((r: any) => String(r.readerId || r.participantId) === String(readerId) && (r.readerType || r.participantType) === readerType);
                        const newReadBy = alreadyRead ? currentReadBy : [...currentReadBy, { readerId, readerType, readAt: new Date().toISOString() }];

                        // Only count as read if someone other than the sender read it
                        const readByOthers = newReadBy.filter((r: any) =>
                            String(r.readerId || r.participantId) !== String(m.senderId) || (r.readerType || r.participantType) !== m.senderType
                        );
                        let newIsRead = isGroup ? readByOthers.length >= participantCount - 1 : readByOthers.length > 0;
                        return { ...m, readBy: newReadBy, readByCount: newReadBy.length, isRead: newIsRead };
                    }
                    return m;
                })
            };
        });

        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv || !conv.messages?.length) return prev;
            const lastMessage = conv.messages[conv.messages.length - 1] || conv.messages[0];
            if (String(lastMessage.id) === msgIdStr) {
                const currentReadBy = lastMessage.readBy || [];
                const alreadyRead = currentReadBy.some((r: any) => String(r.readerId || r.participantId) === String(readerId) && (r.readerType || r.participantType) === readerType);
                const newReadBy = alreadyRead ? currentReadBy : [...currentReadBy, { readerId, readerType, readAt: new Date().toISOString() }];

                const readByOthers = newReadBy.filter((r: any) =>
                    String(r.readerId || r.participantId) !== String(lastMessage.senderId) || (r.readerType || r.participantType) !== lastMessage.senderType
                );

                let newIsRead = conv.isGroup ? readByOthers.length >= (conv.participants?.length || 2) - 1 : readByOthers.length > 0;
                return {
                    ...prev,
                    [convIdStr]: {
                        ...conv,
                        messages: conv.messages.map(m => String(m.id) === msgIdStr ? { ...m, readBy: newReadBy, isRead: newIsRead } : m)
                    }
                };
            }
            return prev;
        });
    });

    const messagesHook = useMessages(admin ? { id: admin.id, userType: 'ADMIN' } : null);
    const {
        allMessages, setAllMessages, editingMessage, replyingTo, loading: messagesLoading,
        getMessagesForConversation, fetchMessages, sendMessage, handleMessageAction,
        markMessageAsRead, cancelEditOrReply, addMessageFromSocket, updateMessageFromSocket, removeMessageFromSocket
    } = messagesHook;

    const selectionHook = useMessageSelection();
    const { selectedMessages, selectionMode, toggleMessageSelection, handleBulkAction: originalBulkAction, clearSelection, startSelection } = selectionHook;

    const fileUploadHook = useFileUpload();
    const { uploadedFiles, isDragging, handleFileUpload, removeFile, clearFiles } = fileUploadHook;

    const { typingUsers, typingMap, handleTyping } = useTypingIndicator(selectedChatId, admin?.id, 'ADMIN');
    const isTyping = typingUsers && typingUsers.length > 0;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fetchedChatsRef = useRef<Set<string>>(new Set());

    const handleConversationRead = useCallback((conversationId: string) => {
        setUnreadCounts(prev => ({ ...prev, [String(conversationId)]: 0 }));
    }, []);

    useAutoRead(selectedChatId, admin?.id, 'ADMIN', handleConversationRead);

    // ── Voice / Video calling — provided by DashboardLayout via CallContext ──────
    const {
        callState,
        callInfo,
        participants: callParticipants,
        isMuted,
        speakingPeers,
        initiateCall,
        answerCall,
        declineCall,
        endCall,
        toggleMute,
        inviteToCall,
        joinCallDirectly,
    } = useCallContext();

    useEffect(() => {
        if (selectedChatId && admin?.id) {
            const chatIdStr = String(selectedChatId);
            if (!fetchedChatsRef.current.has(chatIdStr)) {
                fetchedChatsRef.current.add(chatIdStr);
                fetchMessages(selectedChatId);
            }
        }
    }, [selectedChatId, admin?.id, fetchMessages]);

    const conversationData = selectedChatId ? getMessagesForConversation(selectedChatId) : { messages: [], hasMore: false };
    const { messages, hasMore } = conversationData;

    const loadMoreMessagesCallback = useCallback(async () => {
        if (!selectedChatId || !hasMore) return;
        const currentMessages = getMessagesForConversation(selectedChatId)?.messages || [];
        const oldestMessageId = currentMessages.length > 0 ? currentMessages[0].id : null;
        if (oldestMessageId) await fetchMessages(selectedChatId, oldestMessageId);
    }, [selectedChatId, hasMore, fetchMessages, getMessagesForConversation]);

    const scrollHook = useScrollManagement(messages, selectedChatId, loadMoreMessagesCallback, hasMore);
    const { isLoadingMore, showScrollButton, messagesEndRef, messagesContainerRef, loadMoreTriggerRef, scrollToBottom } = scrollHook;

    const previousMessagesLengthRef = useRef(0);
    const scrollHeightRef = useRef(0);
    const scrollAdjustChatIdRef = useRef<string | null>(null);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        // Only adjust scroll for load-more within the same conversation
        const isSameConversation = scrollAdjustChatIdRef.current === selectedChatId;
        if (isSameConversation && messages.length > previousMessagesLengthRef.current && previousMessagesLengthRef.current > 0) {
            const heightDifference = container.scrollHeight - scrollHeightRef.current;
            if (heightDifference > 0 && container.scrollTop < 300) container.scrollTop += heightDifference;
        }
        scrollAdjustChatIdRef.current = selectedChatId;
        previousMessagesLengthRef.current = messages.length;
        scrollHeightRef.current = container.scrollHeight;
    }, [messages.length, messagesContainerRef, selectedChatId]);

    const handleMarkAsRead = useCallback((messageId) => {
        markMessageAsRead(messageId).then(() => {
            setUnreadCounts(prev => ({ ...prev, [selectedChatId]: Math.max(0, (prev[selectedChatId] || 0) - 1) }));
        });
    }, [selectedChatId, markMessageAsRead]);

    const { setMessageRef: setReadReceiptRef } = useMessageRead(messages, admin?.id, handleMarkAsRead, messagesContainerRef);
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const setMessageRef = useCallback((id: string, el: HTMLDivElement | null) => {
        if (el) messageRefs.current[id] = el; else delete messageRefs.current[id];
        setReadReceiptRef(id, el);
    }, [setReadReceiptRef]);

    const scrollToMessage = useCallback((messageId: string) => {
        const el = messageRefs.current[messageId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.background = 'rgba(232,98,26,0.1)';
            setTimeout(() => { el.style.background = 'transparent'; }, 2000);
        }
    }, []);

    // URL is the single source of truth for selected conversation
    useEffect(() => {
        setSelectedChatId(conversationId || null);
    }, [conversationId]);

    useEffect(() => {
        const handleClickOutside = () => setShowMenu(null);
        if (showMenu) { document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }
    }, [showMenu]);

    const handleSelectChat = (chatId) => {
        navigate(`/admin/dashboard/chat/${String(chatId)}`, { replace: true });
        clearSelection();
        cancelEditOrReply();
        setMessageInput('');
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
        if (handleTyping) handleTyping(value.length > 0);
    };

    const handleSendMessage = async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            const result = await sendMessage(messageInput, uploadedFiles, selectedChatId, clearFiles);
            setMessageInput(result.inputValue);
            if (result.message && selectedChatId) {
                const chatIdStr = String(selectedChatId);
                setConversations(prev => {
                    const conv = prev[chatIdStr];
                    if (!conv) return prev;
                    return {
                        ...prev,
                        [chatIdStr]: {
                            ...conv,
                            messages: [{
                                ...result.message,
                                isRead: false,
                                readBy: [],
                                time: new Date(result.message.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                            }],
                            updatedAt: result.message.timestamp || new Date().toISOString(),
                        }
                    };
                });
            }
        } finally { setIsSending(false); }
    };

    const handleMessageActionWrapper = (action, messageId) => {
        if (action === 'forward') {
            const currentMessages = selectedChatId ? (allMessages[selectedChatId] || []) : [];
            const messageToForward = currentMessages.find(m => String(m.id) === String(messageId));
            if (messageToForward) setForwardModal({ isOpen: true, messages: [messageToForward], loading: false });
            setShowMenu(null); return;
        }
        const result = handleMessageAction(action, messageId, textareaRef, selectedChatId);
        if (result !== null) setMessageInput(result);
        setShowMenu(null);
    };

    const handleToggleSelection = (messageId, startMode = false) => {
        if (startMode) startSelection(messageId); else toggleMessageSelection(messageId);
    };

    const handleBulkActionWrapper = (action) => {
        const currentMessages = selectedChatId ? (allMessages[selectedChatId] || []) : [];
        if (action === 'edit' && selectedMessages.length === 1) {
            const message = currentMessages.find(m => String(m.id) === String(selectedMessages[0]));
            if (message?.isSent) { handleMessageActionWrapper('edit', selectedMessages[0]); clearSelection(); }
        } else if (action === 'reply' && selectedMessages.length === 1) {
            handleMessageActionWrapper('reply', selectedMessages[0]); clearSelection();
        } else if (action === 'forward') {
            const messagesToForward = currentMessages.filter(m => selectedMessages.some(id => String(id) === String(m.id)));
            setForwardModal({ isOpen: true, messages: messagesToForward, loading: false });
        } else if (action === 'delete') {
            selectedMessages.forEach(mid => handleMessageActionWrapper('delete', mid)); clearSelection();
        } else {
            originalBulkAction(action, currentMessages, (updated) => setAllMessages(prev => ({ ...prev, [selectedChatId]: updated })));
        }
    };

    const handleForward = async (targetIds: string[]) => {
        try {
            setForwardModal(prev => ({ ...prev, loading: true }));
            await chatService.forwardMessages(forwardModal.messages.map(m => m.id.toString()), targetIds);
            setForwardModal({ isOpen: false, messages: [], loading: false });
            clearSelection();
        } catch (err) { setForwardModal(prev => ({ ...prev, loading: false })); alert('Failed to forward messages'); }
    };

    const handleCancelEditReply = () => setMessageInput(cancelEditOrReply());

    const handleMediaView = (media: any[], index: number, timestamp: Date) => {
        setMediaViewer({ isOpen: true, media, currentIndex: index, timestamp });
    };

    const navigateMedia = (direction) => {
        setMediaViewer(prev => ({ ...prev, currentIndex: Math.max(0, Math.min(prev.media.length - 1, prev.currentIndex + direction)) }));
    };

    const downloadMedia = async (media: any) => {
        try {
            let url = media.type === 'image' ? (media.url?.imageUrl || media.url || '') : (media.url?.fileUrl || media.fileUrl || media.url || '');
            if (url && !url.startsWith('http')) url = `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            if (!url) return;
            const res = await fetch(url); const blob = await res.blob(); const bUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = bUrl; link.download = media.name || 'download';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
            window.URL.revokeObjectURL(bUrl);
        } catch (e) {
            console.error('Download failed:', e);
            const fallback = media.url?.imageUrl || media.url?.fileUrl || media.fileUrl || media.url || '';
            if (fallback) window.open(fallback.startsWith('http') ? fallback : `${API_URL}${fallback}`, '_blank');
        }
    };

    const isUserOnline = useCallback((userId: string, userType: 'ADMIN' | 'USER') => {
        const user = onlineUsers.get(userId); return user && user.userType === userType;
    }, [onlineUsers]);

    const selectedConversation = useMemo(() => {
        if (!selectedChatId || !(conversations as any)[selectedChatId]) return null;
        const conv = (conversations as any)[selectedChatId];
        return { ...conv, participants: conv.participants?.map(p => ({ ...p, isOnline: isUserOnline(p.participantId, p.participantType) })) };
    }, [selectedChatId, conversations, isUserOnline]);

    useSocketEvent('member:removed', (data: any) => {
        const { conversationId, removedParticipantId, removedParticipantType } = data;
        const convIdStr = String(conversationId);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv) return prev;
            return {
                ...prev,
                [convIdStr]: {
                    ...conv,
                    participants: (conv.participants || []).filter(
                        (p: any) => !(p.participantId === removedParticipantId && p.participantType === removedParticipantType)
                    )
                }
            };
        });
        // If the current user was removed, navigate away from the conversation
        if (removedParticipantId === admin?.id && String(selectedChatId) === convIdStr) {
            setConversations(prev => {
                const updated = { ...prev };
                delete updated[convIdStr];
                return updated;
            });
            navigate('/admin/dashboard/chat');
        }
    });

    // Real-time group name / avatar update
    useSocketEvent('group:updated', (data: any) => {
        const { conversationId, name, avatar } = data;
        const convIdStr = String(conversationId);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv) return prev;
            return {
                ...prev,
                [convIdStr]: {
                    ...conv,
                    ...(name !== undefined && { name }),
                    ...(avatar !== undefined && { avatar }),
                }
            };
        });
    });

    // Real-time role promotion / demotion
    useSocketEvent('member:role', (data: any) => {
        const { conversationId, participantId, participantType, role } = data;
        const convIdStr = String(conversationId);
        setConversations(prev => {
            const conv = prev[convIdStr];
            if (!conv) return prev;
            return {
                ...prev,
                [convIdStr]: {
                    ...conv,
                    participants: (conv.participants || []).map((p: any) =>
                        p.participantId === participantId && p.participantType === participantType
                            ? { ...p, role }
                            : p
                    ),
                    // Update current user's own role so admin tabs appear/disappear immediately
                    participantRole: (participantId === admin?.id && participantType === 'ADMIN')
                        ? role
                        : conv.participantRole,
                }
            };
        });
    });

    const handleRemoveMember = useCallback(async (participantId: string, participantType: 'ADMIN' | 'USER') => {
        if (!selectedChatId) return;
        try {
            await chatService.removeMember(selectedChatId, participantId, participantType);
            // Optimistically update local state
            setConversations(prev => {
                const conv = prev[selectedChatId];
                if (!conv) return prev;
                return {
                    ...prev,
                    [selectedChatId]: {
                        ...conv,
                        participants: (conv.participants || []).filter(
                            (p: any) => !(p.participantId === participantId && p.participantType === participantType)
                        )
                    }
                };
            });
        } catch (err) {
            alert('Failed to remove member');
        }
    }, [selectedChatId]);

    const handleBack = () => {
        navigate('/admin/dashboard/chat');
    };

    const handleNewConversation = (conversation) => {
        setConversations(prev => ({ ...prev, [conversation.id]: conversation }));
        navigate(`/admin/dashboard/chat/${conversation.id}`);
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: bg, overflow: 'hidden' }}>
            <Sidebar onConversationCreated={handleNewConversation} selectedChatId={selectedChatId} />

            <div 
                style={{ borderRight: `1px solid ${border}` }} 
                className={`shrink-0 flex-col max-w-[90%] md:flex md:w-[380px] ${selectedChatId ? 'hidden' : 'flex w-[90%]'}`}
            >
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
            </div>

            <div style={{ flex: 1, flexDirection: 'column', minWidth: 0, position: 'relative' }} 
                 className={`${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
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
                    setMessageRef={setMessageRef}
                    onConversationUpdated={async (convId) => {
                        // Re-fetch the full conversation to get updated participants/roles
                        if (convId) {
                            try {
                                const updated = await chatService.getConversation(String(convId));
                                if (updated) {
                                    setConversations(prev => ({
                                        ...prev,
                                        [String(convId)]: { ...prev[String(convId)], ...updated }
                                    }));
                                }
                            } catch { /* ignore */ }
                        }
                        fetchMessages(convId);
                    }}
                    isSending={isSending}
                    onBack={handleBack}
                    onRemoveMember={handleRemoveMember}
                    currentUserRole={selectedConversation?.participantRole}
                    onCallStart={() => initiateCall(selectedChatId)}
                    callState={callState}
                    onCallBack={() => initiateCall(selectedChatId)}
                    onJoinCall={(callId: string) => joinCallDirectly(callId, selectedChatId)}
                    onCallSendMessage={(text: string) => {
                        setMessageInput(text);
                        // Focus the textarea after a tick
                        setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                />
            </div>

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
