import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatListHeader from '../../components/dashboard/chat/chat-list/ChatListHeader';
import ContactsList from '../../components/dashboard/chat/chat-list/ContactsList';
import ConversationItem from '../../components/dashboard/chat/chat-list/ConversationItem';
import { getLastMessage } from '../../utils/chat/messageUtils';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { bc, ba } from '../../utils/homeConstants';

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
    const { bg, bg2, text2, text3, border } = useDashboardTheme();
    const [activeFilter, setActiveFilter] = useState('all');

    const isUserOnline = (userId, userType) => {
        const user = onlineUsers.get(userId);
        return user && user.userType === userType;
    };

    // 1. Enrich with online status
    const chatsArray = Object.values(conversations || {}).map(conv => {
        if (!conv) return null;
        return {
            ...conv,
            participants: conv.participants?.map(p => ({
                ...p,
                isOnline: isUserOnline(p.participantId, p.participantType)
            }))
        };
    }).filter(Boolean);

    // 2. Search filter
    const searched = searchQuery?.trim()
        ? chatsArray.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : chatsArray;

    // 3. Tab filter
    const tabFiltered = searched.filter(c => {
        if (activeFilter === 'groups') return c.isGroup === true;
        if (activeFilter === 'unread') return (unreadCounts[String(c.id)] || 0) > 0;
        return true;
    });

    // 4. Sort by updatedAt descending
    const sortedChats = [...tabFiltered].sort((a, b) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );

    const emptyLabel = searchQuery
        ? 'No conversations found'
        : activeFilter === 'groups'
            ? 'No groups yet'
            : activeFilter === 'unread'
                ? 'No unread messages'
                : 'No conversations yet';

    return (
        <div style={{ width: '100%', background: bg, borderRight: `1px solid ${border}`, flexDirection: 'column', height: '100%' }}>
            <ChatListHeader
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">
                <ContactsList contacts={contacts} onlineUsers={onlineUsers} />

                <div style={{ padding: '20px 20px 10px' }}>
                    <h2 style={{ ...bc(11, 700, { color: text2, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }) }}>Recent Conversations</h2>
                </div>

                <div style={{ flex: 1 }}>
                    {isLoading ? (
                        [...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)
                    ) : (
                        <>
                            {sortedChats.map((chat) => {
                                const chatIdStr = String(chat.id);
                                const messages = chat.messages || allMessages[chatIdStr] || [];
                                return (
                                    <ConversationItem
                                        key={chatIdStr}
                                        chat={chat}
                                        isSelected={chatIdStr === String(selectedChatId)}
                                        isTyping={isTyping?.[chatIdStr]?.size > 0}
                                        lastMessage={getLastMessage(messages)}
                                        unreadCount={unreadCounts[chatIdStr] || 0}
                                        onSelect={onSelectChat}
                                    />
                                );
                            })}

                            {sortedChats.length === 0 && (
                                <div style={{ padding: '64px 32px', textAlign: 'center' }}>
                                    <div style={{ width: 48, height: 48, background: bg2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <MessageSquare style={{ width: 20, height: 20, color: text3 }} />
                                    </div>
                                    <p style={{ ...ba(14, 400, { color: text3, margin: 0 }) }}>{emptyLabel}</p>
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
