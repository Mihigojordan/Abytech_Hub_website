import React from 'react';
import ChatListHeader from '../../components/dashboard/chat/chat-list/ChatListHeader';
import ContactsList from '../../components/dashboard/chat/chat-list/ContactsList';
import ConversationItem from '../../components/dashboard/chat/chat-list/ConversationItem';
import { getLastMessage, getUnreadCount } from '../../utils/chat/messageUtils';

/**
 * Skeleton component for conversation items while loading
 */
const ConversationSkeleton = () => (
    <div className="px-4 py-3 animate-pulse">
        <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-12" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
        </div>
    </div>
);

/**
 * ChatList layout component - middle panel with search, contacts, and conversation list
 */
const ChatList = ({
    conversations,
    selectedChatId,
    onSelectChat,
    searchQuery,
    onSearchChange,
    isTyping,
    allMessages,
    contacts,
    currentUser,
    unreadCounts = {},
    onlineUsers = new Map(),
    isLoading = false
}) => {
    // Helper function to check if a user is online
    const isUserOnline = (userId, userType) => {
        const user = onlineUsers.get(userId);
        return user && user.userType === userType;
    };

    // 1. Convert to array and enrich with real-time online status
    const chatsArray = Object.values(conversations).map(conv => {
        // Enrich participants with real-time online status
        const enrichedParticipants = conv.participants?.map(p => ({
            ...p,
            isOnline: isUserOnline(p.participantId, p.participantType)
        }));

        return {
            ...conv,
            participants: enrichedParticipants
        };
    });

    // 2. Filter based on search query
    const filteredChats = searchQuery.trim()
        ? chatsArray.filter(conv =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : chatsArray;

    // 3. Sort by updatedAt (descending) - Real-time sorting
    const sortedChats = [...filteredChats].sort((a, b) => {
        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
    });

    return (
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* Header with search */}
            <ChatListHeader
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />

            {/* Online Contacts */}
            <ContactsList
                contacts={contacts}
                onlineUsers={onlineUsers}
            />

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 py-3 bg-gray-50 sticky top-0 z-10">
                    <h2 className="text-sm font-semibold text-gray-500">Recent</h2>
                </div>
                <div className="space-y-0">
                    {/* Show skeletons while loading */}
                    {isLoading ? (
                        <>
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </>
                    ) : (
                        <>
                            {sortedChats.map((chat) => {
                                // Use consistent string IDs for all lookups
                                const chatIdStr = String(chat.id);

                                // IMPORTANT: Prioritize chat.messages (latest message from conversation object)
                                // over allMessages (full chat history) for conversation preview
                                // chat.messages is updated in real-time via message:new event
                                const messages = chat.messages || allMessages[chatIdStr] || [];
                                const lastMsg = getLastMessage(messages);

                                // Use prop unread count (from API) or calculate from loaded messages if available
                                // API count is more reliable for list view
                                const unreadCount = unreadCounts[chatIdStr] || 0;

                                const isSelected = chatIdStr === String(selectedChatId);

                                return (
                                    <ConversationItem
                                        key={chatIdStr}
                                        chat={chat}
                                        isSelected={isSelected}
                                        isTyping={isTyping[chatIdStr]?.size > 0}
                                        lastMessage={lastMsg}
                                        unreadCount={unreadCount}
                                        onSelect={onSelectChat}
                                    />
                                );
                            })}

                            {sortedChats.length === 0 && (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
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
