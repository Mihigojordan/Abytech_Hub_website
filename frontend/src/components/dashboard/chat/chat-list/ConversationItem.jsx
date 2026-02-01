import React from 'react';
import Avatar from '../ui/Avatar';

/**
 * Individual conversation item in the chat list
 */
const ConversationItem = ({
    chat,
    isSelected,
    isTyping,
    lastMessage,
    unreadCount = 0,
    onSelect
}) => {
    return (
        <div
            className={`px-4 py-3 hover:bg-gray-100 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
            onClick={() => onSelect(chat.id)}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar
                        avatar={chat.avatar}
                        initial={chat.initial}
                        name={chat.name}
                        online={chat.online}
                        size="lg"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">{chat.name}</h3>
                        <span className="text-xs text-gray-400">{lastMessage.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${isTyping ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {isTyping ? 'typing •••' : lastMessage.text}
                        </p>
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;
