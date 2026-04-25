import React from 'react';
import { MessageSquare, Search } from 'lucide-react';
import ChatListHeader from '../../components/dashboard/chat/chat-list/ChatListHeader';
import ContactsList from '../../components/dashboard/chat/chat-list/ContactsList';
import ConversationItem from '../../components/dashboard/chat/chat-list/ConversationItem';
import { getLastMessage } from '../../utils/chat/messageUtils';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Skeleton component for conversation items while loading
 */
const ConversationSkeleton = () => {
    const { bg2, border } = useDashboardTheme();
    return (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}` }} className="animate-pulse">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: bg2, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ height: 12, background: bg2, borderRadius: 2, width: '40%' }} />
                        <div style={{ height: 10, background: bg2, borderRadius: 2, width: '15%' }} />
                    </div>
                    <div style={{ height: 10, background: bg2, borderRadius: 2, width: '70%' }} />
                </div>
            </div>
        </div>
    );
};

/**
 * ChatList layout component - middle panel with search, contacts, and conversation list
 */
const ChatList = ({
    conversations = {},
    selectedChatId,
    onSelectChat,
    searchQuery = '',
    onSearchChange,
    isTyping = {},
    allMessages = {},
    contacts = [],
    unreadCounts = {},
    onlineUsers = new Map(),
    isLoading = false
}) => {
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

    // Helper function to check if a user is online
    const isUserOnline = (userId, userType) => {
        const user = onlineUsers.get(userId);
        return user && user.userType === userType;
    };

    // 1. Convert to array and enrich with real-time online status
    const chatsArray = Object.values(conversations || {}).map(conv => {
        if (!conv) return null;
        const enrichedParticipants = conv.participants?.map(p => ({
            ...p,
            isOnline: isUserOnline(p.participantId, p.participantType)
        }));

        return {
            ...conv,
            participants: enrichedParticipants
        };
    }).filter(Boolean);

    // 2. Filter based on search query
    const filteredChats = searchQuery?.trim()
        ? chatsArray.filter(conv =>
            conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : chatsArray;

    // 3. Sort by updatedAt (descending)
    const sortedChats = [...filteredChats].sort((a, b) => {
        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
    });

    return (
        <div
            style={{
                width: '100%',
                background: bg,
                borderRight: `1px solid ${border}`,
                flexDirection: 'column',
                height: '100%'
            }}
        >
            {/* Header with search */}
            <ChatListHeader
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">
                {/* Online Contacts */}
                <ContactsList
                    contacts={contacts}
                    onlineUsers={onlineUsers}
                />

                {/* Recent Chats Section */}
                <div style={{ padding: '24px 20px 12px' }}>
                    <h2 style={{ ...bc(12, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }) }}>Recent Conversations</h2>
                </div>

                <div style={{ flex: 1 }}>
                    {isLoading ? (
                        [...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)
                    ) : (
                        <>
                            {sortedChats.map((chat) => {
                                const chatIdStr = String(chat.id);
                                const messages = chat.messages || allMessages[chatIdStr] || [];
                                const lastMsg = getLastMessage(messages);
                                const unreadCount = unreadCounts[chatIdStr] || 0;
                                const isSelected = chatIdStr === String(selectedChatId);
                                const isUserTyping = isTyping?.[chatIdStr]?.size > 0;

                                return (
                                    <ConversationItem
                                        key={chatIdStr}
                                        chat={chat}
                                        isSelected={isSelected}
                                        isTyping={isUserTyping}
                                        lastMessage={lastMsg}
                                        unreadCount={unreadCount}
                                        onSelect={onSelectChat}
                                    />
                                );
                            })}

                            {sortedChats.length === 0 && (
                                <div style={{ padding: '64px 32px', textAlign: 'center' }}>
                                    <div style={{ width: 48, height: 48, background: bg2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <MessageSquare style={{ width: 20, height: 20, color: text3 }} />
                                    </div>
                                    <p style={{ ...ba(14, 400, { color: text3, margin: 0 }) }}>
                                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatList;
