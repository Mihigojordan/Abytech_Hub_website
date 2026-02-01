import React from 'react';
import ChatListHeader from '../../components/dashboard/chat/chat-list/ChatListHeader';
import ContactsList from '../../components/dashboard/chat/chat-list/ContactsList';
import ConversationItem from '../../components/dashboard/chat/chat-list/ConversationItem';
import { getLastMessage, getUnreadCount } from '../../utils/chat/messageUtils';

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
    unreadCounts = {}
}) => {
    // Filter conversations based on search query
    const filteredChats = searchQuery.trim()
        ? Object.values(conversations).filter(conv =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : Object.values(conversations);

    return (
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Header with search */}
            <ChatListHeader
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />

            {/* Contacts */}
            <ContactsList contacts={contacts} />

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2">Recent</h2>
                </div>
                <div className="space-y-0">
                    {filteredChats.map((chat) => {
                        // Get messages from realtime store OR fallback to initial messages from conversation fetch
                        // Note: chat.messages usually contains only the last message (take: 1)
                        const messages = allMessages[chat.id] || chat.messages || [];
                        const lastMsg = getLastMessage(messages);

                        // Use prop unread count (from API) or calculate from loaded messages if available
                        // API count is more reliable for list view
                        const unreadCount = unreadCounts[chat.id] || 0;

                        const isSelected = chat.id === selectedChatId;

                        return (
                            <ConversationItem
                                key={chat.id}
                                chat={chat}
                                isSelected={isSelected}
                                isTyping={isTyping[chat.id]}
                                lastMessage={lastMsg}
                                unreadCount={unreadCount}
                                onSelect={onSelectChat}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChatList;
